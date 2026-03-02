// models/Review.js
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String },
  },
  { timestamps: true },
);

// Mỗi user chỉ được đánh giá 1 khóa học 1 lần
reviewSchema.index({ course: 1, user: 1 }, { unique: true });

// THÊM MỚI: Hàm tĩnh tính toán số sao trung bình và tổng số đánh giá
reviewSchema.statics.calcAverageRatings = async function (courseId) {
  const stats = await this.aggregate([
    { $match: { course: courseId } },
    {
      $group: {
        _id: "$course",
        nRating: { $sum: 1 }, // Đếm tổng số lượng
        avgRating: { $avg: "$rating" }, // Tính trung bình cộng
      },
    },
  ]);

  try {
    if (stats.length > 0) {
      // Cập nhật vào model Course
      await mongoose.model("Course").findByIdAndUpdate(courseId, {
        numOfReviews: stats[0].nRating,
        averageRating: Math.round(stats[0].avgRating * 10) / 10, // Làm tròn 1 chữ số (vd: 4.5)
      });
    } else {
      // Nếu xóa hết đánh giá thì reset về 0
      await mongoose.model("Course").findByIdAndUpdate(courseId, {
        numOfReviews: 0,
        averageRating: 0,
      });
    }
  } catch (error) {
    console.error("Lỗi khi tính toán số sao:", error);
  }
};

// Gọi hàm này SAU KHI lưu một đánh giá mới
reviewSchema.post("save", function () {
  this.constructor.calcAverageRatings(this.course);
});

// Gọi hàm này SAU KHI sửa hoặc xóa một đánh giá
reviewSchema.post(/^findOneAnd/, async function (doc) {
  if (doc) await doc.constructor.calcAverageRatings(doc.course);
});

module.exports = mongoose.model("Review", reviewSchema);
