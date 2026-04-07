import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, TextInput,
  PanResponder, Animated, Dimensions, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export default function FloatingBugReport() {
  const { profile } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [description, setDescription] = useState('');
  const [screen, setScreen] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const pan = useRef(new Animated.ValueXY({ x: SCREEN_W - 60, y: SCREEN_H - 200 })).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 5 || Math.abs(g.dy) > 5,
      onPanResponderGrant: () => {
        pan.setOffset({ x: (pan.x as any)._value, y: (pan.y as any)._value });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: () => {
        pan.flattenOffset();
      },
    })
  ).current;

  const handleSend = async () => {
    if (!description.trim()) return;
    setSending(true);
    try {
      await supabase.from('activity_logs').insert({
        user_id: profile?.id || '00000000-0000-0000-0000-000000000000',
        team_id: null,
        action: 'bug_report',
        metadata: {
          description: description.trim(),
          screen: screen.trim() || 'Không rõ',
          reporter: profile?.full_name || profile?.email || 'Ẩn danh',
          timestamp: new Date().toISOString(),
          platform: Platform.OS,
        },
      });
      // Gửi local notification cho admin (owner của team)
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Báo lỗi mới',
          body: `${profile?.full_name || 'User'}: ${description.trim().slice(0, 100)}`,
          sound: true,
          data: { type: 'bug_report' },
        },
        trigger: null, // Gửi ngay lập tức
      });
      setSent(true);
      setDescription('');
      setScreen('');
      setTimeout(() => { setSent(false); setShowModal(false); }, 1500);
    } catch {
      // Silent fail
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Animated.View
        style={[styles.fab, { transform: pan.getTranslateTransform() }]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={styles.fabBtn}
          onPress={() => setShowModal(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="bug" size={20} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      {/* Report Modal */}
      <Modal visible={showModal} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
          <View style={styles.modal}>
            {sent ? (
              <View style={styles.sentWrap}>
                <Ionicons name="checkmark-circle" size={48} color="#10B981" />
                <Text style={styles.sentText}>Đã gửi! Cảm ơn bạn.</Text>
              </View>
            ) : (
              <>
                <View style={styles.modalHeader}>
                  <Ionicons name="bug" size={20} color="#EF4444" />
                  <Text style={styles.modalTitle}>Báo lỗi</Text>
                  <TouchableOpacity onPress={() => setShowModal(false)} style={styles.closeBtn}>
                    <Ionicons name="close" size={20} color="#94A3B8" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.label}>Bạn đang ở màn hình nào?</Text>
                <TextInput
                  style={styles.input}
                  placeholder="VD: Trang chủ, Khách hàng, AI Coach..."
                  placeholderTextColor="#94A3B8"
                  value={screen}
                  onChangeText={setScreen}
                />

                <Text style={styles.label}>Mô tả lỗi *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Lỗi gì xảy ra? Bạn làm gì trước khi gặp lỗi?"
                  placeholderTextColor="#94A3B8"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />

                <TouchableOpacity
                  style={[styles.sendBtn, !description.trim() && { opacity: 0.4 }]}
                  onPress={handleSend}
                  disabled={sending || !description.trim()}
                >
                  <Text style={styles.sendText}>{sending ? 'Đang gửi...' : 'Gửi báo lỗi'}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute', zIndex: 9999,
  },
  fabBtn: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', padding: 24,
  },
  modal: {
    backgroundColor: '#fff', borderRadius: 16, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 24, elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', flex: 1 },
  closeBtn: { padding: 4 },
  label: { fontSize: 12, fontWeight: '600', color: '#64748B', marginBottom: 6, marginTop: 8 },
  input: {
    backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0',
    borderRadius: 10, padding: 12, fontSize: 14, color: '#0F172A',
  },
  textArea: { minHeight: 100 },
  sendBtn: {
    backgroundColor: '#EF4444', borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', marginTop: 16,
  },
  sendText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  sentWrap: { alignItems: 'center', paddingVertical: 30, gap: 12 },
  sentText: { fontSize: 16, fontWeight: '600', color: '#10B981' },
});
