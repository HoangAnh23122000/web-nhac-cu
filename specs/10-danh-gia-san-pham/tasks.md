# 10 — Đánh giá sản phẩm: Danh sách việc

Dựa trên: [plan.md](plan.md). Làm lần lượt; mỗi việc xong thì chạy `npm test` và đánh dấu.

## Máy chủ

- [x] **T1.** Thêm bảng `reviews` vào `server/db.js`. — *xong khi:* `npm test` vẫn qua hết 20 bài cũ.
- [x] **T2.** Viết `server/reviews.js` (`canReview`, `ratingSummary`, `listReviews`, `saveReview`).
- [x] **T3.** Viết `server/routes/reviews.js` (GET, POST) và gắn vào `server/app.js`. — *xong khi:* các test DG-01 đến DG-06, DG-11 qua.
- [x] **T4.** Thêm `rating` vào dữ liệu sản phẩm trong `server/routes/catalog.js`. — *xong khi:* test DG-07 qua.
- [x] **T5.** Thêm API quản trị trong `server/routes/admin.js`. — *xong khi:* test DG-08 đến DG-10 qua.

## Kiểm thử

- [x] **T6.** Viết 7 bài test `đánh giá: ...` trong `test/api.test.js` theo bảng ở plan mục 6. (Viết cùng lúc với T3–T5: viết test trước, chạy thấy lỗi, rồi code cho qua.)

## Giao diện

- [x] **T7.** Thẻ sản phẩm và dòng tóm tắt sao ở trang chi tiết. — *xong khi:* DG-14 đúng khi bấm thử.
- [x] **T8.** Mục "Đánh giá từ khách đã mua": tóm tắt, biểu mẫu theo 4 trường hợp, danh sách; tự tải lại khi đăng nhập/đăng xuất. — *xong khi:* DG-12, DG-13 đúng khi bấm thử.
- [x] **T9.** Tab "Đánh giá" trong trang quản trị, nút Ẩn / Hiện lại.
- [x] **T10.** CSS cho sao và mục đánh giá, kiểm tra cả màn hình điện thoại.

## Dữ liệu demo và tài liệu

- [x] **T11.** Thêm đánh giá mẫu vào `server/demo.js`. — *xong khi:* DG-15 đúng sau `npm run demo`.
- [x] **T12.** Điền tên bài test vào cột "Kiểm tra" của spec; cập nhật `README.md`, `specs/README.md`, `TODO.md`, `nhat-ky.md`.
- [x] **T13.** Bấm thử toàn bộ DG-12 đến DG-15 trên trình duyệt, chụp ảnh màn hình cho báo cáo.
