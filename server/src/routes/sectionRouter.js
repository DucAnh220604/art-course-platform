const express = require('express');

const sectionController = require('../controllers/SectionController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, sectionController.createSection);
router.put('/:id', protect, sectionController.updateSection);
router.delete('/:id', protect, sectionController.deleteSection);
module.exports = router;