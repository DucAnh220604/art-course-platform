const Course = require("../models/Course");

const courseController = {
  getAllCourses: async (req, res) => {
    try {
      const { category, level, search, page = 1, limit = 10 } = req.query;
      const query = {};
      if (category) query.category = category;
      if (level) query.level = level;
      if (search) query.$text = { $search: search };
      const courses = await Course.find(query)
        .populate("instructor", "name")
        .skip((page - 1) * limit)
        .limit(parseInt(limit * 1))
        .sort({ createdAt: -1 });

      const total = await Course.countDocuments(query);
      res.json({
        courses,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
  getCourseBySlug: async (req, res) => {
    try {
      const course = await Course.findOne({ slug: req.params.slug }).populate({
        path: "sections",
        populate: {
          path: "lessonsId",
          select: "title duration isTrial type videoUrl thumbnail description",
        },
      });
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  createCourse: async (req, res) => {
    try {
      const { price, oldPrice, ...otherData } = req.body;
      let discountPercentage = 0;

      // Kiểm tra: Giá cũ phải lớn hơn 0 và Giá cũ phải lớn hơn Giá mới thì mới có giảm giá
      if (oldPrice && oldPrice > 0 && price >= 0 && oldPrice > price) {
        discountPercentage = Math.round(((oldPrice - price) / oldPrice) * 100);
      }

      const newCourse = new Course({
        ...otherData,
        price: price || 0,
        oldPrice: oldPrice || 0,
        discountPercentage: discountPercentage,
        instructor: req.user._id, // Gán ID người tạo (nếu có auth)
      });

      await newCourse.save();
      res.status(201).json({ success: true, course: newCourse });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  updateCourse: async (req, res) => {
    try {
      const { price, oldPrice, ...otherData } = req.body;
      let updateData = { ...otherData, price, oldPrice };

      // Tính lại phần trăm nếu có sự thay đổi về giá
      if (oldPrice !== undefined || price !== undefined) {
        const currentCourse = await Course.findById(req.params.id);
        const finalOldPrice =
          oldPrice !== undefined ? oldPrice : currentCourse.oldPrice;
        const finalPrice = price !== undefined ? price : currentCourse.price;

        if (
          finalOldPrice > 0 &&
          finalPrice >= 0 &&
          finalOldPrice > finalPrice
        ) {
          updateData.discountPercentage = Math.round(
            ((finalOldPrice - finalPrice) / finalOldPrice) * 100,
          );
        } else {
          updateData.discountPercentage = 0; // Reset về 0 nếu không còn giảm giá
        }
      }

      const updatedCourse = await Course.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }, // Trả về data mới sau khi update
      );

      if (!updatedCourse)
        return res.status(404).json({ message: "Không tìm thấy khóa học" });
      res.json({ success: true, course: updatedCourse });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  deleteCourse: async (req, res) => {
    try {
      const course = await Course.findOne({
        _id: req.params.id,
        instructor: req.user._id,
      });
      if (!course) {
        return res
          .status(404)
          .json({ message: "Course not found or unauthorized" });
      }
      if (course.totalStudents > 0) {
        return res.status(400).json({
          success: false,
          message: `Không thể xóa khóa học vì đã có ${course.totalStudents} học viên đăng ký.`,
        });
      }
      await course.deleteOne();
      res.json({ success: true, message: "Course deleted successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to delete course", error: error.message });
    }
  },
};

module.exports = courseController;
