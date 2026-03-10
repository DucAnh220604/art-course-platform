const Course = require("../models/Course");
const User = require("../models/User");
const Section = require("../models/Section");

const courseController = {
  getAllCourses: async (req, res) => {
    try {
      const {
        category,
        level,
        search,
        status,
        sort = "createdAt",
        order = "desc",
        page = 1,
        limit = 10,
      } = req.query;

      const query = {};
      if (category) query.category = category;
      if (level) query.level = level;
      if (status) query.status = status;
      if (search) query.$text = { $search: search };

      // Build sort object
      const sortOrder = order === "asc" ? 1 : -1;
      const sortOptions = { [sort]: sortOrder };

      const courses = await Course.find(query)
        .populate("instructor", "fullname avatar")
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort(sortOptions);

      // Nếu có param forManagement=true, thêm số người đăng ký
      let coursesWithEnrollment = courses;
      if (req.query.forManagement === "true") {
        coursesWithEnrollment = await Promise.all(
          courses.map(async (course) => {
            const enrolledCount = await User.countDocuments({
              "enrolledCourses.course": course._id,
            });
            return {
              ...course.toObject(),
              enrolledCount, // Tổng số người đã đăng ký
            };
          })
        );
      }

      const total = await Course.countDocuments(query);
      res.json({
        success: true,
        courses: coursesWithEnrollment,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total,
      });
    } catch (error) {
      console.error('Lỗi khi lấy danh sách khóa học:', error);
      res.status(500).json({ 
        success: false, 
        message: "Lỗi khi tải danh sách khóa học. Vui lòng thử lại sau.",
        details: error.message 
      });
    }
  },
  getCourseBySlug: async (req, res) => {
    try {
      const course = await Course.findOne({ slug: req.params.slug })
        .populate("instructor", "fullname avatar instructorInfo email")
        .populate({
          path: "sections",
          populate: {
            path: "lessonsId",
            select:
              "title duration isTrial type videoUrl thumbnail description",
          },
        });
      if (!course) {
        return res.status(404).json({ 
          success: false,
          message: `Không tìm thấy khóa học với slug: ${req.params.slug}` 
        });
      }
      res.json(course);
    } catch (error) {
      console.error('Lỗi khi lấy thông tin khóa học:', error);
      res.status(500).json({ 
        success: false,
        message: "Lỗi khi tải thông tin khóa học. Vui lòng thử lại sau.",
        details: error.message 
      });
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
      console.error('Lỗi khi tạo khóa học:', error);
      
      let message = "Lỗi khi tạo khóa học. Vui lòng thử lại.";
      
      // Xử lý các lỗi cụ thể
      if (error.code === 11000) {
        message = "Tiêu đề khóa học đã tồn tại. Vui lòng chọn tiêu đề khác.";
      } else if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(e => e.message);
        message = `Dữ liệu không hợp lệ: ${errors.join(', ')}`;
      }
      
      res.status(400).json({ 
        success: false, 
        message,
        details: error.message 
      });
    }
  },
  updateCourse: async (req, res) => {
    try {
      const { price, oldPrice, status, ...otherData } = req.body;
      let updateData = { ...otherData, price, oldPrice };

      // Validation: Nếu đang gửi yêu cầu duyệt (status = pending), kiểm tra sections & lessons
      if (status === "pending") {
        const course = await Course.findById(req.params.id).populate('sections');
        
        if (!course) {
          return res.status(404).json({ 
            success: false,
            message: "Không tìm thấy khóa học" 
          });
        }

        // Kiểm tra có sections không
        if (!course.sections || course.sections.length === 0) {
          return res.status(400).json({ 
            success: false,
            message: "Không thể gửi duyệt! Khóa học phải có ít nhất 1 chương (Section)." 
          });
        }

        // Kiểm tra mỗi section có lessons không
        let hasLessons = false;
        for (const section of course.sections) {
          if (section.lessonsId && section.lessonsId.length > 0) {
            hasLessons = true;
            break;
          }
        }

        if (!hasLessons) {
          return res.status(400).json({ 
            success: false,
            message: "Không thể gửi duyệt! Khóa học phải có ít nhất 1 bài học (Lesson) trong các chương." 
          });
        }

        // Validation passed, thêm status vào updateData
        updateData.status = status;
      } else if (status !== undefined) {
        // Nếu update status khác, cũng thêm vào
        updateData.status = status;
      }

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

      if (!updatedCourse) {
        return res.status(404).json({ 
          success: false,
          message: `Không tìm thấy khóa học với ID: ${req.params.id}` 
        });
      }
      
      res.json({ success: true, course: updatedCourse });
    } catch (error) {
      console.error('Lỗi khi cập nhật khóa học:', error);
      
      let message = "Lỗi khi cập nhật khóa học. Vui lòng thử lại.";
      
      // Xử lý các lỗi cụ thể
      if (error.code === 11000) {
        message = "Tiêu đề khóa học đã tồn tại. Vui lòng chọn tiêu đề khác.";
      } else if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(e => e.message);
        message = `Dữ liệu không hợp lệ: ${errors.join(', ')}`;
      } else if (error.name === 'CastError') {
        message = "ID khóa học không hợp lệ.";
      }
      
      res.status(400).json({ 
        success: false, 
        message,
        details: error.message 
      });
    }
  },
  deleteCourse: async (req, res) => {
    try {
      const course = await Course.findById(req.params.id);
      
      if (!course) {
        return res.status(404).json({ 
          success: false,
          message: "Không tìm thấy khóa học" 
        });
      }

      // Kiểm tra xem có học viên nào đang học khóa học này không
      const enrolledUsersCount = await User.countDocuments({
        "enrolledCourses.course": req.params.id,
      });

      if (enrolledUsersCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Không thể xóa khóa học vì đã có ${enrolledUsersCount} học viên đang học.`,
        });
      }

      // Xóa khóa học
      await course.deleteOne();
      
      res.json({ 
        success: true, 
        message: "Xóa khóa học thành công" 
      });
    } catch (error) {
      console.error('Lỗi khi xóa khóa học:', error);
      
      let message = "Lỗi khi xóa khóa học. Vui lòng thử lại.";
      let statusCode = 500;
      
      if (error.name === 'CastError') {
        message = "ID khóa học không hợp lệ.";
        statusCode = 400;
      }
      
      res.status(statusCode).json({ 
        success: false,
        message,
        details: error.message 
      });
    }
  },
};

module.exports = courseController;
