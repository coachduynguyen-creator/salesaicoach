import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '../contexts/ThemeContext';
import { useAlert } from '../contexts/AlertContext';
import { COLORS } from '../constants/colors';
import {
  getSubscription, startTrial, PLAN_LIMITS, PLAN_PRICES, formatPrice,
  PlanTier, SubscriptionInfo,
} from '../services/subscriptionService';

function FeatureRow({ icon, text, included }: { icon: string; text: string; included: boolean }) {
  const C = useColors();
  return (
    <View style={styles.featureRow}>
      <Ionicons
        name={(included ? 'checkmark-circle' : 'close-circle') as any}
        size={18}
        color={included ? '#10B981' : '#94A3B8'}
      />
      <Text style={[styles.featureText, { color: C.TEXT }, !included && { color: '#94A3B8', textDecorationLine: 'line-through' }]}>
        {text}
      </Text>
    </View>
  );
}

export default function PaywallScreen() {
  const C = useColors();
  const navigation = useNavigation();
  const { showAlert } = useAlert();
  const [sub, setSub] = useState<SubscriptionInfo | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'team'>('pro');

  useEffect(() => {
    getSubscription().then(setSub);
  }, []);

  const handleStartTrial = async () => {
    await startTrial();
    showAlert({
      title: 'Trial bắt đầu!',
      message: 'Bạn có 7 ngày dùng thử Pro miễn phí. Tận hưởng tất cả tính năng!',
      type: 'success',
    });
    navigation.goBack();
  };

  const handlePurchase = () => {
    showAlert({
      title: 'Thanh toán',
      message: `Tính năng thanh toán sẽ sớm được tích hợp.\n\nGói ${selectedPlan === 'pro' ? 'Pro' : 'Team'}: ${formatPrice(PLAN_PRICES[selectedPlan].monthly)}/tháng\n\nLiên hệ coachduynguyen@gmail.com để kích hoạt.`,
      type: 'info',
    });
  };

  const trialUsed = sub?.trialEndsAt !== null;
  const isPro = sub?.tier === 'pro' || sub?.tier === 'team';

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
        {sub && (
          <View style={[styles.currentPlan, { backgroundColor: C.CARD }]}>
            <Text style={[styles.currentLabel, { color: C.TEXT_LIGHT }]}>Gói hiện tại</Text>
            <Text style={[styles.currentTier, { color: C.TEXT }]}>
              {sub.tier === 'free' ? 'Free' : sub.tier === 'pro' ? 'Pro' : 'Team'}
            </Text>
            {sub.trialEndsAt && new Date(sub.trialEndsAt) > new Date() && (
              <Text style={styles.trialBadge}>
                Trial: còn {Math.ceil((new Date(sub.trialEndsAt).getTime() - Date.now()) / 86400000)} ngày
              </Text>
            )}
          </View>
        )}

        {/* Plan Toggle */}
        <View style={[styles.planToggle, { backgroundColor: C.SURFACE }]}>
          <TouchableOpacity
            style={[styles.toggleBtn, selectedPlan === 'pro' && { backgroundColor: C.PRIMARY }]}
            onPress={() => setSelectedPlan('pro')}
          >
            <Text style={[styles.toggleText, { color: C.TEXT_SECONDARY }, selectedPlan === 'pro' && { color: '#fff' }]}>Pro</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, selectedPlan === 'team' && { backgroundColor: C.PRIMARY }]}
            onPress={() => setSelectedPlan('team')}
          >
            <Text style={[styles.toggleText, { color: C.TEXT_SECONDARY }, selectedPlan === 'team' && { color: '#fff' }]}>Team</Text>
          </TouchableOpacity>
        </View>

        {/* Plan Details */}
        <View style={[styles.planCard, { backgroundColor: C.CARD }]}>
          <Text style={[styles.planName, { color: C.TEXT }]}>
            {selectedPlan === 'pro' ? 'Pro' : 'Team'}
          </Text>
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: C.PRIMARY }]}>
              {formatPrice(PLAN_PRICES[selectedPlan].monthly)}
            </Text>
            <Text style={[styles.pricePer, { color: C.TEXT_LIGHT }]}>/tháng</Text>
          </View>
          <Text style={[styles.yearlyNote, { color: C.TEXT_LIGHT }]}>
            hoặc {formatPrice(PLAN_PRICES[selectedPlan].yearly)}/năm (tiết kiệm 33%)
          </Text>

          <View style={styles.featuresSection}>
            <FeatureRow icon="radio" text="Ghi âm không giới hạn" included={true} />
            <FeatureRow icon="sparkles" text="AI Coach không giới hạn" included={true} />
            <FeatureRow icon="library" text="32 bài học đầy đủ" included={true} />
            <FeatureRow icon="share" text="Xuất báo cáo" included={true} />
            <FeatureRow icon="people" text={`Tối đa ${PLAN_LIMITS[selectedPlan].teamMembers} thành viên`} included={true} />
            <FeatureRow icon="bar-chart" text="Admin Dashboard" included={selectedPlan === 'team'} />
          </View>
        </View>

        {/* Free Plan Comparison */}
        <View style={[styles.planCard, { backgroundColor: C.CARD, opacity: 0.7 }]}>
          <Text style={[styles.planName, { color: C.TEXT_LIGHT }]}>Free (hiện tại)</Text>
          <View style={styles.featuresSection}>
            <FeatureRow icon="radio" text="3 lượt ghi âm/tháng" included={true} />
            <FeatureRow icon="sparkles" text="10 lượt AI Chat/tháng" included={true} />
            <FeatureRow icon="library" text="5 bài học mở khóa" included={true} />
            <FeatureRow icon="share" text="Xuất báo cáo" included={false} />
            <FeatureRow icon="people" text="1 người dùng" included={true} />
            <FeatureRow icon="bar-chart" text="Admin Dashboard" included={false} />
          </View>
        </View>

        {/* CTA */}
        {!trialUsed && (
          <TouchableOpacity style={[styles.trialBtn, { backgroundColor: '#10B981' }]} onPress={handleStartTrial}>
            <Ionicons name="gift" size={18} color="#fff" />
            <Text style={styles.trialBtnText}>Dùng thử Pro miễn phí 7 ngày</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={[styles.purchaseBtn, { backgroundColor: C.PRIMARY }]} onPress={handlePurchase}>
          <Text style={styles.purchaseBtnText}>
            Nâng cấp {selectedPlan === 'pro' ? 'Pro' : 'Team'}
          </Text>
        </TouchableOpacity>

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
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: COLORS.SURFACE },
  topBarTitle: { fontSize: 15, fontWeight: '600', flex: 1, textAlign: 'center' },
  scroll: { padding: 16, paddingBottom: 40 },

  hero: { borderRadius: 16, padding: 28, alignItems: 'center', marginBottom: 16 },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#fff', marginTop: 12, textAlign: 'center' },
  heroDesc: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 8, textAlign: 'center', lineHeight: 20 },

  currentPlan: { borderRadius: 12, padding: 14, marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 10 },
  currentLabel: { fontSize: 12 },
  currentTier: { fontSize: 16, fontWeight: '800' },
  trialBadge: { fontSize: 11, fontWeight: '700', color: '#10B981', backgroundColor: '#D1FAE5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginLeft: 'auto' },

  planToggle: { flexDirection: 'row', borderRadius: 10, padding: 3, marginBottom: 16 },
  toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  toggleText: { fontSize: 14, fontWeight: '700', color: COLORS.TEXT_SECONDARY },

  planCard: { borderRadius: 14, padding: 18, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  planName: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  price: { fontSize: 28, fontWeight: '900' },
  pricePer: { fontSize: 14 },
  yearlyNote: { fontSize: 11, marginTop: 4, marginBottom: 14 },

  featuresSection: { gap: 8 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureText: { fontSize: 13, color: COLORS.TEXT },

  trialBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 16, borderRadius: 14, marginBottom: 10,
  },
  trialBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  purchaseBtn: { paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  purchaseBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
