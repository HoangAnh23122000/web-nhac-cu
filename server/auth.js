// Phiên đăng nhập và kiểm tra quyền truy cập.
const crypto = require("node:crypto");
const config = require("./config");
const { HttpError } = require("./errors");

const COOKIE_NAME = "sid";

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function cookieOptions() {
  return {
    httpOnly: true, // JavaScript trên trang không đọc được cookie
    sameSite: "lax", // Trang web khác không gửi yêu cầu POST kèm phiên đăng nhập được
    secure: config.isProduction,
    path: "/"
  };
}

// Trong CSDL chỉ lưu bản băm của token, nên lộ CSDL cũng không dùng được phiên.
function startSession(db, res, userId) {
  db.prepare("DELETE FROM sessions WHERE expires_at < ?").run(Date.now());
  const token = crypto.randomBytes(32).toString("hex");
  const maxAge = config.sessionDays * 24 * 60 * 60 * 1000;
  db.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)")
    .run(hashToken(token), userId, Date.now() + maxAge);
  res.cookie(COOKIE_NAME, token, { ...cookieOptions(), maxAge });
}

function endSession(db, req, res) {
  const token = req.cookies[COOKIE_NAME];
  if (token) db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(token));
  res.clearCookie(COOKIE_NAME, cookieOptions());
}

// Gắn req.user nếu cookie hợp lệ.
function loadUser(db) {
  const findSession = db.prepare(`
    SELECT users.id, users.name, users.email, users.role
    FROM sessions JOIN users ON users.id = sessions.user_id
    WHERE sessions.token_hash = ? AND sessions.expires_at > ?
  `);
  return (req, res, next) => {
    const token = req.cookies[COOKIE_NAME];
    req.user = (token && findSession.get(hashToken(token), Date.now())) || null;
    next();
  };
}

function requireLogin(req, res, next) {
  if (!req.user) throw new HttpError(401, "Vui lòng đăng nhập để tiếp tục.");
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user) throw new HttpError(401, "Vui lòng đăng nhập để tiếp tục.");
  if (req.user.role !== "admin") throw new HttpError(403, "Bạn không có quyền truy cập khu vực quản trị.");
  next();
}

module.exports = { startSession, endSession, loadUser, requireLogin, requireAdmin };
