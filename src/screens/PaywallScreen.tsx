import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '../contexts/ThemeContext';
import { useAlert } from '../contexts/AlertContext';
import { COLORS } from '../constants/colors';
import {
  getSubscription, startTrial, PLAN_PRICES, PLAN_LABELS, formatPrice,
  PlanTier, SubscriptionInfo, normalizeTier,
} from '../services/subscriptionService';
import { Clipboard } from 'react-native';

// ── Constants ──

const BANK_INFO = {
  bank: 'MB Bank',
  accountNumber: '0382638993',
  accountName: 'NGUYEN VAN DUY',
  email: 'coachduynguyen@gmail.com',
  zalo: '0382638993',
};

type BillingCycle = 'monthly' | 'yearly';

interface PlanOption {
  tier: PlanTier;
  color: string;
  gradient: [string, string];
  icon: string;
  features: string[];
  highlight?: string;
}

const PLAN_OPTIONS: PlanOption[] = [
  {
    tier: 'pro',
    color: '#3B82F6',
    gradient: ['#3B82F6', '#2563EB'],
    icon: 'rocket',
    features: [
      'Ghi âm không giới hạn',
      'AI Coach không giới hạn',
      '32 bài học đầy đủ',
      'Xuất báo cáo',
      'CRM khách hàng',
    ],
  },
  {
    tier: 'bds_pro',
    color: '#8B5CF6',
    gradient: ['#8B5CF6', '#7C3AED'],
    icon: 'business',
    highlight: 'Phổ biến nhất',
    features: [
      'Tất cả tính năng Pro',
      'AI chuyên sâu BĐS',
      'Kịch bản bán BĐS',
      'Phân tích ICP khách hàng',
      'Tư vấn chiến lược BĐS',
    ],
  },
  {
    tier: 'team_s',
    color: '#10B981',
    gradient: ['#10B981', '#059669'],
    icon: 'people',
    features: [
      'Pro cho 5 thành viên',
      'Admin Dashboard',
      'Báo cáo & xếp hạng team',
      'Quản lý tiến độ đào tạo',
      '~400k/người/tháng',
    ],
  },
  {
    tier: 'team_m',
    color: '#F59E0B',
    gradient: ['#F59E0B', '#D97706'],
    icon: 'people-circle',
    features: [
      'Pro cho 10 thành viên',
      'Admin Dashboard',
      'Báo cáo & xếp hạng team',
      'Quản lý tiến độ đào tạo',
      '~350k/người/tháng',
    ],
  },
  {
    tier: 'team_l',
    color: '#EF4444',
    gradient: ['#EF4444', '#DC2626'],
    icon: 'globe',
    features: [
      'Pro cho 20 thành viên',
      'Admin Dashboard',
      'Báo cáo & xếp hạng team',
      'Quản lý tiến độ đào tạo',
      '~300k/người/tháng',
    ],
  },
];

// ── Components ──

function FeatureCheck({ text, C }: { text: string; C: any }) {
  return (
    <View style={styles.featureRow}>
      <Ionicons name="checkmark-circle" size={16} color="#10B981" />
      <Text style={[styles.featureText, { color: C.TEXT }]}>{text}</Text>
    </View>
  );
}

export default function PaywallScreen() {
  const C = useColors();
  const navigation = useNavigation();
  const { showAlert } = useAlert();
  const [sub, setSub] = useState<SubscriptionInfo | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>('bds_pro');
  const [billing, setBilling] = useState<BillingCycle>('monthly');
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    getSubscription().then(setSub);
  }, []);

  const handleStartTrial = async () => {
    try {
      await startTrial();
      showAlert({
        title: 'Trial bắt đầu!',
        message: 'Bạn có 7 ngày dùng thử Pro miễn phí. Tận hưởng tất cả tính năng!',
        type: 'success',
      });
      navigation.goBack();
    } catch (err: any) {
      showAlert({
        title: 'Lỗi',
        message: err?.message || 'Không thể kích hoạt dùng thử. Vui lòng thử lại.',
        type: 'error',
      });
    }
  };

  const selectedPrice = PLAN_PRICES[selectedPlan];
  const price = selectedPrice ? selectedPrice[billing] : 0;
  const label = PLAN_LABELS[selectedPlan] || selectedPlan;
  const savingPct = 20;

  const paymentContent = `Nâng cấp ${label} - ${billing === 'monthly' ? 'Tháng' : 'Năm'}\nSố tiền: ${formatPrice(price)}\n\nChuyển khoản:\nNgân hàng: ${BANK_INFO.bank}\nSTK: ${BANK_INFO.accountNumber}\nTên: ${BANK_INFO.accountName}\nNội dung CK: SALESCOACH ${selectedPlan.toUpperCase()} [email đăng ký]\n\nSau khi chuyển khoản, gửi ảnh xác nhận qua:\nZalo: ${BANK_INFO.zalo}\nEmail: ${BANK_INFO.email}\n\nTài khoản sẽ được kích hoạt trong vòng 30 phút.`;

  const handleCopyBank = () => {
    Clipboard.setString(BANK_INFO.accountNumber);
    showAlert({ title: 'Đã sao chép', message: `STK: ${BANK_INFO.accountNumber}`, type: 'success' });
  };

  const handleSharePayment = async () => {
    await Share.share({ message: paymentContent });
  };

  const handleContactZalo = () => {
    Linking.openURL(`https://zalo.me/${BANK_INFO.zalo}`);
  };

  const trialUsed = sub?.trialEndsAt !== null;
  const currentTier = sub ? normalizeTier(sub.tier) : 'free';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.BACKGROUND }]} edges={['top']}>
      <View style={[styles.topBar, { backgroundColor: C.CARD, borderBottomColor: C.BORDER }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: C.SURFACE }]}>
          <Ionicons name="arrow-back" size={22} color={C.TEXT} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: C.TEXT }]}>Nâng cấp</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Hero */}
        <LinearGradient colors={['#7C3AED', '#4F46E5']} style={styles.hero}>
          <Ionicons name="diamond" size={40} color="#fff" />
          <Text style={styles.heroTitle}>Mở khóa toàn bộ sức mạnh</Text>
          <Text style={styles.heroDesc}>
            Nâng cấp để sử dụng không giới hạn ghi âm, AI Coach, và tất cả 32 bài học
          </Text>
        </LinearGradient>

        {/* Current Plan */}
        {sub && currentTier !== 'free' && (
          <View style={[styles.currentPlan, { backgroundColor: C.CARD }]}>
            <Text style={[styles.currentLabel, { color: C.TEXT_LIGHT }]}>Gói hiện tại</Text>
            <Text style={[styles.currentTier, { color: C.TEXT }]}>{PLAN_LABELS[currentTier]}</Text>
            {sub.trialEndsAt && new Date(sub.trialEndsAt) > new Date() && (
              <Text style={styles.trialBadge}>
                Trial: còn {Math.ceil((new Date(sub.trialEndsAt).getTime() - Date.now()) / 86400000)} ngày
              </Text>
            )}
          </View>
        )}

        {/* Billing Toggle */}
        <View style={[styles.billingToggle, { backgroundColor: C.SURFACE }]}>
          <TouchableOpacity
            style={[styles.billingBtn, billing === 'monthly' && { backgroundColor: C.PRIMARY }]}
            onPress={() => setBilling('monthly')}
          >
            <Text style={[styles.billingText, { color: C.TEXT_SECONDARY }, billing === 'monthly' && { color: '#fff' }]}>Theo tháng</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.billingBtn, billing === 'yearly' && { backgroundColor: C.PRIMARY }]}
            onPress={() => setBilling('yearly')}
          >
            <Text style={[styles.billingText, { color: C.TEXT_SECONDARY }, billing === 'yearly' && { color: '#fff' }]}>Theo năm</Text>
            <View style={styles.saveBadge}>
              <Text style={styles.saveBadgeText}>-{savingPct}%</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Plan Cards */}
        {PLAN_OPTIONS.map(plan => {
          const planPrice = PLAN_PRICES[plan.tier];
          if (!planPrice) return null;
          const isSelected = selectedPlan === plan.tier;
          const monthlyPrice = planPrice.monthly;
          const yearlyMonthly = Math.round(planPrice.yearly / 12);

          return (
            <TouchableOpacity
              key={plan.tier}
              style={[
                styles.planCard,
                { backgroundColor: C.CARD, borderColor: isSelected ? plan.color : C.BORDER },
                isSelected && { borderWidth: 2 },
              ]}
              onPress={() => setSelectedPlan(plan.tier)}
              activeOpacity={0.7}
            >
              {plan.highlight && (
                <View style={[styles.highlightBadge, { backgroundColor: plan.color }]}>
                  <Text style={styles.highlightText}>{plan.highlight}</Text>
                </View>
              )}

              <View style={styles.planHeader}>
                <View style={[styles.planIcon, { backgroundColor: plan.color + '15' }]}>
                  <Ionicons name={plan.icon as any} size={20} color={plan.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.planName, { color: C.TEXT }]}>{PLAN_LABELS[plan.tier]}</Text>
                  <View style={styles.priceRow}>
                    <Text style={[styles.price, { color: plan.color }]}>
                      {formatPrice(billing === 'monthly' ? monthlyPrice : yearlyMonthly)}
                    </Text>
                    <Text style={[styles.pricePer, { color: C.TEXT_LIGHT }]}>/tháng</Text>
                  </View>
                  {billing === 'yearly' && (
                    <Text style={[styles.yearlyTotal, { color: C.TEXT_LIGHT }]}>
                      Thanh toán {formatPrice(planPrice.yearly)}/năm
                    </Text>
                  )}
                </View>
                <View style={[styles.radioOuter, { borderColor: isSelected ? plan.color : C.BORDER }]}>
                  {isSelected && <View style={[styles.radioInner, { backgroundColor: plan.color }]} />}
                </View>
              </View>

              {isSelected && (
                <View style={styles.featuresExpanded}>
                  {plan.features.map((f, i) => (
                    <FeatureCheck key={i} text={f} C={C} />
                  ))}
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Free comparison */}
        <View style={[styles.freeCompare, { backgroundColor: C.SURFACE }]}>
          <Text style={[styles.freeTitle, { color: C.TEXT_LIGHT }]}>Gói Free (hiện tại)</Text>
          <Text style={[styles.freeDesc, { color: C.TEXT_LIGHT }]}>
            3 ghi âm/tháng  |  10 AI chat/tháng  |  5 bài học
          </Text>
        </View>

        {/* Trial CTA */}
        {!trialUsed && (
          <TouchableOpacity style={[styles.trialBtn, { backgroundColor: '#10B981' }]} onPress={handleStartTrial}>
            <Ionicons name="gift" size={18} color="#fff" />
            <Text style={styles.trialBtnText}>Dùng thử Pro miễn phí 7 ngày</Text>
          </TouchableOpacity>
        )}

        {/* Purchase CTA */}
        <TouchableOpacity
          style={[styles.purchaseBtn, { backgroundColor: PLAN_OPTIONS.find(p => p.tier === selectedPlan)?.color || C.PRIMARY }]}
          onPress={() => setShowPayment(true)}
        >
          <Text style={styles.purchaseBtnText}>
            Nâng cấp {label} — {formatPrice(price)}/{billing === 'monthly' ? 'tháng' : 'năm'}
          </Text>
        </TouchableOpacity>

        {/* Payment Info Panel */}
        {showPayment && (
          <View style={[styles.paymentPanel, { backgroundColor: C.CARD }]}>
            <Text style={[styles.paymentTitle, { color: C.TEXT }]}>Thanh toán chuyển khoản</Text>

            <View style={[styles.bankInfo, { backgroundColor: C.SURFACE }]}>
              <View style={styles.bankRow}>
                <Text style={[styles.bankLabel, { color: C.TEXT_LIGHT }]}>Ngân hàng</Text>
                <Text style={[styles.bankValue, { color: C.TEXT }]}>{BANK_INFO.bank}</Text>
              </View>
              <View style={styles.bankRow}>
                <Text style={[styles.bankLabel, { color: C.TEXT_LIGHT }]}>Số tài khoản</Text>
                <TouchableOpacity onPress={handleCopyBank} style={styles.copyRow}>
                  <Text style={[styles.bankValueBold, { color: C.TEXT }]}>{BANK_INFO.accountNumber}</Text>
                  <Ionicons name="copy-outline" size={16} color={C.PRIMARY} />
                </TouchableOpacity>
              </View>
              <View style={styles.bankRow}>
                <Text style={[styles.bankLabel, { color: C.TEXT_LIGHT }]}>Tên TK</Text>
                <Text style={[styles.bankValue, { color: C.TEXT }]}>{BANK_INFO.accountName}</Text>
              </View>
              <View style={styles.bankRow}>
                <Text style={[styles.bankLabel, { color: C.TEXT_LIGHT }]}>Số tiền</Text>
                <Text style={[styles.bankValueBold, { color: '#10B981' }]}>{formatPrice(price)}</Text>
              </View>
              <View style={[styles.bankRow, { borderBottomWidth: 0 }]}>
                <Text style={[styles.bankLabel, { color: C.TEXT_LIGHT }]}>Nội dung CK</Text>
                <Text style={[styles.bankValueBold, { color: '#F59E0B' }]}>SALESCOACH {selectedPlan.toUpperCase()}</Text>
              </View>
            </View>

            <Text style={[styles.paymentNote, { color: C.TEXT_LIGHT }]}>
              Sau khi chuyển khoản, gửi ảnh xác nhận qua Zalo hoặc Email. Tài khoản sẽ được kích hoạt trong vòng 30 phút.
            </Text>

            <View style={styles.paymentActions}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#0068FF' }]} onPress={handleContactZalo}>
                <Ionicons name="chatbubble-ellipses" size={16} color="#fff" />
                <Text style={styles.actionBtnText}>Zalo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: C.PRIMARY }]} onPress={handleSharePayment}>
                <Ionicons name="share-outline" size={16} color="#fff" />
                <Text style={styles.actionBtnText}>Chia sẻ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#10B981' }]}
                onPress={() => Linking.openURL(`mailto:${BANK_INFO.email}?subject=Nâng cấp ${label}&body=${encodeURIComponent(paymentContent)}`)}
              >
                <Ionicons name="mail-outline" size={16} color="#fff" />
                <Text style={styles.actionBtnText}>Email</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  topBarTitle: { fontSize: 15, fontWeight: '600', flex: 1, textAlign: 'center' },
  scroll: { padding: 16, paddingBottom: 40 },

  hero: { borderRadius: 16, padding: 28, alignItems: 'center', marginBottom: 16 },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#fff', marginTop: 12, textAlign: 'center' },
  heroDesc: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 8, textAlign: 'center', lineHeight: 20 },

  currentPlan: { borderRadius: 12, padding: 14, marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 10 },
  currentLabel: { fontSize: 12 },
  currentTier: { fontSize: 16, fontWeight: '800' },
  trialBadge: { fontSize: 11, fontWeight: '700', color: '#10B981', backgroundColor: '#D1FAE5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginLeft: 'auto' },

  billingToggle: { flexDirection: 'row', borderRadius: 10, padding: 3, marginBottom: 16 },
  billingBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  billingText: { fontSize: 14, fontWeight: '700' },
  saveBadge: { backgroundColor: '#10B981', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  saveBadgeText: { fontSize: 10, fontWeight: '800', color: '#fff' },

  planCard: {
    borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  highlightBadge: { position: 'absolute', top: -10, right: 16, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  highlightText: { fontSize: 10, fontWeight: '800', color: '#fff' },
  planHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  planIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  planName: { fontSize: 15, fontWeight: '800', marginBottom: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  price: { fontSize: 20, fontWeight: '900' },
  pricePer: { fontSize: 12 },
  yearlyTotal: { fontSize: 11, marginTop: 1 },
  radioOuter: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 12, height: 12, borderRadius: 6 },

  featuresExpanded: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: COLORS.BORDER, gap: 8 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { fontSize: 13 },

  freeCompare: { borderRadius: 12, padding: 14, marginBottom: 16, alignItems: 'center' },
  freeTitle: { fontSize: 13, fontWeight: '700', marginBottom: 4 },
  freeDesc: { fontSize: 11, textAlign: 'center' },

  trialBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 16, borderRadius: 14, marginBottom: 10,
  },
  trialBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  purchaseBtn: { paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginBottom: 16 },
  purchaseBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Payment panel
  paymentPanel: {
    borderRadius: 16, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  paymentTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16, textAlign: 'center' },
  bankInfo: { borderRadius: 12, overflow: 'hidden' },
  bankRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: COLORS.BORDER },
  bankLabel: { fontSize: 12, fontWeight: '500' },
  bankValue: { fontSize: 14, fontWeight: '600' },
  bankValueBold: { fontSize: 15, fontWeight: '800' },
  copyRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  paymentNote: { fontSize: 12, textAlign: 'center', marginTop: 14, lineHeight: 18 },
  paymentActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 10 },
  actionBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
});
