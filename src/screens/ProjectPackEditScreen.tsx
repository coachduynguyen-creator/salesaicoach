import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  Switch, ActivityIndicator, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useColors } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../contexts/AlertContext';
import {
  createPack, updatePack, loadMyPacks, ProjectPackData, packDataToContext,
} from '../services/projectPackService';
import { supabase } from '../services/supabaseClient';

// ── Helper components (outside to avoid keyboard dismiss) ──
function Field({ label, value, onChangeText, placeholder, multiline, keyboardType, C }: any) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ fontSize: 12, fontWeight: '600', color: C.TEXT_SECONDARY, marginBottom: 6 }}>{label}</Text>
      <TextInput
        style={{
          backgroundColor: C.SURFACE, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
          fontSize: 14, color: C.TEXT, borderWidth: 1, borderColor: C.BORDER,
          minHeight: multiline ? 80 : 44, textAlignVertical: multiline ? 'top' : 'center',
        }}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.TEXT_LIGHT}
        multiline={multiline}
        keyboardType={keyboardType || 'default'}
      />
    </View>
  );
}

function Section({ title, icon, color, children }: any) {
  const C = useColors();
  return (
    <View style={{ backgroundColor: C.CARD, borderRadius: 14, padding: 16, marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: color + '15', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={icon} size={16} color={color} />
        </View>
        <Text style={{ fontSize: 15, fontWeight: '700', color: C.TEXT }}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

export default function ProjectPackEditScreen() {
  const C = useColors();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { profile } = useAuth();
  const { showAlert } = useAlert();
  const packId: string | undefined = route.params?.packId;
  const isEdit = !!packId;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  // Pack state
  const [name, setName] = useState('');
  const [teamShared, setTeamShared] = useState(false);

  // Project (core)
  const [projName, setProjName] = useState('');
  const [developer, setDeveloper] = useState('');
  const [area, setArea] = useState('');
  const [locationDetail, setLocationDetail] = useState('');
  const [segment, setSegment] = useState('');
  const [productTypes, setProductTypes] = useState('');
  const [priceRange, setPriceRange] = useState('');

  // Project (extended)
  const [projSize, setProjSize] = useState('');
  const [launchDate, setLaunchDate] = useState('');
  const [constructionStart, setConstructionStart] = useState('');
  const [totalInvestment, setTotalInvestment] = useState('');
  const [unitsTotal, setUnitsTotal] = useState('');
  const [zonesCount, setZonesCount] = useState('');
  const [phase1Name, setPhase1Name] = useState('');
  const [phase1Size, setPhase1Size] = useState('');
  const [phase1Units, setPhase1Units] = useState('');
  const [viewLandmark, setViewLandmark] = useState('');
  const [landmark, setLandmark] = useState('');
  const [landmarkSize, setLandmarkSize] = useState('');
  const [geoFeature, setGeoFeature] = useState('');
  const [gpmbPercent, setGpmbPercent] = useState('');
  const [uspMain, setUspMain] = useState('');
  const [population, setPopulation] = useState('');
  const [historicalRef, setHistoricalRef] = useState('');
  const [oldSize, setOldSize] = useState('');
  const [shophouseSize, setShophouseSize] = useState('');
  const [villaSize, setVillaSize] = useState('');

  // Pricing
  const [priceAptFrom, setPriceAptFrom] = useState('');
  const [priceVillaFrom, setPriceVillaFrom] = useState('');
  const [villaMinArea, setVillaMinArea] = useState('');
  const [villaMinPrice, setVillaMinPrice] = useState('');

  // Financing
  const [finPolicy, setFinPolicy] = useState('');
  const [finRateFree, setFinRateFree] = useState('');
  const [finLoanRatio, setFinLoanRatio] = useState('');
  const [finScheduleEnd, setFinScheduleEnd] = useState('');
  const [finDepositReserve, setFinDepositReserve] = useState('');

  // Legal
  const [legalApprovalDoc, setLegalApprovalDoc] = useState('');
  const [legalApprovalAuth, setLegalApprovalAuth] = useState('');

  // Infrastructure
  const [infCompleted, setInfCompleted] = useState('');
  const [infCurrentAccess, setInfCurrentAccess] = useState('');
  const [infNewProject, setInfNewProject] = useState('');
  const [infNewStart, setInfNewStart] = useState('');
  const [infNewTravelTime, setInfNewTravelTime] = useState('');

  // Area info
  const [areaEntertainment, setAreaEntertainment] = useState('');
  const [areaIntlTourism, setAreaIntlTourism] = useState('');
  const [areaTourismStats, setAreaTourismStats] = useState('');

  // Competitor
  const [competitorLocation, setCompetitorLocation] = useState('');
  const [competitorNearestCity, setCompetitorNearestCity] = useState('');
  const [competitorsList, setCompetitorsList] = useState('');

  // Market
  const [dataSource, setDataSource] = useState('');
  const [growthRate, setGrowthRate] = useState('');
  const [growthPeriod, setGrowthPeriod] = useState('');
  const [bankRate, setBankRate] = useState('');

  // Comparables (3 slots)
  const [comp1Name, setComp1Name] = useState('');
  const [comp1Note, setComp1Note] = useState('');
  const [comp2Name, setComp2Name] = useState('');
  const [comp2Note, setComp2Note] = useState('');
  const [comp3Name, setComp3Name] = useState('');
  const [comp3Note, setComp3Note] = useState('');

  // Rental / Fees / USP
  const [rentalRange, setRentalRange] = useState('');
  const [tenantProfile, setTenantProfile] = useState('');
  const [serviceAnnual, setServiceAnnual] = useState('');
  const [serviceNote, setServiceNote] = useState('');
  const [uspText, setUspText] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!packId) { setLoading(false); return; }
    (async () => {
      try {
        const packs = await loadMyPacks();
        const p = packs.find(x => x.id === packId);
        if (!p) {
          showAlert({ title: 'Không tìm thấy', message: 'Pack không tồn tại', type: 'error' });
          navigation.goBack();
          return;
        }
        setName(p.name);
        setTeamShared(p.is_team_shared);
        const d = p.data || {};
        setProjName(d.project?.name || '');
        setDeveloper(d.project?.developer || '');
        setArea(d.project?.area || '');
        setLocationDetail(d.project?.location_detail || '');
        setSegment(d.project?.segment || '');
        setProductTypes((d.project?.product_types || []).join(', '));
        setPriceRange(d.project?.price_range || '');
        // Extended project
        setProjSize(d.project?.size || '');
        setLaunchDate(d.project?.launch_date || '');
        setConstructionStart(d.project?.construction_start_date || '');
        setTotalInvestment(d.project?.total_investment || '');
        setUnitsTotal(d.project?.units_total || '');
        setZonesCount(d.project?.zones_count || '');
        setPhase1Name(d.project?.phase1_name || '');
        setPhase1Size(d.project?.phase1_size || '');
        setPhase1Units(d.project?.phase1_units || '');
        setViewLandmark(d.project?.view_landmark || '');
        setLandmark(d.project?.landmark || '');
        setLandmarkSize(d.project?.landmark_size || '');
        setGeoFeature(d.project?.geographic_feature || '');
        setGpmbPercent(d.project?.gpmb_percent || '');
        setUspMain(d.project?.usp_main || '');
        setPopulation(d.project?.population || '');
        setHistoricalRef(d.project?.historical_reference || '');
        setOldSize(d.project?.old_size || '');
        setShophouseSize(d.project?.product_shophouse_size || '');
        setVillaSize(d.project?.product_villa_size || '');
        // Pricing
        setPriceAptFrom(d.pricing?.apartment_from || '');
        setPriceVillaFrom(d.pricing?.villa_from || '');
        setVillaMinArea(d.pricing?.villa_min_area || '');
        setVillaMinPrice(d.pricing?.villa_min_price || '');
        // Financing
        setFinPolicy(d.financing?.current_policy || '');
        setFinRateFree(d.financing?.rate_free_period || '');
        setFinLoanRatio(d.financing?.loan_ratio || '');
        setFinScheduleEnd(d.financing?.schedule_end || '');
        setFinDepositReserve(d.financing?.deposit_reserve || '');
        // Legal
        setLegalApprovalDoc(d.legal?.approval_doc || '');
        setLegalApprovalAuth(d.legal?.approval_authority || '');
        // Infrastructure
        setInfCompleted(d.infrastructure?.completed_list || '');
        setInfCurrentAccess(d.infrastructure?.current_access || '');
        setInfNewProject(d.infrastructure?.new_project || '');
        setInfNewStart(d.infrastructure?.new_start_date || '');
        setInfNewTravelTime(d.infrastructure?.new_travel_time || '');
        // Area
        setAreaEntertainment(d.area?.entertainment || '');
        setAreaIntlTourism(d.area?.international_tourism || '');
        setAreaTourismStats(d.area?.tourism_stats || '');
        // Competitor
        setCompetitorLocation(d.competitor?.location || '');
        setCompetitorNearestCity(d.competitor?.nearest_city || '');
        setCompetitorsList(d.competitors?.list || '');

        setDataSource(d.market?.data_source || '');
        setGrowthRate(d.market?.growth_rate || '');
        setGrowthPeriod(d.market?.growth_period || '');
        setBankRate(d.market?.bank_rate || '');
        const c = d.comparables || [];
        setComp1Name(c[0]?.name || ''); setComp1Note(c[0]?.note || '');
        setComp2Name(c[1]?.name || ''); setComp2Note(c[1]?.note || '');
        setComp3Name(c[2]?.name || ''); setComp3Note(c[2]?.note || '');
        setRentalRange(d.rental?.range || '');
        setTenantProfile(d.rental?.tenant_profile || '');
        setServiceAnnual(d.fees?.service_annual || '');
        setServiceNote(d.fees?.service_note || '');
        setUspText((d.unique_selling_points || []).join('\n'));
        setNotes(d.notes || '');
      } catch (err: any) {
        showAlert({ title: 'Lỗi', message: err.message, type: 'error' });
      } finally {
        setLoading(false);
      }
    })();
  }, [packId]);

  const buildData = (): ProjectPackData => ({
    project: {
      name: projName.trim(),
      developer: developer.trim(),
      area: area.trim(),
      location_detail: locationDetail.trim(),
      segment: segment.trim(),
      product_types: productTypes.split(',').map(s => s.trim()).filter(Boolean),
      price_range: priceRange.trim(),
      size: projSize.trim(),
      launch_date: launchDate.trim(),
      construction_start_date: constructionStart.trim(),
      total_investment: totalInvestment.trim(),
      units_total: unitsTotal.trim(),
      zones_count: zonesCount.trim(),
      phase1_name: phase1Name.trim(),
      phase1_size: phase1Size.trim(),
      phase1_units: phase1Units.trim(),
      view_landmark: viewLandmark.trim(),
      landmark: landmark.trim(),
      landmark_size: landmarkSize.trim(),
      geographic_feature: geoFeature.trim(),
      gpmb_percent: gpmbPercent.trim(),
      usp_main: uspMain.trim(),
      population: population.trim(),
      historical_reference: historicalRef.trim(),
      old_size: oldSize.trim(),
      product_shophouse_size: shophouseSize.trim(),
      product_villa_size: villaSize.trim(),
    },
    pricing: {
      apartment_from: priceAptFrom.trim(),
      villa_from: priceVillaFrom.trim(),
      villa_min_area: villaMinArea.trim(),
      villa_min_price: villaMinPrice.trim(),
    },
    financing: {
      current_policy: finPolicy.trim(),
      rate_free_period: finRateFree.trim(),
      loan_ratio: finLoanRatio.trim(),
      schedule_end: finScheduleEnd.trim(),
      deposit_reserve: finDepositReserve.trim(),
    },
    legal: {
      approval_doc: legalApprovalDoc.trim(),
      approval_authority: legalApprovalAuth.trim(),
    },
    infrastructure: {
      completed_list: infCompleted.trim(),
      current_access: infCurrentAccess.trim(),
      new_project: infNewProject.trim(),
      new_start_date: infNewStart.trim(),
      new_travel_time: infNewTravelTime.trim(),
    },
    area: {
      entertainment: areaEntertainment.trim(),
      international_tourism: areaIntlTourism.trim(),
      tourism_stats: areaTourismStats.trim(),
    },
    competitor: {
      location: competitorLocation.trim(),
      nearest_city: competitorNearestCity.trim(),
    },
    competitors: {
      list: competitorsList.trim(),
    },
    market: {
      data_source: dataSource.trim(),
      growth_rate: growthRate.trim(),
      growth_period: growthPeriod.trim(),
      bank_rate: bankRate.trim(),
    },
    comparables: [
      comp1Name && { name: comp1Name.trim(), note: comp1Note.trim() },
      comp2Name && { name: comp2Name.trim(), note: comp2Note.trim() },
      comp3Name && { name: comp3Name.trim(), note: comp3Note.trim() },
    ].filter(Boolean) as any,
    rental: {
      range: rentalRange.trim(),
      tenant_profile: tenantProfile.trim(),
    },
    fees: {
      service_annual: serviceAnnual.trim(),
      service_note: serviceNote.trim(),
    },
    unique_selling_points: uspText.split('\n').map(s => s.trim()).filter(Boolean),
    notes: notes.trim(),
  });

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      showAlert({ title: 'Thiếu tên', message: 'Vui lòng nhập tên pack.', type: 'warning' });
      return;
    }
    if (!profile?.id) {
      showAlert({ title: 'Lỗi', message: 'Chưa đăng nhập.', type: 'error' });
      return;
    }
    setSaving(true);
    try {
      const data = buildData();
      if (isEdit && packId) {
        await updatePack(packId, { name: name.trim(), data, is_team_shared: teamShared });
      } else {
        // Get team_id if team shared
        let teamId: string | null = null;
        if (teamShared && profile.team_id) teamId = profile.team_id;
        const newPack = await createPack(profile.id, name.trim(), data, { teamShared, teamId });
        // Auto-activate when creating new
        await supabase.from('profiles').update({ active_pack_id: newPack.id }).eq('id', profile.id);
      }
      showAlert({ title: 'Đã lưu', message: 'Project pack đã được lưu.', type: 'success' });
      navigation.goBack();
    } catch (err: any) {
      showAlert({ title: 'Lỗi lưu', message: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  }, [name, teamShared, isEdit, packId, profile, showAlert, navigation,
    projName, developer, area, locationDetail, segment, productTypes, priceRange,
    projSize, launchDate, constructionStart, totalInvestment, unitsTotal, zonesCount,
    phase1Name, phase1Size, phase1Units, viewLandmark, landmark, landmarkSize,
    geoFeature, gpmbPercent, uspMain, population, historicalRef, oldSize, shophouseSize, villaSize,
    priceAptFrom, priceVillaFrom, villaMinArea, villaMinPrice,
    finPolicy, finRateFree, finLoanRatio, finScheduleEnd, finDepositReserve,
    legalApprovalDoc, legalApprovalAuth,
    infCompleted, infCurrentAccess, infNewProject, infNewStart, infNewTravelTime,
    areaEntertainment, areaIntlTourism, areaTourismStats,
    competitorLocation, competitorNearestCity, competitorsList,
    dataSource, growthRate, growthPeriod, bankRate,
    comp1Name, comp1Note, comp2Name, comp2Note, comp3Name, comp3Note,
    rentalRange, tenantProfile, serviceAnnual, serviceNote, uspText, notes]);

  // Preview context AI — chỉ tính lại khi state thay đổi, không phải mỗi keystroke nested re-render
  const previewText = useMemo(() => {
    try {
      return packDataToContext(buildData(), name || '(pack mới)').trim();
    } catch {
      return '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    name, projName, developer, area, locationDetail, segment, productTypes, priceRange,
    projSize, launchDate, constructionStart, totalInvestment, unitsTotal, zonesCount,
    phase1Name, phase1Size, phase1Units, viewLandmark, landmark, landmarkSize,
    geoFeature, gpmbPercent, uspMain, population, historicalRef, oldSize, shophouseSize, villaSize,
    priceAptFrom, priceVillaFrom, villaMinArea, villaMinPrice,
    finPolicy, finRateFree, finLoanRatio, finScheduleEnd, finDepositReserve,
    legalApprovalDoc, legalApprovalAuth,
    infCompleted, infCurrentAccess, infNewProject, infNewStart, infNewTravelTime,
    areaEntertainment, areaIntlTourism, areaTourismStats,
    competitorLocation, competitorNearestCity, competitorsList,
    dataSource, growthRate, growthPeriod, bankRate,
    comp1Name, comp1Note, comp2Name, comp2Note, comp3Name, comp3Note,
    rentalRange, tenantProfile, serviceAnnual, serviceNote, uspText, notes,
  ]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.BACKGROUND }} edges={['top']}>
        <ActivityIndicator size="large" color={C.PRIMARY} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.BACKGROUND }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: C.CARD, borderBottomWidth: 1, borderBottomColor: C.BORDER }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: C.SURFACE }}>
          <Ionicons name="arrow-back" size={22} color={C.TEXT} />
        </TouchableOpacity>
        <Text style={{ fontSize: 17, fontWeight: '700', color: C.TEXT, flex: 1, textAlign: 'center' }}>
          {isEdit ? 'Sửa Pack' : 'Pack mới'}
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: C.PRIMARY }}
          disabled={saving}
        >
          {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700' }}>Lưu</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        {/* Pack Name */}
        <Section title="Tên pack" icon="bookmark" color="#4F46E5">
          <Field label="Tên hiển thị" value={name} onChangeText={setName} placeholder="VD: Vinhomes Hạ Long Xanh - dự án tôi làm" C={C} />
          {profile?.team_id && (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: C.TEXT }}>Chia sẻ với team</Text>
              <Switch value={teamShared} onValueChange={setTeamShared} trackColor={{ true: C.PRIMARY }} />
            </View>
          )}
        </Section>

        {/* Project */}
        <Section title="Thông tin dự án" icon="business" color="#3B82F6">
          <Field label="Tên dự án" value={projName} onChangeText={setProjName} placeholder="Vinhomes Hạ Long Xanh" C={C} />
          <Field label="Chủ đầu tư" value={developer} onChangeText={setDeveloper} placeholder="Vinhomes" C={C} />
          <Field label="Khu vực" value={area} onChangeText={setArea} placeholder="Quảng Ninh" C={C} />
          <Field label="Chi tiết địa điểm" value={locationDetail} onChangeText={setLocationDetail} placeholder="Vịnh Hạ Long" C={C} />
          <Field label="Phân khúc" value={segment} onChangeText={setSegment} placeholder="BĐS ven biển cao cấp" C={C} />
          <Field label="Loại sản phẩm (cách nhau dấu phẩy)" value={productTypes} onChangeText={setProductTypes} placeholder="shophouse, biệt thự, liền kề" C={C} />
          <Field label="Khoảng giá" value={priceRange} onChangeText={setPriceRange} placeholder="25-50 triệu/m²" C={C} />
        </Section>

        {/* Project extended */}
        <Section title="Quy mô & Giai đoạn (mở rộng)" icon="layers" color="#0EA5E9">
          <Field label="Quy mô tổng" value={projSize} onChangeText={setProjSize} placeholder="4.100 ha" C={C} />
          <Field label="Tổng vốn đầu tư" value={totalInvestment} onChangeText={setTotalInvestment} placeholder="10 tỷ USD" C={C} />
          <Field label="Tổng số sản phẩm" value={unitsTotal} onChangeText={setUnitsTotal} placeholder="100.000 sản phẩm" C={C} />
          <Field label="Số phân khu" value={zonesCount} onChangeText={setZonesCount} placeholder="12 phân khu" C={C} />
          <Field label="Mở bán dự kiến" value={launchDate} onChangeText={setLaunchDate} placeholder="Q2/2025" C={C} />
          <Field label="Ngày khởi công" value={constructionStart} onChangeText={setConstructionStart} placeholder="10/2024" C={C} />
          <Field label="Tên giai đoạn 1" value={phase1Name} onChangeText={setPhase1Name} placeholder="Global Gate" C={C} />
          <Field label="Quy mô giai đoạn 1" value={phase1Size} onChangeText={setPhase1Size} placeholder="326 ha" C={C} />
          <Field label="Số SP giai đoạn 1" value={phase1Units} onChangeText={setPhase1Units} placeholder="4.500 sản phẩm" C={C} />
          <Field label="View/Landmark hướng tới" value={viewLandmark} onChangeText={setViewLandmark} placeholder="Vịnh Hạ Long" C={C} />
          <Field label="Landmark trong dự án" value={landmark} onChangeText={setLandmark} placeholder="Quảng trường biển" C={C} />
          <Field label="Quy mô landmark" value={landmarkSize} onChangeText={setLandmarkSize} placeholder="18 ha" C={C} />
          <Field label="Đặc điểm địa lý" value={geoFeature} onChangeText={setGeoFeature} placeholder="Lấn biển kết hợp đất liền" C={C} />
          <Field label="GPMB (%)" value={gpmbPercent} onChangeText={setGpmbPercent} placeholder="75%" C={C} />
          <Field label="USP chính" value={uspMain} onChangeText={setUspMain} placeholder="Đô thị biển tích hợp" multiline C={C} />
          <Field label="Dân số dự kiến" value={population} onChangeText={setPopulation} placeholder="300.000 người" C={C} />
          <Field label="Tham chiếu lịch sử (so sánh)" value={historicalRef} onChangeText={setHistoricalRef} placeholder="Ocean Park 2019" C={C} />
          <Field label="Quy mô cũ (để so sánh)" value={oldSize} onChangeText={setOldSize} placeholder="Phú Mỹ Hưng 600 ha" C={C} />
          <Field label="Shophouse — diện tích" value={shophouseSize} onChangeText={setShophouseSize} placeholder="100–120 m²" C={C} />
          <Field label="Biệt thự — diện tích" value={villaSize} onChangeText={setVillaSize} placeholder="180–450 m²" C={C} />
        </Section>

        {/* Pricing */}
        <Section title="Bảng giá" icon="pricetag" color="#DC2626">
          <Field label="Căn hộ từ" value={priceAptFrom} onChangeText={setPriceAptFrom} placeholder="25 triệu/m²" C={C} />
          <Field label="Biệt thự từ" value={priceVillaFrom} onChangeText={setPriceVillaFrom} placeholder="35 triệu/m²" C={C} />
          <Field label="Biệt thự nhỏ nhất — diện tích" value={villaMinArea} onChangeText={setVillaMinArea} placeholder="180 m² sàn" C={C} />
          <Field label="Biệt thự nhỏ nhất — giá" value={villaMinPrice} onChangeText={setVillaMinPrice} placeholder="6,3 tỷ" C={C} />
        </Section>

        {/* Financing */}
        <Section title="Chính sách tài chính" icon="card" color="#0891B2">
          <Field label="Chính sách hiện hành" value={finPolicy} onChangeText={setFinPolicy} placeholder="Ân hạn gốc/lãi 18 tháng" multiline C={C} />
          <Field label="Thời gian lãi 0%" value={finRateFree} onChangeText={setFinRateFree} placeholder="18 tháng" C={C} />
          <Field label="Tỷ lệ vay hỗ trợ" value={finLoanRatio} onChangeText={setFinLoanRatio} placeholder="70%" C={C} />
          <Field label="Thanh toán giãn đến" value={finScheduleEnd} onChangeText={setFinScheduleEnd} placeholder="2028" C={C} />
          <Field label="Đặt cọc giữ chỗ" value={finDepositReserve} onChangeText={setFinDepositReserve} placeholder="200 triệu" C={C} />
        </Section>

        {/* Legal */}
        <Section title="Pháp lý" icon="shield-checkmark" color="#059669">
          <Field label="Văn bản phê duyệt" value={legalApprovalDoc} onChangeText={setLegalApprovalDoc} placeholder="QĐ 529/TTg-2023" C={C} />
          <Field label="Cơ quan phê duyệt" value={legalApprovalAuth} onChangeText={setLegalApprovalAuth} placeholder="Thủ tướng Chính phủ" C={C} />
        </Section>

        {/* Infrastructure */}
        <Section title="Hạ tầng" icon="construct" color="#7C3AED">
          <Field label="Hạ tầng đã có" value={infCompleted} onChangeText={setInfCompleted} placeholder="Cao tốc Hà Nội - Hạ Long, cầu Bạch Đằng" multiline C={C} />
          <Field label="Cách tiếp cận hiện tại" value={infCurrentAccess} onChangeText={setInfCurrentAccess} placeholder="90 phút từ Hà Nội qua cao tốc" multiline C={C} />
          <Field label="Hạ tầng mới (đang triển khai)" value={infNewProject} onChangeText={setInfNewProject} placeholder="Tuyến đường sắt cao tốc Bắc-Nam" C={C} />
          <Field label="Ngày khởi công hạ tầng mới" value={infNewStart} onChangeText={setInfNewStart} placeholder="Q1/2025" C={C} />
          <Field label="Thời gian đi lại mới (kỳ vọng)" value={infNewTravelTime} onChangeText={setInfNewTravelTime} placeholder="23 phút HN – Hạ Long" C={C} />
        </Section>

        {/* Area info */}
        <Section title="Thông tin khu vực" icon="map" color="#EA580C">
          <Field label="Giải trí / vui chơi" value={areaEntertainment} onChangeText={setAreaEntertainment} placeholder="Sun World Hạ Long, phố đi bộ..." multiline C={C} />
          <Field label="Du lịch quốc tế" value={areaIntlTourism} onChangeText={setAreaIntlTourism} placeholder="Sân bay Vân Đồn, cảng tàu quốc tế" multiline C={C} />
          <Field label="Thống kê du lịch" value={areaTourismStats} onChangeText={setAreaTourismStats} placeholder="15 triệu lượt khách/năm 2024" multiline C={C} />
        </Section>

        {/* Competitor */}
        <Section title="Đối thủ trực tiếp" icon="flag" color="#BE185D">
          <Field label="Vị trí đối thủ gần nhất" value={competitorLocation} onChangeText={setCompetitorLocation} placeholder="Bãi Cháy" C={C} />
          <Field label="Thành phố đối chiếu" value={competitorNearestCity} onChangeText={setCompetitorNearestCity} placeholder="Hạ Long" C={C} />
          <Field label="Danh sách đối thủ" value={competitorsList} onChangeText={setCompetitorsList} placeholder="Sun Group Hạ Long, FLC Hạ Long..." multiline C={C} />
        </Section>

        {/* Market */}
        <Section title="Dữ liệu thị trường" icon="trending-up" color="#10B981">
          <Field label="Nguồn dữ liệu" value={dataSource} onChangeText={setDataSource} placeholder="CBRE, Savills, Batdongsan.com.vn" C={C} />
          <Field label="Tốc độ tăng giá" value={growthRate} onChangeText={setGrowthRate} placeholder="15-20%" C={C} />
          <Field label="Kỳ thống kê" value={growthPeriod} onChangeText={setGrowthPeriod} placeholder="2022-2024" C={C} />
          <Field label="Lãi suất tiết kiệm tham chiếu" value={bankRate} onChangeText={setBankRate} placeholder="5-5.5%" C={C} />
        </Section>

        {/* Comparables */}
        <Section title="Dự án đối chứng (so sánh)" icon="swap-horizontal" color="#8B5CF6">
          {[
            { n: comp1Name, sn: setComp1Name, o: comp1Note, so: setComp1Note },
            { n: comp2Name, sn: setComp2Name, o: comp2Note, so: setComp2Note },
            { n: comp3Name, sn: setComp3Name, o: comp3Note, so: setComp3Note },
          ].map((c, i) => (
            <View key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottomWidth: i < 2 ? 1 : 0, borderBottomColor: C.BORDER }}>
              <Field label={`Dự án ${i + 1}`} value={c.n} onChangeText={c.sn} placeholder="Ocean Park Gia Lâm" C={C} />
              <Field label="Ghi chú" value={c.o} onChangeText={c.so} placeholder="Minh chứng lịch sử tăng giá" multiline C={C} />
            </View>
          ))}
        </Section>

        {/* Rental */}
        <Section title="Cho thuê & Phí" icon="cash" color="#F59E0B">
          <Field label="Giá cho thuê kỳ vọng" value={rentalRange} onChangeText={setRentalRange} placeholder="15-25 triệu/tháng" C={C} />
          <Field label="Tệp khách thuê" value={tenantProfile} onChangeText={setTenantProfile} placeholder="Doanh nhân trong nước + khách quốc tế" multiline C={C} />
          <Field label="Phí dịch vụ hàng năm" value={serviceAnnual} onChangeText={setServiceAnnual} placeholder="30-50 triệu/năm" C={C} />
          <Field label="Ghi chú về phí" value={serviceNote} onChangeText={setServiceNote} placeholder="Thường gộp vào giá thuê" multiline C={C} />
        </Section>

        {/* USP */}
        <Section title="Điểm nổi bật (mỗi dòng 1 điểm)" icon="star" color="#EF4444">
          <Field label="" value={uspText} onChangeText={setUspText} placeholder={"Chuẩn vận hành Vinhomes\nTiện ích đồng bộ\nVị trí di sản"} multiline C={C} />
        </Section>

        <Section title="Ghi chú thêm" icon="document-text" color="#64748B">
          <Field label="" value={notes} onChangeText={setNotes} placeholder="Các thông tin khác AI nên biết..." multiline C={C} />
        </Section>

        <Section title="Xem trước context AI sẽ nhận" icon="eye" color="#64748B">
          <Text style={{ fontSize: 12, color: C.TEXT_SECONDARY, marginBottom: 8 }}>
            Đây là đoạn AI sẽ thấy khi bạn chat/phân tích. Kiểm tra xem dữ liệu đã đầy đủ chưa.
          </Text>
          <View style={{ backgroundColor: C.SURFACE, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: C.BORDER }}>
            <Text style={{ fontSize: 12, color: C.TEXT, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }}>
              {previewText || '(chưa có dữ liệu)'}
            </Text>
          </View>
        </Section>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
