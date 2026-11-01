// Điểm khởi động máy chủ: npm start
const config = require("./config");
const { openDb } = require("./db");
const { seed } = require("./seed");
const { createApp } = require("./app");

const db = openDb(config.dbPath);
seed(db);

createApp(db).listen(config.port, () => {
  console.log(`\nMộc Music đang chạy tại: http://localhost:${config.port}`);
  console.log("Nhấn Ctrl + C để dừng.\n");
});
