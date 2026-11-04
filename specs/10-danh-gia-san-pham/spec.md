# 10 — Đánh giá sản phẩm

- **Trạng thái:** Đã xong (04/11/2026)
- **Cách viết:** SDD đầy đủ, viết **trước** khi làm (04/11/2026)
- **Người duyệt:** Nhóm 01 — 04/11/2026, đồng ý cả 4 phương án ở mục 6

## 1. Bối cảnh

Nhạc cụ là món đồ khá đắt, người mua thường muốn nghe ý kiến của người đã dùng trước khi quyết định. Hiện trang chi tiết sản phẩm chỉ có mô tả của cửa hàng. Chức năng này cho phép **khách đã thực sự mua và nhận hàng** chấm sao và viết nhận xét, giúp đánh giá đáng tin hơn so với cho ai cũng viết được.

## 2. Câu chuyện người dùng

- Là **khách đang xem sản phẩm**, tôi muốn **thấy điểm trung bình và các nhận xét** để quyết định có mua không.
- Là **khách đã nhận hàng**, tôi muốn **chấm từ 1 đến 5 sao và viết nhận xét** để chia sẻ trải nghiệm.
- Là **khách đã đánh giá**, tôi muốn **sửa lại đánh giá của mình** khi dùng lâu hơn và đổi ý.
- Là **quản trị viên**, tôi muốn **ẩn nhận xét không phù hợp** (spam, lời lẽ xúc phạm).

## 3. Phạm vi

**Có làm:**
- Hiển thị điểm trung bình, số lượt đánh giá và danh sách nhận xét trên trang chi tiết sản phẩm.
- Hiển thị điểm trung bình trên thẻ sản phẩm ở trang chủ và trang sản phẩm.
- Khách đủ điều kiện gửi và sửa đánh giá của mình.
- Tab "Đánh giá" trong trang quản trị để xem và ẩn/hiện đánh giá.
- Dữ liệu đánh giá mẫu trong `npm run demo`.

**Không làm (để sau):**
- Đăng ảnh kèm đánh giá.
- Cửa hàng trả lời đánh giá.
- Bấm "hữu ích" cho đánh giá, lọc hoặc sắp xếp đánh giá theo số sao.
- Phân trang danh sách đánh giá.
- Khách tự xóa đánh giá (thay vào đó có thể sửa).

## 4. Quy tắc nghiệp vụ

1. **Điều kiện đánh giá:** người dùng đã đăng nhập và có **ít nhất một đơn ở trạng thái "Hoàn thành" chứa sản phẩm đó**. Đơn đang giao hoặc đã hủy không tính.
2. **Mỗi người chỉ có một đánh giá cho mỗi sản phẩm.** Gửi lại thì cập nhật đánh giá cũ, không tạo thêm.
3. **Số sao:** số nguyên từ 1 đến 5, bắt buộc.
4. **Nhận xét:** không bắt buộc, tối đa 1000 ký tự, khoảng trắng đầu cuối bị bỏ.
5. **Hiển thị người viết:** chỉ hiện họ tên, **không hiện email**.
6. **Điểm trung bình** làm tròn 1 chữ số thập phân, chỉ tính các đánh giá đang hiển thị. Sản phẩm chưa có đánh giá thì hiện "Chưa có đánh giá".
7. **Thứ tự:** đánh giá mới nhất (theo thời điểm gửi hoặc sửa gần nhất) lên đầu.
8. **Ẩn đánh giá:** chỉ quản trị viên được ẩn hoặc hiện lại. Đánh giá bị ẩn không hiện cho khách khác và không tính vào điểm trung bình. Người viết vẫn thấy đánh giá của mình kèm ghi chú "Đánh giá của bạn đang bị ẩn".
9. Khi người viết **sửa** một đánh giá đang bị ẩn thì đánh giá **vẫn bị ẩn** cho đến khi quản trị viên hiện lại (tránh lách việc kiểm duyệt).
10. **Sản phẩm bị ẩn:** không xem và không gửi đánh giá được (như mọi trang khác của sản phẩm ẩn).
11. Áp dụng toàn bộ yêu cầu bảo mật chung trong [06-bao-mat](../06-bao-mat/spec.md); đặc biệt nhận xét phải được escape khi hiển thị (BM-04).

## 5. Tiêu chí nghiệm thu

Bài test tự động nằm trong `test/api.test.js`, chạy bằng `npm test`. Tiêu chí thủ công đã bấm thử bằng Chrome ngày 04/11/2026 trên dữ liệu `npm run demo`; ảnh chụp trong `bao-cao/hinh/17` đến `25`.

| Mã | Tiêu chí | Kiểm tra |
|---|---|---|
| DG-01 | Khi chưa đăng nhập thì vẫn xem được danh sách đánh giá và điểm trung bình của sản phẩm | Tự động: `đánh giá: ai cũng xem được, chưa đăng nhập thì không gửi được` |
| DG-02 | Khi chưa đăng nhập mà gửi đánh giá thì báo 401 | Tự động: như DG-01 |
| DG-03 | Khi chưa có đơn "Hoàn thành" chứa sản phẩm (chưa mua, hoặc đơn đang giao, hoặc đã hủy) thì không gửi được (403) | Tự động: `đánh giá: chỉ khách có đơn hoàn thành chứa sản phẩm mới gửi được` |
| DG-04 | Khi đã có đơn "Hoàn thành" chứa sản phẩm thì gửi được đánh giá; đánh giá xuất hiện trong danh sách với họ tên, không có email | Tự động: như DG-03 |
| DG-05 | Khi gửi đánh giá lần hai cho cùng sản phẩm thì đánh giá cũ được cập nhật, tổng số đánh giá không tăng | Tự động: `đánh giá: gửi lại thì cập nhật, không tạo thêm` |
| DG-06 | Khi số sao không phải số nguyên 1–5, hoặc nhận xét dài quá 1000 ký tự thì báo 400 | Tự động: `đánh giá: từ chối số sao và nhận xét không hợp lệ` |
| DG-07 | Khi có nhiều đánh giá thì điểm trung bình đúng và làm tròn 1 chữ số; `/api/catalog` trả kèm điểm trung bình và số lượt cho từng sản phẩm | Tự động: `đánh giá: điểm trung bình đúng và có trong danh mục sản phẩm` |
| DG-08 | Khi quản trị viên ẩn một đánh giá thì khách khác không thấy và điểm trung bình được tính lại; hiện lại thì trở về như cũ | Tự động: `đánh giá: admin ẩn thì khách khác không thấy, sửa không tự hiện lại, khách không ẩn được` |
| DG-09 | Khi người viết sửa đánh giá đang bị ẩn thì đánh giá vẫn bị ẩn | Tự động: như DG-08 |
| DG-10 | Khi khách gọi API ẩn đánh giá thì bị từ chối (403) | Tự động: như DG-08 |
| DG-11 | Khi sản phẩm bị ẩn hoặc không tồn tại thì xem và gửi đánh giá đều báo 404 | Tự động: `đánh giá: sản phẩm ẩn hoặc không tồn tại thì báo 404` |
| DG-12 | Khi nhận xét chứa mã HTML như `<img src=x onerror=alert(1)>` thì hiển thị nguyên văn dạng chữ, không chạy mã | Thủ công: đã kiểm tra, ảnh 22 — nhận xét hiện nguyên văn, không có thẻ `<img>`, không bật hộp `alert` |
| DG-13 | Trên trang chi tiết: khách đủ điều kiện thấy biểu mẫu chấm sao; khách chưa đủ điều kiện thấy lời giải thích "Chỉ khách đã nhận hàng mới đánh giá được"; người chưa đăng nhập thấy nút đăng nhập | Thủ công: đã kiểm tra, ảnh 19, 20, 21, 23 — cả 4 trường hợp, kể cả đăng nhập ngay tại trang thì biểu mẫu tự hiện |
| DG-14 | Thẻ sản phẩm có đánh giá thì hiện số sao trung bình và số lượt | Thủ công: đã kiểm tra, ảnh 17, 18 |
| DG-15 | Sau `npm run demo` thì có sẵn đánh giá mẫu, chỉ của khách có đơn "Hoàn thành" | Thủ công: đã kiểm tra — 8 đánh giá mẫu, 1 bị ẩn; mỗi đánh giá mẫu đều đi qua `saveReview` nên không thể tạo cho khách chưa nhận hàng |

## 6. Câu hỏi mở

AI đề xuất phương án cho từng điểm. **Nhóm đã duyệt ngày 04/11/2026: đồng ý cả 4 phương án đề xuất.**

1. **Ai được đánh giá?** Đề xuất: chỉ khách có đơn "Hoàn thành". Phương án khác: ai đăng nhập cũng đánh giá được (dễ hơn nhưng dễ bị spam).
2. **Có bắt buộc viết nhận xét không?** Đề xuất: không bắt buộc, chỉ cần chấm sao.
3. **Quản trị viên ẩn hay xóa hẳn đánh giá?** Đề xuất: ẩn, để còn hiện lại được nếu ẩn nhầm (giống cách làm với sản phẩm).
4. **Tài khoản admin có được đánh giá không?** Đề xuất: theo cùng một quy tắc 1 — admin cũng phải có đơn "Hoàn thành" mới đánh giá được.
