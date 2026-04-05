import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { useColors } from '../contexts/ThemeContext';
import { startRecording, stopRecording, pauseRecording, resumeRecording } from '../services/audioService';
import { useAlert } from '../contexts/AlertContext';

type RecordingState = 'idle' | 'recording' | 'paused';

export default function RecordScreen() {
  const C = useColors();
  const navigation = useNavigation<any>();
  const { showAlert } = useAlert();
  const [customerName, setCustomerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);
  const ringAnim = useRef(new Animated.Value(0)).current;

  // Review mode state
  const [reviewMode, setReviewMode] = useState(false);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [recordedDuration, setRecordedDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      pulseLoop.current?.stop();
      // Clean up sound on unmount
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, []);

  const startPulse = () => {
    pulseAnim.setValue(1);
    pulseLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    pulseLoop.current.start();
    Animated.timing(ringAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  };

  const stopPulse = () => {
    pulseLoop.current?.stop();
    Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    Animated.timing(ringAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
  };

  const startTimer = () => { intervalRef.current = setInterval(() => setElapsed(p => p + 1), 1000); };
  const stopTimer = () => { if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; } };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const handleStart = async () => {
    try {
      await startRecording();
      setRecordingState('recording');
      setElapsed(0);
      startTimer();
      startPulse();
    } catch {
      showAlert({ title: 'Lỗi', message: 'Không thể bắt đầu ghi âm. Vui lòng kiểm tra quyền microphone.', type: 'error' });
    }
  };

  const handlePause = async () => {
    if (recordingState === 'recording') {
      try { await pauseRecording(); setRecordingState('paused'); stopTimer(); stopPulse(); } catch { showAlert({ title: 'Lỗi', message: 'Không thể tạm dừng.', type: 'error' }); }
    } else if (recordingState === 'paused') {
      try { await resumeRecording(); setRecordingState('recording'); startTimer(); startPulse(); } catch { showAlert({ title: 'Lỗi', message: 'Không thể tiếp tục.', type: 'error' }); }
    }
  };

  const handleStop = async () => {
    try {
      const result = await stopRecording();
      setRecordingState('idle'); stopTimer(); stopPulse();
      const finalElapsed = elapsed;
      setRecordedDuration(finalElapsed);
      setAudioUri(result.uri);
      setReviewMode(true);
      setElapsed(0);
    } catch {
      setRecordingState('idle'); stopTimer(); stopPulse(); setElapsed(0);
      showAlert({ title: 'Lỗi', message: 'Đã xảy ra lỗi khi dừng ghi âm.', type: 'error' });
    }
  };

  // --- Playback controls ---
  const unloadSound = async () => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setIsPlaying(false);
    setPlaybackPosition(0);
    setPlaybackDuration(0);
  };

  const handlePlayPause = async () => {
    if (!audioUri) return;

    try {
      if (isPlaying && soundRef.current) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
        return;
      }

      if (soundRef.current) {
        // Resume from current position
        await soundRef.current.playAsync();
        setIsPlaying(true);
        return;
      }

      // Create a new Sound and play
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true },
        (status) => {
          if (!status.isLoaded) return;
          setPlaybackPosition(status.positionMillis);
          setPlaybackDuration(status.durationMillis ?? 0);
          if (status.didJustFinish) {
            setIsPlaying(false);
            setPlaybackPosition(0);
            soundRef.current?.setPositionAsync(0);
          }
        }
      );
      soundRef.current = sound;
      setIsPlaying(true);
    } catch {
      showAlert({ title: 'Lỗi', message: 'Không thể phát lại bản ghi âm.', type: 'error' });
    }
  };

  const handleAnalyze = async () => {
    await unloadSound();
    navigation.navigate('ResultScreen', {
      audioUri,
      duration: recordedDuration,
      customerName: customerName || 'Khách hàng',
      companyName: companyName || '',
    });
  };

  const handleReRecord = async () => {
    await unloadSound();
    setReviewMode(false);
    setAudioUri(null);
    setRecordedDuration(0);
  };

  const isRecording = recordingState !== 'idle';

  const formatPlaybackTime = (ms: number) => formatTime(Math.floor(ms / 1000));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ghi âm</Text>
          <Text style={styles.headerSub}>
            {reviewMode ? 'Xem lại bản ghi' : isRecording ? (customerName || 'Đang ghi âm...') : 'Phiên tư vấn mới'}
          </Text>
        </View>

        {/* Input fields — chỉ khi idle và không review */}
        {!isRecording && !reviewMode && (
          <View style={styles.inputGroup}>
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={18} color={COLORS.TEXT_LIGHT} />
              <TextInput style={styles.input} placeholder="Tên khách hàng" placeholderTextColor={COLORS.TEXT_LIGHT} value={customerName} onChangeText={setCustomerName} />
            </View>
            <View style={styles.inputWrap}>
              <Ionicons name="business-outline" size={18} color={COLORS.TEXT_LIGHT} />
              <TextInput style={styles.input} placeholder="Tên công ty (không bắt buộc)" placeholderTextColor={COLORS.TEXT_LIGHT} value={companyName} onChangeText={setCompanyName} />
            </View>
          </View>
        )}

        {/* Review Mode */}
        {reviewMode ? (
          <View style={styles.centerArea}>
            <View style={styles.recordArea}>
              {/* Play/Pause button */}
              <TouchableOpacity onPress={handlePlayPause} activeOpacity={0.85}>
                <LinearGradient colors={[C.PRIMARY, C.GRADIENT_END]} style={[styles.mainBtn, { shadowColor: C.PRIMARY }]}>
                  <Ionicons name={isPlaying ? 'pause' : 'play'} size={48} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>

              {/* Playback time */}
              <Text style={styles.timer}>
                {formatPlaybackTime(playbackPosition)}
                <Text style={styles.timerDivider}> / </Text>
                {playbackDuration > 0 ? formatPlaybackTime(playbackDuration) : formatTime(recordedDuration)}
              </Text>

              {/* Playback progress bar */}
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      backgroundColor: C.PRIMARY,
                      width: playbackDuration > 0
                        ? `${Math.min((playbackPosition / playbackDuration) * 100, 100)}%`
                        : '0%',
                    },
                  ]}
                />
              </View>

              {/* Status */}
              <View style={styles.statusRow}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.SUCCESS} />
                <Text style={[styles.statusText, { color: COLORS.SUCCESS }]}>
                  Ghi âm hoàn tất — {formatTime(recordedDuration)}
                </Text>
              </View>
            </View>

            {/* Review action buttons */}
            <View style={styles.reviewActions}>
              <TouchableOpacity
                style={[styles.reviewBtn, styles.reviewBtnPrimary, { backgroundColor: C.PRIMARY }]}
                onPress={handleAnalyze}
                activeOpacity={0.85}
              >
                <Ionicons name="analytics" size={22} color="#fff" />
                <Text style={styles.reviewBtnTextPrimary}>Phân tích</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.reviewBtn, styles.reviewBtnSecondary]}
                onPress={handleReRecord}
                activeOpacity={0.85}
              >
                <Ionicons name="refresh" size={22} color={COLORS.DANGER} />
                <Text style={[styles.reviewBtnTextSecondary, { color: COLORS.DANGER }]}>Ghi lại</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Recording Area */
          <View style={styles.centerArea}>
            <View style={styles.recordArea}>
              {/* Pulse rings */}
              <Animated.View style={[styles.ring, styles.ringOuter, { transform: [{ scale: pulseAnim }], opacity: ringAnim }]} />
              <Animated.View style={[styles.ring, styles.ringMiddle, { transform: [{ scale: pulseAnim }], opacity: Animated.multiply(ringAnim, 0.5) }]} />

              {/* Main button */}
              {recordingState === 'idle' ? (
                <TouchableOpacity onPress={handleStart} activeOpacity={0.85}>
                  <LinearGradient colors={[C.PRIMARY, C.GRADIENT_END]} style={[styles.mainBtn, { shadowColor: C.PRIMARY }]}>
                    <Ionicons name="mic" size={48} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={handleStop} activeOpacity={0.85}>
                  <LinearGradient colors={[COLORS.DANGER, '#F97316']} style={styles.mainBtn}>
                    <Ionicons name="stop" size={40} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              )}

              {/* Timer */}
              <Text style={styles.timer}>{formatTime(elapsed)}</Text>

              {/* Status */}
              <View style={styles.statusRow}>
                {recordingState === 'recording' && <View style={styles.liveDot} />}
                <Text style={[styles.statusText,
                  recordingState === 'recording' && { color: COLORS.DANGER },
                  recordingState === 'paused' && { color: COLORS.WARNING },
                ]}>
                  {recordingState === 'idle' ? 'Nhấn để bắt đầu' : recordingState === 'recording' ? 'Đang ghi âm' : 'Tạm dừng'}
                </Text>
              </View>
            </View>

            {/* Controls */}
            {isRecording && (
              <View style={styles.controls}>
                <TouchableOpacity style={styles.ctrlBtn} onPress={handlePause}>
                  <Ionicons name={recordingState === 'paused' ? 'play' : 'pause'} size={24} color={C.PRIMARY} />
                  <Text style={[styles.ctrlText, { color: C.PRIMARY }]}>{recordingState === 'paused' ? 'Tiếp tục' : 'Tạm dừng'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.ctrlBtn, styles.ctrlStop]} onPress={handleStop}>
                  <Ionicons name="stop-circle" size={24} color={COLORS.DANGER} />
                  <Text style={[styles.ctrlText, { color: COLORS.DANGER }]}>Dừng</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Tips */}
            {!isRecording && (
              <View style={styles.tipsCard}>
                <Text style={styles.tipsTitle}>Hướng dẫn</Text>
                {['Nhập tên khách hàng trước khi ghi', 'Đặt điện thoại gần nguồn âm thanh', 'Sau khi dừng, bạn có thể nghe lại trước khi phân tích'].map((t, i) => (
                  <View key={i} style={styles.tipRow}>
                    <View style={styles.tipDot} />
                    <Text style={styles.tipText}>{t}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  container: { flex: 1, paddingHorizontal: 20 },
  header: { paddingTop: 16, paddingBottom: 12 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: COLORS.TEXT },
  headerSub: { fontSize: 14, color: COLORS.TEXT_LIGHT, marginTop: 2 },

  inputGroup: { gap: 10, marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.CARD, borderRadius: 14, borderWidth: 1, borderColor: COLORS.BORDER,
    paddingHorizontal: 14, height: 52,
  },
  input: { flex: 1, fontSize: 15, color: COLORS.TEXT },

  centerArea: { flex: 1, justifyContent: 'center', paddingBottom: 16 },
  recordArea: { alignItems: 'center', justifyContent: 'center', paddingVertical: 20 },

  ring: { position: 'absolute', borderRadius: 999 },
  ringOuter: { width: 180, height: 180, backgroundColor: COLORS.DANGER + '15' },
  ringMiddle: { width: 220, height: 220, backgroundColor: COLORS.DANGER + '08' },

  mainBtn: {
    width: 120, height: 120, borderRadius: 60,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.PRIMARY, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 10,
  },

  timer: { fontSize: 44, fontWeight: '700', color: COLORS.TEXT, marginTop: 24, letterSpacing: 2 },

  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.DANGER },
  statusText: { fontSize: 15, color: COLORS.TEXT_LIGHT, fontWeight: '500' },

  controls: { flexDirection: 'row', gap: 12, marginTop: 16 },
  ctrlBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.CARD, borderRadius: 14, paddingVertical: 14,
    borderWidth: 1, borderColor: COLORS.BORDER,
  },
  ctrlStop: { borderColor: COLORS.DANGER_LIGHT, backgroundColor: COLORS.DANGER_LIGHT },
  ctrlText: { fontSize: 15, fontWeight: '600', color: COLORS.PRIMARY },

  tipsCard: {
    backgroundColor: COLORS.CARD, borderRadius: 16, padding: 16, marginTop: 16,
    borderWidth: 1, borderColor: COLORS.BORDER,
  },
  tipsTitle: { fontSize: 14, fontWeight: '700', color: COLORS.TEXT, marginBottom: 12 },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  tipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.SUCCESS },
  tipText: { fontSize: 13, color: COLORS.TEXT_SECONDARY, flex: 1 },

  // Review mode styles
  timerDivider: { fontSize: 28, fontWeight: '400', color: COLORS.TEXT_LIGHT },

  progressBarBg: {
    width: '80%', height: 6, borderRadius: 3,
    backgroundColor: COLORS.BORDER, marginTop: 16, overflow: 'hidden' as const,
  },
  progressBarFill: {
    height: '100%', borderRadius: 3,
  },

  reviewActions: { gap: 12, marginTop: 24 },
  reviewBtn: {
    flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'center' as const,
    gap: 10, borderRadius: 14, paddingVertical: 16,
  },
  reviewBtnPrimary: {
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 6,
  },
  reviewBtnTextPrimary: { fontSize: 17, fontWeight: '700' as const, color: '#fff' },
  reviewBtnSecondary: {
    backgroundColor: COLORS.CARD, borderWidth: 1, borderColor: COLORS.BORDER,
  },
  reviewBtnTextSecondary: { fontSize: 17, fontWeight: '600' as const },
});
