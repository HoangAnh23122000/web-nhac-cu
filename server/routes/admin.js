// Khu vực quản trị. Mọi đường dẫn ở đây đều yêu cầu tài khoản admin.
const express = require("express");
const validate = require("../validate");
const { ORDER_STATUSES } = require("../db");
const { HttpError } = require("../errors");
const { requireAdmin } = require("../auth");
const { changeStatus, toOrder } = require("../orders");
const { toProduct, PRODUCT_SELECT } = require("./catalog");

function parseProduct(db, body) {
  const categoryId = validate.id(body.categoryId, "Danh mục");
  if (!db.prepare("SELECT id FROM categories WHERE id = ?").get(categoryId)) {
    throw new HttpError(400, "Danh mục không tồn tại.");
  }
  return {
    name: validate.text(body.name, "tên sản phẩm", { max: 150 }),
    categoryId,
    brand: validate.text(body.brand, "thương hiệu", { max: 80 }),
    price: validate.integer(body.price, "Giá bán"),
    oldPrice: validate.integer(body.oldPrice, "Giá cũ", { required: false }),
    badge: validate.text(body.badge, "nhãn", { max: 30, required: false }),
    stock: validate.integer(body.stock, "Tồn kho", { max: 100000 }),
    image: validate.imagePath(body.image),
    description: validate.text(body.description, "mô tả", { max: 2000, required: false }),
    specs: JSON.stringify(validate.specs(body.specs))
  };
}

function parseCategory(body) {
  return {
    name: validate.text(body.name, "tên danh mục", { max: 60 }),
    image: validate.imagePath(body.image)
  };
}

function uniqueName(error) {
  return /UNIQUE/.test(error.message) ? new HttpError(409, "Tên danh mục này đã tồn tại.") : error;
}

module.exports = function adminRoutes(db) {
  const router = express.Router();
  router.use(requireAdmin);

  const findProduct = (id) => db.prepare(`${PRODUCT_SELECT} WHERE products.id = ?`).get(id);

  // ---- Tổng quan ----
  // Doanh thu chỉ tính đơn đã hoàn thành, vì khách trả tiền khi nhận hàng.
  router.get("/stats", (req, res) => {
    const revenue = db.prepare("SELECT COALESCE(SUM(total), 0) AS value FROM orders WHERE status = 'Hoàn thành'").get().value;
    const orderCount = db.prepare("SELECT COUNT(*) AS value FROM orders").get().value;
    const productCount = db.prepare("SELECT COUNT(*) AS value FROM products WHERE is_active = 1").get().value;
    const customerCount = db.prepare("SELECT COUNT(*) AS value FROM users WHERE role = 'customer'").get().value;
    const lowStock = db.prepare("SELECT id, name, stock FROM products WHERE is_active = 1 AND stock <= 3 ORDER BY stock, id").all();

    const counts = new Map(db.prepare("SELECT status, COUNT(*) AS count FROM orders GROUP BY status").all()
      .map((row) => [row.status, row.count]));
    const byStatus = ORDER_STATUSES.map((status) => ({ status, count: counts.get(status) || 0 }));

    const categorySales = db.prepare(`
      SELECT categories.name AS name, SUM(order_items.quantity) AS quantity
      FROM order_items
      JOIN orders ON orders.id = order_items.order_id AND orders.status != 'Đã hủy'
      JOIN products ON products.id = order_items.product_id
      JOIN categories ON categories.id = products.category_id
      GROUP BY categories.id
      ORDER BY quantity DESC
    `).all();

    res.json({ revenue, orderCount, productCount, customerCount, byStatus, categorySales, lowStock });
  });

  // ---- Đơn hàng ----
  router.get("/orders", (req, res) => {
    const rows = db.prepare("SELECT * FROM orders ORDER BY id DESC").all();
    res.json({ orders: rows.map((row) => toOrder(db, row)) });
  });

  router.patch("/orders/:id", (req, res) => {
    const orderId = validate.id(req.params.id, "Mã đơn");
    const status = req.body?.status;
    if (!ORDER_STATUSES.includes(status)) throw new HttpError(400, "Trạng thái không hợp lệ.");
    res.json({ order: changeStatus(db, orderId, status) });
  });

  // ---- Sản phẩm ----
  router.get("/products", (req, res) => {
    const rows = db.prepare(`${PRODUCT_SELECT} ORDER BY products.is_active DESC, products.id DESC`).all();
    res.json({ products: rows.map(toProduct) });
  });

  router.post("/products", (req, res) => {
    const p = parseProduct(db, req.body ?? {});
    const { lastInsertRowid } = db.prepare(`
      INSERT INTO products (name, category_id, brand, price, old_price, badge, stock, image, description, specs)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(p.name, p.categoryId, p.brand, p.price, p.oldPrice, p.badge, p.stock, p.image, p.description, p.specs);
    res.status(201).json({ product: toProduct(findProduct(Number(lastInsertRowid))) });
  });

  router.put("/products/:id", (req, res) => {
    const id = validate.id(req.params.id, "Mã sản phẩm");
    const p = parseProduct(db, req.body ?? {});
    const { changes } = db.prepare(`
      UPDATE products SET name = ?, category_id = ?, brand = ?, price = ?, old_price = ?, badge = ?,
                          stock = ?, image = ?, description = ?, specs = ?
      WHERE id = ?
    `).run(p.name, p.categoryId, p.brand, p.price, p.oldPrice, p.badge, p.stock, p.image, p.description, p.specs, id);
    if (!changes) throw new HttpError(404, "Không tìm thấy sản phẩm.");
    res.json({ product: toProduct(findProduct(id)) });
  });

  // Ẩn hoặc bán lại sản phẩm. Không xóa hẳn để lịch sử đơn hàng cũ vẫn còn nguyên.
  router.patch("/products/:id/active", (req, res) => {
    const id = validate.id(req.params.id, "Mã sản phẩm");
    if (typeof req.body?.isActive !== "boolean") throw new HttpError(400, "Giá trị không hợp lệ.");
    const { changes } = db.prepare("UPDATE products SET is_active = ? WHERE id = ?").run(req.body.isActive ? 1 : 0, id);
    if (!changes) throw new HttpError(404, "Không tìm thấy sản phẩm.");
    res.json({ product: toProduct(findProduct(id)) });
  });

  // ---- Danh mục ----
  router.post("/categories", (req, res) => {
    const c = parseCategory(req.body ?? {});
    try {
      const { lastInsertRowid } = db.prepare("INSERT INTO categories (name, image) VALUES (?, ?)").run(c.name, c.image);
      res.status(201).json({ category: { id: Number(lastInsertRowid), ...c } });
    } catch (error) {
      throw uniqueName(error);
    }
  });

  router.put("/categories/:id", (req, res) => {
    const id = validate.id(req.params.id, "Mã danh mục");
    const c = parseCategory(req.body ?? {});
    try {
      const { changes } = db.prepare("UPDATE categories SET name = ?, image = ? WHERE id = ?").run(c.name, c.image, id);
      if (!changes) throw new HttpError(404, "Không tìm thấy danh mục.");
      res.json({ category: { id, ...c } });
    } catch (error) {
      throw uniqueName(error);
    }
  });

  router.delete("/categories/:id", (req, res) => {
    const id = validate.id(req.params.id, "Mã danh mục");
    const { count } = db.prepare("SELECT COUNT(*) AS count FROM products WHERE category_id = ?").get(id);
    if (count > 0) throw new HttpError(409, `Danh mục còn ${count} sản phẩm (kể cả sản phẩm đã ẩn) nên chưa thể xóa.`);
    const { changes } = db.prepare("DELETE FROM categories WHERE id = ?").run(id);
    if (!changes) throw new HttpError(404, "Không tìm thấy danh mục.");
    res.json({ ok: true });
  });

  // ---- Đánh giá ----
  // Quản trị viên thấy cả đánh giá đang ẩn, kèm email để liên hệ khi cần.
  router.get("/reviews", (req, res) => {
    const reviews = db.prepare(`
      SELECT reviews.id, reviews.product_id AS productId, products.name AS productName,
             users.name AS userName, users.email AS userEmail, reviews.rating, reviews.comment,
             reviews.is_hidden AS isHidden, reviews.updated_at AS updatedAt
      FROM reviews
      JOIN products ON products.id = reviews.product_id
      JOIN users ON users.id = reviews.user_id
      ORDER BY reviews.updated_at DESC, reviews.id DESC
    `).all().map((review) => ({ ...review, isHidden: review.isHidden === 1 }));
    res.json({ reviews });
  });

  // Ẩn thay vì xóa, để hiện lại được nếu ẩn nhầm.
  router.patch("/reviews/:id", (req, res) => {
    const id = validate.id(req.params.id, "Mã đánh giá");
    if (typeof req.body?.isHidden !== "boolean") throw new HttpError(400, "Giá trị không hợp lệ.");
    const { changes } = db.prepare("UPDATE reviews SET is_hidden = ? WHERE id = ?").run(req.body.isHidden ? 1 : 0, id);
    if (!changes) throw new HttpError(404, "Không tìm thấy đánh giá.");
    res.json({ ok: true });
  });

  // ---- Khách hàng ----
  router.get("/customers", (req, res) => {
    const customers = db.prepare(`
      SELECT users.id, users.name, users.email, users.created_at AS createdAt,
             COUNT(orders.id) AS orderCount
      FROM users LEFT JOIN orders ON orders.user_id = users.id
      WHERE users.role = 'customer'
      GROUP BY users.id
      ORDER BY users.id DESC
    `).all();
    res.json({ customers });
  });

  return router;
};
