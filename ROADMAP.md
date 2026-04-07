# ROADMAP: Sales Coach App → Store-Ready

> Cập nhật: 2026-04-07
> Mục tiêu: App coaching sales xịn nhất Việt Nam, sẵn sàng lên Google Play + Apple App Store

---

## Đã hoàn thành

- [x] 32 bài học chuyên sâu (5 tài liệu TTA, filter theo chủ đề)
- [x] Màn hình Giới thiệu + bản quyền + pháp lý + ảnh tác giả
- [x] Upload ảnh đại diện user + ảnh khách hàng CRM
- [x] Auth: đăng ký / đăng nhập (Supabase Auth)
- [x] Team: tạo team, mã mời, phân quyền Admin/Manager/Member
- [x] Cloud sync: sessions, customers, conversations, lessons lên Supabase
- [x] AI usage logging (log mỗi lần gọi AI)
- [x] Admin Dashboard: stats team, AI usage, bảng xếp hạng, tiến độ đào tạo
- [x] Quota AI: 500 lượt/người/tháng
- [x] Export báo cáo: chia sẻ text qua Zalo/Email
- [x] Push notification: nhắc học (8h) + nhắc ghi âm (17h)
- [x] Fix toàn bộ lỗi TypeScript (0 errors)
- [x] Edge Functions proxy AI (file sẵn, chưa deploy)
- [x] Tagline trang chủ: "AI Coaching cho Sales | by Coach Duy Nguyễn"

---

## Giai đoạn 1: BẮT BUỘC trước khi lên Store

> Không có những mục này sẽ bị reject bởi cả Google Play và Apple App Store.

- [ ] **Bảo mật API key**
  - Xóa API key khỏi git history (đang lộ OpenAI + Claude key)
  - Dùng EAS Secrets cho production build
  - Deploy Edge Functions proxy (AI call qua server, không lộ key trong app)

- [ ] **Privacy Policy (Chính sách bảo mật)**
  - Tạo trang web chính sách bảo mật (tiếng Việt + tiếng Anh)
  - Nội dung: thu thập dữ liệu gì, dùng để làm gì, chia sẻ với ai, cách xóa
  - Host trên GitHub Pages hoặc website riêng
  - Link vào màn hình Giới thiệu trong app

- [ ] **Terms of Service (Điều khoản sử dụng)**
  - Tạo trang web điều khoản sử dụng
  - Nội dung: quyền sử dụng, giới hạn, sở hữu trí tuệ, miễn trừ trách nhiệm
  - Link vào app

- [ ] **Khai báo permissions (iOS)**
  - NSMicrophoneUsageDescription: ghi âm buổi tư vấn
  - NSCameraUsageDescription: chụp ảnh đại diện
  - NSPhotoLibraryUsageDescription: chọn ảnh từ thư viện
  - PrivacyInfo.xcprivacy manifest (yêu cầu iOS 17+)

- [ ] **Error Boundary**
  - Bắt crash toàn app, hiện màn hình lỗi thân thiện thay vì trắng màn hình
  - Log crash lên Sentry/analytics

- [ ] **Offline detection**
  - Dùng @react-native-community/netinfo (đã cài)
  - Hiện banner "Không có kết nối mạng" khi offline
  - Chặn gọi AI khi offline (tránh lỗi im lặng)

- [ ] **Tính năng Xóa tài khoản**
  - Yêu cầu bắt buộc của cả Apple và Google
  - User nhấn "Xóa tài khoản" trong Cài Đặt
  - Xóa toàn bộ data trên Supabase + local
  - Xóa auth account

- [ ] **Icon + Splash chuyên nghiệp**
  - Icon app 1024x1024 (thiết kế chuyên nghiệp, có logo)
  - Splash screen đẹp (logo + tagline + màu thương hiệu)
  - Adaptive icon cho Android (foreground + background)

---

## Giai đoạn 2: CHẤT LƯỢNG

> Nâng cao độ ổn định, chuyên nghiệp, trải nghiệm mượt mà.

- [x] **Xóa console.log/warn** (đã thay bằng silent comments)
- [x] **Retry logic cho API calls** (auto retry 2 lần khi lỗi mạng/429)
- [x] **Accessibility labels** (tab navigation)
- [x] **Version management** (hiển thị version trong Cài Đặt)
- [ ] **Crash reporting (Sentry)**
  - Tự động báo cáo crash + lỗi
  - Dashboard theo dõi lỗi realtime
  - Gắn user ID để biết ai gặp lỗi

- [ ] **Accessibility (Hỗ trợ người khuyết tật)**
  - Thêm accessibilityLabel cho tất cả nút, icon, input
  - Test với VoiceOver (iOS) và TalkBack (Android)
  - WCAG compliance (yêu cầu của store)

- [ ] **Retry logic cho API calls**
  - Tự thử lại 3 lần khi API lỗi mạng
  - Exponential backoff (1s, 2s, 4s)
  - Hiện thông báo thân thiện khi thất bại

- [ ] **Xóa console.log/warn trong production**
  - Thay bằng proper logging (Sentry)
  - Xóa mock data và debug code

- [ ] **Version management**
  - Auto increment version khi build
  - Hiện version + build number trong Cài Đặt
  - Changelog cho mỗi phiên bản

- [ ] **Mã hóa dữ liệu local**
  - Dùng expo-secure-store cho dữ liệu nhạy cảm
  - Mã hóa thông tin khách hàng, API keys
  - Bảo vệ khi thiết bị bị mất/hack

---

## Giai đoạn 3: TRẢI NGHIỆM ĐỈNH CAO

> Tạo sự khác biệt, trải nghiệm vượt trội so với đối thủ.

- [x] **Dark mode** (Sáng/Tối/Hệ thống, toggle trong Cài Đặt)
- [x] **Biểu đồ Admin Dashboard** (Bar chart điểm TB, Pie chart tỷ lệ deal)
- [x] **Search bar trang chủ** (dẫn tới Đào Tạo)
- [x] **Gamification** (Streak 🔥 + 12 badges: buổi đầu, deal đầu, streak 3/7/30 ngày, tốt nghiệp...)
- [ ] **Onboarding mới**
  - Video intro ngắn hoặc animation đẹp
  - Hướng dẫn tính năng chính bằng hình ảnh
  - Tour guide khi dùng lần đầu

- [ ] **Dark mode**
  - Giao diện tối cho ban đêm
  - Tự động theo cài đặt hệ thống
  - Toggle trong Cài Đặt

- [ ] **Biểu đồ trực quan (Admin Dashboard)**
  - Line chart: trend điểm số theo tuần/tháng
  - Bar chart: so sánh nhân viên
  - Pie chart: breakdown AI usage
  - Dùng react-native-chart-kit hoặc victory-native

- [ ] **Search toàn app**
  - Tìm kiếm bài học, khách hàng, lịch sử ghi âm
  - Kết quả tức thì khi gõ
  - Thanh search ở trang chủ

- [ ] **Multi-language (English)**
  - Hỗ trợ tiếng Anh (mở rộng thị trường quốc tế)
  - i18n framework
  - Toggle ngôn ngữ trong Cài Đặt

- [ ] **Widget (Android/iOS)**
  - Widget nhắc nhở trên home screen
  - Hiện stats nhanh (buổi ghi tuần này, điểm TB)

- [ ] **Gamification**
  - Streak (chuỗi ngày dùng app liên tục)
  - Badge/huy hiệu cho thành tựu
  - Leaderboard team hàng tuần

---

## Giai đoạn 4: LÊN STORE

> Chuẩn bị tài khoản, listing, và submit app.

- [ ] **Apple Developer Account**
  - Đăng ký tại developer.apple.com ($99/năm)
  - Cần Apple ID
  - Nếu đăng ký dạng Organization: cần DUNS number

- [ ] **Google Play Console**
  - Đăng ký tại play.google.com/console ($25 một lần)
  - Cần Google account

- [ ] **Screenshots + Video**
  - 5-8 screenshots cho mỗi store (phone + tablet)
  - 1 video giới thiệu 30-60 giây
  - Thiết kế có text overlay tiếng Việt
  - Kích thước: iPhone 6.7", 6.1", iPad, Android phone + tablet

- [ ] **Store listing**
  - Tên app: "Sales Coach - AI Coaching cho Sales"
  - Mô tả ngắn (80 ký tự): "Nâng cao kỹ năng tư vấn bán hàng với AI Coach"
  - Mô tả dài (4000 ký tự): tính năng, lợi ích, framework TTA
  - Keywords: sales coaching, AI, bán hàng, tư vấn, CRM
  - Category: Education hoặc Business
  - Content rating: Everyone

- [ ] **TestFlight (iOS beta testing)**
  - Build iOS production
  - Mời 5-10 người test qua TestFlight
  - Thu thập feedback trước khi submit chính thức

- [ ] **Internal testing (Google Play)**
  - Upload AAB lên Internal testing track
  - Test trên nhiều thiết bị Android
  - Kiểm tra crash, performance, UX

- [ ] **Submit lên Store**
  - Google Play: review 1-2 giờ (thường chấp nhận nhanh)
  - Apple App Store: review 1-3 ngày (nghiêm ngặt hơn)
  - Chuẩn bị trả lời câu hỏi từ reviewer nếu bị reject

---

## Ghi chú kỹ thuật

### Supabase Project
- URL: https://zylhbymktdtmitxsunqv.supabase.co
- Account: nextstepacademyvietnam@gmail.com
- Dashboard: https://supabase.com/dashboard

### EAS Build
- Account: coachduynguyen
- Dashboard: https://expo.dev/accounts/coachduynguyen/projects/SalesCoachApp

### GitHub Repo
- https://github.com/coachduyNguyen-creator/salesaicoach

### Liên hệ tác giả
- Coach Duy Nguyễn
- Email: coachduynguyen@gmail.com
- Facebook/YouTube/TikTok: @coachduynguyen

---

*Tài liệu này được tạo tự động và cập nhật theo tiến độ phát triển.*
