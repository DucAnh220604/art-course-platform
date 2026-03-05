const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");

// Lấy danh sách đánh giá của 1 khóa học (Trùng khớp với FE: /reviews/course/...)
router.get("/course/:courseId", reviewController.getCourseReviews);

// Tạo đánh giá mới (Gửi dữ liệu qua body, đường dẫn chỉ là /reviews)
router.post("/", protect, reviewController.createReview);

// Sửa và Xóa đánh giá (Dùng ID của chính cái review đó)
router.put("/:id", protect, reviewController.updateReview);
router.delete("/:id", protect, reviewController.deleteReview);

module.exports = router;
