-- ============================================================
-- TL02: Phần B — Gặp trực tiếp và Tham quan (TH 13-32) — 20 tình huống
-- ID prefix: b_ (section B) — tránh conflict với TL03 (section C dùng th_)
-- Universalized với placeholders từ project pack
-- ============================================================

-- ──────────────────────────────────────────────────────────
-- NHÓM 1: TRƯỚC BUỔI GẶP
-- ──────────────────────────────────────────────────────────

INSERT INTO public.scenarios (id, doc_ref, section_code, section_title, title, objection_verbatim,
  methodology_tools, active_stages, analysis, customer_psychology, approach, script, warnings,
  skills_required, tags, keywords, tier_access, related_ids, search_content)
VALUES

-- TH 13: Khách xác nhận lịch hẹn nhưng hôm sau im lặng
('b_013', 'TL02', 'B', 'Gặp trực tiếp và Tham quan', 'Khách xác nhận lịch hẹn nhưng hôm sau im lặng',
  'Xác nhận lịch hẹn tối qua nhưng hôm sau không phản hồi',
  ARRAY['3_TOUCH', 'REFLECT'], ARRAY[1, 2],
  'Đây là tình huống xảy ra hàng ngày nhưng ít được xử lý đúng. Khách đồng ý lịch hẹn ở cuối cuộc gọi, có thể vì lúc đó thật sự có ý định, có thể vì muốn kết thúc cuộc gọi. Sang hôm sau họ im lặng. Một số tư vấn viên gọi dồn hai ba cuộc liên tiếp — đây là lỗi nghiêm trọng nhất, biến tư vấn viên từ người có giá trị thành người đang đuổi theo khách. Lỗi phổ biến thứ hai: hỏi "anh có đi không ạ?" Câu đó đặt khách vào thế phải từ chối thẳng, và phần lớn khách sẽ chọn tiếp tục im lặng hơn là trả lời.',
  '{
    "surface": "Bận, quên, hoặc chưa tiện trả lời.",
    "middle": "Chưa đủ lý do để đi. Lịch hẹn được đặt trong trạng thái bị dẫn dắt bởi cuộc gọi, khi cuộc gọi kết thúc thì động lực cũng nhạt dần. Không phải họ không muốn đi, họ không thấy việc đi hôm đó quan trọng đủ để sắp xếp.",
    "root": "Buổi gặp chưa được gắn với bài toán tài chính hay mục tiêu cụ thể của họ, nên không đủ sức kéo."
  }'::jsonb,
  '{
    "reflect": "Không nhắc lịch hẹn. Không hỏi khách có đi không. Tạo lý do mới để liên lạc bằng một thông tin cụ thể của dự án, một cập nhật thật, hoặc một câu hỏi ngắn gọn liên quan đến điều khách đã chia sẻ trong cuộc gọi trước.",
    "diq": "Mục tiêu không phải giữ lịch cũ, mà là mở lại cuộc trò chuyện và đặt lịch mới có chất lượng hơn."
  }'::jsonb,
  '[
    {"speaker": "note", "content": "Bối cảnh: khách đã hẹn tham quan thứ Bảy. Hôm nay thứ Sáu, tin nhắn xác nhận tối qua chưa được đọc."},
    {"speaker": "note", "content": "Bước 1 — Tin nhắn sáng thứ Sáu, KHÔNG nhắc lịch"},
    {"speaker": "sales", "content": "Anh ơi, tối qua em có xem lại thông tin {{project.phase1_name}} {{project.name}}, thấy có điểm về chính sách {{financing.current_policy}} vừa được CĐT xác nhận rõ hơn. Anh đang hình dung theo hướng vay một phần hay vốn tự có ạ? Em hỏi để chuẩn bị đúng bài toán cho anh xem."},
    {"speaker": "note", "content": "Chờ. Không gửi thêm tin nào trong ít nhất 3 giờ."},
    {"speaker": "note", "content": "Bước 2 — Nếu khách trả lời"},
    {"speaker": "khach", "content": "Ừ, anh đang tính dùng một phần vay."},
    {"speaker": "sales", "content": "Dạ vậy em chuẩn bị phương án vay 50-70% cho anh xem thử. Anh vẫn thuận lịch ngày mai không ạ, hay mình dời sang đầu tuần cho anh thoải mái hơn?"},
    {"speaker": "note", "content": "Không hỏi anh có đi không — hỏi chọn một trong hai khung thời gian."},
    {"speaker": "note", "content": "Bước 3 — Nếu khách không trả lời đến 3 giờ chiều"},
    {"speaker": "sales", "content": "Anh ơi, em gọi không tiện. Anh nhắn em một chữ là sáng hay chiều ngày mai thuận hơn, em sắp xếp cho anh."},
    {"speaker": "note", "content": "Gọi MỘT lần. Nếu không nghe máy, để lại tin nhắn này. KHÔNG gọi lần hai trong ngày."},
    {"speaker": "note", "content": "Bước 4 — Nếu vẫn im lặng đến tối thứ Sáu"},
    {"speaker": "sales", "content": "Anh Minh, em hiểu anh bận. Mình dời lịch sang tuần sau cho thoải mái, anh thấy thứ Ba hay thứ Tư phù hợp hơn ạ?"},
    {"speaker": "note", "content": "Nếu vẫn không trả lời, dừng liên lạc 3 ngày rồi mở lại bằng thông tin mới thật sự."}
  ]'::jsonb,
  '[{"type": "never", "content": "KHÔNG gọi dồn 2-3 cuộc liên tiếp. KHÔNG hỏi \"anh có đi không ạ?\" — đặt khách vào thế phải từ chối thẳng."}]'::jsonb,
  'Phân biệt được "khách bận thật" và "khách đang tránh" từ pattern phản hồi. Khách bận thật thường trả lời ngắn dù muộn. Khách đang tránh thì im lặng nhất quán. Mỗi lần liên lạc phải mang thông tin mới hoặc câu hỏi có giá trị với khách.',
  ARRAY['lich_hen', 'im_lang', 'follow_up', 'tin_nhan'],
  ARRAY['xác nhận lịch', 'im lặng', 'không phản hồi', 'follow up', 'nhắc lịch'],
  ARRAY['bds_pro'],
  ARRAY['b_014', 'b_015'],
  'Khách xác nhận lịch hẹn im lặng không phản hồi follow up nhắc lịch tin nhắn'),

-- TH 14: Khách yêu cầu gửi toàn bộ thông tin trước khi đến
('b_014', 'TL02', 'B', 'Gặp trực tiếp và Tham quan', 'Khách yêu cầu gửi toàn bộ thông tin trước khi đến',
  'Em gửi cho anh đầy đủ thông tin đi, anh xem qua rồi tính',
  ARRAY['REFLECT'], ARRAY[2],
  'Yêu cầu này có hai ý nghĩa tùy khách. Với một số người, đây là phong cách làm việc thật sự: họ muốn nghiên cứu trước khi gặp. Với phần lớn còn lại, đây là cách hoãn buổi gặp một cách lịch sự. Nếu tư vấn viên gửi hết toàn bộ thông tin, khách sẽ tự đánh giá sai bối cảnh vì thiếu người hướng dẫn đọc đúng góc độ, hoặc bị quá tải và không muốn đến. Lỗi phổ biến nhất: gửi catalog đầy đủ, bảng giá, rồi ngồi chờ khách đọc xong và phản hồi.',
  '{
    "surface": "Muốn chuẩn bị trước để buổi gặp có chất lượng hơn.",
    "middle": "Chưa tin đủ để dành thời gian đi mà không biết trước mình sẽ thấy gì. Cần một lý do cụ thể hơn để di chuyển.",
    "root": "Chưa thấy buổi gặp trực tiếp sẽ mang lại gì hơn việc tự đọc tài liệu tại nhà."
  }'::jsonb,
  '{
    "reflect": "Gửi thông tin chọn lọc, không gửi hết. Gửi đúng phần tạo ra câu hỏi muốn được giải đáp, không phải phần có thể tự đọc và tự kết luận.",
    "diq": "Mục tiêu của thông tin gửi trước là tạo kỳ vọng, không phải thỏa mãn tò mò."
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "Em gửi cho anh đầy đủ thông tin đi, anh xem qua rồi tính."},
    {"speaker": "sales", "content": "Dạ được anh. Em gửi phần tóm tắt {{project.phase1_name}} và bài toán tài chính cơ bản cho anh xem qua. Nhưng có một phần em không thể gửi qua file được, đó là tỷ lệ thực của từng vị trí và cảm giác khi đứng trên sa bàn nhìn ra {{project.landmark}}. Anh đến sẽ thấy ngay tại sao cùng phân khu mà giá chênh nhau, câu đó nhìn trên giấy không ra. Em gửi thông tin ngay cho anh nhé."},
    {"speaker": "note", "content": "Gửi tóm tắt 1 trang và bảng tài chính cơ bản. KHÔNG gửi toàn bộ catalog."},
    {"speaker": "sales", "content": "Dạ em gửi xong rồi anh. Anh xem qua tối nay, phần nào chưa rõ thì ngày mai ra sa bàn em giải thích trực tiếp luôn. Anh thuận sáng hay chiều ạ?"},
    {"speaker": "note", "content": "Chờ khách chọn. Không đợi khách chủ động liên lạc lại."},
    {"speaker": "note", "content": "Nếu khách hỏi thêm qua tin nhắn sau khi đọc"},
    {"speaker": "sales", "content": "Dạ câu hỏi đó hay đấy anh. Em trả lời được một phần qua đây, nhưng phần quan trọng hơn là so sánh vị trí thực tế giữa các sản phẩm trong phân khu — anh cần thấy tận nơi mới cảm nhận được. Mình gặp sẽ rõ hơn nhiều. Anh vẫn thuận lịch như hẹn không ạ?"}
  ]'::jsonb,
  '[]'::jsonb,
  'Biết chính xác thông tin nào nên gửi trước và thông tin nào phải giữ lại để trình bày trực tiếp. Nên gửi: tóm tắt phân khu, bảng tài chính cơ bản, vị trí tổng quan. Phải giữ lại: so sánh vị trí sản phẩm cụ thể, view từ từng hướng, bài toán tài chính cá nhân hóa. Nguyên tắc: gửi đủ để khách tò mò, không đủ để khách tự kết luận mà không cần đến.',
  ARRAY['gui_thong_tin', 'hoan_buoi_gap', 'catalog'],
  ARRAY['gửi thông tin', 'tài liệu', 'catalog', 'xem qua', 'nghiên cứu'],
  ARRAY['bds_pro'],
  ARRAY['b_013', 'b_015'],
  'Gửi thông tin trước catalog tài liệu nghiên cứu tóm tắt bài toán tài chính sa bàn'),

-- TH 15: Khách yêu cầu đổi địa điểm sang quán cà phê
('b_015', 'TL02', 'B', 'Gặp trực tiếp và Tham quan', 'Khách yêu cầu đổi địa điểm sang quán cà phê',
  'Mình gặp ở quán cà phê được không, anh tiện hơn',
  ARRAY['3_TOUCH'], ARRAY[1, 4],
  'Khách chưa sẵn sàng cam kết thời gian và công sức đến tận dự án. Điều này thường xảy ra khi khách ở giai đoạn tìm hiểu sơ bộ, chưa đủ quan tâm để di chuyển. Nếu đồng ý gặp ở quán cà phê, tư vấn viên mất toàn bộ lợi thế của môi trường dự án: không có sa bàn, không có mô hình, không có cảm giác thực tế. Buổi gặp ở quán cà phê sẽ biến thành buổi thuyết trình trên laptop.',
  '{
    "surface": "Tiện hơn, đỡ mất thời gian di chuyển.",
    "middle": "Chưa đủ tin tưởng để đầu tư thời gian và công sức đi xa chỉ để xem dự án.",
    "root": "Chưa thấy giá trị cụ thể của việc đến tận nơi so với gặp ở nơi thuận tiện."
  }'::jsonb,
  '{
    "reflect": "Không từ chối thẳng yêu cầu của khách. Đề xuất một buổi gặp ngắn ở nơi thuận tiện để trao đổi bài toán tài chính và trả lời câu hỏi cụ thể, sau đó đặt lịch dự án riêng cho lần tiếp theo.",
    "diq": "Biến buổi cà phê thành bước đệm để hiểu khách, không phải điểm đến cuối."
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "Mình gặp ở quán cà phê được không, anh tiện hơn."},
    {"speaker": "sales", "content": "Dạ được anh. Mình gặp ở quán trước để em hiểu rõ hơn bài toán của anh, em cần biết anh đang hướng đến mục tiêu gì thì mới chuẩn bị đúng thứ cho anh xem tại dự án. Anh đang ở khu vực nào để em tìm quán gần anh ạ?"},
    {"speaker": "note", "content": "Chờ. KHÔNG cố thuyết phục khách đi thẳng đến dự án."},
    {"speaker": "note", "content": "Tại buổi cà phê"},
    {"speaker": "sales", "content": "Dạ, cảm ơn anh đã dành thời gian. Em muốn hiểu trước: anh đang quan tâm đến {{project.name}} theo hướng đầu tư hay để ở, hay cả hai ạ?"},
    {"speaker": "note", "content": "Khai thác bài toán cá nhân của khách trong 20-30 phút"},
    {"speaker": "sales", "content": "Dạ, với những gì anh vừa chia sẻ, em nghĩ buổi ra sa bàn sẽ rất có ý nghĩa. Không phải vì dự án to, mà vì anh cần thấy tận mắt tại sao vị trí sản phẩm anh đang để ý lại có mức giá đó — những thứ đó nhìn trên màn hình không cảm nhận được. Em book xe đưa đón anh, đi về trong ngày. Cuối tuần này anh có sắp xếp được không ạ?"},
    {"speaker": "note", "content": "Chờ. Cuối buổi cà phê phải đặt được lịch dự án cụ thể."}
  ]'::jsonb,
  '[]'::jsonb,
  'Buổi gặp ở quán cà phê không phải thất bại nếu dùng đúng mục đích: khai thác bài toán cá nhân và đặt lịch dự án tiếp theo. Sai lầm là cố trình bày toàn bộ dự án qua laptop ở quán và hy vọng khách đủ ấn tượng. Buổi cà phê tốt nhất là buổi tư vấn viên nói ít hơn khách, và kết thúc bằng một lịch hẹn dự án được xác nhận.',
  ARRAY['dia_diem_gap', 'quan_ca_phe', 'khai_thac_bai_toan'],
  ARRAY['cà phê', 'đổi địa điểm', 'không đến dự án', 'gặp gần nhà'],
  ARRAY['bds_pro'],
  ARRAY['b_014', 'b_016'],
  'Quán cà phê đổi địa điểm không đến dự án gặp gần nhà khai thác bài toán cá nhân lịch hẹn'),

-- TH 16: Khách báo sẽ có chuyên gia đi cùng
('b_016', 'TL02', 'B', 'Gặp trực tiếp và Tham quan', 'Khách báo sẽ có chuyên gia đi cùng để đánh giá dự án',
  'Anh sẽ đưa một người bạn đi cùng, anh ấy có kinh nghiệm đầu tư BĐS',
  ARRAY['3_TOUCH'], ARRAY[1],
  'Đây là tín hiệu quan tâm thật sự, không phải từ chối. Khách đang cân nhắc nghiêm túc đến mức muốn có người kiểm tra thông tin. Với dự án quy mô lớn và nhiều thông tin phức tạp, chuyên gia đi cùng thường sẽ hỏi những câu rất cụ thể về pháp lý, tiến độ, quy hoạch. Lỗi phổ biến: tư vấn viên không hỏi trước và đến buổi gặp bị bất ngờ bởi loại câu hỏi chuyên gia đó đặt ra.',
  '{
    "surface": "Muốn có góc nhìn khách quan từ người không có lợi ích trong thương vụ.",
    "middle": "Không đủ tự tin vào khả năng tự đánh giá của mình, cần người khác xác nhận quyết định.",
    "root": "Sợ mắc sai lầm lớn khi mua một tài sản giá trị cao, cần thêm điểm neo an toàn."
  }'::jsonb,
  '{
    "reflect": "Hoan nghênh việc đưa chuyên gia, không phòng thủ. Hỏi để biết chuyên gia đó quan tâm đến khía cạnh nào của dự án để chuẩn bị đúng nội dung.",
    "diq": "Chuẩn bị sẵn tài liệu pháp lý gốc thay vì lập luận để phản bác. Chuyên gia giỏi sẽ hỏi câu hỏi thật, nếu trả lời thật thì họ trở thành người thúc đẩy quyết định."
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "Anh sẽ đưa một người bạn đi cùng, anh ấy có kinh nghiệm đầu tư BĐS, để hỏi một số câu chuyên môn."},
    {"speaker": "sales", "content": "Dạ tốt quá anh. Anh ấy thường quan tâm đến góc độ nào ạ, pháp lý, tiến độ hạ tầng, hay bài toán tài chính của {{project.phase1_name}}? Em hỏi để chuẩn bị đúng tài liệu và nếu cần em có thể mời thêm chuyên gia pháp lý bên em cùng tham gia."},
    {"speaker": "note", "content": "Chờ. Câu trả lời cho biết khách đang lo ngại điều gì nhất."},
    {"speaker": "khach", "content": "Anh ấy hay hỏi về pháp lý và tiến độ thực tế."},
    {"speaker": "sales", "content": "Dạ, vậy em chuẩn bị sẵn bộ văn bản pháp lý gồm {{legal.approval_doc}}, hồ sơ GPMB đã đạt {{project.gpmb_percent}}, biên bản khởi công {{project.construction_start_date}}, và tiến độ {{project.phase1_name}} hiện tại cho anh và anh ấy xem trực tiếp. Có tài liệu nguồn gốc rõ ràng thì đánh giá mới chính xác được. Anh và anh ấy tên gì để em chuẩn bị đặt tên trên tài liệu ạ?"},
    {"speaker": "note", "content": "Hỏi tên để cá nhân hóa tài liệu, tạo cảm giác chuyên nghiệp."},
    {"speaker": "note", "content": "Lưu ý khi buổi gặp có chuyên gia"},
    {"speaker": "sales", "content": "Dạ, rất vui được gặp anh. Anh Minh có nói anh hay xem góc độ pháp lý, em chuẩn bị sẵn bộ văn bản để anh xem, em giải thích từng phần theo thứ tự thời gian phê duyệt của dự án nhé."},
    {"speaker": "note", "content": "Chào hỏi chuyên gia trước, tỏ ra tôn trọng."}
  ]'::jsonb,
  '[]'::jsonb,
  'Không bao giờ coi chuyên gia là mối đe dọa. Chuyên gia giỏi sẽ hỏi câu hỏi thật và nếu trả lời thật thì chuyên gia sẽ trở thành người thúc đẩy quyết định thay vì cản trở. Chuẩn bị đúng tài liệu pháp lý gốc quan trọng hơn là chuẩn bị lập luận để phản bác.',
  ARRAY['chuyen_gia', 'phap_ly', 'tai_lieu_goc', 'dau_tu_bds'],
  ARRAY['chuyên gia', 'người đi cùng', 'đánh giá', 'pháp lý', 'tiến độ'],
  ARRAY['bds_pro'],
  ARRAY['b_014', 'b_025'],
  'Chuyên gia đi cùng đánh giá pháp lý tiến độ tài liệu gốc GPMB phê duyệt'),

-- TH 17: Khách do dự vì khoảng cách
('b_017', 'TL02', 'B', 'Gặp trực tiếp và Tham quan', 'Khách do dự vì khoảng cách',
  'Hạ Long xa quá, mất cả ngày. Anh chưa biết có sắp xếp được không',
  ARRAY['REFLECT', 'DIQ'], ARRAY[2, 3],
  'Đây là tình huống cần được xử lý bằng thông tin, không phải bằng thuyết phục cảm xúc. Khoảng cách địa lý không đổi, nhưng khoảng cách thời gian đã thay đổi hoàn toàn khi có hạ tầng mới đang xây. Lỗi phổ biến nhất: tư vấn viên giải thích bằng hạ tầng hiện tại mà không đề cập đến hạ tầng mới, khiến khách vẫn nghĩ đến khoảng cách cũ.',
  '{
    "surface": "Xa, mệt, mất cả ngày.",
    "middle": "Chưa đủ quan tâm để đầu tư thời gian và công sức cho một chuyến đi mà không chắc kết quả.",
    "root": "Đang tính chi phí cơ hội của một ngày cuối tuần. Khách cần thấy rõ giá trị họ nhận được."
  }'::jsonb,
  '{
    "reflect": "Thay đổi khung tham chiếu của khách từ khoảng cách địa lý sang khoảng cách thời gian. REFLECT để khách tự nhìn lại tiền đề \"xa\".",
    "diq": "Dữ liệu (hạ tầng mới đang xây, thời gian di chuyển rút ngắn), Insight (đây là yếu tố định giá trong tương lai — mua khi hạ tầng đang xây và mua sau khi hoàn thiện là hai mức giá khác nhau), Câu hỏi (để khách tự quyết định mình muốn ở phía nào của mốc đó)."
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "{{project.area}} xa quá, mất cả ngày. Anh chưa biết có sắp xếp được không."},
    {"speaker": "sales", "content": "Dạ em hiểu anh. Anh đang hình dung khoảng cách theo {{infrastructure.current_access}} bây giờ. Anh thấy mức đó với một chuyến tham quan cuối tuần là nhiều ạ?"},
    {"speaker": "note", "content": "Chờ. KHÔNG giải thích gì về hạ tầng mới chưa."},
    {"speaker": "khach", "content": "Ừ, mất cả ngày đi về."},
    {"speaker": "sales", "content": "Dạ, có một thông tin mà anh có thể chưa để ý: {{infrastructure.new_project}}. Khi hoàn thành, thời gian di chuyển chỉ còn {{infrastructure.new_travel_time}}."},
    {"speaker": "note", "content": "Dừng. Để con số thời gian ngấm."},
    {"speaker": "sales", "content": "Anh biết điều đó có ý nghĩa gì với bài toán đầu tư của mình không ạ?"},
    {"speaker": "note", "content": "Chờ. Câu hỏi khai mở, không áp đặt câu trả lời."},
    {"speaker": "khach", "content": "Thì giá sẽ tăng khi hạ tầng hoàn thiện."},
    {"speaker": "sales", "content": "Dạ đúng. Vậy câu hỏi mà anh cần trả lời không phải là có đi xem không, mà là anh muốn mua trước khi hạ tầng hoàn thiện và giá phản ánh điều đó, hay sau khi thị trường đã định giá lại. Với đợt mở bán {{project.launch_date}} tới, đây vẫn là giai đoạn đầu tiên, anh thấy mình đang ở phía nào của mốc đó ạ?"},
    {"speaker": "note", "content": "Chờ."},
    {"speaker": "sales", "content": "Dạ, về chuyến đi hôm nay, em có xe đưa đón, khởi hành 7 giờ sáng, về trước 6 giờ chiều. Anh không phải lo chuyện di chuyển. Cuối tuần này hay đầu tuần sau anh thuận hơn ạ?"}
  ]'::jsonb,
  '[{"type": "warning", "content": "Tư vấn viên KHÔNG được phóng đại mốc thời gian hoàn thành hạ tầng khi chưa có thông tin chính thức. Chỉ nói: đã khởi công, thời gian khi hoàn thành sẽ là X, đây là yếu tố định giá trong tương lai."}]'::jsonb,
  'Thông tin về hạ tầng mới phải được đặt trong bối cảnh đúng: đây là hạ tầng đang xây, không phải đang vận hành. Câu hỏi khách cần trả lời là mua trước hay sau khi hạ tầng đó hoàn thiện.',
  ARRAY['khoang_cach', 'ha_tang', 'dich_vu_dua_don', 'chi_phi_co_hoi'],
  ARRAY['xa', 'khoảng cách', 'mất thời gian', 'đưa đón', 'tàu cao tốc'],
  ARRAY['bds_pro'],
  ARRAY['b_015', 'b_018'],
  'Khoảng cách xa mất thời gian hạ tầng tàu cao tốc đưa đón khung tham chiếu định giá tương lai'),

-- TH 18: Trên xe khách hỏi dồn về giá
('b_018', 'TL02', 'B', 'Gặp trực tiếp và Tham quan', 'Trên xe khách hỏi dồn về giá và chính sách',
  'Em nói anh nghe sơ qua về giá và chính sách thanh toán đi',
  ARRAY['3_TOUCH'], ARRAY[1],
  'Khách đang trong trạng thái hứng khởi và muốn xử lý thông tin trước khi đến. Trên xe là môi trường không có sa bàn, không có tài liệu trực quan, và thông tin không đầy đủ bối cảnh sẽ dễ bị hiểu sai. Với dự án nhiều phân khu và loại sản phẩm, việc nói giá trên xe mà không có sa bàn sẽ tạo ra so sánh sai bối cảnh. Lỗi phổ biến: say sưa trình bày trên xe và đến sa bàn thì khách đã tự kết luận rồi.',
  '{
    "surface": "Muốn biết trước để có thể hỏi đúng câu khi đến nơi.",
    "middle": "Đang đánh giá xem chuyến đi có đáng không, cần thêm thông tin để tự trả lời câu đó.",
    "root": "Lo ngại về tài chính và giá trị của khoản đầu tư, muốn cảm thấy an tâm trước khi đặt chân vào dự án."
  }'::jsonb,
  '{
    "reflect": "Trả lời đủ để khách an tâm tiếp tục di chuyển, không trả lời đủ để khách tự kết luận trước khi đến nơi.",
    "diq": "Giữ lại các chi tiết so sánh vị trí và phân khu để trình bày tại sa bàn. Dùng thời gian trên xe để khai thác thêm bài toán cá nhân của khách."
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "Em nói anh nghe sơ qua về giá và chính sách thanh toán đi, anh muốn biết trước."},
    {"speaker": "sales", "content": "Dạ, em nói nhanh để anh có bức tranh tổng quan. {{project.phase1_name}} đang là phân khu mở bán đầu tiên, quy mô {{project.phase1_size}} với {{project.phase1_units}} sản phẩm. Shophouse diện tích {{project.product_shophouse_size}}, biệt thự từ {{project.product_villa_size}} trở lên. Chính sách CĐT đang dự kiến hỗ trợ lãi suất 0% từ {{financing.rate_free_period}}. Nhưng phần quan trọng hơn là tại sao cùng phân khu mà giá từng vị trí lại khác nhau — phần đó em cần anh nhìn trực tiếp vào sa bàn mới giải thích được. Anh đang hướng đến shophouse hay biệt thự ạ?"},
    {"speaker": "note", "content": "Chuyển sang khai thác bài toán cá nhân thay vì tiếp tục trình bày"},
    {"speaker": "khach", "content": "Anh đang nghĩ đến shophouse để kinh doanh."},
    {"speaker": "sales", "content": "Dạ, anh đang hình dung khai thác theo hướng kinh doanh trực tiếp hay cho thuê mặt bằng ạ?"},
    {"speaker": "note", "content": "Khai thác trong 15-20 phút còn lại trên xe. KHÔNG nói về giá nữa."},
    {"speaker": "note", "content": "Khi đến gần dự án"},
    {"speaker": "sales", "content": "Anh ơi, mình sắp đến rồi. Khi vào sa bàn em giải thích phần giá và vị trí đầy đủ hơn, anh sẽ thấy tại sao shophouse mặt tiền 7m và mặt tiền 5m lại có bài toán khác nhau hoàn toàn. Anh chuẩn bị câu hỏi gì muốn hỏi trực tiếp tại sa bàn không ạ?"}
  ]'::jsonb,
  '[]'::jsonb,
  'Thời gian trên xe là thời gian vàng để khai thác bài toán cá nhân của khách trong môi trường thoải mái và không áp lực. Nhiều khách sẽ chia sẻ thật hơn khi đang ngồi xe so với khi đứng trước sa bàn.',
  ARRAY['tren_xe', 'hoi_gia', 'khai_thac_bai_toan'],
  ARRAY['giá', 'chính sách', 'trên xe', 'thanh toán'],
  ARRAY['bds_pro'],
  ARRAY['b_017', 'b_019'],
  'Trên xe hỏi giá chính sách thanh toán phân khu sản phẩm khai thác bài toán cá nhân'),

-- ──────────────────────────────────────────────────────────
-- NHÓM 3: MỞ ĐẦU BUỔI GẶP — ĐỌC NGƯỜI
-- ──────────────────────────────────────────────────────────

-- TH 19: Khách nói "anh chỉ có 30 phút thôi nhé"
('b_019', 'TL02', 'B', 'Gặp trực tiếp và Tham quan', 'Khách nói "anh chỉ có 30 phút thôi nhé"',
  'Anh chỉ có 30 phút thôi nhé, anh còn việc chiều nay',
  ARRAY['3_TOUCH'], ARRAY[1],
  'Khách đang thiết lập ranh giới thời gian để giữ quyền kiểm soát và bảo vệ mình khỏi cảm giác bị kéo dài. Phần lớn trường hợp, 30 phút đó không phải giới hạn cứng mà là tuyên bố tâm lý: tôi không cam kết sẽ ở lâu. Lỗi phổ biến nhất: tư vấn viên cố nhồi nhét toàn bộ nội dung vào 30 phút, kết quả là không đủ thời gian cho bất cứ thứ gì và khách về mà không có ấn tượng gì rõ ràng.',
  '{
    "surface": "Thật sự có việc và cần về đúng giờ.",
    "middle": "Muốn giữ quyền kiểm soát thời gian, không muốn bị kéo ở lại nếu không thấy giá trị.",
    "root": "Sợ cảm giác bị áp lực phải quyết định khi chưa sẵn sàng."
  }'::jsonb,
  '{
    "reflect": "Đồng ý với 30 phút, không tranh luận. Thiết kế 30 phút đó tập trung vào một hoặc hai điểm quan trọng nhất thay vì cố bao phủ tất cả.",
    "diq": "Chọn hai điểm tạo ra câu hỏi muốn được giải đáp và dừng ở đó. Câu hỏi của khách sau 30 phút là chỉ số tốt nhất."
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "Anh chỉ có 30 phút thôi nhé, anh còn việc chiều nay."},
    {"speaker": "sales", "content": "Dạ không sao anh. 30 phút là đủ để anh thấy được điểm quan trọng nhất mà em muốn anh thấy. Em sẽ không cố nói hết mọi thứ. Anh vào sa bàn trước, em giải thích đúng phần liên quan đến bài toán của anh thôi."},
    {"speaker": "note", "content": "KHÔNG xin thêm thời gian. Dẫn vào sa bàn ngay."},
    {"speaker": "note", "content": "Tại sa bàn: chọn 1-2 điểm, KHÔNG trình bày toàn bộ"},
    {"speaker": "sales", "content": "Anh ơi, với 30 phút em muốn anh thấy hai thứ. Một là tổng thể {{project.zones_count}} phân khu và lý do {{project.phase1_name}} được chọn là giai đoạn 1. Hai là so sánh cụ thể giữa ba vị trí sản phẩm phù hợp với mục tiêu anh đã chia sẻ. Hai thứ đó đủ để anh quyết định có muốn tìm hiểu tiếp không. Anh thấy thứ tự đó ổn không ạ?"},
    {"speaker": "note", "content": "Sau 25 phút"},
    {"speaker": "sales", "content": "Dạ, anh ơi sắp đủ 30 phút rồi. Anh thấy hai điểm em vừa trình bày như thế nào ạ, có điểm nào anh muốn rõ hơn trước khi về không?"},
    {"speaker": "note", "content": "Nếu khách hỏi tiếp tức là muốn ở lại. KHÔNG đề nghị thêm thời gian, chờ khách tự quyết."}
  ]'::jsonb,
  '[]'::jsonb,
  'Chất lượng 30 phút quan trọng hơn số lượng thứ được trình bày. Tư vấn viên thiếu kinh nghiệm thường cố trình bày nhiều vì sợ bỏ sót. Tư vấn viên có kinh nghiệm biết chọn hai điểm tạo ra câu hỏi muốn được giải đáp và dừng ở đó.',
  ARRAY['gioi_han_thoi_gian', '30_phut', 'tap_trung'],
  ARRAY['30 phút', 'thời gian', 'vội', 'có việc'],
  ARRAY['bds_pro'],
  ARRAY['b_020', 'b_023'],
  'Thời gian ngắn 30 phút có việc tập trung điểm quan trọng sa bàn'),

-- TH 20: Khách nói "anh biết hết rồi, khỏi giới thiệu"
('b_020', 'TL02', 'B', 'Gặp trực tiếp và Tham quan', 'Khách nói "anh biết hết rồi, khỏi giới thiệu" khi vào sa bàn',
  'Thôi em khỏi giới thiệu, anh biết hết rồi. Cứ chỉ anh nhìn thôi',
  ARRAY['REFLECT'], ARRAY[2],
  'Khách đã đọc thông tin trước, đã nói chuyện với tư vấn viên khác, hoặc đang cố bỏ qua phần giới thiệu chung để vào thẳng phần họ thật sự muốn biết. Đây thường là dấu hiệu tốt. "Biết hết rồi" thường là "đã đọc qua" chứ không phải đã hiểu sâu. Lỗi phổ biến nhất: tư vấn viên vẫn bắt đầu từ đầu theo kịch bản có sẵn vì không biết làm gì khác.',
  '{
    "surface": "Đã có thông tin rồi, không cần nghe lại.",
    "middle": "Không muốn lãng phí thời gian với những điều đã biết, muốn đi thẳng vào câu hỏi thật.",
    "root": "Có một câu hỏi cụ thể hoặc một lo ngại cụ thể nhưng chưa nói ra, đang chờ tư vấn viên hỏi đúng câu."
  }'::jsonb,
  '{
    "reflect": "KHÔNG bắt đầu từ đầu theo kịch bản. Hỏi ngay câu hỏi mở về điều khách muốn biết thêm. Dùng những gì khách đã biết làm nền tảng, không phải làm điểm xuất phát để trình bày lại.",
    "diq": "Tìm ra câu hỏi thật đó và trả lời nó trực tiếp."
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "Thôi em khỏi giới thiệu, anh biết hết rồi. Cứ chỉ anh nhìn thôi."},
    {"speaker": "sales", "content": "Dạ vậy anh nhìn thoải mái. Có một điều em muốn hỏi anh: trong những gì anh đã đọc về dự án, điều anh chưa thấy thuyết phục nhất là gì ạ?"},
    {"speaker": "note", "content": "Chờ. Câu trả lời cho biết khách đang lo ngại điều gì thật sự."},
    {"speaker": "note", "content": "Nếu khách trả lời về vị trí sản phẩm"},
    {"speaker": "khach", "content": "Anh chưa rõ tại sao giá chênh nhiều vậy giữa các shophouse cùng phân khu."},
    {"speaker": "sales", "content": "Dạ, câu đó em giải thích được qua sa bàn này. Anh nhìn vào đây, hai shophouse này cùng phân khu, cùng diện tích, nhưng một cái mặt tiền 7m hướng đại lộ thương mại chính, một cái 5m hướng vào trong. Lưu lượng khách qua hai điểm đó chênh nhau rất lớn..."},
    {"speaker": "note", "content": "Giải thích trực tiếp vào câu hỏi thật của khách."},
    {"speaker": "note", "content": "Nếu khách im lặng không trả lời"},
    {"speaker": "sales", "content": "Dạ, hoặc anh cứ xem trước đi, em đứng gần đây thôi. Anh có câu gì thì hỏi em."},
    {"speaker": "note", "content": "Lùi lại, cho khách tự quan sát. KHÔNG nói cho đến khi khách hỏi."}
  ]'::jsonb,
  '[]'::jsonb,
  'Khách biết hết rồi không có nghĩa là không có câu hỏi. Nghĩa là họ không muốn nghe thông tin chung, họ muốn có câu trả lời cụ thể cho điều họ chưa hiểu rõ. Buổi gặp với khách đã biết nhiều thường ngắn hơn nhưng chất lượng quyết định cao hơn.',
  ARRAY['biet_het_roi', 'cau_hoi_that', 'tin_hieu_tich_cuc'],
  ARRAY['biết hết rồi', 'khỏi giới thiệu', 'đã đọc', 'nghiên cứu trước'],
  ARRAY['bds_pro'],
  ARRAY['b_019', 'b_026'],
  'Khách biết hết rồi khỏi giới thiệu đã đọc nghiên cứu câu hỏi thật cụ thể'),

-- TH 21: Khách tiết lộ vừa đi xem dự án đối thủ
('b_021', 'TL02', 'B', 'Gặp trực tiếp và Tham quan', 'Khách tiết lộ vừa đi xem dự án đối thủ hôm qua',
  'Hôm qua anh vừa đi xem một dự án bên cạnh, họ cũng nói nhiều điểm hay lắm',
  ARRAY['REFLECT', 'DIQ'], ARRAY[2, 3],
  'Khách đang trong quá trình so sánh tích cực, có nghĩa là họ đang tiến gần đến quyết định. Đây là cơ hội, không phải mối đe dọa. Lỗi phổ biến: cố tìm điểm yếu của đối thủ để công kích, điều đó cho thấy thiếu tự tin.',
  '{
    "surface": "Đang so sánh công khai để thấy sự khác biệt.",
    "middle": "Chưa quyết định được vì chưa tìm ra tiêu chí nào là quan trọng nhất với mình.",
    "root": "Muốn ai đó giúp họ quyết định đúng theo bài toán riêng của họ, không phải theo lập luận của người bán."
  }'::jsonb,
  '{
    "reflect": "KHÔNG nói xấu đối thủ. REFLECT để khách tự xác định tiêu chí so sánh của mình.",
    "diq": "Dữ liệu (lưu lượng khách, dân cư, hệ sinh thái tạo traffic), Insight (thanh khoản và yield của BĐS phụ thuộc lưu lượng người thực tế, không phải vị trí trên bản đồ), Câu hỏi (để khách tự so sánh bài toán traffic hai nơi)."
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "Hôm qua anh vừa đi xem một dự án bên {{competitor.location}}, họ cũng nói nhiều điểm hay lắm."},
    {"speaker": "sales", "content": "Dạ, anh thấy điểm nào bên đó ấn tượng nhất ạ?"},
    {"speaker": "note", "content": "Chờ."},
    {"speaker": "khach", "content": "Họ có giá mềm hơn và môi trường yên tĩnh hơn."},
    {"speaker": "sales", "content": "Dạ, với mục tiêu đầu tư của anh thì giá vào hay yield dài hạn quan trọng hơn ạ?"},
    {"speaker": "note", "content": "Chờ."},
    {"speaker": "khach", "content": "Cả hai, nhưng yield là chính, anh muốn có dòng tiền."},
    {"speaker": "sales", "content": "Dạ, với mục tiêu dòng tiền thì có một điểm mà anh có thể chưa nghĩ tới: yield của BĐS phụ thuộc vào lưu lượng người thực tế tại khu vực đó, không phải chỉ vị trí trên bản đồ. {{area.tourism_stats}} Riêng {{project.name}} sẽ có {{project.population}}, cộng {{area.entertainment}} — tức là lưu lượng người không phụ thuộc vào mùa vụ, quanh năm."},
    {"speaker": "sales", "content": "Anh thấy với dự án bên {{competitor.location}}, nguồn traffic đó đến từ đâu ạ?"},
    {"speaker": "note", "content": "Chờ. Để khách tự so sánh, KHÔNG tự trả lời thay khách."},
    {"speaker": "sales", "content": "Dạ, đó chính xác là điều em muốn anh cân nhắc. Giá vào thấp hơn nhưng yield phụ thuộc vào traffic, và traffic phụ thuộc vào hệ sinh thái xung quanh. Anh muốn em tính thử bài toán dòng tiền cụ thể theo loại sản phẩm anh đang để ý không ạ?"}
  ]'::jsonb,
  '[{"type": "never", "content": "KHÔNG nói xấu đối thủ. Cố tìm điểm yếu của đối thủ để công kích cho thấy thiếu tự tin."}]'::jsonb,
  'Khi khách đang so sánh, nhiệm vụ là giúp khách làm rõ tiêu chí quan trọng nhất với bài toán của họ. Nếu làm tốt bước này, khách sẽ tự đánh giá và tự kết luận. Kết luận do khách tự rút ra thì bền vững hơn.',
  ARRAY['canh_tranh', 'doi_thu', 'so_sanh', 'yield', 'traffic'],
  ARRAY['đối thủ', 'dự án khác', 'so sánh', 'rẻ hơn', 'yield'],
  ARRAY['bds_pro'],
  ARRAY['b_020', 'b_026'],
  'Đối thủ dự án khác so sánh yield traffic lưu lượng khách hệ sinh thái dòng tiền'),

-- TH 22: Khách đến cùng người không phải người quyết định chính
('b_022', 'TL02', 'B', 'Gặp trực tiếp và Tham quan', 'Khách đến cùng người không phải người quyết định chính',
  'Đây là em gái anh, anh đưa đi cùng cho có người',
  ARRAY['3_TOUCH'], ARRAY[1, 4],
  'Khách mang theo người thân hoặc bạn bè không phải vì người đó sẽ đồng quyết định, mà thường để có thêm góc nhìn hoặc để cảm thấy an toàn hơn khi đứng trước một quyết định lớn. Nếu tập trung vào người đi cùng thay vì người quyết định chính, sẽ lãng phí thời gian và mất tập trung.',
  '{
    "surface": "Muốn có người đi cùng cho vui và để có thêm góc nhìn.",
    "middle": "Chưa đủ tự tin để đến một mình và xử lý thông tin phức tạp về tài chính và pháp lý.",
    "root": "Người quyết định chính chưa có ở đây, cần thêm thông tin để về thuyết phục người đó."
  }'::jsonb,
  '{
    "reflect": "Tôn trọng người đi cùng, không bỏ qua họ. Sớm xác định ai là người sẽ ra quyết định và đặt câu hỏi hướng đến đúng người đó.",
    "diq": "Giúp người đến thật sự trở thành người có đủ thông tin để về thuyết phục người quyết định chính nếu người đó không có mặt."
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "Đây là em gái anh, anh đưa đi cùng cho có người."},
    {"speaker": "sales", "content": "Dạ, chào chị. Rất vui được gặp cả hai anh chị."},
    {"speaker": "note", "content": "Chào người đi cùng rồi quay lại với khách chính."},
    {"speaker": "sales", "content": "Anh ơi, để em chuẩn bị đúng thứ cho anh hôm nay, anh cho em biết khi nào anh quyết định một việc quan trọng thì thường trao đổi với ai trước ạ, vợ anh hay ai khác?"},
    {"speaker": "note", "content": "Chờ. Câu này giúp xác định ai là người quyết định thật sự mà không có mặt hôm nay."},
    {"speaker": "khach", "content": "Anh tự quyết, vợ anh không quan tâm mấy chuyện này."},
    {"speaker": "sales", "content": "Dạ, vậy thì tốt. Anh có thể quyết ngay hôm nay nếu thấy phù hợp, không cần chờ thêm ai. Em tập trung vào bài toán của anh luôn nhé."},
    {"speaker": "note", "content": "Trường hợp 2: khách cần hỏi vợ"},
    {"speaker": "khach", "content": "Anh cũng cần hỏi vợ. Hôm nay anh đi xem trước thôi."},
    {"speaker": "sales", "content": "Dạ được anh. Vậy mục tiêu hôm nay là anh về có đủ thông tin để trao đổi với chị nhà. Em chuẩn bị tóm tắt và bảng tài chính theo phương án anh quan tâm để anh mang về cho chị xem. Cuối buổi hôm nay em và anh cùng xác định lịch phù hợp để chị có thể đến xem trực tiếp nếu quan tâm."}
  ]'::jsonb,
  '[]'::jsonb,
  'KHÔNG bao giờ kết thúc buổi gặp mà không biết bước tiếp theo là gì khi người quyết định chưa có mặt. Bước tiếp theo phải cụ thể: chị nhà xem tài liệu và có câu hỏi thì liên hệ, hoặc đặt lịch riêng cho chị đến xem. Buổi gặp không dẫn đến bước tiếp theo cụ thể là buổi gặp chưa hoàn thành.',
  ARRAY['nguoi_di_cung', 'nguoi_quyet_dinh', 'vo_chong'],
  ARRAY['đi cùng', 'người đi cùng', 'vợ', 'người quyết định'],
  ARRAY['bds_pro'],
  ARRAY['b_030', 'b_022'],
  'Người đi cùng không phải quyết định chính vợ chồng tài liệu về trao đổi'),

-- ──────────────────────────────────────────────────────────
-- NHÓM 4: TẠI SA BÀN VÀ NHÀ MẪU
-- ──────────────────────────────────────────────────────────

-- TH 23: Khách im lặng hoàn toàn
('b_023', 'TL02', 'B', 'Gặp trực tiếp và Tham quan', 'Khách im lặng hoàn toàn trong 15-20 phút đầu tại sa bàn',
  'Khách im lặng, quan sát sa bàn 15-20 phút đầu',
  ARRAY['3_TOUCH'], ARRAY[1],
  'Im lặng không có nghĩa là không quan tâm. Sa bàn dự án quy mô lớn cần thời gian để khách tiếp nhận và định hướng. Khách đang xử lý thông tin trực quan, so sánh với kỳ vọng trước đó, hoặc đang cố cảm nhận thật trước khi đặt câu hỏi. Tư vấn viên mắc lỗi khi cố lấp đầy im lặng bằng cách nói liên tục. Điều đó ngăn khách suy nghĩ và tạo cảm giác bị dẫn dắt.',
  '{
    "surface": "Không nói gì.",
    "middle": "Đang xử lý thông tin trực quan từ sa bàn lớn, hoặc không biết hỏi gì, hoặc muốn có thời gian cảm nhận mà không bị ngắt quãng.",
    "root": "Muốn hình thành góc nhìn của riêng mình trước khi để tư vấn viên dẫn dắt."
  }'::jsonb,
  '{
    "reflect": "Cho phép im lặng. Đứng cạnh nhưng không nói. Sau 10 phút, đặt một câu hỏi mở ngắn về điều khách đang nhìn vào.",
    "diq": "Im lặng là công cụ, không phải vấn đề cần giải quyết."
  }'::jsonb,
  '[
    {"speaker": "note", "content": "Khách quan sát sa bàn {{project.zones_count}} phân khu, không nói gì trong 10 phút."},
    {"speaker": "sales", "content": "Anh đang nhìn vào khu vực nào ạ?"},
    {"speaker": "note", "content": "Sau 10 phút, nhẹ nhàng. Chờ. Nếu khách trả lời, đi theo hướng đó. Nếu không, chờ thêm."},
    {"speaker": "note", "content": "Sau thêm 5 phút"},
    {"speaker": "sales", "content": "Anh cứ xem thoải mái. Khi nào anh có câu hỏi gì em ở đây."},
    {"speaker": "note", "content": "Lùi lại một bước, không đứng sát khách. KHÔNG nói thêm gì."},
    {"speaker": "note", "content": "Khi khách lần đầu lên tiếng"},
    {"speaker": "khach", "content": "Cái {{project.landmark}} này to thật, bao nhiêu hecta vậy em?"},
    {"speaker": "sales", "content": "Dạ {{project.landmark_size}} anh, lớn hơn nhiều hồ nước ngọt ở các khu đô thị khác. Anh đang để ý {{project.landmark}} vì ưu tiên view từ nhà hay vì tiện ích sử dụng ạ?"},
    {"speaker": "note", "content": "Câu hỏi phân loại ngay khi khách bắt đầu nói. KHÔNG bắt đầu trình bày một chiều."}
  ]'::jsonb,
  '[]'::jsonb,
  'Im lặng sau câu hỏi là kỹ năng khó nhất và quan trọng nhất. Hầu hết tư vấn viên có xu hướng tự lấp đầy khoảng trống. Quy tắc: sau mỗi câu hỏi, đếm đến 10 trong đầu trước khi nói thêm. Với khách im lặng dài tại sa bàn, quy tắc đó phải áp dụng cho cả khoảng trống giữa các câu nói của khách.',
  ARRAY['im_lang', 'sa_ban', 'quan_sat', 'kien_nhan'],
  ARRAY['im lặng', 'không nói', 'quan sát', 'sa bàn'],
  ARRAY['bds_pro'],
  ARRAY['b_019', 'b_020'],
  'Khách im lặng sa bàn quan sát không nói câu hỏi phân loại'),

-- TH 24: "Nhìn đẹp nhưng ngoài thực tế chắc khác"
('b_024', 'TL02', 'B', 'Gặp trực tiếp và Tham quan', '"Nhìn đẹp nhưng ngoài thực tế chắc khác"',
  'Nhìn đẹp thật, nhưng bàn giao thực tế chắc khác nhiều lắm',
  ARRAY['REFLECT', 'DIQ'], ARRAY[2, 3],
  'Khách đã có trải nghiệm hoặc đã nghe về nhà mẫu không phản ánh thực tế. Đây là lo ngại có cơ sở và hoàn toàn hợp lý với thị trường BĐS Việt Nam. Nhà mẫu được xây theo tiêu chuẩn hoàn thiện thực tế, nhưng nội thất staging vẫn sẽ khác so với sản phẩm bàn giao thô. Cần tách biệt rõ hai thứ này thay vì phủ nhận lo ngại của khách.',
  '{
    "surface": "Không tin nhà mẫu là đại diện thật của sản phẩm thực tế.",
    "middle": "Lo bị lừa bởi hình ảnh marketing, đã hoặc biết ai đó mua theo nhà mẫu rồi thất vọng khi nhận thực tế.",
    "root": "Cần bằng chứng cụ thể có thể kiểm chứng, không phải lời đảm bảo bằng lời nói."
  }'::jsonb,
  '{
    "reflect": "KHÔNG xác nhận tiền đề của khách (\"ngoài thực tế chắc khác\") rồi mới giải thích — đó là lỗi REFLECT cơ bản. Dùng câu hỏi phản chiếu để làm rõ khách đang lo phần nào cụ thể trước.",
    "diq": "Dữ liệu (những thứ không thể thay đổi sau bàn giao: kết cấu, diện tích thực, chiều cao trần, mặt tiền), Insight (đây là phần có thể kiểm chứng ngay tại chỗ bằng thước đo), Câu hỏi (anh muốn kiểm tra phần nào trực tiếp)."
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "Nhìn đẹp thật, nhưng bàn giao thực tế chắc khác nhiều lắm."},
    {"speaker": "sales", "content": "Dạ, anh đang hình dung phần nào sẽ khác ạ, nội thất hoàn thiện hay kích thước thực tế của căn?"},
    {"speaker": "note", "content": "Chờ. KHÔNG xác nhận hay phủ nhận gì cả — hỏi để khách tự làm rõ."},
    {"speaker": "khach", "content": "Thì cả hai, nhà mẫu toàn làm đẹp hơn thực tế."},
    {"speaker": "sales", "content": "Dạ, anh nói đúng về phần nội thất — đó là staging và sẽ không có trong bàn giao thực tế. Nhưng có phần mà em muốn anh biết: kích thước thực của căn, chiều cao trần, và diện tích mặt tiền — những thứ đó không thay đổi được sau khi xây xong. Và anh có thể đo kiểm tra ngay tại đây bây giờ."},
    {"speaker": "sales", "content": "Anh muốn em đo chiều cao trần và diện tích thực để so với bản vẽ kỹ thuật không ạ?"},
    {"speaker": "note", "content": "Chờ."},
    {"speaker": "khach", "content": "Thôi không cần đo, nhưng anh hỏi thật, em thấy dự án này có đáng không?"},
    {"speaker": "sales", "content": "Dạ, anh đặt câu hỏi đó thì em trả lời thật: đáng hay không phụ thuộc vào mục tiêu của anh. Em không thể nói chung chung. Với mục tiêu của anh là gì, em mới đánh giá được cụ thể. Anh đang hướng đến dòng tiền cho thuê hay giữ để tăng giá ạ?"},
    {"speaker": "note", "content": "Kéo về bài toán cụ thể, không hứa hẹn chung."}
  ]'::jsonb,
  '[]'::jsonb,
  'KHÔNG bao giờ phủ nhận lo ngại của khách. Thừa nhận phần lo ngại đúng, sau đó cung cấp bằng chứng cụ thể cho phần có thể kiểm chứng. Tư vấn viên thừa nhận được giới hạn của nhà mẫu thường được tin tưởng hơn tư vấn viên cố bảo vệ mọi thứ.',
  ARRAY['nha_mau', 'ban_giao', 'thuc_te', 'kiem_chung'],
  ARRAY['nhà mẫu', 'bàn giao', 'thực tế', 'khác', 'staging'],
  ARRAY['bds_pro'],
  ARRAY['b_025', 'b_031'],
  'Nhà mẫu bàn giao thực tế staging kích thước chiều cao trần kiểm chứng'),

-- TH 25: Thông tin không khớp với internet
('b_025', 'TL02', 'B', 'Gặp trực tiếp và Tham quan', 'Thông tin tư vấn viên nói không khớp với những gì đọc trên mạng',
  'Em nói quy mô X, nhưng anh đọc ở đâu đó thấy ghi Y',
  ARRAY['REFLECT'], ARRAY[2],
  'Khách đã tự nghiên cứu và thấy có mâu thuẫn. Đây là thử thách về độ tin cậy của tư vấn viên, không phải của dự án. Dự án có nhiều thông tin thay đổi nhanh: quy mô, tên, giá theo từng phân khu. Những mâu thuẫn này có lý do thật. Lỗi nghiêm trọng nhất: bịa ra lý do để che đậy thay vì thừa nhận không biết.',
  '{
    "surface": "Thấy có sự không nhất quán và muốn làm rõ.",
    "middle": "Bắt đầu lo ngại tư vấn viên có đang nói thật không, hay đang nói những gì có lợi cho việc bán hàng.",
    "root": "Cần tin tưởng người tư vấn trước khi có thể tin vào dự án. Nếu mất tin tưởng ở bước này, gần như không thể kéo lại."
  }'::jsonb,
  '{
    "reflect": "KHÔNG bào chữa. Hỏi cụ thể thông tin nào không khớp và ở đâu.",
    "diq": "Sự thành thật trong tình huống này có giá trị hơn bất kỳ lập luận nào. Nhiều thông tin cũ vẫn đang lưu hành trên các diễn đàn và trang BĐS."
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "Em nói quy mô {{project.size}}, nhưng anh đọc ở đâu đó thấy ghi {{project.old_size}} thôi."},
    {"speaker": "sales", "content": "Dạ, anh đọc ở đâu ạ? Hai con số đó đều đúng nhưng ở hai thời điểm khác nhau. {{project.old_size}} là quy mô trong phê duyệt ban đầu, {{project.size}} là quy mô sau khi điều chỉnh quy hoạch cập nhật. Em có tài liệu chính thức, anh muốn xem ngay không ạ?"},
    {"speaker": "note", "content": "Chờ. KHÔNG vội giải thích dài trước khi khách phản hồi."},
    {"speaker": "khach", "content": "Ừ, vậy còn thông tin về giá anh thấy chỗ nào nói khác hẳn."},
    {"speaker": "sales", "content": "Dạ, thông tin giá trên mạng hiện tại hầu hết là của các kênh chưa được CĐT ủy quyền hoặc dùng số liệu cũ. Em là đơn vị F1 phân phối chính thức, thông tin giá chính thức chỉ có từ đợt mở bán {{project.launch_date}} tới. Anh muốn em gửi văn bản ủy quyền phân phối để anh xác minh không ạ?"},
    {"speaker": "note", "content": "Nếu tư vấn viên không biết chắc"},
    {"speaker": "sales", "content": "Dạ, anh ơi, em chưa chắc phần này. Em gọi xác nhận lại với bộ phận sản phẩm ngay bây giờ được không, để anh có thông tin chính xác nhất?"},
    {"speaker": "note", "content": "Gọi xác nhận ngay trước mặt khách. KHÔNG hứa sẽ kiểm tra sau rồi quên."}
  ]'::jsonb,
  '[{"type": "never", "content": "KHÔNG BAO GIỜ bịa ra lý do để che đậy. Khách sẽ nhận ra và mất tin tưởng hoàn toàn."}]'::jsonb,
  'Nắm rõ lịch sử cập nhật thông tin dự án: quy mô thay đổi, tên thay đổi, giá chính thức chỉ có từ đợt mở bán. Biết lý do tại sao thông tin trên mạng khác nhau là cách trả lời tự tin nhất, thay vì phủ nhận sự tồn tại của thông tin đó.',
  ARRAY['thong_tin_mau_thuan', 'do_tin_cay', 'thanh_that'],
  ARRAY['thông tin khác', 'không khớp', 'internet', 'mạng', 'quy mô'],
  ARRAY['bds_pro'],
  ARRAY['b_024', 'b_027'],
  'Thông tin không khớp mạng internet quy mô lịch sử cập nhật chính thức F1'),

-- TH 26: Khách chụp ảnh nhiều, hỏi nhiều nhưng không lộ tín hiệu mua
('b_026', 'TL02', 'B', 'Gặp trực tiếp và Tham quan', 'Khách chụp ảnh nhiều, hỏi nhiều nhưng không lộ tín hiệu mua',
  'Khách thu thập thông tin tích cực nhưng chưa quyết',
  ARRAY['REFLECT', 'DIQ'], ARRAY[2, 3],
  'Khách đang thu thập thông tin tích cực, điều đó có nghĩa là quan tâm thật sự. Nhưng quan tâm không đồng nghĩa với sẵn sàng quyết định. Với dự án lớn nhiều phân khu, nhiều khách sẽ cần nhiều thời gian hơn để xử lý thông tin. Lỗi phổ biến: tư vấn viên đẩy khách vào vị trí chốt quá sớm khi chưa biết họ đang ở đâu trong quá trình ra quyết định.',
  '{
    "surface": "Hứng thú với thông tin và hình ảnh.",
    "middle": "Đang ở giai đoạn thu thập để so sánh, chưa có tiêu chí đủ rõ để quyết định.",
    "root": "Chưa thấy lý do đủ mạnh để hành động hôm nay thay vì tiếp tục tìm hiểu thêm."
  }'::jsonb,
  '{
    "reflect": "KHÔNG đẩy vào vị trí chốt. REFLECT để xác định khách đang ở giai đoạn nào trong quá trình quyết định.",
    "diq": "Dữ liệu (mốc mở bán, chính sách hỗ trợ lãi suất 0% chỉ áp dụng đợt đầu, tiền lệ từ các dự án trước của CĐT), Insight (chính sách tốt nhất luôn ở đợt đầu tiên), Câu hỏi (điều gì sẽ giúp anh có đủ thông tin để không phải bỏ lỡ đợt đó)."
  }'::jsonb,
  '[
    {"speaker": "note", "content": "Khách chụp ảnh sa bàn và nhà mẫu, hỏi nhiều câu về phân khu và chính sách"},
    {"speaker": "sales", "content": "Anh quan tâm rất kỹ, anh đang tổng hợp thông tin để so sánh với dự án nào khác không ạ?"},
    {"speaker": "note", "content": "Chờ."},
    {"speaker": "khach", "content": "Không, anh chỉ đang tìm hiểu thêm thôi."},
    {"speaker": "sales", "content": "Dạ, anh đang hình dung mình sẽ ra quyết định trong khoảng bao lâu ạ?"},
    {"speaker": "note", "content": "Chờ."},
    {"speaker": "khach", "content": "Trong năm nay thì cũng có thể."},
    {"speaker": "sales", "content": "Dạ, anh có thể chưa để ý một điểm: đợt mở bán giai đoạn 1 {{project.phase1_name}} dự kiến {{project.launch_date}}. Chính sách hỗ trợ lãi suất 0% từ {{financing.rate_free_period}} thường chỉ áp dụng cho đợt đầu tiên — đây là pattern nhất quán của {{project.developer}} từ {{comparables.0.name}} đến {{comparables.1.name}}, các đợt sau đều không còn chính sách đó nữa."},
    {"speaker": "note", "content": "D = dữ liệu về mốc launch và tiền lệ; dừng lại."},
    {"speaker": "sales", "content": "Anh thấy điều đó có liên quan đến thời điểm quyết định của mình không ạ?"},
    {"speaker": "note", "content": "Chờ. I và Q nằm trong câu hỏi này — để khách tự rút ra hàm ý."},
    {"speaker": "khach", "content": "Ừ, thì nếu chính sách tốt hơn thì đương nhiên ảnh hưởng."},
    {"speaker": "sales", "content": "Dạ. Vậy điều gì sẽ giúp anh có đủ thông tin để quyết định trước đợt đó ạ, pháp lý, tài chính, hay vị trí sản phẩm cụ thể?"},
    {"speaker": "note", "content": "Chờ. Câu trả lời cho biết rào cản thật và bước tiếp theo."}
  ]'::jsonb,
  '[]'::jsonb,
  'Phân loại khách chính xác quan trọng hơn cố gắng chốt sớm. Ghi chú sau buổi gặp phải bao gồm: thời gian quyết định của khách, điều kiện để khách quyết định, và bước tiếp theo cụ thể.',
  ARRAY['thu_thap_thong_tin', 'chua_quyet', 'launch_date', 'phan_loai_khach'],
  ARRAY['chụp ảnh', 'hỏi nhiều', 'chưa quyết', 'tìm hiểu thêm'],
  ARRAY['bds_pro'],
  ARRAY['b_020', 'b_029'],
  'Khách chụp ảnh hỏi nhiều chưa quyết launch date chính sách đợt đầu phân loại'),

-- TH 27: Khách nhận xét tiêu cực trước nhóm khác
('b_027', 'TL02', 'B', 'Gặp trực tiếp và Tham quan', 'Khách nhận xét tiêu cực về dự án trước mặt nhóm khách khác',
  'Dự án lấp biển kiểu này toàn quảng cáo đẹp thôi',
  ARRAY['REFLECT'], ARRAY[2],
  'Tình huống này nhạy cảm vì ảnh hưởng không chỉ đến một khách mà có thể lan sang cả nhóm đang ở đó. Tại sa bàn, nơi thường có nhiều nhóm khách cùng lúc, một nhận xét tiêu cực nói to có thể ảnh hưởng đến tâm lý cả khu vực. Phản ứng sai của tư vấn viên có thể tạo ra hiệu ứng domino.',
  '{
    "surface": "Đang chia sẻ lo ngại hoặc nhận xét thật.",
    "middle": "Muốn được lắng nghe và muốn xem tư vấn viên phản ứng như thế nào khi bị chất vấn.",
    "root": "Đang kiểm tra sự thành thật của tư vấn viên. Nếu tư vấn viên phòng thủ hoặc bào chữa, tin tưởng sẽ giảm."
  }'::jsonb,
  '{
    "reflect": "KHÔNG tranh luận trước nhóm. KHÔNG phủ nhận nhận xét. Ghi nhận ngắn gọn, mời khách trao đổi riêng nếu có thể.",
    "diq": "Nếu lo ngại đó hợp lý, thừa nhận ngay thay vì bào chữa."
  }'::jsonb,
  '[
    {"speaker": "khach_a", "content": "Ừ nhưng dự án lấp biển kiểu này toàn quảng cáo đẹp thôi, thực tế chưa biết thế nào."},
    {"speaker": "note", "content": "Nhóm khách B và C đứng gần đó bắt đầu nhìn sang."},
    {"speaker": "sales", "content": "Dạ, anh nói điều mà nhiều người cũng đang nghĩ. Lo ngại về dự án lấp biển là hoàn toàn có cơ sở vì không phải dự án nào cũng như nhau. Anh đang lo ngại cụ thể phần nào ạ, pháp lý hay chất lượng thi công?"},
    {"speaker": "note", "content": "Bình tĩnh, không phòng thủ. Chờ. KHÔNG giải thích dài, không bào chữa."},
    {"speaker": "khach_a", "content": "Pháp lý thế nào, bao giờ có sổ?"},
    {"speaker": "sales", "content": "Dạ, câu đó em trả lời được cụ thể. Anh và em ra chỗ này nói chuyện riêng một chút nhé, em giải thích đầy đủ hơn và có tài liệu nguồn gốc cho anh xem."},
    {"speaker": "note", "content": "Mời khách A ra chỗ riêng. KHÔNG để cuộc tranh luận diễn ra trước nhóm."},
    {"speaker": "note", "content": "Với nhóm khách B và C, sau khi mời A ra"},
    {"speaker": "sales", "content": "Dạ, anh chị có câu hỏi gì về pháp lý hoặc tiến độ thi công không ạ? Em giải thích cùng luôn."},
    {"speaker": "note", "content": "Biến lo ngại của khách A thành cơ hội giải thích cho cả nhóm, không né tránh."}
  ]'::jsonb,
  '[]'::jsonb,
  'Bình tĩnh là kỹ năng quan trọng nhất trong tình huống này. Thừa nhận lo ngại và mời trao đổi riêng là cách xử lý vừa chuyên nghiệp vừa kiểm soát được bối cảnh.',
  ARRAY['nhan_xet_tieu_cuc', 'nhom_khach', 'xu_ly_khung_hoang'],
  ARRAY['tiêu cực', 'quảng cáo', 'trước nhóm', 'lấp biển'],
  ARRAY['bds_pro'],
  ARRAY['b_025', 'b_028'],
  'Khách nhận xét tiêu cực trước nhóm quảng cáo pháp lý bình tĩnh riêng'),

-- TH 28: Sự cố logistics: nhà mẫu chưa sẵn sàng
('b_028', 'TL02', 'B', 'Gặp trực tiếp và Tham quan', 'Sự cố logistics: nhà mẫu chưa sẵn sàng khi khách đến',
  'Nhà mẫu chưa sẵn sàng khi khách đến',
  ARRAY['3_TOUCH'], ARRAY[4],
  'Đây là tình huống nằm ngoài tầm kiểm soát của tư vấn viên nhưng ảnh hưởng trực tiếp đến ấn tượng đầu tiên và sự tin tưởng của khách. Cách tư vấn viên xử lý sự cố này cho thấy nhiều hơn về tính chuyên nghiệp so với cách họ trình bày dự án khi mọi thứ thuận lợi. Khi nhà mẫu chưa sẵn sàng, còn nhiều phương án thay thế: sa bàn, tầng quan sát, video tiến độ thi công thực tế.',
  '{
    "surface": "Thất vọng vì đã di chuyển xa mà không xem được thứ quan trọng nhất.",
    "middle": "Lo ngại về sự chuyên nghiệp của đơn vị phân phối nếu ngay từ buổi đầu đã có vấn đề.",
    "root": "Lo ngại ngầm: nếu mua rồi thì khi có vấn đề sẽ được xử lý như thế nào?"
  }'::jsonb,
  '{
    "reflect": "Chủ động, không đổ lỗi cho ai, không xin lỗi quá mức. Tìm phương án thay thế ngay thay vì đứng giải thích tại sao sự cố xảy ra.",
    "diq": "Biến cách xử lý sự cố thành bằng chứng về tính chuyên nghiệp."
  }'::jsonb,
  '[
    {"speaker": "note", "content": "Nhà mẫu đang điều chỉnh, chưa mở cửa kịp."},
    {"speaker": "sales", "content": "Anh ơi, em xin lỗi vì sự bất tiện này. Nhà mẫu đang có điều chỉnh nhỏ, sẽ sẵn sàng sau 30 phút. Trong lúc đó, em dẫn anh lên tầng quan sát — từ đó anh sẽ thấy tổng thể {{project.zones_count}} phân khu và vị trí {{project.landmark}} trực quan hơn nhà mẫu nhiều. Anh thấy ổn không ạ?"},
    {"speaker": "note", "content": "Đề xuất phương án thay thế có giá trị thật, không đề cập đến khoảng cách hay công sức di chuyển."},
    {"speaker": "khach", "content": "Thôi, anh bận, anh về rồi hẹn lần khác vậy."},
    {"speaker": "sales", "content": "Dạ, em hiểu anh. Trước khi anh về, anh có 10 phút để em show anh tổng thể sa bàn {{project.zones_count}} phân khu không ạ? Đây là thứ không thể thấy qua ảnh, và nó sẽ giúp anh đặt câu hỏi đúng hơn cho lần gặp tiếp theo."},
    {"speaker": "note", "content": "Chờ. KHÔNG nài thêm nếu khách vẫn quyết về."},
    {"speaker": "note", "content": "Nếu khách đồng ý chờ và nhà mẫu sẵn sàng"},
    {"speaker": "sales", "content": "Anh ơi, nhà mẫu đã sẵn sàng rồi. Anh vào xem nhé, em giải thích đầy đủ phần anh quan tâm nhất."}
  ]'::jsonb,
  '[]'::jsonb,
  'Phương án thay thế phải có sẵn trong đầu trước khi xảy ra sự cố. Tư vấn viên đề xuất phương án thay thế trong vòng 30 giây sau khi biết có sự cố là tư vấn viên được đào tạo tốt.',
  ARRAY['su_co_logistics', 'phuong_an_thay_the', 'tinh_chuyen_nghiep'],
  ARRAY['nhà mẫu', 'sự cố', 'chưa sẵn sàng', 'tầng quan sát'],
  ARRAY['bds_pro'],
  ARRAY['b_024', 'b_027'],
  'Sự cố nhà mẫu chưa sẵn sàng phương án thay thế sa bàn tầng quan sát chuyên nghiệp'),

-- ──────────────────────────────────────────────────────────
-- NHÓM 5: CHỐT VÀ BƯỚC TIẾP
-- ──────────────────────────────────────────────────────────

-- TH 29: Khách khen dự án rồi chuẩn bị ra về
('b_029', 'TL02', 'B', 'Gặp trực tiếp và Tham quan', 'Khách khen dự án rồi chuẩn bị ra về mà không hỏi thêm',
  'Dự án đẹp thật em ơi. Thôi anh về nhé, anh nghĩ thêm',
  ARRAY['REFLECT', 'DIQ'], ARRAY[2, 3, 4],
  'Đây là tình huống tư vấn viên thường bị động nhất. Khách tỏ vẻ hài lòng, không có phản đối rõ ràng, nhưng cũng không có tín hiệu muốn tiến thêm bước nào. Nếu để khách ra về trong trạng thái này mà không có bước tiếp theo cụ thể, khả năng cao họ sẽ không liên lạc lại. Lỗi phổ biến: tư vấn viên cũng dừng ở bước khen, cảm ơn khách đã đến, và hy vọng khách sẽ tự liên hệ lại.',
  '{
    "surface": "Hài lòng với những gì đã xem.",
    "middle": "Chưa có lý do đủ mạnh để hành động ngay hôm nay. Chưa kết nối được với bài toán cá nhân của mình.",
    "root": "Cần ai đó giúp họ hiểu tại sao buổi này quan trọng hơn chỉ là đi xem cho biết."
  }'::jsonb,
  '{
    "reflect": "KHÔNG để khách ra về mà không có bước tiếp theo cụ thể. Trước khi họ ra về, đặt một câu hỏi kết nối thông tin đã biết về họ với bài toán của họ.",
    "diq": "Mục tiêu là giúp họ thấy buổi hôm nay chưa hoàn thành."
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "Dự án đẹp thật em ơi. Thôi anh về nhé, anh nghĩ thêm."},
    {"speaker": "sales", "content": "Dạ, cảm ơn anh đã dành thời gian đến. Trước khi anh về, có một điều em muốn hỏi anh: với những gì anh vừa thấy hôm nay, điều gì còn khiến anh chưa quyết định được ạ?"},
    {"speaker": "note", "content": "Chờ. KHÔNG tiếp tục nói."},
    {"speaker": "note", "content": "Nếu khách trả lời \"cần nghĩ thêm\""},
    {"speaker": "sales", "content": "Dạ, anh đang nghĩ về điều gì cụ thể nhất ạ, tài chính, pháp lý, hay thời điểm?"},
    {"speaker": "note", "content": "Chờ. Câu trả lời cho biết rào cản thật sự."},
    {"speaker": "note", "content": "Nếu khách trả lời cụ thể"},
    {"speaker": "sales", "content": "Dạ, anh nói điều đó là em hiểu. Vậy mình làm thế này: em chuẩn bị bài toán tài chính tính riêng theo phương án vốn của anh và gửi cho anh đọc qua cuối tuần này. Anh xem xong nếu thấy con số phù hợp thì mình nói chuyện thêm. Anh thấy ổn không ạ?"},
    {"speaker": "note", "content": "Đặt bước tiếp theo cụ thể trước khi khách rời đi."},
    {"speaker": "sales", "content": "Anh cho em số Zalo để em gửi tài liệu nhé. Và anh ơi, đợt mở bán giai đoạn 1 {{project.phase1_name}} dự kiến {{project.launch_date}}, chính sách hỗ trợ lãi suất 0% chỉ áp dụng cho đợt đầu. Tốt nhất anh xem xong trong tuần này để mình còn thời gian trao đổi thêm."}
  ]'::jsonb,
  '[]'::jsonb,
  'Buổi gặp kết thúc tốt không phải là buổi khách khen đẹp. Buổi gặp kết thúc tốt là buổi có bước tiếp theo cụ thể mà cả hai bên đã xác nhận trước khi khách rời đi. Tư vấn viên cần nắm được ít nhất một rào cản cụ thể của khách trước khi họ đứng dậy.',
  ARRAY['chot_buoc_tiep', 'khen_dep', 'rao_can', 'bai_toan_tai_chinh'],
  ARRAY['khen đẹp', 'nghĩ thêm', 'ra về', 'bước tiếp theo'],
  ARRAY['bds_pro'],
  ARRAY['b_026', 'b_030'],
  'Khách khen đẹp ra về nghĩ thêm bước tiếp theo bài toán tài chính Zalo launch'),

-- TH 30: Hai vợ chồng bất đồng
('b_030', 'TL02', 'B', 'Gặp trực tiếp và Tham quan', 'Hai vợ chồng bất đồng ngay tại sa bàn',
  'Chồng thấy ổn, vợ thấy chưa cần mua thêm',
  ARRAY['REFLECT', 'DIQ'], ARRAY[2, 3],
  'Tình huống đòi hỏi tư vấn viên không được phép đứng về phía ai. Bất đồng thường xoay quanh: dòng tiền hàng tháng khi vay, rủi ro, hoặc câu hỏi liệu đây là thời điểm phù hợp. Mỗi lo ngại đều có cơ sở riêng và cần được xử lý bằng thông tin, không phải bằng thuyết phục cảm xúc. Nếu cố thuyết phục người phản đối, người đó sẽ càng phản đối mạnh hơn.',
  '{
    "surface": "Hai người có ý kiến khác nhau về dự án.",
    "middle": "Người phản đối chưa được lắng nghe và hiểu, lo ngại của họ chưa được giải quyết thật sự.",
    "root": "Quyết định mua nhà là quyết định gia đình, cả hai phải đồng thuận thật sự không phải vì bị thuyết phục."
  }'::jsonb,
  '{
    "reflect": "KHÔNG đứng về phía người đồng ý để cùng thuyết phục người phản đối. Hỏi người phản đối câu hỏi mở về lo ngại cụ thể của họ. Lắng nghe thật.",
    "diq": "Mục tiêu là để hai người tự đến với nhau dựa trên thông tin, không phải tư vấn viên kéo một người sang phía còn lại."
  }'::jsonb,
  '[
    {"speaker": "chong", "content": "Anh thấy ổn, đầu tư được."},
    {"speaker": "vo", "content": "Thôi anh ơi, mình chưa cần mua thêm. Tiền để dành còn hơn."},
    {"speaker": "sales", "content": "Chị ơi, chị thấy lo ngại nhất ở điểm nào ạ, dòng tiền hàng tháng hay chị cảm thấy thời điểm chưa phù hợp?"},
    {"speaker": "note", "content": "Quay sang vợ. Hỏi người phản đối TRƯỚC, không phải người đồng ý."},
    {"speaker": "vo", "content": "Chị thấy dòng tiền mình chưa đủ để gánh thêm."},
    {"speaker": "sales", "content": "Dạ, chị nói đúng điểm quan trọng nhất. Chị cho em hỏi, chị đang tính dòng tiền theo phương án vay như thế nào ạ, vay theo tiến độ hay vay thả nổi sau khi nhận nhà?"},
    {"speaker": "note", "content": "Chờ."},
    {"speaker": "sales", "content": "Dạ, để em tính thử một phương án cụ thể theo thu nhập và chi phí hiện tại của anh chị, có dùng chính sách hỗ trợ lãi suất 0% giai đoạn đầu. Anh chị cho em 10 phút tính thử nhé."},
    {"speaker": "note", "content": "Tính toán cụ thể thay vì tranh luận. Để con số nói thay cho lời giải thích."},
    {"speaker": "note", "content": "Sau khi tính xong"},
    {"speaker": "sales", "content": "Dạ, theo phương án có hỗ trợ lãi suất 0% trong {{financing.rate_free_period}} đầu, hàng tháng cần đóng khoảng X triệu. Anh chị tự đánh giá xem con số đó có trong khoảng chịu được không ạ?"},
    {"speaker": "note", "content": "KHÔNG nói \"được\" hay \"không được\" thay cho khách. Để khách tự đánh giá."}
  ]'::jsonb,
  '[]'::jsonb,
  'Khi hai vợ chồng bất đồng, buổi gặp thường kết thúc theo một trong ba hướng: cả hai đồng ý, cả hai từ chối, hoặc hẹn về nhà thảo luận thêm. Tư vấn viên giỏi không cố ép kết quả theo hướng thứ nhất, mà giúp cả hai có đủ thông tin để về thảo luận thật sự, và đặt lịch tái tư vấn sau đó.',
  ARRAY['vo_chong_bat_dong', 'dong_tien', 'tinh_toan_cu_the'],
  ARRAY['vợ chồng', 'bất đồng', 'dòng tiền', 'vay'],
  ARRAY['bds_pro'],
  ARRAY['b_022', 'b_031'],
  'Vợ chồng bất đồng dòng tiền hàng tháng lãi suất 0% tính toán cụ thể'),

-- TH 31: "Nếu đặt cọc mà đổi ý thì có lấy lại được không?"
('b_031', 'TL02', 'B', 'Gặp trực tiếp và Tham quan', '"Nếu đặt cọc mà đổi ý thì có lấy lại được không?"',
  'Nếu em đặt cọc mà sau đó anh đổi ý thì lấy lại tiền cọc được không?',
  ARRAY['REFLECT'], ARRAY[2, 4],
  'Đây là tín hiệu mua rõ nhất trong toàn bộ buổi tư vấn. Khách đang cân nhắc nghiêm túc đến mức muốn biết điều tệ nhất có thể xảy ra nếu họ thay đổi quyết định. Câu hỏi này không phải dấu hiệu của người do dự, mà là dấu hiệu của người chuẩn bị hành động và muốn quản lý rủi ro. Lỗi phổ biến: tư vấn viên né tránh hoặc giảm nhẹ điều khoản mất cọc để không làm khách sợ, dẫn đến khách mất tin tưởng khi đọc hợp đồng sau đó.',
  '{
    "surface": "Hỏi về điều khoản tài chính cụ thể.",
    "middle": "Đang cân nhắc rất nghiêm túc việc đặt cọc nhưng muốn biết rủi ro nếu đổi ý.",
    "root": "Muốn đặt cọc nhưng chưa sẵn sàng 100%, đang hỏi để biết chi phí của sự không chắc chắn."
  }'::jsonb,
  '{
    "reflect": "Trả lời thật, đầy đủ, và chính xác theo đúng quy định hợp đồng. KHÔNG giảm nhẹ điều khoản để không làm khách sợ. Sau khi giải thích điều khoản, hỏi khách đang cân nhắc điều gì.",
    "diq": "Dùng câu hỏi đó để xác định rào cản cuối cùng."
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "Nếu em đặt cọc mà sau đó anh đổi ý thì lấy lại tiền cọc được không?"},
    {"speaker": "sales", "content": "Dạ, câu đó em trả lời thẳng: theo hợp đồng đặt cọc, nếu khách đổi ý thì sẽ mất tiền cọc. Nếu chủ đầu tư đổi ý thì họ phải trả lại gấp đôi. Điều khoản này chuẩn theo quy định pháp luật. Anh muốn em giải thích thêm phần nào không ạ?"},
    {"speaker": "note", "content": "Chờ. KHÔNG giải thích dài hơn cho đến khi khách hỏi."},
    {"speaker": "khach", "content": "Vậy thì rủi ro cho anh quá nếu có chuyện gì xảy ra."},
    {"speaker": "sales", "content": "Dạ, anh đang lo điều gì có thể xảy ra mà khiến anh muốn đổi ý ạ? Em hỏi để hiểu anh đang cân nhắc rủi ro nào cụ thể."},
    {"speaker": "note", "content": "Chờ. Đây là câu hỏi quan trọng nhất trong cả buổi."},
    {"speaker": "note", "content": "Nếu khách nói lo pháp lý chưa rõ"},
    {"speaker": "sales", "content": "Dạ, lo ngại đó hợp lý. Anh muốn em gửi bộ hồ sơ pháp lý đầy đủ gồm {{legal.approval_doc}}, biên bản khởi công, và hợp đồng mẫu để anh cho luật sư xem trước khi đặt cọc không ạ? Đó là cách làm đúng nhất, không phải đặt cọc rồi mới đọc hồ sơ."},
    {"speaker": "note", "content": "Nếu khách nói lo tài chính chưa chắc"},
    {"speaker": "sales", "content": "Dạ, anh ơi, đặt cọc khi chưa chắc về tài chính là rủi ro thật sự. Để em ngồi tính lại bài toán tài chính với anh lần cuối trước khi mình quyết. Nếu con số không ổn thì anh không nên đặt cọc hôm nay."}
  ]'::jsonb,
  '[{"type": "never", "content": "KHÔNG BAO GIỜ khuyến khích khách đặt cọc khi họ còn chưa chắc về tài chính hoặc pháp lý. Đó là vi phạm nguyên tắc tư vấn tin cậy."}]'::jsonb,
  'Tư vấn viên khuyên khách không đặt cọc vội khi chưa chắc thường được khách tin tưởng hơn và thường bán được nhiều hơn trong dài hạn.',
  ARRAY['dat_coc', 'tin_hieu_mua', 'rui_ro', 'tu_van_tin_cay'],
  ARRAY['đặt cọc', 'đổi ý', 'lấy lại tiền', 'hợp đồng'],
  ARRAY['bds_pro'],
  ARRAY['b_024', 'b_032'],
  'Đặt cọc đổi ý lấy lại tiền hợp đồng pháp lý tài chính tư vấn tin cậy'),

-- TH 32: "Anh tư vấn có mua dự án này không?"
('b_032', 'TL02', 'B', 'Gặp trực tiếp và Tham quan', '"Anh tư vấn có mua dự án này không?"',
  'Em ơi, em có mua dự án này không?',
  ARRAY['3_TOUCH'], ARRAY[1, 4],
  'Đây là câu hỏi kiểm tra sự thành thật. Khách muốn biết liệu người đang tư vấn họ có thật sự tin vào sản phẩm mình đang bán không. Nếu tư vấn viên trả lời lảng tránh hoặc trả lời không tự nhiên, khách sẽ nhận ra ngay và tin tưởng sẽ giảm. Đây là câu hỏi đòi hỏi sự thành thật hoàn toàn, không cần kỹ thuật.',
  '{
    "surface": "Muốn biết tư vấn viên có đặt tiền theo lời mình nói không.",
    "middle": "Muốn tìm một điểm neo tin tưởng cuối cùng trước khi quyết định, cần biết người tư vấn có tin vào điều họ đang nói không.",
    "root": "Nếu ngay cả người bán cũng không mua thì tại sao họ nên mua?"
  }'::jsonb,
  '{
    "reflect": "Trả lời thật. Nếu đã mua hoặc đang cân nhắc mua, nói thật. Nếu chưa mua vì lý do tài chính hoặc lý do cá nhân khác, giải thích thật và rõ ràng.",
    "diq": "KHÔNG BAO GIỜ trả lời bịa. Câu trả lời thành thật, dù không phải câu trả lời lý tưởng, vẫn tốt hơn câu trả lời nghe hay nhưng không thật."
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "Em ơi, em có mua dự án này không?"},
    {"speaker": "note", "content": "Trường hợp 1: Nếu tư vấn viên thật sự đã đặt cọc hoặc đang cân nhắc"},
    {"speaker": "sales", "content": "Dạ, em đang cân nhắc một shophouse {{project.phase1_name}}, nhưng tài chính em cần sắp xếp thêm. Anh hỏi câu đó thì em trả lời thật: em tư vấn cái gì thì em sẵn sàng mua cái đó nếu tài chính cho phép. Dự án này em tin."},
    {"speaker": "note", "content": "Thật, ngắn, không phô trương."},
    {"speaker": "note", "content": "Trường hợp 2: Nếu tư vấn viên chưa mua vì lý do tài chính"},
    {"speaker": "sales", "content": "Dạ, em thành thật: em chưa mua vì tài chính cá nhân em đang dùng cho kế hoạch khác trước. Nhưng anh hỏi em có tin vào dự án này không thì em trả lời: tin. Em không tư vấn thứ gì mà em không tin. Anh muốn em giải thích cụ thể tại sao em tin không ạ?"},
    {"speaker": "note", "content": "Chuyển sang lý do cụ thể, không phải lời đảm bảo chung."},
    {"speaker": "note", "content": "Trường hợp 3: Nếu tư vấn viên chưa mua vì còn đang đánh giá"},
    {"speaker": "sales", "content": "Dạ, em thành thật: em đang theo dõi tiến độ thi công thêm một thời gian nữa trước khi quyết định. Em làm vậy không phải vì nghi ngờ dự án, mà vì đó là cách em đánh giá mọi khoản đầu tư của mình. Anh cũng có thể làm vậy nếu anh muốn, không cần phải quyết định hôm nay."}
  ]'::jsonb,
  '[]'::jsonb,
  'Câu hỏi này không có câu trả lời sai nếu câu trả lời đó là thật. Tư vấn viên mới thường sợ câu hỏi này vì nghĩ câu trả lời "chưa mua" sẽ làm khách mất tin. Thực tế ngược lại: câu trả lời thành thật, dù là chưa mua, thường tạo ra tin tưởng nhiều hơn câu trả lời nghe hay nhưng không chân thật.',
  ARRAY['cau_hoi_kiem_tra', 'thanh_that', 'vi_the_co_van', 'tin_tuong'],
  ARRAY['có mua không', 'tin không', 'thành thật', 'tư vấn viên'],
  ARRAY['bds_pro'],
  ARRAY['b_031', 'b_029'],
  'Tư vấn viên có mua không tin thành thật vị thế cố vấn tin tưởng');
