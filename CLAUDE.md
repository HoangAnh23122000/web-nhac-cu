# Hướng dẫn cho AI làm việc trong dự án Mộc Music

Website bán nhạc cụ: Node.js + Express + SQLite (`node:sqlite`), giao diện HTML/CSS/JS thuần trong `public/`. Xem `README.md` để biết cách chạy.

## Quy trình bắt buộc: Spec Driven Development

Dự án làm theo SDD. Chi tiết trong [specs/README.md](specs/README.md).

1. **Không viết code cho chức năng mới khi chưa có `specs/<mã>-<tên>/spec.md` được nhóm duyệt.** Nếu người dùng yêu cầu chức năng mới, hãy soạn `spec.md` từ mẫu `specs/_mau/` trước, nêu câu hỏi mở và chờ duyệt.
2. Sau khi spec được duyệt: soạn `plan.md`, chờ duyệt; rồi `tasks.md`; rồi mới code từng việc.
3. Khi code, bám đúng tiêu chí nghiệm thu trong spec. Mỗi tiêu chí kiểm tra tự động được phải có bài test trong `test/`, và ghi tên bài test vào cột "Kiểm tra" của spec.
4. Khi yêu cầu thay đổi: sửa `spec.md` trước, sau đó mới sửa code.
5. Ghi lại từng bước (yêu cầu của người dùng, AI đã làm gì, người dùng đã sửa gì) vào `nhat-ky.md` của chức năng đó. Nhật ký này dùng cho báo cáo đồ án.
6. Mọi chức năng mới phải đáp ứng các yêu cầu bảo mật chung trong [specs/06-bao-mat/spec.md](specs/06-bao-mat/spec.md).

## Quy ước code

- Thông báo lỗi và chú thích viết bằng tiếng Việt.
- Lỗi có chủ đích dùng `HttpError(status, message)` trong `server/errors.js`.
- Kiểm tra dữ liệu đầu vào bằng các hàm trong `server/validate.js`.
- Câu SQL luôn dùng tham số `?`. Nhiều câu ghi dữ liệu liên quan nhau thì bọc trong `transaction()` của `server/db.js`.
- Ở giao diện, mọi dữ liệu người dùng nhập phải qua `esc()` trước khi đưa vào HTML.
- Chạy `npm test` trước khi báo xong việc.
