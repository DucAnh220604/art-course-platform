const express = require("express");
const userController = require("../controllers/userController");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const uploadCloud = require("../middleware/uploadCloud");

const router = express.Router();

router.patch("/profile", protect, userController.updateProfile);

router.post(
  "/avatar",
  protect,
  uploadCloud.single("avatar"),
  userController.uploadAvatar,
);

router.post("/request-instructor", protect, userController.requestInstructor);

router.get(
  "/instructor-request-status",
  protect,
  userController.getInstructorRequestStatus,
);

router.use(protect, restrictTo("admin", "staff"));

router.get("/stats", userController.getUserStats);

router.get("/instructor-requests", userController.getInstructorRequests);

router.patch("/:id/instructor-request", userController.handleInstructorRequest);

router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.patch("/:id", restrictTo("admin"), userController.updateUserByAdmin);
router.delete("/:id", restrictTo("admin"), userController.deleteUser);

module.exports = router;
