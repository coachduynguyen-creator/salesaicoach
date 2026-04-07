// ============================================================
// NỘI DUNG BÀI HỌC — THE TRUSTED ADVISOR
// Mỗi section con = 1 bài học riêng trong thư viện đào tạo
// ============================================================

export type LessonCategory = 'tl1' | 'tl2' | 'tl3' | 'tl4' | 'tl5';

export interface LessonItem {
  id: string;
  category: LessonCategory;
  title: string;
  description: string;
  duration: string;
  emoji: string;
  content: string;        // markdown
  keyLesson: string;      // bài học lớn nhất
}

export const CATEGORY_INFO: Record<LessonCategory, { label: string; color: string }> = {
  tl1: { label: 'Nền tảng', color: '#2E86AB' },
  tl2: { label: 'Tâm lý', color: '#E67E22' },
  tl3: { label: '3 Điểm Chạm', color: '#8E44AD' },
  tl4: { label: 'Kỹ năng', color: '#27AE60' },
  tl5: { label: 'Tình huống', color: '#C0392B' },
};

export const ALL_LESSONS: LessonItem[] = [

  // ═══════════════════════════════════════════════════════════
  // TÀI LIỆU 1: NỀN TẢNG — CỐ VẤN TIN CẬY LÀ GÌ
  // ═══════════════════════════════════════════════════════════

  {
    id: 'tl1_01',
    category: 'tl1',
    title: 'Định nghĩa cốt lõi',
    description: 'Cố vấn tin cậy là gì, không phải là gì, và vì sao sự "đủ vững" quan trọng hơn kỹ thuật bán hàng.',
    duration: '3 phút',
    emoji: '🏛️',
    keyLesson: 'Cố vấn tin cậy không cố bán. Họ giúp khách nghĩ rõ và quyết định đúng với bối cảnh của họ.',
    content: `Cố vấn tin cậy là người đủ vững để giúp khách hàng nghĩ rõ và quyết định đúng với bối cảnh của họ.

**Cố vấn tin cậy KHÔNG phải:**

- Người bán hàng giỏi, chỉ nhắm vào chốt giao dịch
- Chuyên gia thuần túy, đúng chuyên môn nhưng sai con người
- Bạn bè của khách hàng, thoải mái nhưng mất sự thẳng thắn

**Đủ vững** nghĩa là không bị lung lay bởi áp lực chốt, không bị cuốn theo cảm xúc của khách, không bị chi phối bởi mong muốn được khách thích.

**Giúp khách nghĩ rõ** nghĩa là mục đích của cuộc tư vấn là để khách nhìn rõ hơn điều mình muốn, rào cản thật sự, và con đường phù hợp.

**Quyết định đúng với bối cảnh:** có khi quyết định đúng là mua, có khi là không mua, có khi là chưa mua. Cố vấn chấp nhận cả ba kết quả.`,
  },
  {
    id: 'tl1_02',
    category: 'tl1',
    title: 'Công thức tin cậy',
    description: 'T = (C + R + E) / Sf. Bốn yếu tố quyết định mức độ tin cậy và cách mẫu số phá hủy mọi thứ.',
    duration: '4 phút',
    emoji: '🔢',
    keyLesson: 'Giảm Sf (bớt nói về mình, KPI, hoa hồng) là cách nhanh nhất để tăng Trust. Mẫu số phá hủy nhanh hơn tử số xây dựng.',
    content: `**T = (C + R + E) / Sf**

Bốn yếu tố quyết định mức độ tin cậy mà khách hàng dành cho bạn:

**C (Credibility / Uy tín):** Sự uy tín từ lời nói và ngôn từ. Khách tự hỏi: "Tôi có tin những gì người này nói không?"

**R (Reliability / Độ tin cậy):** Niềm tin từ hành động và hành vi. Khách tự hỏi: "Người này có làm đúng như đã nói không?"

**E (Emotional connection / Cảm xúc):** Kết nối cảm xúc tích cực. Khách tự hỏi: "Tôi có thoải mái với người này không?"

**Sf (Self-focus / Sự tập trung vào bản thân):** Nằm ở mẫu số, là yếu tố phá hoại. Khách tự hỏi: "Người này đang vì lợi ích của ai?"

Khi Sf tăng (lo cho doanh số của mình), Trust giảm dù C + R + E có cao đến đâu. Mẫu số phá hủy nhanh hơn tử số xây dựng. Chỉ một khoảnh khắc khách cảm nhận bạn đang vì lợi ích của mình, tất cả có thể sụp đổ.

> Nguyên tắc: Giảm Sf (bớt nói về mình, KPI, hoa hồng) là cách nhanh nhất để tăng Trust.`,
  },
  {
    id: 'tl1_03',
    category: 'tl1',
    title: 'Tam giác vàng',
    description: 'Ba đỉnh phong thái cố vấn tin cậy: Chuyên nghiệp, Chân thành, Chuyên môn. Và ba kịch bản sụp đổ.',
    duration: '4 phút',
    emoji: '🔺',
    keyLesson: 'Thiếu một đỉnh, hai đỉnh còn lại không cứu được. Giỏi mà không chân thành thì lạnh lùng. Chân thành mà không giỏi thì hào nhoáng rỗng.',
    content: `Ba đỉnh cần cân bằng. **Thiếu một đỉnh, hai đỉnh còn lại không cứu được.**

**Đỉnh 1: Phong thái chuyên nghiệp**

Tất cả những gì khách cảm nhận bằng giác quan: trang phục, cử chỉ, không gian, giao diện số. Không cần hoàn hảo, cần chỉn chu. Chỉn chu là cách thể hiện sự tôn trọng trước khi nói một lời nào.

**Đỉnh 2: Năng lượng tích cực và chân thành**

Khách hàng cao cấp đọc năng lượng nhanh hơn đọc lời nói. Năng lượng tích cực thật sự là sự ổn định và tự tin điềm tĩnh: có mặt hoàn toàn, bình tĩnh khi khách chia sẻ khó khăn, kiên nhẫn khi khách cần thời gian.

Cảm xúc lan truyền: cố vấn lo lắng thì khách lo lắng, cố vấn bình tĩnh thì khách dần bình tĩnh.

**Đỉnh 3: Chuyên gia trong lĩnh vực**

Biết đủ sâu để khách cảm nhận "người này hiểu lĩnh vực này hơn mình." Chuyên môn thật sự không cần khoe. Nó tự thể hiện qua cách hỏi, cách phân tích, cách đặt giải pháp trong bối cảnh của khách.

**Ba kịch bản sụp đổ:**

**Chuyên nghiệp + Chân thành + Thiếu chuyên môn** = "Hào nhoáng rỗng." Khách nghĩ: "Người dễ thương, nhưng không phải người tôi cần."

**Chuyên môn + Chuyên nghiệp + Thiếu chân thành** = "Lạnh lùng xa cách." Khách nghĩ: "Người giỏi, nhưng tôi không muốn mở lòng."

**Chuyên môn + Chân thành + Thiếu chuyên nghiệp** = "Không được tôn trọng." Khách nghĩ: "Anh ta không coi trọng chi tiết cơ bản, liệu có coi trọng việc phục vụ tôi?"`,
  },
  {
    id: 'tl1_04',
    category: 'tl1',
    title: '10 khác biệt: Cố vấn vs. Bán hàng',
    description: 'So sánh trực tiếp tư duy và hành vi của người bán hàng truyền thống với cố vấn tin cậy.',
    duration: '4 phút',
    emoji: '🔄',
    keyLesson: 'Người bán hàng hỏi "Làm sao để khách thấy sản phẩm phù hợp?" Cố vấn hỏi "Người này thật sự cần gì, và mình có phải người phù hợp để giúp họ không?"',
    content: `**1. Mục đích**
Người bán hàng: chốt giao dịch.
Cố vấn: giúp khách nghĩ rõ.

**2. Cách lắng nghe**
Người bán hàng: nghe để tìm nhu cầu, gắn vào sản phẩm.
Cố vấn: nghe để hiểu, không phán xét.

**3. Câu hỏi**
Người bán hàng: dẫn về sản phẩm.
Cố vấn: dẫn khách về chính họ.

**4. Khi không phù hợp**
Người bán hàng: xoay chuyển, che nhược điểm.
Cố vấn: nói thẳng "chưa phù hợp."

**5. Khi khách từ chối**
Người bán hàng: cố vượt qua rào cản.
Cố vấn: đọc tín hiệu, tìm nỗi sợ bên trong.

**6. Thời gian**
Người bán hàng: ép chốt nhanh.
Cố vấn: tôn trọng nhịp của khách.

**7. Đo thành công**
Người bán hàng: doanh số, tỷ lệ chốt.
Cố vấn: chất lượng quyết định của khách.

**8. Sau giao dịch**
Người bán hàng: kết thúc mối quan hệ.
Cố vấn: đồng hành dài hạn.

**9. Phản ứng khi bị áp lực**
Người bán hàng: nhượng bộ, giảm giá ngay.
Cố vấn: giữ vững vị thế, tìm hiểu nguyên nhân gốc.

**10. Tâm thế vào cuộc**
Người bán hàng: "Làm sao để khách thấy sản phẩm phù hợp?"
Cố vấn: "Người ngồi trước mặt mình thật sự cần gì, và mình có phải người phù hợp để giúp họ không?"`,
  },
  {
    id: 'tl1_05',
    category: 'tl1',
    title: 'Vòng tuần hoàn tin cậy',
    description: 'Tin cậy là vòng lặp tự tăng cường. Bắt đầu từ sự thật, không phải kỹ thuật bán hàng.',
    duration: '2 phút',
    emoji: '🔁',
    keyLesson: 'Nghịch lý cốt lõi: Càng cố bán cho khách hàng cao cấp, họ càng xa. Càng giúp họ nghĩ rõ, họ càng ở lại.',
    content: `Tin cậy không phải trạng thái tĩnh. Nó là một vòng tuần hoàn tự tăng cường:

Cố vấn cho đi sự thật → Khách mở lòng → Cuộc tư vấn có chiều sâu → Quyết định bền vững → Tin cậy tăng → Mối quan hệ dài hạn → Doanh số bền vững.

Vòng tuần hoàn này bắt đầu từ **sự thật**, không phải từ kỹ thuật bán hàng. Khi bạn dám nói thật (kể cả những điều khách không muốn nghe), khách cảm nhận được sự chân thành. Họ mở lòng hơn. Cuộc tư vấn đi sâu hơn. Quyết định sinh ra từ nhận thức chứ không phải áp lực, nên nó bền vững.

> **Nghịch lý cốt lõi:** Càng cố bán cho khách hàng cao cấp, họ càng xa. Càng giúp họ nghĩ rõ, họ càng ở lại.`,
  },
  {
    id: 'tl1_06',
    category: 'tl1',
    title: '4 nguyên lý tư duy',
    description: 'Bốn nguyên lý nền tảng định hình mọi hành vi của cố vấn tin cậy.',
    duration: '3 phút',
    emoji: '💡',
    keyLesson: 'Dám nói "chưa phù hợp" là cách nhanh nhất xây dựng tin cậy, và cũng là cách khó nhất vì đòi hỏi đặt lợi ích khách lên trên doanh số.',
    content: `**Nguyên lý 1: Lấy khách hàng làm trung tâm, không phải sản phẩm**

Câu hỏi bắt đầu là "Người ngồi trước mặt mình thật sự cần gì, và mình có phải người phù hợp để giúp họ không?" Không phải "Làm sao để khách thấy sản phẩm phù hợp?"

**Nguyên lý 2: Dẫn dắt nhận thức, không thuyết phục**

Cố vấn không có sẵn đáp án. Cố vấn có quy trình giúp khách tự đi đến kết luận của riêng họ. Quyết định từ nhận thức bền vững hơn quyết định từ thuyết phục.

**Nguyên lý 3: Sẵn sàng từ chối khi không phù hợp**

Dám nói "chưa phù hợp" là cách nhanh nhất để xây dựng tin cậy, và cũng là cách khó nhất vì đòi hỏi đặt lợi ích khách lên trên doanh số.

**Nguyên lý 4: Tôn trọng nhịp ra quyết định của khách**

Quyết định bị ép sẽ dẫn đến hối hận, hủy hợp đồng, mất tin cậy. Cố vấn giúp khách sẵn sàng nhanh hơn bằng cách gỡ rào cản bên trong, không tạo áp lực bên ngoài.`,
  },

  // ═══════════════════════════════════════════════════════════
  // TÀI LIỆU 2: TÂM LÝ KHÁCH HÀNG CAO CẤP
  // ═══════════════════════════════════════════════════════════

  {
    id: 'tl2_01',
    category: 'tl2',
    title: 'Hai hệ thống tư duy (Kahneman)',
    description: 'Hệ thống nhanh quyết định cảm xúc, hệ thống chậm hợp lý hóa. Ứng dụng trong từng giai đoạn buổi tư vấn.',
    duration: '4 phút',
    emoji: '🧠',
    keyLesson: 'Tạo cảm xúc đúng trước (Hệ thống nhanh), logic sau (Hệ thống chậm). Không ai mua hàng bằng bảng tính Excel.',
    content: `Theo nhà tâm lý học Daniel Kahneman, con người ra quyết định bằng hai hệ thống:

**Hệ thống nhanh (System 1):** Tự động, dựa trên trực giác và cảm xúc. Quyết định ấn tượng ban đầu trong vài giây. Khách xếp bạn vào ô "người bán hàng" hay "người đáng nghe" ngay từ phút đầu.

**Hệ thống chậm (System 2):** Có chủ đích, phân tích logic, so sánh giá trị. Cần năng lượng và dễ bị kiệt sức.

**Ứng dụng trong buổi tư vấn:**

- **Đầu buổi:** Hệ thống nhanh đang hoạt động → cần phong thái đúng, tạo cảm giác an toàn
- **Giữa buổi:** Hệ thống chậm được kích hoạt → câu hỏi sắc, logic chặt
- **Cuối buổi:** Hệ thống nhanh xác nhận lại → không ép, để khách "cảm thấy đúng"

Sai lầm lớn nhất của sales: liệt kê tính năng, so sánh giá (kích hoạt Hệ thống chậm) trong khi chưa tạo kết nối cảm xúc (Hệ thống nhanh chưa được chinh phục). Không ai mua hàng bằng bảng tính Excel.`,
  },
  {
    id: 'tl2_02',
    category: 'tl2',
    title: '3 cảm xúc cần tạo ra',
    description: 'Không phải hứng khởi hay áp lực. Ba cảm xúc đúng: An toàn, Rõ ràng, Tin tưởng.',
    duration: '3 phút',
    emoji: '🎭',
    keyLesson: 'Không có an toàn, mọi câu hỏi sâu đều vô nghĩa vì khách chỉ trả lời bề mặt.',
    content: `Nhiều sales cố tạo hứng khởi hoặc áp lực. Cả hai đều sai. Cố vấn tin cậy cần tạo ra ba cảm xúc khác:

**1. An toàn** → Khách nói thật.
Khi khách cảm thấy không bị phán xét, không bị ép, họ mới dám chia sẻ điều thật sự quan trọng. Không có an toàn, mọi câu hỏi sâu đều vô nghĩa vì khách chỉ trả lời bề mặt.

**2. Rõ ràng** → Khách biết mình muốn gì.
Nhiều khách đến với bạn trong trạng thái mơ hồ. Họ biết có điều gì đó không ổn nhưng chưa gọi tên được. Vai trò của cố vấn là giúp họ nhìn rõ: mong muốn thật, rào cản thật, con đường thật.

**3. Tin tưởng** → Khách cho phép được dẫn dắt.
Tin tưởng không đến từ lời hứa. Tin tưởng đến từ hành vi nhất quán: bạn lắng nghe thật sự, bạn hỏi câu hỏi vì họ chứ không vì mình, bạn dám nói "chưa phù hợp" thay vì cố bán.`,
  },
  {
    id: 'tl2_03',
    category: 'tl2',
    title: '5 giai đoạn nhận thức',
    description: 'Từ mơ hồ đến sẵn sàng cam kết. Mỗi giai đoạn cần cách tiếp cận khác nhau.',
    duration: '4 phút',
    emoji: '📊',
    keyLesson: 'Sai lầm lớn nhất: nhảy sang giới thiệu giải pháp khi khách vẫn ở giai đoạn mơ hồ, chưa nhận ra vấn đề.',
    content: `Khách hàng không nhảy từ "chưa biết" sang "mua" trong một bước. Họ đi qua năm giai đoạn nhận thức:

**Giai đoạn 1: Mơ hồ nhưng bất an**
Biết có gì đó không ổn nhưng chưa gọi tên được. KHÔNG trình bày giải pháp ở giai đoạn này. Khách chưa sẵn sàng nghe.

**Giai đoạn 2: Nhận thức về mong muốn**
Bắt đầu hình dung điều mình muốn, nhưng còn chung chung. Cần dẫn sâu hơn: mong muốn được gắn với ý nghĩa cá nhân thì mới chuyển từ "muốn" sang "cần."

**Giai đoạn 3: Nhận thức về khoảng cách**
Thấy rõ khoảng cách giữa hiện tại và mong muốn. Giai đoạn lý tưởng để tư vấn, nhưng cũng là lúc nhiều khách rút lui nếu cố vấn không tạo đủ an toàn tâm lý.

**Giai đoạn 4: Nhận thức về con đường**
Cân nhắc các lựa chọn. Hệ thống chậm phân tích, hệ thống nhanh kiểm tra "mình có tin người này không?"

**Giai đoạn 5: Sẵn sàng cam kết**
Đã rõ, chỉ cần xác nhận. Sai lầm lớn nhất: nói thêm quá nhiều khi khách đã sẵn sàng.

> **Sai lầm phổ biến nhất:** Nhảy sang giai đoạn 3-4 trong khi khách vẫn ở giai đoạn 1-2.`,
  },
  {
    id: 'tl2_04',
    category: 'tl2',
    title: '5 hành trình cảm xúc',
    description: 'Song song với nhận thức, khách trải qua 5 trạng thái cảm xúc. Đừng nhầm hào hứng với sẵn sàng mua.',
    duration: '3 phút',
    emoji: '🎢',
    keyLesson: 'Quyết định trong hưng phấn thường bị hủy sau đó. Quyết định dựa trên nhận thức đầy đủ mới bền vững.',
    content: `Song song với 5 giai đoạn nhận thức, khách hàng trải qua 5 trạng thái cảm xúc:

**1. Tò mò pha lẫn dè chừng**
Tò mò không đồng nghĩa với sẵn sàng. Đẩy quá mạnh ở giai đoạn này, cánh cửa đóng lại.

**2. Hào hứng khi thấy khả năng thay đổi**
Khoảnh khắc nguy hiểm: đừng nhầm hào hứng với sẵn sàng mua. Quyết định trong hưng phấn thường bị hủy sau đó.

**3. Lo lắng khi đối diện thực tế**
Khi thấy khoảng cách (giai đoạn nhận thức 3), hào hứng nhường chỗ cho lo lắng. Khách cần cảm giác an toàn: "Mình không phải đi một mình."

**4. Căng thẳng khi phải chọn**
Hỏi đi hỏi lại, so sánh thêm, xin thêm thời gian. Cố vấn cần đơn giản hóa và quay lại 3 điều đã rõ.

**5. Nhẹ nhõm hoặc hối hận sau quyết định**
Quyết định dựa trên nhận thức đầy đủ → nhẹ nhõm. Quyết định bị ép → nghi ngờ và hối hận (bất hòa nhận thức theo nghiên cứu của Festinger).`,
  },
  {
    id: 'tl2_05',
    category: 'tl2',
    title: '5 khoảnh khắc quyết định',
    description: 'Năm thời điểm then chốt trong buổi tư vấn mà cách bạn phản ứng sẽ định hình toàn bộ mối quan hệ.',
    duration: '4 phút',
    emoji: '⏱️',
    keyLesson: '30 giây đầu tiên quyết định bạn là "người bán" hay "người đáng nghe." Mở đầu bằng câu hỏi quan tâm, không phải giới thiệu sản phẩm.',
    content: `Có năm thời điểm trong buổi tư vấn mà cách bạn phản ứng sẽ định hình toàn bộ mối quan hệ:

**Khoảnh khắc 1: 30 giây đầu tiên**
Hệ thống nhanh xếp bạn vào ô "người bán" hay "người đáng nghe." Nếu mở đầu bằng giới thiệu sản phẩm, bạn bị xếp vào ô "người bán." Nếu mở đầu bằng câu hỏi quan tâm thật sự, bạn được xếp vào ô "người đáng nghe."

**Khoảnh khắc 2: Câu hỏi đầu tiên bạn đặt ra**
Tiết lộ tâm thế của bạn. Hướng về sản phẩm, khách biết bạn đang cố bán. Hướng về khách, khách cảm nhận sự tò mò chân thật.

**Khoảnh khắc 3: Khi khách chia sẻ điều nhạy cảm lần đầu**
Họ đang "thử" bạn. Nếu bạn lập tức dùng thông tin đó để bán, cánh cửa đóng mãi. Nếu bạn phản chiếu và không phán xét, cánh cửa mở rộng hơn.

**Khoảnh khắc 4: Khi nói giá**
Cách bạn nói con số phản ánh bạn có tự tin về giá trị mình mang lại không. Vòng vo, xin lỗi trước → "Người này không tự tin." Nói rõ, dừng, chờ → tín hiệu ngược lại.

**Khoảnh khắc 5: 24-48 giờ sau khi quyết định**
Quan trọng nhất. Một tin nhắn ngắn xác nhận quyết định, nhắc lại lý do khách đã chọn, cho thấy khách không bị bỏ rơi → giảm bất hòa nhận thức, tăng tỷ lệ giữ deal và giới thiệu.`,
  },
  {
    id: 'tl2_06',
    category: 'tl2',
    title: '3 tầng nỗi sợ',
    description: 'Tầng bề mặt khách nói ra. Tầng giữa khách giấu. Tầng gốc chính khách không nhận ra.',
    duration: '3 phút',
    emoji: '🧊',
    keyLesson: 'Kỹ thuật chốt chỉ xử lý tầng bề mặt. Hai tầng bên dưới vẫn còn nguyên, nên khách hủy sau khi đồng ý.',
    content: `**Ba tầng nỗi sợ:**

**Tầng bề mặt** (khách nói ra): "Giá cao", "Cần suy nghĩ thêm", "Chưa phải lúc này."

**Tầng giữa** (không nói ra): Sợ chọn sai, sợ mất tiền, sợ bị đánh giá.

**Tầng gốc** (chính khách không nhận ra): Sợ mình không đủ giỏi để thay đổi, sợ thừa nhận đã sai lâu nay.

Kỹ thuật chốt chỉ xử lý tầng bề mặt. Hai tầng bên dưới vẫn còn nguyên → khách hủy sau khi đồng ý, hoặc hối hận.

> Cố vấn tin cậy không cố "vượt qua" nỗi sợ. Họ giúp khách nhìn thấy nỗi sợ, gọi tên nó, và tự quyết định xem nỗi sợ đó có đủ lớn để ngăn họ lại không.`,
  },
  {
    id: 'tl2_07',
    category: 'tl2',
    title: '6 nỗi sợ cốt lõi',
    description: 'Sáu nỗi sợ chi phối quyết định cao cấp: sợ sai, mất kiểm soát, thay đổi, bị bán, mất nhân dạng, hối hận.',
    duration: '5 phút',
    emoji: '😰',
    keyLesson: 'Sợ bị bán là nỗi sợ không thể phá bằng lời nói, chỉ bằng hành vi. Im lặng ở chỗ người bán sẽ nói, dám nói "chưa phù hợp" ở chỗ người bán cố chốt.',
    content: `**1. Sợ ra quyết định sai:** Phổ biến nhất. Biểu hiện: hỏi nhiều, so sánh nhiều bên. Hay nói: "Cần tìm hiểu thêm." Cách xử lý: không cung cấp thêm thông tin (vấn đề không phải thiếu thông tin), giúp khách nhận ra "đã đủ rõ để chọn có trách nhiệm chưa."

**2. Sợ mất quyền kiểm soát:** Biểu hiện: muốn kiểm soát cuộc trò chuyện, hỏi ngược, từ chối trả lời câu cá nhân. Cách xử lý: trao quyền kiểm soát. Nghịch lý: khi khách cảm thấy mình đang kiểm soát, họ sẽ tự nguyện nhường lại sự dẫn dắt.

**3. Sợ thay đổi:** Biểu hiện: đồng ý mọi thứ hợp lý nhưng không hành động. Hay nói: "Biết rồi, nhưng chưa phải lúc." Cách xử lý: thừa nhận giá trị quá khứ, rồi hỏi "bối cảnh đã thay đổi, cách đó còn đủ cho giai đoạn tiếp theo không?"

**4. Sợ bị bán:** Khách hàng cao cấp đã bị bán quá nhiều lần. Biểu hiện: cảnh giác từ đầu, hỏi giá sớm, trả lời ngắn. Cách xử lý: không thể phá bằng lời nói, chỉ bằng hành vi. Khi bạn im lặng ở chỗ người bán sẽ nói, hỏi câu người bán không hỏi, dám nói "chưa phù hợp" ở chỗ người bán cố chốt, bức tường tự hạ xuống.

**5. Sợ mất nhân dạng:** "Nếu tôi cần giúp đỡ, điều đó có nghĩa tôi không đủ giỏi?" Cách xử lý: dùng ngôn ngữ "bổ sung" thay vì "sửa sai." Ví dụ: "Anh/chị đã có nền tảng rất tốt, câu hỏi là giai đoạn tiếp theo cần gì mới."

**6. Sợ hối hận:** Nghiên cứu của Zeelenberg & Pieters: ngắn hạn hối hận vì hành động (mua rồi tiếc), dài hạn hối hận vì không hành động (bỏ lỡ rồi tiếc). Khi cố vấn dẫn khách qua 3 Điểm Chạm đúng cách, khách tự nhìn thấy cái giá của việc không hành động, từ nhận thức chứ không phải áp lực.`,
  },
  {
    id: 'tl2_08',
    category: 'tl2',
    title: 'Thiên lệch nhận thức',
    description: 'Lý thuyết triển vọng, hiệu ứng neo, đóng khung, ác cảm mất mát, và tải nhận thức.',
    duration: '4 phút',
    emoji: '🔬',
    keyLesson: 'Nỗi đau mất mát mạnh gấp 2-2.5 lần niềm vui được lợi. "Anh đang mất gì mỗi ngày" luôn mạnh hơn "Anh sẽ được gì."',
    content: `**Lý thuyết triển vọng (Kahneman & Tversky):**
Nỗi đau mất mát mạnh gấp 2 đến 2.5 lần niềm vui được lợi. Vì vậy "Anh/chị đang mất gì mỗi ngày nếu tiếp tục như hiện tại" luôn mạnh hơn "Anh/chị sẽ được gì." Đây là nền tảng của "Cái giá của sự trì hoãn": trì hoãn cũng là một quyết định, và quyết định đó có cái giá.

**Thiên lệch xác nhận:**
Khách tìm bằng chứng phù hợp với điều đã tin sẵn. Không tranh luận với niềm tin, hãy đặt câu hỏi để khách tự xem xét lại giả định.

**Hiệu ứng neo:**
Con số đầu tiên khách nghe sẽ chi phối toàn bộ đánh giá sau. Cần thiết lập đúng điểm tham chiếu TRƯỚC khi nói giá: cái giá của vấn đề hiện tại, cái giá của trì hoãn.

**Hiệu ứng đóng khung:**
Cách diễn đạt thay đổi phản ứng. "Mất gì mỗi ngày" vs "Được gì khi thay đổi": cùng nội dung, khác tác động hoàn toàn.

**Ác cảm mất mát:**
Trình bày rõ điều khách đang mất thực sự mạnh hơn điều khách sẽ được.

**Tải nhận thức (Miller):**
Não bộ chỉ xử lý được 5 đến 9 đơn vị thông tin cùng lúc. Ít thông tin đúng trọng tâm có giá trị hơn nhiều thông tin dàn trải.`,
  },

  // ═══════════════════════════════════════════════════════════
  // TÀI LIỆU 3: PHƯƠNG PHÁP 3 ĐIỂM CHẠM
  // ═══════════════════════════════════════════════════════════

  {
    id: 'tl3_01',
    category: 'tl3',
    title: 'Tổng quan 3 Điểm Chạm',
    description: 'Ba trạng thái nhận thức khách cần đi qua để TỰ ra quyết định, không cần ép, không cần kỹ thuật chốt.',
    duration: '3 phút',
    emoji: '🎯',
    keyLesson: 'Người nói nhiều hơn trong buổi tư vấn đúng nghĩa là khách hàng, không phải cố vấn.',
    content: `3 Điểm Chạm là ba trạng thái nhận thức mà khách hàng cần đi qua để TỰ ra quyết định. Khi cả ba đủ rõ, quyết định đến tự nhiên, không cần ép, không cần kỹ thuật chốt.

> **Người nói nhiều hơn trong buổi tư vấn đúng nghĩa không phải cố vấn, mà là khách hàng.**

**3 sai lầm phổ biến khiến buổi tư vấn thất bại:**

1. Nói về giải pháp trước khi khách hiểu rõ vấn đề của mình
2. Thuyết phục thay vì dẫn dắt nhận thức (càng thuyết phục, khách càng phòng thủ)
3. Nhầm "quan tâm" với "sẵn sàng quyết định": gật đầu nhiều không có nghĩa là sẵn sàng mua`,
  },
  {
    id: 'tl3_02',
    category: 'tl3',
    title: 'Giai đoạn 0: Kết nối tin tưởng',
    description: '5 phút đầu không quyết định khách có mua, nhưng quyết định khách có sẵn sàng mở lòng.',
    duration: '3 phút',
    emoji: '🤝',
    keyLesson: 'Nếu khách giữ khoảng cách, đừng cố mở bằng câu hỏi sâu. Hỏi sâu lúc này chỉ tạo thêm áp lực.',
    content: `**Mục tiêu:** Tạo an toàn tâm lý để khách mở lòng.

5 phút đầu KHÔNG quyết định khách có mua không. Nhưng quyết định **khách có sẵn sàng mở lòng không**.

**Kỹ năng cần có:**

- **Hiện diện vật lý:** Vững, không vội, không lo lắng
- **Giọng nói và nhịp điệu:** Chậm, rõ, không áp lực
- **Tạo không gian an toàn:** "Buổi hôm nay mình chỉ muốn hiểu anh/chị hơn, không có mục tiêu gì khác cả"
- **Đọc trạng thái ban đầu:** Khách đang phòng thủ, tò mò, hay mệt mỏi?

Nếu khách giữ khoảng cách ngay từ đầu, đừng cố mở bằng câu hỏi sâu. Hỏi sâu lúc này chỉ tạo thêm áp lực. Thay vào đó:

"Dạ anh/chị, trước khi mình nói gì thêm, em muốn nói rằng buổi hôm nay đơn giản là để em hiểu thêm về phía anh/chị. Nếu sau buổi này anh/chị thấy không phù hợp thì hoàn toàn không vấn đề gì."`,
  },
  {
    id: 'tl3_03',
    category: 'tl3',
    title: 'Điểm Chạm 1: Chạm Động Lực',
    description: 'Giúp khách nhìn rõ điều họ THẬT SỰ muốn, không phải điều họ nghĩ mình muốn.',
    duration: '5 phút',
    emoji: '🔥',
    keyLesson: 'Không hỏi "anh cần gì?" mà hỏi "điều gì đang quan trọng với anh ở thời điểm này?" Cố vấn không tạo ra động lực, mà giúp khách nhận ra động lực đã có sẵn.',
    content: `**Mục tiêu:** Giúp khách nhìn rõ điều họ THẬT SỰ muốn, không phải điều họ nghĩ mình muốn.

**Nguyên tắc:** Không hỏi "anh/chị cần gì?" mà hỏi "điều gì đang quan trọng với anh/chị ở thời điểm này?" Người cố vấn không tạo ra động lực, mà giúp khách nhận ra động lực đã có sẵn bên trong.

**Câu hỏi khám phá động lực:**

- "Điều gì khiến anh/chị bắt đầu quan tâm đến vấn đề này vào lúc này?"
- "Nếu 6 tháng từ giờ, anh/chị nhìn lại và thấy mình đã thay đổi được, điều đó trông như thế nào?"
- "Điều gì sẽ khác đi trong cuộc sống/công việc nếu vấn đề này được giải quyết?"
- "Điều gì là quan trọng nhất với anh/chị khi cân nhắc điều này?"

**Khi khách còn mơ hồ, dùng câu hỏi gián tiếp:**

- "Trước khi bắt đầu tìm hiểu, có điều gì diễn ra khiến anh/chị cảm thấy mình cần thay đổi không?"
- "Có thể anh/chị chưa rõ mình muốn gì cụ thể, nhưng nếu hỏi ngược lại: điều gì anh/chị chắc chắn không muốn tiếp tục nữa?"

**Dấu hiệu hoàn thành:** Khách tự dùng những từ mang tính cá nhân sâu sắc, không còn trả lời chung chung.

**Lỗi thường gặp:** Nhảy sang trình bày giải pháp khi khách vừa nói xong lý do quan tâm.`,
  },
  {
    id: 'tl3_04',
    category: 'tl3',
    title: 'Điểm Chạm 2: Chạm Điểm Nghẽn',
    description: 'Giúp khách đối diện nguyên nhân THẬT SỰ đang giữ họ đứng yên. Kỹ thuật "Cái giá của sự trì hoãn."',
    duration: '5 phút',
    emoji: '🔓',
    keyLesson: 'Khi khách vừa nhìn thấy điểm nghẽn, đừng vội chuyển sang giải pháp. Dừng lại, để khách "ở trong" nhận thức đó đủ lâu.',
    content: `**Mục tiêu:** Giúp khách đối diện với nguyên nhân THẬT SỰ đang giữ họ đứng yên.

**Nguyên tắc:** Khách biết mình muốn thay đổi nhưng chưa hiểu rõ điều gì đang cản. Họ thường nhầm lẫn giữa vấn đề gốc và vấn đề bề mặt.

**Câu hỏi khám phá điểm nghẽn:**

- "Điều gì đã giữ anh/chị lại cho đến giờ?"
- "Anh/chị đã thử cách nào chưa? Điều gì đã không hiệu quả và tại sao?"
- "Nếu tiếp tục như hiện tại thêm 1 năm nữa, điều đó có ý nghĩa gì với anh/chị?"

**Kỹ thuật "Cái giá của sự trì hoãn":**
Giúp khách tự tính chi phí thực sự của việc không thay đổi, không phải để dọa, mà để làm rõ sự thật:

"Nếu tình trạng này tiếp tục thêm [X tháng], điều đó ảnh hưởng như thế nào đến [điều khách nói là quan trọng]?"

**Phản chiếu có chọn lọc** khi khách kể nhiều nhưng không chạm gốc:

"Anh/chị vừa nhắc đến một chi tiết mà em muốn dừng lại. Anh/chị nói rằng [chi tiết cụ thể]. Điều đó ảnh hưởng đến anh/chị như thế nào?"

**Dấu hiệu hoàn thành:** Khách tự nói ra điểm nghẽn mà không cần cố vấn gán nhãn.

**Lỗi thường gặp:** Vội chuyển sang giải pháp khi khách vừa nhìn thấy điểm nghẽn. Hãy dừng lại, để khách "ở trong" nhận thức đó đủ lâu.`,
  },
  {
    id: 'tl3_05',
    category: 'tl3',
    title: 'Điểm Chạm 3: Chạm Con Đường',
    description: 'Đặt giải pháp trong bối cảnh riêng của khách. Dùng ngôn ngữ của KHÁCH, không phải ngôn ngữ sản phẩm.',
    duration: '4 phút',
    emoji: '🛤️',
    keyLesson: 'Ghi chép những từ khách dùng ở Chạm 1 và 2, rồi dùng lại chính xác những từ đó khi trình bày giải pháp.',
    content: `**Mục tiêu:** Giúp khách nhìn thấy hướng đi phù hợp với bối cảnh, khả năng và mức độ sẵn sàng của HỌ.

**Nguyên tắc:** Không trình bày sản phẩm, mà đặt giải pháp trong bối cảnh riêng của khách. Để khách tự đánh giá sự phù hợp.

**Cách trình bày đúng:**

1. **Kết nối lại** với điều khách đã nói: "Dựa trên những gì anh/chị chia sẻ về [X] và [Y]..."
2. **Đặt giải pháp trong bối cảnh:** "Hướng tiếp cận mà em thấy phù hợp nhất là..."
3. **Để khách đánh giá:** "Anh/chị thấy hướng này có phù hợp với mình không?"

**Quy tắc quan trọng:** Dùng ngôn ngữ của KHÁCH, không phải ngôn ngữ sản phẩm. Ghi chép những từ khách dùng trong Chạm Động Lực và Chạm Điểm Nghẽn, rồi dùng lại chính xác những từ đó khi trình bày.

**Dấu hiệu hoàn thành:** Khách tự nói "Cái này nghe phù hợp với mình đó" hoặc bắt đầu hỏi về chi tiết thực thi.`,
  },
  {
    id: 'tl3_06',
    category: 'tl3',
    title: 'Phản chiếu và Cam kết',
    description: 'Khi khách qua 3 Điểm Chạm, cam kết là bước tự nhiên. Để KHÁCH tự đề xuất bước tiếp theo.',
    duration: '3 phút',
    emoji: '✅',
    keyLesson: 'Khi thấy tín hiệu mua (hỏi triển khai, dùng ngôn ngữ sở hữu), DỪNG trình bày. Bắt đầu bước cam kết.',
    content: `Khi khách đã qua 3 Điểm Chạm, lời mời cam kết là bước cuối tự nhiên:

"Dựa trên những gì mình vừa nói chuyện, anh/chị thấy bước tiếp theo nên là gì?"

**Nguyên tắc:** Để KHÁCH tự đề xuất bước tiếp theo nếu có thể. Quyết định do họ tự đưa ra sẽ bền vững hơn.

**Dấu hiệu khách sắp sẵn sàng:**

- Hỏi về chi tiết thực thi: "Bao giờ bắt đầu?", "Quy trình như thế nào?"
- Tính toán cụ thể: "Nếu mình làm [X] thì..."
- Dùng ngôn ngữ sở hữu: "Khi mình làm điều này...", "Của mình thì..."
- Hỏi về người khác liên quan: "Vợ/chồng/đối tác mình cũng nên biết không?"

> Khi thấy các dấu hiệu này: **DỪNG trình bày. Bắt đầu bước cam kết.**

**Khi nào nên dừng lại hoàn toàn:**

- Khi khách đã từ chối rõ ràng và không muốn đào sâu hơn
- Khi khách chưa đủ an toàn tâm lý để mở lòng
- Khi bản thân cố vấn bắt đầu cảm thấy áp lực muốn chốt

"Người cố vấn tin cậy không sợ mất deal. Người cố vấn tin cậy sợ mất đi sự tôn trọng mà mình đã xây dựng."`,
  },

  // ═══════════════════════════════════════════════════════════
  // TÀI LIỆU 4: 6 KỸ NĂNG CỐT LÕI
  // ═══════════════════════════════════════════════════════════

  {
    id: 'tl4_01',
    category: 'tl4',
    title: 'Lắng nghe sâu',
    description: 'Nghe 3 tầng: nội dung, cảm xúc, ý định chưa nói. Quy tắc 70/30.',
    duration: '4 phút',
    emoji: '👂',
    keyLesson: 'Khi khách nói "để tôi nghĩ thêm", tầng 3 nghe ra: "tôi chưa đủ tin tưởng." Sales giỏi phản hồi tầng 3.',
    content: `Lắng nghe sâu không chỉ là im lặng khi khách nói. Đó là khả năng nghe ở ba tầng:

**Tầng 1: Nội dung** (khách đang nói gì)
Nghe thông tin, sự kiện, con số. Đây là tầng mà hầu hết sales dừng lại.

**Tầng 2: Cảm xúc** (khách đang cảm thấy gì)
Nghe qua giọng nói, nhịp điệu, những khoảng dừng. Khách nói "tốt" nhưng giọng do dự nghĩa là "chưa tốt."

**Tầng 3: Ý định chưa nói** (khách thật sự muốn gì)
Nghe điều khách không nói ra. Khi khách nói "để tôi nghĩ thêm", tầng 3 nghe ra: "tôi chưa đủ tin tưởng."

**Dấu hiệu bạn đang nghe ở tầng 1:** Bạn đang nghĩ về điều mình sẽ nói tiếp khi khách nói chưa xong.

**Quy tắc 70/30:** Nghe 70%, nói 30%.

**Ví dụ thực tế:**
Khách nói "để tôi nghĩ thêm."
- Tầng 1 nghe: "cần thời gian."
- Tầng 2 nghe: giọng do dự, không hào hứng.
- Tầng 3 nghe: "tôi chưa đủ tin tưởng."

Sales giỏi phản hồi tầng 3: "Em hiểu anh cần cân nhắc. Có điều gì anh đang phân vân mà em có thể giúp được không?"

Phát huy mạnh nhất ở **Chạm Động Lực**: nghe ra mong muốn thật sự phía sau lời chia sẻ ban đầu.`,
  },
  {
    id: 'tl4_02',
    category: 'tl4',
    title: 'Câu hỏi dẫn dắt',
    description: 'Câu hỏi tốt khiến khách dừng lại và nhìn thấy điều chưa nghĩ tới. So sánh thẩm vấn vs. dẫn dắt.',
    duration: '3 phút',
    emoji: '❓',
    keyLesson: '"Ngân sách anh bao nhiêu?" là thẩm vấn. "Anh mong đợi giải pháp mang lại kết quả gì?" là dẫn dắt. Khác biệt rất lớn.',
    content: `Câu hỏi tốt không phải câu khiến khách trả lời nhiều. **Câu hỏi tốt là câu khiến khách dừng lại và nhìn thấy điều mà trước đó họ chưa nghĩ tới.**

**Công thức câu hỏi chiều sâu:**
"Điều gì [khiến / quan trọng / thay đổi] với anh/chị khi [bối cảnh cụ thể]?"

**TRÁNH:** Câu hỏi có/không, câu hỏi dẫn dắt về sản phẩm.

**So sánh:**
Thẩm vấn: "Ngân sách anh bao nhiêu?" → Khách phòng thủ.
Dẫn dắt: "Anh mong đợi giải pháp này mang lại kết quả gì?" → Khách mở lòng.

Thẩm vấn: "Anh đã dùng sản phẩm gì trước đây?" → Khách cảm thấy bị hỏi cung.
Dẫn dắt: "Điều gì quan trọng nhất với anh khi chọn đối tác?" → Khách chia sẻ giá trị.

**Câu hỏi mẫu hay:**
- "Điều gì quan trọng nhất với anh/chị khi chọn đối tác?"
- "Nếu có giải pháp hoàn hảo, nó sẽ trông như thế nào?"
- "Điều gì khiến anh/chị bắt đầu quan tâm đến vấn đề này vào lúc này?"

Phát huy mạnh nhất ở **Chạm Động Lực** và **Chạm Điểm Nghẽn**.`,
  },
  {
    id: 'tl4_03',
    category: 'tl4',
    title: 'Phản chiếu',
    description: 'Trả lại cho khách những gì họ nói, được sắp xếp lại để khách nghe rõ hơn chính mình.',
    duration: '3 phút',
    emoji: '🪞',
    keyLesson: 'Phản chiếu không phải nhắc lại nguyên văn. Mà là giúp khách nhìn thấy bức tranh mà trước đó họ chỉ thấy từng mảnh rời rạc.',
    content: `Phản chiếu là trả lại cho khách những gì họ đã nói, được sắp xếp và gọi tên lại để khách nghe rõ hơn chính mình.

Không phải nhắc lại nguyên văn. Mà là giúp khách nhìn thấy bức tranh mà trước đó họ chỉ thấy từng mảnh rời rạc.

**Ví dụ câu phản chiếu:**
"Nếu em hiểu đúng, điều anh/chị đang chia sẻ là [tóm tắt sâu hơn những gì khách nói]. Anh/chị thấy có đúng không?"

**TRÁNH:**
- Kết luận thay cho khách
- Gán nhãn cảm xúc mà khách không nói

**Phản chiếu có chọn lọc khi khách kể nhiều nhưng không chạm gốc:**

"Anh/chị vừa nhắc đến một chi tiết mà em muốn dừng lại. Anh/chị nói rằng [chi tiết cụ thể]. Điều đó ảnh hưởng đến anh/chị như thế nào?"

"Em để ý khi anh/chị nhắc đến [chi tiết], giọng anh/chị có khác đi một chút. Hình như điều đó quan trọng hơn những thứ khác?"

Phản chiếu phát huy mạnh nhất ở **Chạm Điểm Nghẽn** và khi xử lý từ chối.`,
  },
  {
    id: 'tl4_04',
    category: 'tl4',
    title: 'Đọc tín hiệu và điều chỉnh',
    description: 'Nhận biết tín hiệu mở lòng, phòng thủ, sẵn sàng mua. Quy tắc chữ "nhưng."',
    duration: '4 phút',
    emoji: '🔍',
    keyLesson: 'Khách nói "hay lắm nhưng..." Mọi thứ trước "nhưng" là lịch sự. Mọi thứ sau "nhưng" mới là thật.',
    content: `Trong suốt buổi tư vấn, khách liên tục phát ra tín hiệu. Cố vấn giỏi đọc được và điều chỉnh kịp thời.

**Tín hiệu mở lòng:**
- Nói chậm hơn và sâu hơn
- Dùng ngôn ngữ cá nhân ("Thật ra thì...", "Nói thật là...")
- Im lặng suy nghĩ thật sự
- Hỏi câu hỏi về chính họ

**Tín hiệu phòng thủ:**
- Trả lời ngắn và chung chung
- Thay đổi chủ đề
- Ngôn ngữ cơ thể khép lại (khoanh tay, ngả người ra sau)
- Hỏi nhiều câu kỹ thuật liên tiếp (cơ chế phòng thủ)

**Khi thấy tín hiệu phòng thủ:** DỪNG. Đừng tiếp tục đào sâu. Trở về kết nối:

"Em cảm giác có điều gì đó mình chưa rõ. Anh/chị có thể chia sẻ thêm không?"

**Tín hiệu mua:** Hỏi về chi tiết triển khai, timeline, đề cập đến đồng nghiệp/sếp.

**Tín hiệu chưa sẵn sàng:** Trả lời ngắn, nhìn đồng hồ, hỏi lại giá nhiều lần.

**Quy tắc chữ "nhưng":** Khách nói "hay lắm **nhưng**..." Mọi thứ trước "nhưng" là lịch sự. Mọi thứ sau "nhưng" mới là thật.`,
  },
  {
    id: 'tl4_05',
    category: 'tl4',
    title: 'Im lặng chiến lược',
    description: 'Im lặng không phải thiếu vắng lời nói. Đây là hành động tư vấn có sức mạnh riêng.',
    duration: '3 phút',
    emoji: '🤫',
    keyLesson: 'Lấp đầy im lặng = cho khách thấy bạn không thoải mái = bạn đang cần họ hơn họ cần bạn.',
    content: `Im lặng không phải thiếu vắng lời nói. Đây là hành động tư vấn có sức mạnh riêng.

**Sau mỗi câu hỏi chiều sâu:** Im lặng ít nhất 5 đến 7 giây. Để khách xử lý. Đừng lấp đầy khoảng trống.

**Im lặng kéo dài của khách:** Đây thường là tín hiệu TÍCH CỰC. Khách đang suy nghĩ thật sự. Đợi 15 đến 20 giây.

Nếu vẫn im lặng: "Anh/chị đang nghĩ đến điều gì vậy?" (giọng nhẹ nhàng, không thúc ép).

**Câu hỏi tự kiểm tra:** "Mình có đang lấp đầy khoảng lặng vì không thoải mái, hay vì thật sự cần nói thêm?"

**Lỗi phổ biến nhất:** Khi khách im lặng sau câu hỏi, sales hoảng và bắt đầu giải thích, bổ sung, hoặc đổi câu hỏi. Làm vậy là phá hủy khoảnh khắc nhận thức quý giá nhất.

> Lấp đầy im lặng = cho khách thấy bạn không thoải mái = bạn đang cần họ hơn họ cần bạn.`,
  },
  {
    id: 'tl4_06',
    category: 'tl4',
    title: 'Quản trị cảm xúc',
    description: 'Quy trình Neo vững 5 phút trước mỗi buổi tư vấn: nhận diện, buông kỳ vọng, xác nhận vai trò, thiết lập ý định.',
    duration: '3 phút',
    emoji: '🧘',
    keyLesson: 'Nếu vào buổi với kỳ vọng chốt, mọi câu hỏi của bạn sẽ vô tình hướng về đó, và khách cảm nhận được.',
    content: `Cảm xúc của cố vấn ảnh hưởng trực tiếp đến chất lượng buổi tư vấn. Nếu bạn lo lắng, khách sẽ lo lắng. Nếu bạn nôn nóng chốt, khách sẽ phòng thủ.

**Quy trình Neo vững 5 phút trước mỗi buổi tư vấn:**

**Bước 1: Nhận diện**
"Ngay lúc này mình đang ở trạng thái nào?" Chỉ gọi tên, không phán xét. Lo lắng? Hào hứng quá mức? Mệt mỏi?

**Bước 2: Buông kỳ vọng**
"Buổi này kết quả tốt nhất là khách rõ hơn, dù mua hay không."

**Bước 3: Xác nhận vai trò**
"Tôi là cố vấn. Vai trò của tôi là giúp khách nghĩ rõ."

**Bước 4: Thiết lập ý định**
Một mục tiêu quá trình cụ thể (không phải kết quả). Ví dụ: "Hôm nay mình sẽ lắng nghe ở tầng 3."

**Tại sao quy trình này quan trọng:**
- Nếu mang cảm xúc từ buổi trước sang buổi sau, bạn sẽ không có mặt hoàn toàn cho khách
- Nếu vào buổi với kỳ vọng chốt, mọi câu hỏi của bạn sẽ vô tình hướng về đó, và khách cảm nhận được
- Nếu không xác nhận vai trò, áp lực KPI sẽ biến bạn từ cố vấn thành người bán hàng`,
  },

  // ═══════════════════════════════════════════════════════════
  // TÀI LIỆU 5: XỬ LÝ TÌNH HUỐNG VÀ THỰC HÀNH
  // ═══════════════════════════════════════════════════════════

  {
    id: 'tl5_01',
    category: 'tl5',
    title: 'Tư duy đúng khi gặp từ chối',
    description: 'Không hỏi "làm sao vượt qua?" mà hỏi "Điểm Chạm nào chưa hoàn tất?"',
    duration: '3 phút',
    emoji: '🧭',
    keyLesson: 'Thay vì đối đầu với câu từ chối, quay lại dẫn dắt nhận thức ở đúng giai đoạn cần thiết.',
    content: `Khi khách từ chối, KHÔNG hỏi "làm sao vượt qua câu từ chối này?"
Hỏi: **"Điểm Chạm nào chưa hoàn tất? Mình cần quay lại đâu?"**

**Đọc ngược về 3 Điểm Chạm:**

**"Giá cao" / "Chưa cần"** → Chạm Con Đường chưa đủ sâu: khách chưa thấy giá trị phù hợp với chính mình.

**"Để suy nghĩ thêm" / "Chưa phải lúc"** → Chạm Động Lực chưa rõ: chưa kết nối quyết định với điều khách thật sự muốn.

**"Sợ không phù hợp" / "Ngại thử sai"** → Chạm Điểm Nghẽn chưa hoàn tất: chưa phân biệt được vấn đề gốc.

Cách tiếp cận này khác hoàn toàn với "xử lý objection" truyền thống. Thay vì đối đầu với câu từ chối, bạn quay lại dẫn dắt nhận thức ở đúng giai đoạn cần thiết.`,
  },
  {
    id: 'tl5_02',
    category: 'tl5',
    title: 'Phương pháp REFLECT',
    description: 'R-E-F-L-E-C-T: 7 bước phản chiếu khi gặp tình huống khó. Không tranh luận, không giải thích thêm.',
    duration: '4 phút',
    emoji: '💎',
    keyLesson: 'Nếu chưa sẵn sàng, dừng lại với phẩm giá. Không níu kéo. Giữ mối quan hệ cho tương lai.',
    content: `Không tranh luận. Không giải thích thêm. Phản chiếu lại đúng điều khách đang lo để họ tự nhìn thấy mình.

**R: Receive (Tiếp nhận)**
Thừa nhận, không phản bác. Cho khách biết bạn đã nghe và tôn trọng điều họ nói.

**E: Explore (Khám phá)**
Hỏi sâu hơn về nỗi sợ phía sau. Câu từ chối bề mặt luôn có nguyên nhân sâu hơn.

**F: Find the root (Tìm gốc)**
Xác định Điểm Chạm nào còn thiếu. Đây là bước chẩn đoán quan trọng nhất.

**L: Link back (Kết nối lại)**
Kết nối với động lực đã khai thác trước đó. Nhắc khách nhớ điều họ thật sự muốn.

**E: Empower (Trao quyền)**
Để khách tự kết luận. Không đưa ra kết luận thay họ.

**C: Check (Kiểm tra)**
Xác nhận nhận thức mới. "Anh/chị thấy như vậy có đúng không?"

**T: Trust the process (Tin vào quy trình)**
Nếu chưa sẵn sàng, dừng lại với phẩm giá. Không níu kéo. Giữ mối quan hệ cho tương lai.`,
  },
  {
    id: 'tl5_03',
    category: 'tl5',
    title: '6 lỗi mất vị thế',
    description: 'Sáu lỗi bộc lộ rõ nhất khi áp lực chốt tăng cao: nói nhiều, giải thích, phản biện, ép thời gian...',
    duration: '4 phút',
    emoji: '⚠️',
    keyLesson: 'Khi khách nói "sợ không phù hợp", họ không hỏi về sản phẩm. Họ đang lo về quyền kiểm soát quyết định.',
    content: `Sáu lỗi này bộc lộ rõ nhất trong tình huống khó, khi áp lực chốt tăng cao:

**1. Nói quá nhiều khi khách im lặng**
Lấp đầy im lặng cho khách thấy bạn không thoải mái, nghĩa là bạn đang cần họ hơn họ cần bạn.

**2. Giải thích sản phẩm khi khách bày tỏ lo lắng**
Khách nói "sợ không phù hợp" không phải hỏi về sản phẩm. Họ đang lo về quyền kiểm soát quyết định. Giải thích sản phẩm lúc này xác nhận nỗi sợ.

**3. Phản biện khi khách so sánh**
Khi bạn so sánh, bạn đang chấp nhận khung "ai tốt hơn ai." Người cố vấn không chơi trò đó.

**4. Tạo áp lực thời gian khi khách chần chừ**
"Ưu đãi chỉ còn hôm nay" → quyết định từ sợ bị bỏ lỡ → hủy, hối hận, ác cảm lâu dài.

**5. Nhượng bộ quá nhanh khi khách phản ứng mạnh**
Khách sẽ tự hỏi: "Nếu giảm được nhanh vậy, nghĩa là trước đó mình bị hét giá?" → mất vị thế cố vấn.

**6. Níu kéo khi khách muốn dừng**
Kiên trì là giữ mối quan hệ và chờ đúng thời điểm. Níu kéo là tiếp tục tác động khi khách đã cho tín hiệu muốn dừng. Với khách hàng cao cấp, bị níu kéo là trải nghiệm mất phẩm giá.`,
  },
  {
    id: 'tl5_04',
    category: 'tl5',
    title: 'Xử lý: "Giá cao quá"',
    description: 'Nỗi sợ thật không phải giá. Là sợ đầu tư sai. Đừng giảm giá, hãy hỏi "cao so với điều gì?"',
    duration: '3 phút',
    emoji: '💰',
    keyLesson: 'Giảm giá ngay = khách nghĩ giá ban đầu là "giá ảo." Hỏi "cao so với điều gì?" để hiểu nỗi sợ thật.',
    content: `**Nỗi sợ thật:** Sợ đầu tư sai, sợ không tạo ra thay đổi xứng đáng. Điểm Chạm còn thiếu: Chạm Con Đường.

**SAI:** Ngay lập tức giải thích giá trị hoặc giảm giá.

**ĐÚNG:**
"Em nghe anh/chị nói về giá. Em muốn hỏi thêm, khi anh/chị nói 'cao', anh/chị đang so sánh với điều gì ạ?" → Im lặng, nghe.

Sau đó: "Điều gì sẽ giúp anh/chị cảm thấy đầu tư này xứng đáng?"

**Phân tích theo nỗi sợ:**
- Nếu so với ngân sách → giúp tính giá trị đầu tư, "cái giá của sự trì hoãn"
- Nếu so với đối thủ → phân tích khác biệt về giá trị, không so sánh tính năng
- Nếu chưa thấy giá trị → quay lại Điểm Chạm nhận thức`,
  },
  {
    id: 'tl5_05',
    category: 'tl5',
    title: 'Xử lý: "Để suy nghĩ thêm"',
    description: 'Không kết thúc thụ động. Hỏi "Anh đang phân vân điều gì nhất?" để tìm nỗi sợ chưa nói.',
    duration: '3 phút',
    emoji: '🤔',
    keyLesson: '"Dạ vâng, nghĩ xong liên hệ em nhé" là cách kết thúc thụ động nhất. Hãy hỏi khách đang phân vân điều gì.',
    content: `**Nỗi sợ thật:** Chưa đủ rõ ràng bên trong để quyết định. Có thể vẫn còn nỗi sợ chưa được nói ra.

**SAI:** "Dạ vâng, anh/chị nghĩ xong liên hệ em nhé." (kết thúc thụ động, mất cơ hội)

**ĐÚNG:**
"Dạ em hiểu. Thường khi mình muốn suy nghĩ thêm là vì có điều gì đó chưa đủ rõ. Anh/chị đang phân vân điều gì nhất ạ?" → Im lặng, nghe thật sự.

**Điểm Chạm cần quay lại:** Thường là Chạm Động Lực chưa đủ sâu, hoặc Chạm Điểm Nghẽn chưa đủ rõ.

Nếu khách thật sự cần thời gian, tôn trọng điều đó. Nhưng hãy xác nhận bước tiếp theo cụ thể: "Em hoàn toàn hiểu. Vậy mình hẹn [ngày cụ thể] để anh/chị chia sẻ thêm suy nghĩ nhé?"`,
  },
  {
    id: 'tl5_06',
    category: 'tl5',
    title: 'Xử lý: Khách so sánh đối thủ',
    description: 'Không tấn công đối thủ. Không liệt kê điểm hơn. Để tiêu chí của KHÁCH làm khung đánh giá.',
    duration: '3 phút',
    emoji: '⚔️',
    keyLesson: 'Khi bạn so sánh, bạn chấp nhận khung "ai tốt hơn ai." Người cố vấn không chơi trò đó.',
    content: `**KHÔNG tấn công đối thủ. KHÔNG liệt kê điểm hơn.**

**SAI:** "Bên em khác bên đó ở chỗ bên em có thêm quyền lợi X, Y, Z."
**SAI:** "Nên cẩn thận với bên đó vì họ không có chứng nhận như bên em."

**ĐÚNG:** "Dạ việc anh/chị tìm hiểu nhiều bên là hoàn toàn hợp lý. Em muốn hỏi, tiêu chí nào anh/chị đang đặt nặng nhất để đánh giá?"

**ĐÚNG:** "Thay vì so sánh tính năng, mình thử nhìn vào điều anh/chị thật sự cần trước, rồi từ đó xem bên nào đáp ứng đúng nhất."

> Để tiêu chí của KHÁCH trở thành khung đánh giá, không phải tiêu chí của bạn.`,
  },
  {
    id: 'tl5_07',
    category: 'tl5',
    title: 'Xử lý: Người thứ ba & kiểm tra năng lực',
    description: 'Biến người đi cùng thành đồng minh. Khi bị hỏi năng lực, kể câu chuyện thật thay vì khoe thành tích.',
    duration: '3 phút',
    emoji: '👥',
    keyLesson: 'Bỏ qua người đi cùng = sau buổi gặp họ sẽ nói: "Anh cẩn thận, tôi thấy không ổn."',
    content: `**Khi có người thứ ba:**

**SAI:** Chỉ nói chuyện với người quyết định, bỏ qua người đi cùng.
**SAI:** Cố tách khách ra: "Anh/chị là người quyết định mà."

**ĐÚNG:** "Dạ rất vui được gặp cả anh/chị. Em muốn hỏi cả hai anh/chị, khi đánh giá một lựa chọn như thế này, điều gì quan trọng nhất với mỗi người?"

Khi người thứ ba không có mặt: "Thường thì anh/chị nhà quan tâm nhất điều gì khi đánh giá một quyết định như thế này? Để em giúp anh/chị có đủ thông tin khi mình trao đổi."

**Khi khách kiểm tra năng lực ("Em làm lâu chưa?"):**

**SAI:** "Dạ em đã tư vấn cho hơn 200 khách hàng..."
**SAI:** "Dạ em tuy còn trẻ nhưng rất tâm huyết..."

**ĐÚNG:** "Dạ em đã đồng hành cùng khá nhiều anh/chị trong lĩnh vực này. Nhưng em tin rằng điều quan trọng nhất không phải kinh nghiệm của em, mà là em có hiểu đúng tình huống của anh/chị hay không. Anh/chị cho phép em được hỏi thêm một chút nhé?"`,
  },
  {
    id: 'tl5_08',
    category: 'tl5',
    title: 'Chuẩn bị trước buổi tư vấn',
    description: 'Nghiên cứu khách hàng 3 lớp và quy trình Neo vững 5 phút trước mỗi buổi.',
    duration: '3 phút',
    emoji: '📋',
    keyLesson: 'Lớp 2 là dự đoán tâm lý, không phải kết luận. Sẵn sàng buông bỏ khi thực tế khác đi.',
    content: `**Nghiên cứu khách hàng 3 lớp:**

**Lớp 1: Bối cảnh khách quan**
Ngành nghề, vị trí, giai đoạn hiện tại (khởi đầu/tăng trưởng/chuyển đổi). Lớp này chỉ cung cấp sự kiện, không phải ý nghĩa.

**Lớp 2: Dự đoán tâm lý (3 dự đoán)**
- Lăng kính đánh giá: tài chính, cảm xúc hay lý trí?
- Phong cách quyết định: nhanh/chậm, độc lập/cần tham khảo?
- Nỗi sợ có thể gặp: trong 6 nỗi sợ cốt lõi?

Đây là dự đoán, không phải kết luận. Sẵn sàng buông bỏ khi thực tế khác đi.

**Lớp 3: 2 đến 3 câu hỏi cốt lõi cần làm rõ**
Ví dụ: "Điều gì đang thật sự khiến họ tìm tới mình ở thời điểm này?"

**Quy trình Neo vững 5 phút:**
1. Nhận diện trạng thái hiện tại (gọi tên cảm xúc)
2. Buông kỳ vọng kết quả
3. Xác nhận vai trò: "Tôi là cố vấn, không phải người bán"
4. Thiết lập ý định quá trình: "Hôm nay mình sẽ [kỹ năng cụ thể]"`,
  },
  {
    id: 'tl5_09',
    category: 'tl5',
    title: 'Kịch bản nhắn tin',
    description: 'Tin nhắn tiếp cận lạnh, sau buổi gặp (24h), và follow-up (3-7 ngày). Mang giá trị, không hỏi "quyết định chưa?"',
    duration: '3 phút',
    emoji: '💬',
    keyLesson: 'Tin nhắn follow-up phải mang thêm giá trị, không chỉ hỏi "có quyết định chưa?"',
    content: `**Tin nhắn tiếp cận lạnh (Cold outreach):**

SAI: "Em chào anh/chị, em là [tên] từ công ty [X], em muốn giới thiệu..."
ĐÚNG: "Chào [tên], mình thấy anh/chị đang [bối cảnh cụ thể]. Mình có [1 điều cụ thể] có thể có ích. Anh/chị có 5 phút để mình chia sẻ không?"

Nguyên tắc: Cá nhân hóa → Liên quan đến họ → Hỏi xin phép (không ép).

**Tin nhắn sau buổi gặp (trong vòng 24 giờ):**

"Chào anh/chị [tên], cảm ơn anh/chị đã dành thời gian hôm nay. Điều mình ấn tượng nhất từ cuộc trò chuyện là [điều cụ thể khách chia sẻ]. Bước tiếp theo mình đã thống nhất là [action cụ thể] vào [thời gian]. Anh/chị có cần bổ sung gì không ạ?"

**Tin nhắn follow-up (3 đến 7 ngày):**

Mang thêm giá trị, KHÔNG chỉ hỏi "có quyết định chưa?"

"Chào anh/chị [tên], không biết anh/chị đã có thêm suy nghĩ gì chưa. Mình vừa [đọc/gặp/nghĩ] về [vấn đề mà khách đề cập], và thấy [1 góc nhìn mới] có thể liên quan đến điều anh/chị đang cân nhắc. Anh/chị có muốn nghe không?"`,
  },
  {
    id: 'tl5_10',
    category: 'tl5',
    title: '9 lỗi phổ biến nhất',
    description: 'Từ nói về giải pháp quá sớm, đến nghe để phản hồi thay vì nghe để hiểu, đến níu kéo khi khách muốn dừng.',
    duration: '4 phút',
    emoji: '🚫',
    keyLesson: 'Sai lầm phổ biến nhất: nói về giải pháp trước khi khách hiểu vấn đề của mình.',
    content: `**1. Nói về giải pháp trước khi khách hiểu vấn đề của mình.** Đây là sai lầm phổ biến nhất. Khách chưa sẵn sàng nghe giải pháp nếu họ chưa nhìn rõ vấn đề.

**2. Nghe để phản hồi, không phải nghe để hiểu.** Đang nghĩ điều sẽ nói trong khi khách chưa nói xong.

**3. Nhầm sự quan tâm với sự sẵn sàng quyết định.** Khách gật đầu nhiều không có nghĩa là khách đã sẵn sàng.

**4. Lấp đầy khoảng im lặng bằng thông tin sản phẩm.** Im lặng là không gian nhận thức, không phải khoảng trống cần lấp.

**5. Xử lý từ chối bề mặt thay vì đọc nỗi sợ bên trong.** Giải thích thêm khi khách do dự chỉ tạo thêm áp lực.

**6. Mang cảm xúc từ buổi trước sang buổi sau.** Mỗi buổi cần bắt đầu từ trạng thái trung lập.

**7. Cố "bán" khi khách chưa sẵn sàng.** Mất tin cậy vĩnh viễn, mất mối quan hệ dài hạn.

**8. Nhượng bộ quá nhanh khi khách phản ứng.** Tạo nghi ngờ "vậy trước đó mình bị hét giá?"

**9. Níu kéo khi khách muốn dừng.** Với khách hàng cao cấp, bị níu kéo là trải nghiệm mất phẩm giá.`,
  },
];
