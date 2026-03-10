const express = require("express");
const comboController = require("../controllers/comboController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes - ĐẶT ROUTES CỤ THỂ TRƯỚC ROUTES ĐỘNG
router.get("/", comboController.getAllCombos);

// Route lấy combos chứa một course cụ thể (phải đặt trước /:slug)
router.get(
  "/course/:courseId/containing",
  protect, // Cần protect để tính giá nâng cấp
  comboController.getCombosContainingCourse,
);

// Route lấy combo theo slug - có optional auth để tính giá nâng cấp
router.get(
  "/:slug",
  (req, res, next) => {
    // Optional protect: nếu có token thì verify, không có thì skip
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      return protect(req, res, next);
    }
    next();
  },
  comboController.getComboBySlug,
);

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
