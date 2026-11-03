# Mộc Music

Website bán nhạc cụ - đồ án tốt nghiệp. Có đăng ký/đăng nhập thật, cơ sở dữ liệu, giỏ hàng, đặt hàng thanh toán khi nhận hàng (COD) và trang quản trị.

## Công nghệ

- **Giao diện:** HTML, CSS, JavaScript thuần
- **Máy chủ:** Node.js, Express
- **Cơ sở dữ liệu:** SQLite (có sẵn trong Node.js, không cần cài thêm)

## Cách chạy

Máy cần có [Node.js](https://nodejs.org) phiên bản 22.13 trở lên.

```bash
npm install     # chỉ cần chạy lần đầu
npm start       # khởi động website
```

Sau đó mở http://localhost:3000. Nhấn `Ctrl + C` trong cửa sổ lệnh để dừng.

## Tài khoản mẫu

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Quản trị viên | admin@mocmusic.vn | Admin@12345 |
| Khách hàng | khach@mocmusic.vn | Khach@12345 |

Sau khi chạy `npm run demo` có thêm 5 khách mẫu (ví dụ minhanh@mocmusic.vn), cùng mật khẩu Khach@12345.

Đây là tài khoản để chạy thử. Khi đưa lên mạng phải đặt `NODE_ENV=production` và `ADMIN_PASSWORD`; tài khoản khách mẫu sẽ không được tạo.

## Các lệnh khác

```bash
npm test        # chạy kiểm thử tự động
npm run reset   # xóa toàn bộ đơn hàng, tài khoản mới và đưa dữ liệu về ban đầu
npm run demo    # đưa về ban đầu rồi thêm 5 khách và 14 đơn hàng mẫu để trình bày
```

## Chức năng

**Khách hàng:** xem sản phẩm, tìm kiếm có hoặc không dấu, lọc theo danh mục và thương hiệu, sắp xếp theo giá, trang chi tiết sản phẩm, giỏ hàng, đăng ký, đăng nhập, đặt hàng COD, xem lịch sử đơn và tự hủy đơn đang chờ xác nhận.

**Quản trị viên:** thống kê từ dữ liệu thật, xử lý đơn hàng theo quy trình, thêm/sửa/ẩn sản phẩm, quản lý tồn kho, thêm/sửa/xóa danh mục, xem danh sách khách hàng.

## Quy tắc nghiệp vụ

- Giá và tổng tiền do máy chủ tính; trình duyệt chỉ gửi mã sản phẩm và số lượng.
- Phí giao hàng 30.000đ, miễn phí cho đơn từ 2.000.000đ.
- Đặt hàng thì trừ kho, hủy đơn thì hoàn kho; không bán quá số lượng còn lại.
- Quy trình đơn: Chờ xác nhận → Đã xác nhận → Đang giao → Hoàn thành. Có thể hủy trước khi hoàn thành. Khách chỉ tự hủy được khi đơn còn ở "Chờ xác nhận".
- Doanh thu chỉ tính đơn đã hoàn thành.
- Sản phẩm được ẩn thay vì xóa, để đơn hàng cũ vẫn còn nguyên thông tin.

## Bảo mật

- Mật khẩu được băm bằng bcrypt.
- Phiên đăng nhập dùng cookie `HttpOnly`, `SameSite=Lax`; trong CSDL chỉ lưu bản băm của token.
- Giới hạn số lần thử đăng nhập và đăng ký.
- Dữ liệu được kiểm tra ở máy chủ và được escape trước khi hiển thị để chống XSS; có thêm Content Security Policy.
- Câu lệnh SQL dùng tham số để chống SQL injection.

## Cấu trúc thư mục

```
public/          Giao diện (index.html, styles.css, app.js, images/)
server/
  index.js       Điểm khởi động
  app.js         Ghép các thành phần
  config.js      Cấu hình
  db.js          Các bảng dữ liệu
  seed.js        Dữ liệu ban đầu
  demo.js        Dữ liệu demo để trình bày
  auth.js        Phiên đăng nhập, phân quyền
  validate.js    Kiểm tra dữ liệu đầu vào
  orders.js      Nghiệp vụ đơn hàng
  routes/        Các đường dẫn API
test/            Kiểm thử tự động
data/            File cơ sở dữ liệu (tự tạo khi chạy)
ban-goc/         Bản frontend trước khi nối máy chủ
```

Nguồn và giấy phép ảnh: xem `public/images/CREDITS.md`.
