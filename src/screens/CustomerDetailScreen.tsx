import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Share, Modal, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { useColors } from '../contexts/ThemeContext';
import { useAlert } from '../contexts/AlertContext';
import {
  loadCustomers, updateCustomer, loadSessions, calculateLeadScore, autoUpdateEngagement,
  CustomerProfile, Session, DecisionMaker, LeadScoring, EMPTY_SCORING, addConversation,
} from '../services/storageService';
import { scoreCustomerWithAI } from '../services/aiService';

type RouteParams = { CustomerDetail: { customerId: string } };

// ─── Editable Field ─────────────────────────────────────────────────────────

function EditableField({ label, value, icon, onSave }: {
  label: string; value: string; icon: string; onSave: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const C = useColors();

  if (editing) {
    return (
      <View style={styles.fieldWrap}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            style={[styles.fieldInput, { flex: 1 }]}
            value={draft}
            onChangeText={setDraft}
            multiline
            autoFocus
          />
          <TouchableOpacity
            style={[styles.fieldSaveBtn, { backgroundColor: C.PRIMARY }]}
            onPress={() => { onSave(draft); setEditing(false); }}
          >
            <Ionicons name="checkmark" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.fieldWrap} onPress={() => { setDraft(value); setEditing(true); }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Ionicons name={icon as any} size={14} color={COLORS.TEXT_LIGHT} />
        <Text style={styles.fieldLabel}>{label}</Text>
      </View>
      {value ? (
        <Text style={styles.fieldValue}>{value}</Text>
      ) : (
        <Text style={styles.fieldEmpty}>Chưa có — nhấn để thêm</Text>
      )}
    </TouchableOpacity>
  );
}

// ─── Score Bar (1 tiêu chí) ──────────────────────────────────────────────────

function ScoreBar({ label, score, maxScore, detail, icon }: {
  label: string; score: number; maxScore: number; detail: string; icon: string;
}) {
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const color = pct >= 75 ? '#10B981' : pct >= 50 ? '#F59E0B' : pct >= 25 ? '#F97316' : '#EF4444';
  return (
    <View style={styles.scoreBarWrap}>
      <View style={styles.scoreBarHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name={icon as any} size={14} color={color} />
          <Text style={styles.scoreBarLabel}>{label}</Text>
        </View>
        <Text style={[styles.scoreBarPoints, { color }]}>{score}/{maxScore}</Text>
      </View>
      <View style={styles.scoreBarTrack}>
        <View style={[styles.scoreBarFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      {detail ? <Text style={styles.scoreBarDetail}>{detail}</Text> : null}
    </View>
  );
}

// ─── Total Score Badge ──────────────────────────────────────────────────────

function TotalScoreBadge({ score }: { score: number }) {
  const color = score >= 70 ? '#10B981' : score >= 40 ? '#F59E0B' : '#EF4444';
  const label = score >= 70 ? 'Tiềm năng cao' : score >= 40 ? 'Trung bình' : 'Cần nurturing';
  return (
    <View style={{ alignItems: 'center' }}>
      <View style={[styles.totalScoreCircle, { borderColor: color }]}>
        <Text style={[styles.totalScoreNum, { color }]}>{score}</Text>
        <Text style={styles.totalScoreMax}>/100</Text>
      </View>
      <Text style={[styles.totalScoreLabel, { color }]}>{label}</Text>
    </View>
  );
}

// ─── ICP Section ────────────────────────────────────────────────────────────

function ICPSection({ title, icon, children, color }: {
  title: string; icon: string; children: React.ReactNode; color: string;
}) {
  const [expanded, setExpanded] = useState(true);
  return (
    <View style={[styles.section, { borderLeftColor: color }]}>
      <TouchableOpacity style={styles.sectionHeader} onPress={() => setExpanded(!expanded)}>
        <Ionicons name={icon as any} size={18} color={color} />
        <Text style={[styles.sectionTitle, { color }]}>{title}</Text>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={COLORS.TEXT_LIGHT} />
      </TouchableOpacity>
      {expanded && <View style={styles.sectionBody}>{children}</View>}
    </View>
  );
}

// ─── Main Screen ────────────────────────────────────────────────────────────

export default function CustomerDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, 'CustomerDetail'>>();
  const C = useColors();
  const { showAlert } = useAlert();
  const { customerId } = route.params;

  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);
  const [newFieldKey, setNewFieldKey] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');
  const [showDMModal, setShowDMModal] = useState(false);
  const [dmName, setDmName] = useState('');
  const [dmRole, setDmRole] = useState('');
  const [dmAttitude, setDmAttitude] = useState('trung lập');

  const [isScoring, setIsScoring] = useState(false);

  const loadData = useCallback(async () => {
    const all = await loadCustomers();
    const found = all.find(c => c.id === customerId);
    if (found) {
      // Auto update engagement score
      const scoring = { ...(found.scoring || EMPTY_SCORING) };
      scoring.engagement = autoUpdateEngagement(found);
      found.scoring = scoring;
      found.leadScore = calculateLeadScore(found);
      await updateCustomer(found.id, { scoring, leadScore: found.leadScore });
      setCustomer(found);
      if (found.sessionIds?.length) {
        const allSessions = await loadSessions();
        setSessions(allSessions.filter(s => found.sessionIds.includes(s.id)));
      }
    }
  }, [customerId]);

  const runAIScoring = useCallback(async () => {
    if (!customer) return;
    setIsScoring(true);
    const summary = [
      `Tên: ${customer.name}`, customer.company ? `Công ty: ${customer.company}` : '',
      customer.needs ? `Nhu cầu: ${customer.needs}` : '', customer.budget ? `Ngân sách: ${customer.budget}` : '',
      customer.concerns ? `Lo ngại: ${customer.concerns}` : '', customer.stage ? `Giai đoạn: ${customer.stage}` : '',
      customer.decisionFactors ? `Yếu tố QĐ: ${customer.decisionFactors}` : '',
      customer.personality ? `Tính cách: ${customer.personality}` : '',
      customer.nextStep ? `Bước tiếp: ${customer.nextStep}` : '',
      customer.decisionMakers?.length ? `Người QĐ: ${customer.decisionMakers.map(d => `${d.name} (${d.role}, ${d.attitude})`).join(', ')}` : '',
      customer.icp?.painPoints ? `Nỗi đau: ${customer.icp.painPoints}` : '',
      customer.icp?.buyingTriggers ? `Trigger mua: ${customer.icp.buyingTriggers}` : '',
      `Số cuộc gọi: ${customer.sessionIds?.length || 0}`,
    ].filter(Boolean).join('\n');

    const result = await scoreCustomerWithAI(summary);
    if (result) {
      const scoring = { ...(customer.scoring || EMPTY_SCORING) };
      scoring.productFit = result.productFit;
      scoring.financialFit = result.financialFit;
      scoring.decisionMakerAccess = result.decisionMakerAccess;
      scoring.timeline = result.timeline;
      scoring.engagement = autoUpdateEngagement(customer);
      const leadScore = scoring.productFit.score + scoring.financialFit.score + scoring.decisionMakerAccess.score + scoring.timeline.score + scoring.engagement.score;
      await updateCustomer(customer.id, { scoring, leadScore, aiRecommendation: result.recommendation });
      setCustomer(prev => prev ? { ...prev, scoring, leadScore, aiRecommendation: result.recommendation } : prev);
    }
    setIsScoring(false);
  }, [customer]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const saveField = async (field: string, value: string) => {
    if (!customer) return;
    await updateCustomer(customer.id, { [field]: value } as any);
    setCustomer(prev => prev ? { ...prev, [field]: value } : prev);
  };

  const saveIcpField = async (field: string, value: string) => {
    if (!customer) return;
    const newIcp = { ...(customer.icp || {}), [field]: value };
    await updateCustomer(customer.id, { icp: newIcp });
    setCustomer(prev => prev ? { ...prev, icp: newIcp } : prev);
  };

  const saveCustomField = async () => {
    if (!customer || !newFieldKey.trim()) return;
    const newFields = { ...(customer.customFields || {}), [newFieldKey.trim()]: newFieldValue.trim() };
    await updateCustomer(customer.id, { customFields: newFields });
    setCustomer(prev => prev ? { ...prev, customFields: newFields } : prev);
    setShowAddFieldModal(false);
    setNewFieldKey('');
    setNewFieldValue('');
  };

  const addDecisionMaker = async () => {
    if (!customer || !dmName.trim()) return;
    const newDM: DecisionMaker = { name: dmName.trim(), role: dmRole.trim() || 'Không rõ', attitude: dmAttitude, notes: '' };
    const dms = [...(customer.decisionMakers || []), newDM];
    await updateCustomer(customer.id, { decisionMakers: dms });
    setCustomer(prev => prev ? { ...prev, decisionMakers: dms } : prev);
    setShowDMModal(false);
    setDmName(''); setDmRole(''); setDmAttitude('trung lập');
  };

  const handleChatWithAI = async () => {
    if (!customer) return;
    const conv = await addConversation(`Tư vấn: ${customer.name}`);
    navigation.navigate('AiCoachChat', { conversationId: conv.id, title: conv.title, customerId: customer.id });
  };

  if (!customer) return null;

  const icp = customer.icp || {};
  const scoring = customer.scoring || EMPTY_SCORING;
  const fitColor = (icp.fitLevel || '').includes('Kim') ? '#10B981'
    : (icp.fitLevel || '').includes('Vàng') ? '#F59E0B'
    : (icp.fitLevel || '').includes('Bạc') ? '#9CA3AF'
    : '#CD7F32';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.TEXT} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>{customer.name}</Text>
        <TouchableOpacity onPress={() => {
          const lines = [`👤 ${customer.name}`, customer.company ? `🏢 ${customer.company}` : '',
            `📊 Điểm: ${customer.leadScore}/100`, customer.stage ? `📍 ${customer.stage}` : '',
            customer.needs ? `🎯 ${customer.needs}` : '', customer.concerns ? `⚠️ ${customer.concerns}` : '',
            '', '— Sales Coach CRM'].filter(Boolean);
          Share.share({ message: lines.join('\n') });
        }} style={styles.topBtn}>
          <Ionicons name="share-outline" size={20} color={COLORS.TEXT} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.PRIMARY} colors={[C.PRIMARY]} />}>

        {/* Hero + Score */}
        <View style={styles.heroCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <View style={[styles.avatar, { backgroundColor: C.PRIMARY + '14' }]}>
              <Text style={[styles.avatarText, { color: C.PRIMARY }]}>{customer.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroName}>{customer.name}</Text>
              {customer.company ? <Text style={styles.heroCompany}>{customer.company}</Text> : null}
              {customer.stage ? (
                <View style={[styles.stageBadgeSmall, { backgroundColor: C.PRIMARY + '15' }]}>
                  <Text style={[styles.stageTextSmall, { color: C.PRIMARY }]}>{customer.stage}</Text>
                </View>
              ) : null}
            </View>
          </View>
          {icp.fitLevel ? (
            <View style={[styles.fitBadge, { backgroundColor: fitColor + '18' }]}>
              <Ionicons name="diamond" size={14} color={fitColor} />
              <Text style={[styles.fitText, { color: fitColor }]}>{icp.fitLevel}</Text>
            </View>
          ) : null}
        </View>

        {/* Quick Actions */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: C.PRIMARY }]}
            onPress={() => navigation.navigate('GhiAm', { customerName: customer.name, companyName: customer.company })}>
            <Ionicons name="mic" size={18} color="#fff" />
            <Text style={styles.actionBtnText}>Ghi âm</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#7C3AED' }]} onPress={handleChatWithAI}>
            <Ionicons name="chatbubbles" size={18} color="#fff" />
            <Text style={styles.actionBtnText}>Chat AI Coach</Text>
          </TouchableOpacity>
        </View>

        {/* SCORING SECTION */}
        <View style={styles.scoringCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.scoringTitle}>Điểm tiềm năng</Text>
              <Text style={styles.scoringSubtitle}>5 tiêu chí — mỗi tiêu chí tối đa 20 điểm</Text>
            </View>
            <TotalScoreBadge score={customer.leadScore || 0} />
          </View>

          <View style={{ marginTop: 16, gap: 12 }}>
            <ScoreBar label="Sản phẩm phù hợp" score={scoring.productFit.score} maxScore={20}
              detail={scoring.productFit.detail} icon="pricetag-outline" />
            <ScoreBar label="Tài chính phù hợp" score={scoring.financialFit.score} maxScore={20}
              detail={scoring.financialFit.detail} icon="wallet-outline" />
            <ScoreBar label="Gặp người QĐ" score={scoring.decisionMakerAccess.score} maxScore={20}
              detail={scoring.decisionMakerAccess.detail} icon="shield-checkmark-outline" />
            <ScoreBar label="Thời gian QĐ" score={scoring.timeline.score} maxScore={20}
              detail={scoring.timeline.detail} icon="timer-outline" />
            <ScoreBar label="Số lần tương tác" score={scoring.engagement.score} maxScore={20}
              detail={scoring.engagement.detail} icon="pulse-outline" />
          </View>

          <TouchableOpacity
            style={[styles.aiScoreBtn, { backgroundColor: C.PRIMARY }, isScoring && { opacity: 0.6 }]}
            onPress={runAIScoring}
            disabled={isScoring}
          >
            <Ionicons name="sparkles" size={16} color="#fff" />
            <Text style={styles.aiScoreBtnText}>{isScoring ? 'Đang chấm điểm...' : 'AI chấm điểm lại'}</Text>
          </TouchableOpacity>
        </View>

        {/* AI RECOMMENDATION */}
        {customer.aiRecommendation ? (
          <View style={[styles.section, { borderLeftColor: '#8B5CF6' }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="bulb" size={18} color="#8B5CF6" />
              <Text style={[styles.sectionTitle, { color: '#8B5CF6' }]}>Đề xuất AI</Text>
            </View>
            <View style={styles.sectionBody}>
              <Text style={{ fontSize: 14, color: COLORS.TEXT, lineHeight: 22 }}>{customer.aiRecommendation}</Text>
            </View>
          </View>
        ) : null}

        {/* I. Liên hệ */}
        <ICPSection title="Liên hệ" icon="call-outline" color={C.PRIMARY}>
          <EditableField label="Điện thoại" value={customer.phone} icon="call-outline" onSave={v => saveField('phone', v)} />
          <EditableField label="Email" value={customer.email} icon="mail-outline" onSave={v => saveField('email', v)} />
        </ICPSection>

        {/* II. Thông tin cốt lõi */}
        <ICPSection title="Thông tin cốt lõi" icon="flag-outline" color="#3B82F6">
          <EditableField label="Nhu cầu chính" value={customer.needs} icon="flag-outline" onSave={v => saveField('needs', v)} />
          <EditableField label="Ngân sách" value={customer.budget} icon="cash-outline" onSave={v => saveField('budget', v)} />
          <EditableField label="Lo ngại / phản đối" value={customer.concerns} icon="alert-circle-outline" onSave={v => saveField('concerns', v)} />
          <EditableField label="Yếu tố quyết định" value={customer.decisionFactors} icon="key-outline" onSave={v => saveField('decisionFactors', v)} />
          <EditableField label="Bước tiếp theo" value={customer.nextStep} icon="arrow-forward-outline" onSave={v => saveField('nextStep', v)} />
        </ICPSection>

        {/* III. Tâm lý & Động lực */}
        <ICPSection title="Tâm lý & Động lực" icon="brain-outline" color="#8B5CF6">
          <EditableField label="Nỗi đau" value={icp.painPoints || ''} icon="sad-outline" onSave={v => saveIcpField('painPoints', v)} />
          <EditableField label="Nỗi sợ sâu nhất" value={icp.deepFears || ''} icon="skull-outline" onSave={v => saveIcpField('deepFears', v)} />
          <EditableField label="Ước mơ / Khát vọng" value={icp.desires || ''} icon="star-outline" onSave={v => saveIcpField('desires', v)} />
          <EditableField label="Cảm xúc khi ra QĐ" value={icp.emotionStyle || ''} icon="heart-outline" onSave={v => saveIcpField('emotionStyle', v)} />
          <EditableField label="Phong cách QĐ" value={icp.decisionStyle || ''} icon="swap-horizontal-outline" onSave={v => saveIcpField('decisionStyle', v)} />
          <EditableField label="Tính cách giao tiếp" value={customer.personality} icon="person-outline" onSave={v => saveField('personality', v)} />
        </ICPSection>

        {/* IV. Hành vi mua hàng */}
        <ICPSection title="Hành vi mua hàng" icon="cart-outline" color="#F59E0B">
          <EditableField label="Mức nhận thức (1-5)" value={icp.awarenessLevel || ''} icon="eye-outline" onSave={v => saveIcpField('awarenessLevel', v)} />
          <EditableField label="Kênh tìm hiểu" value={icp.preferredChannels || ''} icon="globe-outline" onSave={v => saveIcpField('preferredChannels', v)} />
          <EditableField label="Người ảnh hưởng" value={icp.influencers || ''} icon="people-outline" onSave={v => saveIcpField('influencers', v)} />
          <EditableField label="Rào cản mua" value={icp.buyingBarriers || ''} icon="lock-closed-outline" onSave={v => saveIcpField('buyingBarriers', v)} />
          <EditableField label="Yếu tố kích hoạt" value={icp.buyingTriggers || ''} icon="flash-outline" onSave={v => saveIcpField('buyingTriggers', v)} />
          <EditableField label="Rủi ro sợ nhất" value={icp.biggestRisk || ''} icon="warning-outline" onSave={v => saveIcpField('biggestRisk', v)} />
        </ICPSection>

        {/* V. Tổng quan chân dung */}
        <ICPSection title="Tổng quan chân dung" icon="id-card-outline" color="#10B981">
          <EditableField label="Vai trò / Nghề nghiệp" value={icp.role || ''} icon="briefcase-outline" onSave={v => saveIcpField('role', v)} />
          <EditableField label="Điều muốn làm tốt hơn" value={icp.functionalJob || ''} icon="rocket-outline" onSave={v => saveIcpField('functionalJob', v)} />
          <EditableField label="Phân loại (Kim Cương/Vàng/Bạc/Đồng)" value={icp.fitLevel || ''} icon="diamond-outline" onSave={v => saveIcpField('fitLevel', v)} />
        </ICPSection>

        {/* VI. Người ra quyết định */}
        <ICPSection title="Người ra quyết định" icon="shield-checkmark-outline" color="#EF4444">
          {(customer.decisionMakers || []).map((dm, i) => (
            <View key={i} style={styles.dmCard}>
              <Text style={styles.dmName}>{dm.name}</Text>
              <Text style={styles.dmDetail}>{dm.role} — {dm.attitude}</Text>
              {dm.notes ? <Text style={styles.dmNotes}>{dm.notes}</Text> : null}
            </View>
          ))}
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowDMModal(true)}>
            <Ionicons name="add-circle-outline" size={18} color={C.PRIMARY} />
            <Text style={[styles.addBtnText, { color: C.PRIMARY }]}>Thêm người QĐ</Text>
          </TouchableOpacity>
        </ICPSection>

        {/* VII. Tiêu chí tự thêm */}
        <ICPSection title="Tiêu chí khác" icon="create-outline" color="#6B7280">
          {Object.entries(customer.customFields || {}).map(([key, val]) => (
            <EditableField key={key} label={key} value={val} icon="document-text-outline"
              onSave={v => {
                const newFields = { ...(customer.customFields || {}), [key]: v };
                updateCustomer(customer.id, { customFields: newFields });
                setCustomer(prev => prev ? { ...prev, customFields: newFields } : prev);
              }} />
          ))}
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddFieldModal(true)}>
            <Ionicons name="add-circle-outline" size={18} color={C.PRIMARY} />
            <Text style={[styles.addBtnText, { color: C.PRIMARY }]}>Thêm tiêu chí mới</Text>
          </TouchableOpacity>
        </ICPSection>

        {/* VIII. Ghi chú lịch sử */}
        <ICPSection title={`Ghi chú (${customer.notes?.length || 0})`} icon="document-text-outline" color="#6366F1">
          {(customer.notes || []).map((note, i) => (
            <View key={i} style={styles.noteItem}>
              <Text style={styles.noteDate}>{note.date}</Text>
              <Text style={styles.noteContent}>{note.content}</Text>
            </View>
          ))}
          {(!customer.notes || customer.notes.length === 0) && (
            <Text style={styles.fieldEmpty}>Ghi âm cuộc gọi để tạo ghi chú tự động</Text>
          )}
        </ICPSection>

        {/* IX. Cuộc gọi */}
        {sessions.length > 0 && (
          <ICPSection title={`Cuộc gọi (${sessions.length})`} icon="call-outline" color="#0EA5E9">
            {sessions.map(s => (
              <TouchableOpacity key={s.id} style={styles.sessionRow}
                onPress={() => navigation.navigate('SessionDetail', { session: s })}>
                <View style={[styles.sessionDot, { backgroundColor: s.score >= 7 ? '#10B981' : s.score >= 5 ? '#F59E0B' : '#EF4444' }]} />
                <Text style={styles.sessionDate}>{s.date} — {s.score.toFixed(1)}/10</Text>
                <Ionicons name="chevron-forward" size={14} color={COLORS.TEXT_LIGHT} />
              </TouchableOpacity>
            ))}
          </ICPSection>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Add Custom Field Modal */}
      <Modal visible={showAddFieldModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thêm tiêu chí mới</Text>
            <TextInput style={styles.modalInput} placeholder="Tên tiêu chí (VD: Sở thích, Kênh liên hệ...)"
              placeholderTextColor={COLORS.TEXT_LIGHT} value={newFieldKey} onChangeText={setNewFieldKey} autoFocus />
            <TextInput style={styles.modalInput} placeholder="Giá trị"
              placeholderTextColor={COLORS.TEXT_LIGHT} value={newFieldValue} onChangeText={setNewFieldValue} multiline />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowAddFieldModal(false)}>
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalSaveBtn, { backgroundColor: C.PRIMARY }]} onPress={saveCustomField}>
                <Text style={styles.modalSaveText}>Thêm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Decision Maker Modal */}
      <Modal visible={showDMModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thêm người ra quyết định</Text>
            <TextInput style={styles.modalInput} placeholder="Tên" placeholderTextColor={COLORS.TEXT_LIGHT}
              value={dmName} onChangeText={setDmName} autoFocus />
            <TextInput style={styles.modalInput} placeholder="Vai trò (VD: CEO, Giám đốc, Vợ/Chồng...)"
              placeholderTextColor={COLORS.TEXT_LIGHT} value={dmRole} onChangeText={setDmRole} />
            <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.TEXT_SECONDARY, marginBottom: 8 }}>Thái độ:</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
              {['ủng hộ', 'trung lập', 'phản đối'].map(att => (
                <TouchableOpacity key={att}
                  style={[styles.attBtn, dmAttitude === att && { backgroundColor: C.PRIMARY, borderColor: C.PRIMARY }]}
                  onPress={() => setDmAttitude(att)}>
                  <Text style={[styles.attBtnText, dmAttitude === att && { color: '#fff' }]}>{att}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowDMModal(false)}>
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalSaveBtn, { backgroundColor: C.PRIMARY }]} onPress={addDecisionMaker}>
                <Text style={styles.modalSaveText}>Thêm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: COLORS.CARD, borderBottomWidth: 1, borderBottomColor: COLORS.BORDER },
  topBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.BACKGROUND, alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { fontSize: 16, fontWeight: '700', color: COLORS.TEXT, flex: 1, textAlign: 'center' },
  scroll: { padding: 16, paddingBottom: 40 },
  // Scoring
  scoringCard: { backgroundColor: COLORS.CARD, borderRadius: 16, padding: 18, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  scoringTitle: { fontSize: 17, fontWeight: '800', color: COLORS.TEXT },
  scoringSubtitle: { fontSize: 12, color: COLORS.TEXT_LIGHT, marginTop: 2 },
  scoreBarWrap: { gap: 4 },
  scoreBarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scoreBarLabel: { fontSize: 13, fontWeight: '600', color: COLORS.TEXT },
  scoreBarPoints: { fontSize: 13, fontWeight: '800' },
  scoreBarTrack: { height: 6, backgroundColor: COLORS.BORDER, borderRadius: 3, overflow: 'hidden' },
  scoreBarFill: { height: 6, borderRadius: 3 },
  scoreBarDetail: { fontSize: 11, color: COLORS.TEXT_LIGHT, fontStyle: 'italic' },
  totalScoreCircle: { width: 64, height: 64, borderRadius: 32, borderWidth: 4, alignItems: 'center', justifyContent: 'center' },
  totalScoreNum: { fontSize: 20, fontWeight: '800' },
  totalScoreMax: { fontSize: 10, color: COLORS.TEXT_LIGHT },
  totalScoreLabel: { fontSize: 11, fontWeight: '700', marginTop: 4 },
  aiScoreBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16, paddingVertical: 12, borderRadius: 10 },
  aiScoreBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  // Hero
  heroCard: { backgroundColor: COLORS.CARD, borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 22, fontWeight: '800' },
  heroName: { fontSize: 18, fontWeight: '800', color: COLORS.TEXT },
  heroCompany: { fontSize: 13, color: COLORS.TEXT_LIGHT, marginTop: 1 },
  stageBadgeSmall: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, marginTop: 4 },
  stageTextSmall: { fontSize: 11, fontWeight: '700' },
  fitBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginTop: 10 },
  fitText: { fontSize: 12, fontWeight: '700' },
  // Actions
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14 },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  // ICP Section
  section: { backgroundColor: COLORS.CARD, borderRadius: 14, marginBottom: 10, borderLeftWidth: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14 },
  sectionTitle: { fontSize: 14, fontWeight: '700', flex: 1 },
  sectionBody: { paddingHorizontal: 14, paddingBottom: 14 },
  // Editable field
  fieldWrap: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.BORDER + '40' },
  fieldLabel: { fontSize: 11, fontWeight: '600', color: COLORS.TEXT_LIGHT, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 3 },
  fieldValue: { fontSize: 14, color: COLORS.TEXT, lineHeight: 20 },
  fieldEmpty: { fontSize: 13, color: COLORS.TEXT_LIGHT, fontStyle: 'italic' },
  fieldInput: { backgroundColor: COLORS.BACKGROUND, borderRadius: 8, padding: 10, fontSize: 14, color: COLORS.TEXT, borderWidth: 1, borderColor: COLORS.BORDER, minHeight: 40 },
  fieldSaveBtn: { width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  // Decision maker
  dmCard: { backgroundColor: COLORS.BACKGROUND, borderRadius: 10, padding: 12, marginBottom: 8 },
  dmName: { fontSize: 14, fontWeight: '700', color: COLORS.TEXT },
  dmDetail: { fontSize: 12, color: COLORS.TEXT_LIGHT, marginTop: 2 },
  dmNotes: { fontSize: 12, color: COLORS.TEXT_SECONDARY, marginTop: 4, fontStyle: 'italic' },
  // Add button
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10 },
  addBtnText: { fontSize: 13, fontWeight: '600' },
  // Notes
  noteItem: { borderLeftWidth: 3, borderLeftColor: COLORS.PRIMARY, paddingLeft: 12, paddingVertical: 8, marginBottom: 8 },
  noteDate: { fontSize: 11, fontWeight: '600', color: COLORS.TEXT_LIGHT },
  noteContent: { fontSize: 13, color: COLORS.TEXT, lineHeight: 19, marginTop: 2 },
  // Session
  sessionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.BORDER },
  sessionDot: { width: 8, height: 8, borderRadius: 4 },
  sessionDate: { fontSize: 13, color: COLORS.TEXT, fontWeight: '500', flex: 1 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { backgroundColor: COLORS.CARD, borderRadius: 16, padding: 24, width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.TEXT, marginBottom: 16 },
  modalInput: { backgroundColor: COLORS.BACKGROUND, borderRadius: 10, padding: 14, fontSize: 15, color: COLORS.TEXT, marginBottom: 12, borderWidth: 1, borderColor: COLORS.BORDER },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalCancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, borderWidth: 1, borderColor: COLORS.BORDER, alignItems: 'center' },
  modalCancelText: { fontSize: 15, fontWeight: '600', color: COLORS.TEXT_LIGHT },
  modalSaveBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  modalSaveText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  attBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: COLORS.BORDER, alignItems: 'center' },
  attBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.TEXT_SECONDARY },
});
