-- ============================================================
-- TL01: Phần A — Telesales và Tiếp cận (TH 01-20) — 20 tình huống
-- ID prefix: a_ (section A)
-- Content enhanced: 3-layer psychology (Bề mặt / Tầng giữa / Tầng gốc)
-- Universalized với placeholders từ project pack
-- ============================================================

INSERT INTO public.scenarios (id, doc_ref, section_code, section_title, title, objection_verbatim,
  methodology_tools, active_stages, analysis, customer_psychology, approach, script, warnings,
  skills_required, tags, keywords, tier_access, related_ids, search_content)
VALUES

-- ════════════════════════════════════════════════════════════
-- NHÓM 1: TỪ CHỐI LỚP 1 — KHÔNG MUỐN NGHE (30 giây đầu)
-- ════════════════════════════════════════════════════════════

-- TH 01: "Bận lắm, gọi lại sau"
('a_01', 'TL01', 'A', 'Telesales và Tiếp cận', 'Bận lắm, gọi lại sau',
  'Bận lắm, gọi lại sau',
  ARRAY['REFLECT'], ARRAY[2],
  'Đây là từ chối phổ biến nhất trong 30 giây đầu của cuộc gọi lạ. Không nhất thiết là khách đang bận, phần lớn là phản xạ để thoát khỏi cuộc gọi mà không cần giải thích lý do. Lỗi phổ biến: tư vấn viên cúp máy và gọi lại sau — khách vẫn sẽ bận. Hoặc tệ hơn: hỏi "vậy em gọi lại lúc mấy giờ ạ" — đặt mình vào thế người đang đuổi theo.',
  '{
    "surface": "Tôi đang bận, không có thời gian nói chuyện bây giờ.",
    "middle": "Đây là cuộc gọi lạ, tôi chưa biết người này là ai và muốn gì. Nói bận là cách nhanh nhất để kết thúc mà không phải giải thích hay từ chối thẳng.",
    "root": "Chưa có lý do đủ mạnh để đầu tư sự chú ý vào cuộc gọi này. Nếu tư vấn viên có điều gì đó thực sự đáng nghe, khách sẽ tự nhiên dành thời gian — không cần bị ép."
  }'::jsonb,
  '{
    "reflect": "KHÔNG xin lỗi, KHÔNG nài nỉ. Chấp nhận ngay, nhưng để lại một câu có giá trị thực sự. Trao quyền cho khách bằng cách cho họ lựa chọn nghe hay không nghe 30 giây.",
    "diq": "Nếu khách đồng ý cho 30 giây, ngay lập tức dùng hook (biến thể Phần 1) để tạo lý do nghe tiếp. Nếu vẫn từ chối, đặt lịch gọi lại cụ thể — không hỏi \"khi nào rảnh\"."
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "Bận lắm, gọi lại sau."},
    {"speaker": "sales", "content": "Dạ, em không mất nhiều thời gian của anh. Em chỉ muốn xác nhận một thông tin liên quan đến anh trong hệ thống của bên em. Anh có thể nghe em 30 giây không ạ?"},
    {"speaker": "note", "content": "Nếu khách đồng ý, đi thẳng vào hook của biến thể đang dùng."},
    {"speaker": "note", "content": "Nếu khách vẫn từ chối"},
    {"speaker": "sales", "content": "Dạ được anh. Em gọi lại vào buổi chiều nhé, khoảng 4-5 giờ anh thường rảnh hơn không ạ?"},
    {"speaker": "note", "content": "Đặt khung giờ cụ thể, KHÔNG hỏi \"khi nào rảnh\"."}
  ]'::jsonb,
  '[{"type": "never", "content": "KHÔNG xin lỗi vì đã gọi. Cố vấn tin cậy không xin lỗi vì đang mang thông tin có giá trị đến."}]'::jsonb,
  'Giữ được bình tĩnh và không bị cuốn vào áp lực tốc độ của khách. Có hook ngắn gọn 15-20 giây để triển khai ngay khi khách cho cơ hội thứ hai. Chủ động đặt lịch thay vì hỏi ngược.',
  ARRAY['ban_lam', 'tu_choi_lop_1', 'goi_lai', 'hook'],
  ARRAY['bận', 'gọi lại sau', 'không có thời gian', 'từ chối'],
  ARRAY['bds_pro'],
  ARRAY['a_02', 'a_03'],
  'Bận lắm gọi lại sau cuộc gọi lạ phản xạ thoát khỏi 30 giây hook'),

-- TH 02: "Không có nhu cầu"
('a_02', 'TL01', 'A', 'Telesales và Tiếp cận', 'Không có nhu cầu',
  'Không có nhu cầu đâu em ơi',
  ARRAY['REFLECT'], ARRAY[2],
  'Khách chưa xử lý được thông tin gì về dự án, chỉ nhận ra đây là cuộc gọi bán hàng nên phản xạ từ chối. Từ chối này KHÔNG liên quan đến dự án — liên quan đến người gọi. Lỗi phổ biến: tư vấn viên bắt đầu giải thích tại sao dự án tốt, hoặc hỏi "tại sao anh không có nhu cầu" — cả hai đều đẩy khách xa hơn.',
  '{
    "surface": "Tôi không có nhu cầu mua BĐS bây giờ.",
    "middle": "Đây là cuộc gọi telesales — tôi đã từ chối hàng chục cuộc như vậy. Nói không có nhu cầu là cách lịch sự nhất để kết thúc nhanh mà không làm người gọi mất mặt.",
    "root": "Cần một lý do cụ thể để bỏ qua phản xạ mặc định. Nếu thông tin đủ có giá trị và được chia sẻ không gây áp lực, tôi có thể xem xét — nhưng tôi không tự tìm lý do đó, người gọi phải đưa ra."
  }'::jsonb,
  '{
    "reflect": "KHÔNG hỏi lý do không có nhu cầu. Phân loại nhanh: khách chưa tìm hiểu, hay đã tìm hiểu và quyết định không phù hợp. Hai nhóm xử lý khác nhau hoàn toàn.",
    "diq": "Với khách chưa tìm hiểu: để lại một thông tin có giá trị + đề nghị gửi Zalo. Với khách đã tìm hiểu: dừng lịch sự, ghi chú nhóm lạnh, gọi lại sau 3-4 tuần với góc khác."
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "Không có nhu cầu đâu em ơi."},
    {"speaker": "sales", "content": "Dạ em hiểu. Anh chưa tìm hiểu về đợt này hay là đã xem rồi chưa phù hợp ạ?"},
    {"speaker": "note", "content": "Chờ. Câu hỏi này phân loại khách."},
    {"speaker": "note", "content": "Nếu khách chưa tìm hiểu"},
    {"speaker": "sales", "content": "Dạ, thì ra vậy. Anh đang trong danh sách em được giao liên hệ trước khi thư mời gửi chính thức. Nếu anh chưa tìm hiểu thì em nghĩ anh nên biết qua một chút trước khi quyết định có quan tâm hay không. Em gửi thông tin tóm tắt qua Zalo cho anh được không ạ?"},
    {"speaker": "note", "content": "Nếu khách vẫn từ chối"},
    {"speaker": "sales", "content": "Dạ được anh. Khi nào anh muốn tìm hiểu thêm, liên hệ em nhé."}
  ]'::jsonb,
  '[]'::jsonb,
  'Chấp nhận từ chối mà không phòng thủ. Chuyển từ "thuyết phục ngay" sang "để lại ấn tượng tốt để lần sau dễ tiếp cận". Buông đúng lúc là kỹ năng, không phải thất bại.',
  ARRAY['khong_nhu_cau', 'tu_choi_lop_1', 'phan_loai_khach'],
  ARRAY['không có nhu cầu', 'không cần', 'không quan tâm'],
  ARRAY['bds_pro'],
  ARRAY['a_01', 'a_08'],
  'Không có nhu cầu telesales cuộc gọi lạ phân loại chưa tìm hiểu'),

-- TH 03: "Gửi thông tin qua Zalo đi, rảnh tôi xem"
('a_03', 'TL01', 'A', 'Telesales và Tiếp cận', 'Gửi thông tin qua Zalo đi, rảnh tôi xem',
  'Gửi thông tin qua Zalo đi, rảnh tôi xem',
  ARRAY['REFLECT'], ARRAY[2, 4],
  'Đây là từ chối lịch sự — không phải quan tâm thật sự. Khách muốn kết thúc cuộc gọi mà không phải từ chối thẳng, và Zalo là cách lịch sự nhất. 90% nếu gửi Zalo xong chờ đợi sẽ không có phản hồi. Lỗi phổ biến: gửi Zalo xong ngồi đợi. Gửi không có cam kết bước tiếp theo = chôn lead.',
  '{
    "surface": "Anh bận, gửi Zalo để lúc nào rảnh xem cũng được.",
    "middle": "Nói gửi Zalo là cách lịch sự nhất để kết thúc cuộc gọi mà không bị tiếp tục thuyết phục. Tôi sẽ xem hoặc không, và cả hai bên đều không phải khó xử.",
    "root": "Chưa đủ tin tưởng để đầu tư sự chú ý vào cuộc gọi này. Nhưng cũng không hoàn toàn đóng cánh cửa — nếu thông tin gửi qua Zalo đáng giá và người gọi chủ động theo dõi, có thể mở lại đối thoại."
  }'::jsonb,
  '{
    "reflect": "Gửi Zalo — nhưng KHÔNG dừng ở đó. Đồng thời đặt câu hỏi ngắn để phân loại khách + đặt lịch gọi lại cụ thể.",
    "diq": "Khai thác một thông tin phân loại (đầu tư hay để ở?) để có cơ sở cá nhân hóa nội dung gửi. Kết hợp: gửi Zalo ngay + hẹn giờ cụ thể để gọi lại trao đổi."
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "Gửi thông tin qua Zalo đi, rảnh tôi xem."},
    {"speaker": "sales", "content": "Dạ được anh. Em gửi ngay. Mà anh đang quan tâm đến hướng đầu tư hay để ở ạ, để em biết gửi phần thông tin nào phù hợp nhất với anh?"},
    {"speaker": "note", "content": "Chờ. Câu trả lời là dữ liệu đầu tiên để phân loại khách."},
    {"speaker": "sales", "content": "Dạ, em gửi xong rồi anh. Để anh có đủ thông tin để quyết định có muốn tìm hiểu thêm hay không, em gọi lại cho anh vào [thứ X, giờ Y] để mình đi qua những điểm chính nhé, mất khoảng 10 phút thôi. Anh thấy khung giờ đó ổn không ạ?"},
    {"speaker": "note", "content": "Chờ xác nhận. KHÔNG kết thúc ở bước gửi Zalo."},
    {"speaker": "note", "content": "Tin nhắn Zalo gửi kèm"},
    {"speaker": "sales", "content": "Dạ em [tên] đây anh [tên] ơi. Em vừa gửi thông tin tóm tắt về {{project.name}} cho anh. Như đã hẹn, em sẽ gọi lại cho anh vào [thứ X, giờ Y] để mình trao đổi thêm phần anh muốn rõ hơn nhé."}
  ]'::jsonb,
  '[{"type": "never", "content": "KHÔNG gửi Zalo rồi ngồi đợi. Gửi KHÔNG CÓ cam kết bước tiếp theo = chôn lead."}]'::jsonb,
  'Kỹ năng chuyển Zalo từ "thoát cuộc gọi" thành "cầu nối cho lần tiếp xúc tiếp theo". Chuẩn bị sẵn template Zalo ngắn gọn, chuyên nghiệp, có lịch hẹn cụ thể đi kèm.',
  ARRAY['zalo', 'tu_choi_lich_su', 'follow_up', 'phan_loai'],
  ARRAY['Zalo', 'gửi thông tin', 'rảnh xem', 'khi nào'],
  ARRAY['bds_pro'],
  ARRAY['a_01', 'a_02'],
  'Zalo gửi thông tin rảnh xem từ chối lịch sự follow up hẹn gọi lại'),

-- TH 04: "Đã có người tư vấn rồi"
('a_04', 'TL01', 'A', 'Telesales và Tiếp cận', 'Đã có người tư vấn rồi',
  'Đã có người tư vấn rồi em ơi',
  ARRAY['REFLECT'], ARRAY[2],
  'Có thể là thật, có thể là cách từ chối lịch sự. Nếu thật, khách đang có mối quan hệ với tư vấn viên khác và không muốn phức tạp thêm. Lỗi phổ biến: cố chứng minh mình giỏi hơn tư vấn viên kia, hoặc công kích người đó — cả hai đều mất thế và có thể mất khách vĩnh viễn.',
  '{
    "surface": "Tôi đã có người tư vấn cho dự án này (hoặc dự án khác) rồi.",
    "middle": "Nói có người tư vấn là cách kết thúc cuộc gọi mà không cần giải thích. Hoặc nếu thật, tôi đã có mối quan hệ đủ tốt và không muốn phá vỡ nó.",
    "root": "Không muốn phức tạp hóa tình huống. Nhưng nếu có ai đó đưa ra giá trị khác biệt và không yêu cầu tôi bỏ người cũ, tôi có thể cởi mở để nghe thêm — miễn là không bị áp lực."
  }'::jsonb,
  '{
    "reflect": "KHÔNG cạnh tranh trực tiếp với tư vấn viên kia. Tôn trọng mối quan hệ đó. Phân biệt: khách đang được tư vấn về CÙNG dự án hay dự án khác — hai tình huống xử lý khác nhau.",
    "diq": "Nếu cùng dự án: định vị mình là góc nhìn thứ hai, không thay thế. Nếu khác dự án: mở ra rằng hai dự án có thể phục vụ mục tiêu khác nhau."
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "Đã có người tư vấn rồi em ơi."},
    {"speaker": "sales", "content": "Dạ vậy anh đang được tư vấn về dự án {{project.name}} hay dự án khác ạ?"},
    {"speaker": "note", "content": "Chờ. Phân loại ngay trước khi tiếp tục."},
    {"speaker": "note", "content": "Nếu khách đang được tư vấn về CÙNG dự án"},
    {"speaker": "sales", "content": "Dạ, vậy anh cứ trao đổi với người đó nhé. Em chỉ muốn hỏi, nếu anh muốn có thêm góc nhìn thứ hai về tài chính hoặc vị trí sản phẩm thì anh cứ liên hệ em, không phức tạp gì hết ạ."},
    {"speaker": "note", "content": "Nếu khách đang được tư vấn về dự án KHÁC"},
    {"speaker": "sales", "content": "Dạ, anh đang xem dự án đó theo hướng đầu tư hay để ở ạ? Em hỏi vì {{project.name}} và dự án anh đang xem có thể phục vụ hai mục đích khác nhau, không nhất thiết phải chọn một."}
  ]'::jsonb,
  '[{"type": "never", "content": "KHÔNG nói xấu tư vấn viên kia. KHÔNG hỏi \"họ là ai\" hay \"từ công ty nào\" — khách sẽ thấy mình đang cạnh tranh."}]'::jsonb,
  'Giữ vị thế cố vấn tin cậy ngay cả khi khách đã có người khác. Tôn trọng mối quan hệ hiện có là cách mạnh nhất để mở cửa cho mối quan hệ tương lai.',
  ARRAY['da_co_tu_van', 'canh_tranh', 'vi_the'],
  ARRAY['có người tư vấn', 'đã có sales', 'đang làm việc với'],
  ARRAY['bds_pro'],
  ARRAY['a_02', 'a_07'],
  'Đã có người tư vấn sales khác cạnh tranh cùng dự án góc nhìn thứ hai'),

-- TH 05: "Không có vốn, không quan tâm"
('a_05', 'TL01', 'A', 'Telesales và Tiếp cận', 'Không có vốn, không quan tâm',
  'Không có vốn, không quan tâm đâu em',
  ARRAY['REFLECT', 'DIQ'], ARRAY[2, 3],
  'Có thể là thật, có thể là cách từ chối không gây tranh luận. Quan trọng: phân biệt khách thật sự chưa đủ vốn (tiềm năng 12-24 tháng tới) và khách đang chờ đúng cơ hội (tiềm năng ngay bây giờ). Lỗi phổ biến: thuyết phục khách về vốn quá sớm trước khi phân loại.',
  '{
    "surface": "Tôi không có tiền để đầu tư BĐS bây giờ.",
    "middle": "Nói không có vốn là cách nhanh nhất để kết thúc mà không cần từ chối dự án cụ thể. Hoặc tôi có vốn nhưng đang giữ ở kênh khác và chưa thấy lý do đủ mạnh để chuyển dịch.",
    "root": "Vốn không chỉ là con số trong tài khoản, mà là câu hỏi về ưu tiên tài chính. Nếu cơ hội đủ hấp dẫn và cơ cấu thanh toán linh hoạt, tôi có thể xoay — vấn đề là tôi chưa thấy cơ hội đó."
  }'::jsonb,
  '{
    "reflect": "KHÔNG thuyết phục về vốn ngay. Hỏi khéo để biết khách đang giữ tiền ở đâu — từ đó phân loại được nhóm có vốn nhưng chưa xoay và nhóm thật sự không có vốn.",
    "diq": "Nếu có vốn ở kênh khác: chuyển sang đối thoại về cơ hội và cơ cấu thanh toán linh hoạt. Nếu thật sự không có vốn: ghi chú nhóm lạnh, dừng đúng lúc."
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "Không có vốn, không quan tâm đâu em."},
    {"speaker": "sales", "content": "Dạ, anh đang giữ tiền theo hướng nào vậy ạ? Em hỏi vì chính sách thanh toán giai đoạn 1 của dự án này khá linh hoạt, nhiều khách của em vào được chỉ với 30% vốn tự có ban đầu."},
    {"speaker": "note", "content": "Chờ. Câu trả lời phân loại khách."},
    {"speaker": "note", "content": "Nếu khách trả lời (đang giữ tiết kiệm, chứng khoán, vàng...)"},
    {"speaker": "sales", "content": "Dạ, như vậy thì anh cho em hỏi thêm một chút để xem phương án nào phù hợp với anh nhất nhé."},
    {"speaker": "note", "content": "Chuyển sang phân loại năng lực tài chính theo kịch bản nền tảng."}
  ]'::jsonb,
  '[]'::jsonb,
  'Phân biệt "không có vốn" thật và "chưa thấy lý do xoay vốn". Biết đặt câu hỏi không gây cảm giác dò xét tài chính nhưng vẫn đủ thông tin để phân loại.',
  ARRAY['khong_co_von', 'phan_loai_tai_chinh', 'don_bay'],
  ARRAY['không có vốn', 'thiếu tiền', 'chưa có tiền', 'đòn bẩy'],
  ARRAY['bds_pro'],
  ARRAY['a_02', 'a_19'],
  'Không có vốn thiếu tiền kênh giữ tiền tiết kiệm chứng khoán đòn bẩy linh hoạt'),

-- TH 06: "Số tôi lấy ở đâu vậy?"
('a_06', 'TL01', 'A', 'Telesales và Tiếp cận', 'Số tôi lấy ở đâu vậy?',
  'Ủa, số tôi lấy ở đâu vậy?',
  ARRAY['REFLECT'], ARRAY[2],
  'Khách cảm thấy quyền riêng tư bị xâm phạm. Đây là phản ứng phòng thủ, không phải từ chối về dự án. Cần giải quyết cảm xúc này TRƯỚC khi nói bất cứ điều gì về sản phẩm. Lỗi phổ biến: vòng vo hoặc nói dối về nguồn — khách nhận ra ngay và tin tưởng sụp đổ hoàn toàn.',
  '{
    "surface": "Tại sao tôi lại bị gọi? Số của tôi đến từ đâu?",
    "middle": "Cuộc gọi lạ + thông tin cá nhân của tôi bị chia sẻ mà tôi không biết = tôi cảm thấy bị xâm phạm. Tôi cần hiểu chuyện gì đang xảy ra trước khi quyết định có nghe tiếp hay không.",
    "root": "Muốn được đối xử như một cá nhân có quyền kiểm soát thông tin của mình, không phải một số điện thoại trong danh sách. Nếu tư vấn viên trả lời thẳng thắn và tôn trọng, tôi có thể bình tĩnh lại — nếu vòng vo, tôi sẽ cúp máy ngay."
  }'::jsonb,
  '{
    "reflect": "Trả lời THẬT, ngắn gọn, không vòng vo. Xin lỗi nếu cuộc gọi không đúng lúc. Sau đó chuyển hướng tự nhiên bằng câu hỏi giúp khách nhớ lại context.",
    "diq": "Câu hỏi \"anh đã từng để lại thông tin quan tâm về [khu vực/dự án] chưa\" giúp khách nhớ lại và hạ phòng thủ — vì có thể chính họ đã đăng ký ở đâu đó mà quên."
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "Ủa, số tôi lấy ở đâu vậy?"},
    {"speaker": "sales", "content": "Dạ, số anh có trong danh sách khách hàng quan tâm BĐS {{project.area}} mà bên em được CĐT {{project.developer}} cung cấp để liên hệ thông báo về đợt mở bán. Em xin lỗi nếu cuộc gọi này không đúng lúc. Anh đã từng để lại thông tin quan tâm về {{project.area}} hoặc các dự án {{project.developer}} trước đây chưa ạ?"},
    {"speaker": "note", "content": "Chờ. Câu hỏi cuối giúp khách nhớ lại và hạ phòng thủ."}
  ]'::jsonb,
  '[{"type": "never", "content": "KHÔNG vòng vo về nguồn gốc số. KHÔNG nói \"em không biết\" hoặc \"hệ thống cho\". Trả lời thật là cách duy nhất giữ được tin tưởng."}]'::jsonb,
  'Đủ bình tĩnh để xử lý cảm xúc phòng thủ của khách mà không bị cuốn vào thế giải thích dài dòng. Biết xin lỗi đúng mức, không quá mức.',
  ARRAY['quyen_rieng_tu', 'phong_thu', 'xin_loi'],
  ARRAY['số điện thoại', 'lấy ở đâu', 'thông tin cá nhân', 'ai cho'],
  ARRAY['bds_pro'],
  ARRAY['a_01', 'a_02'],
  'Số điện thoại lấy ở đâu thông tin cá nhân quyền riêng tư phòng thủ xin lỗi'),

-- TH 07: "Biết Hạ Long rồi, không quan tâm"
('a_07', 'TL01', 'A', 'Telesales và Tiếp cận', 'Biết khu vực rồi, không quan tâm',
  'Biết {{project.area}} rồi, không quan tâm đâu',
  ARRAY['REFLECT', 'DIQ'], ARRAY[2, 3],
  'Khách đang gộp khu vực cũ với dự án mới. Họ có thể đã trải nghiệm khu vực theo kiểu du lịch hoặc đã từng xem các dự án BĐS ở đây trước đây và không ấn tượng. Lỗi phổ biến: giải thích dự án ngay mà chưa tách biệt được định nghĩa "biết" của khách.',
  '{
    "surface": "Tôi đã biết khu vực này rồi, không cần nghe thêm.",
    "middle": "Biết theo kiểu du lịch, hoặc đã từng xem các dự án BĐS cũ ở đây và không ấn tượng. Tôi không phân biệt được khu vực địa lý và các phân khúc BĐS khác nhau trong cùng khu vực đó.",
    "root": "Cần ai đó giúp tôi thấy rằng trải nghiệm cũ không áp dụng cho tình huống mới này. Nếu tư vấn viên chỉ nói \"dự án này khác\" thì không đủ — phải làm tôi tự nhận ra khác biệt qua câu hỏi."
  }'::jsonb,
  '{
    "reflect": "KHÔNG giải thích dự án ngay. Tách biệt trải nghiệm cũ và dự án mới bằng câu hỏi phản chiếu: khách đang hình dung khu vực theo góc nào?",
    "diq": "Khi khách đã nêu rõ cơ sở của \"biết\", đưa dữ liệu cụ thể về quy mô dự án và khác biệt so với BĐS phổ thông trong khu vực. Câu hỏi mở cuối cùng: anh có muốn nghe thêm không?"
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "Biết {{project.area}} rồi, không quan tâm đâu."},
    {"speaker": "sales", "content": "Dạ, anh đang hình dung {{project.area}} theo kiểu du lịch hay theo kiểu đầu tư BĐS ạ?"},
    {"speaker": "note", "content": "Chờ. Câu hỏi tách biệt trải nghiệm cũ và bài toán đầu tư."},
    {"speaker": "sales", "content": "Dạ, em hỏi vì {{project.name}} không phải dự án {{project.segment}} thông thường. Đây là dự án đô thị {{project.size}} được {{legal.approval_authority}} phê duyệt, và cơ sở hạ tầng đang được đầu tư ở quy mô khác hoàn toàn so với những gì anh đã thấy ở {{project.area}} trước đây. Anh có muốn nghe thêm một chút không ạ?"},
    {"speaker": "note", "content": "Chờ. Câu hỏi mở, không áp đặt."}
  ]'::jsonb,
  '[]'::jsonb,
  'Không bị cuốn vào thế giải thích dự án khi chưa tách biệt được định nghĩa "biết" của khách. Dùng câu hỏi để khách tự nhận ra khác biệt, không áp đặt kết luận.',
  ARRAY['biet_khu_vuc', 'trai_nghiem_cu', 'phan_biet_phan_khuc'],
  ARRAY['biết rồi', 'khu vực', 'du lịch', 'đã xem'],
  ARRAY['bds_pro'],
  ARRAY['a_02', 'a_20'],
  'Biết khu vực rồi trải nghiệm cũ du lịch đầu tư BĐS đô thị quy mô khác'),

-- TH 08: "Tôi không đầu tư BĐS"
('a_08', 'TL01', 'A', 'Telesales và Tiếp cận', 'Tôi không đầu tư BĐS',
  'Tôi không đầu tư BĐS',
  ARRAY['REFLECT', 'DIQ'], ARRAY[2, 3],
  'Có thể là thật, có thể là cách từ chối nhanh. Nếu thật, cần tìm hiểu lý do để biết có phải lo ngại cụ thể hay là chưa từng nghĩ đến. Lỗi phổ biến: thuyết phục về BĐS ngay, hoặc liệt kê lý do BĐS tốt hơn kênh khác — cả hai đều đặt tư vấn viên vào thế "người bán hàng".',
  '{
    "surface": "Tôi không đầu tư BĐS, tôi có kênh khác.",
    "middle": "Tôi đang giữ tiền ở kênh quen thuộc (tiết kiệm, chứng khoán, vàng) và chưa có lý do đủ mạnh để chuyển dịch. Nói \"không đầu tư BĐS\" là cách đóng câu chuyện nhanh.",
    "root": "Không phải tôi không đầu tư BĐS, mà tôi chưa thấy lý do BĐS phù hợp với mục tiêu tài chính của mình. Nếu ai đó giúp tôi tự so sánh hiệu suất các kênh và tự rút ra kết luận, tôi có thể cởi mở."
  }'::jsonb,
  '{
    "reflect": "KHÔNG thuyết phục về BĐS. Hỏi khách đang giữ tiền theo hướng nào — từ đó mở ra đối thoại về chi phí cơ hội giữa các kênh.",
    "diq": "Khi khách chia sẻ kênh đang dùng, đưa dữ liệu so sánh hiệu suất (lãi suất tiết kiệm vs tăng giá BĐS theo {{market.data_source}}). Câu hỏi khai mở: điều đó có ý nghĩa gì với bài toán tài chính của anh?"
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "Tôi không đầu tư BĐS."},
    {"speaker": "sales", "content": "Dạ, anh đang giữ tiền theo hướng nào ạ? Gửi tiết kiệm hay đang xem kênh khác?"},
    {"speaker": "note", "content": "Chờ. Câu hỏi mở đối thoại về kênh đầu tư."},
    {"speaker": "note", "content": "Nếu khách trả lời gửi tiết kiệm hoặc kênh khác"},
    {"speaker": "sales", "content": "Dạ, anh thấy kênh đó ổn với lãi suất hiện tại không ạ? Em hỏi vì nhiều khách của em trước đây cũng không nghĩ đến BĐS, cho đến khi họ tính được con số cụ thể và so sánh. Anh cho em chia sẻ một thông tin nhỏ được không ạ?"},
    {"speaker": "note", "content": "Chờ. Nếu đồng ý, đưa số liệu DIQ theo kịch bản nền tảng."}
  ]'::jsonb,
  '[]'::jsonb,
  'Không gượng ép khách phải nhận BĐS là tốt. Biến cuộc gọi từ "bán BĐS" thành "cung cấp thông tin để khách tự đánh giá cơ hội". Vị thế cố vấn trung lập luôn mạnh hơn vị thế người bán.',
  ARRAY['khong_dau_tu_bds', 'kenh_dau_tu_khac', 'chi_phi_co_hoi'],
  ARRAY['không đầu tư', 'kênh khác', 'tiết kiệm', 'chứng khoán'],
  ARRAY['bds_pro'],
  ARRAY['a_02', 'a_05'],
  'Không đầu tư BĐS kênh khác tiết kiệm chứng khoán chi phí cơ hội so sánh'),

-- ════════════════════════════════════════════════════════════
-- NHÓM 2: TỪ CHỐI LỚP 2 — NGHI NGỜ VỀ DỰ ÁN (3 phút khai thác)
-- ════════════════════════════════════════════════════════════

-- TH 09: "Dự án lấp biển không tin tưởng"
('a_09', 'TL01', 'A', 'Telesales và Tiếp cận', 'Dự án lấp biển không tin tưởng',
  'Dự án lấp biển thì không tin tưởng được',
  ARRAY['REFLECT', 'DIQ'], ARRAY[2, 3],
  'Khách đang gộp tất cả dự án lấp biển vào một nhóm — bao gồm cả các dự án trôi nổi không có căn cứ pháp lý rõ ràng. Lỗi phổ biến: giải thích kỹ thuật lấp biển ngay, khách thấy đây là phản bác chứ không phải đối thoại.',
  '{
    "surface": "Tôi không tin dự án lấp biển — pháp lý phức tạp, rủi ro cao.",
    "middle": "Tôi đã nghe về các dự án lấp biển có vấn đề (đình chỉ, thay đổi quy hoạch, không ra sổ). Với tôi, \"lấp biển\" = \"rủi ro cao\".",
    "root": "Cần bằng chứng cụ thể có thể kiểm chứng về pháp lý và kỹ thuật của dự án này — không phải lời đảm bảo bằng lời. Nếu có văn bản nguồn gốc rõ ràng, tôi có thể xem xét."
  }'::jsonb,
  '{
    "reflect": "KHÔNG giải thích kỹ thuật lấp biển ngay. Tách biệt bằng câu hỏi phản chiếu: khách đang so sánh với dự án nào, lo ngại phần pháp lý hay kỹ thuật?",
    "diq": "Đưa dẫn chứng cụ thể có thể kiểm chứng: {{legal.approval_doc}}, ngày khởi công, trạng thái GPMB. Đề nghị gửi văn bản để khách tự đánh giá thay vì tin vào lời nói."
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "Dự án lấp biển thì không tin tưởng được."},
    {"speaker": "sales", "content": "Dạ, anh đang so sánh với dự án lấp biển nào mà anh đã từng nghe qua ạ?"},
    {"speaker": "note", "content": "Chờ."},
    {"speaker": "sales", "content": "Dạ, anh thấy điểm nào khiến anh không tin tưởng nhất ạ, pháp lý hay kỹ thuật xây dựng?"},
    {"speaker": "note", "content": "Chờ. Phân loại lo ngại."},
    {"speaker": "sales", "content": "Dạ, em hỏi vì {{project.name}} là dự án duy nhất được phê duyệt trực tiếp bởi {{legal.approval_authority}} theo {{legal.approval_doc}}, và đã khởi công chính thức {{project.construction_start_date}}. Nếu anh muốn, em gửi văn bản phê duyệt cho anh xem để anh tự đánh giá nhé?"}
  ]'::jsonb,
  '[{"type": "never", "content": "KHÔNG hứa \"dự án này an toàn\" hoặc \"không có rủi ro\". Rủi ro luôn tồn tại — chỉ có thể giảm qua việc có văn bản pháp lý rõ ràng."}]'::jsonb,
  'Nắm rõ tài liệu pháp lý gốc (quyết định phê duyệt, biên bản khởi công, hồ sơ GPMB) và biết cách đề nghị gửi cho khách kiểm chứng thay vì thuyết phục bằng lời.',
  ARRAY['lap_bien', 'phap_ly', 'rui_ro', 'van_ban_goc'],
  ARRAY['lấp biển', 'không tin', 'pháp lý', 'rủi ro'],
  ARRAY['bds_pro'],
  ARRAY['a_14', 'a_16'],
  'Dự án lấp biển không tin tưởng pháp lý rủi ro phê duyệt văn bản gốc'),

-- TH 10: "Giá cao quá"
('a_10', 'TL01', 'A', 'Telesales và Tiếp cận', 'Giá cao quá',
  'Giá cao quá',
  ARRAY['REFLECT'], ARRAY[2],
  'Khách đang so sánh với một mức giá khác trong đầu, nhưng chưa nói ra so sánh với gì. Đây chưa phải từ chối thật — chỉ là phản ứng đầu tiên khi nghe giá. Lỗi phổ biến: giải thích tại sao giá xứng đáng trước khi biết khách đang so với gì.',
  '{
    "surface": "Giá cao hơn mức tôi nghĩ.",
    "middle": "Tôi có một mức giá neo trong đầu (từ dự án khác, hoặc từ kỳ vọng cá nhân). Cuộc gọi chưa cho tôi đủ bối cảnh để đánh giá giá này có thật sự cao không.",
    "root": "Cần hiểu được tại sao giá ở mức này, và điều đó có ý nghĩa gì với bài toán của tôi. Nếu chỉ nói \"giá xứng đáng vì...\" không thuyết phục — tôi cần tự đánh giá qua so sánh có bối cảnh."
  }'::jsonb,
  '{
    "reflect": "KHÔNG giải thích tại sao giá xứng đáng. Hỏi để biết khách đang so sánh với điều gì — dự án khác hay kỳ vọng cá nhân.",
    "diq": "Nếu so với dự án khác: hỏi vị trí và loại sản phẩm để so sánh \"táo với táo\". Nếu so với kỳ vọng: hỏi cơ sở của kỳ vọng đó trong bối cảnh {{project.segment}} tại {{project.area}}."
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "Giá cao quá."},
    {"speaker": "sales", "content": "Dạ, anh đang so sánh với dự án nào ạ, hay là so với kỳ vọng của anh trước khi nghe?"},
    {"speaker": "note", "content": "Chờ. Phân loại cơ sở so sánh."},
    {"speaker": "note", "content": "Nếu khách so sánh với dự án khác"},
    {"speaker": "sales", "content": "Dạ, dự án đó anh đang xem ở vị trí nào và loại sản phẩm gì ạ? Em hỏi để mình so sánh đúng táo với táo, không phải táo với cam."},
    {"speaker": "note", "content": "Nếu khách so sánh với kỳ vọng"},
    {"speaker": "sales", "content": "Dạ, anh đang hình dung mức giá bao nhiêu là hợp lý cho vị trí {{project.location_detail}} ạ? Em muốn hiểu anh đang có cơ sở nào để so sánh."}
  ]'::jsonb,
  '[]'::jsonb,
  'Kỹ năng kiềm chế không nhảy vào giải thích giá. Biết đặt câu hỏi mà không làm khách cảm thấy bị chất vấn.',
  ARRAY['gia_cao', 'so_sanh_gia', 'neo_tu_duy'],
  ARRAY['giá cao', 'đắt', 'so sánh', 'mắc'],
  ARRAY['bds_pro'],
  ARRAY['a_11', 'a_19'],
  'Giá cao quá so sánh dự án khác kỳ vọng cơ sở táo với táo'),

-- TH 11: "Chờ thị trường ổn hơn rồi tính"
('a_11', 'TL01', 'A', 'Telesales và Tiếp cận', 'Chờ thị trường ổn hơn rồi tính',
  'Thị trường chưa ổn, chờ thêm rồi tính',
  ARRAY['REFLECT'], ARRAY[2],
  'Khách đang dùng "thị trường" làm lý do hoãn quyết định. Đây thường là lo ngại về rủi ro cá nhân, không phải dự báo thị trường thật sự. Lỗi phổ biến: tranh luận về dự báo thị trường — không ai thắng trong tranh luận đó, và tư vấn viên mất thế.',
  '{
    "surface": "Thị trường chưa ổn định, tôi chờ thêm.",
    "middle": "Tôi chưa sẵn sàng quyết định và \"chờ thị trường ổn\" là lý do nghe có lý để trì hoãn. Thực tế tôi không có mốc thời gian cụ thể hay điều kiện cụ thể để quyết định.",
    "root": "Sợ ra quyết định sai hơn là sợ mất cơ hội. Cần khung tư duy giúp cảm thấy quyết định dựa trên lý trí, không phải cảm tính. Nếu có cơ sở cụ thể để đánh giá \"khi nào là đúng lúc\", tôi có thể cởi mở hơn."
  }'::jsonb,
  '{
    "reflect": "KHÔNG tranh luận về dự báo thị trường. Hỏi để khách tự làm rõ: đang chờ điều gì cụ thể, bao lâu, mốc nào báo hiệu \"ổn\".",
    "diq": "Khi khách phải trả lời cụ thể, họ thường tự nhận ra kịch bản \"chờ\" chưa bao giờ rõ ràng trong đầu họ. Từ đó mở ra đối thoại về chi phí cơ hội của việc chờ."
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "Thị trường chưa ổn, chờ thêm rồi tính."},
    {"speaker": "sales", "content": "Dạ, anh đang chờ điều gì cụ thể ạ, lãi suất xuống thêm hay chờ pháp lý rõ hơn?"},
    {"speaker": "note", "content": "Chờ."},
    {"speaker": "sales", "content": "Dạ, em hỏi vì mỗi yếu tố đó có mốc thời gian khác nhau. Anh đang hình dung khoảng bao lâu nữa thì điều anh chờ sẽ xảy ra ạ?"},
    {"speaker": "note", "content": "Chờ. Để khách tự nhận ra mình không có câu trả lời cụ thể."}
  ]'::jsonb,
  '[]'::jsonb,
  'Kiên nhẫn không tranh luận về thị trường. Biết đặt câu hỏi buộc khách cụ thể hóa kỳ vọng mơ hồ của chính họ.',
  ARRAY['cho_thi_truong', 'tri_hoan', 'khong_co_moc'],
  ARRAY['chờ thị trường', 'thị trường chưa ổn', 'chờ thêm', 'trì hoãn'],
  ARRAY['bds_pro'],
  ARRAY['a_19', 'a_10'],
  'Chờ thị trường ổn trì hoãn mốc thời gian lãi suất pháp lý cụ thể'),

-- TH 12: "Hạ Long xa, không ai thuê đâu"
('a_12', 'TL01', 'A', 'Telesales và Tiếp cận', 'Khu vực xa, không ai thuê',
  '{{project.area}} xa, không ai thuê đâu',
  ARRAY['REFLECT', 'DIQ'], ARRAY[2, 3],
  'Khách đang nghĩ đến kịch bản cho thuê với tệp khách nội địa ngắn hạn. Chưa hình dung được thị trường khách quốc tế và khách dài hạn. Lỗi phổ biến: liệt kê lý do người sẽ thuê — khách thấy đây là lập luận một chiều, không tin.',
  '{
    "surface": "{{project.area}} xa, khách thuê ít, yield thấp.",
    "middle": "Tôi đang hình dung tệp khách thuê là người nội địa đi nghỉ ngắn ngày. Với tệp đó, {{project.area}} không thuận tiện.",
    "root": "Cần thấy một tệp khách khác mà tôi chưa nghĩ tới — có thể là khách quốc tế, khách doanh nhân, khách dài hạn. Nếu có dữ liệu cụ thể về lượng khách thực tế của khu vực, tôi có thể xem lại giả định của mình."
  }'::jsonb,
  '{
    "reflect": "KHÔNG liệt kê lý do người sẽ thuê. Hỏi để khách tự làm rõ tệp khách họ đang hình dung.",
    "diq": "Đưa dữ liệu lượng khách thực tế (cả nội địa và quốc tế) + định vị di sản/du lịch của khu vực. Câu hỏi khai mở: với lượng khách đó, câu hỏi \"có ai thuê không\" còn đúng không?"
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "{{project.area}} xa, không ai thuê đâu."},
    {"speaker": "sales", "content": "Dạ, anh đang hình dung tệp khách thuê là ai ạ, người {{competitor.nearest_city}} hay người nước ngoài?"},
    {"speaker": "note", "content": "Chờ."},
    {"speaker": "sales", "content": "Dạ, anh biết lượng khách quốc tế đến {{project.area}} mỗi năm là bao nhiêu không ạ?"},
    {"speaker": "note", "content": "Chờ."},
    {"speaker": "sales", "content": "Dạ, {{project.area}} đón {{area.tourism_stats}}, trong đó có {{area.international_tourism}} là khách quốc tế. {{project.usp_main}}, khách nước ngoài đến không cần lý do ngoài cái tên đó. Anh thấy với lượng khách đó, câu hỏi có ai thuê không còn đúng nữa không ạ?"}
  ]'::jsonb,
  '[]'::jsonb,
  'Nắm số liệu du lịch chính thức của khu vực (Sở Du lịch, báo cáo kinh tế xã hội). Biết cách đặt câu hỏi dẫn khách tự đánh giá lại giả định của mình thay vì áp đặt thông tin.',
  ARRAY['xa_trung_tam', 'cho_thue', 'tep_khach', 'du_lich'],
  ARRAY['xa', 'không ai thuê', 'yield', 'khách thuê'],
  ARRAY['bds_pro'],
  ARRAY['a_16', 'a_20'],
  'Khu vực xa không ai thuê yield khách thuê quốc tế du lịch di sản'),

-- TH 13: "Vinhomes/CĐT hay chậm tiến độ"
('a_13', 'TL01', 'A', 'Telesales và Tiếp cận', 'CĐT hay chậm tiến độ',
  '{{project.developer}} hay chậm tiến độ lắm',
  ARRAY['REFLECT', 'DIQ'], ARRAY[2, 3],
  'Khách đã nghe về một dự án của CĐT bị chậm, hoặc có trải nghiệm cá nhân. Đây là lo ngại có cơ sở, không phải lo ngại vô lý. Lỗi phổ biến: bác bỏ ngay "không, dự án này khác" — khách thấy tư vấn viên không trung thực.',
  '{
    "surface": "{{project.developer}} từng chậm tiến độ ở dự án khác, tôi lo dự án này cũng vậy.",
    "middle": "Tôi đã đầu tư hoặc biết người đầu tư bị thiệt khi dự án chậm. Rủi ro chậm là thật, không phải tưởng tượng.",
    "root": "Cần thấy sự khác biệt giữa các dự án — không phải chỉ lời hứa. Nếu dự án này có cam kết mạnh hơn từ cấp cao (nhà nước, quy hoạch vùng), tôi sẽ cân nhắc lại mức độ rủi ro."
  }'::jsonb,
  '{
    "reflect": "KHÔNG bác bỏ. Thừa nhận rủi ro tồn tại. Hỏi để khách tự nhắc đến dự án cụ thể nào — từ đó so sánh bối cảnh.",
    "diq": "Đưa dữ liệu về mức độ cam kết của nhà nước trong dự án này (phê duyệt trực tiếp, quy hoạch vùng). Câu hỏi khai mở: so với dự án thông thường, mức cam kết này có ý nghĩa gì?"
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "{{project.developer}} hay chậm tiến độ lắm."},
    {"speaker": "sales", "content": "Dạ, anh đang nghĩ đến dự án nào của {{project.developer}} ạ?"},
    {"speaker": "note", "content": "Chờ. Không bác bỏ."},
    {"speaker": "sales", "content": "Dạ, anh thấy dự án được {{legal.approval_authority}} phê duyệt trực tiếp và đã khởi công rồi có rủi ro chậm tiến độ giống các dự án thông thường không ạ? Em không nói là không có rủi ro, nhưng anh thấy mức độ cam kết của nhà nước trong dự án này như thế nào?"}
  ]'::jsonb,
  '[{"type": "never", "content": "KHÔNG nói \"dự án này chắc chắn không chậm\". Rủi ro chậm luôn tồn tại — vấn đề là mức độ và cơ chế bảo vệ khách nếu có."}]'::jsonb,
  'Trung thực về rủi ro là cách duy nhất giữ được tin tưởng. Biết phân biệt lập luận "giảm rủi ro" và "không có rủi ro" — hai thứ hoàn toàn khác nhau.',
  ARRAY['cham_tien_do', 'rui_ro', 'cam_ket_nha_nuoc'],
  ARRAY['chậm tiến độ', 'trễ', 'chưa bàn giao', 'chậm tay'],
  ARRAY['bds_pro'],
  ARRAY['a_09', 'a_14'],
  'Chậm tiến độ rủi ro cam kết nhà nước phê duyệt quy hoạch'),

-- TH 14: "Pháp lý chưa rõ, sợ rủi ro"
('a_14', 'TL01', 'A', 'Telesales và Tiếp cận', 'Pháp lý chưa rõ, sợ rủi ro',
  'Pháp lý chưa rõ, tôi sợ rủi ro',
  ARRAY['REFLECT', 'DIQ'], ARRAY[2, 3],
  'Lo ngại hợp lý và cụ thể. Khách đang cần thông tin thật, không cần được trấn an bằng lời nói. Lỗi phổ biến: hứa "pháp lý đầy đủ" hoặc "không có vấn đề gì" — không có cơ sở, khách không tin.',
  '{
    "surface": "Pháp lý dự án chưa rõ ràng, tôi sợ rủi ro.",
    "middle": "Pháp lý là lo ngại có cơ sở nhất trong đầu tư BĐS. Tôi đã nghe nhiều trường hợp khách mua xong không ra sổ, hoặc bị đình chỉ dự án. Tôi cần chứng minh cụ thể.",
    "root": "Cần văn bản pháp lý gốc có thể kiểm chứng, không phải lời đảm bảo bằng lời nói. Nếu có tài liệu nguồn gốc đầy đủ, tôi có thể cho luật sư riêng xem và đánh giá độc lập."
  }'::jsonb,
  '{
    "reflect": "Phân loại lo ngại cụ thể: pháp lý sản phẩm, pháp lý đất, hay pháp lý quy hoạch — ba loại xử lý khác nhau.",
    "diq": "Cung cấp thông tin pháp lý thật, có nguồn gốc, ngắn gọn. Đề nghị gửi văn bản để khách tự đọc hoặc cho luật sư xem — đây là cách duy nhất xây dựng tin tưởng."
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "Pháp lý chưa rõ, tôi sợ rủi ro."},
    {"speaker": "sales", "content": "Dạ, anh đang lo ngại về pháp lý phần nào ạ, quyền sở hữu sản phẩm hay pháp lý đất lấp biển?"},
    {"speaker": "note", "content": "Chờ."},
    {"speaker": "sales", "content": "Dạ, lo ngại đó hoàn toàn hợp lý. Dự án được phê duyệt theo {{legal.approval_doc}} của {{legal.approval_authority}}, GPMB đã đạt {{project.gpmb_percent}} và đã khởi công chính thức. Em gửi anh văn bản phê duyệt và hợp đồng mẫu để anh tự đọc và cho luật sư xem nếu cần. Anh muốn em gửi qua Zalo không ạ?"}
  ]'::jsonb,
  '[{"type": "never", "content": "KHÔNG hứa \"pháp lý hoàn toàn đầy đủ\" hoặc \"không có rủi ro\". Đó là lời hứa không có văn bản — khách nhận ra ngay."}]'::jsonb,
  'Thuộc lòng các văn bản pháp lý gốc của dự án và có sẵn bản PDF để gửi ngay. Khuyến khích khách tham vấn pháp lý độc lập là dấu hiệu của cố vấn tin cậy.',
  ARRAY['phap_ly', 'rui_ro', 'van_ban_goc', 'luat_su'],
  ARRAY['pháp lý', 'sợ rủi ro', 'sổ đỏ', 'hợp đồng'],
  ARRAY['bds_pro'],
  ARRAY['a_09', 'a_18'],
  'Pháp lý chưa rõ sợ rủi ro sở hữu sản phẩm đất lấp biển văn bản gốc'),

-- TH 15: "Hạ Long hay bão lũ"
('a_15', 'TL01', 'A', 'Telesales và Tiếp cận', 'Khu vực hay bão lũ',
  '{{project.area}} hay có bão lũ lắm',
  ARRAY['REFLECT', 'DIQ'], ARRAY[2, 3],
  'Khách đang gộp khu vực vào nhóm các tỉnh duyên hải hay bị bão. Chưa biết đặc điểm địa lý cụ thể. Lỗi phổ biến: giải thích địa lý ngay — khách thấy đây là bài giảng, không phải đối thoại.',
  '{
    "surface": "{{project.area}} là vùng ven biển, tôi lo bão lũ ảnh hưởng tài sản.",
    "middle": "Tôi đang liên tưởng {{project.area}} với các bãi biển miền Trung hay các vùng duyên hải khác hay bị bão. Với tôi, \"gần biển\" = \"rủi ro thời tiết\".",
    "root": "Cần thấy được sự khác biệt địa lý cụ thể. Nếu khu vực này thực sự có đặc điểm bảo vệ tự nhiên, tôi sẽ xem xét lại giả định. Nhưng phải bằng dữ kiện có thể kiểm chứng, không phải lời đảm bảo."
  }'::jsonb,
  '{
    "reflect": "KHÔNG giải thích địa lý ngay. Hỏi phản chiếu để khách tự nhận ra tiền đề của mình — đang so sánh với khu vực nào.",
    "diq": "Đưa dữ kiện địa lý cụ thể có thể kiểm chứng (vịnh kín, địa hình bảo vệ tự nhiên, lịch sử cảng biển). Câu hỏi khai mở: nếu nơi này nguy hiểm, người ta có chọn không?"
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "{{project.area}} hay có bão lũ lắm."},
    {"speaker": "sales", "content": "Dạ, anh đang hình dung {{project.area}} giống bờ biển nào ạ, kiểu Đà Nẵng hay Nha Trang?"},
    {"speaker": "note", "content": "Chờ."},
    {"speaker": "sales", "content": "Dạ, anh biết điểm khác lớn nhất giữa {{project.location_detail}} và những nơi đó là gì không ạ?"},
    {"speaker": "note", "content": "Chờ."},
    {"speaker": "sales", "content": "Dạ, {{project.geographic_feature}}. Gió từ ngoài khơi vào đến bờ đã bị chặn phần lớn rồi. {{project.historical_reference}}. Anh thấy nếu nơi này nguy hiểm, người ta có chọn không ạ?"}
  ]'::jsonb,
  '[]'::jsonb,
  'Nắm đặc điểm địa lý cụ thể của khu vực (vịnh/cửa biển/bãi hở) và lịch sử sử dụng của khu vực đó (cảng, căn cứ, khu du lịch). Dùng dẫn chứng lịch sử thay vì lập luận kỹ thuật.',
  ARRAY['bao_lu', 'dia_ly', 'vinh_kin', 'lich_su'],
  ARRAY['bão lũ', 'thời tiết', 'nguy hiểm', 'ven biển'],
  ARRAY['bds_pro'],
  ARRAY['a_09', 'a_16'],
  'Bão lũ thời tiết địa lý vịnh kín di sản cảng biển lịch sử'),

-- TH 16: "Khó bán lại, thanh khoản kém"
('a_16', 'TL01', 'A', 'Telesales và Tiếp cận', 'Khó bán lại, thanh khoản kém',
  'BĐS {{project.area}} khó bán lại lắm, thanh khoản kém',
  ARRAY['REFLECT', 'DIQ'], ARRAY[2, 3],
  'Khách đã trải qua hoặc nghe về BĐS nghỉ dưỡng khó thanh khoản ở các khu vực khác. Lo ngại có cơ sở từ thị trường chung, không phải từ dự án cụ thể này. Lỗi phổ biến: phủ nhận ngay — khách thấy tư vấn viên không hiểu thị trường.',
  '{
    "surface": "BĐS ở {{project.area}} khó bán lại, thanh khoản kém.",
    "middle": "Tôi đã nghe về các dự án condotel, second home ở khu vực tương tự bị kẹt vốn 3-5 năm không bán được. {{project.area}} có vẻ cùng nhóm.",
    "root": "Cần hiểu loại sản phẩm nào thật sự có thanh khoản kém, và loại nào có tệp khách mua lại rõ ràng. Nếu dự án này khác về phân khúc và quy mô, bài toán thanh khoản cũng sẽ khác — nhưng phải được chứng minh cụ thể."
  }'::jsonb,
  '{
    "reflect": "KHÔNG phủ nhận lo ngại. Hỏi để khách tự nêu loại sản phẩm đang so sánh — condotel? đất nền? hay sản phẩm khác?",
    "diq": "Tách biệt bối cảnh: dự án đô thị {{project.size}} với tệp khách đa dạng (mua để ở, cho thuê, đầu tư) khác hoàn toàn với condotel ven biển. Thừa nhận rủi ro tồn tại nhưng bối cảnh khác."
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "BĐS {{project.area}} khó bán lại lắm, thanh khoản kém."},
    {"speaker": "sales", "content": "Dạ, anh đang nghĩ đến loại sản phẩm nào ạ, condotel hay đất nền?"},
    {"speaker": "note", "content": "Chờ."},
    {"speaker": "sales", "content": "Dạ, anh thấy một dự án đô thị {{project.size}} với thương hiệu {{project.developer}} và hạ tầng do nhà nước đầu tư có cùng bài toán thanh khoản với condotel ven biển thông thường không ạ? Em không nói là không có rủi ro, nhưng bối cảnh khác nhau thì bài toán cũng khác."}
  ]'::jsonb,
  '[]'::jsonb,
  'Phân biệt rõ phân khúc BĐS (đô thị / nghỉ dưỡng / condotel / đất nền) và tệp khách mua lại tương ứng. Tránh câu trả lời chung chung khi khách có lo ngại cụ thể.',
  ARRAY['thanh_khoan', 'ban_lai', 'phan_khuc'],
  ARRAY['khó bán lại', 'thanh khoản', 'condotel', 'kẹt vốn'],
  ARRAY['bds_pro'],
  ARRAY['a_12', 'a_18'],
  'Khó bán lại thanh khoản kém condotel đô thị phân khúc tệp khách'),

-- TH 17: "Đối thủ làm trước rồi, Vinhomes vào sau"
('a_17', 'TL01', 'A', 'Telesales và Tiếp cận', 'Đối thủ làm trước rồi, CĐT vào sau',
  '{{competitors.list}} làm ở đó rồi, {{project.developer}} vào sau còn gì nữa đâu',
  ARRAY['REFLECT', 'DIQ'], ARRAY[2, 3],
  'Khách cho rằng thị trường đã bão hòa. Chưa hình dung được quy mô và định vị khác biệt của dự án này so với các dự án đã có. Lỗi phổ biến: nói xấu đối thủ hoặc liệt kê điểm yếu của họ — thiếu tự tin.',
  '{
    "surface": "{{competitors.list}} đã làm ở khu vực này rồi, thị trường bão hòa.",
    "middle": "Tôi đang coi BĐS ở một khu vực là một thị trường duy nhất. Một khi đã có đối thủ lớn, tôi nghĩ không còn chỗ cho người đến sau.",
    "root": "Cần hiểu được định vị khác biệt cụ thể. Nếu dự án này phục vụ phân khúc khác, tệp khách khác, và mô hình khác, nó không phải \"đến sau\" mà là \"loại khác\" — nhưng phải được chứng minh, không phải chỉ nói."
  }'::jsonb,
  '{
    "reflect": "KHÔNG nói xấu đối thủ. Hỏi để khách tự so sánh định vị: đối thủ đang làm phân khúc nào.",
    "diq": "Tách biệt bằng định vị sản phẩm: đô thị {{project.size}} vs resort/khu nghỉ dưỡng. Không phải đối thủ trực tiếp — mà là hai loại hình khác nhau bổ trợ cho nhau."
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "{{competitors.list}} làm ở đó rồi, {{project.developer}} vào sau còn gì nữa đâu."},
    {"speaker": "sales", "content": "Dạ, anh thấy {{competitors.list}} đang làm ở phân khúc nào, du lịch nghỉ dưỡng hay đô thị để ở ạ?"},
    {"speaker": "note", "content": "Chờ."},
    {"speaker": "sales", "content": "Dạ, {{project.name}} là đô thị {{project.size}}, không phải resort hay khu nghỉ dưỡng. Về quy mô, nó lớn hơn toàn bộ những gì {{competitors.list}} đang làm ở {{project.area}} cộng lại. Anh thấy hai thứ đó cạnh tranh nhau hay bổ trợ nhau ạ?"}
  ]'::jsonb,
  '[{"type": "never", "content": "KHÔNG nói xấu đối thủ. Nếu có điểm yếu, để khách tự nhận ra qua câu hỏi — không tư vấn viên chỉ ra."}]'::jsonb,
  'Hiểu rõ định vị phân khúc của từng đối thủ lớn trong khu vực. Biết tách biệt \"cạnh tranh\" và \"bổ trợ\" bằng câu hỏi thay vì kết luận.',
  ARRAY['canh_tranh', 'dinh_vi', 'do_thi_vs_nghi_duong'],
  ARRAY['đối thủ', 'đến sau', 'Sun Group', 'BIM', 'bão hòa'],
  ARRAY['bds_pro'],
  ARRAY['a_20', 'a_13'],
  'Đối thủ làm trước đến sau bão hòa định vị phân khúc đô thị nghỉ dưỡng'),

-- TH 18: "Condotel không có sổ đỏ"
('a_18', 'TL01', 'A', 'Telesales và Tiếp cận', 'Condotel không có sổ đỏ',
  'Condotel không có sổ đỏ, tôi không mua',
  ARRAY['REFLECT'], ARRAY[2],
  'Khách đang gộp tất cả sản phẩm trong dự án vào loại condotel. Chưa biết dự án có nhiều loại sản phẩm với pháp lý khác nhau. Lỗi phổ biến: giải thích về pháp lý condotel — khách chưa cần điều đó, họ cần biết có loại khác không.',
  '{
    "surface": "Condotel pháp lý không rõ, không có sổ đỏ, tôi không mua.",
    "middle": "Tôi đã nghe về các vấn đề pháp lý của condotel (tranh chấp, không ra sổ). Tôi giả định dự án này cũng là condotel.",
    "root": "Cần biết dự án này có loại sản phẩm nào phù hợp với tiêu chí pháp lý của tôi (sổ đỏ dài hạn, quyền sở hữu rõ ràng). Nếu có, bài toán hoàn toàn khác."
  }'::jsonb,
  '{
    "reflect": "KHÔNG giải thích về pháp lý condotel. Làm rõ: khách đang quan tâm loại sản phẩm nào? Có thể dự án có nhiều loại khác nhau.",
    "diq": "Khi biết loại khách quan tâm, cung cấp pháp lý cụ thể cho loại đó. Mỗi loại sản phẩm trong dự án đô thị có pháp lý khác nhau — không gộp hết vào một nhóm."
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "Condotel không có sổ đỏ, tôi không mua."},
    {"speaker": "sales", "content": "Dạ, anh đang quan tâm đến loại sản phẩm nào trong dự án ạ, căn hộ, biệt thự hay shophouse?"},
    {"speaker": "note", "content": "Chờ. Làm rõ loại sản phẩm trước khi giải thích pháp lý."},
    {"speaker": "sales", "content": "Dạ, anh hỏi đúng điểm quan trọng đấy. Loại sản phẩm anh đang xét và pháp lý của nó khác nhau. Em giải thích cụ thể cho anh phần sản phẩm anh quan tâm nhé, không cào bằng hết vào một nhóm được."}
  ]'::jsonb,
  '[]'::jsonb,
  'Biết phân biệt pháp lý của từng loại sản phẩm trong dự án (căn hộ, biệt thự, shophouse, condotel). Tránh câu trả lời chung chung khiến khách tiếp tục giả định sai.',
  ARRAY['condotel', 'so_do', 'loai_san_pham'],
  ARRAY['condotel', 'sổ đỏ', 'pháp lý sản phẩm', 'không có sổ'],
  ARRAY['bds_pro'],
  ARRAY['a_14', 'a_16'],
  'Condotel không sổ đỏ pháp lý sản phẩm căn hộ biệt thự shophouse'),

-- TH 19: "Chờ giá xuống thêm"
('a_19', 'TL01', 'A', 'Telesales và Tiếp cận', 'Chờ giá xuống thêm',
  'Tôi chờ giá xuống thêm rồi mua',
  ARRAY['REFLECT'], ARRAY[2],
  'Khách đang kỳ vọng giá sẽ điều chỉnh. Tâm lý phổ biến nhưng thường không có cơ sở cụ thể với dự án đang trong giai đoạn đầu của chu kỳ. Lỗi phổ biến: tranh luận về dự báo giá — không ai thắng, tư vấn viên mất thế.',
  '{
    "surface": "Tôi chờ giá xuống thêm rồi mới mua.",
    "middle": "Tôi có kỳ vọng giá sẽ giảm, nhưng không có cơ sở cụ thể hay mốc thời gian. Đây là phản xạ \"mua rẻ nhất có thể\" chứ không phải chiến lược.",
    "root": "Sợ mua đúng đỉnh. Cần hiểu được logic cung-cầu: với dự án đã khởi công và đang ở giai đoạn 1, liệu có cơ chế nào khiến CĐT hạ giá? Nếu không, \"chờ\" thực ra là chi phí cơ hội."
  }'::jsonb,
  '{
    "reflect": "KHÔNG tranh luận về dự báo giá. Hỏi để khách tự làm rõ kỳ vọng cụ thể.",
    "diq": "Khi khách phải trả lời cụ thể (%, thời gian, cơ sở), họ thường tự nhận ra kỳ vọng không có cơ sở. Không áp đặt — để khách tự đánh giá."
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "Tôi chờ giá xuống thêm rồi mua."},
    {"speaker": "sales", "content": "Dạ, anh đang kỳ vọng giá sẽ xuống bao nhiêu phần trăm và trong khoảng thời gian bao lâu ạ?"},
    {"speaker": "note", "content": "Chờ."},
    {"speaker": "sales", "content": "Dạ, anh có cơ sở nào để dự đoán điều đó không ạ, ví dụ chính sách nào sẽ khiến chủ đầu tư hạ giá giai đoạn 1 của dự án đã khởi công rồi?"},
    {"speaker": "note", "content": "Chờ. Để khách tự nhận ra mình đang chờ một điều không có cơ sở."}
  ]'::jsonb,
  '[]'::jsonb,
  'Kiên nhẫn dùng câu hỏi thay vì lập luận. Biết chấp nhận nếu khách vẫn muốn chờ — ghi chú và gọi lại khi có thông tin mới về đợt mở bán.',
  ARRAY['cho_gia_xuong', 'ky_vong_gia', 'chi_phi_co_hoi'],
  ARRAY['chờ giá xuống', 'giá giảm', 'mua rẻ hơn'],
  ARRAY['bds_pro'],
  ARRAY['a_11', 'a_10'],
  'Chờ giá xuống thêm kỳ vọng dự báo cơ sở giai đoạn 1 chi phí cơ hội'),

-- TH 20: "Đã có nhà ở Hạ Long rồi"
('a_20', 'TL01', 'A', 'Telesales và Tiếp cận', 'Đã có nhà ở khu vực rồi',
  'Tôi đã có nhà ở {{project.area}} rồi, không cần nữa',
  ARRAY['REFLECT', 'DIQ'], ARRAY[2, 3],
  'Khách nghĩ mình không cần thêm BĐS ở khu vực. Chưa nhìn dự án này theo góc đầu tư hoặc chưa hình dung được giá trị khác biệt. Lỗi phổ biến: thuyết phục mua thêm nhà — không phù hợp với nhu cầu của khách.',
  '{
    "surface": "Tôi đã có nhà ở {{project.area}} rồi, không cần thêm nhà nữa.",
    "middle": "Tôi đang nhìn BĐS theo góc \"nhu cầu nhà ở\" — đã có 1 nhà là đủ. Không phân biệt được mua để ở và đầu tư.",
    "root": "Nếu có cơ hội đầu tư với tệp khách và tiềm năng khác với nhà hiện tại, tôi có thể xem xét. Nhưng phải được chứng minh cụ thể — không phải chỉ \"mua thêm một nhà nữa\"."
  }'::jsonb,
  '{
    "reflect": "KHÔNG thuyết phục mua thêm nhà. Hỏi để chuyển góc nhìn từ nhu cầu nhà ở sang cơ hội đầu tư.",
    "diq": "Hỏi về vị trí nhà hiện tại và tệp khách thuê/mua lại. So sánh với dự án mới: cùng địa lý nhưng khác phân khúc, khác tệp khách, khác tiềm năng."
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "Tôi đã có nhà ở {{project.area}} rồi, không cần nữa."},
    {"speaker": "sales", "content": "Dạ, nhà anh đang ở khu vực nào của {{project.area}} ạ?"},
    {"speaker": "note", "content": "Chờ."},
    {"speaker": "sales", "content": "Dạ, anh thấy khu vực anh đang ở và {{project.name}} có cùng tệp khách thuê và cùng tiềm năng tăng giá không ạ? Em hỏi vì nhiều khách có nhà ở {{project.area}} rồi vẫn đầu tư vào đây, nhưng với mục đích khác hoàn toàn."}
  ]'::jsonb,
  '[]'::jsonb,
  'Chuyển khung khách hàng từ "nhu cầu nhà ở" sang "cơ hội đầu tư". Biết dùng câu hỏi về vị trí hiện tại để so sánh tiềm năng thay vì đưa ra lập luận chung.',
  ARRAY['da_co_nha', 'mua_de_o_vs_dau_tu', 'phan_khuc'],
  ARRAY['đã có nhà', 'không cần thêm', 'đã mua rồi'],
  ARRAY['bds_pro'],
  ARRAY['a_17', 'a_12'],
  'Đã có nhà không cần thêm mua để ở đầu tư tệp khách tiềm năng');
