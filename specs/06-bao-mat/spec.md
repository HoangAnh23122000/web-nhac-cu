# 06 — Yêu cầu bảo mật chung

- **Trạng thái:** Đã xong
- **Cách viết:** Viết lại sau khi làm (04/11/2026), mô tả đúng hệ thống hiện tại.

Đây là yêu cầu áp dụng cho **mọi chức năng**, kể cả chức năng làm sau. Khi viết đặc tả mới phải kiểm tra lại danh sách này.

## Yêu cầu

| Mã | Yêu cầu | Cách thực hiện | Kiểm tra |
|---|---|---|---|
| BM-01 | Không lưu mật khẩu dạng thô | Băm bằng bcrypt (`server/routes/auth.js`) | Tự động: TK-01 |
| BM-02 | Phiên đăng nhập không bị JavaScript đọc trộm | Cookie `HttpOnly`, `SameSite=Lax`; CSDL chỉ lưu bản băm SHA-256 của token (`server/auth.js`) | Tự động: TK-01 kiểm tra `HttpOnly` |
| BM-03 | Chống SQL injection | Mọi câu SQL dùng tham số `?`, không ghép chuỗi dữ liệu người dùng | Đọc code |
| BM-04 | Chống XSS | Mọi dữ liệu người dùng nhập đi qua `esc()` trước khi đưa vào HTML (`public/app.js`); có Content Security Policy chỉ cho chạy script của chính trang | Tự động: `bảo mật: ... có header bảo mật` |
| BM-05 | Không tin dữ liệu từ trình duyệt | Mọi dữ liệu kiểm tra lại ở máy chủ (`server/validate.js`); giá tính ở máy chủ | Tự động: DH-02, DH-08 |
| BM-06 | Phân quyền ở máy chủ, không chỉ ẩn nút trên giao diện | `requireLogin`, `requireAdmin` (`server/auth.js`) | Tự động: TK-06 |
| BM-07 | Không lộ chi tiết lỗi | Lỗi ngoài dự kiến trả "Máy chủ gặp lỗi"; JSON hỏng trả 400 | Tự động: `bảo mật: ... lỗi JSON trả về 400 ...` |
| BM-08 | Hạn chế dò mật khẩu | Giới hạn 20 lần / 15 phút cho đăng nhập, đăng ký; so sánh với mã băm giả khi email không tồn tại để thời gian phản hồi như nhau | Thủ công: TK-08 |
| BM-09 | Không lộ dữ liệu của người khác | Khách truy cập đơn người khác nhận 404 | Tự động: DO-02 |
