// Nghiệp vụ đánh giá sản phẩm. Đặc tả: specs/10-danh-gia-san-pham/spec.md
const { HttpError } = require("./errors");

// Làm tròn 1 chữ số thập phân; chưa có đánh giá thì trả null.
function toRating(average, count) {
  return { average: count ? Math.round(average * 10) / 10 : null, count: count || 0 };
}

// Sản phẩm phải đang bán thì mới xem và gửi đánh giá được (quy tắc 10).
function requireActiveProduct(db, productId) {
  const product = db.prepare("SELECT id FROM products WHERE id = ? AND is_active = 1").get(productId);
  if (!product) throw new HttpError(404, "Không tìm thấy sản phẩm.");
}

// Quy tắc 1: chỉ khách có đơn "Hoàn thành" chứa sản phẩm này mới được đánh giá.
function canReview(db, userId, productId) {
  return Boolean(db.prepare(`
    SELECT 1 FROM orders JOIN order_items ON order_items.order_id = orders.id
    WHERE orders.user_id = ? AND orders.status = 'Hoàn thành' AND order_items.product_id = ?
    LIMIT 1
  `).get(userId, productId));
}

// Quy tắc 6, 8: chỉ tính đánh giá đang hiển thị.
function ratingSummary(db, productId) {
  const row = db.prepare("SELECT AVG(rating) AS average, COUNT(*) AS count FROM reviews WHERE product_id = ? AND is_hidden = 0").get(productId);
  return toRating(row.average, row.count);
}

// Quy tắc 5, 7: chỉ trả họ tên (không có email), mới nhất lên đầu.
function listReviews(db, productId, viewerId) {
  return db.prepare(`
    SELECT reviews.id, reviews.user_id, users.name AS userName, reviews.rating, reviews.comment,
           reviews.created_at AS createdAt, reviews.updated_at AS updatedAt
    FROM reviews JOIN users ON users.id = reviews.user_id
    WHERE reviews.product_id = ? AND reviews.is_hidden = 0
    ORDER BY reviews.updated_at DESC, reviews.id DESC
  `).all(productId).map(({ user_id: userId, ...review }) => ({ ...review, isMine: userId === viewerId }));
}

function ownReview(db, userId, productId) {
  const row = db.prepare("SELECT rating, comment, is_hidden FROM reviews WHERE user_id = ? AND product_id = ?").get(userId, productId);
  return row ? { rating: row.rating, comment: row.comment, isHidden: row.is_hidden === 1 } : null;
}

// Quy tắc 2, 9: mỗi người một đánh giá; gửi lại thì cập nhật nhưng không đổi trạng thái ẩn.
function saveReview(db, { userId, productId, rating, comment }) {
  if (!canReview(db, userId, productId)) {
    throw new HttpError(403, "Chỉ khách đã nhận hàng mới đánh giá được sản phẩm này.");
  }
  const existed = Boolean(ownReview(db, userId, productId));
  db.prepare(`
    INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)
    ON CONFLICT (product_id, user_id) DO UPDATE SET
      rating = excluded.rating, comment = excluded.comment, updated_at = datetime('now')
  `).run(productId, userId, rating, comment);
  return { created: !existed, review: ownReview(db, userId, productId) };
}

module.exports = { toRating, requireActiveProduct, canReview, ratingSummary, listReviews, ownReview, saveReview };
