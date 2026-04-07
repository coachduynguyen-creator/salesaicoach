import { supabase } from './supabaseClient';
import { Platform } from 'react-native';

/** Log crash/error lên Supabase activity_logs */
export async function reportCrash(error: Error, context?: string): Promise<void> {
  try {
    // Lấy user hiện tại (nếu đã login)
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from('activity_logs').insert({
      user_id: user?.id || '00000000-0000-0000-0000-000000000000',
      team_id: null,
      action: 'app_crash',
      metadata: {
        message: error.message,
        stack: error.stack?.slice(0, 500),
        context: context || 'unknown',
        platform: Platform.OS,
        timestamp: new Date().toISOString(),
      },
    });
  } catch {
    // Silent fail - don't crash while reporting crash
  }
}

/** Log warning (non-fatal) */
export async function reportWarning(message: string, metadata?: Record<string, any>): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('activity_logs').insert({
      user_id: user?.id || '00000000-0000-0000-0000-000000000000',
      team_id: null,
      action: 'app_warning',
      metadata: { message, ...metadata, platform: Platform.OS },
    });
  } catch {}
}
