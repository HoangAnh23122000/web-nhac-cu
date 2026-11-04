# Nhật ký SDD — Đánh giá sản phẩm

Ghi lại từng bước làm chức năng theo quy trình SDD, gồm yêu cầu nhóm gửi cho AI, kết quả AI trả về và những gì nhóm đã duyệt hoặc sửa. Dùng làm tư liệu cho phần "Giải pháp" và "Các công cụ AI đã dùng" trong báo cáo.

**Công cụ:** Claude Code (mô hình Claude Opus 5.5) chạy trong VS Code.

---

## Bước 0 — Chọn quy trình và chức năng (04/11/2026)

**Yêu cầu gửi cho AI:**
> SDD — Spec Driven Development tui muốn thêm SDD vào được không

**AI trả lời:** giải thích SDD gồm 4 bước (spec → plan → tasks → code và test). AI lưu ý rằng các chức năng hiện có được làm trước, không theo SDD, nên không được ghi trong báo cáo là "làm SDD từ đầu". AI đề xuất chia 2 phần:
- **Phần A:** viết bổ sung đặc tả cho chức năng cũ, ghi rõ là "viết lại sau khi làm", nối từng tiêu chí với bài test có sẵn.
- **Phần B:** làm SDD thật cho một chức năng mới.

**Nhóm quyết định:**
> làm cả A và B
> chọn chức năng Đánh giá sản phẩm

## Bước 0.5 — Phần A: đặc tả cho chức năng cũ (04/11/2026)

**AI đã làm:**
- Đọc toàn bộ mã máy chủ, giao diện và 20 bài test.
- Viết 6 đặc tả `specs/01` đến `specs/06`, tổng cộng 51 tiêu chí nghiệm thu có mã (TK, SP, DH, DO, QT, BM).
- Nối từng tiêu chí với bài test tự động; tiêu chí về giao diện thì ghi cách bấm thử.
- Viết script kiểm tra tên bài test ghi trong spec: tất cả đều khớp với file `test/api.test.js`.
- Thêm `CLAUDE.md` để mọi lần làm việc sau AI đều phải theo quy trình SDD.

## Bước 1 — Đặc tả (spec.md) (04/11/2026)

**AI đã làm:** soạn [spec.md](spec.md) gồm 4 câu chuyện người dùng, phạm vi có làm/không làm, 11 quy tắc nghiệp vụ, 15 tiêu chí nghiệm thu (DG-01 đến DG-15) và 4 câu hỏi mở kèm phương án đề xuất.

**AI dừng lại chờ duyệt**, không viết code. AI nêu 4 điểm cần nhóm quyết định: ai được đánh giá, có bắt buộc viết nhận xét không, ẩn hay xóa đánh giá xấu, admin có được đánh giá không.

**Nhóm duyệt:**
> ok

Nhóm đồng ý cả 4 phương án đề xuất. Trạng thái spec chuyển sang "Đã duyệt".

## Bước 2 — Kế hoạch kỹ thuật (plan.md)

**AI đã làm (04/11/2026):** soạn [plan.md](plan.md) từ spec đã duyệt, gồm thiết kế bảng `reviews` (dùng ràng buộc `UNIQUE` để mỗi người chỉ có một đánh giá), 4 API, giao diện, danh sách file sẽ sửa, bảng nối 7 bài test với tiêu chí DG, và 5 rủi ro kèm cách xử lý.

Một điểm AI tự phát hiện khi đọc code: web dùng dấu `#` trên địa chỉ để chuyển trang, nên không thể dùng liên kết `#reviews` để cuộn xuống mục đánh giá. AI đã ghi điểm này vào plan để tránh lỗi khi code.

**Nhóm duyệt:**
> ok

## Bước 3 — Danh sách việc (tasks.md)

**AI đã làm (04/11/2026):** chia plan thành 13 việc (T1–T13), mỗi việc có điều kiện "xong khi". Test được viết trước code cho các việc phía máy chủ.

**Nhóm duyệt:** đồng ý cùng lúc với plan ("ok").

## Bước 4 — Code và kiểm thử (04/11/2026)

**Nhóm cho phép bắt đầu:**
> ok

### Viết test trước, rồi mới code (phía máy chủ)

1. **T1:** thêm bảng `reviews`. Chạy `npm test`: 20/20 bài cũ vẫn qua, tức là bảng mới không làm hỏng chức năng cũ.
2. **T6:** viết 7 bài test cho DG-01 đến DG-11 **trước khi có code**. Chạy `npm test`: 20 qua, **7 lỗi** (đúng như mong đợi, vì chưa có API).
3. **T2–T5:** viết `server/reviews.js`, `server/routes/reviews.js`, thêm API quản trị và điểm trung bình trong danh mục. Chạy `npm test`: **27/27 qua**.

### Giao diện và bấm thử trên trình duyệt (T7–T13)

AI viết giao diện, rồi viết một script điều khiển Chrome để bấm thử như người dùng thật: đăng nhập, chọn sao, gõ nhận xét có mã độc, gửi, đăng nhập quản trị, xem trên màn hình điện thoại. Script chụp ảnh từng bước để AI xem lại.

**Các vấn đề phát hiện trong lúc bấm thử:**

| # | Hiện tượng | Nguyên nhân | Ai sai | Cách xử lý |
|---|---|---|---|---|
| 1 | Tab quản trị hiện "Không có quyền truy cập" | Script đăng nhập bằng API rồi chỉ đổi `#` trên địa chỉ, nên trang không tải lại và vẫn nhớ người dùng cũ | Script kiểm tra | Script tải lại trang sau mỗi lần chuyển |
| 2 | Sau khi gửi, ô nhận xét chỉ còn "Đàổ" | Đã chạy script nhiều lần nên chạm giới hạn 20 lần đăng nhập / 15 phút; máy chủ trả mã 429 nhưng script không kiểm tra | Script kiểm tra | Script báo lỗi ngay khi đăng nhập thất bại. Việc này tình cờ xác nhận giới hạn đăng nhập (TK-08) hoạt động đúng |
| 3 | **Sao đã chọn sẵn không được tô màu** (đánh giá 3 sao vẫn hiện 5 sao xám) | Khi chỉnh hiệu ứng rê chuột, AI dùng `:where()` làm quy tắc "sao đã chọn" có độ ưu tiên CSS thấp hơn quy tắc màu xám mặc định | **Code của AI** | Sắp lại độ ưu tiên CSS; thêm kiểm tra đếm số sao được tô màu thật vào script |
| 4 | Chuột ảo không tác động được vào trang ở các bước sau | Tab trình duyệt dùng chung qua nhiều lần đăng nhập/tải lại | Script kiểm tra | Mở tab mới cho phần kiểm tra DG-12 |
| 5 | Tiêu đề "Chưa có đánh giá" quá to, xuống 2 dòng | Dùng lại kiểu tiêu đề lớn của trang | Code của AI | Giảm cỡ chữ |

**Bài học:** lỗi số 3 là lỗi thật của web, và **các bài test tự động không bắt được** vì nó chỉ nằm ở giao diện. Script ban đầu cũng bỏ sót vì chỉ kiểm tra ô nào được chọn, không kiểm tra màu. AI chỉ phát hiện ra nhờ **nhìn ảnh chụp màn hình**. Vì vậy với phần giao diện, vẫn cần người (hoặc AI) nhìn tận mắt chứ không thể chỉ dựa vào test.

### Kết quả cuối

- `npm test`: **27/27 qua** (20 bài cũ + 7 bài mới).
- Bấm thử trên Chrome: **13/13 mục đạt**, gồm DG-12 đến DG-15, hiệu ứng chọn sao, tab quản trị, màn hình điện thoại không tràn ngang, không có lỗi JavaScript.
- Ảnh chụp cho báo cáo: `bao-cao/hinh/17` đến `25`.
- Mọi tiêu chí trong [spec.md](spec.md) đã được ghi cách kiểm tra cụ thể.

### File đã thay đổi

| File | Thay đổi |
|---|---|
| `server/db.js` | Bảng `reviews` |
| `server/reviews.js` | Mới — nghiệp vụ đánh giá |
| `server/routes/reviews.js` | Mới — API xem và gửi đánh giá |
| `server/routes/admin.js` | API quản trị đánh giá |
| `server/routes/catalog.js` | Điểm trung bình trong dữ liệu sản phẩm |
| `server/app.js` | Gắn đường dẫn mới |
| `server/demo.js` | 8 đánh giá mẫu |
| `public/app.js`, `public/styles.css` | Giao diện |
| `test/api.test.js` | 7 bài test mới |
