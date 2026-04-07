// Supabase Edge Function: AI Proxy
// Deploy: supabase functions deploy ai-proxy
// Set secrets: supabase secrets set OPENAI_API_KEY=sk-... CLAUDE_API_KEY=sk-ant-...

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { action, payload } = body;

    const OPENAI_KEY = Deno.env.get('OPENAI_API_KEY');
    const CLAUDE_KEY = Deno.env.get('CLAUDE_API_KEY');

    let result;
    const startTime = Date.now();

    if (action === 'transcribe') {
      // Proxy to OpenAI Whisper
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${OPENAI_KEY}` },
        body: payload, // FormData from client
      });
      result = await response.json();

    } else if (action === 'analyze' || action === 'chat' || action === 'extract' || action === 'score') {
      // Proxy to Claude
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_KEY!,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(payload),
      });
      result = await response.json();

    } else {
      return new Response(JSON.stringify({ error: 'Unknown action' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const durationMs = Date.now() - startTime;

    // Log usage
    const { data: profile } = await supabase.from('profiles').select('team_id').eq('id', user.id).single();
    await supabase.from('ai_usage_logs').insert({
      user_id: user.id,
      team_id: profile?.team_id,
      action,
      model: action === 'transcribe' ? 'whisper-1' : 'claude-haiku-4-5-20251001',
      input_tokens: result?.usage?.input_tokens || 0,
      output_tokens: result?.usage?.output_tokens || 0,
      duration_ms: durationMs,
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
