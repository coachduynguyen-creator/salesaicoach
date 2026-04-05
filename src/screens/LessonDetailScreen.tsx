import React from 'react';
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

// ─── Nội dung TTA theo từng bài ─────────────────────────────────────────────

const LESSON_CONTENT: Record<string, { keyPoints: string[]; sections: { heading: string; body: string }[] }> = {
  tl1: {
    keyPoints: [
      'Công thức Trust: T = (C + R + E) / Sf — Uy tín, Tin cậy, Kết nối cảm xúc chia cho Sự tập trung vào bản thân',
      'Tam giác vàng: Chuyên môn — Sự tin tưởng — Kết nối cảm xúc. Mất 1 cạnh = sụp đổ',
      '10 khác biệt cốt lõi giữa người bán hàng và cố vấn tin cậy',
      '4 nguyên tắc tư duy: Tập trung vào khách, Tư duy dài hạn, Minh bạch, Dũng cảm nói thật',
    ],
    sections: [
      {
        heading: 'Cố vấn Tin cậy là ai?',
        body: 'Cố vấn Tin cậy không phải là người bán hàng giỏi hơn — mà là người thay đổi hoàn toàn cách tiếp cận. Thay vì cố thuyết phục khách mua, cố vấn tin cậy giúp khách tự nhìn thấy vấn đề và tự ra quyết định.\n\nKhách hàng cao cấp không mua vì bạn nói hay. Họ mua vì họ tin bạn hiểu họ.',
      },
      {
        heading: 'Công thức Trust: T = (C + R + E) / Sf',
        body: 'C — Uy tín (Credibility): Khách tin bạn có chuyên môn thật sự, không phải nói suông.\n\nR — Độ tin cậy (Reliability): Bạn nói gì làm nấy, nhất quán trong mọi tương tác.\n\nE — Kết nối cảm xúc (Emotion): Khách cảm thấy bạn thật sự quan tâm đến họ, không phải chỉ quan tâm đến đơn hàng.\n\nSf — Sự tập trung vào bản thân (Self-focus): Càng tập trung vào bản thân (doanh số, hoa hồng, KPI) → Trust càng giảm.\n\nMuốn tăng Trust: tăng C, R, E và giảm Sf.',
      },
      {
        heading: 'Tam giác vàng',
        body: 'Ba cạnh của tam giác vàng:\n\n1. Chuyên môn — Bạn thật sự hiểu sản phẩm và ngành của khách\n2. Sự tin tưởng — Khách tin bạn sẽ không lừa họ\n3. Kết nối cảm xúc — Khách thấy thoải mái khi nói chuyện với bạn\n\nNếu mất cạnh Chuyên môn: khách coi bạn là "bạn tốt nhưng không đủ năng lực".\nNếu mất cạnh Tin tưởng: khách nghĩ bạn giỏi nhưng "không biết có thật lòng không".\nNếu mất cạnh Cảm xúc: khách thấy bạn chuyên nghiệp nhưng "không muốn làm việc cùng".',
      },
      {
        heading: '10 khác biệt: Người bán hàng vs. Cố vấn',
        body: '1. Bán hàng tập trung vào sản phẩm → Cố vấn tập trung vào vấn đề của khách\n2. Bán hàng nói nhiều → Cố vấn lắng nghe nhiều\n3. Bán hàng muốn chốt nhanh → Cố vấn xây dựng quan hệ dài hạn\n4. Bán hàng sợ từ chối → Cố vấn coi từ chối là tín hiệu cần tìm hiểu thêm\n5. Bán hàng giảm giá khi bị ép → Cố vấn giải thích giá trị\n6. Bán hàng liệt kê tính năng → Cố vấn kể câu chuyện thực tế\n7. Bán hàng "em có sản phẩm tốt" → Cố vấn "anh đang gặp vấn đề gì?"\n8. Bán hàng theo script → Cố vấn linh hoạt theo tình huống\n9. Bán hàng kết thúc khi ký hợp đồng → Cố vấn tiếp tục hỗ trợ sau bán\n10. Bán hàng tạo áp lực → Cố vấn tạo không gian cho khách tự quyết định',
      },
    ],
  },
  tl2: {
    keyPoints: [
      'Kahneman: 2 hệ thống nhận thức — Hệ thống 1 (nhanh, cảm xúc) và Hệ thống 2 (chậm, lý trí)',
      '6 nỗi sợ cốt lõi khi ra quyết định mua hàng cao cấp',
      '5 giai đoạn nhận thức + 5 giai đoạn cảm xúc song hành',
      'Thiên lệch nhận thức ảnh hưởng đến quyết định mua',
    ],
    sections: [
      {
        heading: 'Hai hệ thống nhận thức (Kahneman)',
        body: 'Hệ thống 1 — Nhanh, tự động, cảm xúc. Đây là hệ thống quyết định mua hàng thật sự. Khách "thích" hoặc "không thích" trong vài giây đầu tiên.\n\nHệ thống 2 — Chậm, phân tích, lý trí. Hệ thống này được dùng để "hợp lý hóa" quyết định đã có sẵn từ Hệ thống 1.\n\nSai lầm lớn nhất của sales: cố thuyết phục Hệ thống 2 (liệt kê tính năng, so sánh giá) trong khi Hệ thống 1 chưa được kích hoạt (chưa tạo kết nối cảm xúc).',
      },
      {
        heading: '6 nỗi sợ cốt lõi',
        body: '1. Sợ mất tiền — "Đầu tư lớn mà không hiệu quả thì sao?"\nBiểu hiện: hỏi giá nhiều lần, so sánh đối thủ liên tục\nCách xử lý: cho trải nghiệm trước, tính ROI cụ thể\n\n2. Sợ mất mặt — "Nếu chọn sai, người khác nghĩ gì về mình?"\nBiểu hiện: hỏi "có ai dùng chưa?", cần tham khảo ý kiến\nCách xử lý: đưa chứng nhận, khách hàng tương tự\n\n3. Sợ thay đổi — "Cái cũ vẫn ổn, đổi mới rủi ro lắm"\nBiểu hiện: "để tôi nghĩ thêm", trì hoãn liên tục\nCách xử lý: cho thấy cái giá của việc không thay đổi\n\n4. Sợ bị lừa — "Sales nào chẳng nói hay"\nBiểu hiện: hoài nghi, hỏi xoáy, kiểm tra chéo\nCách xử lý: minh bạch, nói cả điểm yếu sản phẩm\n\n5. Sợ mất quyền kiểm soát — "Tôi không muốn bị phụ thuộc"\nBiểu hiện: đặt nhiều điều kiện, muốn kiểm soát quy trình\nCách xử lý: trao quyền chọn lựa, không ép\n\n6. Sợ phức tạp — "Có dễ dùng không?"\nBiểu hiện: hỏi nhiều câu kỹ thuật, lo triển khai\nCách xử lý: đơn giản hóa, chia nhỏ quy trình',
      },
      {
        heading: '5 giai đoạn nhận thức khi ra quyết định',
        body: '1. Chưa biết — Khách chưa nhận ra vấn đề\n2. Nhận ra vấn đề — "Hình như mình đang gặp khó"\n3. Tìm kiếm giải pháp — "Có cách nào không?"\n4. So sánh lựa chọn — "Bên nào tốt hơn?"\n5. Quyết định — "Chọn bên này"\n\nSong song là 5 giai đoạn cảm xúc:\n1. Thờ ơ → 2. Lo lắng → 3. Hy vọng → 4. Phân vân → 5. Tin tưởng hoặc Sợ hãi\n\nSales giỏi nhận biết khách đang ở giai đoạn nào và điều chỉnh cách tiếp cận cho phù hợp.',
      },
    ],
  },
  tl3: {
    keyPoints: [
      '3 Điểm Chạm: Nhận thức — Cảm xúc — Hành động',
      '3 sai lầm phổ biến: bỏ qua cảm xúc, ép hành động, không tạo nhận thức',
      '3 nguyên tắc: Không thuyết phục, Dẫn dắt bằng câu hỏi, Để khách tự quyết',
    ],
    sections: [
      {
        heading: 'Điểm Chạm 1: Nhận thức',
        body: 'Mục tiêu: Giúp khách tự nhìn thấy vấn đề.\n\nKhông phải bạn nói "anh đang có vấn đề" — mà là đặt câu hỏi để khách tự nhận ra.\n\nCâu hỏi mẫu:\n"Anh đang xử lý việc này như thế nào hiện tại?"\n"Điều gì khiến anh chưa hài lòng nhất?"\n"Nếu cứ tiếp tục như vậy, 6 tháng nữa anh thấy thế nào?"\n\nKhi khách tự nói ra vấn đề — họ đã sẵn sàng nghe giải pháp.',
      },
      {
        heading: 'Điểm Chạm 2: Cảm xúc',
        body: 'Mục tiêu: Tạo kết nối cảm xúc, khiến khách cảm thấy được hiểu.\n\nSau khi khách nhận ra vấn đề, họ cần cảm thấy bạn là người hiểu họ — không phải người bán hàng.\n\nCách tạo Điểm Chạm cảm xúc:\n— Lắng nghe thật sự, không ngắt lời\n— Gật đầu, phản hồi: "Em hiểu anh đang nói gì"\n— Kể câu chuyện thực tế tương tự: "Có một khách của em trước đây cũng gặp đúng vấn đề này..."\n— Không vội đưa giải pháp, để khách nói hết',
      },
      {
        heading: 'Điểm Chạm 3: Hành động',
        body: 'Mục tiêu: Khách tự quyết định bước tiếp theo.\n\nSai lầm lớn nhất: ép khách hành động khi chưa qua đủ Điểm Chạm 1 và 2.\n\nCách đúng:\n"Theo anh, bước tiếp theo nên làm gì?"\n"Anh muốn mình bắt đầu từ đâu?"\n"Em có thể gửi anh thông tin chi tiết, hay anh muốn gặp trực tiếp để trao đổi thêm?"\n\nTrao quyền chọn lựa — không ép timeline, không tạo áp lực giả.',
      },
      {
        heading: '3 sai lầm phổ biến',
        body: '1. Bỏ qua Điểm Chạm cảm xúc — Nhảy thẳng từ nhận thức sang hành động. Khách hiểu vấn đề nhưng chưa tin bạn.\n\n2. Ép hành động — "Giá này chỉ còn hôm nay" khi khách chưa sẵn sàng. Mất vị thế cố vấn ngay lập tức.\n\n3. Không tạo nhận thức — Bắt đầu bằng giới thiệu sản phẩm khi khách chưa thấy mình có vấn đề.',
      },
    ],
  },
  tl4: {
    keyPoints: [
      '6 nhóm kỹ năng cốt lõi của Cố vấn Tin cậy',
      'Lắng nghe chiến lược: nghe 70%, nói 30%',
      'Đặt câu hỏi dẫn dắt thay vì câu hỏi thẩm vấn',
      'Đọc tín hiệu: phân biệt tín hiệu thật và lời nói bề mặt',
    ],
    sections: [
      {
        heading: 'Nhóm 1: Lắng nghe chiến lược',
        body: 'Không phải lắng nghe để trả lời — mà lắng nghe để hiểu.\n\nLắng nghe 3 tầng:\n— Tầng 1: Nghe lời nói (nội dung khách nói)\n— Tầng 2: Nghe cảm xúc (giọng điệu, sự do dự, lo lắng)\n— Tầng 3: Nghe điều chưa nói (nỗi sợ ẩn sau lời nói)\n\nKhi khách nói "để tôi nghĩ thêm" — tầng 1 nghe "cần thời gian", nhưng tầng 3 nghe "tôi chưa đủ tin tưởng".',
      },
      {
        heading: 'Nhóm 2: Đặt câu hỏi dẫn dắt',
        body: 'Câu hỏi dẫn dắt khác câu hỏi thẩm vấn.\n\nThẩm vấn: "Ngân sách anh bao nhiêu?" → Khách phòng thủ\nDẫn dắt: "Anh mong đợi giải pháp này mang lại kết quả gì?" → Khách mở lòng\n\nCâu hỏi tốt: mở, không có đáp án "có/không", hướng khách suy nghĩ sâu hơn.\n\nMẫu: "Điều gì quan trọng nhất với anh khi chọn đối tác?"\n"Nếu có một giải pháp hoàn hảo, nó sẽ trông như thế nào?"',
      },
      {
        heading: 'Nhóm 3: Đọc tín hiệu',
        body: 'Tín hiệu mua: khách hỏi chi tiết triển khai, hỏi về timeline, đề cập đến đồng nghiệp/sếp.\n\nTín hiệu chưa sẵn sàng: trả lời ngắn, nhìn đồng hồ, hỏi lại giá nhiều lần.\n\nTín hiệu cần quay lại Điểm Chạm cảm xúc: khách nói "hay lắm nhưng..." — chữ "nhưng" là nơi sự thật nằm.',
      },
      {
        heading: 'Nhóm 4-6: Kể chuyện, Xử lý tín hiệu, Chốt tự nhiên',
        body: 'Nhóm 4 — Kể chuyện có chiến lược: Mỗi câu chuyện cần có Bối cảnh giống khách → Vấn đề khách đang gặp → Giải pháp đã áp dụng → Kết quả cụ thể.\n\nNhóm 5 — Xử lý tín hiệu: Không "xử lý từ chối" — mà đọc tín hiệu và phản hồi đúng. "Giá cao" không phải từ chối — là câu hỏi cần được giải đáp.\n\nNhóm 6 — Chốt tự nhiên: Không dùng kỹ thuật chốt áp lực. Chốt đúng cách: "Theo anh, bước tiếp theo nên làm gì?" — để khách tự đề xuất hành động.',
      },
    ],
  },
  tl5: {
    keyPoints: [
      'Phương pháp REFLECT: 6 bước xử lý tình huống khó',
      'Đọc tín hiệu thay vì xử lý từ chối',
      'Kịch bản SAI/ĐÚNG cho các tình huống thực tế',
    ],
    sections: [
      {
        heading: 'Phương pháp REFLECT',
        body: 'R — Recognize (Nhận diện): Nhận ra tín hiệu, không phản ứng ngay\nE — Empathize (Đồng cảm): Thể hiện sự hiểu biết về cảm xúc khách\nF — Find (Tìm hiểu): Hỏi để hiểu nguyên nhân gốc rễ\nL — Lead (Dẫn dắt): Dẫn khách đến góc nhìn mới\nE — Engage (Kết nối): Tạo kết nối cảm xúc sâu hơn\nC — Confirm (Xác nhận): Xác nhận bước tiếp theo cùng khách\nT — Track (Theo dõi): Theo dõi và chăm sóc sau cuộc gặp',
      },
      {
        heading: 'Tình huống: Khách so sánh với đối thủ',
        body: 'SAI: "Bên đó không tốt bằng bên em đâu anh" → Mất vị thế, trở thành người bán hàng nói xấu đối thủ\n\nĐÚNG: "Bên đó cũng là đơn vị uy tín. Anh đang cân nhắc những tiêu chí nào khi so sánh?" → Giữ vị thế cố vấn, dẫn khách tự phân tích\n\nSau khi khách nói tiêu chí, hỏi tiếp: "Trong những tiêu chí đó, điều nào quan trọng nhất với anh?" → Dẫn cuộc trò chuyện theo hướng giá trị, không phải giá cả.',
      },
      {
        heading: 'Tình huống: Có bên thứ 3 trong cuộc gặp',
        body: 'SAI: Chỉ nói chuyện với người quyết định, bỏ qua người đi cùng → Người đi cùng trở thành "kẻ phản đối" sau buổi gặp\n\nĐÚNG: Chào hỏi và hỏi ý kiến người đi cùng: "Anh/chị nghĩ sao về vấn đề này?" → Biến họ thành đồng minh\n\nNguyên tắc: Trong buổi gặp có nhiều người, ai cũng cần cảm thấy được tôn trọng và lắng nghe.',
      },
      {
        heading: 'Tình huống: Khách kiểm tra năng lực',
        body: 'SAI: Phòng thủ, liệt kê thành tích, nói quá → Khách càng nghi ngờ\n\nĐÚNG: "Câu hỏi hay lắm. Thay vì em nói, để em chia sẻ một tình huống tương tự em đã xử lý..." → Kể câu chuyện thật, có kết quả cụ thể\n\nHoặc: "Em nghĩ cách tốt nhất là anh trải nghiệm trực tiếp. Mình thử bắt đầu với một phần nhỏ xem kết quả thế nào?" → Dùng hành động thay lời nói.',
      },
    ],
  },
  tl5b: {
    keyPoints: [
      '6 lỗi khiến mất vị thế cố vấn ngay lập tức',
      'Phản ứng cảm xúc là lỗi nguy hiểm nhất',
      'Mỗi lỗi kèm cách khắc phục cụ thể',
    ],
    sections: [
      {
        heading: '6 lỗi mất vị thế cố vấn',
        body: '1. Phản ứng cảm xúc — Khi khách nói điều không hay, sales phản ứng ngay bằng phòng thủ hoặc tấn công. Cách fix: hít thở, đếm 3 giây trước khi trả lời.\n\n2. Hạ giá quá nhanh — Khách vừa nói "đắt" đã giảm ngay → khách nghĩ giá ban đầu là "giá ảo". Cách fix: hỏi "đắt so với điều gì?" trước.\n\n3. Nói quá nhiều — Sales chiếm 80% thời gian nói → khách mất hứng. Cách fix: quy tắc 70/30, nghe 70%.\n\n4. Nói xấu đối thủ — Mất chuyên nghiệp, khách nghi ngờ động cơ. Cách fix: khen đối thủ rồi dẫn khách tự so sánh.\n\n5. Hứa quá lời — "Sản phẩm em giải quyết mọi vấn đề" → không ai tin. Cách fix: nói thật, bao gồm cả hạn chế.\n\n6. Bỏ rơi sau bán — Bán xong không liên lạc lại → mất cơ hội giới thiệu. Cách fix: lịch chăm sóc 7-30-90 ngày.',
      },
    ],
  },
  default: {
    keyPoints: ['Nội dung đang được biên soạn'],
    sections: [
      {
        heading: 'Sắp ra mắt',
        body: 'Bài học này đang được chuẩn bị. Hãy quay lại sau.',
      },
    ],
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function LessonDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<LessonDetailRouteParams, 'LessonDetail'>>();
  const { lesson } = route.params;

  const content = LESSON_CONTENT[lesson.id] || LESSON_CONTENT['default'];

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
        <View style={styles.keyPointsBox}>
          <Text style={styles.kpTitle}>Điểm chính cần nhớ</Text>
          {content.keyPoints.map((point, i) => (
            <View key={i} style={styles.kpRow}>
              <View style={styles.kpDot} />
              <Text style={styles.kpText}>{point}</Text>
            </View>
          ))}
        </View>

        {/* Sections */}
        {content.sections.map((section, i) => (
          <View key={i} style={styles.section}>
            <Text style={styles.sectionHeading}>{section.heading}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}

        {/* Practice */}
        <TouchableOpacity
          style={styles.practiceBox}
          onPress={() => navigation.navigate('GhiAm' as never)}
        >
          <Text style={styles.practiceTitle}>Thực hành ngay</Text>
          <Text style={styles.practiceText}>Ghi âm buổi tư vấn tiếp theo, AI sẽ đánh giá bạn theo phương pháp TTA</Text>
          <View style={styles.practiceBtn}>
            <Text style={styles.practiceBtnText}>Bắt đầu ghi âm</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </View>
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

  keyPointsBox: { backgroundColor: COLORS.PRIMARY + '08', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.PRIMARY + '15' },
  kpTitle: { fontSize: 15, fontWeight: '700', color: COLORS.PRIMARY, marginBottom: 12 },
  kpRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, gap: 10 },
  kpDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.PRIMARY, marginTop: 6, flexShrink: 0 },
  kpText: { fontSize: 13, color: COLORS.TEXT, lineHeight: 20, flex: 1 },

  section: { backgroundColor: COLORS.CARD, borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  sectionHeading: { fontSize: 16, fontWeight: '700', color: COLORS.PRIMARY, marginBottom: 10 },
  sectionBody: { fontSize: 14, color: COLORS.TEXT, lineHeight: 23 },

  practiceBox: { backgroundColor: COLORS.PRIMARY, borderRadius: 16, padding: 20, alignItems: 'center', marginTop: 8 },
  practiceTitle: { fontSize: 17, fontWeight: '700', color: '#fff', marginBottom: 6 },
  practiceText: { fontSize: 13, color: 'rgba(255,255,255,0.75)', textAlign: 'center', lineHeight: 19, marginBottom: 16 },
  practiceBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.ACCENT, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 25 },
  practiceBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
