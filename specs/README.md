# Đặc tả (specs) — Phát triển hướng đặc tả (SDD)

Thư mục này chứa đặc tả của từng chức năng trong Mộc Music. Nhóm dùng quy trình **Spec Driven Development (SDD)**: viết đặc tả trước, người duyệt, rồi mới để AI (Claude) lập kế hoạch và viết code theo đặc tả đó.

## Quy trình 4 bước

| Bước | File | Ai làm | Ai duyệt |
|---|---|---|---|
| 1. Đặc tả: làm gì, cho ai, tiêu chí nghiệm thu | `spec.md` | AI soạn từ yêu cầu của nhóm | Nhóm |
| 2. Kế hoạch kỹ thuật: dữ liệu, API, file cần sửa | `plan.md` | AI | Nhóm |
| 3. Danh sách việc: các bước nhỏ, mỗi bước kiểm tra được | `tasks.md` | AI | Nhóm |
| 4. Viết code và kiểm thử theo từng việc | mã nguồn, `test/` | AI | Nhóm chạy `npm test` và bấm thử |

Không chuyển sang bước sau khi bước trước chưa được duyệt. Khi cần đổi yêu cầu, **sửa `spec.md` trước** rồi mới sửa code.

## Tiêu chí nghiệm thu và truy vết

Mỗi tiêu chí nghiệm thu có một mã, ví dụ `DH-03`. Trong `spec.md`, mỗi tiêu chí ghi rõ cách kiểm tra:

- **Tự động:** tên bài test trong `test/`, chạy bằng `npm test`.
- **Thủ công:** bấm thử trên trình duyệt (thường là phần giao diện).

Nhờ vậy có thể chỉ ra từng yêu cầu đã được kiểm tra ở đâu.

## Danh sách đặc tả

| Mã | Chức năng | Cách viết | Trạng thái |
|---|---|---|---|
| [01](01-tai-khoan/spec.md) | Tài khoản và phân quyền | Viết lại sau khi làm | Đã xong |
| [02](02-san-pham/spec.md) | Xem, tìm kiếm, lọc sản phẩm | Viết lại sau khi làm | Đã xong |
| [03](03-gio-hang-dat-hang/spec.md) | Giỏ hàng, đặt hàng, tồn kho | Viết lại sau khi làm | Đã xong |
| [04](04-don-hang/spec.md) | Theo dõi và xử lý đơn hàng | Viết lại sau khi làm | Đã xong |
| [05](05-quan-tri/spec.md) | Quản trị: thống kê, sản phẩm, danh mục, khách hàng | Viết lại sau khi làm | Đã xong |
| [06](06-bao-mat/spec.md) | Yêu cầu bảo mật chung | Viết lại sau khi làm | Đã xong |
| [10](10-danh-gia-san-pham/spec.md) | Đánh giá sản phẩm | **SDD đầy đủ, viết trước khi làm** | Đã xong |

**Lưu ý trung thực:** các đặc tả 01–06 được viết **sau** khi các chức năng đã làm xong (ngày 04/11/2026), để mô tả lại hệ thống và nối từng yêu cầu với bài kiểm thử. Đặc tả 10 là chức năng đầu tiên làm đúng quy trình SDD từ đầu; nhật ký từng bước nằm trong [10-danh-gia-san-pham/nhat-ky.md](10-danh-gia-san-pham/nhat-ky.md).

## Mẫu

Bắt đầu chức năng mới bằng cách chép thư mục [_mau/](_mau/) thành `specs/<số>-<tên>/`.
