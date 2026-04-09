import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Modal,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/colors';
import { useColors } from '../contexts/ThemeContext';

const GOALS_KEY = '@salescoach_goals';

interface Goal {
  id: string;
  title: string;
  target: string;
  current: number;
  targetNum: number;
  deadline: string;
  createdAt: string;
}

export default function GoalSettingScreen() {
  const C = useColors();
  const navigation = useNavigation();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [targetNum, setTargetNum] = useState('');
  const [deadline, setDeadline] = useState('');

  useFocusEffect(useCallback(() => {
    AsyncStorage.getItem(GOALS_KEY).then(raw => {
      if (raw) setGoals(JSON.parse(raw));
    });
  }, []));

  const saveGoals = async (updated: Goal[]) => {
    setGoals(updated);
    await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(updated));
  };

  const addGoal = () => {
    if (!title.trim()) return;
    const goal: Goal = {
      id: Date.now().toString(),
      title: title.trim(),
      target: target.trim(),
      current: 0,
      targetNum: parseInt(targetNum) || 10,
      deadline: deadline || 'Cuối tháng',
      createdAt: new Date().toISOString(),
    };
    saveGoals([goal, ...goals]);
    setShowModal(false);
    setTitle(''); setTarget(''); setTargetNum(''); setDeadline('');
  };

  const incrementGoal = (id: string) => {
    saveGoals(goals.map(g => g.id === id ? { ...g, current: Math.min(g.current + 1, g.targetNum) } : g));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.BACKGROUND }]} edges={['top']}>
      <View style={[styles.topBar, { backgroundColor: C.CARD, borderBottomColor: C.BORDER }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: C.SURFACE }]}>
          <Ionicons name="arrow-back" size={22} color={C.TEXT} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: C.TEXT }]}>Mục tiêu</Text>
        <TouchableOpacity onPress={() => setShowModal(true)} style={[styles.backBtn, { backgroundColor: C.SURFACE }]}>
          <Ionicons name="add" size={22} color={C.PRIMARY} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
      <ScrollView contentContainerStyle={styles.scroll}>
        {goals.length === 0 ? (
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <Ionicons name="flag-outline" size={48} color={C.TEXT_LIGHT} />
            <Text style={[styles.emptyTitle, { color: C.TEXT }]}>Chưa có mục tiêu</Text>
            <Text style={{ fontSize: 13, color: C.TEXT_LIGHT, textAlign: 'center', marginTop: 4 }}>
              Đặt mục tiêu tuần/tháng để theo dõi tiến độ
            </Text>
          </View>
        ) : (
          goals.map(goal => {
            const pct = goal.targetNum > 0 ? Math.round((goal.current / goal.targetNum) * 100) : 0;
            const color = pct >= 100 ? '#10B981' : pct >= 50 ? '#F59E0B' : C.PRIMARY;
            return (
              <View key={goal.id} style={[styles.goalCard, { backgroundColor: C.CARD }]}>
                <View style={styles.goalHeader}>
                  <Text style={[styles.goalTitle, { color: C.TEXT }]}>{goal.title}</Text>
                  <Text style={[styles.goalDeadline, { color: C.TEXT_LIGHT }]}>{goal.deadline}</Text>
                </View>
                {goal.target ? <Text style={{ fontSize: 12, color: C.TEXT_SECONDARY, marginBottom: 8 }}>{goal.target}</Text> : null}
                <View style={styles.goalProgress}>
                  <View style={[styles.goalBarBg, { backgroundColor: C.SURFACE }]}>
                    <View style={[styles.goalBarFill, { width: `${Math.min(pct, 100)}%`, backgroundColor: color }]} />
                  </View>
                  <Text style={[styles.goalPct, { color }]}>{goal.current}/{goal.targetNum}</Text>
                </View>
                <TouchableOpacity style={[styles.incrementBtn, { borderColor: color }]} onPress={() => incrementGoal(goal.id)}>
                  <Ionicons name="add" size={16} color={color} />
                  <Text style={{ fontSize: 12, fontWeight: '700', color }}>+1</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showModal} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: C.CARD }]}>
            <Text style={[styles.modalTitle, { color: C.TEXT }]}>Mục tiêu mới</Text>
            <TextInput style={[styles.modalInput, { color: C.TEXT, borderColor: C.BORDER }]} placeholder="VD: Gọi 20 khách mới" placeholderTextColor={C.TEXT_LIGHT} value={title} onChangeText={setTitle} />
            <TextInput style={[styles.modalInput, { color: C.TEXT, borderColor: C.BORDER }]} placeholder="Mô tả (tùy chọn)" placeholderTextColor={C.TEXT_LIGHT} value={target} onChangeText={setTarget} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TextInput style={[styles.modalInput, { color: C.TEXT, borderColor: C.BORDER, flex: 1 }]} placeholder="Số lượng" placeholderTextColor={C.TEXT_LIGHT} value={targetNum} onChangeText={setTargetNum} keyboardType="numeric" />
              <TextInput style={[styles.modalInput, { color: C.TEXT, borderColor: C.BORDER, flex: 1 }]} placeholder="Deadline" placeholderTextColor={C.TEXT_LIGHT} value={deadline} onChangeText={setDeadline} />
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
              <TouchableOpacity style={[styles.cancelBtn, { borderColor: C.BORDER }]} onPress={() => setShowModal(false)}>
                <Text style={{ color: C.TEXT_LIGHT, fontWeight: '600' }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: C.PRIMARY }]} onPress={addGoal}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>Tạo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: COLORS.SURFACE },
  topBarTitle: { fontSize: 15, fontWeight: '600', flex: 1, textAlign: 'center' },
  scroll: { padding: 16, paddingBottom: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '600', marginTop: 12 },
  goalCard: { borderRadius: 14, padding: 16, marginBottom: 10 },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  goalTitle: { fontSize: 15, fontWeight: '700', flex: 1 },
  goalDeadline: { fontSize: 11, fontWeight: '600' },
  goalProgress: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  goalBarBg: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  goalBarFill: { height: '100%', borderRadius: 4 },
  goalPct: { fontSize: 13, fontWeight: '800', width: 50, textAlign: 'right' },
  incrementBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-end', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
  modalBox: { borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 14 },
  modalInput: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 14, marginBottom: 10 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  saveBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
});
