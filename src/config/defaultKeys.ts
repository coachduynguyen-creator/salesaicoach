// API keys đã chuyển lên server-side (Supabase Edge Function)
// File này giữ lại để tương thích import cũ

/** @deprecated — keys now live server-side only */
export const DEFAULT_CLAUDE_KEY = '';
/** @deprecated — keys now live server-side only */
export const DEFAULT_OPENAI_KEY = '';
/** @deprecated */
export const hasEmbeddedKeys = (): boolean => false;
