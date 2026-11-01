// Xóa toàn bộ dữ liệu và đưa về trạng thái ban đầu: npm run reset
const fs = require("node:fs");
const config = require("./config");
const { openDb } = require("./db");
const { seed } = require("./seed");

for (const suffix of ["", "-wal", "-shm"]) {
  fs.rmSync(config.dbPath + suffix, { force: true });
}

const db = openDb(config.dbPath);
seed(db);
db.close();
console.log("Đã đưa dữ liệu về trạng thái ban đầu.");
