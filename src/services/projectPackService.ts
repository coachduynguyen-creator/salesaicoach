import { supabase } from './supabaseClient';
import { normalizeTier } from './subscriptionService';

export interface ProjectPackData {
  project?: {
    name?: string;
    developer?: string;
    area?: string;
    location_detail?: string;
    segment?: string;
    product_types?: string[];
    price_range?: string;
    // Extended (TL01–TL05 placeholders)
    size?: string;
    launch_date?: string;
    construction_start_date?: string;
    population?: string;
    total_investment?: string;
    units_total?: string;
    zones_count?: string;
    phase1_name?: string;
    phase1_size?: string;
    phase1_units?: string;
    usp_main?: string;
    landmark?: string;
    landmark_size?: string;
    old_size?: string;
    historical_reference?: string;
    geographic_feature?: string;
    gpmb_percent?: string;
    product_shophouse_size?: string;
    product_villa_size?: string;
    view_landmark?: string;
  };
  pricing?: {
    apartment_from?: string;
    villa_from?: string;
    villa_min_area?: string;
    villa_min_price?: string;
  };
  financing?: {
    current_policy?: string;
    rate_free_period?: string;
    loan_ratio?: string;
    schedule_end?: string;
    deposit_reserve?: string;
  };
  legal?: {
    approval_authority?: string;
    approval_doc?: string;
  };
  infrastructure?: {
    completed_list?: string;
    current_access?: string;
    new_project?: string;
    new_start_date?: string;
    new_travel_time?: string;
  };
  area?: {
    entertainment?: string;
    international_tourism?: string;
    tourism_stats?: string;
  };
  competitor?: {
    location?: string;
    nearest_city?: string;
  };
  competitors?: {
    list?: string;
  };
  market?: {
    data_source?: string;
    growth_rate?: string;
    growth_period?: string;
    bank_rate?: string;
    bank_rate_type?: string;
  };
  comparables?: Array<{ name: string; note?: string }>;
  rental?: {
    range?: string;
    tenant_profile?: string;
  };
  fees?: {
    service_annual?: string;
    service_note?: string;
  };
  unique_selling_points?: string[];
  notes?: string;
}

export interface ProjectPack {
  id: string;
  owner_id: string;
  team_id: string | null;
  is_team_shared: boolean;
  is_template: boolean;
  is_verified: boolean;
  name: string;
  data: ProjectPackData;
  copied_from_template: string | null;
  created_at: string;
  updated_at: string;
}

const TIER_PACK_LIMITS: Record<string, number> = {
  free: 0,
  pro: 3,
  bds_pro: 999,
  team_s: 999,
  team_m: 999,
  team_l: 999,
};

/** Lấy giới hạn pack cho tier */
export function getPackLimit(tier: string): number {
  return TIER_PACK_LIMITS[normalizeTier(tier)] || 0;
}

/** Load tất cả pack user có quyền đọc */
export async function loadMyPacks(): Promise<ProjectPack[]> {
  const { data, error } = await supabase
    .from('project_packs')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data || []) as ProjectPack[];
}

/** Load chỉ pack do user tạo (không bao gồm template/team shared) */
export async function loadOwnPacks(userId: string): Promise<ProjectPack[]> {
  const { data, error } = await supabase
    .from('project_packs')
    .select('*')
    .eq('owner_id', userId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data || []) as ProjectPack[];
}

/** Load templates (verified) */
export async function loadTemplates(): Promise<ProjectPack[]> {
  const { data, error } = await supabase
    .from('project_packs')
    .select('*')
    .eq('is_template', true)
    .order('is_verified', { ascending: false });
  if (error) throw error;
  return (data || []) as ProjectPack[];
}

/** Tạo pack mới (check quota trước) */
export async function createPack(userId: string, name: string, data: ProjectPackData, options?: {
  teamShared?: boolean;
  teamId?: string | null;
  copiedFromTemplate?: string;
}): Promise<ProjectPack> {
  const { data: result, error } = await supabase
    .from('project_packs')
    .insert({
      owner_id: userId,
      name,
      data,
      team_id: options?.teamId || null,
      is_team_shared: options?.teamShared || false,
      copied_from_template: options?.copiedFromTemplate || null,
    })
    .select()
    .single();

  if (error) throw error;
  return result as ProjectPack;
}

/** Copy 1 pack template thành pack của user */
export async function copyTemplate(templateId: string, userId: string, customName?: string): Promise<ProjectPack> {
  const { data: template, error: tplError } = await supabase
    .from('project_packs')
    .select('*')
    .eq('id', templateId)
    .single();

  if (tplError || !template) throw new Error('Template không tồn tại');

  return createPack(userId, customName || template.name, template.data, {
    copiedFromTemplate: templateId,
  });
}

/** Update pack */
export async function updatePack(packId: string, updates: Partial<Pick<ProjectPack, 'name' | 'data' | 'is_team_shared'>>): Promise<void> {
  const { error } = await supabase
    .from('project_packs')
    .update(updates)
    .eq('id', packId);
  if (error) throw error;
}

/** Xóa pack */
export async function deletePack(packId: string): Promise<void> {
  const { error } = await supabase
    .from('project_packs')
    .delete()
    .eq('id', packId);
  if (error) throw error;
}

/** Set active pack cho user hiện tại */
export async function setActivePack(packId: string | null): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Chưa đăng nhập');

  const { error } = await supabase
    .from('profiles')
    .update({ active_pack_id: packId })
    .eq('id', user.id);
  if (error) throw error;
}

/** Lấy active pack của user hiện tại */
export async function getActivePack(): Promise<ProjectPack | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('active_pack_id')
    .eq('id', user.id)
    .single();

  if (!profile?.active_pack_id) return null;

  const { data: pack } = await supabase
    .from('project_packs')
    .select('*')
    .eq('id', profile.active_pack_id)
    .single();

  return (pack as ProjectPack) || null;
}

/** Convert raw ProjectPackData thành context text — dùng cho preview không cần object pack đầy đủ */
export function packDataToContext(data: ProjectPackData | null, packName = ''): string {
  if (!data) return '';
  const d = data;
  const parts: string[] = [];

  parts.push(`\n---\nDỰ ÁN USER ĐANG LÀM: ${packName || '(chưa đặt tên)'}`);

  if (d.project) {
    const p = d.project;
    if (p.name) parts.push(`Tên: ${p.name}`);
    if (p.developer) parts.push(`CĐT: ${p.developer}`);
    if (p.area) parts.push(`Khu vực: ${p.area}${p.location_detail ? ' - ' + p.location_detail : ''}`);
    if (p.segment) parts.push(`Phân khúc: ${p.segment}`);
    if (p.product_types?.length) parts.push(`Loại SP: ${p.product_types.join(', ')}`);
    if (p.price_range) parts.push(`Khoảng giá: ${p.price_range}`);
    if (p.size) parts.push(`Quy mô: ${p.size}`);
    if (p.total_investment) parts.push(`Tổng vốn đầu tư: ${p.total_investment}`);
    if (p.units_total) parts.push(`Tổng số SP: ${p.units_total}`);
    if (p.zones_count) parts.push(`Số phân khu: ${p.zones_count}`);
    if (p.launch_date) parts.push(`Mở bán: ${p.launch_date}`);
    if (p.construction_start_date) parts.push(`Khởi công: ${p.construction_start_date}`);
    if (p.phase1_name || p.phase1_size || p.phase1_units) {
      parts.push(`Giai đoạn 1: ${[p.phase1_name, p.phase1_size, p.phase1_units].filter(Boolean).join(' — ')}`);
    }
    if (p.gpmb_percent) parts.push(`GPMB: ${p.gpmb_percent}`);
    if (p.view_landmark) parts.push(`View/Landmark hướng tới: ${p.view_landmark}`);
    if (p.landmark) parts.push(`Điểm nhấn: ${p.landmark}${p.landmark_size ? ' (' + p.landmark_size + ')' : ''}`);
    if (p.geographic_feature) parts.push(`Đặc điểm địa lý: ${p.geographic_feature}`);
    if (p.population) parts.push(`Dân số dự kiến: ${p.population}`);
    if (p.historical_reference) parts.push(`So sánh lịch sử: ${p.historical_reference}`);
    if (p.old_size) parts.push(`Quy mô cũ (so sánh): ${p.old_size}`);
    if (p.usp_main) parts.push(`USP chính: ${p.usp_main}`);
    if (p.product_shophouse_size) parts.push(`Shophouse: ${p.product_shophouse_size}`);
    if (p.product_villa_size) parts.push(`Biệt thự: ${p.product_villa_size}`);
  }

  if (d.pricing) {
    const pr = d.pricing;
    const items = [
      pr.apartment_from && `căn hộ từ ${pr.apartment_from}`,
      pr.villa_from && `biệt thự từ ${pr.villa_from}`,
      pr.villa_min_area && `BT nhỏ nhất ${pr.villa_min_area}`,
      pr.villa_min_price && `giá BT nhỏ nhất ${pr.villa_min_price}`,
    ].filter(Boolean);
    if (items.length) parts.push(`\nGIÁ: ${items.join(', ')}`);
  }

  if (d.financing) {
    const f = d.financing;
    const items = [
      f.current_policy && `chính sách: ${f.current_policy}`,
      f.schedule_end && `giãn đến ${f.schedule_end}`,
      f.loan_ratio && `vay ${f.loan_ratio}`,
      f.rate_free_period && `lãi 0% trong ${f.rate_free_period}`,
      f.deposit_reserve && `đặt cọc giữ chỗ ${f.deposit_reserve}`,
    ].filter(Boolean);
    if (items.length) parts.push(`\nTÀI CHÍNH: ${items.join(', ')}`);
  }

  if (d.legal) {
    const l = d.legal;
    const items = [
      l.approval_doc && `văn bản phê duyệt: ${l.approval_doc}`,
      l.approval_authority && `cơ quan phê duyệt: ${l.approval_authority}`,
    ].filter(Boolean);
    if (items.length) parts.push(`\nPHÁP LÝ: ${items.join(', ')}`);
  }

  if (d.infrastructure) {
    const inf = d.infrastructure;
    parts.push('\nHẠ TẦNG:');
    if (inf.completed_list) parts.push(`- Đã có: ${inf.completed_list}`);
    if (inf.current_access) parts.push(`- Tiếp cận hiện tại: ${inf.current_access}`);
    if (inf.new_project) parts.push(`- Hạ tầng mới: ${inf.new_project}${inf.new_start_date ? ' (khởi công ' + inf.new_start_date + ')' : ''}`);
    if (inf.new_travel_time) parts.push(`- Thời gian đi lại mới: ${inf.new_travel_time}`);
  }

  if (d.area) {
    const a = d.area;
    const items = [
      a.entertainment && `giải trí: ${a.entertainment}`,
      a.international_tourism && `du lịch quốc tế: ${a.international_tourism}`,
      a.tourism_stats && `thống kê du lịch: ${a.tourism_stats}`,
    ].filter(Boolean);
    if (items.length) parts.push(`\nKHU VỰC: ${items.join(', ')}`);
  }

  if (d.competitor?.location || d.competitor?.nearest_city || d.competitors?.list) {
    parts.push('\nĐỐI THỦ:');
    if (d.competitor?.location) parts.push(`- Vị trí đối thủ: ${d.competitor.location}`);
    if (d.competitor?.nearest_city) parts.push(`- Thành phố gần nhất: ${d.competitor.nearest_city}`);
    if (d.competitors?.list) parts.push(`- Danh sách: ${d.competitors.list}`);
  }

  if (d.market) {
    parts.push('\nDỮ LIỆU THỊ TRƯỜNG:');
    if (d.market.data_source) parts.push(`- Nguồn: ${d.market.data_source}`);
    if (d.market.growth_rate) parts.push(`- Tăng giá: ${d.market.growth_rate}${d.market.growth_period ? ' (' + d.market.growth_period + ')' : ''}`);
    if (d.market.bank_rate) parts.push(`- Lãi suất ${d.market.bank_rate_type || 'tiết kiệm'}: ${d.market.bank_rate}`);
  }

  if (d.comparables?.length) {
    parts.push('\nDỰ ÁN ĐỐI CHỨNG:');
    d.comparables.forEach(c => parts.push(`- ${c.name}${c.note ? ': ' + c.note : ''}`));
  }

  if (d.rental?.range) {
    parts.push(`\nGIÁ THUÊ: ${d.rental.range}`);
    if (d.rental.tenant_profile) parts.push(`Tệp khách thuê: ${d.rental.tenant_profile}`);
  }

  if (d.fees?.service_annual) {
    parts.push(`\nPHÍ DỊCH VỤ: ${d.fees.service_annual}`);
    if (d.fees.service_note) parts.push(`(${d.fees.service_note})`);
  }

  if (d.unique_selling_points?.length) {
    parts.push('\nĐIỂM NỔI BẬT:');
    d.unique_selling_points.forEach(p => parts.push(`- ${p}`));
  }

  if (d.notes) parts.push(`\nGHI CHÚ: ${d.notes}`);

  parts.push(`\nHƯỚNG DẪN: Khi trả lời câu hỏi về dự án, sản phẩm, giá cả, thị trường — SỬ DỤNG dữ liệu trên. Không dùng số liệu chung chung khi đã có data cụ thể của user.`);

  return parts.join('\n');
}

/** Legacy wrapper — forward sang packDataToContext */
export function packToContext(pack: ProjectPack | null): string {
  if (!pack) return '';
  return packDataToContext(pack.data, pack.name);
}
