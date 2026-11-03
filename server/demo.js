// Dữ liệu demo để trình bày: xóa dữ liệu cũ, thêm khách hàng và đơn hàng mẫu. Chạy: npm run demo
// Đơn được tạo qua đúng nghiệp vụ đặt hàng và đổi trạng thái, nên tồn kho và doanh thu luôn khớp.
const fs = require("node:fs");
const bcrypt = require("bcryptjs");
const config = require("./config");
const { openDb, transaction } = require("./db");
const { seed } = require("./seed");
const { createOrder, changeStatus } = require("./orders");

if (config.isProduction) {
  console.error("Không chạy dữ liệu demo ở chế độ production.");
  process.exit(1);
}

const DEMO_PASSWORD = "Khach@12345";

const customers = [
  { name: "Nguyễn Minh Anh", email: "minhanh@mocmusic.vn", phone: "0901234567", address: "12 Lê Lợi, Quận 1, TP. Hồ Chí Minh", daysAgo: 40 },
  { name: "Trần Quốc Bảo", email: "quocbao@mocmusic.vn", phone: "0912345678", address: "45 Trần Phú, Ba Đình, Hà Nội", daysAgo: 35 },
  { name: "Lê Thu Hà", email: "thuha@mocmusic.vn", phone: "0923456789", address: "8 Nguyễn Văn Linh, Hải Châu, Đà Nẵng", daysAgo: 28 },
  { name: "Phạm Gia Huy", email: "giahuy@mocmusic.vn", phone: "0934567890", address: "102 Hùng Vương, Ninh Kiều, Cần Thơ", daysAgo: 21 },
  { name: "Võ Ngọc Lan", email: "ngoclan@mocmusic.vn", phone: "0945678901", address: "27 Hai Bà Trưng, TP. Huế", daysAgo: 14 }
];

// Mỗi đơn: khách (email), các sản phẩm (tên, số lượng), trạng thái cuối và số ngày trước.
const orders = [
  { email: "minhanh@mocmusic.vn", items: [["Guitar Acoustic Yamaha F310", 1]], status: "Hoàn thành", daysAgo: 30 },
  { email: "quocbao@mocmusic.vn", items: [["Piano Điện Roland FP-10", 1], ["Tai Nghe Kiểm Âm Audio-Technica M40x", 1]], status: "Hoàn thành", daysAgo: 27 },
  { email: "thuha@mocmusic.vn", items: [["Ukulele Concert Enya Nova U", 2]], status: "Hoàn thành", daysAgo: 24 },
  { email: "khach@mocmusic.vn", items: [["Cajon Meinl Headliner", 1]], status: "Hoàn thành", daysAgo: 20 },
  { email: "giahuy@mocmusic.vn", items: [["Guitar Điện Fender Player Stratocaster", 1], ["Loa Guitar Marshall MG15G", 1]], status: "Hoàn thành", daysAgo: 17 },
  { email: "ngoclan@mocmusic.vn", items: [["Violin Scott Cao STV-017", 1]], status: "Hoàn thành", daysAgo: 12 },
  { email: "minhanh@mocmusic.vn", items: [["Keyboard Casio CT-S300", 1]], status: "Đã hủy", daysAgo: 10 },
  { email: "quocbao@mocmusic.vn", items: [["Bộ Trống Cơ Pearl Roadshow", 1]], status: "Đang giao", daysAgo: 6 },
  { email: "thuha@mocmusic.vn", items: [["Sáo Flute Yamaha YFL-222", 1]], status: "Đang giao", daysAgo: 5 },
  { email: "khach@mocmusic.vn", items: [["Tai Nghe Kiểm Âm Audio-Technica M40x", 1]], status: "Đã xác nhận", daysAgo: 3 },
  { email: "giahuy@mocmusic.vn", items: [["Guitar Classic Cordoba C5", 1]], status: "Đã xác nhận", daysAgo: 2 },
  { email: "ngoclan@mocmusic.vn", items: [["Ukulele Concert Enya Nova U", 1]], status: "Đã hủy", daysAgo: 2 },
  { email: "minhanh@mocmusic.vn", items: [["Guitar Acoustic Yamaha F310", 1], ["Tai Nghe Kiểm Âm Audio-Technica M40x", 1]], status: "Chờ xác nhận", daysAgo: 1 },
  { email: "khach@mocmusic.vn", items: [["Keyboard Casio CT-S300", 1]], status: "Chờ xác nhận", daysAgo: 0 }
];

// Thứ tự trạng thái mà một đơn đi qua để đến trạng thái cuối.
const PATH = {
  "Chờ xác nhận": [],
  "Đã xác nhận": ["Đã xác nhận"],
  "Đang giao": ["Đã xác nhận", "Đang giao"],
  "Hoàn thành": ["Đã xác nhận", "Đang giao", "Hoàn thành"],
  "Đã hủy": ["Đã hủy"]
};

const ago = (days) => `datetime('now', '-${Number(days)} days')`;

function seedDemo(db) {
  const insertUser = db.prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'customer')");
  const hash = bcrypt.hashSync(DEMO_PASSWORD, config.bcryptRounds);
  for (const customer of customers) {
    const { lastInsertRowid } = insertUser.run(customer.name, customer.email, hash);
    db.prepare(`UPDATE users SET created_at = ${ago(customer.daysAgo)} WHERE id = ?`).run(lastInsertRowid);
  }
  db.prepare(`UPDATE users SET created_at = ${ago(45)} WHERE email = ?`).run(config.demoCustomer.email);

  const findUser = db.prepare("SELECT id, name FROM users WHERE email = ?");
  const findProduct = db.prepare("SELECT id FROM products WHERE name = ?");
  const contactOf = (email) => customers.find((c) => c.email === email)
    || { phone: "0987654321", address: "99 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh" };

  for (const order of orders) {
    const user = findUser.get(order.email);
    const { phone, address } = contactOf(order.email);
    const items = order.items.map(([name, quantity]) => {
      const product = findProduct.get(name);
      if (!product) throw new Error(`Không tìm thấy sản phẩm "${name}" trong dữ liệu ban đầu.`);
      return { productId: product.id, quantity };
    });

    const created = createOrder(db, { userId: user.id, customerName: user.name, phone, address, items });
    for (const status of PATH[order.status]) changeStatus(db, created.id, status);
    transaction(db, () => {
      db.prepare(`UPDATE orders SET created_at = ${ago(order.daysAgo)} WHERE id = ?`).run(created.id);
    });
  }
}

for (const suffix of ["", "-wal", "-shm"]) {
  fs.rmSync(config.dbPath + suffix, { force: true });
}

const db = openDb(config.dbPath);
seed(db);
seedDemo(db);
db.close();

console.log(`Đã tạo dữ liệu demo: ${customers.length} khách hàng mới và ${orders.length} đơn hàng.`);
console.log(`Mật khẩu của các khách demo: ${DEMO_PASSWORD}`);
