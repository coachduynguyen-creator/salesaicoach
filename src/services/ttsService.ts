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

// ─── Voice config ──────────────────────────────────────────────────────────

export interface VoiceOption {
  id: string;
  label: string;
  gender: 'male' | 'female';
  region: 'bac' | 'nam';
}

export const VOICE_OPTIONS: VoiceOption[] = [
  { id: 'vi-female-bac', label: 'Nữ - Giọng Bắc', gender: 'female', region: 'bac' },
  { id: 'vi-female-nam', label: 'Nữ - Giọng Nam', gender: 'female', region: 'nam' },
  { id: 'vi-male-bac', label: 'Nam - Giọng Bắc', gender: 'male', region: 'bac' },
  { id: 'vi-male-nam', label: 'Nam - Giọng Nam', gender: 'male', region: 'nam' },
];

let selectedVoiceOption: VoiceOption = VOICE_OPTIONS[0];
let resolvedVoiceId: string | undefined;
let voiceResolved = false;

export function setVoice(option: VoiceOption) {
  selectedVoiceOption = option;
  resolvedVoiceId = undefined;
  voiceResolved = false;
}

export function getSelectedVoice(): VoiceOption {
  return selectedVoiceOption;
}

/** Tìm voice ID phù hợp nhất trên thiết bị */
async function resolveVoiceId(): Promise<string | undefined> {
  if (voiceResolved) return resolvedVoiceId;
  voiceResolved = true;

  const sp = getSpeech();
  if (!sp) return undefined;

  try {
    const voices: Array<{ identifier: string; name: string; language: string; quality: string }> =
      await sp.getAvailableVoicesAsync();

    const viVoices = voices.filter(
      (v: any) => v.language?.startsWith('vi') || v.identifier?.includes('vi')
    );

    if (viVoices.length === 0) return undefined;

    // Tìm voice match gender + region
    const { gender, region } = selectedVoiceOption;
    const genderKeywords = gender === 'female' ? ['female', 'nữ', 'woman'] : ['male', 'nam', 'man'];
    const regionKeywords = region === 'bac' ? ['hanoi', 'ha noi', 'bac', 'north'] : ['saigon', 'sai gon', 'nam', 'south', 'hcm'];

    // Scoring: gender match = 2, region match = 1
    let best = viVoices[0];
    let bestScore = 0;

    for (const v of viVoices) {
      const id = (v.identifier + ' ' + v.name).toLowerCase();
      let score = 0;
      if (genderKeywords.some(k => id.includes(k))) score += 2;
      if (regionKeywords.some(k => id.includes(k))) score += 1;
      if (score > bestScore) { bestScore = score; best = v; }
    }

    resolvedVoiceId = best.identifier;
    return resolvedVoiceId;
  } catch {
    return undefined;
  }
}

// ─── Lazy load expo-speech ─────────────────────────────────────────────────

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

// ─── Public API ────────────────────────────────────────────────────────────

/** Đọc text bằng giọng Việt — trả về Promise resolve khi đọc xong */
export async function speakVietnamese(text: string): Promise<void> {
  const sp = getSpeech();
  if (!sp) return;

  const clean = stripMarkdown(text);
  if (!clean) return;

  const voiceId = await resolveVoiceId();

  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(), Math.max(clean.length * 80, 5000));

    try {
      sp.speak(clean, {
        language: 'vi-VN',
        voice: voiceId,
        rate: 1.15,
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

/** Kiểm tra TTS có khả dụng không */
export function isTTSAvailable(): boolean {
  return !!getSpeech();
}
