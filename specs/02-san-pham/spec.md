# 02 — Xem, tìm kiếm và lọc sản phẩm

- **Trạng thái:** Đã xong
- **Cách viết:** Viết lại sau khi làm (04/11/2026), mô tả đúng hệ thống hiện tại.

## 1. Bối cảnh

Khách vào web để tìm nhạc cụ phù hợp. Cần xem được sản phẩm mà không phải đăng nhập, tìm nhanh bằng tiếng Việt có dấu hoặc không dấu.

## 2. Câu chuyện người dùng

- Là **khách**, tôi muốn **xem danh sách nhạc cụ theo danh mục và thương hiệu** để chọn nhanh.
- Là **khách**, tôi muốn **gõ "trong" vẫn tìm ra "Trống"** vì tôi gõ không dấu.
- Là **khách**, tôi muốn **xem trang chi tiết** với giá, mô tả, thông số và tồn kho.

## 3. Phạm vi

**Có làm:** trang chủ, trang sản phẩm có lọc theo danh mục, thương hiệu, tìm kiếm, sắp xếp theo giá; trang chi tiết có sản phẩm cùng danh mục.

**Không làm:** lọc theo khoảng giá, phân trang, so sánh sản phẩm.

## 4. Quy tắc nghiệp vụ

1. Chỉ hiển thị sản phẩm đang bán (`is_active = 1`). Sản phẩm bị ẩn không xuất hiện ở bất kỳ trang nào của khách.
2. Tìm kiếm không phân biệt dấu và hoa thường; mọi từ khóa phải khớp.
3. Ưu tiên khớp tên, danh mục, thương hiệu. Nếu không có kết quả thì tìm nguyên từ trong mô tả.
4. Bộ lọc được ghi vào địa chỉ trang (ví dụ `#products?category=Guitar`) để chia sẻ hoặc quay lại được.
5. Sản phẩm hết hàng vẫn hiển thị nhưng có nhãn "Hết hàng" và không thêm vào giỏ được.

## 5. Tiêu chí nghiệm thu

| Mã | Tiêu chí | Kiểm tra |
|---|---|---|
| SP-01 | Khi chưa đăng nhập gọi `/api/catalog` thì nhận đủ sản phẩm, danh mục và chính sách phí giao hàng | Tự động: `danh mục công khai trả về sản phẩm và không cần đăng nhập` |
| SP-02 | Khi sản phẩm bị ẩn thì không còn trong `/api/catalog` | Tự động: `quản trị: thêm, sửa, ẩn sản phẩm; sản phẩm ẩn không bán được nhưng đơn cũ vẫn còn` |
| SP-03 | Khi gõ "trong" thì kết quả có "Bộ Trống Cơ Pearl Roadshow" | Thủ công: trang Sản phẩm, ô tìm kiếm |
| SP-04 | Khi chọn danh mục Guitar và sắp xếp "Giá thấp đến cao" thì chỉ còn guitar, giá tăng dần, địa chỉ trang đổi theo | Thủ công |
| SP-05 | Khi mở `#product/<mã>` thì thấy giá, giá cũ (nếu có), mô tả, thông số, tồn kho và tối đa 4 sản phẩm cùng danh mục | Thủ công |
| SP-06 | Khi mở mã sản phẩm không tồn tại hoặc đã ẩn thì thấy "Không tìm thấy sản phẩm" | Thủ công: mở `#product/99999` |
| SP-07 | Khi sản phẩm hết hàng thì có nhãn "Hết hàng" và không có nút thêm vào giỏ | Thủ công: admin đặt tồn kho = 0 rồi xem |
