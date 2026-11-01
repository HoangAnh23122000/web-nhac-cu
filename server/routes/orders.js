// Đơn hàng của khách đang đăng nhập.
const express = require("express");
const validate = require("../validate");
const { HttpError } = require("../errors");
const { requireLogin } = require("../auth");
const { createOrder, changeStatus, toOrder } = require("../orders");

const MAX_LINES = 50;
const MAX_QUANTITY = 99;

function parseItems(value) {
  if (!Array.isArray(value) || value.length === 0) throw new HttpError(400, "Giỏ hàng đang trống.");
  if (value.length > MAX_LINES) throw new HttpError(400, "Đơn hàng có quá nhiều sản phẩm.");

  // Gộp các dòng trùng sản phẩm để kiểm tra tồn kho cho đúng.
  const quantities = new Map();
  for (const item of value) {
    const productId = validate.id(item?.productId, "Mã sản phẩm");
    const quantity = validate.integer(item?.quantity, "Số lượng", { min: 1, max: MAX_QUANTITY });
    quantities.set(productId, (quantities.get(productId) || 0) + quantity);
  }
  return [...quantities].map(([productId, quantity]) => ({ productId, quantity }));
}

module.exports = function orderRoutes(db) {
  const router = express.Router();
  router.use(requireLogin);

  router.post("/", (req, res) => {
    const body = req.body ?? {};
    const order = createOrder(db, {
      userId: req.user.id,
      customerName: validate.text(body.customerName, "họ và tên người nhận", { max: 100 }),
      phone: validate.phone(body.phone),
      address: validate.text(body.address, "địa chỉ nhận hàng", { max: 300 }),
      items: parseItems(body.items)
    });
    res.status(201).json({ order });
  });

  router.get("/mine", (req, res) => {
    const rows = db.prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC").all(req.user.id);
    res.json({ orders: rows.map((row) => toOrder(db, row)) });
  });

  // Khách chỉ được hủy đơn của chính mình, khi cửa hàng chưa xác nhận.
  router.post("/:id/cancel", (req, res) => {
    const orderId = validate.id(req.params.id, "Mã đơn");
    const order = db.prepare("SELECT user_id, status FROM orders WHERE id = ?").get(orderId);
    if (!order || order.user_id !== req.user.id) throw new HttpError(404, "Không tìm thấy đơn hàng.");
    if (order.status !== "Chờ xác nhận") {
      throw new HttpError(409, "Đơn đã được xác nhận nên không thể tự hủy. Vui lòng gọi hotline để được hỗ trợ.");
    }
    res.json({ order: changeStatus(db, orderId, "Đã hủy") });
  });

  return router;
};
