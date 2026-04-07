import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { useColors } from '../contexts/ThemeContext';

export default function CommissionScreen() {
  const C = useColors();
  const navigation = useNavigation();
  const [dealValue, setDealValue] = useState('');
  const [commissionRate, setCommissionRate] = useState('2');
  const [bonusRate, setBonusRate] = useState('0');
  const [deals, setDeals] = useState<{ value: number; commission: number }[]>([]);

  const calculate = () => {
    const value = parseFloat(dealValue) || 0;
    const rate = parseFloat(commissionRate) || 2;
    const bonus = parseFloat(bonusRate) || 0;
    if (value <= 0) return;

    const commission = value * (rate / 100) + value * (bonus / 100);
    setDeals([{ value, commission }, ...deals]);
    setDealValue('');
  };

  const totalValue = deals.reduce((s, d) => s + d.value, 0);
  const totalCommission = deals.reduce((s, d) => s + d.commission, 0);

  const fmt = (n: number) => {
    if (n >= 1000) return (n / 1000).toFixed(1) + ' tỷ';
    return n.toFixed(0) + ' triệu';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.BACKGROUND }]} edges={['top']}>
      <View style={[styles.topBar, { backgroundColor: C.CARD, borderBottomColor: C.BORDER }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: C.SURFACE }]}>
          <Ionicons name="arrow-back" size={22} color={C.TEXT} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: C.TEXT }]}>Tính hoa hồng</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Summary */}
        <View style={[styles.summaryCard, { backgroundColor: C.PRIMARY }]}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Tổng deal</Text>
            <Text style={styles.summaryValue}>{deals.length}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Doanh số</Text>
            <Text style={styles.summaryValue}>{fmt(totalValue)}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Hoa hồng</Text>
            <Text style={[styles.summaryValue, { color: '#F6AD55' }]}>{fmt(totalCommission)}</Text>
          </View>
        </View>

        {/* Calculator */}
        <View style={[styles.card, { backgroundColor: C.CARD }]}>
          <Text style={[styles.cardTitle, { color: C.TEXT }]}>Thêm deal</Text>

          <Text style={[styles.label, { color: C.TEXT_SECONDARY }]}>Giá trị deal (triệu VND)</Text>
          <TextInput
            style={[styles.input, { color: C.TEXT, borderColor: C.BORDER }]}
            placeholder="VD: 3500"
            placeholderTextColor={C.TEXT_LIGHT}
            value={dealValue}
            onChangeText={setDealValue}
            keyboardType="numeric"
          />

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: C.TEXT_SECONDARY }]}>Hoa hồng (%)</Text>
              <TextInput style={[styles.input, { color: C.TEXT, borderColor: C.BORDER }]} value={commissionRate} onChangeText={setCommissionRate} keyboardType="numeric" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: C.TEXT_SECONDARY }]}>Thưởng (%)</Text>
              <TextInput style={[styles.input, { color: C.TEXT, borderColor: C.BORDER }]} value={bonusRate} onChangeText={setBonusRate} keyboardType="numeric" />
            </View>
          </View>

          <TouchableOpacity style={[styles.calcBtn, { backgroundColor: C.PRIMARY }]} onPress={calculate}>
            <Ionicons name="calculator" size={18} color="#fff" />
            <Text style={styles.calcBtnText}>Tính</Text>
          </TouchableOpacity>
        </View>

        {/* Deal List */}
        {deals.length > 0 && (
          <View style={[styles.card, { backgroundColor: C.CARD }]}>
            <Text style={[styles.cardTitle, { color: C.TEXT }]}>Danh sách deal</Text>
            {deals.map((d, i) => (
              <View key={i} style={[styles.dealRow, { borderBottomColor: C.BORDER }]}>
                <Text style={[styles.dealValue, { color: C.TEXT }]}>{fmt(d.value)}</Text>
                <Text style={[styles.dealComm, { color: '#10B981' }]}>+{fmt(d.commission)}</Text>
                <TouchableOpacity onPress={() => setDeals(deals.filter((_, j) => j !== i))}>
                  <Ionicons name="close-circle" size={18} color={COLORS.DANGER} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: COLORS.SURFACE },
  topBarTitle: { fontSize: 15, fontWeight: '600', flex: 1, textAlign: 'center' },
  scroll: { padding: 16, paddingBottom: 40 },
  summaryCard: { borderRadius: 14, padding: 18, flexDirection: 'row', marginBottom: 14 },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  summaryValue: { fontSize: 18, fontWeight: '800', color: '#fff', marginTop: 4 },
  summaryDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 4 },
  card: { borderRadius: 14, padding: 16, marginBottom: 14 },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 6, marginTop: 8 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 15 },
  calcBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, marginTop: 12 },
  calcBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  dealRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, gap: 12 },
  dealValue: { fontSize: 14, fontWeight: '600', flex: 1 },
  dealComm: { fontSize: 14, fontWeight: '800' },
});
