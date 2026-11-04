// Đánh giá sản phẩm: ai cũng xem được, khách đã nhận hàng mới gửi được.
const express = require("express");
const validate = require("../validate");
const { requireLogin } = require("../auth");
const reviews = require("../reviews");

module.exports = function reviewRoutes(db) {
  const router = express.Router();

  router.get("/:id/reviews", (req, res) => {
    const productId = validate.id(req.params.id, "Mã sản phẩm");
    reviews.requireActiveProduct(db, productId);
    const user = req.user;
    res.json({
      summary: reviews.ratingSummary(db, productId),
      reviews: reviews.listReviews(db, productId, user?.id),
      me: {
        loggedIn: Boolean(user),
        canReview: user ? reviews.canReview(db, user.id, productId) : false,
        review: user ? reviews.ownReview(db, user.id, productId) : null
      }
    });
  });

  router.post("/:id/reviews", requireLogin, (req, res) => {
    const productId = validate.id(req.params.id, "Mã sản phẩm");
    reviews.requireActiveProduct(db, productId);
    const body = req.body ?? {};
    const { created, review } = reviews.saveReview(db, {
      userId: req.user.id,
      productId,
      rating: validate.integer(body.rating, "Số sao", { min: 1, max: 5 }),
      comment: validate.text(body.comment, "nhận xét", { max: 1000, required: false })
    });
    res.status(created ? 201 : 200).json({ review });
  });

  return router;
};
