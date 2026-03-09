const express = require("express");
const wishlistController = require("../controllers/wishlistController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", wishlistController.getWishlist);
router.post("/add", wishlistController.addToWishlist);
router.post("/remove", wishlistController.removeFromWishlist);
router.post("/move-to-cart", wishlistController.moveToCart);

module.exports = router;
