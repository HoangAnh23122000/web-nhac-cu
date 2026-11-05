# TODO - Đồ án Mộc Music

Muốn tui làm mục nào, bạn chỉ cần nhắn tên mục đó.

## Đã xong

- [x] Máy chủ và cơ sở dữ liệu
- [x] Đăng ký, đăng nhập, phân quyền khách và quản trị
- [x] Tìm kiếm, bộ lọc, trang chi tiết sản phẩm, giỏ hàng
- [x] Đặt hàng thanh toán khi nhận hàng, trừ và hoàn tồn kho
- [x] Trang quản trị: thống kê, đơn hàng, sản phẩm, danh mục, khách hàng
- [x] Giao diện điện thoại, thay ảnh sai, sửa các lỗi đã review
- [x] Kiểm thử tự động cho máy chủ
- [x] Hướng dẫn cài đặt và sử dụng trong `README.md`

## Việc của bạn (tui không làm thay được)

- [x] Bấm thử web theo vai trò khách và quản trị, rồi báo lại kết quả
- [x] Hỏi giảng viên có yêu cầu gì thêm về chức năng và mẫu báo cáo không
- [x] Hạn nộp: 14/11/2026, nộp Group01.zip gồm Group01.docx và mã nguồn
- [ ] Hiểu và tự giải thích được từng phần để trả lời hội đồng
- [ ] Sao lưu dự án sang một nơi khác

## Việc của bạn khi về nhà (cần máy ở nhà hoặc Word)

Báo cáo `bao-cao/Group01.docx` (còn 12 chỗ tô vàng):

- [ ] Mở bằng Word, chuột phải vào mục lục → **Update Field → Update entire table** để có số trang
- [ ] Lướt các trang mới xem bố cục: mục 2.11 (Bảng 2.6–2.8, Hình 2.7), mục 3.5 (Hình 3.16–3.24), mục 5.6
- [x] Trang bìa: trường, khoa, môn học, giảng viên, họ tên – MSSV, thành phố (làm một mình nên bỏ dòng thành viên 2 và dòng Lớp)
- [x] Mục 5.1: Claude Code chạy trong Antigravity
- [x] Mục 5.2: bỏ dòng lý do riêng
- [ ] **NHẮC:** Link Google Drive ở **Lời mở đầu** (link dự phòng) và **mục 3.1** (link sản phẩm): dán link, hoặc xóa dòng nếu chỉ dùng GitHub
- [ ] Bảng 5.3: dán nguyên văn 5 prompt giai đoạn đầu (giao diện, máy chủ và CSDL, quản trị, review, kiểm thử) từ lịch sử trò chuyện **trên máy ở nhà**; dán xong thì xóa câu nhắc tô vàng ngay trên bảng
- [ ] Bảng 5.4: thêm lỗi bạn tự gặp khi làm, hoặc xóa dòng tô vàng cuối bảng
- [ ] Phụ lục: chèn ảnh chụp các cuộc trò chuyện với Claude (có thể chụp cả phiên làm SDD trong Antigravity)
- [ ] Điền xong: chọn tất cả (Cmd+A) → Highlight → **No Color** để bỏ hết màu vàng

Kiểm tra sản phẩm trên máy ở nhà:

- [ ] `git pull` để lấy code mới, rồi `npm test` → phải ra 27/27
- [ ] `npm run demo` (**lệnh này xóa dữ liệu cũ**), `npm start`, rồi bấm thử chức năng đánh giá:
  - chưa đăng nhập: xem được đánh giá, có nút "Đăng nhập để đánh giá"
  - `minhanh@mocmusic.vn` / `Khach@12345` vào Guitar Yamaha F310: sửa được đánh giá
  - `khach@mocmusic.vn` vào Keyboard Casio (đơn chưa giao): không được đánh giá
  - `admin@mocmusic.vn` / `Admin@12345` → Quản trị → tab Đánh giá: ẩn, hiện lại

Hiểu quy trình SDD để tự trình bày:

- [ ] Đọc `specs/README.md`, `specs/10-danh-gia-san-pham/spec.md` và `nhat-ky.md`
- [ ] Đọc kỹ spec Đánh giá: nếu muốn đổi quy tắc nào thì nhắn tui, tui sửa `spec.md` trước rồi mới sửa code (đúng quy trình SDD)

## Tui làm được: báo cáo và bảo vệ

- [x] Viết báo cáo `bao-cao/Group01.docx` (còn các chỗ tô vàng cần bạn điền)
- [x] Vẽ sơ đồ use case, ERD và sơ đồ tuần tự
- [x] Lập bảng test case từ các bài kiểm thử đã có
- [ ] Làm slide thuyết trình (thầy không yêu cầu)
- [ ] Viết kịch bản demo từng bước
- [ ] Giải thích code bằng lời đơn giản, từng file hoặc từng chức năng
- [ ] Soạn câu hỏi hội đồng hay hỏi và đóng vai hội đồng để bạn tập trả lời

## Quy trình SDD

- [x] Đặc tả cho các chức năng đã có (`specs/01` đến `specs/06`), nối với bài test
- [x] `CLAUDE.md`: dặn AI luôn làm theo spec
- [x] Đánh giá sản phẩm: spec → plan → tasks → code và test (làm đúng SDD)
- [x] Thêm mục SDD vào báo cáo `Group01.docx` (mục 2.11, 3.5, 5.6; sơ đồ quy trình SDD; cập nhật use case, ERD, kiến trúc)

## Tui làm được: thêm chức năng (không bắt buộc)

- [x] Đánh giá sản phẩm: khách đã mua được chấm sao và bình luận (`specs/10-danh-gia-san-pham/`)
- [ ] Mã giảm giá
- [ ] Lọc theo khoảng giá và phân trang
- [ ] Tải ảnh sản phẩm trực tiếp trong trang quản trị
- [ ] Sửa thông tin cá nhân, đổi mật khẩu, sổ địa chỉ
- [ ] Điểm riêng của đồ án: nghe thử âm thanh nhạc cụ, hoặc gợi ý nhạc cụ theo trình độ và ngân sách
- [x] Dữ liệu demo: đơn hàng và khách hàng mẫu (`npm run demo`)

## Tui làm được nhưng cần bạn cung cấp tài khoản

- [ ] Quên mật khẩu qua email: cần tài khoản gửi email
- [ ] Thanh toán online bản thử (VNPay hoặc MoMo): cần đăng ký tài khoản sandbox; đồ án hiện chỉ yêu cầu COD nên không cần làm
- [ ] Đưa web lên Internet: cần tài khoản dịch vụ hosting
- [x] Sao lưu code lên GitHub

## Việc tui nên làm tiếp theo

1. Sửa các lỗi bạn phát hiện khi bấm thử ở nhà
2. Viết kịch bản demo từng bước, có cả chức năng đánh giá và cách trình bày quy trình SDD
3. Soạn câu hỏi hội đồng hay hỏi (kể cả câu hỏi về SDD và về việc dùng AI) để bạn tập trả lời
4. Làm slide (thầy không yêu cầu)
