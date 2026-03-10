const express = require("express");
const router = express.Router();
const {
  sendContactMessage,
  getAllContactMessages,
  getContactMessageById,
  replyContactMessage,
  updateMessageStatus,
  deleteContactMessage,
} = require("../controllers/contactController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

// Public route - gửi tin nhắn liên hệ
router.post("/", sendContactMessage);

// Protected routes - chỉ staff/admin mới xem được
router.get("/", protect, restrictTo("staff", "admin"), getAllContactMessages);
router.get(
  "/:id",
  protect,
  restrictTo("staff", "admin"),
  getContactMessageById,
);
router.post(
  "/:id/reply",
  protect,
  restrictTo("staff", "admin"),
  replyContactMessage,
);
router.patch(
  "/:id/status",
  protect,
  restrictTo("staff", "admin"),
  updateMessageStatus,
);

// Admin only - xóa tin nhắn
router.delete("/:id", protect, restrictTo("admin"), deleteContactMessage);

module.exports = router;
