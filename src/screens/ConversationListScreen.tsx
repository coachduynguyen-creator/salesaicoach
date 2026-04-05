import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { useColors } from '../contexts/ThemeContext';
import {
  Conversation,
  loadConversations,
  addConversation,
  deleteConversation,
  loadCustomers,
  CustomerProfile,
} from '../services/storageService';
import { useAlert } from '../contexts/AlertContext';

export default function ConversationListScreen() {
  const C = useColors();
  const navigation = useNavigation<any>();
  const { showAlert } = useAlert();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadConversations().then(setConversations);
      loadCustomers().then(setCustomers);
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      loadConversations().then(setConversations),
      loadCustomers().then(setCustomers),
    ]);
    setRefreshing(false);
  }, []);

  const handleCreate = async () => {
    const selected = customers.find(c => c.id === selectedCustomerId);
    const title = newTitle.trim() || (selected ? `Tư vấn: ${selected.name}` : `Cuộc trò chuyện ${conversations.length + 1}`);
    const conv = await addConversation(title);
    setShowNewModal(false);
    setNewTitle('');
    setSelectedCustomerId(null);
    navigation.navigate('AiCoachChat', {
      conversationId: conv.id,
      title: conv.title,
      customerId: selectedCustomerId || undefined,
    });
  };

  const handleDelete = (id: string, title: string) => {
    showAlert({
      title: 'Xóa cuộc trò chuyện',
      message: `Bạn muốn xóa "${title}"?`,
      type: 'warning',
      buttons: [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            await deleteConversation(id);
            setConversations(prev => prev.filter(c => c.id !== id));
          },
        },
      ],
    });
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Vừa xong';
    if (diffMin < 60) return `${diffMin} phút trước`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} giờ trước`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay} ngày trước`;
    return d.toLocaleDateString('vi-VN');
  };

  const renderItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('AiCoachChat', { conversationId: item.id, title: item.title })}
      onLongPress={() => handleDelete(item.id, item.title)}
    >
      <View style={[styles.cardIcon, { backgroundColor: C.PRIMARY + '12' }]}>
        <Ionicons name="chatbubble-ellipses" size={20} color={C.PRIMARY} />
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.cardTime}>{formatDate(item.updatedAt)}</Text>
        </View>
        <Text style={styles.cardPreview} numberOfLines={2}>
          {item.preview || 'Cuộc trò chuyện mới'}
        </Text>
        <Text style={styles.cardMsgCount}>
          {item.messages.length} tin nhắn
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={COLORS.TEXT_LIGHT} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>AI Sales Coach</Text>
          <Text style={styles.headerSub}>Lịch sử trò chuyện với AI Coach</Text>
        </View>
      </View>

      {/* New Conversation Button */}
      <TouchableOpacity style={[styles.newButton, { backgroundColor: C.PRIMARY }]} onPress={() => setShowNewModal(true)}>
        <Ionicons name="add-circle" size={22} color="#fff" />
        <Text style={styles.newButtonText}>Cuộc trò chuyện mới</Text>
      </TouchableOpacity>

      {/* Conversation List */}
      {conversations.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubbles-outline" size={56} color={COLORS.BORDER} />
          <Text style={styles.emptyTitle}>Chưa có cuộc trò chuyện nào</Text>
          <Text style={styles.emptySub}>
            Tạo cuộc trò chuyện mới để trao đổi với AI Coach về khách hàng hoặc tình huống bán hàng.
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.PRIMARY} colors={[C.PRIMARY]} />}
        />
      )}

      {/* New Conversation Modal — chọn khách hàng */}
      <Modal visible={showNewModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cuộc trò chuyện mới</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Chủ đề (tùy chọn)"
              placeholderTextColor={COLORS.TEXT_LIGHT}
              value={newTitle}
              onChangeText={setNewTitle}
            />

            {/* Customer picker */}
            <Text style={styles.pickerLabel}>Chọn khách hàng để AI có sẵn dữ liệu:</Text>
            {customers.length > 0 ? (
              <FlatList
                data={[{ id: null, name: 'Không chọn — hỏi chung', company: '', stage: '' } as any, ...customers]}
                keyExtractor={item => item.id || 'none'}
                style={{ maxHeight: 220 }}
                renderItem={({ item }) => {
                  const isSelected = item.id === selectedCustomerId;
                  return (
                    <TouchableOpacity
                      style={[styles.customerOption, isSelected && { backgroundColor: C.PRIMARY + '12', borderColor: C.PRIMARY }]}
                      onPress={() => setSelectedCustomerId(item.id)}
                    >
                      <View style={[styles.customerAvatar, { backgroundColor: item.id ? C.PRIMARY + '14' : COLORS.SURFACE }]}>
                        <Ionicons
                          name={item.id ? 'person' : 'globe-outline'}
                          size={16}
                          color={item.id ? C.PRIMARY : COLORS.TEXT_LIGHT}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.customerName, isSelected && { color: C.PRIMARY }]}>{item.name}</Text>
                        {item.company ? <Text style={styles.customerCompany}>{item.company}</Text> : null}
                        {item.stage ? <Text style={styles.customerStage}>{item.stage}</Text> : null}
                      </View>
                      {isSelected && <Ionicons name="checkmark-circle" size={20} color={C.PRIMARY} />}
                    </TouchableOpacity>
                  );
                }}
              />
            ) : (
              <View style={styles.noCustomerHint}>
                <Ionicons name="information-circle-outline" size={18} color={COLORS.TEXT_LIGHT} />
                <Text style={styles.noCustomerText}>
                  Chưa có khách hàng. Ghi âm cuộc gọi và nhập tên khách → AI sẽ tự tạo hồ sơ khách hàng.
                </Text>
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => { setShowNewModal(false); setNewTitle(''); setSelectedCustomerId(null); }}
              >
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSaveBtn, { backgroundColor: C.PRIMARY }]}
                onPress={handleCreate}
              >
                <Text style={styles.modalSaveText}>Bắt đầu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: COLORS.TEXT },
  headerSub: { fontSize: 13, color: COLORS.TEXT_LIGHT, marginTop: 2 },
  newButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 16, marginBottom: 12, paddingVertical: 14, borderRadius: 14, gap: 8,
  },
  newButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  listContent: { padding: 16, paddingTop: 4, gap: 10, paddingBottom: 30 },
  card: {
    backgroundColor: COLORS.CARD, borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  cardIcon: {
    width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    marginRight: 12, flexShrink: 0,
  },
  cardContent: { flex: 1, marginRight: 8 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.TEXT, flex: 1, marginRight: 8 },
  cardTime: { fontSize: 11, color: COLORS.TEXT_LIGHT, flexShrink: 0 },
  cardPreview: { fontSize: 13, color: COLORS.TEXT_SECONDARY, lineHeight: 18, marginBottom: 4 },
  cardMsgCount: { fontSize: 11, color: COLORS.TEXT_LIGHT },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: COLORS.TEXT, marginTop: 16, marginBottom: 8 },
  emptySub: { fontSize: 13, color: COLORS.TEXT_LIGHT, textAlign: 'center', lineHeight: 20 },
  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  modalContent: {
    backgroundColor: COLORS.CARD, borderRadius: 16, padding: 24, width: '100%', maxHeight: '80%',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.TEXT, marginBottom: 16 },
  modalInput: {
    backgroundColor: COLORS.BACKGROUND, borderRadius: 10, padding: 14,
    fontSize: 15, color: COLORS.TEXT, marginBottom: 16, borderWidth: 1, borderColor: COLORS.BORDER,
  },
  pickerLabel: { fontSize: 13, fontWeight: '600', color: COLORS.TEXT_SECONDARY, marginBottom: 10 },
  customerOption: {
    flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 12,
    borderRadius: 10, marginBottom: 6, borderWidth: 1, borderColor: COLORS.BORDER,
  },
  customerAvatar: {
    width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
  },
  customerName: { fontSize: 14, fontWeight: '600', color: COLORS.TEXT },
  customerCompany: { fontSize: 11, color: COLORS.TEXT_LIGHT },
  customerStage: { fontSize: 10, color: COLORS.TEXT_LIGHT, fontStyle: 'italic' },
  noCustomerHint: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: COLORS.BACKGROUND, borderRadius: 10, padding: 12,
  },
  noCustomerText: { flex: 1, fontSize: 13, color: COLORS.TEXT_LIGHT, lineHeight: 19 },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 16 },
  modalCancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 10, borderWidth: 1, borderColor: COLORS.BORDER, alignItems: 'center',
  },
  modalCancelText: { fontSize: 15, fontWeight: '600', color: COLORS.TEXT_LIGHT },
  modalSaveBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  modalSaveText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});
