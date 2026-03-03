const mongoose = require("mongoose");
const slugify = require("slugify");

const comboSchema = new mongoose.Schema(
  {
    // --- THÔNG TIN HIỂN THỊ ---
    title: { type: String, required: true, index: true },
    slug: { type: String, unique: true },
    description: { type: String, required: true },
    thumbnail: { type: String }, // Không required nữa, sẽ lấy từ courses

    // --- KHÓA HỌC TRONG COMBO ---
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
      },
    ],

    // --- GIÁ ---
    originalPrice: { type: Number, required: true, min: 0 }, // Tổng giá gốc các khóa học
    price: { type: Number, required: true, min: 0 }, // Giá sau giảm
    discountPercentage: { type: Number, default: 0 }, // % giảm giá

    // --- QUAN HỆ ---
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // --- THỐNG KÊ ---
    totalStudents: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    numOfReviews: { type: Number, default: 0 },

    // --- DUYỆT BÀI (STAFF) ---
    status: {
      type: String,
      enum: ["draft", "pending", "published", "rejected"],
      default: "draft",
    },
  },
  { timestamps: true },
);

// Validation: Combo phải có từ 2 đến 8 khóa học
comboSchema.path("courses").validate(function (value) {
  return value.length >= 2 && value.length <= 8;
}, "Combo phải có từ 2 đến 8 khóa học.");

// Pre-save hook để tự động tạo slug
comboSchema.pre("save", async function () {
  if (this.isModified("title")) {
    let baseSlug = slugify(this.title, { lower: true, strict: true });
    let uniqueSlug = baseSlug;
    let counter = 1;

    // Kiểm tra nếu slug đã tồn tại
    while (
      await mongoose
        .model("Combo")
        .findOne({ slug: uniqueSlug, _id: { $ne: this._id } })
    ) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = uniqueSlug;
  }
});

// Index Text Search
comboSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Combo", comboSchema);
