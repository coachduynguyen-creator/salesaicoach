import { Audio } from 'expo-av';

export interface RecordingResult {
  uri: string;
  duration: number;
}

// Cấu hình ghi âm tối ưu cho speech recognition (file nhỏ, chất lượng đủ cho Whisper)
const SPEECH_RECORDING_OPTIONS = {
  isMeteringEnabled: true,
  android: {
    extension: '.m4a',
    outputFormat: 3, // MPEG_4
    audioEncoder: 3, // AAC
    sampleRate: 16000, // 16kHz đủ cho speech
    numberOfChannels: 1, // Mono
    bitRate: 64000, // 64kbps (10 phút ≈ 5MB)
  },
  ios: {
    extension: '.m4a',
    outputFormat: 'aac' as any,
    audioQuality: 0x40 as any, // medium quality
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 64000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 64000,
  },
};

let recording: Audio.Recording | null = null;

export const startRecording = async (): Promise<void> => {
  try {
    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) {
      throw new Error('Microphone permission not granted');
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording: newRecording } = await Audio.Recording.createAsync(
      SPEECH_RECORDING_OPTIONS as any
    );
    recording = newRecording;
  } catch (error) {
    throw new Error(`Failed to start recording: ${error}`);
  }
};

export const stopRecording = async (): Promise<RecordingResult> => {
  if (!recording) {
    throw new Error('No active recording');
  }

  try {
    await recording.stopAndUnloadAsync();
    const status = await recording.getStatusAsync();
    const uri = recording.getURI();

    if (!uri) {
      throw new Error('Recording URI is null');
    }

    const duration = (status.durationMillis ?? 0) / 1000;
    recording = null;

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });

    return { uri, duration };
  } catch (error) {
    recording = null;
    throw new Error(`Failed to stop recording: ${error}`);
  }
};

export const pauseRecording = async (): Promise<void> => {
  if (!recording) {
    throw new Error('No active recording');
  }
  await recording.pauseAsync();
};

export const resumeRecording = async (): Promise<void> => {
  if (!recording) {
    throw new Error('No active recording');
  }
  await recording.startAsync();
};
