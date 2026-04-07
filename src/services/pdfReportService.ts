import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { CustomerProfile, Session } from './storageService';

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>');
}

function markdownToHtml(md: string): string {
  return md
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/---/g, '<hr/>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

export async function exportCustomerPDF(
  customer: CustomerProfile,
  sessions: Session[],
  businessName?: string,
): Promise<void> {
  const icp = customer.icp || {};
  const scoring = customer.scoring;
  const totalScore = customer.leadScore || 0;

  const sessionRows = sessions.slice(0, 10).map(s => `
    <tr>
      <td>${s.date}</td>
      <td>${s.score.toFixed(1)}/10</td>
      <td>${s.outcome === 'won' ? 'Chốt' : s.outcome === 'lost' ? 'Không chốt' : s.outcome === 'pending' ? 'Đang theo' : '—'}</td>
      <td>${(s.analysis?.summary || []).join('; ').slice(0, 150) || '—'}</td>
    </tr>
  `).join('');

  const noteRows = (customer.notes || []).slice(0, 15).map(n => `
    <tr>
      <td>${n.date}</td>
      <td>${escapeHtml(n.content)}</td>
    </tr>
  `).join('');

  const dmRows = (customer.decisionMakers || []).map(d => `
    <tr>
      <td>${escapeHtml(d.name)}</td>
      <td>${escapeHtml(d.role)}</td>
      <td>${escapeHtml(d.attitude)}</td>
    </tr>
  `).join('');

  const recHtml = customer.aiRecommendation
    ? markdownToHtml(customer.aiRecommendation)
    : '<p style="color:#999">Chưa có đề xuất AI. Nhấn "Tạo đề xuất chi tiết" trong app.</p>';

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; padding: 40px; font-size: 12px; line-height: 1.6; }
  h1 { font-size: 22px; color: #1A7F64; margin-bottom: 4px; }
  h2 { font-size: 16px; color: #1A7F64; margin-top: 24px; margin-bottom: 8px; border-bottom: 2px solid #1A7F64; padding-bottom: 4px; }
  h3 { font-size: 14px; color: #333; margin-top: 16px; margin-bottom: 6px; }
  .subtitle { color: #666; font-size: 13px; margin-bottom: 20px; }
  .brand { color: #999; font-size: 11px; margin-bottom: 30px; }
  .grid { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
  .grid-item { flex: 1; min-width: 45%; background: #f8faf9; border-radius: 8px; padding: 10px; border-left: 3px solid #1A7F64; }
  .grid-item .label { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
  .grid-item .value { font-size: 13px; font-weight: 600; color: #1a1a1a; margin-top: 2px; }
  .score-bar { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
  .score-label { width: 140px; font-size: 11px; color: #555; }
  .score-track { flex: 1; height: 8px; background: #eee; border-radius: 4px; overflow: hidden; }
  .score-fill { height: 100%; border-radius: 4px; }
  .score-num { width: 30px; font-size: 11px; font-weight: 700; text-align: right; }
  .total-score { font-size: 32px; font-weight: 800; color: ${totalScore >= 70 ? '#10B981' : totalScore >= 40 ? '#F59E0B' : '#EF4444'}; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 11px; }
  th { background: #f0f4f3; text-align: left; padding: 8px; border-bottom: 2px solid #ddd; font-weight: 700; color: #333; }
  td { padding: 6px 8px; border-bottom: 1px solid #eee; vertical-align: top; }
  .rec-box { background: #f8faf9; border-radius: 10px; padding: 20px; margin-top: 8px; border: 1px solid #e0e8e5; }
  .rec-box h2 { color: #1A7F64; border: none; margin-top: 16px; }
  .rec-box h3 { color: #1A7F64; }
  .rec-box ul { padding-left: 20px; }
  .rec-box li { margin-bottom: 4px; }
  .rec-box blockquote { background: #e8f5e9; padding: 8px 12px; border-left: 3px solid #1A7F64; margin: 8px 0; border-radius: 4px; font-style: italic; }
  .rec-box strong { color: #0d5c47; }
  .footer { margin-top: 40px; text-align: center; color: #aaa; font-size: 10px; border-top: 1px solid #eee; padding-top: 16px; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>

<h1>Báo cáo phân tích khách hàng</h1>
<p class="subtitle">${escapeHtml(customer.name)}${customer.company ? ' — ' + escapeHtml(customer.company) : ''}</p>
<p class="brand">Phương pháp Bán bằng Vị thế — THE TRUSTED ADVISOR | ${businessName || 'Sales Coach App'} | Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}</p>

<h2>Thông tin tổng quan</h2>
<div class="grid">
  <div class="grid-item"><div class="label">Sản phẩm tư vấn</div><div class="value">${escapeHtml(customer.productOffered || 'Chưa cập nhật')}</div></div>
  <div class="grid-item"><div class="label">Nhu cầu</div><div class="value">${escapeHtml(customer.needs || 'Chưa cập nhật')}</div></div>
  <div class="grid-item"><div class="label">Ngân sách</div><div class="value">${escapeHtml(customer.budget || 'Chưa cập nhật')}</div></div>
  <div class="grid-item"><div class="label">Lo ngại / Phản đối</div><div class="value">${escapeHtml(customer.concerns || 'Chưa cập nhật')}</div></div>
  <div class="grid-item"><div class="label">Yếu tố quyết định</div><div class="value">${escapeHtml(customer.decisionFactors || 'Chưa cập nhật')}</div></div>
  <div class="grid-item"><div class="label">Tính cách giao tiếp</div><div class="value">${escapeHtml(customer.personality || 'Chưa cập nhật')}</div></div>
  <div class="grid-item"><div class="label">Bước tiếp theo</div><div class="value">${escapeHtml(customer.nextStep || 'Chưa cập nhật')}</div></div>
  <div class="grid-item"><div class="label">Trạng thái</div><div class="value">${escapeHtml(customer.stage || 'Chưa cập nhật')}</div></div>
</div>

${icp.painPoints || icp.desires || icp.deepFears ? `
<h2>Tâm lý khách hàng</h2>
<div class="grid">
  ${icp.painPoints ? `<div class="grid-item"><div class="label">Nỗi đau</div><div class="value">${escapeHtml(icp.painPoints)}</div></div>` : ''}
  ${icp.desires ? `<div class="grid-item"><div class="label">Mong muốn</div><div class="value">${escapeHtml(icp.desires)}</div></div>` : ''}
  ${icp.deepFears ? `<div class="grid-item"><div class="label">Nỗi sợ sâu</div><div class="value">${escapeHtml(icp.deepFears)}</div></div>` : ''}
  ${icp.buyingTriggers ? `<div class="grid-item"><div class="label">Trigger mua</div><div class="value">${escapeHtml(icp.buyingTriggers)}</div></div>` : ''}
  ${icp.buyingBarriers ? `<div class="grid-item"><div class="label">Rào cản</div><div class="value">${escapeHtml(icp.buyingBarriers)}</div></div>` : ''}
</div>
` : ''}

${scoring ? `
<h2>Chấm điểm tiềm năng</h2>
<div style="text-align:center; margin-bottom:16px">
  <span class="total-score">${totalScore}</span><span style="color:#999; font-size:16px">/100</span>
</div>
${[
  { label: 'Sản phẩm phù hợp', data: scoring.productFit },
  { label: 'Tài chính phù hợp', data: scoring.financialFit },
  { label: 'Gặp người QĐ', data: scoring.decisionMakerAccess },
  { label: 'Thời gian QĐ', data: scoring.timeline },
  { label: 'Mức tương tác', data: scoring.engagement },
].map(s => `
  <div class="score-bar">
    <span class="score-label">${s.label}</span>
    <div class="score-track"><div class="score-fill" style="width:${(s.data?.score || 0) * 5}%; background:${(s.data?.score || 0) >= 14 ? '#10B981' : (s.data?.score || 0) >= 8 ? '#F59E0B' : '#EF4444'}"></div></div>
    <span class="score-num">${s.data?.score || 0}</span>
  </div>
`).join('')}
` : ''}

${customer.decisionMakers?.length ? `
<h2>Người ra quyết định</h2>
<table>
  <tr><th>Tên</th><th>Vai trò</th><th>Thái độ</th></tr>
  ${dmRows}
</table>
` : ''}

${sessions.length ? `
<h2>Lịch sử cuộc gọi (${sessions.length} buổi)</h2>
<table>
  <tr><th>Ngày</th><th>Điểm</th><th>Kết quả</th><th>Tóm tắt</th></tr>
  ${sessionRows}
</table>
` : ''}

${(customer.notes || []).length ? `
<h2>Ghi chú tương tác (${customer.notes!.length})</h2>
<table>
  <tr><th style="width:80px">Ngày</th><th>Nội dung</th></tr>
  ${noteRows}
</table>
` : ''}

<h2>Đề xuất từ Trợ lý AI của Coach Duy Nguyễn</h2>
<div class="rec-box">
  ${recHtml}
</div>

<div class="footer">
  Báo cáo được tạo bởi Sales Coach App — Phương pháp Bán bằng Vị thế / THE TRUSTED ADVISOR<br/>
  © ${new Date().getFullYear()} Coach Duy Nguyễn
</div>

</body>
</html>`;

  const { uri } = await Print.printToFileAsync({ html, base64: false });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `Báo cáo ${customer.name}`,
      UTI: 'com.adobe.pdf',
    });
  }
}
