// Kiểm tra dữ liệu người dùng gửi lên. Không tin dữ liệu từ trình duyệt.
const { HttpError } = require("./errors");

function text(value, label, { max = 200, required = true } = {}) {
  const result = typeof value === "string" ? value.trim() : "";
  if (required && !result) throw new HttpError(400, `Vui lòng nhập ${label}.`);
  if (result.length > max) throw new HttpError(400, `${label} không được dài quá ${max} ký tự.`);
  return result;
}

function email(value) {
  const result = text(value, "email", { max: 200 }).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result)) throw new HttpError(400, "Email không hợp lệ.");
  return result;
}

function newPassword(value) {
  if (typeof value !== "string" || value.length < 8) throw new HttpError(400, "Mật khẩu cần tối thiểu 8 ký tự.");
  // bcrypt chỉ dùng 72 byte đầu tiên
  if (Buffer.byteLength(value) > 72) throw new HttpError(400, "Mật khẩu quá dài.");
  return value;
}

function phone(value) {
  const result = text(value, "số điện thoại", { max: 20 }).replace(/[\s.-]/g, "");
  if (!/^0\d{9}$/.test(result)) throw new HttpError(400, "Số điện thoại cần gồm 10 chữ số và bắt đầu bằng 0.");
  return result;
}

function integer(value, label, { min = 0, max = 1000000000, required = true } = {}) {
  if (!required && (value === null || value === undefined || value === "")) return null;
  const result = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
  if (!Number.isInteger(result) || result < min || result > max) {
    throw new HttpError(400, `${label} phải là số nguyên từ ${min} đến ${max}.`);
  }
  return result;
}

function id(value, label = "Mã") {
  return integer(value, label, { min: 1, max: Number.MAX_SAFE_INTEGER });
}

// Chỉ cho phép ảnh trong thư mục images/ của dự án hoặc liên kết https.
function imagePath(value) {
  const result = text(value, "đường dẫn ảnh", { max: 500, required: false });
  if (result && !/^images\/[\w./-]+$/.test(result) && !/^https:\/\/[^\s"'<>]+$/.test(result)) {
    throw new HttpError(400, "Ảnh phải nằm trong thư mục images/ hoặc là liên kết https://.");
  }
  if (result.includes("..")) throw new HttpError(400, "Đường dẫn ảnh không hợp lệ.");
  return result;
}

function specs(value) {
  if (value === undefined || value === null) return {};
  if (typeof value !== "object" || Array.isArray(value)) throw new HttpError(400, "Thông số kỹ thuật không hợp lệ.");
  const result = {};
  for (const [key, entry] of Object.entries(value)) {
    const label = text(key, "tên thông số", { max: 60 });
    result[label] = text(String(entry), "giá trị thông số", { max: 200 });
  }
  return result;
}

module.exports = { text, email, newPassword, phone, integer, id, imagePath, specs };
