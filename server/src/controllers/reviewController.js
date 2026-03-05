// controllers/reviewController.js
const Review = require("../models/Review");

const reviewController = {
  // Lấy danh sách đánh giá của 1 khóa học
  getCourseReviews: async (req, res) => {
    try {
      const reviews = await Review.find({ course: req.params.courseId })
        .populate("user", "fullname avatar") // Lấy tên và avatar người đánh giá
        .sort("-createdAt"); // Mới nhất lên đầu
      res.json({ success: true, reviews });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Tạo đánh giá mới
  createReview: async (req, res) => {
    try {
      const { courseId, rating, comment } = req.body;
      const review = new Review({
        user: req.user._id,
        course: courseId,
        rating,
        comment,
      });

      await review.save();
      res
        .status(201)
        .json({ success: true, review, message: "Cảm ơn bạn đã đánh giá!" });
    } catch (error) {
      // Bắt lỗi Unique (User đã đánh giá rồi)
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Bạn đã đánh giá khóa học này rồi!",
        });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Sửa đánh giá
  updateReview: async (req, res) => {
    try {
      const { rating, comment } = req.body;
      // Chỉ cho phép người tạo ra review đó được quyền sửa
      const review = await Review.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        { rating, comment },
        { new: true, runValidators: true },
      );

      if (!review)
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy đánh giá hoặc bạn không có quyền sửa",
        });
      res.json({ success: true, review, message: "Đã cập nhật đánh giá!" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Xóa đánh giá
  deleteReview: async (req, res) => {
    try {
      // Cho phép Admin xóa hoặc người tạo ra nó xóa
      const query =
        req.user.role === "admin"
          ? { _id: req.params.id }
          : { _id: req.params.id, user: req.user._id };

      const review = await Review.findOneAndDelete(query);

      if (!review)
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy hoặc không có quyền xóa",
        });
      res.json({ success: true, message: "Đã xóa đánh giá!" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = reviewController;
