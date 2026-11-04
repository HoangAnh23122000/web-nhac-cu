// Dữ liệu công khai: sản phẩm đang bán, danh mục và chính sách phí giao hàng.
const express = require("express");
const config = require("../config");
const { toRating } = require("../reviews");

function toProduct(row) {
  return {
    id: row.id,
    name: row.name,
    categoryId: row.category_id,
    category: row.category,
    brand: row.brand,
    price: row.price,
    oldPrice: row.old_price,
    badge: row.badge,
    stock: row.stock,
    image: row.image,
    description: row.description,
    specs: JSON.parse(row.specs),
    isActive: row.is_active === 1,
    rating: toRating(row.rating_average, row.rating_count)
  };
}

// Kèm điểm đánh giá trung bình, chỉ tính đánh giá đang hiển thị.
const PRODUCT_SELECT = `
  SELECT products.*, categories.name AS category,
         ratings.average AS rating_average, ratings.count AS rating_count
  FROM products
  JOIN categories ON categories.id = products.category_id
  LEFT JOIN (
    SELECT product_id, AVG(rating) AS average, COUNT(*) AS count
    FROM reviews WHERE is_hidden = 0 GROUP BY product_id
  ) AS ratings ON ratings.product_id = products.id
`;

function catalogRoutes(db) {
  const router = express.Router();

  router.get("/catalog", (req, res) => {
    const products = db.prepare(`${PRODUCT_SELECT} WHERE products.is_active = 1 ORDER BY products.id`).all().map(toProduct);
    const categories = db.prepare(`
      SELECT categories.id, categories.name, categories.image,
             COUNT(products.id) AS productCount
      FROM categories
      LEFT JOIN products ON products.category_id = categories.id AND products.is_active = 1
      GROUP BY categories.id
      ORDER BY categories.id
    `).all();
    res.json({ products, categories, shipping: config.shipping });
  });

  return router;
}

module.exports = { catalogRoutes, toProduct, PRODUCT_SELECT };
