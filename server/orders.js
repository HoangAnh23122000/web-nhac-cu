// Nghiệp vụ đơn hàng dùng chung cho khách hàng và quản trị.
const config = require("./config");
const { transaction } = require("./db");
const { HttpError } = require("./errors");

// Các bước chuyển trạng thái hợp lệ. Hoàn thành và Đã hủy là trạng thái cuối.
const NEXT_STATUSES = {
  "Chờ xác nhận": ["Đã xác nhận", "Đã hủy"],
  "Đã xác nhận": ["Đang giao", "Đã hủy"],
  "Đang giao": ["Hoàn thành", "Đã hủy"],
  "Hoàn thành": [],
  "Đã hủy": []
};

function shippingFee(subtotal) {
  return subtotal >= config.shipping.threshold ? 0 : config.shipping.fee;
}

function toOrder(db, row) {
  const items = db.prepare(`
    SELECT product_id AS productId, product_name AS name, unit_price AS unitPrice, quantity
    FROM order_items WHERE order_id = ? ORDER BY id
  `).all(row.id);
  return {
    id: row.id,
    code: row.code,
    userId: row.user_id,
    customerName: row.customer_name,
    phone: row.phone,
    address: row.address,
    paymentMethod: row.payment_method,
    subtotal: row.subtotal,
    shippingFee: row.shipping_fee,
    total: row.total,
    status: row.status,
    createdAt: row.created_at,
    nextStatuses: NEXT_STATUSES[row.status],
    items
  };
}

// Tạo đơn: giá lấy từ CSDL, còn trình duyệt chỉ gửi mã sản phẩm và số lượng.
function createOrder(db, { userId, customerName, phone, address, items }) {
  return transaction(db, () => {
    const findProduct = db.prepare("SELECT id, name, price, stock, is_active FROM products WHERE id = ?");
    const takeStock = db.prepare("UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?");
    const lines = [];

    for (const { productId, quantity } of items) {
      const product = findProduct.get(productId);
      if (!product || product.is_active !== 1) {
        throw new HttpError(409, "Một sản phẩm trong giỏ không còn được bán. Vui lòng kiểm tra lại giỏ hàng.");
      }
      if (takeStock.run(quantity, productId, quantity).changes === 0) {
        throw new HttpError(409, `"${product.name}" chỉ còn ${product.stock} sản phẩm.`);
      }
      lines.push({ product, quantity });
    }

    const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
    const fee = shippingFee(subtotal);

    const orderId = Number(db.prepare(`
      INSERT INTO orders (user_id, customer_name, phone, address, subtotal, shipping_fee, total)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(userId, customerName, phone, address, subtotal, fee, subtotal + fee).lastInsertRowid);

    // Mã đơn lấy theo số thứ tự nên không bao giờ trùng.
    db.prepare("UPDATE orders SET code = ? WHERE id = ?").run(`MM${String(orderId).padStart(6, "0")}`, orderId);

    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity)
      VALUES (?, ?, ?, ?, ?)
    `);
    for (const { product, quantity } of lines) {
      insertItem.run(orderId, product.id, product.name, product.price, quantity);
    }

    return toOrder(db, db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId));
  });
}

// Đổi trạng thái đơn. Khi hủy đơn thì hoàn lại tồn kho.
function changeStatus(db, orderId, nextStatus) {
  return transaction(db, () => {
    const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId);
    if (!order) throw new HttpError(404, "Không tìm thấy đơn hàng.");

    const allowed = NEXT_STATUSES[order.status];
    if (!allowed.includes(nextStatus)) {
      throw new HttpError(409, `Không thể chuyển đơn từ "${order.status}" sang "${nextStatus}".`);
    }

    if (nextStatus === "Đã hủy") {
      const items = db.prepare("SELECT product_id, quantity FROM order_items WHERE order_id = ?").all(orderId);
      const restock = db.prepare("UPDATE products SET stock = stock + ? WHERE id = ?");
      for (const item of items) restock.run(item.quantity, item.product_id);
    }

    db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(nextStatus, orderId);
    return toOrder(db, db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId));
  });
}

module.exports = { createOrder, changeStatus, toOrder, shippingFee, NEXT_STATUSES };
