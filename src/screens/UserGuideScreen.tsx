import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { useColors } from '../contexts/ThemeContext';

interface GuideStep {
  icon: string;
  color: string;
  title: string;
  description: string;
  tips?: string[];
}

const GUIDE_SECTIONS: { title: string; steps: GuideStep[] }[] = [
  {
    title: 'Bắt đầu',
    steps: [
      {
        icon: 'radio', color: '#DC2626',
        title: 'Ghi âm buổi tư vấn',
        description: 'Nhấn tab "Ghi Âm" ở thanh menu dưới. Nhập tên khách hàng, sau đó nhấn nút tròn đỏ để bắt đầu ghi âm.',
        tips: ['Nhập tên khách TRƯỚC khi ghi âm', 'Có thể tạm dừng và tiếp tục', 'Hoặc tải file ghi âm có sẵn (MP3, M4A, WAV)'],
      },
      {
        icon: 'sparkles', color: '#7C3AED',
        title: 'AI phân tích tự động',
        description: 'Sau khi ghi âm xong, nhấn "Phân tích". AI sẽ chấm điểm 10, phân tích điểm mạnh, điểm cần cải thiện, và đề xuất kịch bản mẫu.',
        tips: ['Có thể sửa tên khách hàng sau khi phân tích', 'Kết quả lưu tự động trong "Lịch sử"'],
      },
    ],
  },
  {
    title: 'Quản lý khách hàng',
    steps: [
      {
        icon: 'people', color: '#2563EB',
        title: 'CRM khách hàng',
        description: 'Tab "Khách Hàng" hiển thị tất cả khách với biểu đồ phễu bán hàng. Khách được tự động tạo từ buổi ghi âm.',
        tips: ['Nhấn vào khách để xem chi tiết đầy đủ', 'Nhấn "Đồng bộ" để AI trích xuất thông tin từ cuộc gọi', 'Thay đổi giai đoạn khách bằng cách nhấn vào trạng thái'],
      },
      {
        icon: 'funnel', color: '#059669',
        title: 'Phễu bán hàng',
        description: 'Biểu đồ phễu cho thấy số khách ở mỗi giai đoạn và tỷ lệ chuyển đổi. Nhấn vào phễu hoặc dùng bộ lọc để xem theo giai đoạn.',
      },
    ],
  },
  {
    title: 'AI Coach',
    steps: [
      {
        icon: 'chatbubbles', color: '#7C3AED',
        title: 'Chat với AI Coach',
        description: 'Tab "AI Coach" cho phép bạn hỏi bất kỳ tình huống bán hàng nào. AI trả lời theo phương pháp 3 Điểm Chạm.',
        tips: ['Chọn khách hàng khi tạo cuộc trò chuyện mới', 'AI sẽ biết toàn bộ thông tin khách từ CRM', 'Có thể nhấn mic để nói thay vì gõ'],
      },
    ],
  },
  {
    title: 'Công cụ AI',
    steps: [
      {
        icon: 'document-text', color: '#E67E22',
        title: 'Tạo kịch bản',
        description: 'Nhập tên khách + ngành + tình huống, AI tạo kịch bản tư vấn chi tiết theo 3 Điểm Chạm với phiên bản đúng/sai.',
      },
      {
        icon: 'clipboard', color: '#2563EB',
        title: 'Chuẩn bị trước buổi gặp',
        description: 'Nhập thông tin khách, AI tạo briefing: phân tích tâm lý, câu hỏi mở, kịch bản mở đầu, cảnh báo lỗi.',
      },
      {
        icon: 'reader', color: '#059669',
        title: 'Tóm tắt sau buổi gặp',
        description: 'Paste nội dung buổi gặp, AI tóm tắt điểm chính, việc cần làm tiếp, và tin nhắn theo dõi sau.',
      },
      {
        icon: 'chatbubbles', color: '#7C3AED',
        title: 'Luyện đối đáp',
        description: 'Mô tả tình huống, AI đóng vai khách hàng thật để bạn luyện tập xử lý.',
      },
      {
        icon: 'shield-checkmark', color: '#DC2626',
        title: 'Xử lý phản đối',
        description: 'Nhập câu phản đối của khách (VD: "giá cao"), AI phân tích nỗi sợ thật và đề xuất cách phản chiếu.',
      },
    ],
  },
  {
    title: 'Đào tạo',
    steps: [
      {
        icon: 'library', color: '#059669',
        title: '32 bài học',
        description: 'Tab "Đào Tạo" có 32 bài học chia 5 chủ đề: Nền tảng, Tâm lý, 3 Điểm Chạm, Kỹ năng, Tình huống.',
        tips: ['AI đề xuất bài phù hợp dựa trên lịch sử ghi âm', 'Nhấn "Hoàn thành" sau mỗi bài để theo dõi tiến độ', 'Nhấn vào progress bar để chia sẻ chứng nhận'],
      },
    ],
  },
  {
    title: 'Tính năng khác',
    steps: [
      {
        icon: 'flag', color: '#F59E0B',
        title: 'Mục tiêu',
        description: 'Đặt mục tiêu tuần/tháng (VD: gọi 20 khách mới). Nhấn +1 mỗi khi hoàn thành. Theo dõi tiến độ trực quan.',
      },
      {
        icon: 'calculator', color: '#10B981',
        title: 'Tính hoa hồng',
        description: 'Nhập giá trị deal + % hoa hồng, app tính tự động và tổng hợp doanh số.',
      },
      {
        icon: 'flame', color: '#F59E0B',
        title: 'Streak và huy hiệu',
        description: 'Dùng app mỗi ngày để giữ streak. Hoàn thành các mốc để nhận 12 huy hiệu thành tựu.',
      },
      {
        icon: 'moon', color: '#6366F1',
        title: 'Chế độ tối',
        description: 'Vào Cài Đặt → Giao diện → chọn Sáng/Tối/Hệ thống.',
      },
      {
        icon: 'bug', color: '#EF4444',
        title: 'Báo lỗi',
        description: 'Nút tròn đỏ góc màn hình. Kéo thả được. Nhấn để gửi báo lỗi cho đội phát triển.',
      },
    ],
  },
];

export default function UserGuideScreen() {
  const C = useColors();
  const navigation = useNavigation();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.BACKGROUND }]} edges={['top']}>
      <View style={[styles.topBar, { backgroundColor: C.CARD, borderBottomColor: C.BORDER }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: C.SURFACE }]}>
          <Ionicons name="arrow-back" size={22} color={C.TEXT} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: C.TEXT }]}>Hướng dẫn sử dụng</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <Ionicons name="book" size={40} color={C.PRIMARY} />
          <Text style={[styles.heroTitle, { color: C.TEXT }]}>Chào mừng đến Sales Coach</Text>
          <Text style={[styles.heroDesc, { color: C.TEXT_SECONDARY }]}>
            Hướng dẫn nhanh giúp bạn tận dụng tối đa các tính năng của app
          </Text>
        </View>

        {GUIDE_SECTIONS.map((section, sIdx) => (
          <View key={sIdx} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: C.TEXT }]}>{section.title}</Text>
            {section.steps.map((step, idx) => (
              <View key={idx} style={[styles.stepCard, { backgroundColor: C.CARD }]}>
                <View style={[styles.stepIcon, { backgroundColor: step.color + '12' }]}>
                  <Ionicons name={step.icon as any} size={22} color={step.color} />
                </View>
                <View style={styles.stepContent}>
                  <Text style={[styles.stepTitle, { color: C.TEXT }]}>{step.title}</Text>
                  <Text style={[styles.stepDesc, { color: C.TEXT_SECONDARY }]}>{step.description}</Text>
                  {step.tips && (
                    <View style={styles.tipsWrap}>
                      {step.tips.map((tip, i) => (
                        <View key={i} style={styles.tipRow}>
                          <Ionicons name="checkmark-circle" size={14} color={step.color} />
                          <Text style={[styles.tipText, { color: C.TEXT_SECONDARY }]}>{tip}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        ))}

        <View style={[styles.footerCard, { backgroundColor: C.PRIMARY + '10', borderColor: C.PRIMARY + '20' }]}>
          <Ionicons name="help-circle" size={24} color={C.PRIMARY} />
          <Text style={[styles.footerTitle, { color: C.TEXT }]}>Cần hỗ trợ thêm?</Text>
          <Text style={[styles.footerDesc, { color: C.TEXT_SECONDARY }]}>
            Hỏi AI Coach bất kỳ câu hỏi nào về cách sử dụng app hoặc kỹ năng bán hàng.
          </Text>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  topBarTitle: { fontSize: 15, fontWeight: '600', flex: 1, textAlign: 'center' },
  scroll: { padding: 16, paddingBottom: 40 },

  hero: { alignItems: 'center', marginBottom: 24, paddingVertical: 16 },
  heroTitle: { fontSize: 22, fontWeight: '800', marginTop: 12 },
  heroDesc: { fontSize: 14, marginTop: 6, textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 },

  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },

  stepCard: {
    borderRadius: 14, padding: 16, marginBottom: 10,
    flexDirection: 'row', gap: 14, alignItems: 'flex-start',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  stepIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  stepDesc: { fontSize: 13, lineHeight: 20 },

  tipsWrap: { marginTop: 8, gap: 4 },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  tipText: { fontSize: 12, lineHeight: 18, flex: 1 },

  footerCard: {
    borderRadius: 14, padding: 20, alignItems: 'center', borderWidth: 1, gap: 8, marginTop: 8,
  },
  footerTitle: { fontSize: 15, fontWeight: '700' },
  footerDesc: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
});
