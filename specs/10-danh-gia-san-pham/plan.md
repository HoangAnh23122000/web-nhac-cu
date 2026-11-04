# 10 — Đánh giá sản phẩm: Kế hoạch kỹ thuật

Dựa trên: [spec.md](spec.md) (đã duyệt ngày 04/11/2026)

## 1. Dữ liệu

Thêm bảng `reviews` vào `SCHEMA` trong `server/db.js`. Vì dùng `CREATE TABLE IF NOT EXISTS`, CSDL cũ sẽ tự có bảng mới khi khởi động lại, **không cần xóa dữ liệu**.

```sql
CREATE TABLE IF NOT EXISTS reviews (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating     INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT NOT NULL DEFAULT '',
  is_hidden  INTEGER NOT NULL DEFAULT 0 CHECK (is_hidden IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (product_id, user_id)          -- quy tắc 2: mỗi người một đánh giá
);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
```

- `CHECK` và `UNIQUE` là lớp bảo vệ thứ hai, phòng khi code kiểm tra bị sót.
- Không có cột email trong kết quả trả về (quy tắc 5): lấy `users.name` qua `JOIN`.

## 2. Nghiệp vụ — file mới `server/reviews.js`

| Hàm | Việc làm | Quy tắc |
|---|---|---|
| `canReview(db, userId, productId)` | Có đơn `Hoàn thành` của người này chứa sản phẩm này không | 1 |
| `ratingSummary(db, productId)` | `{ average, count }` chỉ từ đánh giá đang hiện, làm tròn 1 chữ số; chưa có thì `average: null` | 6, 8 |
| `listReviews(db, productId, userId)` | Danh sách đánh giá đang hiện, mới nhất trước, kèm `isMine` | 5, 7, 8 |
| `saveReview(db, { userId, productId, rating, comment })` | Thêm mới hoặc cập nhật (`INSERT ... ON CONFLICT DO UPDATE`), **không đụng tới `is_hidden`** | 2, 9 |

## 3. API

| Phương thức | Đường dẫn | Quyền | Mô tả |
|---|---|---|---|
| GET | `/api/products/:id/reviews` | Ai cũng xem được | Điểm trung bình, danh sách, và trạng thái của người đang xem |
| POST | `/api/products/:id/reviews` | Đăng nhập + đã nhận hàng | Gửi hoặc sửa đánh giá của mình |
| GET | `/api/admin/reviews` | Admin | Mọi đánh giá, kể cả đang ẩn |
| PATCH | `/api/admin/reviews/:id` | Admin | `{ "isHidden": true/false }` |

**GET `/api/products/:id/reviews`** trả về:

```json
{
  "summary": { "average": 4.5, "count": 2 },
  "reviews": [
    { "id": 3, "userName": "Lê Thu Hà", "rating": 5, "comment": "Đàn rất êm",
      "createdAt": "...", "updatedAt": "...", "isMine": false }
  ],
  "me": {
    "loggedIn": true,
    "canReview": true,
    "review": { "rating": 4, "comment": "...", "isHidden": false }
  }
}
```

`me.review` là đánh giá của chính người đang xem (kể cả khi bị ẩn, để hiện ghi chú theo quy tắc 8), hoặc `null`.

**POST** nhận `{ "rating": 1..5, "comment": "..." }`. Trả về 201 nếu là đánh giá mới, 200 nếu là cập nhật.

**Mã lỗi:**

| Trường hợp | Mã | Tiêu chí |
|---|---|---|
| Chưa đăng nhập mà gửi | 401 | DG-02 |
| Chưa có đơn hoàn thành chứa sản phẩm | 403 | DG-03 |
| Số sao sai, nhận xét quá dài | 400 | DG-06 |
| Sản phẩm không tồn tại hoặc đang ẩn | 404 | DG-11 |
| Khách gọi API quản trị | 403 | DG-10 |

**Điểm trung bình trên thẻ sản phẩm (DG-07, DG-14):** sửa `PRODUCT_SELECT` trong `server/routes/catalog.js`, nối thêm một truy vấn con tính `AVG` và `COUNT` của đánh giá đang hiện. Mỗi sản phẩm trong `/api/catalog` có thêm `rating: { average, count }`.

## 4. Giao diện (`public/app.js`, `public/styles.css`)

1. **Thẻ sản phẩm:** dòng nhỏ `★ 4,5 (2)` dưới giá, chỉ khi có đánh giá.
2. **Trang chi tiết:** dưới giá có dòng tóm tắt sao. Thêm mục "Đánh giá từ khách đã mua" giữa phần thông tin và "Có thể bạn thích", gồm:
   - Tóm tắt: điểm lớn, sao, số lượt.
   - Khu vực gửi đánh giá, tùy người xem:
     - chưa đăng nhập: nút "Đăng nhập để đánh giá";
     - đã đăng nhập nhưng chưa đủ điều kiện: "Chỉ khách đã nhận hàng mới đánh giá được sản phẩm này.";
     - đủ điều kiện: biểu mẫu 5 ngôi sao (nút chọn, dùng được bằng bàn phím) và ô nhận xét; nếu đã đánh giá thì điền sẵn, nút đổi thành "Cập nhật đánh giá";
     - đánh giá của mình bị ẩn: ghi chú "Đánh giá của bạn đang bị ẩn".
   - Danh sách đánh giá. Nhận xét đi qua `esc()` (DG-12).
   - Mục này tải riêng sau khi trang hiện, nên trang không chậm đi.
3. Đăng nhập hoặc đăng xuất khi đang ở trang chi tiết thì mục đánh giá tự tải lại.
4. **Quản trị:** thêm tab "Đánh giá" gồm bảng sản phẩm, khách, số sao, nhận xét, ngày, trạng thái, nút "Ẩn" / "Hiện lại".

**Lưu ý:** web dùng `#` trong địa chỉ để chuyển trang, nên **không** dùng liên kết kiểu `#reviews` để cuộn xuống mục đánh giá.

## 5. File sẽ sửa

| File | Thay đổi |
|---|---|
| `server/db.js` | Thêm bảng `reviews` và chỉ mục |
| `server/reviews.js` | **Mới** — nghiệp vụ đánh giá |
| `server/routes/reviews.js` | **Mới** — 2 API công khai |
| `server/routes/admin.js` | 2 API quản trị |
| `server/routes/catalog.js` | `rating` trong dữ liệu sản phẩm |
| `server/app.js` | Gắn đường dẫn `/api/products` |
| `server/demo.js` | Thêm đánh giá mẫu, có 1 đánh giá spam bị ẩn để demo kiểm duyệt |
| `public/app.js` | Thẻ sản phẩm, trang chi tiết, tab quản trị |
| `public/styles.css` | Kiểu cho sao, mục đánh giá |
| `test/api.test.js` | Các bài test `đánh giá: ...` |
| `README.md`, `specs/README.md` | Cập nhật chức năng và trạng thái |

## 6. Kiểm thử

| Bài test (sẽ viết) | Tiêu chí |
|---|---|
| `đánh giá: ai cũng xem được, chưa đăng nhập thì không gửi được` | DG-01, DG-02 |
| `đánh giá: chỉ khách có đơn hoàn thành chứa sản phẩm mới gửi được` | DG-03, DG-04 |
| `đánh giá: gửi lại thì cập nhật, không tạo thêm` | DG-05 |
| `đánh giá: từ chối số sao và nhận xét không hợp lệ` | DG-06 |
| `đánh giá: điểm trung bình đúng và có trong danh mục sản phẩm` | DG-07 |
| `đánh giá: admin ẩn thì khách khác không thấy, sửa không tự hiện lại, khách không ẩn được` | DG-08, DG-09, DG-10 |
| `đánh giá: sản phẩm ẩn hoặc không tồn tại thì báo 404` | DG-11 |

DG-12 đến DG-15 kiểm tra thủ công trên trình duyệt.

## 7. Rủi ro và cách xử lý

| Rủi ro | Cách xử lý |
|---|---|
| Bấm "Gửi" hai lần tạo hai đánh giá | `UNIQUE (product_id, user_id)` + `ON CONFLICT DO UPDATE`; nút bị khóa khi đang gửi (`submitForm` có sẵn) |
| Chèn mã độc qua nhận xét | `esc()` khi hiển thị + CSP sẵn có |
| Lách kiểm duyệt bằng cách sửa đánh giá bị ẩn | Câu cập nhật không đổi `is_hidden` (DG-09) |
| CSDL cũ của nhóm thiếu bảng mới | `CREATE TABLE IF NOT EXISTS` tự tạo khi khởi động |
| Trang chi tiết đổi sản phẩm khi đánh giá chưa tải xong | Kiểm tra mục đánh giá vẫn đúng sản phẩm trước khi vẽ |
