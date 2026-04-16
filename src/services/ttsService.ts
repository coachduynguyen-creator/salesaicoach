/** Xóa markdown formatting trước khi đọc */
function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s*/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\n{2,}/g, '. ')
    .replace(/\n/g, '. ')
    .trim();
}

/** Lazy load expo-speech — trả null nếu native module chưa có (APK cũ) */
let Speech: any = null;
let speechLoaded = false;

function getSpeech() {
  if (!speechLoaded) {
    speechLoaded = true;
    try {
      Speech = require('expo-speech');
    } catch {
      Speech = null;
    }
  }
  return Speech;
}

/** Đọc text bằng giọng Việt — trả về Promise resolve khi đọc xong. Nếu TTS không có → resolve ngay */
export function speakVietnamese(text: string): Promise<void> {
  return new Promise((resolve) => {
    const sp = getSpeech();
    if (!sp) { resolve(); return; }

    const clean = stripMarkdown(text);
    if (!clean) { resolve(); return; }

    const timeout = setTimeout(() => resolve(), Math.max(clean.length * 80, 5000));

    try {
      sp.speak(clean, {
        language: 'vi-VN',
        rate: 0.92,
        onDone: () => { clearTimeout(timeout); resolve(); },
        onError: () => { clearTimeout(timeout); resolve(); },
        onStopped: () => { clearTimeout(timeout); resolve(); },
      });
    } catch {
      clearTimeout(timeout);
      resolve();
    }
  });
}

/** Dừng đọc ngay */
export function stopSpeaking(): void {
  try { getSpeech()?.stop(); } catch { /* ignore */ }
}

/** Kiểm tra đang đọc không */
export async function isSpeaking(): Promise<boolean> {
  try { return await getSpeech()?.isSpeakingAsync() ?? false; } catch { return false; }
}

/** Kiểm tra TTS có khả dụng không (native module đã có trong build) */
export function isTTSAvailable(): boolean {
  return !!getSpeech();
}
