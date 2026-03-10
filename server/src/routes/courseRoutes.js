const express = require("express");
const courseController = require("../controllers/courseController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/categories/all", courseController.getCategories);
router.post("/", protect, courseController.createCourse);
router.get("/", courseController.getAllCourses);
router.get("/:slug", courseController.getCourseBySlug);
router.put("/:id", protect, courseController.updateCourse);
router.delete("/:id", protect, courseController.deleteCourse);
module.exports = router;
