import { supabase } from './supabaseClient';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ErrorContext {
  screen?: string;
  action?: string;
  userId?: string;
  teamId?: string;
  [key: string]: any;
}

// In-memory queue cho errors khi offline
let errorQueue: Array<{ error: any; context: ErrorContext; timestamp: string }> = [];
let flushing = false;

const QUEUE_KEY = '@salescoach_error_queue';

/** Log error - an toàn, không throw, không block */
export async function trackError(error: unknown, context: ErrorContext = {}): Promise<void> {
  try {
    const errorObj = normalizeError(error);
    const entry = {
      error: errorObj,
      context: {
        platform: Platform.OS,
        platformVersion: Platform.Version,
        ...context,
      },
      timestamp: new Date().toISOString(),
    };

    errorQueue.push(entry);
    // Persist queue để không mất nếu app crash
    AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(errorQueue)).catch(() => {});

    // Try flush ngay
    flushErrors();
  } catch {
    // Silent - error tracker không được crash app
  }
}

/** Warning (ít nghiêm trọng hơn error) */
export async function trackWarning(message: string, context: ErrorContext = {}): Promise<void> {
  return trackError({ message, type: 'warning' }, context);
}

/** Flush queue lên Supabase */
async function flushErrors(): Promise<void> {
  if (flushing || errorQueue.length === 0) return;
  flushing = true;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      flushing = false;
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('team_id')
      .eq('id', user.id)
      .single();

    const toSend = [...errorQueue];
    const rows = toSend.map(entry => ({
      user_id: user.id,
      team_id: profile?.team_id,
      action: entry.error.type === 'warning' ? 'app_warning' : 'app_crash',
      metadata: {
        message: entry.error.message,
        stack: entry.error.stack,
        name: entry.error.name,
        context: entry.context,
        timestamp: entry.timestamp,
        platform: Platform.OS,
      },
    }));

    const { error } = await supabase.from('activity_logs').insert(rows);

    if (!error) {
      // Remove sent entries from queue
      errorQueue = errorQueue.filter(e => !toSend.includes(e));
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(errorQueue)).catch(() => {});
    }
  } catch {
    // Retry sau
  } finally {
    flushing = false;
  }
}

/** Load errors đã persist từ session trước và flush */
export async function initErrorTracking(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    if (raw) {
      errorQueue = JSON.parse(raw) || [];
      flushErrors();
    }
  } catch {
    // Silent
  }

  // Global error handler cho unhandled errors
  const originalHandler = (global as any).ErrorUtils?.getGlobalHandler?.();
  if (originalHandler) {
    (global as any).ErrorUtils.setGlobalHandler((error: any, isFatal: boolean) => {
      trackError(error, { action: 'unhandled_error', fatal: isFatal });
      originalHandler(error, isFatal);
    });
  }
}

/** Normalize error vào dạng chuẩn */
function normalizeError(error: unknown): { message: string; stack?: string; name?: string; type?: string } {
  if (error instanceof Error) {
    return {
      message: error.message || 'Unknown error',
      stack: error.stack?.slice(0, 2000),
      name: error.name,
    };
  }
  if (typeof error === 'string') {
    return { message: error };
  }
  if (typeof error === 'object' && error !== null) {
    const e = error as any;
    return {
      message: e.message || JSON.stringify(error).slice(0, 500),
      stack: e.stack,
      name: e.name || e.type,
      type: e.type,
    };
  }
  return { message: String(error) };
}
