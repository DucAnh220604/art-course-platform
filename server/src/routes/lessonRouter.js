const express = require('express');
const lessonController = require('../controllers/lessonController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// POST /api/lessons - Tạo lesson mới (sectionId trong body)
router.post('/', protect, lessonController.createLesson);

// GET /api/lessons/:id - Lấy chi tiết lesson
router.get('/:id', protect, lessonController.getLessonById);

// PUT /api/lessons/:id - Cập nhật lesson
router.put('/:id', protect, lessonController.updateLesson);

// DELETE /api/lessons/:id - Xóa lesson
router.delete('/:id', protect, lessonController.deleteLesson);

module.exports = router;