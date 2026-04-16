-- ============================================================
-- TL03: Phần C — Từ chối về giá (TH 23-32) — 10 tình huống
-- Universalized: data cụ thể thay bằng {{placeholder}}
-- Placeholder runtime filled bởi project_pack của user
-- ============================================================

-- ── TH 23: "Giá cao quá" ──
INSERT INTO public.scenarios (id, doc_ref, section_code, section_title, title, objection_verbatim,
  methodology_tools, active_stages, analysis, customer_psychology, approach, script, warnings,
  skills_required, tags, keywords, tier_access, related_ids, search_content)
VALUES (
  'th_023', 'TL03', 'C', 'Từ chối về giá', 'Giá cao quá',
  'Giá cao quá, anh thấy không hợp lý',
  ARRAY['REFLECT', 'DIQ'], ARRAY[2, 3],
  '"Giá cao quá" là câu phản xạ, không phải kết luận sau phân tích. Khách nói câu này thường không phải sau khi đã so sánh kỹ lưỡng. Họ nói vì đó là câu an toàn nhất để giữ khoảng cách khi chưa sẵn sàng quyết định. Lỗi cốt lõi của sales là xác nhận tiền đề rồi mới phản bác: câu "Dạ đúng là giá không rẻ, nhưng..." tự khóa sales vào thế bất lợi ngay từ đầu. Khách đã neo vào "không rẻ", phần còn lại trở thành biện hộ.',
  '{
    "surface": "Giá niêm yết vượt con số khách đang nghĩ đến.",
    "middle": "Chưa có cơ sở so sánh thực sự, hoặc đang dùng câu này để thăm dò phản ứng của sales.",
    "root": "Chưa thấy sản phẩm này là dành cho mình. Khi người ta thấy một thứ là của mình, \"cao\" biến thành \"làm sao để mua được\"."
  }'::jsonb,
  '{
    "reflect": "Đặt câu hỏi phản chiếu để làm rõ khách đang so sánh với gì, theo mục tiêu nào. Không giải thích bất cứ điều gì trước khi biết căn cứ của từ \"cao\".",
    "diq": "Khi khách đã nêu ra mục tiêu thật, đưa dữ liệu so sánh phù hợp với mục tiêu đó, rút ra hàm ý về tệp người mua cuối hoặc tốc độ tăng giá, đặt câu hỏi để khách tự rút ra kết luận."
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "Giá cao quá, anh thấy không hợp lý."},
    {"speaker": "sales", "content": "Dạ, anh đang hình dung giá hợp lý theo tiêu chí nào ạ, theo khu vực địa lý hay theo loại sản phẩm?"},
    {"speaker": "note", "content": "Chờ. Không gợi ý câu trả lời."},
    {"speaker": "khach", "content": "[Nêu một mức giá hoặc so sánh với dự án khác]"},
    {"speaker": "sales", "content": "Dạ, anh đang nhìn từ góc độ đầu tư hay mua để sử dụng ạ?"},
    {"speaker": "note", "content": "Chờ."},
    {"speaker": "sales", "content": "Em hỏi vì cùng một mức giá, tiêu chí đánh giá \"hợp lý\" của người đầu tư và người mua để ở khác nhau hoàn toàn. Anh đang tìm kiếm điều gì từ quyết định này ạ?"},
    {"speaker": "note", "content": "Chờ. REFLECT mở ra — chuyển sang DIQ khi khách trả lời."},
    {"speaker": "sales_diq", "content": "Dạ, theo số liệu {{market.data_source}}, BĐS {{project.segment}} tại {{project.area}} giai đoạn {{market.growth_period}} tăng khoảng {{market.growth_rate}} mỗi năm. So với lãi suất tiết kiệm đang quanh {{market.bank_rate}}, chi phí cơ hội của việc không vào lúc này là điều nhiều nhà đầu tư đang tính lại. Anh đã hình dung kỳ vọng tăng giá của mình trong 3 năm là bao nhiêu chưa ạ?"},
    {"speaker": "note", "content": "Chờ. Để khách tự đặt kỳ vọng và tự đánh giá."}
  ]'::jsonb,
  '[]'::jsonb,
  'Nắm số liệu thị trường có nguồn gốc để dùng trong bước DIQ. Kỹ năng quan trọng nhất là giữ im lặng sau câu hỏi REFLECT và không nhảy vào DIQ trước khi khách thực sự mở.',
  ARRAY['gia_ca', 'phan_xa', 'neo_tu_duy', 'chi_phi_co_hoi'],
  ARRAY['giá cao', 'không hợp lý', 'so sánh giá', 'đầu tư', 'sử dụng'],
  ARRAY['bds_pro'],
  ARRAY['th_024', 'th_025', 'th_028'],
  'Giá cao quá không hợp lý phản xạ phản chiếu tiền đề so sánh khu vực địa lý loại sản phẩm đầu tư sử dụng chi phí cơ hội tăng giá mỗi năm lãi suất tiết kiệm'
);

-- ── TH 24: "Dự án khác rẻ hơn" ──
INSERT INTO public.scenarios (id, doc_ref, section_code, section_title, title, objection_verbatim,
  methodology_tools, active_stages, analysis, customer_psychology, approach, script, warnings,
  skills_required, tags, keywords, tier_access, related_ids, search_content)
VALUES (
  'th_024', 'TL03', 'C', 'Từ chối về giá', 'Dự án khác rẻ hơn',
  'Anh xem dự án X bên cạnh cũng gần, giá chỉ bằng một nửa',
  ARRAY['REFLECT', 'DIQ'], ARRAY[2, 3],
  'Khách có "bằng chứng" cụ thể từ một dự án cạnh tranh và dùng đó làm neo. Nguy hiểm hơn TH 23 vì khách có cảm giác mình đang nắm phần thắng. Sales hay sập bẫy theo hai hướng: hoặc bắt đầu chứng minh dự án mình tốt hơn, hoặc nhượng bộ và tìm cách offer thêm. Cả hai đều tự xếp mình vào thế tranh luận về một kết luận khách chưa thực sự đưa ra. "Rẻ hơn" chỉ có nghĩa khi hai thứ đang phục vụ cùng một mục tiêu.',
  '{
    "surface": "Đang dùng dự án kia làm đòn bẩy, muốn ưu đãi tốt hơn hoặc tìm lý giải cho sự do dự của mình.",
    "middle": "Chưa phân biệt được hai thị trường khác nhau trong cùng khu vực địa lý. Đang so sánh bằng con số thay vì bằng mục tiêu.",
    "root": "Muốn cảm thấy mình ra quyết định thông minh. Nếu sales giúp họ tự nhận ra sự khác biệt, quyết định đó sẽ bền hơn bất kỳ lời thuyết phục nào."
  }'::jsonb,
  '{
    "reflect": "Không tranh luận, không so sánh trực tiếp. Hỏi để khách tự trả lời liệu hai dự án đó có phục vụ cùng tệp người mua cuối không.",
    "diq": "Khi khách thừa nhận chưa nghĩ đến điểm này, đưa dữ liệu về tệp người thuê và người mua lại của từng phân khúc, rút ra hàm ý về thanh khoản thứ cấp, hỏi khách tự đánh giá."
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "Anh xem dự án X ở khu bên cạnh cũng gần, giá chỉ bằng một nửa."},
    {"speaker": "sales", "content": "Dạ, anh đang kỳ vọng hai dự án đó mang lại kết quả giống nhau không ạ?"},
    {"speaker": "note", "content": "Chờ. Câu hỏi này đặt vấn đề về tính hợp lệ của so sánh mà không phán xét."},
    {"speaker": "sales", "content": "Dạ, anh có biết tệp người mua lại của dự án bên kia là ai không ạ? Và tệp đó có giống với người anh muốn bán lại hoặc cho thuê sau này không?"},
    {"speaker": "note", "content": "Chờ. Để khách tự nhận ra đây là hai thị trường khác nhau."},
    {"speaker": "sales_diq", "content": "Dạ, đó là điểm quan trọng nhất khi so sánh hai dự án. Theo khảo sát thực tế, tệp người thuê BĐS {{project.segment}} tại {{project.area}} đang dịch chuyển rõ ràng về phía {{rental.tenant_profile}}, nhóm này ưu tiên chất lượng và thương hiệu hơn vị trí. Anh thấy điều đó có ảnh hưởng đến giá cho thuê và thanh khoản thứ cấp của hai sản phẩm không ạ?"},
    {"speaker": "note", "content": "Chờ. Để khách tự rút ra kết luận, không áp đặt."}
  ]'::jsonb,
  '[{"type": "tone", "content": "Câu hỏi \"hai dự án đó mang lại kết quả giống nhau không\" phải được nói với giọng tò mò thật sự, không phải giọng dẫn dắt."}]'::jsonb,
  'Nắm rõ tệp người thuê và người mua lại thực tế của từng phân khúc BĐS để đặt đúng câu hỏi DIQ.',
  ARRAY['gia_ca', 'canh_tranh', 'so_sanh_du_an', 'tep_khach_hang'],
  ARRAY['dự án khác', 'rẻ hơn', 'so sánh', 'đối thủ', 'bên cạnh'],
  ARRAY['bds_pro'],
  ARRAY['th_023', 'th_028'],
  'Dự án khác rẻ hơn cạnh tranh đòn bẩy so sánh hai thị trường khác tệp người mua cuối thanh khoản thứ cấp'
);

-- ── TH 25: "Giá có giảm không, anh chờ giá xuống" ──
INSERT INTO public.scenarios (id, doc_ref, section_code, section_title, title, objection_verbatim,
  methodology_tools, active_stages, analysis, customer_psychology, approach, script, warnings,
  skills_required, tags, keywords, tier_access, related_ids, search_content)
VALUES (
  'th_025', 'TL03', 'C', 'Từ chối về giá', 'Giá có giảm không, anh chờ giá xuống',
  'Anh nghe nói giá BĐS sẽ giảm, chờ một thời gian rồi tính',
  ARRAY['REFLECT', 'DIQ'], ARRAY[2, 3],
  '"Chờ giá xuống" không phải chiến lược, đó là sự trì hoãn được đặt tên. Khách nói câu này thường không có mốc thời gian, không có mức giảm cụ thể, và không có kế hoạch hành động khi điều kiện đó xảy ra. Sales hay sập bẫy khi bắt đầu tranh luận về dự báo giá hoặc giải thích tại sao nên mua ngay. Điều cần phản chiếu không phải là dự báo giá, mà là bản thân kịch bản "chờ" đó có khả thi không trong thực tế.',
  '{
    "surface": "Muốn giá tốt hơn và đang đặt cược vào một kịch bản tương lai.",
    "middle": "Chưa sẵn sàng quyết định và cần một lý do nghe có vẻ hợp lý để trì hoãn. \"Chờ giá xuống\" là lý do đó.",
    "root": "Sợ ra quyết định sai hơn là sợ mất cơ hội. Cần một khung tư duy giúp cảm thấy quyết định dựa trên lý trí, không phải cảm tính."
  }'::jsonb,
  '{
    "reflect": "Làm rõ kịch bản chờ đợi của khách: chờ điều gì cụ thể, bao lâu, bao nhiêu phần trăm. Khi khách phải trả lời cụ thể, họ thường tự nhận ra kịch bản đó chưa bao giờ rõ ràng trong đầu họ.",
    "diq": "Khi khách đã bắt đầu mở, đưa dữ liệu về chi phí cơ hội của việc chờ, rút ra hàm ý so sánh kỳ vọng giảm giá với thực tế thị trường, hỏi để khách tự đánh giá bài toán tổng thể."
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "Anh nghe nói giá BĐS sẽ giảm, chờ một thời gian rồi tính."},
    {"speaker": "sales", "content": "Dạ, anh đang hình dung kịch bản đó cụ thể như thế nào ạ, giảm bao nhiêu phần trăm, trong bao lâu?"},
    {"speaker": "note", "content": "Chờ. Không giải thích gì thêm cho đến khi khách trả lời."},
    {"speaker": "sales", "content": "Dạ, giả sử giá giảm đúng mức anh kỳ vọng, lúc đó anh sẽ quyết định ngay không ạ, hay vẫn còn điều kiện nào khác cần kiểm tra?"},
    {"speaker": "note", "content": "Chờ. Câu này lộ ra rằng giá thường không phải rào cản duy nhất."},
    {"speaker": "sales_diq", "content": "Dạ, có một điểm về chi phí cơ hội mà nhiều người chưa tính. Nếu vốn đang để tiết kiệm ở mức {{market.bank_rate}}/năm và dự án tăng khoảng {{market.growth_rate}}/năm theo mặt bằng BĐS {{project.segment}} tại {{project.area}} giai đoạn vừa rồi, thì mỗi năm chờ tương đương một khoản chênh lệch lớn. Anh thấy con số đó có đáng để đặt vào bài toán không ạ?"},
    {"speaker": "note", "content": "Chờ. Để khách tự đánh giá, không áp đặt kết luận."}
  ]'::jsonb,
  '[{"type": "never_say", "content": "Không bao giờ nói \"giá này là thấp nhất rồi, sau sẽ tăng\". Đây là áp lực giả tạo, khách nhận ra ngay và mất tin tưởng. Nếu có chính sách ưu đãi giai đoạn 1 thực sự, trả lời thẳng vào chính sách đó và gửi văn bản cụ thể."}]'::jsonb,
  'Nắm số liệu tăng giá có nguồn gốc và lãi suất tiết kiệm hiện tại để dùng trong bước DIQ. Kỹ năng quan trọng là không nhảy vào DIQ quá sớm khi khách chưa thật sự mở.',
  ARRAY['gia_ca', 'tri_hoan', 'cho_doi', 'chi_phi_co_hoi'],
  ARRAY['giá giảm', 'chờ giá xuống', 'trì hoãn', 'dự báo giá', 'chi phí cơ hội'],
  ARRAY['bds_pro'],
  ARRAY['th_023', 'th_029'],
  'Giá giảm chờ xuống trì hoãn kịch bản chờ đợi dự báo lãi suất tiết kiệm chi phí cơ hội tăng giá'
);

-- ── TH 26: "Cho đặt cọc giữ chỗ rồi tính" ──
INSERT INTO public.scenarios (id, doc_ref, section_code, section_title, title, objection_verbatim,
  methodology_tools, active_stages, analysis, customer_psychology, approach, script, warnings,
  skills_required, tags, keywords, tier_access, related_ids, search_content)
VALUES (
  'th_026', 'TL03', 'C', 'Từ chối về giá', 'Cho đặt cọc giữ chỗ rồi tính',
  'Thôi cho anh đặt cọc giữ chỗ cái đã, rồi tính',
  ARRAY['REFLECT'], ARRAY[2, 3],
  'Khách đang dùng cọc như công cụ trì hoãn quyết định thật. Họ nghĩ đặt cọc là bước an toàn: giữ chỗ trước, tính sau. Nhưng cọc là cam kết pháp lý, không phải vé giữ chỗ. Sales đồng ý cho đặt cọc khi khách chưa thực sự quyết định là đang để khách bước vào một tình huống họ chưa hiểu rõ hậu quả. Đây không phải tình huống bán hàng, đây là tình huống bảo vệ khách.',
  '{
    "surface": "Muốn giữ chỗ trong khi còn thời gian suy nghĩ thêm.",
    "middle": "Sợ mất cơ hội nhưng chưa sẵn sàng cam kết. Đặt cọc là cách giải quyết cả hai mối lo đó cùng lúc trong tư duy của họ.",
    "root": "Còn điều gì chưa chắc chắn, và đôi khi chính họ cũng chưa biết đó là điều gì. Làm rõ điều đó trước khi đặt cọc mới là điều một cố vấn tin cậy cần làm."
  }'::jsonb,
  '{
    "reflect": "Xác nhận để khách hiểu rõ cọc là bước xác nhận quyết định, không phải bước thăm dò. Hỏi thẳng còn băn khoăn ở đâu, vì câu trả lời đó mới là cuộc trò chuyện thực sự cần có.",
    "diq": "Chỉ áp dụng nếu khách nêu ra lo ngại cụ thể sau khi được hỏi. Từ đó mới xử lý từng điểm và dẫn đến quyết định đặt cọc thực sự."
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "Thôi cho anh đặt cọc giữ chỗ cái đã, rồi tính."},
    {"speaker": "sales", "content": "Dạ, em muốn xác nhận lại với anh một chút: cọc là bước xác nhận quyết định mua, không phải bước để suy nghĩ thêm. Anh đã chắc về quyết định này chưa ạ?"},
    {"speaker": "note", "content": "Chờ."},
    {"speaker": "sales_if_unsure", "content": "Dạ, vậy thì mình làm rõ điều anh còn băn khoăn trước sẽ tốt hơn là đặt cọc rồi mới tính. Vì nếu anh đặt cọc mà sau đó quyết định không mua, cả hai bên đều có phức tạp không cần thiết. Anh đang còn vướng ở điểm nào ạ?"},
    {"speaker": "note", "content": "Chờ. Đây là câu quan trọng nhất, thường mở ra lo ngại thật mà khách chưa nói thẳng."},
    {"speaker": "sales_if_sure", "content": "Dạ tốt quá anh. Để em chuẩn bị thủ tục cọc chính thức theo quy trình chủ đầu tư, em gửi anh xem qua các điều khoản cần lưu ý trước khi ký nhé."}
  ]'::jsonb,
  '[]'::jsonb,
  'Tự tin đủ để nói thẳng rằng cọc là cam kết, không phải lựa chọn tạm thời. Đây là lúc vị thế cố vấn thể hiện rõ nhất: bảo vệ khách khỏi quyết định họ chưa sẵn sàng thực hiện, kể cả khi điều đó làm chậm quá trình bán hàng.',
  ARRAY['dat_coc', 'tri_hoan', 'bao_ve_khach', 'vi_the_co_van'],
  ARRAY['đặt cọc', 'giữ chỗ', 'cam kết', 'chưa chắc'],
  ARRAY['bds_pro'],
  ARRAY['th_025', 'th_031'],
  'Đặt cọc giữ chỗ cam kết pháp lý trì hoãn quyết định băn khoăn vị thế cố vấn bảo vệ khách'
);

-- ── TH 27: "Vinhomes/CĐT hay tăng giá nhanh, mua xong bị hớ" ──
INSERT INTO public.scenarios (id, doc_ref, section_code, section_title, title, objection_verbatim,
  methodology_tools, active_stages, analysis, customer_psychology, approach, script, warnings,
  skills_required, tags, keywords, tier_access, related_ids, search_content)
VALUES (
  'th_027', 'TL03', 'C', 'Từ chối về giá', 'CĐT hay tăng giá nhanh, mua xong bị hớ',
  'Anh nghe nói {{project.developer}} hay tăng giá nhanh, mua xong là bị hớ',
  ARRAY['REFLECT', 'DIQ'], ARRAY[2, 3],
  'Khách đang nhầm lẫn giữa hai khái niệm hoàn toàn khác nhau: giá niêm yết của chủ đầu tư và giá thị trường thứ cấp. Khi chủ đầu tư tăng giá giai đoạn sau, đó là xác nhận giá giai đoạn trước thấp hơn, có nghĩa người mua sớm đang được lợi. "Bị hớ" có nghĩa ngược lại: giá mình mua cao hơn giá thị trường sau đó. Lỗi của sales là xác nhận tiền đề nhầm lẫn rồi mới giải thích, củng cố ngay sự nhầm lẫn đó trước khi kịp nói bất cứ điều gì có ý nghĩa.',
  '{
    "surface": "Sợ mua đúng đỉnh, giá rớt xuống sau khi ký hợp đồng.",
    "middle": "Đang nhầm lẫn giữa hai loại rủi ro giá, hoặc đã nghe câu chuyện của ai đó mua BĐS bị lỗ nhưng không biết bối cảnh thực sự.",
    "root": "Cần một khung tư duy đúng để tự đánh giá, không phải thêm thông tin. Khi hiểu được logic, họ tự đánh giá được rủi ro."
  }'::jsonb,
  '{
    "reflect": "Tách biệt hai khái niệm bằng câu hỏi, không bằng giải thích. Để khách tự nhận ra logic: tăng giá giai đoạn sau có lợi cho người đã mua giai đoạn trước.",
    "diq": "Khi khách bắt đầu nghi ngờ nhận định của mình, đưa dữ liệu lịch sử giá thứ cấp của các dự án đã bàn giao để khách tự đối chiếu."
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "Anh nghe nói {{project.developer}} hay tăng giá nhanh, mua xong là bị hớ."},
    {"speaker": "sales", "content": "Dạ, anh đang hiểu bị hớ theo nghĩa nào ạ, giá thị trường xuống dưới giá mình mua vào, hay chủ đầu tư tăng giá niêm yết giai đoạn sau?"},
    {"speaker": "note", "content": "Chờ. Câu này tách biệt hai khái niệm mà không phán xét."},
    {"speaker": "sales", "content": "Dạ, nếu chủ đầu tư tăng giá giai đoạn sau, người đã mua giai đoạn trước bị ảnh hưởng thế nào theo anh?"},
    {"speaker": "note", "content": "Chờ. Không gợi ý câu trả lời."},
    {"speaker": "sales", "content": "Dạ, tăng giá giai đoạn sau có nghĩa là chủ đầu tư đang xác nhận giá giai đoạn trước thấp hơn. Người mua sớm đang hưởng phần chênh lệch đó, không phải ngược lại. Anh thấy logic đó có đúng không ạ?"},
    {"speaker": "note", "content": "Chờ."},
    {"speaker": "sales_diq", "content": "Dạ, anh biết {{comparables.0.name}} {{comparables.0.note}} không ạ? Đó là ví dụ điển hình nhất về điều em vừa nói. {{project.developer}} đã từng có dự án nào giá thứ cấp xuống dưới giá giai đoạn 1 trong 5 năm chưa ạ?"},
    {"speaker": "note", "content": "Chờ. Để khách tự trả lời và tự đối chiếu."}
  ]'::jsonb,
  '[]'::jsonb,
  'Nắm chắc số liệu giá thứ cấp của ít nhất hai đến ba dự án CĐT đã bàn giao. Không đưa số liệu khi chưa đến bước DIQ.',
  ARRAY['gia_ca', 'rui_ro', 'gia_thu_cap', 'tang_gia'],
  ARRAY['tăng giá', 'bị hớ', 'đỉnh giá', 'giá thứ cấp', 'chủ đầu tư'],
  ARRAY['bds_pro'],
  ARRAY['th_023', 'th_025'],
  'CĐT chủ đầu tư tăng giá bị hớ giá thứ cấp niêm yết giai đoạn mua sớm chênh lệch'
);

-- ── TH 28: "Giá/m2 quá cao so với khu vực truyền thống" ──
INSERT INTO public.scenarios (id, doc_ref, section_code, section_title, title, objection_verbatim,
  methodology_tools, active_stages, analysis, customer_psychology, approach, script, warnings,
  skills_required, tags, keywords, tier_access, related_ids, search_content)
VALUES (
  'th_028', 'TL03', 'C', 'Từ chối về giá', 'Giá/m2 quá cao so với khu vực truyền thống',
  'BĐS {{project.area}} giao dịch ở mức thấp hơn nhiều, sao dự án này cao thế',
  ARRAY['REFLECT', 'DIQ'], ARRAY[2, 3],
  'So sánh này không cùng hệ quy chiếu. BĐS phổ thông trong khu vực và sản phẩm cao cấp tại cùng địa lý không cạnh tranh với nhau vì phục vụ hai tệp người mua cuối hoàn toàn khác nhau. So sánh giá của hai thứ này giống như so sánh giá phòng khách sạn 5 sao với phòng trọ trong cùng thành phố: cùng địa lý, khác thị trường.',
  '{
    "surface": "Thấy giá quá cao so với mặt bằng BĐS khu vực họ đã biết.",
    "middle": "Chưa phân biệt được hai phân khúc thị trường trong cùng khu vực địa lý. Đang dùng giá làm thước đo duy nhất.",
    "root": "Cần hiểu rõ mình đang mua vào thị trường nào và người mua cuối là ai, vì đó quyết định thanh khoản và khả năng sinh lời thực sự."
  }'::jsonb,
  '{
    "reflect": "Đặt câu hỏi để khách tự nhận ra hai sản phẩm này không có cùng người mua cuối, do đó so sánh giá không có ý nghĩa.",
    "diq": "Khi khách thừa nhận chưa nghĩ đến tệp người mua cuối, đưa dữ liệu về tệp khách thuê và mua lại thực tế của từng phân khúc, rút ra hàm ý về thanh khoản và tốc độ tăng giá, hỏi khách tự đánh giá."
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "BĐS {{project.area}} giao dịch ở mức thấp hơn nhiều, sao dự án này cao thế."},
    {"speaker": "sales", "content": "Dạ, anh đang hình dung hai loại sản phẩm đó bán cho cùng một tệp người mua không ạ?"},
    {"speaker": "note", "content": "Chờ."},
    {"speaker": "sales", "content": "Dạ, người mua BĐS phổ thông ở {{project.area}} và người mua sản phẩm {{project.segment}} tại đây thường là hai tệp hoàn toàn khác nhau. Anh thấy người sẽ mua lại hoặc thuê hai loại đó là ai ạ?"},
    {"speaker": "note", "content": "Chờ."},
    {"speaker": "sales_diq", "content": "Dạ, theo thực tế thị trường, tệp khách thuê {{project.segment}} đang là {{rental.tenant_profile}}, với giá thuê thực tế từ {{rental.range}}. Trong khi BĐS phổ thông ở cùng khu vực phục vụ tệp khách địa phương với giá thuê thấp hơn nhiều. Nếu hai tệp đó khác nhau, thì tỷ suất cho thuê và thanh khoản thứ cấp cũng sẽ khác nhau. Anh đang kỳ vọng điều gì nhất từ khoản đầu tư này ạ?"},
    {"speaker": "note", "content": "Câu hỏi cuối chuyển hướng về mục tiêu thực sự của khách."}
  ]'::jsonb,
  '[]'::jsonb,
  'Nắm rõ giá thuê thực tế của từng phân khúc BĐS tại khu vực và biết cách diễn đạt sự khác biệt bằng ngôn ngữ đơn giản. Kỹ năng quan trọng nhất là không tỏ ra đang bào chữa, mà tỏ ra đang giúp khách nhìn rõ hơn.',
  ARRAY['gia_ca', 'so_sanh_khu_vuc', 'phan_khuc', 'tep_khach'],
  ARRAY['giá m2', 'quá cao', 'khu vực', 'truyền thống', 'phân khúc'],
  ARRAY['bds_pro'],
  ARRAY['th_023', 'th_024'],
  'Giá m2 quá cao khu vực truyền thống phân khúc tệp người mua cuối thanh khoản cho thuê khác nhau'
);

-- ── TH 29: "Không đủ tiền / Vốn không đủ" ──
INSERT INTO public.scenarios (id, doc_ref, section_code, section_title, title, objection_verbatim,
  methodology_tools, active_stages, analysis, customer_psychology, approach, script, warnings,
  skills_required, tags, keywords, tier_access, related_ids, search_content)
VALUES (
  'th_029', 'TL03', 'C', 'Từ chối về giá', 'Không đủ tiền / Vốn không đủ',
  'Anh không có đủ vốn để mua',
  ARRAY['REFLECT', 'DIQ'], ARRAY[2, 3],
  '"Không đủ tiền" và "chưa thấy đáng để xoay" là hai tình huống hoàn toàn khác nhau nhưng nghe giống hệt nhau. Nếu khách thực sự không có vốn, tiếp tục cuộc trò chuyện là lãng phí thời gian của cả hai. Nếu khách có vốn nhưng chưa có động lực xoay, đây là cuộc trò chuyện về kênh đầu tư, không phải về khả năng tài chính. Sales cần phân loại trước khi đi tiếp.',
  '{
    "surface": "Nói không có vốn để kết thúc hoặc tránh phải quyết định.",
    "middle": "Có thể đang giữ tiền ở ngân hàng, chứng khoán, vàng và chưa thấy lý do rõ ràng để chuyển dịch sang BĐS.",
    "root": "Cần thấy rằng giải pháp này phục vụ mục tiêu tài chính của họ, không phải mình đang bị bán cho bằng được."
  }'::jsonb,
  '{
    "reflect": "Một câu hỏi về kênh giữ vốn hiện tại của khách sẽ nhanh chóng phân biệt hai nhóm. Với nhóm không có vốn thật, sắp xếp lộ nuôi dưỡng và dừng lại. Không tiêu hơn hai đến ba câu để phân loại.",
    "diq": "Chỉ áp dụng với nhóm có vốn nhưng chưa có động lực. Đưa dữ liệu so sánh hiệu suất kênh đang giữ với cơ hội BĐS, rút ra hàm ý về chi phí cơ hội, hỏi khách tự đánh giá."
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "Anh không có đủ vốn để mua."},
    {"speaker": "sales", "content": "Dạ, anh đang để phần vốn đó ở đâu là chủ yếu ạ?"},
    {"speaker": "note", "content": "Chờ. Câu này ngắn, tự nhiên và phân loại được khách ngay lập tức."},
    {"speaker": "sales_if_savings", "content": "Dạ, anh đang hưởng lãi suất khoảng bao nhiêu ạ?"},
    {"speaker": "note", "content": "Chờ."},
    {"speaker": "sales", "content": "Dạ, mức đó có đang đáp ứng được kỳ vọng của anh không, hay anh cũng đang để ý xem có kênh nào tốt hơn?"},
    {"speaker": "note", "content": "Chờ. REFLECT mở ra — chuyển sang DIQ khi khách bắt đầu mở."},
    {"speaker": "sales_diq", "content": "Dạ, lãi suất tiết kiệm 12 tháng hiện tại đang quanh {{market.bank_rate}}. Trong khi mặt bằng tăng giá BĐS {{project.segment}} tại {{project.area}} theo {{market.data_source}} giai đoạn {{market.growth_period}} là khoảng {{market.growth_rate}} mỗi năm. Câu hỏi thật sự không phải anh có đủ vốn không, mà là cơ cấu nào giữa giữ nguyên, phân bổ một phần, hay dùng đòn bẩy là tối ưu nhất với hoàn cảnh của anh. Anh muốn mình ngồi tính thử một kịch bản cụ thể, khoảng 30 phút thôi?"},
    {"speaker": "note", "content": "Chốt lịch hẹn, không chốt mua."},
    {"speaker": "sales_if_no_capital", "content": "Dạ, vậy thời điểm này có thể chưa phù hợp để bàn cụ thể. Em vẫn giữ liên lạc và cập nhật thông tin theo tiến độ dự án để khi anh sẵn sàng thì mình có đủ thông tin để quyết định."}
  ]'::jsonb,
  '[]'::jsonb,
  'Kỹ năng quan trọng nhất là tốc độ phân loại: không tiêu hơn hai đến ba câu để xác định khách thuộc nhóm nào. Với khách lạnh, biết dừng đúng lúc cũng là kỹ năng chuyên nghiệp, không phải thất bại.',
  ARRAY['tai_chinh', 'von', 'phan_loai_khach', 'don_bay'],
  ARRAY['không đủ tiền', 'thiếu vốn', 'không có tiền', 'lãi suất', 'tiết kiệm'],
  ARRAY['bds_pro'],
  ARRAY['th_025', 'th_031'],
  'Không đủ tiền vốn lãi suất tiết kiệm chứng khoán vàng phân loại khách đòn bẩy ngân hàng chi phí cơ hội'
);

-- ── TH 30: "Phí dịch vụ / phí hàng năm quá cao" ──
INSERT INTO public.scenarios (id, doc_ref, section_code, section_title, title, objection_verbatim,
  methodology_tools, active_stages, analysis, customer_psychology, approach, script, warnings,
  skills_required, tags, keywords, tier_access, related_ids, search_content)
VALUES (
  'th_030', 'TL03', 'C', 'Từ chối về giá', 'Phí dịch vụ / phí hàng năm quá cao',
  'Phí dịch vụ hàng năm cao vậy thì lo gì',
  ARRAY['REFLECT', 'DIQ'], ARRAY[2, 3],
  'Khi khách bắt đầu hỏi về phí vận hành, đây là tín hiệu tốt: họ đang tính toán nghiêm túc. Câu hỏi thực sự khách đang đặt ra không phải "phí có hợp lý không", mà là "tổng chi phí sở hữu có sinh ra tiền hay không". Sales hay xử lý sai bằng cách giải thích tại sao phí đó xứng đáng, trong khi điều cần làm là chuyển hướng khách từ việc nhìn phí như khoản chi sang nhìn vào bài toán dòng tiền tổng thể.',
  '{
    "surface": "Thấy phí hàng năm cao hơn kỳ vọng.",
    "middle": "Lo phí sẽ ăn vào lợi nhuận cho thuê hoặc làm tăng chi phí sở hữu tổng thể.",
    "root": "Cần thấy rằng sau khi tính đủ mọi chi phí, sản phẩm này vẫn tạo ra dòng tiền dương hoặc lợi nhuận thực. Nếu thấy được điều đó, phí không còn là vấn đề."
  }'::jsonb,
  '{
    "reflect": "Làm rõ lo ngại thực sự: đang lo phí ăn vào lợi nhuận cho thuê, hay đang so sánh với chi phí vận hành của loại BĐS khác. Hai lo ngại đó xử lý khác nhau hoàn toàn.",
    "diq": "Đưa dữ liệu thực tế về giá cho thuê của phân khúc và cơ cấu phí, rút ra hàm ý rằng phí dịch vụ thường được phân bổ vào giá thuê, hỏi khách tự tính dòng tiền ròng."
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "Phí dịch vụ hàng năm nghe nói khoảng {{fees.service_annual}}, vậy thì lo gì."},
    {"speaker": "sales", "content": "Dạ, anh đang lo phí đó ăn vào lợi nhuận cho thuê, hay đang so sánh với chi phí vận hành của loại BĐS khác ạ?"},
    {"speaker": "note", "content": "Chờ. Câu này làm rõ lo ngại thực sự trước khi đi tiếp."},
    {"speaker": "sales_if_rental", "content": "Dạ, anh đang hình dung giá cho thuê của loại sản phẩm này là khoảng bao nhiêu ạ?"},
    {"speaker": "note", "content": "Chờ."},
    {"speaker": "sales_diq", "content": "Dạ, theo thực tế thị trường, phân khúc này đang cho thuê từ {{rental.range}}, tùy vị trí và diện tích. {{fees.service_note}} Nếu mình tính dòng tiền ròng sau khi trừ phí, anh muốn em làm bảng tính cụ thể không ạ?"},
    {"speaker": "sales_if_compare", "content": "Dạ, anh có tính đủ các chi phí vận hành của loại BĐS đó chưa ạ, bao gồm bảo trì, sửa chữa định kỳ, an ninh? Khi tính hết trên một m2, hai loại có còn chênh nhiều không anh?"},
    {"speaker": "note", "content": "Chờ. Để khách tự tính toán thay vì sales kết luận thay."}
  ]'::jsonb,
  '[]'::jsonb,
  'Có sẵn bảng tính dòng tiền cho thuê cụ thể với từng loại sản phẩm, bao gồm phí dịch vụ, để chia sẻ ngay khi khách cần. Số liệu cụ thể luôn thuyết phục hơn lập luận chung.',
  ARRAY['phi_dich_vu', 'chi_phi_so_huu', 'dong_tien'],
  ARRAY['phí dịch vụ', 'phí hàng năm', 'phí cao', 'chi phí vận hành'],
  ARRAY['bds_pro'],
  ARRAY['th_029', 'th_031'],
  'Phí dịch vụ hàng năm cao chi phí vận hành bảo trì dòng tiền ròng cho thuê lợi nhuận'
);

-- ── TH 31: "Chính sách thanh toán không linh hoạt" ──
INSERT INTO public.scenarios (id, doc_ref, section_code, section_title, title, objection_verbatim,
  methodology_tools, active_stages, analysis, customer_psychology, approach, script, warnings,
  skills_required, tags, keywords, tier_access, related_ids, search_content)
VALUES (
  'th_031', 'TL03', 'C', 'Từ chối về giá', 'Chính sách thanh toán không linh hoạt',
  'Chính sách thanh toán nghe cũng khá chặt, không linh hoạt',
  ARRAY['REFLECT', 'DIQ'], ARRAY[2, 3],
  'Khách có vốn nhưng muốn giãn dòng tiền. Đây không phải vấn đề khả năng tài chính mà là vấn đề cơ cấu vốn cá nhân: họ có tiền nhưng đang để ở kỳ hạn, trong chứng khoán, hoặc muốn giữ thanh khoản. Phần lớn sales nhảy ngay vào giới thiệu Phương án A, B mà không hỏi xem khách cần giãn vì lý do gì cụ thể. Khi không biết lý do cụ thể, mọi giải pháp đưa ra đều có thể trật.',
  '{
    "surface": "Muốn phương thức thanh toán linh hoạt hơn so với chính sách hiện tại.",
    "middle": "Có vốn nhưng đang để ở kỳ hạn hoặc cần thời gian xoay từ các kênh khác. Muốn biết liệu có phương án nào khớp với lịch vốn của mình không.",
    "root": "Muốn mua, và nếu có giải pháp cụ thể khớp với tình hình của họ, họ sẽ quyết định. Rào cản không phải thiếu vốn, mà là chưa thấy giải pháp phù hợp."
  }'::jsonb,
  '{
    "reflect": "Hỏi về cơ cấu vốn thực tế và lý do cần giãn. Phân biệt ngay hai nhu cầu khác nhau: giãn thời gian thanh toán hay giảm lượng vốn cần có ngay.",
    "diq": "Khi biết rõ cơ cấu vốn của khách, đưa phương án cụ thể với bảng tính thực tế, không trình bày bằng lời. Luôn chuyển từ lời nói sang số liệu cụ thể cho từng trường hợp."
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "Chính sách thanh toán nghe cũng khá chặt, không linh hoạt."},
    {"speaker": "sales", "content": "Dạ, anh muốn linh hoạt theo hướng nào ạ, giãn thời gian thanh toán hay giảm lượng vốn cần có ngay?"},
    {"speaker": "note", "content": "Chờ. Câu này phân biệt ngay hai loại nhu cầu khác nhau."},
    {"speaker": "sales", "content": "Dạ, anh đang để vốn ở đâu là chủ yếu, và lịch có thể xoay được là khi nào ạ?"},
    {"speaker": "note", "content": "Chờ. Hiểu cơ cấu vốn thực tế trước khi đề xuất giải pháp."},
    {"speaker": "sales_diq", "content": "Dạ, Phương án giãn 36 tháng có thể phù hợp với lịch đó. Để em làm bảng tính cụ thể với từng mốc thanh toán, ghép với lịch đáo hạn của anh, để mình thấy điểm nào cần sắp xếp thêm không ạ?"},
    {"speaker": "sales_if_need_more", "content": "Dạ, có thể kết hợp đòn bẩy ngân hàng cho phần còn lại. Em tính thử tổng chi phí lãi phải trả hàng tháng, so với dòng tiền cho thuê dự kiến, để anh thấy bài toán tổng thể trước khi quyết định nhé."}
  ]'::jsonb,
  '[]'::jsonb,
  'Thuần thục Phương án A và B, nắm rõ lãi suất ngân hàng đối tác hiện tại, có thể lập bảng tính dòng tiền cụ thể ngay trong hoặc ngay sau cuộc gặp. Trình bày bằng bảng tính luôn thuyết phục hơn trình bày bằng lời.',
  ARRAY['thanh_toan', 'co_cau_von', 'don_bay', 'linh_hoat'],
  ARRAY['thanh toán', 'linh hoạt', 'giãn', 'đòn bẩy', 'ngân hàng'],
  ARRAY['bds_pro'],
  ARRAY['th_029', 'th_030'],
  'Chính sách thanh toán linh hoạt giãn cơ cấu vốn đòn bẩy ngân hàng lãi suất bảng tính dòng tiền'
);

-- ── TH 32: "Chiết khấu bao nhiêu / Sales khác offer tốt hơn" ──
INSERT INTO public.scenarios (id, doc_ref, section_code, section_title, title, objection_verbatim,
  methodology_tools, active_stages, analysis, customer_psychology, approach, script, warnings,
  skills_required, tags, keywords, tier_access, related_ids, search_content)
VALUES (
  'th_032', 'TL03', 'C', 'Từ chối về giá', 'Chiết khấu bao nhiêu / Sales khác offer tốt hơn',
  'Bên sales khác nói có thể hỗ trợ thêm chiết khấu, sao em không làm được',
  ARRAY['REFLECT', 'DIQ'], ARRAY[2, 3],
  'Đây là tình huống mà sales tự thua trước khi bắt đầu nếu để cuộc trò chuyện xoay quanh chiết khấu. Khi khách dùng "bên kia offer tốt hơn" như đòn bẩy, họ đang mặc định rằng mọi tư vấn viên đều như nhau và thứ duy nhất khác nhau là con số. Nếu sales chấp nhận tiền đề đó và bắt đầu cạnh tranh bằng chiết khấu, họ vừa tự xếp mình vào hàng hóa thay thế được, vừa mất đi thứ duy nhất không ai có thể mua được: uy tín và vị thế cố vấn. Người sẵn sàng cắt hết những gì mình xứng đáng nhận ngay từ đầu thường cũng là người đầu tiên không còn mặn mà khi khách cần hỗ trợ sau này. BĐS không kết thúc lúc ký hợp đồng, và khách hiểu điều đó hơn ai hết.',
  '{
    "surface": "Muốn ưu đãi tốt nhất có thể và đang dùng đòn bẩy cạnh tranh.",
    "middle": "Chưa thấy sự khác biệt rõ ràng giữa các tư vấn viên. Khi mọi người trông có vẻ như nhau, giá là thứ dễ so nhất. Đây không phải lỗi của khách.",
    "root": "Không thực sự muốn mức chiết khấu cao nhất. Muốn cảm thấy mình được đối xử tốt nhất và ra quyết định đúng. Hai điều đó không giống nhau."
  }'::jsonb,
  '{
    "reflect": "Không cạnh tranh chiết khấu, không phòng thủ. Đặt câu hỏi để khách tự nhìn lại điều họ thực sự đang tìm kiếm từ giao dịch này: một con số ở thời điểm ký hợp đồng, hay sự đồng hành trong suốt quá trình sau đó.",
    "diq": "Chia sẻ quan điểm làm nghề thẳng thắn và có trọng lượng, không nài nỉ. Đưa dẫn chứng từ thực tế: khách hàng tìm đến sau khi gặp vấn đề với giao dịch trước vì người tư vấn lúc đầu đã biến mất. Hỏi khách tự định nghĩa điều họ cần trong dài hạn."
  }'::jsonb,
  '[
    {"speaker": "khach", "content": "Bên sales khác nói có thể hỗ trợ thêm chiết khấu, sao em không làm được?"},
    {"speaker": "sales", "content": "Dạ, anh cho em hỏi thẳng một chút: anh đang tìm người hỗ trợ anh tốt nhất trong giao dịch này, hay đang tìm mức chiết khấu cao nhất?"},
    {"speaker": "note", "content": "Chờ."},
    {"speaker": "sales", "content": "Em hỏi vì hai điều đó khác nhau khá nhiều. Người sẵn sàng cắt hết những gì họ xứng đáng nhận ngay từ đầu thường cũng là người đầu tiên không còn mặn mà khi anh cần hỗ trợ sau này. BĐS không kết thúc lúc ký hợp đồng, anh biết điều đó hơn em."},
    {"speaker": "note", "content": "Chờ. Không vội giải thích thêm."},
    {"speaker": "sales_diq", "content": "Dạ, có những khách hàng tìm đến em sau khi gặp vấn đề với giao dịch trước, vì người tư vấn lúc đầu sau khi hoa hồng không còn thì cũng không còn ở đó nữa. Em không phán xét ai, nhưng đó là lý do em giữ nguyên tắc này. Anh thấy trong quá trình từ lúc đặt cọc đến lúc bàn giao và sau bàn giao, điều anh cần nhất từ người tư vấn là gì ạ?"},
    {"speaker": "note", "content": "Chờ. Câu hỏi này chuyển hướng hoàn toàn khỏi chiết khấu về điều khách thực sự quan tâm."},
    {"speaker": "sales_if_verify", "content": "Dạ, con số đó có thể đến từ chính sách kết hợp nào đó anh chưa rõ, hoặc có sự nhầm lẫn về chính sách. Để em xác minh lại cụ thể và phản hồi anh. Em không muốn anh ra quyết định dựa trên thông tin chưa được kiểm chứng."}
  ]'::jsonb,
  '[{"type": "tone", "content": "Toàn bộ kịch bản này cần được nói bằng giọng bình tĩnh và có trọng lượng, không phải giọng phòng thủ hay phàn nàn. Đây là quan điểm làm nghề, không phải lời biện hộ. Sales giữ được vị thế này thì câu hỏi cuối cùng sẽ tự nhiên và có sức mạnh."}]'::jsonb,
  'Có danh sách cụ thể những gì mình mang lại ngoài giá: bài toán tài chính cá nhân hóa, kết nối ngân hàng, hỗ trợ cho thuê sau bàn giao, đồng hành xuyên suốt quá trình pháp lý. Quan trọng hơn, sales cần thực sự sống đúng những gì mình nói: khách hàng cũ chính là bằng chứng thuyết phục nhất cho vị thế cố vấn tin cậy.',
  ARRAY['chiet_khau', 'canh_tranh_sales', 'vi_the_co_van', 'dong_hanh'],
  ARRAY['chiết khấu', 'sales khác', 'offer', 'cạnh tranh', 'hoa hồng'],
  ARRAY['bds_pro'],
  ARRAY['th_023', 'th_024'],
  'Chiết khấu sales khác offer tốt hơn cạnh tranh đòn bẩy vị thế cố vấn tin cậy đồng hành sau bàn giao'
);
