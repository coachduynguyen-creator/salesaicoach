import * as Speech from 'expo-speech';

/** Xóa markdown formatting trước khi đọc */
function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s*/g, '')       // headings
    .replace(/\*\*(.*?)\*\*/g, '$1') // bold
    .replace(/\*(.*?)\*/g, '$1')     // italic
    .replace(/`{1,3}[^`]*`{1,3}/g, '') // code
    .replace(/^[-*]\s+/gm, '')       // bullet points
    .replace(/^\d+\.\s+/gm, '')      // numbered lists
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links
    .replace(/\n{2,}/g, '. ')        // multiple newlines → pause
    .replace(/\n/g, '. ')
    .trim();
}

/** Đọc text bằng giọng Việt — trả về Promise resolve khi đọc xong */
export function speakVietnamese(text: string): Promise<void> {
  return new Promise((resolve) => {
    const clean = stripMarkdown(text);
    if (!clean) { resolve(); return; }

    // Fallback timeout phòng trường hợp onDone không fire (Android bug)
    const timeout = setTimeout(() => resolve(), Math.max(clean.length * 80, 5000));

    Speech.speak(clean, {
      language: 'vi-VN',
      rate: 0.92,
      onDone: () => { clearTimeout(timeout); resolve(); },
      onError: () => { clearTimeout(timeout); resolve(); },
      onStopped: () => { clearTimeout(timeout); resolve(); },
    });
  });
}

/** Dừng đọc ngay */
export function stopSpeaking(): void {
  Speech.stop();
}

/** Kiểm tra đang đọc không */
export async function isSpeaking(): Promise<boolean> {
  return Speech.isSpeakingAsync();
}
