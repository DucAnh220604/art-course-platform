const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    fullname: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    avatar: { type: String, default: "default-avatar.png" },

    role: {
      type: String,
      enum: ["customer", "instructor", "staff", "admin"],
      default: "customer",
    },

    isActive: { type: Boolean, default: true },

    instructorRequestStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },
    instructorInfo: {
      bio: String,
      bankAccount: String,
      balance: { type: Number, default: 0 },
    },

    enrolledCourses: [
      {
        course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
        enrolledAt: { type: Date, default: Date.now },
        progress: { type: Number, default: 0 },
      },
    ],

    cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          refPath: "cart.productModel",
        },
        productModel: {
          type: String,
          required: true,
          enum: ["Course", "Combo"],
        },
      },
    ],

    wishlist: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "wishlist.productModel",
        },
        productModel: { type: String, enum: ["Course", "Combo"] },
      },
    ],
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

module.exports = mongoose.model("User", userSchema);
