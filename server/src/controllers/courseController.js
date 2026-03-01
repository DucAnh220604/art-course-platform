const Course = require('../models/Course');

const courseController = {

    getAllCourses: async (req, res) => {
        try {
            const { category, level, search, page = 1, limit = 10 } = req.query;
            const query =  {};
            if (category) query.category = category;
            if (level) query.level = level;
            if (search) query.$text = { $search: search };
            const courses = await Course.find(query)
            .populate('instructor', 'name')
            .skip((page - 1) * limit)
            .limit(parseInt(limit * 1))
            .sort({ createdAt: -1 });

            const total = await Course.countDocuments(query);
            res.json({
                courses,
                totalPages: Math.ceil(total / limit),
                currentPage: parseInt(page)
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },
    getCourseBySlug: async (req, res) => {
        try {
            const course = await Course.findOne({ slug: req.params.slug })
            .populate({
                path: 'sections',
                populate: {
                    path: 'lessonsId',
                    select: 'title duration isTrial type'
                }
            });
            if(!course){
                return res.status(404).json({ message: 'Course not found' });   
            }
            res.json(course);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },
   
    createCourse: async (req, res) => {
        try {
            const courseData = {
                ...req.body,
                instructor: req.user._id,
                status: 'draft'
            }
            const course = await Course.create(courseData);
            res.status(201).json({
                success: true,
                data: course,
                message: 'Course created successfully'
            });
        } catch (error) {
            res.status(400).json({ message: 'Failed to create course', error: error.message });
        }
    },
    updateCourse: async (req, res) => {
        try {
            const course = await Course.findOne({
                _id: req.params.id,
                instructor: req.user._id
            });
            if (!course) {
                return res.status(404).json({ message: 'Course not found or unauthorized' });
            }
            if (!['draft', 'rejected'].includes(course.status)) {
                return res.status(400).json({ message: 'Only courses in draft or rejected status can be updated' });
            }
            delete req.body.status; // Không cho cập nhật status ở đây
            Object.assign(course, req.body);
            await course.save();
            res.json({ success: true, data: course, message: 'Course updated successfully' });
        } catch (error) {
            res.status(400).json({ message: 'Failed to update course', error: error.message });
        }
    },
    deleteCourse: async (req, res) => {
        try {
            const course = await Course.findOne({
                _id: req.params.id,
                instructor: req.user._id
            });
            if (!course) {
                return res.status(404).json({ message: 'Course not found or unauthorized' });
            }
            await course.deleteOne();
            res.json({ success: true, message: 'Course deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Failed to delete course', error: error.message });
        }
        }    
};

module.exports = courseController;