-- ============================================================
-- TL05: Phần E — Tính cách Khách hàng (TH 43-52 + E-A1/A2/A3) — 13 tình huống
-- ID prefix: e_ (section E)
-- Lưu ý đặc thù: Tính cách không phải tình huống. Cùng một câu từ chối nhưng
-- từ các kiểu tính cách khác nhau là những cuộc tư vấn hoàn toàn khác nhau.
-- DIQ mạnh nhất với Phân Tích & Đầu Tư ROI. REFLECT mạnh nhất với "Biết Tất Cả" & Do Dự.
-- ============================================================

INSERT INTO public.scenarios (id, doc_ref, section_code, section_title, title, objection_verbatim,
  methodology_tools, active_stages, analysis, customer_psychology, approach, script, warnings,
  skills_required, tags, keywords, tier_access, related_ids, search_content)
VALUES

-- TH 43: Khách Phân Tích
('e_43', 'TL05', 'E', 'Tính cách Khách hàng', 'Tôi cần thêm thông tin trước khi quyết định — Khách Phân Tích',
  'Tôi cần thêm thông tin trước khi quyết định',
  ARRAY['REFLECT', 'DIQ', '3TP'], ARRAY[1, 2, 3],
  'Khách Phân Tích không thiếu thông tin — họ thừa thông tin. Vấn đề là họ dùng việc thu thập thêm data như một cơ chế trì hoãn quyết định mà không ý thức được điều đó. Nhận dạng: hỏi pháp lý chi tiết, xin bảng tính tài chính, so sánh chỉ số với dự án khác; sau khi nhận đủ vẫn hỏi thêm. Lỗi phổ biến: nghe yêu cầu data là cung cấp ngay — sales biến mình thành kho tài liệu trong khi chưa hiểu điều gì thật sự đang giữ khách lại. Họ không nghi ngờ dự án, họ nghi ngờ bản thân.',
  '{
    "surface": "Muốn xem thêm số liệu, báo cáo, so sánh trước khi quyết định.",
    "middle": "Tôi sợ quyết định sai. Nếu có thêm một con số nữa, có thể tôi sẽ chắc chắn hơn.",
    "root": "Tôi cần ai đó giúp tôi nhận ra rằng mình đã đủ thông tin để quyết định. Tôi không cần thêm data — tôi cần sự tự tin."
  }'::jsonb,
  '{
    "reflect": "Câu hỏi phản chiếu nhắm vào tiền đề \"cần thêm thông tin\" thay vì vào nội dung thông tin khách yêu cầu. Câu cốt lõi: \"Nếu có thêm thông tin đó, anh quyết định được ngay không?\" Kéo lại Động lực từ lần gặp trước làm neo — không bắt đầu từ yêu cầu hôm nay.",
    "diq": "Chỉ áp dụng khi khách đã đặt tên được điều kiện quyết định: dữ liệu cụ thể gắn với đúng điều kiện đó, insight về sự khác biệt giữa thông tin họ yêu cầu và thông tin họ thật sự cần, câu hỏi để khách tự xác nhận Con đường."
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "Anh muốn xem thêm số liệu về tốc độ hấp thụ căn hộ tại {{project.location_detail}} 3 năm gần đây. Có không em?"},
    {"speaker": "sales", "content": "Dạ có anh. Nhưng trước khi em tìm, em muốn hỏi lại một chút. Hôm trước anh chia sẻ là đang nhắm đến đầu tư dài hạn, giữ 5 năm rồi bán lại, đúng không ạ?"},
    {"speaker": "note", "content": "Chờ. Neo lại Động lực từ lần gặp trước."},
    {"speaker": "khach", "content": "Ừ đúng."},
    {"speaker": "sales", "content": "Dạ. Với mục tiêu đó, trong những thứ anh đã có trong tay — pháp lý, tiến độ, bảng giá, chính sách thanh toán — còn điều gì anh chưa rõ mà nếu rõ được thì anh sẽ quyết định được không ạ?"},
    {"speaker": "khach", "content": "Ừ, thật ra anh cũng không biết nữa. Cứ muốn chắc hơn thôi."},
    {"speaker": "sales", "content": "Dạ, em hỏi thêm nhé: giả sử em gửi báo cáo đó và số liệu đẹp, anh nghĩ anh có quyết định được ngay không ạ?"},
    {"speaker": "note", "content": "Chờ. Đây là câu REFLECT cốt lõi."},
    {"speaker": "khach", "content": "Chắc cũng chưa, anh còn muốn xem thêm vài thứ nữa."},
    {"speaker": "sales", "content": "Dạ, anh vừa nói ra điều quan trọng. Không phải thiếu thông tin, mà là chưa tìm ra điều kiện để mình thấy đủ. Với mục tiêu bán lại sau 5 năm của anh, nếu có một điều kiện duy nhất mà nếu thỏa mãn thì anh sẵn lòng đặt cọc, điều đó là gì ạ?"},
    {"speaker": "note", "content": "Chờ. Không nói thêm gì dù khách im lặng lâu."},
    {"speaker": "khach", "content": "Chắc là anh muốn biết nếu 5 năm nữa thị trường không như kỳ vọng thì bán lại có dễ không."},
    {"speaker": "sales_diq", "content": "Dạ, vậy điều anh cần không phải tốc độ hấp thụ sơ cấp, mà là thanh khoản thứ cấp sau khi bàn giao. Theo số liệu giao dịch thứ cấp của các dự án {{project.developer}} cùng phân khúc ven biển đã bàn giao, tỷ lệ giao dịch thành công trong vòng 6 tháng dao động từ 65 đến 80% ở các căn có view tốt. Anh thấy con số đó có trả lời được điều kiện của anh không?"}
  ]'::jsonb,
  '[{"type": "never", "content": "KHÔNG cung cấp thêm data khi chưa xác định được điều kiện quyết định thật sự — biến mình thành kho tài liệu không giúp khách chốt."}]'::jsonb,
  'Nhớ Động lực từ lần gặp trước và dùng làm neo đầu cuộc gặp tiếp theo. Kỹ năng cốt lõi: giúp khách đặt tên cho điều kiện quyết định gắn với đúng mục tiêu — khi đã đặt tên, DIQ mới có chỗ phát huy thay vì cứ cung cấp data theo yêu cầu.',
  ARRAY['khach_phan_tich', 'thua_thong_tin', 'dieu_kien_quyet_dinh', 'thanh_khoan_thu_cap'],
  ARRAY['cần thêm thông tin', 'phân tích', 'số liệu', 'báo cáo', 'hấp thụ'],
  ARRAY['bds_pro'],
  ARRAY['e_47', 'e_52', 'd_39'],
  'Khách phân tích cần thêm thông tin số liệu báo cáo điều kiện quyết định thanh khoản thứ cấp'),

-- TH 44: Khách Quyết Đoán
('e_44', 'TL05', 'E', 'Tính cách Khách hàng', 'Thôi khỏi giới thiệu, giá bao nhiêu, chính sách gì? — Khách Quyết Đoán',
  'Thôi khỏi giới thiệu, giá bao nhiêu, chính sách gì?',
  ARRAY['DIQ', '3TP'], ARRAY[1, 3, 4],
  'Khách Quyết Đoán biết mình muốn gì, ra quyết định nhanh và áp dụng tiêu chuẩn đó vào mua sắm. Khi gặp sales nói nhiều, giải thích nhiều, họ mất kiên nhẫn ngay lập tức. Nhận dạng: ngắt lời, hỏi thẳng giá và chính sách, không muốn nghe lịch sử phát triển dự án. Lỗi phổ biến: cố trình bày đủ thông tin vì nghĩ khách cần hiểu nhiều hơn — họ đã có thể quyết định với 20% thông tin, nói thêm 80% kia chỉ làm họ khó chịu và mất tin tưởng.',
  '{
    "surface": "Giá bao nhiêu? Chính sách gì? Có cần tôi xem thực tế không?",
    "middle": "Đừng làm mất thời gian tôi. Nếu đáng tin và có gì phù hợp, tôi sẽ biết ngay.",
    "root": "Tôi cần được tôn trọng thời gian và trí tuệ. Người tư vấn giỏi là người hiểu tôi nhanh, không phải người thuyết phục tôi nhiều."
  }'::jsonb,
  '{
    "reflect": "Không cần nhiều REFLECT vì tính cách này ít khi nêu mối lo mơ hồ. Động lực thường lộ ra ngay trong câu hỏi đầu tiên — bắt lấy và xoay quanh đó.",
    "diq": "Ngắn gọn: một dữ liệu, một insight, một câu hỏi. Điểm nghẽn thường là giá trị thực so với giá niêm yết — xử lý bằng số liệu gọn và đề xuất bước tiếp theo ngay. Rút ngắn mọi thứ: câu hỏi ngắn, trả lời ngắn, hành động cụ thể sớm."
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "Thôi khỏi giới thiệu, anh biết dự án này rồi. Bảo em bán gì, giá bao nhiêu, chính sách gì?"},
    {"speaker": "sales", "content": "Dạ. Căn hộ {{project.name}} từ {{pricing.apartment_from}}, biệt thự từ {{pricing.villa_from}}. Chính sách thanh toán giãn đến {{financing.schedule_end}}, hỗ trợ vay {{financing.loan_ratio}} lãi suất 0% trong {{financing.rate_free_period}}. Chị đang nhắm hướng nào ạ?"},
    {"speaker": "note", "content": "Chờ, không nói thêm."},
    {"speaker": "khach", "content": "Biệt thự. Diện tích nhỏ nhất bao nhiêu?"},
    {"speaker": "sales", "content": "Biệt thự nhỏ nhất {{pricing.villa_min_area}}, giá khoảng {{pricing.villa_min_price}}, đặt cọc {{financing.deposit_reserve}} giữ chỗ 30 ngày. Chị muốn em chuẩn bị bài toán tài chính cụ thể không ạ?"},
    {"speaker": "khach", "content": "Được. Nhưng em cho chị biết trước, có thương lượng thêm không hay giá là giá?"},
    {"speaker": "sales_diq", "content": "Giá niêm yết là giá chính thức của {{project.developer}}, không có khoảng thương lượng ngoài chính sách. Nhưng nếu chị đặt cọc trước ngày 30 tháng này, có ưu tiên chọn vị trí trước khi mở bán đại trà. Với biệt thự, vị trí tốt hơn có thể tăng giá trị bán lại từ 8 đến 12% theo lịch sử giao dịch thứ cấp của {{project.developer}}. Đây là lợi thế thực tế hơn là giảm giá ạ."},
    {"speaker": "khach", "content": "Ok. Em sắp lịch cho chị xem thực tế cuối tuần này."},
    {"speaker": "sales", "content": "Dạ, thứ Bảy hay Chủ Nhật thuận hơn cho chị ạ? Em đặt lịch ngay."}
  ]'::jsonb,
  '[{"type": "never", "content": "KHÔNG nói thêm sau khi đã đáp xong một câu hỏi — mọi câu thêm đều làm giảm uy tín với Khách Quyết Đoán."}, {"type": "never", "content": "KHÔNG nhìn tài liệu để trả lời câu hỏi cơ bản — Khách Quyết Đoán mất tin ngay lập tức."}]'::jsonb,
  'Luyện khả năng im lặng sau khi đã trả lời. Biết dừng là kỹ năng chính. Nắm số liệu chính xác và rút gọn được thành một câu — không bao giờ phải tra cứu trước mặt khách.',
  ARRAY['khach_quyet_doan', 'ngan_gon', 'gia_chinh_sach', 'im_lang'],
  ARRAY['giá bao nhiêu', 'chính sách', 'ngắn gọn', 'thôi khỏi giới thiệu'],
  ARRAY['bds_pro'],
  ARRAY['e_52', 'e_50', 'a_02'],
  'Khách quyết đoán ngắn gọn giá chính sách biệt thự căn hộ đặt cọc thứ bảy chủ nhật'),

-- TH 45: Khách Hòa Giải
('e_45', 'TL05', 'E', 'Tính cách Khách hàng', 'Nghe hay đấy, để tôi về bàn với gia đình rồi tính — Khách Hòa Giải',
  'Nghe hay đấy, để tôi về bàn với gia đình rồi tính',
  ARRAY['REFLECT', 'DIQ', '3TP'], ARRAY[1, 2, 4],
  'Khách Hòa Giải là những người dễ chịu nhất để nói chuyện và nguy hiểm nhất để chốt. Họ đồng ý nhiều, hỏi ít, ít khi phản đối trực tiếp. Sales thấy cuộc gặp "rất tốt" và nghĩ khách gần chốt — tuần sau khách biến mất. Nhận dạng: gật đầu nhiều, "uh nhỉ", "nghe hay đấy", "để chị nghĩ thêm", thường kết thúc bằng "hỏi chồng/vợ cái đã". Lỗi phổ biến: tin vào tín hiệu tích cực, không xác định ai là người quyết định thật sự — tư vấn đúng người sai người ra quyết định.',
  '{
    "surface": "Nghe có vẻ tốt đấy. Để chị về bàn với ông xã rồi tính.",
    "middle": "Tôi không muốn từ chối trực tiếp vì ngại nghe ngang. Tôi cần sự đồng thuận của người khác trước khi cảm thấy an toàn để quyết định.",
    "root": "Tôi sợ quyết định sai và bị người thân phản đối. Việc cân bằng cảm giác của mọi người quan trọng hơn quyết định nhanh."
  }'::jsonb,
  '{
    "reflect": "Áp dụng REFLECT để lộ ra người quyết định thật sự và điều họ quan tâm. Xác định người quyết định thật sự trong 10 phút đầu — Khách Hòa Giải hiếm khi là người quyết định cuối dù là người đi xem trước.",
    "diq": "Không áp dụng DIQ với người không phải người quyết định. Dùng DIQ khi chuẩn bị nội dung cho cuộc gặp tiếp theo có đủ mặt người. Con đường: mời toàn bộ người quyết định cùng tham gia buổi tư vấn tiếp theo với nội dung chuẩn bị riêng cho từng người."
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "Nghe hay đấy em ạ. Để chị về bàn với ông xã rồi mình tính tiếp."},
    {"speaker": "sales", "content": "Dạ, em hiểu ạ. Chị cho em hỏi một chút, trong quyết định này, anh hay chị là người thường có tiếng nói cuối cùng hơn ạ?"},
    {"speaker": "note", "content": "Chờ. Câu phân loại người quyết định thật sự."},
    {"speaker": "khach", "content": "Thường thì mình bàn chung, nhưng những thứ to thế này anh ấy hay để ý nhiều hơn."},
    {"speaker": "sales", "content": "Dạ, vậy là có những điểm anh ấy sẽ hỏi mà hôm nay chị chưa có thông tin để trả lời. Anh ấy thường quan tâm đến phần nào nhất khi xem xét tài sản lớn ạ — tài chính, pháp lý, hay tiện ích sử dụng thực tế?"},
    {"speaker": "khach", "content": "Anh ấy hay hỏi về tài chính và pháp lý nhiều hơn."},
    {"speaker": "sales", "content": "Dạ, em đề nghị thế này: cuối tuần này em sắp lịch cho cả anh chị cùng qua, 30 phút thôi. Em chuẩn bị luôn bảng tài chính và tóm tắt pháp lý theo đúng góc anh ấy quan tâm. Khi đó mình đi thẳng vào những điểm quan trọng, anh ấy không phải nghe lại từ đầu. Anh hay chị thường rảnh hơn vào thứ Bảy hay Chủ Nhật ạ?"}
  ]'::jsonb,
  '[{"type": "never", "content": "KHÔNG tin vào tín hiệu tích cực (gật đầu, \"nghe hay\") mà bỏ qua việc xác định người quyết định thật sự."}]'::jsonb,
  'Đặt câu hỏi về người quyết định thật sự TRƯỚC khi hết buổi gặp thứ nhất. Kéo người quyết định thật sự vào cuộc gặp tiếp theo bằng lý do cụ thể gắn với mối quan tâm của họ — không chỉ "mời anh chị đi xem".',
  ARRAY['khach_hoa_giai', 'nguoi_quyet_dinh', 'gia_dinh', 'dong_thuan'],
  ARRAY['bàn với gia đình', 'hỏi vợ', 'hỏi chồng', 'nghe hay đấy'],
  ARRAY['bds_pro'],
  ARRAY['e_51', 'd_36', 'e_46'],
  'Khách hòa giải bàn gia đình người quyết định thật sự vợ chồng đồng thuận cuối tuần'),

-- TH 46: Khách Cảm Xúc
('e_46', 'TL05', 'E', 'Tính cách Khách hàng', 'Nhìn đẹp nhỉ, nhưng để em nghĩ thêm — Khách Cảm Xúc',
  'Nhìn đẹp nhỉ, nhưng để em nghĩ thêm',
  ARRAY['DIQ', '3TP'], ARRAY[1, 3, 4],
  'Khách Cảm Xúc ra quyết định trước bằng cảm giác, sau mới tìm lý do để giải thích. Khi họ hứng, mọi thứ tuyệt vời; khi nguội, mọi thứ khó khăn. Gặp đúng lúc hứng thì chốt được ngay. Nhận dạng: nói nhiều về cảm giác và hình dung, bị ảnh hưởng bởi không khí buổi gặp hơn là nội dung thông tin. Lỗi phổ biến: trình bày quá nhiều số liệu khi khách đang ở trạng thái cảm xúc cao, hoặc chỉ nói giá trị duy lý trong khi khách cần được chạm vào hình dung tương lai.',
  '{
    "surface": "Nhìn đẹp nhỉ, nhưng để em nghĩ thêm.",
    "middle": "Tôi cảm thấy tốt nhưng chưa đủ để hành động. Tôi cần cảm giác này mạnh hơn, rõ ràng hơn.",
    "root": "Tôi mua thứ gì đó vì nó phù hợp với con người tôi muốn trở thành hoặc cuộc sống tôi muốn có, không chỉ vì số liệu."
  }'::jsonb,
  '{
    "reflect": "Không cần nhiều REFLECT — thay vào đó là câu hỏi dẫn dắt hình dung. Động lực nằm ở hình dung tương lai, không phải hiện tại. Giúp khách sống trong cảnh sau khi sở hữu trước khi bàn về giá trị tài chính.",
    "diq": "Áp dụng ở bước cuối: một dữ liệu về giá trị view so với giá, insight ngắn gọn, câu hỏi để khách tự kết luận. Điểm nghẽn: khoảng cách giữa cảm giác tốt lúc xem và cảm giác bất an khi đặt bút ký. Con đường: hành động nhỏ ngay tại chỗ, không phải quyết định lớn."
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "Đẹp thật. Nhưng mà giá cũng khá nhỉ. Để anh chị suy nghĩ thêm."},
    {"speaker": "sales", "content": "Dạ, anh thấy không gian ở đây thế nào ạ, so với những nơi anh chị đã xem trước đó?"},
    {"speaker": "khach", "content": "Thoáng hơn, view biển rồi mà. Nhưng giá nó cao hơn."},
    {"speaker": "sales", "content": "Dạ. Anh thử hình dung cảnh này: sáng cuối tuần anh chị ngủ dậy, bước ra ban công nhìn ra {{project.view_landmark}}, các con chạy xuống hồ bơi. Thường xu hướng đó là anh chọn mua ở đây vì lý do gì ạ?"},
    {"speaker": "note", "content": "Chờ. Câu hỏi dẫn dắt hình dung cụ thể gắn với dự án."},
    {"speaker": "khach", "content": "Hé, để ở thì phải view đẹp chứ, đi làm cả tuần rồi."},
    {"speaker": "sales_diq", "content": "Dạ, theo số liệu giao dịch thứ cấp của các căn {{project.developer}} có view biển so với căn cùng diện tích không có view, chênh lệch giá bán lại trung bình từ 15 đến 20%. Tức là view không chỉ là cảm xúc, nó còn là tài sản có giá trị thực. Anh thấy với cách nhìn đó, {{pricing.apartment_from}} ở đây đang hay hay gắt quá ạ?"},
    {"speaker": "khach", "content": "Khi nói vậy thì nghe cũng okay. Nhưng anh vẫn chưa chắc."},
    {"speaker": "sales", "content": "Dạ hiểu ạ. Vậy thế này, anh chị thử đi xem thực tế căn hộ mẫu cuối tuần này, không cần quyết định gì hết, chỉ để cảm nhận thật sự. Thứ Bảy hay Chủ Nhật thuận hơn ạ?"}
  ]'::jsonb,
  '[{"type": "caution", "content": "KHÔNG trình bày nhiều số liệu khi khách đang ở cao trào cảm xúc — làm nguội mất nhiệt."}]'::jsonb,
  'Chuẩn bị câu hỏi dẫn dắt hình dung cụ thể gắn với dự án — không câu hỏi chung chung. Nhận biết khi cảm xúc của khách cao nhất và đặt đề nghị hành động ở đúng thời điểm đó. Khách Cảm Xúc hay thay đổi khi về nhà — hành động nhỏ ngay tại chỗ bảo toàn nhiệt.',
  ARRAY['khach_cam_xuc', 'hinh_dung_tuong_lai', 'view_bien', 'hanh_dong_nho'],
  ARRAY['nhìn đẹp', 'nghĩ thêm', 'cảm xúc', 'view biển', 'hình dung'],
  ARRAY['bds_pro'],
  ARRAY['e_50', 'e_45', 'd_40'],
  'Khách cảm xúc hình dung tương lai view biển hồ bơi sáng cuối tuần cảm nhận thực tế'),

-- TH 47: Khách Do Dự Mãn Tính
('e_47', 'TL05', 'E', 'Tính cách Khách hàng', 'Anh vẫn cần thêm thời gian — Khách Do Dự Mãn Tính',
  'Anh vẫn cần thêm thời gian',
  ARRAY['REFLECT', 'DIQ'], ARRAY[2, 3],
  'Khách Do Dự Mãn Tính không phải không có tiền, không phải không thích dự án. Họ có cơ chế tâm lý khiến không bao giờ cảm thấy đúng thời điểm. Mỗi lần sales giải quyết xong một mối lo, một mối lo mới xuất hiện — kéo dài hàng tháng. Nhận dạng: đã gặp nhiều lần, luôn "sắp quyết định" nhưng chưa bao giờ quyết định; hỏi lại câu tương tự. Khác với Khách Phân Tích, Khách Do Dự Mãn Tính biết mình đang trì hoãn, chỉ không biết tại sao. Lỗi phổ biến: tiếp tục cung cấp thêm thông tin mới và kiên nhẫn — điều này không giải quyết vấn đề, chỉ giúp khách thoải mái hơn với việc trì hoãn.',
  '{
    "surface": "Anh vẫn còn đang cân nhắc. Chưa chắc hẳn được.",
    "middle": "Có gì đó bên trong khiến tôi không thể bước. Tôi không biết là gì.",
    "root": "Tôi sợ hãi một điều cụ thể mà tôi chưa thể hoặc chưa chịu đặt tên cho nó. Hoặc quá trình quyết định của tôi cần một tác động từ bên ngoài mà tôi không tự tạo ra được."
  }'::jsonb,
  '{
    "reflect": "Dừng cung cấp thêm thông tin. Áp dụng REFLECT mạnh hơn bình thường: hỏi thẳng về cảm giác đang giữ khách lại, không phải về nội dung mối lo. Nếu khách chưa đặt tên được, sales nêu thẳng ba khả năng và để khách tự chọn.",
    "diq": "Chỉ áp dụng sau khi khách đã đặt tên được điểm nghẽn thật sự. Điểm nghẽn cụ thể mới có dữ liệu và insight phù hợp — điểm nghẽn mơ hồ thì không có DIQ nào đủ."
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "Anh vẫn thấy okay đấy nhưng chưa chắc quyết định được hôm nay."},
    {"speaker": "sales", "content": "Dạ, anh và em đã nói chuyện 6 tuần rồi. Em muốn hỏi thẳng một câu: điều gì thật sự đang giữ anh lại? Không phải lý do, mà là cảm giác."},
    {"speaker": "note", "content": "Chờ khá lâu. Không lấp khoảng lặng."},
    {"speaker": "khach", "content": "Khó nói quá. Cứ thấy như là... chưa phải lúc."},
    {"speaker": "sales", "content": "Dạ, anh biết được lúc đó là lúc nào không ạ? Có gì phải xảy ra thì anh thấy là đủ không?"},
    {"speaker": "khach", "content": "... (im lặng, lộ vẻ khó xử)"},
    {"speaker": "sales", "content": "Dạ, để em nói thẳng nhé. Thông thường khi ai đó cân nhắc lâu mà không có thêm thông tin mới, thường có ba khả năng: một là có lo ngại cụ thể chưa nói ra, hai là điều kiện tài chính chưa thỏa mãn dù nói được, ba là thời điểm này chưa thật sự muốn mua. Anh thấy mình gần nhất với điều nào ạ?"},
    {"speaker": "note", "content": "Chờ. Đây là câu quan trọng nhất của cuộc gặp."},
    {"speaker": "khach", "content": "Chắc là... anh chưa chắc về dòng tiền sau này."},
    {"speaker": "sales_diq", "content": "Dạ, cụ thể là phần nào của dòng tiền ạ — tiền trả gốc hàng tháng hay lo ngại nếu cần tiền gấp mà chưa bán được?"}
  ]'::jsonb,
  '[{"type": "never", "content": "KHÔNG tiếp tục cung cấp thêm thông tin mới sau 3+ lần gặp vẫn do dự — điều này chỉ giúp khách thoải mái với việc trì hoãn."}]'::jsonb,
  'Dũng cảm đặt câu hỏi thẳng thay vì tiếp tục lịch sự. Sau 3 lần gặp mà khách vẫn do dự, lịch sự không giúp gì thêm. Hai công cụ chính: câu hỏi trực tiếp về cảm giác và câu hỏi đặt tên ba khả năng. Khi khách đã đặt tên được điểm nghẽn, xử lý chính xác bằng DIQ.',
  ARRAY['khach_do_du', 'tri_hoan_man_tinh', 'ba_kha_nang', 'dat_ten_diem_nghen'],
  ARRAY['cần thêm thời gian', 'do dự', 'chưa phải lúc', 'cân nhắc'],
  ARRAY['bds_pro'],
  ARRAY['e_43', 'd_40', 'd_33'],
  'Khách do dự mãn tính cần thêm thời gian ba khả năng lo ngại cụ thể dòng tiền đặt tên điểm nghẽn'),

-- TH 48: Khách "Biết Tất Cả"
('e_48', 'TL05', 'E', 'Tính cách Khách hàng', 'Số liệu đó sai rồi — Khách Biết Tất Cả',
  'Số liệu đó sai rồi',
  ARRAY['REFLECT', 'DIQ'], ARRAY[2, 3],
  'Khách "Biết Tất Cả" vào cuộc gặp với thế trận phản bác. Đã tìm hiểu, đã nghe nhiều người, có thể đã làm trong ngành, hoặc tính cách không muốn bị ai dạy. Họ test sales từ phút đầu. Nhận dạng: ngắt lời, phản bác dữ liệu, trích dẫn nguồn khác để phủ nhận; giọng điệu kiểm tra. Thường là chuyên gia tài chính, luật sư, nhà đầu tư kinh nghiệm, hoặc người đã mất tiền ở dự án khác. Lỗi phổ biến: cố chứng minh mình đúng và phản biện trực tiếp — đây là bẫy. Họ không tìm câu trả lời, họ kiểm tra xem sales có bị kéo vào thế tự vệ không. Sales nào bị kéo vào là mất điểm ngay.',
  '{
    "surface": "Số liệu em đưa ra lệch rồi. CBRE vừa báo cáo thanh khoản khu Hạ Long giảm 30%.",
    "middle": "Tôi đã bị đặt vào thế bất lợi nhiều lần. Lần này tôi muốn kiểm soát cuộc gặp và không để bị thuyết phục bằng những thứ tôi đã nghe rồi.",
    "root": "Tôi sợ mất tiền và mất mặt. Tôi cần một người tư vấn thực sự biết mình đang nói gì. Nếu em vượt qua được bài kiểm tra của tôi, tôi sẽ tin và quyết định rất nhanh."
  }'::jsonb,
  '{
    "reflect": "Không cố gắng thắng cuộc tranh luận. Hỏi ngược lại cụ thể về nguồn số liệu của khách — không phải để phản bác mà để phân loại nguyên nhân lo ngại thật sự. Mục tiêu: buộc khách chia sẻ mục tiêu thật sự của họ.",
    "diq": "Áp dụng sau khi lớp phòng thủ hạ xuống: dữ liệu chính xác từ nguồn tin cậy, insight về sự khác biệt giữa những gì khách lo và thực tế dự án, câu hỏi khai mở để khách tự đánh giá. Khách này là khách tốt nhất khi đã tin — quyết định nhanh, ít đổi ý."
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "Số liệu em đưa ra lệch rồi. CBRE vừa có báo cáo nói thanh khoản BĐS {{project.area}} giảm 30% so với năm ngoái."},
    {"speaker": "sales", "content": "Dạ, báo cáo đó anh đang nói là báo cáo quý 3 hay quý 4 năm ngoái ạ?"},
    {"speaker": "note", "content": "Chờ. Không phản bác — cắt nhỏ câu từ chối thành phần xử lý được."},
    {"speaker": "khach", "content": "Quý 3. Sao?"},
    {"speaker": "sales", "content": "Dạ, vì quý 3 là đỉnh điểm của giai đoạn thị trường khó. Từ quý 4 thị trường {{project.area}} bắt đầu phục hồi theo số liệu từ Savills. Nhưng anh nêu điều đó ra có lý do cụ thể không ạ — hay anh đang xem xét thanh khoản vì anh tính đến chuyện bán lại trong trung hạn?"},
    {"speaker": "khach", "content": "Ừ, anh không giữ quá 5 năm."},
    {"speaker": "sales_diq", "content": "Dạ, vậy anh đang cần hiểu về thanh khoản thứ cấp trong khung 5 năm cụ thể, không phải thanh khoản thị trường chung. Hai thứ này khác nhau anh ạ. Theo số liệu giao dịch thứ cấp của các dự án {{project.developer}} đã bàn giao ven biển, tỷ lệ giao dịch thành công trong 6 tháng đầu sau bàn giao với căn view tốt dao động từ 65 đến 80%. Anh cho em hỏi, ngoài thanh khoản ra, còn điều gì anh muốn chắc trước khi quyết định không ạ?"},
    {"speaker": "khach", "content": "Còn pháp lý. Anh nghe nói dự án lấp biển kiểu này pháp lý hay phức tạp."},
    {"speaker": "sales", "content": "Dạ, pháp lý cụ thể anh đang lo là phần quyền sử dụng đất hay phần chứng chỉ quyền sở hữu ạ? Vì xử lý hai phần đó khác nhau hoàn toàn."}
  ]'::jsonb,
  '[{"type": "never", "content": "KHÔNG bị kéo vào tranh luận về số liệu — dùng số liệu của khách làm câu hỏi để khai thác động lực."}]'::jsonb,
  'Nắm chắc số liệu và nguồn gốc để hỏi ngược lại cụ thể mà không có vẻ đối đầu. Câu "Báo cáo đó quý nào ạ?" nghe như hỏi thêm nhưng thực ra cắt nhỏ câu từ chối thành phần xử lý được. Đây là biểu hiện rõ nhất của người tư vấn có vị thế.',
  ARRAY['khach_biet_tat_ca', 'phan_bac', 'khong_tranh_luan', 'cat_nho_tu_choi'],
  ARRAY['số liệu sai', 'CBRE', 'phản bác', 'biết tất cả'],
  ARRAY['bds_pro'],
  ARRAY['e_49', 'e_52', 'a_05'],
  'Khách biết tất cả phản bác số liệu CBRE Savills thanh khoản thứ cấp pháp lý lấp biển'),

-- TH 49: Khách So Sánh Nhiều Nơi
('e_49', 'TL05', 'E', 'Tính cách Khách hàng', 'Bên kia đang có giá tốt hơn — Khách So Sánh Nhiều Nơi',
  'Bên kia đang có giá tốt hơn',
  ARRAY['REFLECT', 'DIQ'], ARRAY[2, 3],
  'Khách So Sánh Nhiều Nơi đang xem song song 3-4 dự án, dùng thông tin nơi này để đặt câu hỏi nơi khác, thu thập dữ liệu cho bảng so sánh trong đầu. Chưa chọn nơi nào. Nhận dạng: "Bên kia chính sách tốt hơn", "Dự án A giá rẻ hơn mà cũng ở biển", "đang xem thêm mấy chỗ". Câu hỏi tập trung vào chiết khấu, ưu đãi, khác biệt với đối thủ cụ thể. Lỗi phổ biến: so sánh trực tiếp với đối thủ, nói xấu đối thủ, giảm giá để cạnh tranh — tất cả đặt sales vào vị trí yếu.',
  '{
    "surface": "Bên Sun Group giá mềm hơn. Dự án họ cũng ven biển, khoảng 20 triệu một mét vuông.",
    "middle": "Tôi chưa chắc dự án nào phù hợp nhất với mục tiêu của tôi. Tôi đang dùng so sánh như cách để thu hẹp lựa chọn.",
    "root": "Tôi muốn chắc rằng mình đang chọn đúng, không phải chọn nhanh. So sánh là cách tôi tự bảo vệ trước một quyết định lớn."
  }'::jsonb,
  '{
    "reflect": "Không so sánh trực tiếp với đối thủ. Áp dụng REFLECT để lộ ra tiêu chí quyết định thật sự của khách. Khi tiêu chí đã rõ, tự nhiên sẽ lộ ra dự án nào đáp ứng — không cần sales nói gì về đối thủ.",
    "diq": "Áp dụng sau khi tiêu chí được đặt tên: dữ liệu giao dịch thứ cấp của các dự án {{project.developer}} tương tự theo đúng tiêu chí khách quan tâm, insight về sự khác biệt giữa giá mua vào và giá trị đầu tư thực, câu hỏi để khách tự đánh giá."
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "Bên Sun Group giá mềm hơn. Dự án họ cũng ven biển, khoảng 20 triệu một mét vuông, rẻ hơn đây 5 triệu."},
    {"speaker": "sales", "content": "Dạ, anh đã xem thực tế bên dự án đó chưa ạ?"},
    {"speaker": "khach", "content": "Chưa, mới xem qua brochure."},
    {"speaker": "sales", "content": "Dạ. Anh cho em hỏi, khi anh so sánh hai dự án, tiêu chí nào anh thấy quan trọng nhất với mục tiêu của anh — giá mua vào hay khả năng bán lại sau này ạ?"},
    {"speaker": "note", "content": "Chờ. Đặt tên tiêu chí trước khi nói về dự án."},
    {"speaker": "khach", "content": "Giá quan trọng, nhưng quan trọng hơn là sau này có bán được không."},
    {"speaker": "sales", "content": "Dạ, vậy tiêu chí chính của anh là thanh khoản thứ cấp, không phải giá mua vào. Hai tiêu chí này đôi khi đi cùng nhau nhưng không phải lúc nào cũng vậy. Anh đã có số liệu về giao dịch thứ cấp của dự án anh đang xem kia chưa ạ?"},
    {"speaker": "khach", "content": "Chưa, họ chưa cung cấp."},
    {"speaker": "sales_diq", "content": "Dạ, đây là câu hỏi em nghĩ anh nên hỏi thẳng khi đi xem thực tế. Còn với {{project.name}}, em có số liệu giao dịch thứ cấp của các dự án {{project.developer}} đã bàn giao ven biển để anh có cơ sở so sánh theo đúng tiêu chí anh quan tâm. Anh muốn xem phần đó không ạ?"}
  ]'::jsonb,
  '[{"type": "never", "content": "KHÔNG so sánh trực tiếp với đối thủ hay nói xấu đối thủ — đặt sales vào vị trí yếu."}, {"type": "never", "content": "KHÔNG giảm giá để cạnh tranh — phá chính sách và tạo tiền lệ xấu."}]'::jsonb,
  'Thuộc số liệu lịch sử giao dịch thứ cấp của các dự án {{project.developer}} tương tự, có nguồn rõ ràng. Đây là vũ khí chính — giúp khách tự so sánh theo tiêu chí của họ mà không cần sales nói về đối thủ. Đặt câu hỏi để lộ tiêu chí trước khi nói bất cứ điều gì về dự án.',
  ARRAY['khach_so_sanh', 'tieu_chi_quyet_dinh', 'thanh_khoan_thu_cap', 'khong_noi_doi_thu'],
  ARRAY['giá tốt hơn', 'Sun Group', 'so sánh', 'bên kia'],
  ARRAY['bds_pro'],
  ARRAY['e_48', 'e_52', 'a_01'],
  'Khách so sánh nhiều nơi Sun Group giá mềm tiêu chí thanh khoản thứ cấp giao dịch'),

-- TH 50: Khách Mặc Cả Bằng Mọi Giá
('e_50', 'TL05', 'E', 'Tính cách Khách hàng', 'Em không làm gì thêm được cho anh sao? — Khách Mặc Cả Bằng Mọi Giá',
  'Em không làm gì thêm được cho anh sao?',
  ARRAY['REFLECT', 'DIQ'], ARRAY[2, 3, 4],
  'Khách Mặc Cả Bằng Mọi Giá biết mình muốn mua nhưng có nguyên tắc không nhượng: phải đòi được gì đó. Không nhất thiết tiền mặt — có thể là quà tặng, tiến độ, giữ giá lâu hơn. Với họ, mua mà không đòi được gì là thua. Nhận dạng: sau khi rõ có nhu cầu vẫn hỏi "Có thương lượng thêm không?", "Em làm gì được thêm không?". Lỗi phổ biến: từ chối thẳng rồi im lặng (khách cảm thấy bị từ chối) hoặc nhượng bộ nhanh bằng quà tặng ngoài chính sách (tạo tiền lệ ép thêm).',
  '{
    "surface": "Em không làm gì thêm được cho anh sao? Giá này khá cứng rồi.",
    "middle": "Tôi muốn cảm giác mình đã đòi được giá trị hơn khi chỉ trả tiền. Đây là nguyên tắc, không phải vì tôi thật sự thiếu tiền.",
    "root": "Tôi muốn cân bằng quá trình đàm phán, bảo vệ bản năng tự trọng của mình. Nếu mua mà không đòi được gì, tôi cảm thấy mình bị thiệt."
  }'::jsonb,
  '{
    "reflect": "Không giảm giá ngoài chính sách. Không từ chối thẳng. Hỏi điều gì khiến khách thấy còn cần thêm phần đó — để lộ ra Động lực thật: không phải tiền mà là cảm giác chiến thắng trong đàm phán.",
    "diq": "Áp dụng để tái định nghĩa giá trị: dữ liệu về tác động của vị trí tốt đến giá bán lại, insight rằng chọn vị trí trước khi mở bán đại trà có giá trị thực cao hơn 2% chiết khấu, câu hỏi để khách tự kết luận Con đường nào lợi hơn."
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "Em có thể giảm thêm 2% không? Anh thấy giá hơi cứng."},
    {"speaker": "sales", "content": "Dạ, em hiểu anh. Giá {{project.developer}} là giá chung cho tất cả khách, em không có khoảng thương lượng ngoài chính sách chính thức. Nhưng anh cho em hỏi, 2% đó khoảng 125 triệu với căn hộ anh đang xem — điều gì khiến anh thấy còn cần thêm phần đó ạ?"},
    {"speaker": "note", "content": "Chờ. Để lộ ra đây là nguyên tắc đàm phán, không phải nhu cầu tài chính."},
    {"speaker": "khach", "content": "Thì... anh nghĩ lúc nào cũng nên thử."},
    {"speaker": "sales_diq", "content": "Dạ, em hiểu. Theo số liệu giao dịch thứ cấp của {{project.developer}}, căn có view biển và tầng cao thường có giá bán lại cao hơn căn cùng diện tích từ 12 đến 18%. Anh đang sử dụng chính sách giữ giá 30 ngày khi đặt cọc, và nếu đặt cọc trước ngày 30 tháng này, em có thể ưu tiên cho anh chọn tầng và view trước khi mở bán đại trà. Anh thấy lợi thế đó so với 2% chiết khấu, cái nào có giá trị thực tế cao hơn với mục tiêu đầu tư của anh ạ?"},
    {"speaker": "khach", "content": "Thôi được, nhưng em phải chắc là cho anh tầng và view anh muốn."},
    {"speaker": "sales", "content": "Dạ, anh nói rõ tầng và hướng anh muốn để em xác nhận ngay hôm nay với chủ đầu tư. Nếu được, mình chốt luôn trong tuần này được không ạ?"}
  ]'::jsonb,
  '[{"type": "never", "content": "KHÔNG bao giờ giảm giá ngoài chính sách — phá chính sách và tạo tiền lệ ép thêm."}, {"type": "never", "content": "KHÔNG từ chối thẳng rồi im lặng — khách cảm thấy bị từ chối và mất mặt."}]'::jsonb,
  'Hiểu chính sách ưu đãi chính thức đủ để chuyển thành giá trị cụ thể bằng số liệu có nguồn. Kết thúc đàm phán theo chiều khách cảm thấy thắng mà sales vẫn giữ được giá. Luôn có thứ thay thế có giá trị tương đương hoặc cao hơn mà khách chưa tính đến.',
  ARRAY['khach_mac_ca', 'khong_giam_gia', 'tai_dinh_nghia_gia_tri', 'uu_tien_vi_tri'],
  ARRAY['giảm giá', 'thương lượng', 'làm thêm', 'mặc cả'],
  ARRAY['bds_pro'],
  ARRAY['e_44', 'a_03', 'd_40'],
  'Khách mặc cả giảm giá chính sách ưu tiên vị trí view biển tầng cao 12 18 phần trăm'),

-- TH 51: Khách Cần Cả Gia Đình Đồng Thuận
('e_51', 'TL05', 'E', 'Tính cách Khách hàng', 'Để tôi hỏi ý kiến gia đình rồi tính — Khách Cần Cả Gia Đình Đồng Thuận',
  'Để tôi hỏi ý kiến gia đình rồi tính',
  ARRAY['REFLECT', 'DIQ', '3TP'], ARRAY[1, 2, 4],
  'Khách Cần Cả Gia Đình Đồng Thuận là người có nhu cầu thật, có khả năng tài chính, nhưng quyết định phụ thuộc vào phê chuẩn của nhóm người khác (vợ chồng, bố mẹ, anh chị em). Khác với Khách Hòa Giải ở chỗ: họ biết rõ ai cần đồng thuận và tại sao. Nhận dạng: trong buổi gặp quan tâm nhưng luôn kết thúc "để hỏi người nhà"; "bố mẹ tôi là người bỏ vốn"; cuộc gặp thứ hai vẫn chưa có thêm ai đi cùng. Lỗi phổ biến: tiếp tục tư vấn riêng cho người đã gặp mà không kéo người quyết định thật sự vào cuộc — thông tin qua trung gian mất đi nhiều.',
  '{
    "surface": "Anh thấy cần hỏi vợ cái đã. Cô ấy hay quan tâm những chuyện này hơn.",
    "middle": "Tôi cần bảo vệ mình khỏi việc bị người thân phản đối sau khi đã đặt cọc. Tổn thương lớn nhất không phải mất tiền mà là mất sự tin tưởng trong gia đình.",
    "root": "Quyết định này ảnh hưởng đến cả gia đình, nên cả gia đình phải là một phần của quá trình. Đây không phải sự do dự mà là quá trình quyết định chính đáng."
  }'::jsonb,
  '{
    "reflect": "Áp dụng REFLECT để xác định người quyết định thật sự và điều họ quan tâm TRƯỚC khi tổ chức cuộc gặp tiếp theo. Không mời gặp chung mà không biết người còn lại quan tâm đến gì.",
    "diq": "Áp dụng khi chuẩn bị nội dung cho cuộc gặp có đủ mặt người: dữ liệu về tiện ích và pháp lý theo đúng góc người chưa đến quan tâm, insight ngắn gọn, câu hỏi khai mở để cả hai cùng tham gia. Gửi tài liệu chuẩn bị trước cuộc gặp để người chưa đến có lý do muốn đến."
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "Anh thấy cần hỏi thêm chị nhà. Chị ấy hay có ý kiến về mấy chuyện này hơn."},
    {"speaker": "sales", "content": "Dạ, anh nói vậy em hiểu. Chị ấy thường quan tâm đến phần nào nhất khi xem xét bất động sản ạ — phần pháp lý, tài chính, hay phần sử dụng thực tế ạ?"},
    {"speaker": "note", "content": "Chờ. Xác định góc quan tâm của người quyết định thật sự."},
    {"speaker": "khach", "content": "Chị ấy hay hỏi về sinh hoạt hàng ngày, trường học, siêu thị, mấy thứ đó."},
    {"speaker": "sales", "content": "Dạ, vậy là chị ấy đang nhìn từ góc độ sử dụng thực tế. Em có thể chuẩn bị riêng thông tin về trường quốc tế, bệnh viện, trung tâm thương mại trong bán kính 5 km của dự án, gửi trước để chị ấy xem. Khi đi gặp, mình đi thẳng vào những điểm chị ấy quan tâm, khỏi phải nghe lại từ đầu. Anh thấy có khi nào cả anh và chị ấy cùng rảnh để đi một buổi không, khoảng 45 phút là đủ?"},
    {"speaker": "khach", "content": "Để anh hỏi chị. Cuối tuần này có thể được."},
    {"speaker": "sales", "content": "Dạ tuyệt. Anh nhắn số em. Em gửi trước thông tin tiện ích và tóm tắt pháp lý để chị ấy xem trước. Cuối tuần này anh thấy thứ Bảy hay Chủ Nhật thuận hơn?"}
  ]'::jsonb,
  '[{"type": "never", "content": "KHÔNG tổ chức cuộc gặp chung mà chưa biết người chưa đến quan tâm đến gì — cuộc gặp sẽ không hiệu quả."}]'::jsonb,
  'Nắm rõ ai trong gia đình quan tâm đến phần nào và chuẩn bị nội dung theo từng người. Đưa ra lý do cụ thể để người chưa đến muốn đến — gửi thông tin chuẩn bị riêng cho người đó trước cuộc gặp là cách hiệu quả nhất để họ tự thu xếp thời gian.',
  ARRAY['khach_gia_dinh_dong_thuan', 'nguoi_quyet_dinh', 'chuan_bi_rieng', 'tien_ich_thuc_te'],
  ARRAY['hỏi gia đình', 'hỏi vợ', 'bố mẹ', 'đồng thuận'],
  ARRAY['bds_pro'],
  ARRAY['e_45', 'd_36', 'e_54'],
  'Khách gia đình đồng thuận hỏi vợ bố mẹ trường học bệnh viện trung tâm thương mại tiện ích'),

-- TH 52: Khách Đầu Tư Thuần ROI
('e_52', 'TL05', 'E', 'Tính cách Khách hàng', 'Cho thuê được bao nhiêu? Hoàn vốn mấy năm? — Khách Đầu Tư Thuần ROI',
  'Cho thuê được bao nhiêu? Hoàn vốn mấy năm?',
  ARRAY['DIQ'], ARRAY[3, 4],
  'Khách Đầu Tư Thuần ROI chỉ quan tâm một thứ: tiền vào bao nhiêu, tiền ra bao nhiêu, trong bao lâu. Không mua vì thương hiệu, thẩm mỹ hay cảm xúc. Nếu bài toán không chạy, họ đi. Nhận dạng: hỏi trực tiếp lợi suất, giá cho thuê/tháng, tỷ suất hoàn vốn, giá bán lại sau N năm; có thể mang bảng tính sẵn. Lỗi phổ biến nghiêm trọng nhất: trả lời bằng con số không có nguồn gốc, hoặc bịa ra tỷ suất để làm lòng khách. Khi khách kiểm tra lại, toàn bộ uy tín sụp đổ.',
  '{
    "surface": "Em cho anh biết căn hộ này cho thuê được bao nhiêu một tháng? Hoàn vốn trong mấy năm?",
    "middle": "Tôi đã đầu tư sai ở dự án khác vì nghe lời sales quá nhiều. Lần này tôi cần số liệu thực, có thể kiểm chứng được.",
    "root": "Tôi muốn bảo toàn và phát triển tài sản một cách có căn cứ. Tôi cần một người tư vấn cũng có tiêu chuẩn như tôi về chứng cứ."
  }'::jsonb,
  '{
    "reflect": "Không REFLECT nhiều — họ hỏi thật, không phòng thủ. Đi thẳng vào DIQ.",
    "diq": "Cung cấp số liệu có nguồn gốc rõ ràng và phân biệt rõ đây là tham khảo, không phải cam kết. Nếu không có số liệu chính xác, NÓI THẲNG chưa có và hứa xác nhận lại — một câu nói thẳng về việc chưa biết có giá trị gấp mười lần một con số đẹp không căn cứ. Insight cốt lõi: phân biệt gross yield vs net yield, thanh khoản thứ cấp vs tốc độ hấp thụ sơ cấp, giảm giá thị trường vs mất vốn thật. Câu hỏi khai mở để khách tự xây kịch bản theo biến số họ tự xác định."
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "Nói thẳng đi, cho thuê được bao nhiêu? Hoàn vốn mấy năm?"},
    {"speaker": "sales_diq", "content": "Dạ, anh hỏi phần em có thể trả lời được và phần em cần nói thẳng là chưa có số liệu chính thức. Phần em có: giá cho thuê tham khảo căn hộ tương tự tại {{project.location_detail}} hiện tại là 10 đến 15 triệu một tháng theo số liệu Batdongsan quý 4 năm ngoái, phụ thuộc diện tích và view. Phần em chưa có: số liệu cho thuê chính thức của dự án vì dự án chưa bàn giao."},
    {"speaker": "khach", "content": "Vậy thì tính được gì?"},
    {"speaker": "sales", "content": "Dạ, với căn hộ 2 phòng ngủ, giá 2,5 tỷ, nếu lấy mốc tham khảo 12 triệu một tháng thì tỷ suất gross khoảng 5,7% một năm. Chưa tính phí quản lý và thời gian trống. Anh thấy con số này so với kênh đầu tư khác anh đang dùng như thế nào ạ?"},
    {"speaker": "khach", "content": "Gửi ngân hàng đang 5,2%. Nhưng BĐS có rủi ro hơn."},
    {"speaker": "sales_diq", "content": "Dạ, anh nhận ra đúng phần em muốn nói. Rủi ro của BĐS là thanh khoản chậm hơn tiền gửi. Nhưng nếu anh giữ 5 năm, giá trị tăng vốn của căn hộ này sẽ là bài toán riêng, khác với lãi suất tiền gửi. Anh muốn em chạy thử số cuối với cả hai biến số — tỷ suất cho thuê và tỷ lệ tăng giá — theo ba kịch bản thận trọng, cơ sở, và lạc quan không ạ?"}
  ]'::jsonb,
  '[{"type": "never", "content": "KHÔNG BAO GIỜ bịa số tỷ suất để làm lòng khách — khi khách kiểm tra lại, toàn bộ uy tín sụp đổ."}, {"type": "never", "content": "KHÔNG trả lời bằng con số không có nguồn gốc — luôn phân biệt rõ tham khảo vs cam kết."}]'::jsonb,
  'Thuộc số liệu tham khảo thị trường có nguồn cụ thể. Phân biệt gross yield và net yield, hiểu cách tính đơn giản để cùng khách làm việc với bảng tính. Kỹ năng quan trọng nhất: biết nói "em chưa có số liệu chính xác, để em xác nhận lại" thay vì bịa số.',
  ARRAY['khach_dau_tu_roi', 'gross_yield', 'net_yield', 'ba_kich_ban'],
  ARRAY['cho thuê', 'hoàn vốn', 'ROI', 'tỷ suất', 'Batdongsan'],
  ARRAY['bds_pro'],
  ARRAY['e_43', 'e_49', 'e_48'],
  'Khách đầu tư ROI cho thuê hoàn vốn gross yield net yield Batdongsan thận trọng cơ sở lạc quan'),

-- E-A1: Nâng cao — Khách thay đổi tính cách giữa chừng
('e_53', 'TL05', 'E', 'Tính cách Khách hàng (Nâng cao)', 'E-A1: Khách thay đổi tính cách giữa chừng trong buổi tư vấn',
  'Khách thay đổi tính cách giữa chừng',
  ARRAY['REFLECT', 'DIQ', '3TP'], ARRAY[1, 2, 3, 4],
  'Tính cách khách thể hiện ở đầu buổi không giữ nguyên đến cuối. Khách Quyết Đoán bắt đầu ngắn gọn, giữa buổi hỏi chi tiết như Phân Tích. Khách Hòa Giải dễ chịu, cuối buổi đột ngột đặt câu hỏi khó như "Biết Tất Cả". Lý do: khách đang kiểm tra theo nhiều lớp — lớp đầu kiến thức, lớp sau bản lĩnh. Sales bị bất ngờ và lúng túng là đã không vượt qua lớp thứ hai. Lỗi phổ biến: tiếp tục dùng chiến lược ban đầu khi tính cách khách đã thay đổi rõ ràng; hoặc thay đổi chiến lược quá lộ liễu khiến khách mất tự nhiên.',
  '{
    "surface": "Bắt đầu như Khách Quyết Đoán, sau đó chuyển sang hỏi chi tiết như Khách Phân Tích.",
    "middle": "Tôi đang kiểm tra theo nhiều lớp. Lớp đầu là kiến thức. Lớp sau là bản lĩnh.",
    "root": "Tôi muốn tìm một người có thể theo kịp cách tôi suy nghĩ, không phải người bám theo một kịch bản cố định."
  }'::jsonb,
  '{
    "reflect": "Khi khách đặt câu hỏi phản bác đột ngột, chuyển sang REFLECT: hỏi ngược để phân loại. Không cứng nhắc theo một chiến lược từ đầu đến cuối.",
    "diq": "Khi khách chuyển sang hỏi chi tiết, chuyển sang DIQ với nhịp chậm hơn và độ sâu lớn hơn. Dấu hiệu nhận biết chuyển đổi: tốc độ nói chậm lại, câu hỏi dài hơn, giọng điệu thay đổi. Đọc được trong 1-2 câu trả lời và điều chỉnh kịp."
  }'::jsonb,
  '[
    {"speaker": "note", "content": "[Đầu buổi — tính cách Quyết Đoán]"},
    {"speaker": "khach", "content": "Giá bao nhiêu? Chính sách gì? Có hỗ trợ vay không?"},
    {"speaker": "sales", "content": "Dạ. Căn hộ từ {{pricing.apartment_from}}, chính sách giãn đến {{financing.schedule_end}}, hỗ trợ vay {{financing.loan_ratio}} lãi 0% trong {{financing.rate_free_period}}. Chị đang nhắm phân khúc nào ạ?"},
    {"speaker": "note", "content": "[15 phút sau — tính cách chuyển sang Phân Tích]"},
    {"speaker": "khach", "content": "Dự án này pháp lý cụ thể thế nào? {{legal.approval_doc}} bao gồm những phần nào? GPMB {{project.gpmb_percent}} là tính theo diện tích hay theo số lượng hộ?"},
    {"speaker": "note", "content": "Sales nhận ra sự chuyển đổi, điều chỉnh ngay — chuyển từ nhịp ngắn sang nhịp chi tiết."},
    {"speaker": "sales", "content": "Dạ, chị hỏi đúng phần quan trọng nhất. {{legal.approval_doc}} phê duyệt quy hoạch tổng thể {{project.size}}, bao gồm cả phần đất lấp biển và phần đất liền. GPMB {{project.gpmb_percent}} tính theo diện tích. Chị muốn em gửi văn bản phê duyệt để chị đọc trực tiếp không ạ, hay chị muốn mình ngồi đọc cùng nhau?"},
    {"speaker": "note", "content": "Chờ. Sales đã chuyển nhịp theo khách — đây là điểm khác biệt giữa tư vấn viên trung bình và xuất sắc."}
  ]'::jsonb,
  '[{"type": "never", "content": "KHÔNG tiếp tục dùng chiến lược ban đầu khi khách đã chuyển tính cách rõ ràng — khách sẽ cảm thấy sales không theo kịp."}, {"type": "caution", "content": "KHÔNG thay đổi chiến lược quá lộ liễu — khách nhận ra và mất tự nhiên."}]'::jsonb,
  'Theo dõi nhịp khách liên tục trong suốt buổi gặp — không đánh giá tính cách một lần rồi áp dụng cả buổi. Sự linh hoạt này là điểm phân biệt tư vấn viên xuất sắc. Ba dấu hiệu chuyển đổi chính: tốc độ, độ dài câu hỏi, giọng điệu.',
  ARRAY['nang_cao', 'thay_doi_tinh_cach', 'nhieu_lop_kiem_tra', 'linh_hoat_nhip'],
  ARRAY['thay đổi giữa chừng', 'nhiều lớp', 'bản lĩnh', 'linh hoạt'],
  ARRAY['bds_pro'],
  ARRAY['e_44', 'e_43', 'e_48'],
  'Nâng cao thay đổi tính cách giữa chừng nhiều lớp kiểm tra kiến thức bản lĩnh linh hoạt nhịp'),

-- E-A2: Nâng cao — Hai người tính cách đối lập
('e_54', 'TL05', 'E', 'Tính cách Khách hàng (Nâng cao)', 'E-A2: Hai người trong cùng một buổi có tính cách đối lập nhau',
  'Hai người có tính cách đối lập trong cùng buổi gặp',
  ARRAY['REFLECT', '3TP'], ARRAY[1, 2, 4],
  'Anh là Khách Quyết Đoán muốn đi thẳng vào quyết định. Chị là Khách Phân Tích muốn hỏi thêm nhiều trước khi kết luận. Sales cố phục vụ cả hai cùng lúc thường chỉ làm cả hai không hài lòng. Lý do: hai người đến với hai bộ tiêu chí quyết định và hai tốc độ xử lý thông tin khác nhau. Trong hầu hết gia đình, đây không phải lần đầu họ gặp mâu thuẫn này — họ có cách giải quyết riêng mà sales không cần can thiệp. Lỗi phổ biến: chọn một bên để tập trung phục vụ, bỏ qua người còn lại — người bị bỏ qua sẽ trở thành lý do quyết định không được đưa ra.',
  '{
    "surface": "Anh muốn đi thẳng vào quyết định. Chị muốn hỏi thêm nhiều trước.",
    "middle": "Cả hai đang mang hai bộ tiêu chí quyết định khác nhau vào cùng một cuộc trò chuyện.",
    "root": "Cả hai đều muốn quyết định đúng, nhưng đang định nghĩa \"đúng\" theo cách khác nhau."
  }'::jsonb,
  '{
    "reflect": "Không chọn bên. Phục vụ cả hai bằng cách tách cuộc trò chuyện thành hai lớp: lớp quyết định ngắn gọn cho người Quyết Đoán và lớp phân tích chi tiết cho người Phân Tích — nhưng không xảy ra cùng lúc trong cùng phòng.",
    "diq": "Đề nghị bước tiếp theo trung lập phục vụ cả hai. Gửi tài liệu chi tiết để người Phân Tích đọc trước, trong khi người Quyết Đoán đã có đủ thông tin để sơ bộ xác nhận hướng. Buổi gặp tiếp theo: người Phân Tích có câu hỏi cụ thể, người Quyết Đoán không phải nghe lại từ đầu."
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "[Anh] Thôi mình chốt đi, thông tin đã đủ rồi."},
    {"speaker": "khach", "content": "[Chị] Anh chờ chị chút, chị còn muốn hỏi về pháp lý và tiến độ cụ thể."},
    {"speaker": "note", "content": "Sales nhận ra mâu thuẫn, không đứng về bên nào."},
    {"speaker": "sales", "content": "Dạ, em thấy cả anh và chị đều có lý. Anh đã có đủ thông tin để xác nhận đây là hướng đáng cân nhắc. Chị cần thêm một số thông tin cụ thể trước khi cảm thấy ổn. Hai việc đó không mâu thuẫn nhau. Em đề nghị thế này: hôm nay mình xác nhận sơ bộ anh chị quan tâm đến loại căn nào và em giữ thông tin đó lại. Em gửi cho chị tài liệu pháp lý và tiến độ chi tiết để chị đọc trong 2 ngày tới. Chị có câu hỏi nào em trả lời luôn qua Zalo. Cuối tuần này mình gặp lại 30 phút, chị hỏi xong thì mình quyết định. Hai anh chị thấy cách đó có ổn không ạ?"}
  ]'::jsonb,
  '[{"type": "never", "content": "KHÔNG chọn bên để phục vụ — người bị bỏ qua sẽ trở thành lý do quyết định không được đưa ra."}]'::jsonb,
  'Đủ nhạy cảm để nhận ra ai đang giữ vai trò ngăn cản và ai đang tạo áp lực. Tìm bước tiếp theo trung lập phục vụ cả hai mà không làm bên nào cảm thấy bị bỏ qua hoặc bị ép. Nhận ra gia đình có cách giải quyết riêng — sales không cần can thiệp vào.',
  ARRAY['nang_cao', 'hai_tinh_cach_doi_lap', 'buoc_trung_lap', 'khong_chon_ben'],
  ARRAY['hai người đối lập', 'vợ chồng khác tính', 'trung lập'],
  ARRAY['bds_pro'],
  ARRAY['e_44', 'e_43', 'e_51'],
  'Nâng cao hai tính cách đối lập quyết đoán phân tích vợ chồng bước trung lập hai lớp'),

-- E-A3: Nâng cao — Khách đóng vai không quan tâm
('e_55', 'TL05', 'E', 'Tính cách Khách hàng (Nâng cao)', 'E-A3: Khách đóng vai "không quan tâm" nhưng hỏi rất sâu',
  'Khách đóng vai không quan tâm nhưng hỏi rất sâu',
  ARRAY['DIQ', '3TP'], ARRAY[1, 3, 4],
  'Khách nói "tôi chỉ xem cho biết", "chưa có kế hoạch mua ngay" — nhưng hỏi rất cụ thể về pháp lý, tài chính, tiến độ. Người thật sự không quan tâm không hỏi ở mức độ đó. Lý do: khách đang bảo vệ mình khỏi áp lực quyết định bằng cách hạ kỳ vọng hai phía — nếu nói "chỉ xem cho biết" thì sales sẽ không ép, và họ tìm hiểu thoải mái hơn. Một lý do khác: đã quyết định sơ bộ rồi, cần thêm thông tin để xác nhận. Lỗi phổ biến: tin vào lời khách và thả lỏng không chốt bước tiếp theo; hoặc ngược lại, ép chốt vì nhận ra khách đang quan tâm — khiến khách cảm thấy bị nhìn thấu và rút lui.',
  '{
    "surface": "Nói \"chỉ xem cho biết thôi\" nhưng hỏi rất cụ thể và chi tiết.",
    "middle": "Tôi muốn có không gian tìm hiểu mà không bị áp lực. Nếu tôi thể hiện quan tâm quá rõ, sales sẽ ép tôi quyết định.",
    "root": "Tôi có thể đã quyết định sơ bộ rồi. Tôi đang tìm thêm thông tin để xác nhận, không phải để bắt đầu."
  }'::jsonb,
  '{
    "reflect": "Không gọi ra sự mâu thuẫn giữa lời nói và hành động của khách. Sales chỉ cần phục vụ tốt câu hỏi thật sự.",
    "diq": "DIQ áp dụng tự nhiên vì khách đang hỏi thật. Cung cấp dữ liệu chính xác, insight ngắn gọn, câu hỏi để khách tự rút ra kết luận. Bước tiếp theo đề xuất như một DỊCH VỤ BỔ SUNG, không phải bước trong quy trình chốt sale — để khách có cảm giác tự kiểm soát tốc độ."
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "[Sau 40 phút hỏi chi tiết] Thôi được, anh biết đủ rồi. Anh về nghĩ thêm."},
    {"speaker": "sales", "content": "Dạ, anh đã hỏi rất kỹ, em nghĩ anh đang muốn chắc về một vài điểm cụ thể trước khi quyết định tiếp tục tìm hiểu. Em đề nghị thế này: không cần anh quyết định gì hôm nay, nhưng để em chuẩn bị một bảng tóm tắt những điểm anh vừa hỏi, kèm tài liệu gốc để anh có thể tự kiểm tra. Em gửi trong hôm nay. Nếu anh có thêm câu hỏi nào sau khi đọc, em trả lời qua Zalo. Anh thấy cách đó có ổn không?"},
    {"speaker": "note", "content": "Chờ. Đề xuất không có vẻ ép quyết định nhưng vẫn tạo bước tiếp theo cụ thể."},
    {"speaker": "khach", "content": "Ừ được, gửi cho anh xem."},
    {"speaker": "sales", "content": "Dạ, anh cho em số để em gửi ngay. Em gọi lại cho anh vào thứ Tư để mình đi qua những điểm anh còn muốn rõ hơn. Anh thấy buổi chiều hay tối thứ Tư thuận hơn ạ?"}
  ]'::jsonb,
  '[{"type": "never", "content": "KHÔNG gọi ra sự mâu thuẫn giữa \"chỉ xem cho biết\" và hành động hỏi sâu — khách cảm thấy bị nhìn thấu và rút lui."}, {"type": "never", "content": "KHÔNG ép chốt — phá vỡ cảm giác tự kiểm soát của khách."}]'::jsonb,
  'Phân biệt "không quan tâm thật sự" và "không quan tâm như chiến lược tự bảo vệ". Dấu hiệu nhận biết: chiều dài và độ cụ thể câu hỏi, mức độ chú ý khi sales trả lời, sự kiên nhẫn ngồi lại sau khi tuyên bố "chỉ xem cho biết". Đề xuất bước tiếp theo theo cách không có vẻ như đang chốt sale.',
  ARRAY['nang_cao', 'dong_vai_khong_quan_tam', 'dich_vu_bo_sung', 'tu_kiem_soat_toc_do'],
  ARRAY['chỉ xem cho biết', 'chưa có kế hoạch', 'hỏi sâu', 'đóng vai'],
  ARRAY['bds_pro'],
  ARRAY['e_43', 'e_47', 'e_52'],
  'Nâng cao đóng vai không quan tâm hỏi sâu pháp lý tài chính tiến độ bảng tóm tắt dịch vụ bổ sung Zalo');

-- ============================================================
-- End TL05 (13 scenarios: TH43-52 + E-A1/A2/A3)
-- ============================================================
