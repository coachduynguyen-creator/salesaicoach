import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { useColors } from '../contexts/ThemeContext';
import { markLessonComplete, loadLessonProgress } from '../services/storageService';

type LessonDetailRouteParams = {
  LessonDetail: {
    lesson: {
      id: string;
      title: string;
      tag: string;
      tagColor: string;
      duration: string;
      description: string;
      emoji: string;
    };
  };
};

// ─── Nội dung mỗi bài: 1-2 ý chính, ngắn gọn, dễ nhớ ─────────────────────

const LESSON_CONTENT: Record<string, { keyPoints: string[]; body: string }> = {
  m1: {
    keyPoints: [
      'T = (Uy tín + Tin cậy + Kết nối cảm xúc) / Sự tập trung vào bản thân',
      'Giảm Sf (bớt nói về mình, KPI, hoa hồng) là cách nhanh nhất tăng Trust',
    ],
    body: 'Khách hàng không mua vì bạn giỏi. Họ mua vì họ **tin** bạn hiểu họ.\n\n**Uy tín (C):** Khách tin bạn có chuyên môn thật sự — không phải nói suông.\n\n**Tin cậy (R):** Bạn nói gì làm nấy, nhất quán.\n\n**Kết nối (E):** Khách cảm thấy bạn quan tâm đến họ, không phải chỉ quan tâm đơn hàng.\n\n**Sf — mẫu số:** Càng tập trung vào bản thân → Trust càng giảm. Đây là lỗi phổ biến nhất.',
  },
  m2: {
    keyPoints: [
      '3 cạnh: Chuyên môn — Tin tưởng — Kết nối cảm xúc',
      'Mất 1 cạnh bất kỳ = toàn bộ sụp đổ',
    ],
    body: 'Mất **Chuyên môn:** Khách coi bạn là "bạn tốt nhưng không đủ năng lực."\n\nMất **Tin tưởng:** Khách nghĩ bạn giỏi nhưng "không biết có thật lòng không."\n\nMất **Cảm xúc:** Khách thấy bạn chuyên nghiệp nhưng "không muốn làm việc cùng."\n\nKiểm tra nhanh: Sau mỗi buổi gặp, tự hỏi mình đã tạo được cả 3 yếu tố chưa.',
  },
  m3: {
    keyPoints: [
      'Bán hàng tập trung sản phẩm → Cố vấn tập trung vấn đề của khách',
      'Bán hàng nói nhiều → Cố vấn lắng nghe nhiều',
    ],
    body: '**Bán hàng:** "Em có sản phẩm tốt, anh xem nhé"\n**Cố vấn:** "Anh đang gặp khó khăn gì nhất hiện tại?"\n\n**Bán hàng:** Sợ từ chối → giảm giá ngay\n**Cố vấn:** Coi từ chối là tín hiệu cần tìm hiểu thêm\n\n**Bán hàng:** Kết thúc khi ký hợp đồng\n**Cố vấn:** Tiếp tục hỗ trợ sau bán\n\n**Bán hàng:** Tạo áp lực\n**Cố vấn:** Tạo không gian cho khách tự quyết định',
  },
  m4: {
    keyPoints: [
      'Hệ thống 1 (nhanh, cảm xúc) quyết định mua hàng thật sự',
      'Hệ thống 2 (chậm, lý trí) chỉ dùng để hợp lý hóa quyết định đã có',
    ],
    body: 'Khách "thích" hoặc "không thích" trong **vài giây đầu tiên** — đó là Hệ thống 1.\n\nSai lầm lớn nhất của sales: liệt kê tính năng, so sánh giá (Hệ thống 2) trong khi **chưa tạo kết nối cảm xúc** (Hệ thống 1 chưa được kích hoạt).\n\n**Ghi nhớ:** Tạo cảm xúc trước, logic sau. Không ai mua hàng bằng Excel.',
  },
  m5: {
    keyPoints: [
      '6 nỗi sợ: mất tiền, mất mặt, thay đổi, bị lừa, mất kiểm soát, phức tạp',
      'Nhận biết nỗi sợ qua biểu hiện, không qua lời nói trực tiếp',
    ],
    body: '**Sợ mất tiền:** Hỏi giá nhiều lần, so sánh đối thủ → Cho trải nghiệm trước, tính ROI cụ thể\n\n**Sợ mất mặt:** Hỏi "có ai dùng chưa?" → Đưa chứng nhận, khách tương tự\n\n**Sợ thay đổi:** "Để tôi nghĩ thêm" → Cho thấy cái giá của việc KHÔNG thay đổi\n\n**Sợ bị lừa:** Hoài nghi, hỏi xoáy → Minh bạch, nói cả điểm yếu sản phẩm\n\n**Sợ mất kiểm soát:** Đặt nhiều điều kiện → Trao quyền chọn lựa\n\n**Sợ phức tạp:** Hỏi kỹ thuật nhiều → Đơn giản hóa, chia nhỏ quy trình',
  },
  m6: {
    keyPoints: [
      '5 giai đoạn: Chưa biết → Nhận ra → Tìm giải pháp → So sánh → Quyết định',
      'Sales giỏi nhận biết khách đang ở giai đoạn nào và điều chỉnh cách tiếp cận',
    ],
    body: 'Song hành với **5 giai đoạn cảm xúc:**\nThờ ơ → Lo lắng → Hy vọng → Phân vân → Tin tưởng hoặc Sợ hãi\n\n**Sai lầm:** Giới thiệu sản phẩm khi khách còn ở giai đoạn "Chưa biết" (chưa thấy mình có vấn đề).\n\n**Đúng:** Ở giai đoạn "Chưa biết" → đặt câu hỏi giúp khách nhận ra vấn đề trước.',
  },

  // ── Kỹ năng ──
  s1: {
    keyPoints: [
      'Đặt câu hỏi để khách TỰ nhìn thấy vấn đề',
      'Khi khách tự nói ra vấn đề — họ đã sẵn sàng nghe giải pháp',
    ],
    body: '**Không nói:** "Anh đang có vấn đề"\n**Mà hỏi:** "Anh đang xử lý việc này như thế nào hiện tại?"\n\nCâu hỏi mẫu:\n— "Điều gì khiến anh chưa hài lòng nhất?"\n— "Nếu cứ tiếp tục như vậy, 6 tháng nữa anh thấy thế nào?"\n— "Anh mong muốn điều gì thay đổi?"',
  },
  s2: {
    keyPoints: [
      'Khách cần cảm thấy được hiểu — không phải được bán hàng',
      'Lắng nghe thật sự + kể câu chuyện tương tự = kết nối mạnh nhất',
    ],
    body: '**Cách tạo kết nối cảm xúc:**\n— Lắng nghe, không ngắt lời\n— Phản hồi: "Em hiểu anh đang nói gì"\n— Kể câu chuyện thật: "Có một khách trước đây cũng gặp đúng vấn đề này..."\n— **Không vội đưa giải pháp** — để khách nói hết đã\n\nLỗi phổ biến: Khách vừa nói xong vấn đề, sales nhảy ngay vào trình bày sản phẩm.',
  },
  s3: {
    keyPoints: [
      'Để khách TỰ đề xuất bước tiếp theo',
      'Trao quyền chọn lựa — không ép timeline, không tạo áp lực giả',
    ],
    body: '**Câu hỏi đúng:**\n"Theo anh, bước tiếp theo nên làm gì?"\n"Anh muốn mình bắt đầu từ đâu?"\n\n**Sai lầm lớn nhất:** Ép khách hành động khi chưa qua đủ Điểm Chạm Nhận thức và Cảm xúc.\n\n"Giá này chỉ còn hôm nay" → Mất vị thế cố vấn ngay lập tức.',
  },
  s4: {
    keyPoints: [
      '3 tầng: Nghe lời nói → Nghe cảm xúc → Nghe điều chưa nói',
      'Quy tắc 70/30: nghe 70%, nói 30%',
    ],
    body: 'Khi khách nói **"để tôi nghĩ thêm":**\n— Tầng 1 nghe: "cần thời gian"\n— Tầng 2 nghe: giọng do dự, không hào hứng\n— Tầng 3 nghe: **"tôi chưa đủ tin tưởng"**\n\nSales giỏi phản hồi tầng 3: "Em hiểu anh cần cân nhắc. Có điều gì anh đang phân vân mà em có thể giúp được không?"',
  },
  s5: {
    keyPoints: [
      'Câu hỏi thẩm vấn → khách phòng thủ. Câu hỏi dẫn dắt → khách mở lòng',
      'Câu hỏi tốt: mở, không có đáp án có/không, hướng khách suy nghĩ sâu hơn',
    ],
    body: '**Thẩm vấn:** "Ngân sách anh bao nhiêu?" → Khách phòng thủ\n**Dẫn dắt:** "Anh mong đợi giải pháp này mang lại kết quả gì?" → Khách mở lòng\n\nCâu hỏi mẫu:\n— "Điều gì quan trọng nhất với anh khi chọn đối tác?"\n— "Nếu có giải pháp hoàn hảo, nó sẽ trông như thế nào?"',
  },
  s6: {
    keyPoints: [
      'Tín hiệu mua: hỏi triển khai, timeline, đề cập sếp/đồng nghiệp',
      'Chữ "nhưng" = nơi sự thật nằm',
    ],
    body: '**Tín hiệu mua:** Khách hỏi chi tiết triển khai, hỏi timeline, đề cập đến đồng nghiệp/sếp.\n\n**Chưa sẵn sàng:** Trả lời ngắn, nhìn đồng hồ, hỏi lại giá nhiều lần.\n\n**Cần quay lại cảm xúc:** Khách nói "hay lắm **nhưng**..." — mọi thứ trước "nhưng" là lịch sự, mọi thứ sau "nhưng" mới là thật.',
  },

  // ── Tình huống ──
  h1: {
    keyPoints: [
      'REFLECT: Nhận diện → Đồng cảm → Tìm hiểu → Dẫn dắt → Kết nối → Xác nhận → Theo dõi',
      'Không phản ứng ngay — nhận diện tín hiệu trước',
    ],
    body: '**R** — Nhận diện: Nhận ra tín hiệu, không phản ứng ngay\n**E** — Đồng cảm: Thể hiện sự hiểu về cảm xúc khách\n**F** — Tìm hiểu: Hỏi để hiểu nguyên nhân gốc rễ\n**L** — Dẫn dắt: Dẫn khách đến góc nhìn mới\n**E** — Kết nối: Tạo kết nối cảm xúc sâu hơn\n**C** — Xác nhận: Xác nhận bước tiếp theo cùng khách\n**T** — Theo dõi: Chăm sóc sau cuộc gặp',
  },
  h2: {
    keyPoints: [
      'SAI: Nói xấu đối thủ → mất chuyên nghiệp',
      'ĐÚNG: "Anh đang cân nhắc tiêu chí nào?" → dẫn khách tự phân tích',
    ],
    body: '**SAI:** "Bên đó không tốt bằng bên em" → Mất vị thế, thành người nói xấu\n\n**ĐÚNG:** "Bên đó cũng uy tín. Anh đang cân nhắc tiêu chí nào khi so sánh?"\n\nSau đó hỏi tiếp: "Trong những tiêu chí đó, điều nào quan trọng nhất?" → Dẫn cuộc trò chuyện theo **giá trị**, không phải giá cả.',
  },
  h3: {
    keyPoints: [
      'Không giảm giá ngay — hỏi "cao so với điều gì?" trước',
      'Quay lại Điểm Chạm nhận thức nếu khách chưa thấy giá trị',
    ],
    body: 'Khách nói "giá cao" = **tín hiệu**, không phải từ chối.\n\n**SAI:** Giảm giá ngay → khách nghĩ giá ban đầu là "giá ảo"\n\n**ĐÚNG:** "Anh thấy cao so với điều gì ạ?"\n— Nếu so với ngân sách → giúp tính giá trị đầu tư\n— Nếu so với đối thủ → phân tích khác biệt về giá trị\n\nCâu mẫu: "Nếu giải pháp này giúp anh đạt [kết quả cụ thể], đầu tư này có xứng đáng không?"',
  },
  h4: {
    keyPoints: [
      'Hỏi ý kiến người đi cùng — biến họ thành đồng minh',
      'Bỏ qua người đi cùng = họ thành "kẻ phản đối" sau buổi gặp',
    ],
    body: '**SAI:** Chỉ nói chuyện với người quyết định, bỏ qua người đi cùng.\n\n**ĐÚNG:** "Anh/chị nghĩ sao về vấn đề này?" — để mọi người đều cảm thấy được tôn trọng.\n\nNgười đi cùng thường là vợ/chồng, đồng nghiệp, hoặc cố vấn. Nếu họ cảm thấy bị bỏ qua, sau buổi gặp họ sẽ nói: "Anh cẩn thận, tôi thấy không ổn."',
  },
  h5: {
    keyPoints: [
      'Không liệt kê thành tích — kể 1 câu chuyện thật có kết quả cụ thể',
      'Hoặc để khách trải nghiệm trực tiếp thay vì nói',
    ],
    body: '**SAI:** Phòng thủ, liệt kê thành tích, nói quá → Khách càng nghi ngờ\n\n**ĐÚNG:** "Câu hỏi hay lắm. Thay vì em nói, em chia sẻ 1 tình huống tương tự..."\n→ Kể câu chuyện thật, có kết quả cụ thể (con số, thời gian)\n\nHoặc: "Cách tốt nhất là anh trải nghiệm trực tiếp. Mình thử với phần nhỏ xem kết quả?"',
  },
  h6: {
    keyPoints: [
      '6 lỗi chết: phản ứng cảm xúc, hạ giá nhanh, nói quá nhiều, nói xấu đối thủ, hứa quá, bỏ rơi sau bán',
      'Phản ứng cảm xúc là lỗi nguy hiểm nhất — hít thở, đếm 3 giây trước khi trả lời',
    ],
    body: '**1. Phản ứng cảm xúc:** Khách nói khó nghe → phòng thủ ngay → Fix: đếm 3 giây\n\n**2. Hạ giá nhanh:** Khách nói "đắt" → giảm ngay → Fix: hỏi "đắt so với gì?"\n\n**3. Nói quá nhiều:** Chiếm 80% thời gian → Fix: quy tắc 70/30\n\n**4. Nói xấu đối thủ:** Mất chuyên nghiệp → Fix: khen rồi dẫn khách tự so sánh\n\n**5. Hứa quá:** "Giải quyết mọi vấn đề" → Fix: nói thật, kể cả hạn chế\n\n**6. Bỏ rơi sau bán:** Mất cơ hội giới thiệu → Fix: lịch chăm sóc 7-30-90 ngày',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function LessonDetailScreen() {
  const C = useColors();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<LessonDetailRouteParams, 'LessonDetail'>>();
  const { lesson } = route.params;

  const content = LESSON_CONTENT[lesson.id];
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    loadLessonProgress().then(ids => setCompleted(ids.includes(lesson.id)));
  }, [lesson.id]);

  const handleComplete = async () => {
    await markLessonComplete(lesson.id);
    setCompleted(true);
  };

  if (!content) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.TEXT} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Bài học</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
          <Text style={{ fontSize: 15, color: COLORS.TEXT_LIGHT, textAlign: 'center' }}>
            Nội dung bài học đang được cập nhật.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.TEXT} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>{lesson.tag}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={[styles.heroEmoji, { backgroundColor: lesson.tagColor + '15' }]}>
            <Text style={styles.emojiText}>{lesson.emoji}</Text>
          </View>
          <View style={[styles.tagBadge, { backgroundColor: lesson.tagColor + '18' }]}>
            <Text style={[styles.tagBadgeText, { color: lesson.tagColor }]}>{lesson.tag}</Text>
          </View>
          <Text style={styles.heroTitle}>{lesson.title}</Text>
          <Text style={styles.heroMeta}>{lesson.duration}</Text>
        </View>

        {/* Key Points */}
        <View style={[styles.keyPointsBox, { backgroundColor: C.PRIMARY + '08', borderColor: C.PRIMARY + '15' }]}>
          <Text style={[styles.kpTitle, { color: C.PRIMARY }]}>Ghi nhớ</Text>
          {content.keyPoints.map((point, i) => (
            <View key={i} style={styles.kpRow}>
              <View style={[styles.kpDot, { backgroundColor: C.PRIMARY }]} />
              <Text style={styles.kpText}>{point}</Text>
            </View>
          ))}
        </View>

        {/* Body */}
        <View style={styles.section}>
          <Text style={styles.sectionBody}>{content.body}</Text>
        </View>

        {/* Mark Complete */}
        {!completed ? (
          <TouchableOpacity
            style={[styles.completeBtn, { backgroundColor: C.PRIMARY }]}
            onPress={handleComplete}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
            <Text style={styles.completeBtnText}>Đã hiểu, hoàn thành bài này</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.completeBtn, { backgroundColor: COLORS.SUCCESS }]}>
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.completeBtnText}>Đã hoàn thành</Text>
          </View>
        )}

        {/* Practice */}
        <TouchableOpacity
          style={[styles.practiceBox, { backgroundColor: C.PRIMARY + '10', borderColor: C.PRIMARY + '20' }]}
          onPress={() => navigation.navigate('GhiAm' as never)}
        >
          <Text style={[styles.practiceTitle, { color: C.PRIMARY }]}>Thực hành ngay</Text>
          <Text style={styles.practiceText}>Ghi âm buổi tư vấn, AI sẽ đánh giá theo TTA</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.CARD, paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.BORDER,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: COLORS.SURFACE },
  topBarTitle: { fontSize: 15, fontWeight: '600', color: COLORS.TEXT, flex: 1, textAlign: 'center' },
  scroll: { padding: 20, paddingBottom: 40 },

  hero: { alignItems: 'center', marginBottom: 24 },
  heroEmoji: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  emojiText: { fontSize: 40 },
  tagBadge: { paddingHorizontal: 14, paddingVertical: 4, borderRadius: 12, marginBottom: 10 },
  tagBadgeText: { fontSize: 12, fontWeight: '700' },
  heroTitle: { fontSize: 22, fontWeight: '800', color: COLORS.TEXT, textAlign: 'center', lineHeight: 30, marginBottom: 6 },
  heroMeta: { fontSize: 13, color: COLORS.TEXT_LIGHT },

  keyPointsBox: { borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1 },
  kpTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  kpRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, gap: 10 },
  kpDot: { width: 7, height: 7, borderRadius: 4, marginTop: 6, flexShrink: 0 },
  kpText: { fontSize: 14, color: COLORS.TEXT, lineHeight: 21, flex: 1, fontWeight: '600' },

  section: {
    backgroundColor: COLORS.CARD, borderRadius: 16, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  sectionBody: { fontSize: 14, color: COLORS.TEXT, lineHeight: 24 },

  completeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 12, paddingVertical: 14, marginBottom: 12,
  },
  completeBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  practiceBox: {
    borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1,
  },
  practiceTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  practiceText: { fontSize: 12, color: COLORS.TEXT_LIGHT, textAlign: 'center' },
});
