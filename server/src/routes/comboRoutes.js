const express = require("express");
const comboController = require("../controllers/comboController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.get("/", comboController.getAllCombos);
router.get("/:slug", comboController.getComboBySlug);

// Protected routes (Instructor only)
router.post(
  "/",
  protect,
  restrictTo("instructor", "admin"),
  comboController.createCombo,
);
router.put(
  "/:id",
  protect,
  restrictTo("instructor", "admin"),
  comboController.updateCombo,
);
router.delete(
  "/:id",
  protect,
  restrictTo("instructor", "admin"),
  comboController.deleteCombo,
);

module.exports = router;
