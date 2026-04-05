// Keys được inline trực tiếp vào JS bundle bởi Expo
// Dùng EXPO_PUBLIC_ prefix để hoạt động cả native build lẫn OTA update
export const DEFAULT_CLAUDE_KEY: string = process.env.EXPO_PUBLIC_CLAUDE_API_KEY ?? '';
export const DEFAULT_OPENAI_KEY: string = process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? '';

export const hasEmbeddedKeys = (): boolean =>
  DEFAULT_CLAUDE_KEY.length > 0 && !DEFAULT_CLAUDE_KEY.startsWith('your-');
