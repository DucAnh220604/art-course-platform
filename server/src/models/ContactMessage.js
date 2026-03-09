const mongoose = require("mongoose");

const contactMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "replied", "closed"],
      default: "pending",
    },
    reply: {
      content: String,
      repliedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      repliedAt: Date,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ContactMessage", contactMessageSchema);
