const express = require("express");
const userController = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const uploadCloud = require("../middleware/uploadCloud");

const router = express.Router();

router.patch("/profile", protect, userController.updateProfile);

router.post(
  "/avatar",
  protect,
  uploadCloud.single("avatar"),
  userController.uploadAvatar,
);

module.exports = router;
