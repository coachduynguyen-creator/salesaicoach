-- ============================================================
-- TL04: Phần D — Từ chối Thời điểm & Do dự (TH 33-42 + BS-A/B/C) — 13 tình huống
-- ID prefix: d_ (section D)
-- ============================================================

INSERT INTO public.scenarios (id, doc_ref, section_code, section_title, title, objection_verbatim,
  methodology_tools, active_stages, analysis, customer_psychology, approach, script, warnings,
  skills_required, tags, keywords, tier_access, related_ids, search_content)
VALUES

-- TH 33: "Để tôi chờ thị trường ổn định đã"
('d_33', 'TL04', 'D', 'Từ chối Thời điểm & Do dự', 'Để tôi chờ thị trường ổn định đã',
  'Để tôi chờ thị trường ổn định đã',
  ARRAY['REFLECT', 'DIQ'], ARRAY[2, 3],
  'Đây là câu từ chối phổ biến nhất trong nhóm do dự thời điểm. Khách không phủ nhận dự án, không từ chối vĩnh viễn, nhưng neo quyết định vào một điều kiện mơ hồ là "thị trường ổn định". Lỗi sales hay mắc: giải thích thị trường đang tốt, hoặc đồng ý thị trường có biến động rồi mới cam đoan tương lai. Cả hai đều chấp nhận tiền đề của khách và đặt mình vào thế thủ.',
  '{
    "surface": "Lo ngại thị trường bất ổn, chưa thấy đây là thời điểm an toàn để quyết định.",
    "middle": "Chưa sẵn sàng cam kết tài chính lớn trong bối cảnh không chắc chắn. Chưa định nghĩa được \"ổn định\" trông như thế nào.",
    "root": "Sợ mua sai thời điểm và bị kẹt vốn. Đây là nỗi sợ cốt lõi, không phải phán xét về thị trường."
  }'::jsonb,
  '{
    "reflect": "Câu hỏi phản chiếu nhắm vào định nghĩa \"ổn định\" của khách, không vào thị trường đang tốt hay xấu. Khi khách không thể định nghĩa được \"ổn định trông như thế nào cụ thể\", họ tự nhận ra mình đang chờ một điều kiện không có cơ sở.",
    "diq": "DIQ áp dụng khi khách bắt đầu mở: dữ liệu về mối quan hệ nghịch chiều giữa \"ổn định\" và giá thấp, insight rằng không ai mua được BĐS tốt ở đáy vì đáy chỉ nhìn thấy khi đã qua, câu hỏi để khách tự đánh giá chi phí cơ hội của việc chờ."
  }'::jsonb,
  '[
    {"speaker": "sales", "content": "Dạ, anh đang hình dung ổn định trông như thế nào ạ? Anh đang chờ giá BĐS giữ nguyên, lãi suất xuống một ngưỡng cụ thể, hay điều gì khác?"},
    {"speaker": "note", "content": "Chờ. Không gợi ý thêm. Để khách tự định nghĩa."},
    {"speaker": "khach", "content": "Thì chờ thị trường bớt biến động, không lên xuống thất thường như này."},
    {"speaker": "sales", "content": "Dạ, anh có đặt ra một mốc cụ thể không ạ kiểu như khi X xảy ra thì mình sẽ quyết định?"},
    {"speaker": "note", "content": "Chờ. Để khách nhận ra bản thân chưa có mốc rõ ràng."},
    {"speaker": "khach", "content": "Cũng chưa nghĩ cụ thể lắm."},
    {"speaker": "sales_diq", "content": "Dạ, em chia sẻ một điều anh thấy có đúng không. Khi thị trường ổn định theo kiểu anh đang hình dung, giá thường đã lên rồi vì thị trường biến động thấp và giá thấp thường không xảy ra cùng lúc. Người mua ở giai đoạn ổn định thường đang mua ở giá đã tăng một vòng so với giai đoạn biến động. Anh đánh giá điều đó thế nào?"},
    {"speaker": "note", "content": "Chờ. Không giải thích thêm. Để khách tự xử lý."},
    {"speaker": "sales", "content": "Dạ, anh còn điều gì cụ thể chưa chắc ạ ngoài cảm giác thời điểm? Em hỏi để mình xác định được đúng điểm cần làm rõ."}
  ]'::jsonb,
  '[]'::jsonb,
  'Nghe câu trả lời của khách về "ổn định" để phân loại: lo lãi suất xử lý khác với lo giá, lo thanh khoản xử lý khác với lo pháp lý. Không vội giải thích thị trường đang tốt — chờ khách tự nói tiền đề của họ trước khi áp dụng DIQ.',
  ARRAY['cho_thi_truong', 'on_dinh', 'tri_hoan', 'chi_phi_co_hoi'],
  ARRAY['chờ thị trường', 'ổn định', 'biến động', 'đáy thị trường'],
  ARRAY['bds_pro'],
  ARRAY['d_34', 'd_38', 'a_11'],
  'Chờ thị trường ổn định biến động giá đáy chi phí cơ hội định nghĩa cụ thể'),

-- TH 34: "Cuối năm nay tính, giờ chưa phải lúc"
('d_34', 'TL04', 'D', 'Từ chối Thời điểm & Do dự', 'Cuối năm nay tính, giờ chưa phải lúc',
  'Cuối năm nay tính, giờ chưa phải lúc',
  ARRAY['REFLECT', 'DIQ'], ARRAY[2, 3],
  'Khách đưa ra mốc thời gian cụ thể hơn nhưng "cuối năm" thường là mốc cảm tính không có căn cứ. Lỗi phổ biến: chấp nhận mốc này, hẹn gặp lại cuối năm và để khách nguội dần. Hoặc cố thuyết phục "giờ cũng tốt" mà không hiểu tại sao khách đặt ra mốc cuối năm. Cả hai đều không chạm vào vấn đề thật.',
  '{
    "surface": "Chưa đến thời điểm phù hợp để ra quyết định.",
    "middle": "Đang chờ một sự kiện trong cuộc sống cá nhân: thu nhập, tài chính, dự án khác. Hoặc đơn giản là cần thêm thời gian để cảm thấy sẵn sàng.",
    "root": "Chưa sẵn sàng tâm lý. Cần thêm thời gian để cảm thấy đúng với quyết định lớn."
  }'::jsonb,
  '{
    "reflect": "Tìm ra lý do thật phía sau mốc cuối năm. Nếu có lý do cụ thể như chờ thưởng hay bán tài sản khác, đó là thông tin để xử lý. Nếu không có lý do cụ thể, câu hỏi phản chiếu giúp khách nhận ra mốc đó là tùy tiện.",
    "diq": "Áp dụng khi đã xác định lý do cụ thể: dữ liệu về chính sách thanh toán giãn tiến độ, insight về việc đặt cọc ưu tiên vị trí trước khi có đủ vốn, câu hỏi để khách tự hình dung có thể cơ cấu song song không."
  }'::jsonb,
  '[
    {"speaker": "sales", "content": "Dạ cuối năm là anh đang chờ điều gì cụ thể ạ hay đó là cảm giác cuối năm mình sẽ sẵn sàng hơn?"},
    {"speaker": "note", "content": "Chờ. Câu này phân loại ngay: chờ sự kiện cụ thể hay chờ cảm xúc."},
    {"speaker": "khach", "content": "Cuối năm có thưởng, thêm một ít vốn nữa cho chắc."},
    {"speaker": "sales", "content": "Dạ, anh đang hình dung cần thêm khoảng bao nhiêu để cảm thấy chắc ạ?"},
    {"speaker": "khach", "content": "Khoảng 500 triệu đến 1 tỷ nữa."},
    {"speaker": "sales_diq", "content": "Dạ, có một điểm nhiều người chưa biết về dự án này. Với chính sách thanh toán giãn tiến độ {{financing.rate_free_period}}, đợt đặt cọc và ký hợp đồng chỉ cần một phần nhỏ — các đợt tiếp theo trải dài đến khi bàn giao. Anh không nhất thiết cần đủ vốn ngay mới vào được. Câu hỏi là: nếu có thể giữ vị trí ngay bây giờ mà không cần đợi thưởng cuối năm, anh có muốn mình tính thử không?"},
    {"speaker": "khach", "content": "Thử xem sao."},
    {"speaker": "sales", "content": "Dạ, vậy mình đặt lịch ngồi lại 30 phút để em làm bảng kịch bản tài chính cụ thể theo timeline của anh. Cuối tuần này hay đầu tuần sau anh rảnh hơn?"}
  ]'::jsonb,
  '[]'::jsonb,
  'Phân biệt "cuối năm có lý do thật" và "cuối năm là mốc né tránh" — hai trường hợp xử lý hoàn toàn khác nhau. Khi xác nhận có lý do thật, áp dụng DIQ: dữ liệu thanh toán tiến độ + insight về đặt cọc ưu tiên sớm + câu hỏi.',
  ARRAY['cuoi_nam', 'tri_hoan', 'thanh_toan_tien_do', 'dat_coc_uu_tien'],
  ARRAY['cuối năm', 'chờ thưởng', 'chưa phải lúc', 'chưa đủ vốn'],
  ARRAY['bds_pro'],
  ARRAY['d_33', 'd_37', 'd_41'],
  'Cuối năm chờ thưởng tính sau thanh toán giãn tiến độ đặt cọc ưu tiên'),

-- TH 35: "Chờ xem dự án xây đến đâu rồi tính"
('d_35', 'TL04', 'D', 'Từ chối Thời điểm & Do dự', 'Chờ xem dự án xây đến đâu rồi tính',
  'Chờ xem dự án xây đến đâu rồi tính',
  ARRAY['REFLECT', 'DIQ'], ARRAY[2, 3],
  'Khách lo ngại tiến độ thi công — lo ngại có cơ sở từ kinh nghiệm thị trường BĐS Việt Nam. Lỗi phổ biến: khẳng định "{{project.developer}} luôn đúng tiến độ" nghe như đang bào chữa. Hoặc xác nhận "đúng là có nhiều trường hợp chậm" rồi mới biện hộ — câu đó đã chốt khách vào mối lo trước khi cố giải quyết nó.',
  '{
    "surface": "Muốn thấy tiến độ thi công thực tế trước khi cam kết tài chính.",
    "middle": "Đã từng nghe hoặc biết về dự án chậm tiến độ, không muốn rơi vào tình huống tương tự.",
    "root": "Sợ rủi ro thanh khoản khi vốn bị neo trong dự án chưa giao — rủi ro cơ hội và rủi ro tài chính đồng thời."
  }'::jsonb,
  '{
    "reflect": "Hỏi để hiểu khách đang so sánh với kinh nghiệm nào cụ thể, không bảo vệ {{project.developer}} bằng câu khẳng định chung.",
    "diq": "Khi khách bắt đầu chia sẻ: dữ liệu về quy mô cam kết vốn và phê duyệt cấp cao như bằng chứng rủi ro khác biệt, insight rằng ở quy mô cam kết đó không chủ đầu tư nào có thể bỏ dở mà không chịu hậu quả pháp lý nghiêm trọng, câu hỏi để khách tự đánh giá xác suất."
  }'::jsonb,
  '[
    {"speaker": "sales", "content": "Dạ, anh đang lo kiểu chậm tiến độ như từng thấy ở dự án nào không ạ, hay là lo chung về thị trường?"},
    {"speaker": "note", "content": "Chờ. Để hiểu khách đang so sánh với trường hợp cụ thể nào."},
    {"speaker": "khach", "content": "Tôi biết vài dự án bên Hà Nội cam kết bàn giao 2022 mà đến giờ vẫn chưa xong."},
    {"speaker": "sales", "content": "Dạ, anh kể đúng. Những trường hợp đó thường có điểm chung gì không ạ — vốn mỏng, pháp lý chưa xong, hay CĐT non trẻ?"},
    {"speaker": "note", "content": "Chờ. Để khách tự phân tích."},
    {"speaker": "khach", "content": "Phần lớn là CĐT nhỏ, vốn không đủ."},
    {"speaker": "sales_diq", "content": "Dạ, anh tự nhận xét đúng điểm mấu chốt rồi. {{project.developer}} đã cam kết {{project.total_investment}} cho toàn dự án, được {{legal.approval_authority}} phê duyệt trực tiếp theo {{legal.approval_doc}}. Ở quy mô cam kết tài chính và pháp lý đó, anh tự đánh giá xác suất bỏ dở là bao nhiêu phần trăm?"},
    {"speaker": "khach", "content": "Thì gần như không thể bỏ được."},
    {"speaker": "sales", "content": "Dạ, anh tự nhận xét vậy rồi. Vậy điều anh đang thật sự cân nhắc là gì — tiến độ, hay còn điều gì khác?"}
  ]'::jsonb,
  '[{"type": "never", "content": "KHÔNG hứa bàn giao cụ thể khi chưa có văn bản."}]'::jsonb,
  'Biết số liệu cập nhật tiến độ thi công thực tế mỗi tháng. Dùng văn bản pháp lý gốc làm dữ liệu DIQ, không phải như lời khẳng định niềm tin. Phân biệt dự án theo quy mô cam kết — đây là bài toán xác suất, không phải lòng tin thương hiệu.',
  ARRAY['cham_tien_do', 'cam_ket_phap_ly', 'quy_mo_von'],
  ARRAY['xem dự án xây', 'tiến độ', 'chậm bàn giao', 'rủi ro thi công'],
  ARRAY['bds_pro'],
  ARRAY['d_42', 'a_13', 'b_028'],
  'Chờ xem dự án xây tiến độ thi công cam kết vốn phê duyệt xác suất bỏ dở'),

-- TH 36: "Để tôi hỏi ý kiến vợ/chồng/gia đình"
('d_36', 'TL04', 'D', 'Từ chối Thời điểm & Do dự', 'Để tôi hỏi ý kiến vợ/chồng/gia đình',
  'Để tôi hỏi ý kiến vợ/chồng/gia đình',
  ARRAY['REFLECT'], ARRAY[2],
  'Câu này có thể là thật — người còn lại thật sự có vai trò quyết định — hoặc là phòng thủ vì khách chưa sẵn sàng. Hai trường hợp cần xử lý hoàn toàn khác nhau. Lỗi phổ biến: không phân biệt và áp dụng cùng một hướng cho cả hai, hoặc cố thuyết phục khách quyết định ngay mà không cần hỏi ý kiến — điều đó tạo xung đột trong gia đình sau khi mua.',
  '{
    "surface": "Cần thêm người đồng thuận để ra quyết định lớn.",
    "middle": "Muốn chia sẻ trách nhiệm của quyết định tài chính quan trọng. Hoặc đang dùng gia đình làm lý do né tránh an toàn.",
    "root": "Trường hợp 1: Vợ/chồng thật sự có tiếng nói quan trọng về tài chính. Trường hợp 2: Khách bản thân chưa sẵn sàng và cần lý do trung lập."
  }'::jsonb,
  '{
    "reflect": "Phân loại nhanh hai trường hợp bằng một câu hỏi trực tiếp nhưng không đối đầu. Nếu trường hợp 1, mời cả hai đến cùng — thông tin qua một người sẽ bị biến dạng. Nếu trường hợp 2, tiếp tục khai thác lo ngại thật của khách trước khi đề xuất bước tiếp theo.",
    "diq": "Không cần thiết ở đây — đây là vấn đề tâm lý và quy trình, không phải thiếu thông tin."
  }'::jsonb,
  '[
    {"speaker": "sales", "content": "Dạ, anh nói thật với em một chút — nếu vợ anh đồng ý ngay, anh sẽ quyết định không ạ? Hay bản thân anh còn điều gì chưa chắc?"},
    {"speaker": "note", "content": "Chờ. Câu này phân loại ngay hai trường hợp."},
    {"speaker": "khach", "content": "Thật ra tôi cũng còn đang cân nhắc."},
    {"speaker": "sales", "content": "Dạ, anh đang cân nhắc phần nào nhất ạ — tài chính, tiến độ dự án, hay điều gì khác?"},
    {"speaker": "khach", "content": "Chủ yếu là tài chính, chưa biết cơ cấu thế nào cho hợp lý."},
    {"speaker": "sales", "content": "Dạ, vậy mình làm rõ phần đó trước, sau đó mời anh chị cùng đến một lần để em trình bày đầy đủ cả hai nghe. Quyết định lớn như này mà chỉ có một người nghe rồi kể lại thường thiếu nhiều chi tiết quan trọng. Anh thấy hướng đó ổn không ạ?"},
    {"speaker": "khach", "content": "Được, để tôi bàn với vợ xem."},
    {"speaker": "sales", "content": "Dạ, vậy mình đặt lịch luôn để anh không phải nhớ gọi lại. Tuần sau cuối tuần hai anh chị rảnh không ạ — em chuẩn bị bảng tài chính riêng cho trường hợp của anh."}
  ]'::jsonb,
  '[]'::jsonb,
  'Không bao giờ bỏ qua hoặc hạ thấp vai trò của vợ/chồng trong quyết định tài chính gia đình. Ưu tiên sắp xếp cuộc hẹn có cả hai — thông tin qua một người sẽ mất 50% độ chính xác.',
  ARRAY['hoi_y_kien', 'vo_chong', 'phan_loai_nguoi_quyet_dinh'],
  ARRAY['hỏi vợ', 'hỏi chồng', 'hỏi gia đình', 'cùng quyết định'],
  ARRAY['bds_pro'],
  ARRAY['b_022', 'b_030'],
  'Hỏi ý kiến vợ chồng gia đình cùng quyết định phân loại tâm lý'),

-- TH 37: "Đang bán tài sản khác rồi mới mua"
('d_37', 'TL04', 'D', 'Từ chối Thời điểm & Do dự', 'Đang bán tài sản khác rồi mới mua',
  'Đang bán tài sản khác rồi mới mua',
  ARRAY['REFLECT', 'DIQ'], ARRAY[2, 3],
  'Khách có vốn nhưng neo vào thanh khoản của tài sản khác. Đây là tình huống tài chính thực, không phải né tránh. Rủi ro lớn: nếu sales chờ theo khách, lúc tài sản cũ thoát được thì giá giai đoạn 1 đã khác, hoặc khách đã tiếp xúc với sales khác và bị chốt sang hướng khác trong khoảng thời gian đó.',
  '{
    "surface": "Chưa có vốn tiền mặt sẵn để cam kết ngay.",
    "middle": "Chưa nghĩ đến phương án tài chính linh hoạt, hoặc không muốn dùng đòn bẩy. Đang nghĩ phải bán xong mới mua được.",
    "root": "Lo rủi ro hai đầu: tài sản cũ chưa bán được mà đã phải đóng tiến độ mới — kẹt cả hai phía."
  }'::jsonb,
  '{
    "reflect": "Hỏi để hiểu tài sản cũ đang ở đâu trong quá trình bán, không hỏi thêm về tài sản đó nhiều hơn mức cần thiết.",
    "diq": "Khi khách đã chia sẻ: dữ liệu về chính sách thanh toán giãn tiến độ cụ thể, insight rằng nhiều nhà đầu tư vào dự án mà không cần thanh lý tài sản cũ trước, câu hỏi để khách tự hình dung khả năng song song."
  }'::jsonb,
  '[
    {"speaker": "sales", "content": "Dạ, tài sản anh đang bán hiện đã có khách hỏi chưa ạ, hay vẫn đang trong giai đoạn tìm người mua?"},
    {"speaker": "khach", "content": "Đang có một vài khách hỏi rồi, chắc 2-3 tháng nữa chốt được."},
    {"speaker": "sales", "content": "Dạ, anh đang bán để dồn vốn hoàn toàn vào đây, hay tái cơ cấu danh mục ạ?"},
    {"speaker": "khach", "content": "Bán xong lấy tiền mua cái mới thôi, giữ lâu cũng không tăng giá nhiều."},
    {"speaker": "sales_diq", "content": "Dạ, thật ra có điều nhiều người chưa biết. Với chính sách thanh toán tiến độ của giai đoạn 1, đợt đặt cọc và ký hợp đồng chỉ cần một phần nhỏ, các đợt tiếp theo trải dài 18-24 tháng đến bàn giao. Timeline đó khớp với kế hoạch 2-3 tháng của anh. Có nghĩa là anh hoàn toàn có thể giữ vị trí ở đây trong khi vẫn đang xử lý tài sản kia. Anh có muốn em làm bảng ghép timeline bán tài sản cũ với lịch đóng tiền của dự án này không, để tự xem có khoảng trống nào cần xử lý không?"},
    {"speaker": "khach", "content": "Thử xem. Cụ thể ra sao?"},
    {"speaker": "sales", "content": "Dạ, mình gặp nhau 30 phút, em in bảng số liệu thật ra. Cuối tuần này anh rảnh không?"}
  ]'::jsonb,
  '[]'::jsonb,
  'Biết lịch đóng tiền theo từng loại sản phẩm cụ thể. Không bị kéo vào câu chuyện của tài sản cũ — hỏi đủ để hiểu timeline. Nếu khách có BĐS đang bán, hỏi thêm về loại và vị trí — có thể kết nối người mua nếu trong network.',
  ARRAY['ban_tai_san_khac', 'thanh_khoan', 'cocurrent_timeline'],
  ARRAY['bán tài sản', 'thanh lý', 'chưa bán xong', 'chờ vốn'],
  ARRAY['bds_pro'],
  ARRAY['d_34', 'a_05'],
  'Bán tài sản khác thanh khoản timeline song song giãn tiến độ'),

-- TH 38: "Lãi suất đang cao, chờ xuống rồi vay"
('d_38', 'TL04', 'D', 'Từ chối Thời điểm & Do dự', 'Lãi suất đang cao, chờ xuống rồi vay',
  'Lãi suất đang cao, chờ xuống rồi vay',
  ARRAY['REFLECT', 'DIQ'], ARRAY[2, 3],
  'Objection có căn cứ tài chính thực. Lãi suất vay BĐS dao động 9-11%/năm tại nhiều ngân hàng hiện tại. Khách đang tính chi phí vốn đúng cách. Lỗi phổ biến: tranh luận "lãi suất không cao lắm" hoặc hứa lãi suất ưu đãi khi chưa có văn bản xác nhận — cả hai đều mất niềm tin ngay lập tức.',
  '{
    "surface": "Chi phí vay hiện tại cao, chưa thấy thời điểm tối ưu để vay.",
    "middle": "Đang nhìn lãi suất như một chi phí đơn thuần, chưa so sánh với chi phí cơ hội của việc không mua.",
    "root": "Sợ chi phí hàng tháng quá nặng so với dòng tiền hiện tại. Lo mất khả năng thanh toán nếu lãi suất tiếp tục tăng."
  }'::jsonb,
  '{
    "reflect": "Không tranh luận về lãi suất. Câu hỏi phản chiếu nhắm vào: khách đang so sánh lãi suất vay với gì, và liệu đó có phải là phép so sánh đúng không.",
    "diq": "Khi khách bắt đầu mở: dữ liệu về mối quan hệ ngược chiều lãi suất và giá BĐS, insight về bài toán đòn bẩy khi kỳ vọng tăng giá vượt chi phí vay, câu hỏi để khách tự tính toán."
  }'::jsonb,
  '[
    {"speaker": "sales", "content": "Dạ, anh đang so sánh lãi suất vay với kênh nào để cảm thấy nó cao ạ?"},
    {"speaker": "note", "content": "Chờ. Buộc khách xác định cơ sở so sánh của mình."},
    {"speaker": "khach", "content": "Thì so với gửi tiết kiệm, lãi vay cao hơn nhiều."},
    {"speaker": "sales", "content": "Dạ, anh đang so sánh lãi suất đi vay với lãi suất gửi tiết kiệm. Nhưng hai thứ đó là chi phí của hai hành động khác nhau: một bên là giữ tiền, một bên là dùng tiền tạo ra tài sản. Câu hỏi thật không phải lãi vay cao hay thấp hơn lãi tiết kiệm, mà là tài sản mua bằng tiền vay đó tăng giá bao nhiêu so với chi phí vay. Anh kỳ vọng dự án này tăng bao nhiêu phần trăm trong 3 năm tới, theo đánh giá cá nhân của anh?"},
    {"speaker": "khach", "content": "Cũng khó nói, 15-20% chắc."},
    {"speaker": "sales_diq", "content": "Dạ, nếu kỳ vọng tăng giá 15-20% trong khi chi phí vay khoảng 7-8% qua ngân hàng đối tác dự án, thì đòn bẩy đang giúp anh nhân lợi nhuận trên phần vốn tự có lên đáng kể. Đây không phải quan điểm của em, đây là bài toán số học. Anh có muốn em tính cụ thể với số vốn tự có của anh không — 30 phút thôi?"},
    {"speaker": "khach", "content": "Được, tính thử xem."},
    {"speaker": "sales", "content": "Dạ, mình đặt lịch cuối tuần này nhé. Em cũng có thêm thông tin về kế hoạch hỗ trợ lãi suất của giai đoạn 1 để trình bày khi gặp — con số cụ thể em cập nhật khi có văn bản chính thức."}
  ]'::jsonb,
  '[{"type": "never", "content": "KHÔNG cam kết lãi suất ưu đãi khi chưa có văn bản xác nhận từ chủ đầu tư."}]'::jsonb,
  'Nắm vững nguyên lý đòn bẩy tài chính để giải thích tự nhiên — đây là bài toán số học, không phải thuyết phục. Biết tính nhanh bảng so sánh ROI theo các kịch bản lãi suất và tăng giá khác nhau ngay tại cuộc hẹn.',
  ARRAY['lai_suat', 'don_bay_tai_chinh', 'ROI', 'so_hoc'],
  ARRAY['lãi suất cao', 'chờ vay', 'chi phí vay', 'đòn bẩy'],
  ARRAY['bds_pro'],
  ARRAY['d_33', 'd_41', 'th_031'],
  'Lãi suất cao chờ vay đòn bẩy tài chính số học ROI tăng giá'),

-- TH 39: "Tôi cần xem thêm vài dự án nữa"
('d_39', 'TL04', 'D', 'Từ chối Thời điểm & Do dự', 'Tôi cần xem thêm vài dự án nữa',
  'Tôi cần xem thêm vài dự án nữa',
  ARRAY['REFLECT', 'DIQ'], ARRAY[2, 3],
  'Khách đang ở giai đoạn khảo sát thị trường, chưa chốt điểm rơi. Đây không phải từ chối, đây là chưa đủ thông tin để quyết định. Lỗi phổ biến: cố thuyết phục "không cần xem nữa, đây là tốt nhất" — phản tác dụng ngay. Hoặc để khách đi mà không có điểm neo, kết quả là bị sales đối thủ chốt trong khoảng thời gian đó.',
  '{
    "surface": "Muốn có đủ thông tin để so sánh trước khi quyết định.",
    "middle": "Chưa có tiêu chí rõ ràng để biết khi nào thì đủ thông tin để dừng khảo sát.",
    "root": "Sợ mua sai. Quá trình so sánh là cách tự thuyết phục mà không cảm thấy bị ép."
  }'::jsonb,
  '{
    "reflect": "Không ngăn khách đi xem dự án khác. Giúp khách xây dựng bộ tiêu chí đánh giá trước khi đi — khi khách có tiêu chí của mình và biết phải hỏi gì, họ thường tự quay lại.",
    "diq": "Cung cấp framework so sánh dựa trên ba tiêu chí pháp lý và hạ tầng cụ thể của dự án, để khách tự kiểm tra các dự án khác theo cùng bộ tiêu chí đó."
  }'::jsonb,
  '[
    {"speaker": "sales", "content": "Dạ, anh đang so sánh theo tiêu chí nào ạ — pháp lý, vị trí, tiềm năng tăng giá, hay điều gì khác quan trọng nhất với anh?"},
    {"speaker": "note", "content": "Chờ. Giúp khách tự định nghĩa tiêu chí của mình."},
    {"speaker": "khach", "content": "Chủ yếu là pháp lý và tiềm năng tăng giá."},
    {"speaker": "sales", "content": "Dạ, trước khi anh đi xem thêm, em chia sẻ một cách tiết kiệm thời gian. Khi xem dự án nào anh thử hỏi thẳng họ ba điều: quy hoạch 1/500 đã có chưa, hạ tầng giao thông kết nối đã khởi công chưa, và cam kết bàn giao có ghi trong hợp đồng không. Xem họ trả lời thế nào."},
    {"speaker": "khach", "content": "Nghe cũng có lý. Tôi sẽ hỏi vậy."},
    {"speaker": "sales", "content": "Dạ, anh cứ xem thêm. Em giữ liên lạc và cập nhật thông tin mới của dự án trong thời gian đó. Sau khi anh xem xong, mình ngồi lại so sánh cùng nhau — em không sợ so sánh. Cuối tuần sau anh rảnh không để mình đặt trước một khung giờ?"}
  ]'::jsonb,
  '[]'::jsonb,
  'Biết điểm mạnh và điểm yếu của các dự án cạnh tranh trong khu vực ({{competitors.list}}). Không nói xấu đối thủ trực tiếp — cung cấp framework tiêu chí để khách tự so sánh. Giữ liên lạc sau khi khách đi xem dự án khác: gọi lại sau 3-5 ngày với thông tin cụ thể mới.',
  ARRAY['xem_them_du_an', 'framework_so_sanh', 'doi_thu'],
  ARRAY['xem thêm dự án', 'so sánh', 'khảo sát'],
  ARRAY['bds_pro'],
  ARRAY['b_021', 'a_17', 'th_024'],
  'Xem thêm dự án so sánh tiêu chí pháp lý hạ tầng cam kết bàn giao framework'),

-- TH 40: "Nghĩ thêm vài ngày rồi báo"
('d_40', 'TL04', 'D', 'Từ chối Thời điểm & Do dự', 'Nghĩ thêm vài ngày rồi báo',
  'Nghĩ thêm vài ngày rồi báo',
  ARRAY['REFLECT'], ARRAY[2, 4],
  'Đây là câu của khách đang ở ngưỡng quyết định — không từ chối nhưng cũng không chốt. "Vài ngày" thường là vĩnh viễn nếu sales không có bước tiếp theo cụ thể. Lỗi phổ biến: chấp nhận câu này và chờ khách nguội dần, tìm thêm lý do để không mua, hoặc bị tác động bởi người khác trong khoảng thời gian đó.',
  '{
    "surface": "Cần thêm thời gian suy nghĩ trước khi cam kết.",
    "middle": "Còn một lo ngại cụ thể chưa được giải quyết, nhưng chưa sẵn sàng nói thẳng ra.",
    "root": "Cần được tự thuyết phục — quyết định mà không cảm thấy bị ép — không muốn cảm giác quyết định là do áp lực từ sales."
  }'::jsonb,
  '{
    "reflect": "Làm rõ lo ngại còn lại thay vì chấp nhận vài ngày. Không thúc ép, không tạo khan hiếm giả. Phải đặt được bước tiếp theo cụ thể với ngày giờ rõ ràng trước khi kết thúc cuộc gặp — đây là nguyên tắc không thể bỏ.",
    "diq": "Chỉ cần thiết nếu khách chỉ ra lo ngại cụ thể: lúc đó dùng dữ liệu để hỗ trợ, không phải để thuyết phục."
  }'::jsonb,
  '[
    {"speaker": "sales", "content": "Dạ, anh nghĩ thêm về phần nào ạ — tài chính, hay còn điều gì về dự án mình chưa rõ?"},
    {"speaker": "note", "content": "Chờ. Để khách tự chỉ ra phần còn lại."},
    {"speaker": "khach", "content": "Cũng chủ yếu là muốn chắc hơn về tiến độ bàn giao."},
    {"speaker": "sales", "content": "Dạ, nếu phần tiến độ được làm rõ bằng tài liệu cụ thể, anh sẽ sẵn sàng quyết định không ạ?"},
    {"speaker": "note", "content": "Chờ. Xác nhận đây có phải lo ngại cuối cùng không."},
    {"speaker": "khach", "content": "Phần lớn là vậy."},
    {"speaker": "sales", "content": "Dạ, em gửi anh hợp đồng mẫu trong đó có điều khoản bàn giao cụ thể, và tiến độ thi công cập nhật đến tháng này. Anh đọc xong mình gọi lại để đi qua những điểm anh còn thắc mắc. Thứ [X] tuần sau lúc [giờ Y] anh rảnh không?"},
    {"speaker": "note", "content": "KHÔNG rời cuộc gặp khi chưa có lịch cụ thể — nguyên tắc không thể bỏ."},
    {"speaker": "khach", "content": "Được, thứ Tư nhé."},
    {"speaker": "sales", "content": "Dạ, em ghi lại rồi. Em gửi tài liệu ngay hôm nay để anh có thời gian đọc trước."}
  ]'::jsonb,
  '[{"type": "never", "content": "KHÔNG bao giờ rời cuộc gặp khi chưa có lịch gọi lại hoặc lịch hẹn tiếp theo cụ thể."}]'::jsonb,
  'Nghe đủ toàn bộ cuộc tư vấn để biết lo ngại còn lại là gì — câu hỏi này dễ trả lời nếu sales đã lắng nghe từ đầu. Lịch gọi lại phải có lý do: tài liệu cụ thể, thông tin mới — không gọi chỉ để hỏi "anh nghĩ sao rồi".',
  ARRAY['nghi_them', 'rao_can_cuoi', 'lich_goi_lai'],
  ARRAY['nghĩ thêm', 'vài ngày', 'để tôi suy nghĩ', 'cho tôi thêm thời gian'],
  ARRAY['bds_pro'],
  ARRAY['b_029', 'd_36'],
  'Nghĩ thêm vài ngày rào cản cuối lo ngại lịch gọi lại cụ thể'),

-- TH 41: "Năm nay thu nhập không tốt, chờ năm sau"
('d_41', 'TL04', 'D', 'Từ chối Thời điểm & Do dự', 'Năm nay thu nhập không tốt, chờ năm sau',
  'Năm nay thu nhập không tốt, chờ năm sau',
  ARRAY['REFLECT', 'DIQ'], ARRAY[2, 3],
  '"Thu nhập không tốt" có thể là thu nhập thật sự giảm, hoặc là cách né tránh an toàn. Lỗi phổ biến: xác nhận "dạ đúng là khó khăn" rồi chờ — hoặc cố phản bác "năm sau chưa chắc tốt hơn". Cả hai không giải quyết được vấn đề thật.',
  '{
    "surface": "Tài chính năm nay không thuận lợi để đưa ra quyết định lớn.",
    "middle": "Lo ngại dòng tiền không đủ để phục vụ tiến độ thanh toán trong tương lai gần.",
    "root": "Sợ cam kết tài chính lớn trong bối cảnh thu nhập không ổn định. Lo mất khả năng thanh toán nếu thu nhập tiếp tục không phục hồi."
  }'::jsonb,
  '{
    "reflect": "Phân loại nguồn vốn của khách trước — tiết kiệm sẵn có hay từ thu nhập hàng tháng. Hai trường hợp xử lý hoàn toàn khác nhau.",
    "diq": "Khi đã xác định nguồn vốn: nếu vốn từ tiết kiệm sẵn, thu nhập hiện tại ít ảnh hưởng đến quyết định và câu hỏi phản chiếu đặt lại tiền đề. Nếu vốn từ thu nhập, dữ liệu về thanh toán tiến độ và câu hỏi về mức đóng tháng thực tế để khách tự đánh giá."
  }'::jsonb,
  '[
    {"speaker": "sales", "content": "Dạ, anh nói thu nhập không tốt là đang so sánh với năm trước hay so với mức anh kỳ vọng ạ?"},
    {"speaker": "note", "content": "Chờ. Phân loại mức độ thật của vấn đề."},
    {"speaker": "khach", "content": "So với năm ngoái, năm nay kinh doanh chậm hơn, dòng tiền chưa ổn định."},
    {"speaker": "sales", "content": "Dạ, phần vốn anh đang tính cho khoản đầu tư này chủ yếu từ tiết kiệm sẵn có hay từ thu nhập hàng tháng ạ?"},
    {"speaker": "khach", "content": "Một phần tiết kiệm, một phần cần dòng tiền hàng tháng để đóng tiến độ."},
    {"speaker": "sales_diq", "content": "Dạ, em hiểu. Vậy mình xem thử mức đóng tiến độ hàng tháng thực tế là bao nhiêu, để anh tự đánh giá có phù hợp với dòng tiền hiện tại không. Theo chính sách giãn 24 tháng, với căn anh đang quan tâm, mức đóng mỗi tháng rơi vào khoảng [X]. Anh thấy con số đó so với dòng tiền bình quân hàng tháng của anh thế nào?"},
    {"speaker": "note", "content": "Chờ. Đặt con số thực tế để khách tự đánh giá, không kết luận thay họ."},
    {"speaker": "khach", "content": "Cũng không đến nỗi, nhưng tôi cần tính thêm."},
    {"speaker": "sales", "content": "Dạ, anh cứ tính. Em gửi bảng số cụ thể theo từng kịch bản để anh chủ động. Mình đặt lịch gọi lại sau khi anh xem xong — thứ mấy tuần này anh rảnh?"}
  ]'::jsonb,
  '[]'::jsonb,
  'Phân loại nguồn vốn của khách ngay từ sớm trong cuộc trò chuyện — hai trường hợp xử lý hoàn toàn khác nhau. Biết ngưỡng đóng tháng theo các kịch bản chính sách thanh toán khác nhau để trả lời ngay bằng con số thật. Không phán xét tình hình thu nhập — chỉ thu thập thông tin để đề xuất phương án phù hợp.',
  ARRAY['thu_nhap_kem', 'nguon_von', 'thanh_toan_tien_do'],
  ARRAY['thu nhập không tốt', 'kinh doanh chậm', 'dòng tiền', 'chờ năm sau'],
  ARRAY['bds_pro'],
  ARRAY['d_34', 'd_38', 'a_05'],
  'Thu nhập không tốt năm sau dòng tiền nguồn vốn tiết kiệm thanh toán tiến độ'),

-- TH 42: "Dự án mới mở, để lúc sau mua rẻ hơn"
('d_42', 'TL04', 'D', 'Từ chối Thời điểm & Do dự', 'Dự án mới mở, để lúc sau mua rẻ hơn',
  'Dự án mới mở, để lúc sau mua rẻ hơn',
  ARRAY['REFLECT', 'DIQ'], ARRAY[2, 3],
  'Khách tin rằng giá mở bán cao hơn giá sau mở bán. Nhận định này đúng với một số dự án nhưng sai với cơ chế định giá theo giai đoạn của {{project.developer}}. Lỗi phổ biến: tranh luận "giá sẽ không xuống" — nghe như đang bảo vệ lợi ích của mình. Hoặc dùng khan hiếm giả "sắp hết hàng" mà không có cơ sở.',
  '{
    "surface": "Kỳ vọng giá sau mở bán thấp hơn, muốn tối ưu điểm mua vào.",
    "middle": "Đang áp dụng tư duy đúng của nhà đầu tư nhưng nhầm mô hình giá vào sai bối cảnh. Không biết cơ chế tăng giá theo giai đoạn của {{project.developer}}.",
    "root": "Muốn cảm thấy mình mua được giá tốt nhất — đây là nhu cầu tâm lý, không chỉ là tính toán tài chính."
  }'::jsonb,
  '{
    "reflect": "Không tranh luận. Hỏi để khách tự kể cơ sở của kỳ vọng đó.",
    "diq": "Khi khách bắt đầu mở: dữ liệu về lịch sử giá giai đoạn 1 và giai đoạn sau của {{comparables.0.name}} và {{comparables.1.name}}, insight rằng không có tiền lệ nào {{project.developer}} giảm giá ở giai đoạn sau, câu hỏi để khách tự rút ra kết luận từ dữ liệu lịch sử của chính họ."
  }'::jsonb,
  '[
    {"speaker": "sales", "content": "Dạ, anh đang nghĩ đến dự án nào khi nói mua sau rẻ hơn ạ — hay đây là quan sát chung của anh về thị trường?"},
    {"speaker": "note", "content": "Chờ. Để khách tự kể cơ sở của kỳ vọng."},
    {"speaker": "khach", "content": "Tôi thấy nhiều dự án mở ra rầm rộ rồi sau đó hạ giá để bán."},
    {"speaker": "sales", "content": "Dạ, anh có theo dõi cơ chế giá của {{project.developer}} ở các dự án trước không ạ — kiểu {{comparables.0.name}} hay {{comparables.1.name}}?"},
    {"speaker": "khach", "content": "Không theo sát lắm."},
    {"speaker": "sales_diq", "content": "Dạ, em kể một thực tế anh có thể kiểm tra. {{comparables.0.name}} mở bán giai đoạn 1 năm 2019, giá căn hộ khoảng 30-35 triệu mỗi m². Giai đoạn 2 và 3 sau đó giá lên 45-55 triệu. {{comparables.1.name}} tương tự. Anh thử nhớ lại hoặc kiểm tra: có giai đoạn sau nào của {{project.developer}} mà giá thấp hơn giai đoạn 1 không?"},
    {"speaker": "note", "content": "Chờ. Để khách tự rút ra kết luận từ dữ liệu lịch sử."},
    {"speaker": "khach", "content": "Thật ra hình như chưa thấy vụ nào."},
    {"speaker": "sales", "content": "Dạ, em không cam kết giá tăng vì em không có quyền đó. Nhưng dữ liệu lịch sử anh tự xác nhận rồi. Câu hỏi lúc này là: nếu cơ chế đó lặp lại, thì chi phí cơ hội của việc chờ là bao nhiêu so với việc vào giai đoạn 1? Anh có muốn mình tính thử không?"}
  ]'::jsonb,
  '[{"type": "never", "content": "KHÔNG cam kết tăng giá. Chỉ dùng dữ liệu lịch sử như thông tin tham khảo, luôn nói rõ nguồn."}]'::jsonb,
  'Biết lịch sử giá giai đoạn 1 và giai đoạn sau của ít nhất {{comparables.0.name}} và {{comparables.1.name}} — số liệu cụ thể, không phải ước tính. Phân biệt cơ chế giá {{project.developer}} với dự án phổ thông: đây là điểm mấu chốt để khách thay đổi tiền đề.',
  ARRAY['mua_sau_re_hon', 'co_che_gia_giai_doan', 'lich_su_du_an'],
  ARRAY['mua sau rẻ hơn', 'giá mở bán', 'hạ giá', 'mới mở'],
  ARRAY['bds_pro'],
  ARRAY['d_33', 'd_39', 'a_19', 'th_027'],
  'Mua sau rẻ hơn cơ chế giá giai đoạn 1 lịch sử Ocean City Smart City'),

-- BS-A: "Chờ tàu cao tốc 23 phút chạy thật rồi tính"
('d_43', 'TL04', 'D', 'Từ chối Thời điểm & Do dự', 'Chờ tàu cao tốc/hạ tầng mới chạy thật rồi tính',
  'Chờ {{infrastructure.new_project}} chạy thật rồi tính',
  ARRAY['REFLECT', 'DIQ'], ARRAY[2, 3],
  '{{infrastructure.new_project}} mới khởi công {{infrastructure.new_start_date}}. Khách nghe câu chuyện {{infrastructure.new_travel_time}} nhưng biết đó là tương lai chưa xác định. Lỗi phổ biến: hứa thời gian hoàn thành không có trong văn bản, bảo vệ câu chuyện hạ tầng bằng niềm tin thay vì thực tế, hoặc xác nhận "đúng là chưa có" rồi mất thế hoàn toàn.',
  '{
    "surface": "Câu chuyện {{infrastructure.new_travel_time}} chưa có thực tế, chưa thể dựa vào đó để quyết định.",
    "middle": "Không muốn mua dựa trên một hạ tầng chưa chắc chắn về tiến độ. Đang dùng hạ tầng mới như điều kiện cần duy nhất.",
    "root": "Lo rằng nếu hạ tầng không đúng tiến độ, giá trị cốt lõi của dự án sẽ thay đổi và tiền của họ đang đặt vào điều không chắc chắn."
  }'::jsonb,
  '{
    "reflect": "Không bảo vệ hạ tầng mới bằng niềm tin hay cam kết không có văn bản. Câu hỏi phản chiếu nhắm vào: hạ tầng đó là một trong nhiều yếu tố, không phải yếu tố duy nhất tạo giá trị.",
    "diq": "Khi khách bắt đầu mở: dữ liệu về hạ tầng đã hoàn thành thực tế và độc lập với hạ tầng mới, insight rằng người mua giai đoạn 1 các dự án trước (chờ vành đai 4) vẫn có lãi nhờ mua đúng giai đoạn, câu hỏi để khách tự đánh giá độc lập với yếu tố hạ tầng mới."
  }'::jsonb,
  '[
    {"speaker": "sales", "content": "Dạ, anh đang dùng {{infrastructure.new_project}} như tiêu chí mua hay như tiêu chí chờ ạ — hai điều đó khác nhau đấy anh."},
    {"speaker": "note", "content": "Chờ. Để khách tự suy ngẫm về vai trò thật của hạ tầng trong quyết định."},
    {"speaker": "khach", "content": "Thì tiêu chí mua, nhưng chưa có thì tôi chưa tin tưởng để mua."},
    {"speaker": "sales", "content": "Dạ, em hỏi thẳng một chút. Nếu {{infrastructure.new_project}} chậm 2-3 năm, anh đánh giá dự án này thế nào? {{infrastructure.completed_list}}. Những thứ đó anh thấy đủ chưa ạ, nếu tạm gác hạ tầng mới sang một bên?"},
    {"speaker": "note", "content": "Chờ. Để khách tự đánh giá độc lập với yếu tố hạ tầng mới."},
    {"speaker": "khach", "content": "Ừ, hạ tầng thật ra cũng đã tốt hơn nhiều rồi."},
    {"speaker": "sales_diq", "content": "Dạ, còn về {{infrastructure.new_project}}, em chỉ nói điều có trong văn bản: đã khởi công {{infrastructure.new_start_date}}. Tiến độ hoàn thành em không cam kết vì em không có thẩm quyền đó. Anh thử nhìn: người mua {{comparables.0.name}} năm 2019 cũng chờ vành đai 4. Người mua sớm nhất đang có lãi nhất không phải vì vành đai 4 xong, mà vì họ mua đúng giai đoạn. Anh thấy điểm đó có liên quan đến bài toán của mình không?"}
  ]'::jsonb,
  '[{"type": "never", "content": "KHÔNG cam kết tiến độ hạ tầng đang xây. Thừa nhận thẳng giới hạn thông tin của mình — đây là biểu hiện của cố vấn tin cậy."}]'::jsonb,
  'Biết chính xác thông tin hạ tầng mới trong văn bản: ngày khởi công, đơn vị phê duyệt — không nói thêm điều không có chứng từ. Biết các hạ tầng đã hoàn thành thực tế để làm điểm neo độc lập.',
  ARRAY['ha_tang_moi', 'tau_cao_toc', 'tien_do_chua_xac_dinh', 'ha_tang_da_co'],
  ARRAY['tàu cao tốc', '23 phút', 'hạ tầng', 'chờ tàu'],
  ARRAY['bds_pro'],
  ARRAY['d_35', 'b_017'],
  'Tàu cao tốc 23 phút hạ tầng mới chưa xác định đã hoàn thành cao tốc hầm'),

-- BS-B: "Chờ mở bán chính thức rồi quyết"
('d_44', 'TL04', 'D', 'Từ chối Thời điểm & Do dự', 'Chờ mở bán chính thức rồi quyết',
  'Chờ mở bán chính thức {{project.launch_date}} rồi quyết',
  ARRAY['REFLECT', 'DIQ'], ARRAY[2, 3],
  'Thời điểm hiện tại, mở bán giai đoạn 1 dự kiến {{project.launch_date}} — khoảng cách chỉ vài tuần. Tình huống này nguy hiểm vì khoảng cách ngắn khiến sales dễ đồng ý chờ. Nhưng trong vài tuần đó, khách tiếp xúc nhiều sales khác và mất quyền chọn vị trí tốt trong đợt ưu tiên.',
  '{
    "surface": "Muốn có giá và thông tin chính thức trước khi cam kết.",
    "middle": "Chưa thấy đủ lý do để quyết định trước khi có đầy đủ điều kiện. Chưa biết quyền ưu tiên vị trí có giá trị thực tế không.",
    "root": "Không muốn cam kết mà chưa biết toàn bộ điều kiện — tư duy thận trọng hợp lý nhưng sẽ mất lợi thế chọn vị trí."
  }'::jsonb,
  '{
    "reflect": "Làm rõ khách đang chờ thêm thông tin gì cụ thể.",
    "diq": "Khi khách chỉ ra thông tin cần: dữ liệu về sự khác biệt thực tế giữa đặt cọc ưu tiên và mua sau mở bán chính thức, insight rằng khi thông tin đầy đủ thì hàng nghìn người cùng có thông tin đó và quyền chọn vị trí không còn, câu hỏi để khách tự quyết định điều đó có quan trọng với trường hợp của họ không."
  }'::jsonb,
  '[
    {"speaker": "sales", "content": "Dạ, anh đang chờ thêm thông tin gì từ mở bán chính thức ạ — giá niêm yết, chính sách thanh toán, hay điều khác?"},
    {"speaker": "note", "content": "Chờ. Xác định thông tin cụ thể khách cần trước khi quyết định."},
    {"speaker": "khach", "content": "Chủ yếu là muốn có giá chính thức và chính sách rõ ràng."},
    {"speaker": "sales_diq", "content": "Dạ, những thông tin đó khi mở bán chính thức anh sẽ có đủ. Nhưng lúc đó hàng nghìn người cùng có thông tin đó đồng thời. Quyền chọn vị trí trong đợt ưu tiên thuộc về người đặt cọc sớm nhất. Anh thấy điều đó quan trọng hay không quan trọng với trường hợp của mình?"},
    {"speaker": "note", "content": "Chờ. Để khách tự quyết định tầm quan trọng của vị trí với họ."},
    {"speaker": "khach", "content": "Thật ra vị trí cũng quan trọng với tôi."},
    {"speaker": "sales", "content": "Dạ, vậy mình bàn thêm về bước đặt cọc ưu tiên để anh có quyền đó trước. Em giải thích quy trình và điều kiện cụ thể — không mất nhiều thời gian. Anh rảnh hôm nay hay ngày mai?"}
  ]'::jsonb,
  '[{"type": "never", "content": "KHÔNG nói sắp hết hàng nếu không có số liệu cụ thể về quỹ hàng — câu đó nghe như chiêu ép mua."}]'::jsonb,
  'Biết quy trình đặt cọc ưu tiên trước mở bán chính thức: điều kiện, số tiền, quyền lợi cụ thể. Nếu khách chọn chờ sau khi nghe đầy đủ, tôn trọng và giữ liên lạc bằng thông tin mới trong khoảng thời gian đó.',
  ARRAY['cho_mo_ban', 'dat_coc_uu_tien', 'chon_vi_tri'],
  ARRAY['mở bán chính thức', 'giá niêm yết', 'chờ chính sách', 'đặt cọc ưu tiên'],
  ARRAY['bds_pro'],
  ARRAY['d_42', 'd_40', 'th_026'],
  'Chờ mở bán chính thức giá niêm yết đặt cọc ưu tiên chọn vị trí'),

-- BS-C: "Dự án quá lớn, chờ thấy hình thành rồi mới tính"
('d_45', 'TL04', 'D', 'Từ chối Thời điểm & Do dự', 'Dự án quá lớn, chờ thấy hình thành rồi mới tính',
  'Dự án {{project.size}}, nhiều sản phẩm thế, chờ thấy hình thành rồi mới tính',
  ARRAY['REFLECT', 'DIQ'], ARRAY[2, 3],
  'Quy mô {{project.size}} với {{project.units_total}} sản phẩm tạo ra tâm lý "quá lớn để hình dung". Khách không phủ nhận dự án, họ chỉ chưa đủ tự tin để quyết định trong một thứ khổng lồ chưa hiện hữu. Lỗi phổ biến: cố giải thích thêm về quy mô và tiện ích — càng giải thích nhiều, khách càng thấy xa vời.',
  '{
    "surface": "Dự án quá lớn, chưa hình dung được thực tế của nơi mình sắp đầu tư.",
    "middle": "Không biết phần nào của dự án phù hợp với mình — bị choáng ngợp bởi thông tin quá nhiều.",
    "root": "Sợ quyết định sai trong một thứ quá phức tạp và chưa hiện hữu. Cần được thu hẹp góc nhìn về đúng phần của mình."
  }'::jsonb,
  '{
    "reflect": "Không giải thích thêm về quy mô toàn dự án. Thu hẹp góc nhìn của khách từ {{project.size}} về đúng phân khu và loại sản phẩm phù hợp với họ.",
    "diq": "Khi khách đã thu hẹp được phần của mình: dữ liệu về tỷ suất đầu tư giai đoạn đầu của {{comparables.0.name}} và {{comparables.1.name}}, insight rằng người mua khi chưa có gì nhìn thấy đang có lãi nhiều nhất, câu hỏi để khách tự đánh giá chi phí cơ hội của việc chờ thấy hình thành."
  }'::jsonb,
  '[
    {"speaker": "sales", "content": "Dạ, anh đang nhìn cả dự án hay đang nghĩ đến loại sản phẩm cụ thể nào ạ?"},
    {"speaker": "note", "content": "Chờ. Thu hẹp phạm vi từ toàn dự án về sản phẩm cụ thể."},
    {"speaker": "khach", "content": "Tôi quan tâm shophouse, nhưng {{project.units_total}} sản phẩm nghe nhiều quá, lo thanh khoản."},
    {"speaker": "sales", "content": "Dạ, {{project.units_total}} sản phẩm là tổng toàn bộ dự án phát triển theo nhiều giai đoạn nhiều năm. Giai đoạn 1 là {{project.phase1_name}} {{project.phase1_size}}, mở bán {{project.launch_date}}. Shophouse giai đoạn 1 là con số có giới hạn rất cụ thể. Anh không cần hình dung {{project.size}}, chỉ cần hình dung đúng phần anh đang quan tâm. Mình thu hẹp lại vậy được không ạ?"},
    {"speaker": "khach", "content": "Ừ, nghe hợp lý hơn rồi."},
    {"speaker": "sales_diq", "content": "Dạ, và về việc chờ thấy hình thành — anh thử nhớ lại {{comparables.0.name}} hay {{comparables.1.name}} giai đoạn đầu. Người mua khi chưa có gì nhìn thấy đang có lãi bao nhiêu so với người chờ thấy hoàn thiện? Không cần em nói, anh tự ước lượng xem."},
    {"speaker": "note", "content": "Chờ. Để khách tự rút ra từ quan sát của mình."},
    {"speaker": "khach", "content": "Chắc lãi nhiều hơn thật."},
    {"speaker": "sales", "content": "Dạ, anh muốn em làm kịch bản đầu tư cụ thể cho phần shophouse giai đoạn 1 không — với vốn anh đang có? Mình ngồi lại 30 phút."}
  ]'::jsonb,
  '[]'::jsonb,
  'Biết chi tiết sản phẩm và số lượng cụ thể giai đoạn 1 theo từng phân khu — không giải thích toàn bộ phân khu mỗi lần gặp khách. Kỹ năng cốt lõi: thu hẹp góc nhìn từ tổng thể về cụ thể — quan trọng nhất khi bán dự án quy mô lớn.',
  ARRAY['quy_mo_lon', 'thu_hep_goc_nhin', 'cho_thay_hinh_thanh'],
  ARRAY['quá lớn', 'choáng ngợp', 'chờ thấy', 'hình thành'],
  ARRAY['bds_pro'],
  ARRAY['d_42', 'b_023', 'd_35'],
  'Dự án quá lớn quy mô thu hẹp góc nhìn shophouse giai đoạn 1 hình thành');
