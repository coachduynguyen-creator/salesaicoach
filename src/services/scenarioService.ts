import { supabase } from './supabaseClient';
import { ProjectPackData } from './projectPackService';

export interface Scenario {
  id: string;
  doc_ref: string;
  section_code: string;
  section_title: string;
  title: string;
  objection_verbatim: string;
  methodology_tools: string[];
  active_stages: number[];
  analysis: string;
  customer_psychology: { surface?: string; middle?: string; root?: string };
  approach: { reflect?: string; diq?: string };
  script: Array<{ speaker: string; content: string }>;
  warnings: Array<{ type: string; content: string }>;
  skills_required: string;
  tags: string[];
  keywords: string[];
}

/** Tìm top scenarios liên quan đến query (full text search) */
export async function searchScenarios(query: string, limit = 3): Promise<Scenario[]> {
  if (!query.trim()) return [];
  try {
    const { data, error } = await supabase.rpc('search_scenarios', {
      query_text: query,
      max_results: limit,
    });
    if (error || !data || data.length === 0) return [];

    const ids = data.map((r: any) => r.id);
    const { data: full } = await supabase
      .from('scenarios')
      .select('*')
      .in('id', ids);

    if (!full) return [];
    // Giữ thứ tự theo rank
    return ids.map((id: string) => full.find((s: any) => s.id === id)).filter(Boolean) as Scenario[];
  } catch {
    return [];
  }
}

/** Lấy scenario theo ID */
export async function getScenario(id: string): Promise<Scenario | null> {
  const { data } = await supabase.from('scenarios').select('*').eq('id', id).single();
  return (data as Scenario) || null;
}

/** Lấy tất cả scenarios (cho browse UI) */
export async function loadAllScenarios(): Promise<Scenario[]> {
  const { data } = await supabase
    .from('scenarios')
    .select('*')
    .order('id');
  return (data || []) as Scenario[];
}

/** Replace placeholder {{path.to.value}} với data thật từ pack */
export function fillPlaceholders(text: string, packData: ProjectPackData | null): string {
  if (!packData) return text;

  const get = (path: string): string | null => {
    const parts = path.split('.');
    let value: any = packData;
    for (const p of parts) {
      if (value == null) return null;
      if (/^\d+$/.test(p)) value = value[parseInt(p)];
      else value = value[p];
    }
    return value != null && value !== '' ? String(value) : null;
  };

  return text.replace(/\{\{([\w.]+)\}\}/g, (_, path) => {
    const v = get(path);
    // KHÔNG leak placeholder literal ra output — thay bằng nhãn "chưa có" để AI xử lý đúng
    return v ?? '[chưa có dữ liệu dự án cho trường này]';
  });
}

/** Format scenario thành text để inject vào system prompt */
export function scenariosToContext(scenarios: Scenario[], packData: ProjectPackData | null): string {
  if (scenarios.length === 0) return '';

  const parts: string[] = [
    '\n\n═══════════════════════════════════════',
    'TÌNH HUỐNG LIÊN QUAN TRONG BỘ KIẾN THỨC TTA',
    '(Dùng làm cơ sở để trả lời — ưu tiên phương pháp, kịch bản, ngôn từ trong tài liệu)',
    '═══════════════════════════════════════',
  ];

  scenarios.forEach((s, idx) => {
    parts.push(`\n--- Tình huống ${s.id.toUpperCase()} (${s.doc_ref}): "${s.title}" ---`);
    parts.push(`Khách nói: "${s.objection_verbatim}"`);
    if (s.analysis) parts.push(`\n[Phân tích]: ${s.analysis}`);

    if (s.customer_psychology) {
      parts.push('\n[Tâm lý khách]:');
      if (s.customer_psychology.surface) parts.push(`- Bề mặt: ${s.customer_psychology.surface}`);
      if (s.customer_psychology.middle) parts.push(`- Tầng giữa: ${s.customer_psychology.middle}`);
      if (s.customer_psychology.root) parts.push(`- Tầng gốc: ${s.customer_psychology.root}`);
    }

    if (s.approach) {
      parts.push('\n[Định hướng]:');
      if (s.approach.reflect) parts.push(`- REFLECT: ${s.approach.reflect}`);
      if (s.approach.diq) parts.push(`- DIQ: ${s.approach.diq}`);
    }

    if (s.script && s.script.length > 0) {
      parts.push('\n[Kịch bản mẫu]:');
      s.script.forEach(line => {
        const filled = fillPlaceholders(line.content, packData);
        const speakerLabel =
          line.speaker === 'khach' ? 'KHÁCH' :
          line.speaker === 'sales' ? 'SALES' :
          line.speaker === 'sales_diq' ? 'SALES (DIQ)' :
          line.speaker === 'note' ? '[Ghi chú]' :
          line.speaker.startsWith('sales_') ? `SALES (${line.speaker.replace('sales_', '')})` :
          line.speaker.toUpperCase();
        parts.push(`${speakerLabel}: ${filled}`);
      });
    }

    if (s.warnings && s.warnings.length > 0) {
      parts.push('\n[Cảnh báo]:');
      s.warnings.forEach(w => parts.push(`⚠️ ${w.content}`));
    }

    if (s.skills_required) parts.push(`\n[Kỹ năng]: ${s.skills_required}`);
  });

  parts.push('\n═══════════════════════════════════════');
  parts.push('HƯỚNG DẪN SỬ DỤNG: Khi trả lời user, dựa trên tình huống liên quan ở trên. Cite số TH khi phù hợp (VD: "Theo tình huống TH_023..."). Giữ nguyên phương pháp REFLECT/DIQ, không đảo ngược thứ tự. Lồng ghép kịch bản mẫu đã được điền dữ liệu dự án thật.');
  parts.push('═══════════════════════════════════════\n');

  return parts.join('\n');
}
