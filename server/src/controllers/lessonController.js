const Lesson = require('../models/Lesson');
const Section = require('../models/Section');
const LessonProgress = require('../models/LessonProgress');

function extractYouTubeVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/ 
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  throw new Error('Invalid YouTube URL or video ID');
}

function getYouTubeThumbnail(videoId) {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

const lessonController = {
  createLesson: async (req, res) => {
    try {
      const { sectionId } = req.body;

      if (!sectionId) {
        return res.status(400).json({ success: false, message: 'sectionId is required' });
      }

      const section = await Section.findById(sectionId).populate('courseId');

      if (!section) {
        return res.status(404).json({ success: false, message: 'Section not found' });
      }

      if (!section.courseId) {
        return res.status(404).json({ 
          success: false, 
          message: 'Course not found for this section. Section may be orphaned.',
          debug: {
            sectionId: section._id,
            courseIdInSection: section.courseId
          }
        });
      }

      if (section.courseId.instructor.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      const videoId = extractYouTubeVideoId(req.body.videoUrl);
      
      const thumbnail = getYouTubeThumbnail(videoId);

      const lesson = await Lesson.create({
        ...req.body,
        videoUrl: videoId,
        thumbnail, 
        sectionId
      });

      section.lessonsId.push(lesson._id);
      await section.save();

      res.status(201).json({ success: true, data: lesson });
    } catch (error) {
      console.error('Error creating lesson:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  },

  getLessonById: async (req, res) => {
    try {
      const lesson = await Lesson.findById(req.params.id)
        .populate({
          path: 'sectionId',
          populate: { path: 'courseId', select: 'title instructor' }
        });

      if (!lesson) {
        return res.status(404).json({ success: false, message: 'Lesson not found' });
      }

      if (!lesson.sectionId || !lesson.sectionId.courseId) {
        return res.status(404).json({ success: false, message: 'Section or Course not found' });
      }

      const isOwner = lesson.sectionId.courseId.instructor.toString() === req.user._id.toString();
      if (!lesson.isTrial && !isOwner && !req.user.enrolledCourses?.includes(lesson.sectionId.courseId._id)) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      res.json({ success: true, data: lesson });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  updateLesson: async (req, res) => {
    try {
      const lesson = await Lesson.findById(req.params.id)
        .populate({ path: 'sectionId', populate: { path: 'courseId' } });

      if (!lesson) {
        return res.status(404).json({ success: false, message: 'Lesson not found' });
      }

      if (!lesson.sectionId || !lesson.sectionId.courseId) {
        return res.status(404).json({ success: false, message: 'Section or Course not found' });
      }

      if (lesson.sectionId.courseId.instructor.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      // Nếu có cập nhật videoUrl, extract video ID và thumbnail
      if (req.body.videoUrl && req.body.videoUrl !== lesson.videoUrl) {
        const videoId = extractYouTubeVideoId(req.body.videoUrl);
        req.body.videoUrl = videoId;
        req.body.thumbnail = getYouTubeThumbnail(videoId);
      }

      Object.assign(lesson, req.body);
      await lesson.save();

      res.json({ success: true, data: lesson });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  deleteLesson: async (req, res) => {
    try {
      const lesson = await Lesson.findById(req.params.id)
        .populate({ path: 'sectionId', populate: { path: 'courseId' } });

      if (!lesson) {
        return res.status(404).json({ success: false, message: 'Lesson not found' });
      }

      if (!lesson.sectionId || !lesson.sectionId.courseId) {
        return res.status(404).json({ success: false, message: 'Section or Course not found' });
      }

      if (lesson.sectionId.courseId.instructor.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }
      await Section.findByIdAndUpdate(lesson.sectionId._id, {
        $pull: { lessonsId: lesson._id }
      });

      await lesson.deleteOne();

      res.json({ success: true, message: 'Lesson deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // POST /api/lessons/:id/complete
  // Đánh dấu bài học đã hoàn thành (gọi khi xem >= 75% video)
  markLessonComplete: async (req, res) => {
    try {
      const lesson = await Lesson.findById(req.params.id)
        .populate({ path: 'sectionId', populate: { path: 'courseId', select: '_id' } });

      if (!lesson) {
        return res.status(404).json({ success: false, message: 'Lesson not found' });
      }

      const courseId = lesson.sectionId?.courseId?._id;
      if (!courseId) {
        return res.status(404).json({ success: false, message: 'Course not found for this lesson' });
      }

      // Dùng upsert để tránh duplicate
      await LessonProgress.findOneAndUpdate(
        { user: req.user._id, lesson: lesson._id },
        { user: req.user._id, lesson: lesson._id, course: courseId, completedAt: new Date() },
        { upsert: true, new: true }
      );

      res.json({ success: true, message: 'Lesson marked as completed' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // GET /api/lessons/progress/:courseId
  // Lấy danh sách lesson đã hoàn thành của user trong một khóa học
  getCourseProgress: async (req, res) => {
    try {
      const { courseId } = req.params;

      const completed = await LessonProgress.find({
        user: req.user._id,
        course: courseId,
      }).select('lesson completedAt');

      res.json({ success: true, data: completed });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = lessonController;