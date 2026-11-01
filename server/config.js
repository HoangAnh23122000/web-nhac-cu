// Các cấu hình chung của hệ thống. Có thể đổi bằng biến môi trường khi triển khai.
const path = require("node:path");

const isProduction = process.env.NODE_ENV === "production";

module.exports = {
  isProduction,
  port: Number(process.env.PORT) || 3000,
  dbPath: process.env.DB_PATH || path.join(__dirname, "..", "data", "moc-music.db"),
  publicDir: path.join(__dirname, "..", "public"),

  // Phí giao hàng: đơn từ threshold trở lên được miễn phí.
  shipping: { threshold: 2000000, fee: 30000 },

  sessionDays: 7,
  bcryptRounds: 10,

  // Tài khoản mẫu để chạy thử. Khi triển khai thật bắt buộc đặt ADMIN_PASSWORD.
  admin: {
    email: process.env.ADMIN_EMAIL || "admin@mocmusic.vn",
    password: process.env.ADMIN_PASSWORD || (isProduction ? null : "Admin@12345")
  },
  demoCustomer: { name: "Khách Hàng Mẫu", email: "khach@mocmusic.vn", password: "Khach@12345" }
};
