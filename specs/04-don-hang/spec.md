# 04 — Theo dõi và xử lý đơn hàng

- **Trạng thái:** Đã xong
- **Cách viết:** Viết lại sau khi làm (04/11/2026), mô tả đúng hệ thống hiện tại.

## 1. Bối cảnh

Sau khi đặt, khách cần xem đơn đang ở bước nào và hủy được nếu đổi ý. Cửa hàng cần chuyển đơn qua từng bước giao hàng, không được nhảy cóc.

## 2. Câu chuyện người dùng

- Là **khách**, tôi muốn **xem lịch sử đơn của mình** và **tự hủy đơn khi cửa hàng chưa xác nhận**.
- Là **quản trị viên**, tôi muốn **chuyển đơn qua từng trạng thái** và **hủy đơn khi cần**, tồn kho tự hoàn lại.

## 3. Quy trình trạng thái

```
Chờ xác nhận → Đã xác nhận → Đang giao → Hoàn thành
      │              │            │
      └──────────────┴────────────┴──→ Đã hủy
```

"Hoàn thành" và "Đã hủy" là trạng thái cuối, không đổi được nữa.

## 4. Quy tắc nghiệp vụ

1. Khách chỉ thấy và chỉ thao tác được đơn của chính mình. Đơn của người khác trả về "Không tìm thấy" (404), không lộ là đơn có tồn tại.
2. Khách chỉ tự hủy được khi đơn còn "Chờ xác nhận". Sau đó phải gọi hotline.
3. Quản trị viên chỉ chuyển được sang các trạng thái kế tiếp hợp lệ (bảng trên).
4. Hủy đơn thì hoàn lại tồn kho đúng một lần.
5. Doanh thu chỉ tính đơn "Hoàn thành", vì khách trả tiền khi nhận hàng.

## 5. Tiêu chí nghiệm thu

| Mã | Tiêu chí | Kiểm tra |
|---|---|---|
| DO-01 | Khi khách xem "Đơn hàng của bạn" thì chỉ thấy đơn của mình | Tự động: `đơn hàng: khách chỉ thấy và chỉ hủy được đơn của mình` |
| DO-02 | Khi khách hủy đơn của người khác thì báo 404 | Tự động: như DO-01 |
| DO-03 | Khi khách hủy đơn "Chờ xác nhận" thì đơn sang "Đã hủy" và hoàn kho; hủy lần hai thì báo 409, kho không cộng thêm | Tự động: `đơn hàng: khách hủy đơn chờ xác nhận thì hoàn kho; đã xác nhận thì không tự hủy được` |
| DO-04 | Khi đơn đã "Đã xác nhận" thì khách không tự hủy được (409) | Tự động: như DO-03 |
| DO-05 | Khi admin chuyển nhảy cóc (Chờ xác nhận → Hoàn thành) thì báo 409; trạng thái không có trong danh sách thì 400 | Tự động: `quản trị: đơn đi đúng quy trình trạng thái và doanh thu chỉ tính đơn hoàn thành` |
| DO-06 | Khi đơn chưa hoàn thành thì doanh thu không đổi; khi hoàn thành thì doanh thu tăng đúng tổng tiền đơn | Tự động: như DO-05 |
| DO-07 | Khi đơn đã "Hoàn thành" thì không hủy được (409) | Tự động: như DO-05 |
| DO-08 | Khi admin mở tab Đơn hàng thì mỗi đơn chỉ có các lựa chọn trạng thái kế tiếp hợp lệ | Thủ công |
