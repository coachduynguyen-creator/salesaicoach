import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { saveApiKeys, loadApiKeys } from '../services/storageService';
import { setApiKeys } from '../services/aiService';

export default function ProfileScreen() {
  const [claudeApiKey, setClaudeApiKey] = useState('');
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [showClaudeKey, setShowClaudeKey] = useState(false);
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load keys từ bộ nhớ khi mở màn hình
  useEffect(() => {
    loadApiKeys().then(({ claudeKey, openaiKey }) => {
      setClaudeApiKey(claudeKey);
      setOpenaiApiKey(openaiKey);
      setApiKeys(openaiKey, claudeKey);
    });
  }, []);

  const handleSave = async () => {
    if (!claudeApiKey.trim() && !openaiApiKey.trim()) {
      Alert.alert('Chưa nhập key', 'Vui lòng nhập ít nhất một API key.');
      return;
    }
    setIsSaving(true);
    try {
      await saveApiKeys({ claudeKey: claudeApiKey.trim(), openaiKey: openaiApiKey.trim() });
      setApiKeys(openaiApiKey.trim(), claudeApiKey.trim());
      Alert.alert('✅ Đã lưu', 'API keys đã được lưu. AI phân tích sẵn sàng hoạt động!', [{ text: 'OK' }]);
    } catch {
      Alert.alert('Lỗi', 'Không thể lưu cài đặt. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Cài Đặt</Text>
          <Text style={styles.headerSubtitle}>Quản lý tài khoản và API</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={36} color={COLORS.PRIMARY} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Sales Trainer</Text>
            <Text style={styles.profileRole}>Sales Coach Pro</Text>
          </View>
          <TouchableOpacity style={styles.editProfileButton}>
            <Ionicons name="pencil-outline" size={18} color={COLORS.PRIMARY} />
          </TouchableOpacity>
        </View>

        {/* Stats Strip */}
        <View style={styles.statsStrip}>
          <View style={styles.stripItem}>
            <Text style={styles.stripValue}>12</Text>
            <Text style={styles.stripLabel}>Buổi ghi</Text>
          </View>
          <View style={styles.stripDivider} />
          <View style={styles.stripItem}>
            <Text style={styles.stripValue}>7.8</Text>
            <Text style={styles.stripLabel}>Điểm TB</Text>
          </View>
          <View style={styles.stripDivider} />
          <View style={styles.stripItem}>
            <Text style={styles.stripValue}>3</Text>
            <Text style={styles.stripLabel}>Tuần này</Text>
          </View>
        </View>

        {/* API Settings */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="key-outline" size={18} color={COLORS.PRIMARY} />
            <Text style={styles.sectionTitle}>API Keys</Text>
          </View>
          <Text style={styles.sectionDesc}>
            Nhập API keys để kích hoạt tính năng AI phân tích
          </Text>

          {/* Claude API Key */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Claude API Key (Anthropic)</Text>
            <View style={styles.secretInput}>
              <Ionicons name="logo-electron" size={16} color={COLORS.TEXT_LIGHT} style={styles.fieldIcon} />
              <TextInput
                style={styles.secretField}
                placeholder="sk-ant-..."
                placeholderTextColor={COLORS.TEXT_LIGHT}
                value={claudeApiKey}
                onChangeText={setClaudeApiKey}
                secureTextEntry={!showClaudeKey}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => setShowClaudeKey(!showClaudeKey)} style={styles.eyeButton}>
                <Ionicons
                  name={showClaudeKey ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={COLORS.TEXT_LIGHT}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* OpenAI API Key (Whisper) */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>OpenAI API Key (Whisper – chuyển giọng nói)</Text>
            <View style={styles.secretInput}>
              <Ionicons name="mic-circle-outline" size={16} color={COLORS.TEXT_LIGHT} style={styles.fieldIcon} />
              <TextInput
                style={styles.secretField}
                placeholder="sk-..."
                placeholderTextColor={COLORS.TEXT_LIGHT}
                value={openaiApiKey}
                onChangeText={setOpenaiApiKey}
                secureTextEntry={!showOpenaiKey}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => setShowOpenaiKey(!showOpenaiKey)} style={styles.eyeButton}>
                <Ionicons
                  name={showOpenaiKey ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={COLORS.TEXT_LIGHT}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Status indicator */}
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: claudeApiKey ? COLORS.SUCCESS : COLORS.BORDER }]} />
            <Text style={styles.statusText}>Claude: {claudeApiKey ? 'Đã kết nối' : 'Chưa có key'}</Text>
            <View style={[styles.statusDot, { backgroundColor: openaiApiKey ? COLORS.SUCCESS : COLORS.BORDER, marginLeft: 14 }]} />
            <Text style={styles.statusText}>OpenAI: {openaiApiKey ? 'Đã kết nối' : 'Chưa có key'}</Text>
          </View>

          {/* Save Button */}
          <TouchableOpacity style={[styles.saveButton, isSaving && { opacity: 0.7 }]} onPress={handleSave} disabled={isSaving}>
            <Ionicons name="save-outline" size={18} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>{isSaving ? 'Đang lưu...' : 'Lưu cài đặt'}</Text>
          </TouchableOpacity>
        </View>

        {/* App Settings */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="options-outline" size={18} color={COLORS.PRIMARY} />
            <Text style={styles.sectionTitle}>Ứng dụng</Text>
          </View>

          <TouchableOpacity style={styles.settingsRow}>
            <View style={styles.settingsRowLeft}>
              <Ionicons name="language-outline" size={18} color={COLORS.TEXT_LIGHT} />
              <Text style={styles.settingsRowText}>Ngôn ngữ phân tích</Text>
            </View>
            <View style={styles.settingsRowRight}>
              <Text style={styles.settingsRowValue}>Tiếng Việt</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.TEXT_LIGHT} />
            </View>
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          <TouchableOpacity style={styles.settingsRow}>
            <View style={styles.settingsRowLeft}>
              <Ionicons name="notifications-outline" size={18} color={COLORS.TEXT_LIGHT} />
              <Text style={styles.settingsRowText}>Thông báo</Text>
            </View>
            <View style={styles.settingsRowRight}>
              <Text style={styles.settingsRowValue}>Bật</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.TEXT_LIGHT} />
            </View>
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          <TouchableOpacity style={styles.settingsRow}>
            <View style={styles.settingsRowLeft}>
              <Ionicons name="trash-outline" size={18} color={COLORS.DANGER} />
              <Text style={[styles.settingsRowText, { color: COLORS.DANGER }]}>Xóa tất cả dữ liệu</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.TEXT_LIGHT} />
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Ionicons name="information-circle-outline" size={14} color={COLORS.TEXT_LIGHT} />
          <Text style={styles.versionText}>Sales Coach App v1.0.0</Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.TEXT,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.TEXT_LIGHT,
    marginTop: 2,
  },
  profileCard: {
    backgroundColor: COLORS.CARD,
    borderRadius: 14,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.PRIMARY + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.TEXT,
  },
  profileRole: {
    fontSize: 13,
    color: COLORS.TEXT_LIGHT,
    marginTop: 3,
  },
  editProfileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EBF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsStrip: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 16,
    flexDirection: 'row',
    paddingVertical: 16,
    marginBottom: 16,
  },
  stripItem: {
    flex: 1,
    alignItems: 'center',
  },
  stripValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  stripLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 3,
  },
  stripDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 4,
  },
  sectionCard: {
    backgroundColor: COLORS.CARD,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.TEXT,
  },
  sectionDesc: {
    fontSize: 12,
    color: COLORS.TEXT_LIGHT,
    marginBottom: 16,
    lineHeight: 18,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.TEXT,
    marginBottom: 6,
  },
  secretInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    paddingHorizontal: 12,
    height: 48,
  },
  fieldIcon: {
    marginRight: 8,
  },
  secretField: {
    flex: 1,
    fontSize: 14,
    color: COLORS.TEXT,
  },
  eyeButton: {
    padding: 4,
  },
  saveButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingsRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingsRowText: {
    fontSize: 14,
    color: COLORS.TEXT,
    fontWeight: '500',
  },
  settingsRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  settingsRowValue: {
    fontSize: 13,
    color: COLORS.TEXT_LIGHT,
  },
  rowDivider: {
    height: 1,
    backgroundColor: COLORS.BORDER,
  },
  versionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 4,
  },
  versionText: {
    fontSize: 12,
    color: COLORS.TEXT_LIGHT,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    flexWrap: 'wrap',
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: COLORS.TEXT_LIGHT,
    marginLeft: 4,
  },
});
