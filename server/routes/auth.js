// Đăng ký, đăng nhập, đăng xuất.
const express = require("express");
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit").default;
const config = require("../config");
const validate = require("../validate");
const { HttpError } = require("../errors");
const { startSession, endSession } = require("../auth");

// So sánh với mã băm giả khi email không tồn tại, để không lộ email nào đã đăng ký qua thời gian phản hồi.
const DUMMY_HASH = bcrypt.hashSync("mat-khau-gia-de-so-sanh", config.bcryptRounds);

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

module.exports = function authRoutes(db, { authRateLimit = 20 } = {}) {
  const router = express.Router();
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: authRateLimit,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Bạn thử quá nhiều lần. Vui lòng đợi 15 phút rồi thử lại." }
  });

  router.get("/me", (req, res) => {
    res.json({ user: req.user ? publicUser(req.user) : null });
  });

  router.post("/register", limiter, async (req, res) => {
    const body = req.body ?? {};
    const name = validate.text(body.name, "họ và tên", { max: 100 });
    const email = validate.email(body.email);
    const password = validate.newPassword(body.password);

    if (db.prepare("SELECT id FROM users WHERE email = ?").get(email)) {
      throw new HttpError(409, "Email này đã được đăng ký.");
    }

    const passwordHash = await bcrypt.hash(password, config.bcryptRounds);
    let userId;
    try {
      userId = Number(db.prepare("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)")
        .run(name, email, passwordHash).lastInsertRowid);
    } catch (error) {
      if (/UNIQUE/.test(error.message)) throw new HttpError(409, "Email này đã được đăng ký.");
      throw error;
    }

    startSession(db, res, userId);
    res.status(201).json({ user: { id: userId, name, email, role: "customer" } });
  });

  router.post("/login", limiter, async (req, res) => {
    const body = req.body ?? {};
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

    const matches = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);
    if (!user || !matches) throw new HttpError(401, "Email hoặc mật khẩu không đúng.");

    startSession(db, res, user.id);
    res.json({ user: publicUser(user) });
  });

  router.post("/logout", (req, res) => {
    endSession(db, req, res);
    res.json({ ok: true });
  });

  return router;
};
