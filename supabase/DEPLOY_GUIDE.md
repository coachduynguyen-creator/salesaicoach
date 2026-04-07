# Deploy Edge Functions

## 1. Cài Supabase CLI
```bash
npm install -g supabase
```

## 2. Login
```bash
supabase login
```

## 3. Link project
```bash
supabase link --project-ref zylhbymktdtmitxsunqv
```

## 4. Set API secrets
```bash
supabase secrets set OPENAI_API_KEY=sk-your-openai-key
supabase secrets set CLAUDE_API_KEY=sk-ant-your-claude-key
```

## 5. Deploy
```bash
supabase functions deploy ai-proxy
```

## 6. Test
```bash
curl -X POST https://zylhbymktdtmitxsunqv.supabase.co/functions/v1/ai-proxy \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"action": "chat", "payload": {"model": "claude-haiku-4-5-20251001", "max_tokens": 100, "messages": [{"role": "user", "content": "Hello"}]}}'
```

Sau khi deploy, cập nhật aiService.ts để gọi Edge Function thay vì gọi thẳng API.
