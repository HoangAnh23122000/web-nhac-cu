// Dữ liệu ban đầu: danh mục, sản phẩm và tài khoản mẫu. Chỉ thêm khi dữ liệu còn trống.
const bcrypt = require("bcryptjs");
const config = require("./config");
const { transaction } = require("./db");

const categories = [
  { name: "Guitar", image: "images/c-guitar.jpg" },
  { name: "Piano", image: "images/c-piano.jpg" },
  { name: "Trống", image: "images/c-drums.jpg" },
  { name: "Violin", image: "images/c-violin.jpg" },
  { name: "Ukulele", image: "images/p-ukulele.jpg" },
  { name: "Nhạc cụ hơi", image: "images/p-flute.jpg" },
  { name: "Phụ kiện", image: "images/p-headphones.jpg" }
];

const products = [
  {
    name: "Guitar Acoustic Yamaha F310", category: "Guitar", brand: "Yamaha", price: 3490000, oldPrice: 3890000,
    badge: "Bán chạy", stock: 12, image: "images/p-yamaha-f310.jpg",
    description: "Mẫu guitar acoustic được yêu thích nhờ âm thanh cân bằng, phím đàn dễ chơi và độ bền cao. Phù hợp cho người mới bắt đầu lẫn người chơi lâu năm.",
    specs: { "Mặt đàn": "Gỗ Spruce", "Lưng và hông": "Gỗ Tonewood", "Dáng đàn": "Dreadnought", "Xuất xứ": "Indonesia" }
  },
  {
    name: "Piano Điện Roland FP-10", category: "Piano", brand: "Roland", price: 12990000, oldPrice: 14500000,
    badge: "Giảm 10%", stock: 7, image: "images/p-roland-fp10.jpg",
    description: "Piano điện nhỏ gọn với 88 phím nặng chuẩn, âm thanh SuperNATURAL chân thực và kết nối Bluetooth MIDI tiện lợi.",
    specs: { "Bàn phím": "88 phím PHA-4", "Âm sắc": "15 voices", "Công suất": "2 x 6W", "Kết nối": "Bluetooth MIDI" }
  },
  {
    name: "Guitar Điện Fender Player Stratocaster", category: "Guitar", brand: "Fender", price: 21900000, oldPrice: null,
    badge: "Mới", stock: 4, image: "images/p-fender-strat.jpg",
    description: "Âm thanh Fender đặc trưng, thiết kế biểu tượng và cảm giác chơi mượt mà. Một cây đàn linh hoạt cho nhiều thể loại âm nhạc.",
    specs: { "Thân đàn": "Alder", "Cần đàn": "Maple", "Pickup": "3 Player Series", "Số phím": "22" }
  },
  {
    name: "Bộ Trống Cơ Pearl Roadshow", category: "Trống", brand: "Pearl", price: 15490000, oldPrice: 16900000,
    badge: "Ưu đãi", stock: 5, image: "images/p-pearl-drums.jpg",
    description: "Bộ trống đầy đủ cấu hình cho người mới, gồm hardware và cymbal. Chất âm mạnh mẽ, chắc chắn và dễ căn chỉnh.",
    specs: { "Số trống": "5 chiếc", "Chất liệu": "Poplar 9 lớp", "Cymbal": "Hi-hat + Crash", "Màu": "Jet Black" }
  },
  {
    name: "Violin Scott Cao STV-017", category: "Violin", brand: "Scott Cao", price: 5850000, oldPrice: null,
    badge: "Gợi ý", stock: 9, image: "images/p-violin.jpg",
    description: "Violin thủ công có âm sắc ấm, độ vang tốt và ngoại hình cổ điển. Đi kèm hộp đàn, vĩ và nhựa thông.",
    specs: { "Kích thước": "4/4", "Mặt đàn": "Gỗ Spruce", "Lưng đàn": "Gỗ Maple", "Phụ kiện": "Hộp + vĩ" }
  },
  {
    name: "Ukulele Concert Enya Nova U", category: "Ukulele", brand: "Enya", price: 1890000, oldPrice: 2190000,
    badge: "Yêu thích", stock: 18, image: "images/p-ukulele.jpg",
    description: "Ukulele carbon chống nước với thiết kế hiện đại, âm thanh trong trẻo và trọng lượng rất nhẹ, lý tưởng để mang theo mọi nơi.",
    specs: { "Kích thước": "Concert 23 inch", "Chất liệu": "Carbon Fiber", "Dây": "Fluorocarbon", "Phụ kiện": "Bao + capo" }
  },
  {
    name: "Keyboard Casio CT-S300", category: "Piano", brand: "Casio", price: 4790000, oldPrice: 5200000,
    badge: "Cho người mới", stock: 11, image: "images/p-casio-keyboard.jpg",
    description: "Keyboard 61 phím năng động, tích hợp 400 âm sắc và bánh xe pitch bend. Thiết kế tay cầm giúp di chuyển thuận tiện.",
    specs: { "Bàn phím": "61 phím", "Âm sắc": "400 tones", "Điệu đệm": "77 rhythms", "Nguồn": "Adapter hoặc pin" }
  },
  {
    name: "Sáo Flute Yamaha YFL-222", category: "Nhạc cụ hơi", brand: "Yamaha", price: 15900000, oldPrice: null,
    badge: "Chính hãng", stock: 6, image: "images/p-flute.jpg",
    description: "Flute tiêu chuẩn dành cho học sinh với thiết kế phím bấm thoải mái, phản hồi nhạy và âm thanh rõ ràng ở mọi quãng.",
    specs: { "Hệ thống": "Offset G", "Phím": "Covered keys", "Chất liệu": "Nickel silver", "E mechanism": "Có" }
  },
  {
    name: "Loa Guitar Marshall MG15G", category: "Phụ kiện", brand: "Marshall", price: 3290000, oldPrice: 3600000,
    badge: "Phổ biến", stock: 14, image: "images/p-marshall-amp.jpg",
    description: "Amp guitar 15W nhỏ gọn, hai kênh clean và overdrive cùng thiết kế Marshall cổ điển, phù hợp luyện tập tại nhà.",
    specs: { "Công suất": "15W", "Loa": "8 inch", "Kênh": "Clean + Overdrive", "Kết nối": "AUX + Headphone" }
  },
  {
    name: "Guitar Classic Cordoba C5", category: "Guitar", brand: "Cordoba", price: 9990000, oldPrice: null,
    badge: "Cao cấp", stock: 3, image: "images/p-cordoba.jpg",
    description: "Guitar classic mặt gỗ Cedar nguyên tấm, mang lại âm thanh ấm áp và giàu sắc thái trong một thiết kế Tây Ban Nha tinh tế.",
    specs: { "Mặt đàn": "Solid Cedar", "Lưng hông": "Mahogany", "Cần đàn": "Mahogany", "Scale": "650mm" }
  },
  {
    name: "Cajon Meinl Headliner", category: "Trống", brand: "Meinl", price: 2790000, oldPrice: 3100000,
    badge: "Giảm giá", stock: 15, image: "images/p-cajon.jpg",
    description: "Trống cajon có tiếng bass sâu và snare sắc nét, kích thước thoải mái cho các buổi biểu diễn acoustic và đường phố.",
    specs: { "Mặt trống": "MDF", "Dây snare": "Điều chỉnh được", "Chiều cao": "46cm", "Chân": "Cao su chống trượt" }
  },
  {
    name: "Tai Nghe Kiểm Âm Audio-Technica M40x", category: "Phụ kiện", brand: "Audio-Technica", price: 2490000, oldPrice: 2790000,
    badge: "Studio", stock: 20, image: "images/p-headphones.jpg",
    description: "Tai nghe kiểm âm chuyên nghiệp với đáp tuyến phẳng, âm thanh chi tiết và thiết kế gập gọn dùng trong studio hoặc luyện nhạc.",
    specs: { "Driver": "40mm", "Tần số": "15–24.000Hz", "Trở kháng": "35 ohms", "Cáp": "Tháo rời" }
  }
];

function seedCatalog(db) {
  const { count } = db.prepare("SELECT COUNT(*) AS count FROM categories").get();
  if (count > 0) return;

  transaction(db, () => {
    const insertCategory = db.prepare("INSERT INTO categories (name, image) VALUES (?, ?)");
    const categoryIds = new Map();
    for (const category of categories) {
      const { lastInsertRowid } = insertCategory.run(category.name, category.image);
      categoryIds.set(category.name, Number(lastInsertRowid));
    }

    const insertProduct = db.prepare(`
      INSERT INTO products (name, category_id, brand, price, old_price, badge, stock, image, description, specs)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const product of products) {
      insertProduct.run(
        product.name, categoryIds.get(product.category), product.brand, product.price, product.oldPrice,
        product.badge, product.stock, product.image, product.description, JSON.stringify(product.specs)
      );
    }
  });
}

function seedUsers(db) {
  const { count } = db.prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'admin'").get();
  if (count > 0) return;

  if (!config.admin.password) {
    throw new Error("Hãy đặt biến môi trường ADMIN_PASSWORD trước khi chạy ở chế độ production.");
  }

  const insertUser = db.prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)");
  insertUser.run("Quản trị viên", config.admin.email, bcrypt.hashSync(config.admin.password, config.bcryptRounds), "admin");

  if (!config.isProduction) {
    const { name, email, password } = config.demoCustomer;
    insertUser.run(name, email, bcrypt.hashSync(password, config.bcryptRounds), "customer");
  }
}

function seed(db) {
  seedCatalog(db);
  seedUsers(db);
}

module.exports = { seed };
