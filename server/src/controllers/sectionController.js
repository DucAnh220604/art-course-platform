const Section = require('../models/Section');
const Course = require('../models/Course');

const sectionController = {
  createSection: async (req, res) => {
    try {
      const { courseId, title } = req.body;
      const course = await Course.findOne({
        _id: courseId,
        instructor: req.user._id
      });
      
      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found or unauthorized' });
      }
      
      const section = await Section.create({ title, courseId });
      course.sections.push(section._id);
      await course.save();
      
      res.status(201).json({ success: true, data: section });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  updateSection: async (req, res) => {
    try {
      const section = await Section.findById(req.params.id).populate('courseId');

      if (!section) {
        return res.status(404).json({ success: false, message: 'Section not found' });
      }

      if (!section.courseId) {
        return res.status(404).json({ success: false, message: 'Course not found for this section' });
      }

      if (section.courseId.instructor.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      Object.assign(section, req.body);
      await section.save();

      res.json({ success: true, data: section });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  deleteSection: async (req, res) => {
    try {
      const section = await Section.findById(req.params.id).populate('courseId');

      if (!section) {
        return res.status(404).json({ success: false, message: 'Section not found' });
      }

      if (!section.courseId) {
        return res.status(404).json({ success: false, message: 'Course not found for this section' });
      }

      if (section.courseId.instructor.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      await Course.findByIdAndUpdate(section.courseId._id, {
        $pull: { sections: section._id }
      });

      await section.deleteOne();

      res.json({ success: true, message: 'Section deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = sectionController;