// Kết nối SQLite và định nghĩa các bảng dữ liệu.
const fs = require("node:fs");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");

const ORDER_STATUSES = ["Chờ xác nhận", "Đã xác nhận", "Đang giao", "Hoàn thành", "Đã hủy"];
const statusList = ORDER_STATUSES.map((status) => `'${status}'`).join(", ");

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS categories (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    name  TEXT NOT NULL UNIQUE COLLATE NOCASE,
    image TEXT NOT NULL DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS products (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    brand       TEXT NOT NULL,
    price       INTEGER NOT NULL CHECK (price >= 0),
    old_price   INTEGER CHECK (old_price IS NULL OR old_price >= 0),
    badge       TEXT NOT NULL DEFAULT '',
    stock       INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    image       TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    specs       TEXT NOT NULL DEFAULT '{}',
    is_active   INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS orders (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    code           TEXT UNIQUE,
    user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    customer_name  TEXT NOT NULL,
    phone          TEXT NOT NULL,
    address        TEXT NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'COD' CHECK (payment_method = 'COD'),
    subtotal       INTEGER NOT NULL,
    shipping_fee   INTEGER NOT NULL,
    total          INTEGER NOT NULL,
    status         TEXT NOT NULL DEFAULT 'Chờ xác nhận' CHECK (status IN (${statusList})),
    created_at     TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Lưu lại tên và giá tại thời điểm mua, để đơn cũ không đổi khi sản phẩm đổi giá.
  CREATE TABLE IF NOT EXISTS order_items (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id     INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id   INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    product_name TEXT NOT NULL,
    unit_price   INTEGER NOT NULL,
    quantity     INTEGER NOT NULL CHECK (quantity > 0)
  );

  CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
  CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
  CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
`;

function openDb(dbPath) {
  if (dbPath !== ":memory:") fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec("PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;");
  db.exec(SCHEMA);
  return db;
}

// Chạy nhiều câu lệnh như một khối: lỗi ở bất kỳ bước nào thì hoàn tác toàn bộ.
function transaction(db, work) {
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = work();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

module.exports = { openDb, transaction, ORDER_STATUSES };
