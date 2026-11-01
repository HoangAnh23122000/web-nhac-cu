// Lỗi có chủ đích: mang mã HTTP và thông báo tiếng Việt hiển thị được cho người dùng.
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

module.exports = { HttpError };
