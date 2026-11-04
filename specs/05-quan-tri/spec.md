# 05 — Quản trị: thống kê, sản phẩm, danh mục, khách hàng

- **Trạng thái:** Đã xong
- **Cách viết:** Viết lại sau khi làm (04/11/2026), mô tả đúng hệ thống hiện tại.

## 1. Bối cảnh

Chủ cửa hàng cần tự cập nhật sản phẩm, danh mục và nắm tình hình kinh doanh mà không phải sửa code.

## 2. Câu chuyện người dùng

- Là **quản trị viên**, tôi muốn **xem doanh thu, số đơn theo trạng thái, hàng sắp hết** để biết cần làm gì.
- Là **quản trị viên**, tôi muốn **thêm, sửa, ẩn sản phẩm và chỉnh tồn kho**.
- Là **quản trị viên**, tôi muốn **quản lý danh mục** và **xem danh sách khách hàng**.

## 3. Phạm vi

**Có làm:** 5 tab Tổng quan, Đơn hàng, Sản phẩm, Danh mục, Khách hàng.

**Không làm:** tải ảnh lên trực tiếp (chỉ nhập đường dẫn), xuất Excel, khóa tài khoản khách, nhiều cấp quản trị.

## 4. Quy tắc nghiệp vụ

1. Mọi đường dẫn `/api/admin/*` yêu cầu tài khoản `admin`.
2. **Thống kê:** doanh thu = tổng tiền các đơn "Hoàn thành"; số lượng bán theo danh mục không tính đơn đã hủy; "sắp hết hàng" là sản phẩm đang bán có tồn kho ≤ 3.
3. **Sản phẩm:** bắt buộc tên, danh mục có thật, thương hiệu, giá ≥ 0, tồn kho 0–100.000. Ảnh chỉ được là đường dẫn trong `images/` hoặc liên kết `https://`.
4. Sản phẩm được **ẩn** thay vì xóa, để đơn hàng cũ vẫn còn nguyên thông tin. Có thể bán lại.
5. **Danh mục:** tên không trùng (không phân biệt hoa thường). Không xóa được danh mục còn sản phẩm, kể cả sản phẩm đã ẩn.
6. **Khách hàng:** xem họ tên, email, ngày đăng ký, số đơn; không bao giờ trả về mật khẩu.

## 5. Tiêu chí nghiệm thu

| Mã | Tiêu chí | Kiểm tra |
|---|---|---|
| QT-01 | Khi admin thêm sản phẩm hợp lệ thì nhận 201 kèm tên danh mục và thông số | Tự động: `quản trị: thêm, sửa, ẩn sản phẩm; sản phẩm ẩn không bán được nhưng đơn cũ vẫn còn` |
| QT-02 | Khi giá âm, danh mục không tồn tại hoặc ảnh là `javascript:...` thì báo 400 | Tự động: như QT-01 |
| QT-03 | Khi ẩn sản phẩm thì khách không thấy, không mua được, nhưng đơn cũ vẫn giữ tên sản phẩm | Tự động: như QT-01 |
| QT-04 | Khi xóa danh mục còn sản phẩm thì báo 409; tên danh mục trùng thì 409; danh mục trống thì sửa và xóa được | Tự động: `quản trị: danh mục đang có sản phẩm thì không xóa được, tên không được trùng` |
| QT-05 | Khi xem danh sách khách hàng thì không có trường mật khẩu | Tự động: `bảo mật: danh sách khách hàng không chứa mật khẩu; ...` |
| QT-06 | Thống kê doanh thu chỉ tính đơn hoàn thành | Tự động: xem DO-06 trong [04-don-hang](../04-don-hang/spec.md) |
| QT-07 | Khi tồn kho ≤ 3 thì sản phẩm hiện trong "Sắp hết hàng" ở tab Tổng quan | Thủ công: chạy `npm run demo`, mở `#admin` |
| QT-08 | Khi sửa sản phẩm trong hộp thoại và lưu thì danh sách cập nhật ngay, có thông báo | Thủ công |
