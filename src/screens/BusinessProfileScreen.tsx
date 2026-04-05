import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { BusinessProfile, EMPTY_PROFILE, saveBusinessProfile, loadBusinessProfile } from '../services/storageService';
import { useBusiness } from '../contexts/BusinessContext';
import { useAlert } from '../contexts/AlertContext';

const FIELDS: { key: keyof BusinessProfile; label: string; placeholder: string; lines: number }[] = [
  {
    key: 'companyName',
    label: 'Tên công ty',
    placeholder: 'VD: Công ty ABC Việt Nam',
    lines: 1,
  },
  {
    key: 'industry',
    label: 'Ngành nghề',
    placeholder: 'VD: Bất động sản cao cấp, Bảo hiểm nhân thọ, Phần mềm B2B...',
    lines: 1,
  },
  {
    key: 'products',
    label: 'Sản phẩm / Dịch vụ',
    placeholder: 'Mô tả các sản phẩm hoặc dịch vụ bạn đang bán.\nVD: Căn hộ cao cấp Vinhomes Grand Park, giá từ 2-5 tỷ, tặng gói nội thất...',
    lines: 4,
  },
  {
    key: 'targetCustomer',
    label: 'Chân dung khách hàng mục tiêu',
    placeholder: 'Khách hàng lý tưởng của bạn là ai?\nVD: Doanh nhân 35-50 tuổi, thu nhập trên 50 triệu/tháng, đã có nhà nhưng muốn đầu tư thêm...',
    lines: 4,
  },
  {
    key: 'competitors',
    label: 'Đối thủ cạnh tranh',
    placeholder: 'Khách hay so sánh bạn với ai?\nVD: Masterise Homes, Phú Mỹ Hưng, Novaland...',
    lines: 3,
  },
  {
    key: 'uniqueValue',
    label: 'Giá trị khác biệt',
    placeholder: 'Điều gì khiến bạn/sản phẩm khác biệt?\nVD: Hệ sinh thái Vingroup, pháp lý minh bạch, tiến độ xây dựng nhanh nhất khu vực...',
    lines: 3,
  },
  {
    key: 'commonObjections',
    label: 'Phản đối thường gặp',
    placeholder: 'Khách hay nói gì khi từ chối?\nVD: "Giá cao quá", "Để tôi bàn với vợ/chồng", "Đang xem bên khác", "Chưa phải lúc này"...',
    lines: 3,
  },
  {
    key: 'additionalContext',
    label: 'Thông tin bổ sung',
    placeholder: 'Bất kỳ thông tin nào giúp AI hiểu rõ hơn công việc của bạn.\nVD: Chính sách ưu đãi hiện tại, chương trình khuyến mãi, quy trình bán hàng nội bộ...',
    lines: 4,
  },
];

export default function BusinessProfileScreen() {
  const navigation = useNavigation();
  const { reload: reloadBusiness } = useBusiness();
  const { showAlert } = useAlert();
  const [profile, setProfile] = useState<BusinessProfile>(EMPTY_PROFILE);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadBusinessProfile().then(setProfile);
  }, []);

  const updateField = (key: keyof BusinessProfile, value: string) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveBusinessProfile(profile);
      await reloadBusiness();
      showAlert({ title: 'Đã lưu', message: 'Thông tin doanh nghiệp đã được cập nhật. AI Coach sẽ trả lời cá nhân hóa theo thông tin này.', type: 'success' });
    } catch {
      showAlert({ title: 'Lỗi', message: 'Không thể lưu. Vui lòng thử lại.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const filledCount = FIELDS.filter(f => profile[f.key].trim()).length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.TEXT} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Thông tin doanh nghiệp</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Info card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Cá nhân hóa AI Coach</Text>
            <Text style={styles.infoText}>
              Nhập thông tin về công ty, sản phẩm và khách hàng để AI Coach đưa ra lời khuyên phù hợp chính xác với công việc của bạn.
            </Text>
            <View style={styles.progressRow}>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${(filledCount / FIELDS.length) * 100}%` }]} />
              </View>
              <Text style={styles.progressText}>{filledCount}/{FIELDS.length}</Text>
            </View>
          </View>

          {/* Fields */}
          {FIELDS.map(field => (
            <View key={field.key} style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{field.label}</Text>
              <TextInput
                style={[styles.fieldInput, field.lines > 1 && { height: field.lines * 24 + 24, textAlignVertical: 'top' }]}
                placeholder={field.placeholder}
                placeholderTextColor={COLORS.TEXT_LIGHT}
                value={profile[field.key]}
                onChangeText={v => updateField(field.key, v)}
                multiline={field.lines > 1}
              />
            </View>
          ))}

          {/* Save button */}
          <TouchableOpacity
            style={[styles.saveBtn, isSaving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text style={styles.saveBtnText}>{isSaving ? 'Đang lưu...' : 'Lưu thông tin'}</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: COLORS.CARD, borderBottomWidth: 1, borderBottomColor: COLORS.BORDER,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.SURFACE, alignItems: 'center', justifyContent: 'center',
  },
  topBarTitle: { fontSize: 16, fontWeight: '700', color: COLORS.TEXT },
  scroll: { flex: 1, paddingHorizontal: 16 },

  infoCard: {
    backgroundColor: COLORS.PRIMARY + '08', borderRadius: 16, padding: 16,
    marginTop: 16, marginBottom: 8, borderWidth: 1, borderColor: COLORS.PRIMARY + '15',
  },
  infoTitle: { fontSize: 16, fontWeight: '700', color: COLORS.PRIMARY, marginBottom: 6 },
  infoText: { fontSize: 13, color: COLORS.TEXT_SECONDARY, lineHeight: 20 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  progressBarBg: { flex: 1, height: 6, backgroundColor: COLORS.BORDER, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: COLORS.SUCCESS, borderRadius: 3 },
  progressText: { fontSize: 12, fontWeight: '700', color: COLORS.TEXT_SECONDARY },

  fieldGroup: { marginTop: 16 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: COLORS.TEXT, marginBottom: 6 },
  fieldInput: {
    backgroundColor: COLORS.CARD, borderRadius: 12, borderWidth: 1, borderColor: COLORS.BORDER,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: COLORS.TEXT, lineHeight: 20,
  },

  saveBtn: {
    backgroundColor: COLORS.PRIMARY, borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginTop: 24,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
