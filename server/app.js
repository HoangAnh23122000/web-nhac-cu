// Ghép các thành phần thành ứng dụng web. Tách khỏi index.js để viết test được.
const express = require("express");
const helmet = require("helmet").default;
const cookieParser = require("cookie-parser");
const config = require("./config");
const { loadUser } = require("./auth");
const { catalogRoutes } = require("./routes/catalog");
const authRoutes = require("./routes/auth");
const orderRoutes = require("./routes/orders");
const adminRoutes = require("./routes/admin");

function createApp(db, options = {}) {
  const app = express();
  app.disable("x-powered-by");

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        "script-src": ["'self'"],
        "img-src": ["'self'", "data:", "https:"],
        // Chạy trên http://localhost nên không ép chuyển sang https
        "upgrade-insecure-requests": config.isProduction ? [] : null
      }
    },
    strictTransportSecurity: config.isProduction
  }));
  app.use(express.json({ limit: "100kb" }));
  app.use(cookieParser());
  app.use(loadUser(db));

  app.use("/api", catalogRoutes(db));
  app.use("/api/auth", authRoutes(db, options));
  app.use("/api/orders", orderRoutes(db));
  app.use("/api/admin", adminRoutes(db));
  app.use("/api", (req, res) => res.status(404).json({ error: "Không tìm thấy." }));

  app.use(express.static(config.publicDir, { extensions: ["html"] }));

  // Lỗi có chủ đích trả về thông báo; lỗi ngoài dự kiến thì ghi log và không lộ chi tiết.
  app.use((error, req, res, next) => {
    if (error.status && error.status < 500) {
      const message = error.type ? "Dữ liệu gửi lên không hợp lệ." : error.message;
      return res.status(error.status).json({ error: message });
    }
    console.error(error);
    return res.status(500).json({ error: "Máy chủ gặp lỗi, vui lòng thử lại." });
  });

  return app;
}

module.exports = { createApp };
