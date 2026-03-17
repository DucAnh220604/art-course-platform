const express = require("express");
const cartController = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, cartController.getCart);
router.post("/add", protect, cartController.addToCart);
router.post("/remove", protect, cartController.removeFromCart);
router.post("/clear", protect, cartController.clearCart);
router.get(
  "/check-course/:courseId",
  protect,
  cartController.checkCourseInCart,
);

module.exports = router;
