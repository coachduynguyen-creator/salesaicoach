import { Audio } from 'expo-av';

export interface RecordingResult {
  uri: string;
  duration: number;
}

// Dùng LOW_QUALITY preset (file nhỏ, tương thích mọi thiết bị)
const SPEECH_RECORDING_OPTIONS = Audio.RecordingOptionsPresets.LOW_QUALITY;

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
