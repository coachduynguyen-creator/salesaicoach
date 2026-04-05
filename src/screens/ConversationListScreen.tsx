import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  TextInput,
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
} from '../services/storageService';

export default function ConversationListScreen() {
  const C = useColors();
  const navigation = useNavigation<any>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showNewInput, setShowNewInput] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  // Reload conversations mỗi khi màn hình được focus
  useFocusEffect(
    useCallback(() => {
      loadConversations().then(setConversations);
    }, [])
  );

  const handleCreate = async () => {
    const title = newTitle.trim() || `Cuộc trò chuyện ${conversations.length + 1}`;
    const conv = await addConversation(title);
    setShowNewInput(false);
    setNewTitle('');
    navigation.navigate('AiCoachChat', { conversationId: conv.id, title: conv.title });
  };

  const handleDelete = (id: string, title: string) => {
    Alert.alert('Xóa cuộc trò chuyện', `Bạn muốn xóa "${title}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          await deleteConversation(id);
          setConversations(prev => prev.filter(c => c.id !== id));
        },
      },
    ]);
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
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>AI Sales Coach</Text>
          <Text style={styles.headerSub}>Lịch sử trò chuyện với AI Coach</Text>
        </View>
      </View>

      {/* New Conversation Input */}
      {showNewInput ? (
        <View style={styles.newInputRow}>
          <View style={styles.newInputWrap}>
            <TextInput
              style={styles.newInput}
              placeholder="Tên chủ đề (VD: Khách hàng ABC, Xử lý từ chối...)"
              placeholderTextColor={COLORS.TEXT_LIGHT}
              value={newTitle}
              onChangeText={setNewTitle}
              autoFocus
              onSubmitEditing={handleCreate}
            />
          </View>
          <TouchableOpacity style={[styles.newInputBtn, { backgroundColor: C.PRIMARY }]} onPress={handleCreate}>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.newCancelBtn} onPress={() => { setShowNewInput(false); setNewTitle(''); }}>
            <Ionicons name="close" size={20} color={COLORS.TEXT_LIGHT} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={[styles.newButton, { backgroundColor: C.PRIMARY }]} onPress={() => setShowNewInput(true)}>
          <Ionicons name="add-circle" size={22} color="#fff" />
          <Text style={styles.newButtonText}>Cuộc trò chuyện mới</Text>
        </TouchableOpacity>
      )}

      {/* Conversation List */}
      {conversations.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubbles-outline" size={56} color={COLORS.BORDER} />
          <Text style={styles.emptyTitle}>Chưa có cuộc trò chuyện nào</Text>
          <Text style={styles.emptySub}>
            Tạo cuộc trò chuyện mới để bắt đầu trao đổi với AI Coach về khách hàng, tình huống bán hàng, hoặc bất kỳ vấn đề nào.
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.TEXT,
  },
  headerSub: {
    fontSize: 13,
    color: COLORS.TEXT_LIGHT,
    marginTop: 2,
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.PRIMARY,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  newButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  newInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  newInputWrap: {
    flex: 1,
    backgroundColor: COLORS.CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
    paddingHorizontal: 14,
    height: 48,
    justifyContent: 'center',
  },
  newInput: {
    fontSize: 14,
    color: COLORS.TEXT,
  },
  newInputBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newCancelBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 16,
    paddingTop: 4,
    gap: 10,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: COLORS.CARD,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.PRIMARY + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  cardContent: {
    flex: 1,
    marginRight: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.TEXT,
    flex: 1,
    marginRight: 8,
  },
  cardTime: {
    fontSize: 11,
    color: COLORS.TEXT_LIGHT,
    flexShrink: 0,
  },
  cardPreview: {
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 18,
    marginBottom: 4,
  },
  cardMsgCount: {
    fontSize: 11,
    color: COLORS.TEXT_LIGHT,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.TEXT,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.TEXT_LIGHT,
    textAlign: 'center',
    lineHeight: 20,
  },
});
