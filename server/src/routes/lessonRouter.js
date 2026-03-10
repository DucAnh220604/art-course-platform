const express = require('express');
const lessonController = require('../controllers/lessonController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// POST /api/lessons - Tạo lesson mới (sectionId trong body)
router.post('/', protect, lessonController.createLesson);

// GET /api/lessons/progress/:courseId - Lấy progress của user trong khóa học
router.get('/progress/:courseId', protect, lessonController.getCourseProgress);

// GET /api/lessons/:id - Lấy chi tiết lesson
router.get('/:id', protect, lessonController.getLessonById);

// PUT /api/lessons/:id - Cập nhật lesson
router.put('/:id', protect, lessonController.updateLesson);

// DELETE /api/lessons/:id - Xóa lesson
router.delete('/:id', protect, lessonController.deleteLesson);

// POST /api/lessons/:id/complete - Đánh dấu bài học hoàn thành
router.post('/:id/complete', protect, lessonController.markLessonComplete);

module.exports = router;