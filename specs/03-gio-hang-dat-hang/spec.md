# 03 — Giỏ hàng, đặt hàng và tồn kho

- **Trạng thái:** Đã xong
- **Cách viết:** Viết lại sau khi làm (04/11/2026), mô tả đúng hệ thống hiện tại.

## 1. Bối cảnh

Khách chọn nhiều sản phẩm rồi đặt một lần, thanh toán tiền mặt khi nhận hàng (COD). Cửa hàng không được bán quá số hàng đang có, và giá phải đúng dù ai đó sửa dữ liệu trên trình duyệt.

## 2. Câu chuyện người dùng

- Là **khách**, tôi muốn **thêm sản phẩm vào giỏ khi chưa đăng nhập**, và giỏ vẫn còn khi tôi tải lại trang.
- Là **khách**, tôi muốn **đặt hàng COD** chỉ với họ tên, số điện thoại, địa chỉ.
- Là **cửa hàng**, tôi muốn **tồn kho tự trừ khi có đơn** và không bao giờ âm.

## 3. Phạm vi

**Có làm:** giỏ hàng lưu trên trình duyệt, đặt hàng COD, phí giao hàng, trừ kho, mã đơn tự sinh.

**Không làm:** thanh toán online, mã giảm giá, nhiều địa chỉ giao hàng.

## 4. Quy tắc nghiệp vụ

1. Giỏ hàng lưu trong `localStorage`. Không cần đăng nhập để thêm vào giỏ, nhưng phải đăng nhập để đặt hàng; sau khi đăng nhập giỏ vẫn giữ nguyên.
2. Mỗi sản phẩm tối đa 99 cái, mỗi đơn tối đa 50 dòng; không được vượt tồn kho.
3. Trình duyệt chỉ gửi **mã sản phẩm và số lượng**. Giá, tạm tính, phí giao và tổng tiền do máy chủ tính.
4. Phí giao hàng 30.000đ; miễn phí khi tạm tính từ 2.000.000đ.
5. Đặt hàng là một giao dịch: nếu một sản phẩm thiếu hàng hoặc đã ngừng bán thì cả đơn bị từ chối và không sản phẩm nào bị trừ kho.
6. Đơn lưu lại tên và giá **tại thời điểm mua**; sau này sản phẩm đổi giá thì đơn cũ không đổi.
7. Mã đơn có dạng `MM` + 6 chữ số, không trùng.
8. Số điện thoại: 10 chữ số, bắt đầu bằng 0.

## 5. Tiêu chí nghiệm thu

| Mã | Tiêu chí | Kiểm tra |
|---|---|---|
| DH-01 | Khi chưa đăng nhập mà gửi đơn thì báo 401 | Tự động: `đặt hàng: bắt buộc đăng nhập` |
| DH-02 | Khi trình duyệt gửi kèm giá hoặc tổng tiền giả thì máy chủ bỏ qua và tự tính; đơn mới ở trạng thái "Chờ xác nhận", COD, mã `MM######` | Tự động: `đặt hàng: giá do máy chủ tính, bỏ qua giá trình duyệt gửi lên` |
| DH-03 | Khi đặt hàng xong thì đơn có đủ thông tin giao hàng; đổi giá sản phẩm sau đó thì giá trong đơn không đổi | Tự động: `đặt hàng: đơn lưu đủ thông tin giao hàng và giữ giá lúc mua` |
| DH-04 | Khi tạm tính dưới 2.000.000đ thì cộng 30.000đ phí giao; từ 2.000.000đ thì miễn phí | Tự động: `đặt hàng: tính phí giao hàng khi đơn dưới ngưỡng miễn phí` và DH-02 |
| DH-05 | Khi mua quá tồn kho thì báo 409 và kho giữ nguyên; mua hợp lệ thì kho giảm đúng số lượng | Tự động: `tồn kho: trừ khi đặt, không cho mua quá số còn lại` |
| DH-06 | Khi 5 người cùng mua món cuối cùng thì chỉ 1 người thành công, kho về 0 | Tự động: `tồn kho: nhiều người cùng mua món cuối thì chỉ một người được` |
| DH-07 | Khi một sản phẩm trong đơn bị lỗi thì sản phẩm khác trong đơn không bị trừ kho | Tự động: `tồn kho: lỗi ở một sản phẩm thì không trừ kho sản phẩm khác trong đơn` |
| DH-08 | Khi số điện thoại sai, thiếu tên/địa chỉ, giỏ trống, số lượng ≤ 0 hoặc lẻ thì báo 400; sản phẩm không tồn tại thì 409 | Tự động: `đặt hàng: từ chối dữ liệu không hợp lệ` |
| DH-09 | Khi sản phẩm đã ẩn thì không đặt được nữa (409) | Tự động: `quản trị: thêm, sửa, ẩn sản phẩm; ...` |
| DH-10 | Khi chưa đăng nhập bấm "Tiến hành đặt hàng" thì hiện hộp đăng nhập; đăng nhập xong mở tiếp bước đặt hàng với giỏ cũ | Thủ công |
| DH-11 | Khi tải lại trang thì giỏ vẫn còn; khi tồn kho giảm thì giỏ tự giảm theo và báo cho khách | Thủ công |
