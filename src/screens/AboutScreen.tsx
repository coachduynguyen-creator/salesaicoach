import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { useColors } from '../contexts/ThemeContext';

const AUTHOR_PHOTO = require('../../assets/coach-duy.jpg');

const SOCIAL_LINKS = [
  {
    icon: 'logo-facebook' as const,
    label: 'Facebook',
    url: 'https://www.facebook.com/coachduynguyen',
    color: '#1877F2',
  },
  {
    icon: 'logo-youtube' as const,
    label: 'YouTube',
    url: 'https://www.youtube.com/coachduynguyen',
    color: '#FF0000',
  },
  {
    icon: 'logo-tiktok' as const,
    label: 'TikTok',
    url: 'https://www.tiktok.com/@coachduynguyenofficial',
    color: '#000000',
  },
];

export default function AboutScreen() {
  const C = useColors();
  const navigation = useNavigation();

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.BACKGROUND }]} edges={['top']}>
      <View style={[styles.topBar, { backgroundColor: C.CARD, borderBottomColor: C.BORDER }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={C.TEXT} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: C.TEXT }]}>Giới thiệu</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Author Hero ── */}
        <View style={styles.heroSection}>
          <View style={[styles.photoContainer, { borderColor: C.PRIMARY + '30' }]}>
            {AUTHOR_PHOTO ? (
              <Image source={AUTHOR_PHOTO} style={styles.photo} />
            ) : (
              <View style={[styles.photoPlaceholder, { backgroundColor: C.PRIMARY + '12' }]}>
                <Ionicons name="person" size={56} color={C.PRIMARY} />
              </View>
            )}
          </View>
          <Text style={[styles.authorName, { color: C.TEXT }]}>COACH DUY NGUYỄN</Text>
          <Text style={styles.authorTitle}>Sales Master Trainer & Mentor</Text>
          <Text style={styles.authorTagline}>Sáng lập phương pháp "Bán bằng Vị thế"</Text>
        </View>

        {/* ── Credentials ── */}
        <View style={[styles.card, { backgroundColor: C.CARD }]}>
          <Text style={[styles.cardTitle, { color: C.TEXT }]}>Thành tựu</Text>

          <View style={styles.credRow}>
            <View style={[styles.credIcon, { backgroundColor: '#FEF3C7' }]}>
              <Text style={{ fontSize: 16 }}>🏆</Text>
            </View>
            <View style={styles.credContent}>
              <Text style={styles.credLabel}>20 năm kinh nghiệm Bán hàng</Text>
            </View>
          </View>

          <View style={styles.credRow}>
            <View style={[styles.credIcon, { backgroundColor: '#DBEAFE' }]}>
              <Text style={{ fontSize: 16 }}>⭐</Text>
            </View>
            <View style={styles.credContent}>
              <Text style={styles.credLabel}>Top Sales trong 3 lĩnh vực</Text>
              <Text style={styles.credSub}>Đạt Top Sales chỉ trong 3 tháng</Text>
            </View>
          </View>

          <View style={styles.credRow}>
            <View style={[styles.credIcon, { backgroundColor: '#D1FAE5' }]}>
              <Text style={{ fontSize: 16 }}>🌏</Text>
            </View>
            <View style={styles.credContent}>
              <Text style={styles.credLabel}>Bán hàng tại nhiều quốc gia</Text>
            </View>
          </View>

          <View style={styles.credRow}>
            <View style={[styles.credIcon, { backgroundColor: '#EDE9FE' }]}>
              <Text style={{ fontSize: 16 }}>💡</Text>
            </View>
            <View style={styles.credContent}>
              <Text style={styles.credLabel}>Sáng lập phương pháp 3 Điểm Chạm</Text>
              <Text style={styles.credSub}>Bán hàng bằng ảnh hưởng, không dồn ép</Text>
            </View>
          </View>

          <View style={styles.credRow}>
            <View style={[styles.credIcon, { backgroundColor: '#FEE2E2' }]}>
              <Text style={{ fontSize: 16 }}>🎓</Text>
            </View>
            <View style={styles.credContent}>
              <Text style={styles.credLabel}>Đào tạo trực tiếp 5.000+ chuyên viên</Text>
              <Text style={styles.credSub}>Mobifone, ACB, Bảo Việt, AIA, Prudential, VinGroup, SunGroup,...</Text>
            </View>
          </View>
        </View>

        {/* ── Social Links ── */}
        <View style={[styles.card, { backgroundColor: C.CARD }]}>
          <Text style={[styles.cardTitle, { color: C.TEXT }]}>Kết nối</Text>

          {SOCIAL_LINKS.map(link => (
            <TouchableOpacity
              key={link.label}
              style={styles.socialRow}
              onPress={() => openLink(link.url)}
              activeOpacity={0.7}
            >
              <View style={[styles.socialIcon, { backgroundColor: link.color + '12' }]}>
                <Ionicons name={link.icon} size={20} color={link.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.socialLabel}>{link.label}</Text>
                <Text style={styles.socialHandle}>@coachduynguyen</Text>
              </View>
              <Ionicons name="open-outline" size={16} color={COLORS.TEXT_LIGHT} />
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.socialRow}
            onPress={() => openLink('mailto:coachduynguyen@gmail.com')}
            activeOpacity={0.7}
          >
            <View style={[styles.socialIcon, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="mail" size={20} color="#D97706" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.socialLabel}>Email</Text>
              <Text style={styles.socialHandle}>coachduynguyen@gmail.com</Text>
            </View>
            <Ionicons name="open-outline" size={16} color={COLORS.TEXT_LIGHT} />
          </TouchableOpacity>
        </View>

        {/* ── About App ── */}
        <View style={[styles.card, { backgroundColor: C.CARD }]}>
          <Text style={[styles.cardTitle, { color: C.TEXT }]}>Về ứng dụng</Text>
          <Text style={styles.bodyText}>
            Sales Coach App là ứng dụng đào tạo bán hàng theo phương pháp THE TRUSTED ADVISOR, được phát triển bởi Coach Duy Nguyễn.
          </Text>
          <Text style={styles.bodyText}>
            Ứng dụng tích hợp AI Coach giúp phân tích buổi tư vấn, đánh giá kỹ năng theo framework 3 Điểm Chạm, và cung cấp hệ thống đào tạo chuyên sâu giúp chuyên viên bán hàng nâng cao năng lực tư vấn.
          </Text>
        </View>

        {/* ── Copyright ── */}
        <View style={[styles.card, { backgroundColor: C.CARD }]}>
          <Text style={[styles.cardTitle, { color: C.TEXT }]}>Bản quyền</Text>
          <Text style={styles.bodyText}>
            © 2024 Coach Duy Nguyễn. Mọi quyền được bảo lưu.
          </Text>
          <Text style={styles.bodyText}>
            Toàn bộ nội dung trong ứng dụng bao gồm nhưng không giới hạn: phương pháp 3 Điểm Chạm, framework THE TRUSTED ADVISOR, tài liệu đào tạo, kịch bản mẫu, và các nội dung khác là tài sản trí tuệ thuộc sở hữu của Coach Duy Nguyễn.
          </Text>
          <Text style={styles.bodyText}>
            Nghiêm cấm sao chép, phân phối, chỉnh sửa, hoặc sử dụng cho mục đích thương mại bất kỳ nội dung nào trong ứng dụng mà không có sự đồng ý bằng văn bản của tác giả.
          </Text>
        </View>

        {/* ── Legal ── */}
        <View style={[styles.card, { backgroundColor: C.CARD }]}>
          <Text style={[styles.cardTitle, { color: C.TEXT }]}>Điều khoản pháp lý</Text>

          <Text style={styles.legalHeading}>Điều khoản sử dụng</Text>
          <Text style={styles.legalText}>
            Bằng việc sử dụng ứng dụng, bạn đồng ý tuân thủ các điều khoản sử dụng. Ứng dụng được cung cấp cho mục đích đào tạo và phát triển kỹ năng bán hàng cá nhân. Người dùng chịu trách nhiệm về cách áp dụng kiến thức vào thực tế.
          </Text>

          <Text style={styles.legalHeading}>Tuyên bố miễn trừ trách nhiệm</Text>
          <Text style={styles.legalText}>
            Nội dung trong ứng dụng mang tính chất đào tạo và tham khảo. Đây không phải tư vấn tài chính, pháp lý, hoặc chuyên môn trong bất kỳ lĩnh vực cụ thể nào. Kết quả bán hàng phụ thuộc vào nhiều yếu tố và có thể khác nhau giữa các cá nhân. Coach Duy Nguyễn và đội ngũ phát triển không chịu trách nhiệm về bất kỳ tổn thất nào phát sinh từ việc áp dụng nội dung trong ứng dụng.
          </Text>

          <Text style={styles.legalHeading}>Phân tích AI</Text>
          <Text style={styles.legalText}>
            Ứng dụng sử dụng trí tuệ nhân tạo để phân tích và đánh giá buổi tư vấn. Kết quả phân tích của AI mang tính chất gợi ý và tham khảo, không thay thế cho đánh giá chuyên môn của con người. Độ chính xác của AI có thể thay đổi tùy thuộc vào chất lượng dữ liệu đầu vào.
          </Text>

          <Text style={styles.legalHeading}>Bảo mật dữ liệu</Text>
          <Text style={styles.legalText}>
            Dữ liệu ghi âm và nội dung tư vấn của bạn được xử lý để cung cấp phân tích. Chúng tôi cam kết bảo mật thông tin cá nhân và dữ liệu kinh doanh của người dùng. Dữ liệu không được chia sẻ với bên thứ ba ngoài mục đích vận hành ứng dụng.
          </Text>

          <Text style={styles.legalHeading}>Sở hữu trí tuệ</Text>
          <Text style={styles.legalText}>
            Phương pháp 3 Điểm Chạm, framework REFLECT, và toàn bộ hệ thống đào tạo THE TRUSTED ADVISOR là sở hữu trí tuệ được bảo hộ. Vi phạm bản quyền sẽ bị xử lý theo quy định pháp luật Việt Nam và các điều ước quốc tế mà Việt Nam là thành viên.
          </Text>
        </View>

        {/* ── Version ── */}
        <View style={styles.versionBox}>
          <Text style={styles.versionText}>Sales Coach App v1.0.0</Text>
          <Text style={styles.versionText}>© 2024 Coach Duy Nguyễn</Text>
        </View>

        {/* Links */}
        <View style={[styles.card, { backgroundColor: C.CARD }]}>
          <Text style={[styles.cardTitle, { color: C.TEXT }]}>Tài liệu pháp lý</Text>
          <TouchableOpacity style={styles.socialRow} onPress={() => openLink('https://coachduynguyen-creator.github.io/salesaicoach/privacy.html')}>
            <View style={[styles.socialIcon, { backgroundColor: '#EDE9FE' }]}>
              <Ionicons name="shield-checkmark" size={20} color="#8B5CF6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.socialLabel}>Chính sách Bảo mật</Text>
            </View>
            <Ionicons name="open-outline" size={16} color={COLORS.TEXT_LIGHT} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialRow} onPress={() => openLink('https://coachduynguyen-creator.github.io/salesaicoach/terms.html')}>
            <View style={[styles.socialIcon, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="document-text" size={20} color="#3B82F6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.socialLabel}>Điều khoản Sử dụng</Text>
            </View>
            <Ionicons name="open-outline" size={16} color={COLORS.TEXT_LIGHT} />
          </TouchableOpacity>
        </View>

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
  backBtn: {
    width: 40, height: 40, alignItems: 'center', justifyContent: 'center',
    borderRadius: 20, backgroundColor: COLORS.SURFACE,
  },
  topBarTitle: { fontSize: 15, fontWeight: '600', color: COLORS.TEXT, flex: 1, textAlign: 'center' },
  scroll: { padding: 20, paddingBottom: 40 },

  // Hero
  heroSection: { alignItems: 'center', marginBottom: 24 },
  photoContainer: {
    width: 120, height: 120, borderRadius: 60, borderWidth: 3,
    overflow: 'hidden', marginBottom: 16,
  },
  photo: { width: '100%', height: '100%' },
  photoPlaceholder: {
    width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center',
  },
  authorName: {
    fontSize: 22, fontWeight: '800', color: COLORS.TEXT,
    letterSpacing: 0.5, marginBottom: 4,
  },
  authorTitle: {
    fontSize: 14, fontWeight: '600', color: COLORS.TEXT_SECONDARY, marginBottom: 4,
  },
  authorTagline: {
    fontSize: 13, color: COLORS.TEXT_LIGHT, fontStyle: 'italic',
  },

  // Card
  card: {
    backgroundColor: COLORS.CARD, borderRadius: 16, padding: 18, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  cardTitle: {
    fontSize: 16, fontWeight: '700', color: COLORS.TEXT, marginBottom: 14,
  },

  // Credentials
  credRow: {
    flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14, gap: 12,
  },
  credIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  credContent: { flex: 1, paddingTop: 2 },
  credLabel: { fontSize: 14, fontWeight: '600', color: COLORS.TEXT, lineHeight: 20 },
  credSub: { fontSize: 12, color: COLORS.TEXT_LIGHT, marginTop: 2, lineHeight: 17 },

  // Social
  socialRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.BORDER,
  },
  socialIcon: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  socialLabel: { fontSize: 14, fontWeight: '600', color: COLORS.TEXT },
  socialHandle: { fontSize: 12, color: COLORS.TEXT_LIGHT, marginTop: 1 },

  // Body text
  bodyText: {
    fontSize: 14, color: COLORS.TEXT, lineHeight: 22, marginBottom: 10,
  },

  // Legal
  legalHeading: {
    fontSize: 14, fontWeight: '700', color: COLORS.TEXT, marginTop: 12, marginBottom: 6,
  },
  legalText: {
    fontSize: 13, color: COLORS.TEXT_SECONDARY, lineHeight: 20, marginBottom: 8,
  },

  // Version
  versionBox: { alignItems: 'center', paddingVertical: 16 },
  versionText: { fontSize: 12, color: COLORS.TEXT_LIGHT, marginBottom: 2 },
});
