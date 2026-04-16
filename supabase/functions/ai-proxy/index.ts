// Supabase Edge Function: AI Proxy
// Deploy: supabase functions deploy ai-proxy
// Set secrets: supabase secrets set OPENAI_API_KEY=sk-... CLAUDE_API_KEY=sk-ant-...

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-jwt',
};

const CLAUDE_ACTIONS = ['analyze', 'chat', 'extract', 'score', 'correct', 'recommend', 'stream_chat'];

// ── In-memory rate limit: 20 requests / 60s / user ──
// Map<userId, number[]> lưu timestamps của requests trong cửa sổ 60s
const rateLimitBuckets = new Map<string, number[]>();
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 60_000;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const bucket = rateLimitBuckets.get(userId) || [];
  const fresh = bucket.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  if (fresh.length >= RATE_LIMIT_MAX) {
    rateLimitBuckets.set(userId, fresh);
    return false;
  }
  fresh.push(now);
  rateLimitBuckets.set(userId, fresh);
  // Housekeeping: dọn buckets cũ nếu quá 1000 user
  if (rateLimitBuckets.size > 1000) {
    for (const [uid, ts] of rateLimitBuckets) {
      if (ts.length === 0 || now - ts[ts.length - 1] > RATE_LIMIT_WINDOW_MS) {
        rateLimitBuckets.delete(uid);
      }
    }
  }
  return true;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ── Auth: hỗ trợ cả header (legacy) và x-user-jwt header (ES256 bypass) ──
    const userJwt = req.headers.get('x-user-jwt');
    const authHeader = req.headers.get('Authorization');
    const jwt = userJwt || (authHeader ? authHeader.replace(/^Bearer\s+/i, '').trim() : '');
    if (!jwt) {
      return new Response(JSON.stringify({ error: 'No auth token provided' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Dùng service role để verify user JWT — không phụ thuộc vào algorithm
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: `Bearer ${jwt}` } } }
    );

    const { data: { user }, error: userErr } = await supabase.auth.getUser(jwt);
    if (userErr || !user) {
      return new Response(JSON.stringify({
        error: 'Unauthorized',
        detail: userErr?.message || 'Token verification failed',
      }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Rate limiting (in-memory, không query DB mỗi request)
    if (!checkRateLimit(user.id)) {
      return new Response(JSON.stringify({ error: 'Quá nhiều yêu cầu. Vui lòng đợi 1 phút.' }), {
        status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Server-side monthly quota check (không tin client-side checkQuota)
    const quotaOk = await checkMonthlyQuota(supabase, user.id);
    if (!quotaOk.allowed) {
      return new Response(JSON.stringify({
        error: `Đã dùng hết ${quotaOk.limit} lượt AI tháng này (${quotaOk.used}). Nâng cấp gói để tiếp tục.`,
      }), {
        status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const OPENAI_KEY = Deno.env.get('OPENAI_API_KEY');
    const CLAUDE_KEY = Deno.env.get('CLAUDE_API_KEY');
    const startTime = Date.now();

    // ── Transcribe Multipart (từ client gửi FormData) ──
    const url = new URL(req.url);
    if (url.searchParams.get('action') === 'transcribe_multipart') {
      const formData = await req.formData();
      const file = formData.get('file');
      if (!file) {
        return new Response(JSON.stringify({ error: 'Missing file' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const openaiForm = new FormData();
      openaiForm.append('file', file);
      openaiForm.append('model', 'whisper-1');
      openaiForm.append('language', 'vi');
      openaiForm.append('prompt', 'Đây là buổi tư vấn bán hàng bất động sản tại Việt Nam. Nhân viên sales đang nói chuyện với khách hàng.');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${OPENAI_KEY}` },
        body: openaiForm,
      });

      const result = await response.json();

      if (!response.ok) {
        return new Response(JSON.stringify({ error: result.error?.message || `Whisper error ${response.status}` }), {
          status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      await logUsage(supabase, user.id, 'transcribe', 'whisper-1', startTime, 0, 0);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { action, payload } = body;

    // ── Transcribe (OpenAI Whisper) — legacy base64 path ──
    if (action === 'transcribe') {
      // Client sends base64 audio + metadata
      const { audioBase64, fileName, mimeType } = payload;

      const audioBytes = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
      const blob = new Blob([audioBytes], { type: mimeType || 'audio/mp4' });

      const formData = new FormData();
      formData.append('file', blob, fileName || 'recording.m4a');
      formData.append('model', 'whisper-1');
      formData.append('language', 'vi');
      formData.append('prompt', 'Đây là buổi tư vấn bán hàng bất động sản tại Việt Nam. Nhân viên sales đang nói chuyện với khách hàng.');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${OPENAI_KEY}` },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        return new Response(JSON.stringify({ error: result.error?.message || `Whisper error ${response.status}` }), {
          status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      await logUsage(supabase, user.id, 'transcribe', 'whisper-1', startTime, 0, 0);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Stream Chat (Claude with SSE) ──
    if (action === 'stream_chat') {
      // Abort upstream nếu quá 90s không phản hồi
      const streamController = new AbortController();
      const streamTimeout = setTimeout(() => streamController.abort(), 90000);
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_KEY!,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({ ...payload, stream: true }),
        signal: streamController.signal,
      }).catch((e) => {
        clearTimeout(streamTimeout);
        throw e;
      });

      if (!response.ok) {
        clearTimeout(streamTimeout);
        const err = await response.text().catch(() => '');
        return new Response(JSON.stringify({ error: `Claude error ${response.status}: ${err}` }), {
          status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      logUsage(supabase, user.id, 'chat', 'claude-haiku-4-5-20251001', startTime, 0, 0);

      // Wrap body trong TransformStream để đảm bảo clearTimeout khi stream kết thúc
      // và abort upstream nếu client disconnect.
      const { readable, writable } = new TransformStream();
      (async () => {
        try {
          await response.body!.pipeTo(writable);
        } catch { /* client đóng sớm hoặc upstream abort */ }
        finally {
          clearTimeout(streamTimeout);
        }
      })();

      return new Response(readable, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // ── Claude Actions (non-streaming) ──
    if (CLAUDE_ACTIONS.includes(action)) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_KEY!,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        return new Response(JSON.stringify({ error: result.error?.message || `Claude error ${response.status}` }), {
          status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      await logUsage(
        supabase, user.id, action,
        payload.model || 'claude-haiku-4-5-20251001', startTime,
        result.usage?.input_tokens || 0,
        result.usage?.output_tokens || 0,
      );

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// ── Quota theo tháng ──
// Tier limits phải khớp TIER_AI_LIMITS trong databaseService.ts
const TIER_AI_LIMITS: Record<string, number> = {
  free: 10, pro: 999, bds_pro: 999, team_s: 999, team_m: 999, team_l: 999,
};
// Cache tier per user 5 phút để giảm DB hit
const tierCache = new Map<string, { tier: string; expires: number }>();
// Cache monthly usage count per user 30s (tránh query mỗi call)
const usageCache = new Map<string, { count: number; expires: number }>();

async function checkMonthlyQuota(
  supabase: any,
  userId: string,
): Promise<{ allowed: boolean; used: number; limit: number }> {
  const now = Date.now();

  // Lấy tier (cache 5 phút)
  let tier = 'free';
  const cachedTier = tierCache.get(userId);
  if (cachedTier && cachedTier.expires > now) {
    tier = cachedTier.tier;
  } else {
    const { data } = await supabase
      .from('subscriptions')
      .select('tier, expires_at')
      .eq('user_id', userId)
      .maybeSingle();
    if (data) {
      const expired = data.expires_at && new Date(data.expires_at).getTime() < now;
      tier = expired ? 'free' : (data.tier || 'free');
    }
    tierCache.set(userId, { tier, expires: now + 5 * 60_000 });
  }
  const limit = TIER_AI_LIMITS[tier] ?? 10;
  if (limit >= 999) return { allowed: true, used: 0, limit }; // Pro+ unlimited

  // Lấy usage (cache 30s)
  let used = 0;
  const cachedUsage = usageCache.get(userId);
  if (cachedUsage && cachedUsage.expires > now) {
    used = cachedUsage.count;
  } else {
    const firstOfMonth = new Date();
    firstOfMonth.setDate(1);
    firstOfMonth.setHours(0, 0, 0, 0);
    const { count } = await supabase
      .from('ai_usage_logs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', firstOfMonth.toISOString());
    used = count || 0;
    usageCache.set(userId, { count: used, expires: now + 30_000 });
  }

  return { allowed: used < limit, used, limit };
}

async function logUsage(
  supabase: any, userId: string, action: string, model: string,
  startTime: number, inputTokens: number, outputTokens: number,
) {
  try {
    const { data: profile } = await supabase.from('profiles').select('team_id').eq('id', userId).single();
    await supabase.from('ai_usage_logs').insert({
      user_id: userId,
      team_id: profile?.team_id,
      action,
      model,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      duration_ms: Date.now() - startTime,
    });
  } catch {
    // Don't block the response if logging fails
  }
}
