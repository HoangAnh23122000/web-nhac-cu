# 01 — Tài khoản và phân quyền

- **Trạng thái:** Đã xong
- **Cách viết:** Viết lại sau khi làm (04/11/2026), mô tả đúng hệ thống hiện tại.

## 1. Bối cảnh

Khách cần tài khoản để đặt hàng và xem lại đơn của mình. Cửa hàng cần tài khoản quản trị riêng, khách thường không được vào.

## 2. Câu chuyện người dùng

- Là **khách**, tôi muốn **đăng ký bằng email và mật khẩu** để đặt hàng và theo dõi đơn.
- Là **khách**, tôi muốn **đăng nhập và đăng xuất** trên máy của mình.
- Là **quản trị viên**, tôi muốn **chỉ mình vào được khu vực quản trị**.

## 3. Phạm vi

**Có làm:** đăng ký, đăng nhập, đăng xuất, giữ phiên 7 ngày, hai vai trò `customer` và `admin`, giới hạn số lần thử.

**Không làm:** quên mật khẩu qua email, đổi mật khẩu, sửa thông tin cá nhân, đăng nhập bằng Google/Facebook.

## 4. Quy tắc nghiệp vụ

1. Email không phân biệt hoa thường và không được trùng.
2. Mật khẩu tối thiểu 8 ký tự, tối đa 72 byte (giới hạn của bcrypt).
3. Tài khoản đăng ký mới luôn là `customer`; không thể tự đặt quyền `admin`.
4. Tài khoản admin được tạo sẵn khi khởi tạo dữ liệu. Khi chạy thật (`NODE_ENV=production`) bắt buộc đặt `ADMIN_PASSWORD`.
5. Đăng nhập sai không cho biết là sai email hay sai mật khẩu.
6. Đăng ký và đăng nhập: tối đa 20 lần mỗi 15 phút cho một địa chỉ IP.

## 5. Tiêu chí nghiệm thu

| Mã | Tiêu chí | Kiểm tra |
|---|---|---|
| TK-01 | Khi đăng ký hợp lệ thì tạo tài khoản `customer`, đăng nhập luôn và mật khẩu chỉ lưu dạng băm bcrypt | Tự động: `đăng ký: mật khẩu được băm, không lưu dạng thô` |
| TK-02 | Khi đăng ký có gửi kèm `role: "admin"` thì vẫn chỉ tạo `customer` | Tự động: `đăng ký: không cho tự đặt quyền admin` |
| TK-03 | Khi email trùng (kể cả khác hoa thường) thì báo lỗi 409; email sai định dạng hoặc mật khẩu ngắn thì báo 400 | Tự động: `đăng ký: từ chối email trùng, email sai và mật khẩu ngắn` |
| TK-04 | Khi sai mật khẩu hoặc email không tồn tại thì báo 401 với cùng một thông báo | Tự động: `đăng nhập: sai mật khẩu bị từ chối, đúng thì vào được, đăng xuất thì mất phiên` |
| TK-05 | Khi đăng nhập đúng thì `/api/auth/me` trả về người dùng; sau khi đăng xuất thì trả về `null` | Tự động: như TK-04 |
| TK-06 | Khi khách hoặc người chưa đăng nhập gọi API quản trị thì bị từ chối (403 / 401) | Tự động: `phân quyền: khách và người lạ không vào được quản trị` |
| TK-07 | Khi khách mở `#admin` thì thấy thông báo "Không có quyền truy cập" | Thủ công: đăng nhập `khach@mocmusic.vn`, mở `http://localhost:3000/#admin` |
| TK-08 | Khi thử đăng nhập quá 20 lần trong 15 phút thì bị chặn tạm thời | Thủ công: thử sai liên tục; test tự động tắt giới hạn này để chạy nhanh |
