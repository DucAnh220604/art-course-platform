const Combo = require("../models/Combo");
const Course = require("../models/Course");
const User = require("../models/User");
const mongoose = require("mongoose");

const comboController = {
  // Lấy tất cả combos (có filter, search, pagination)
  getAllCombos: async (req, res) => {
    try {
      const {
        search,
        category,
        page = 1,
        limit = 10,
        status,
        instructor,
        sort = "createdAt",
        order = "desc",
      } = req.query;
      const query = {};

      // Filter theo status (admin/instructor muốn xem draft/pending)
      if (status) query.status = status;
      if (instructor) query.instructor = instructor;

      // Search theo text
      if (search) {
        const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        query.$or = [
          { title: { $regex: escapedSearch, $options: "i" } },
          { description: { $regex: escapedSearch, $options: "i" } },
        ];
      }

      // Filter theo category: chỉ lấy combo có ít nhất 1 khóa học đúng danh mục
      if (category) {
        const matchingCourseIds = await Course.distinct("_id", { category });
        if (matchingCourseIds.length === 0) {
          return res.json({
            success: true,
            combos: [],
            totalPages: 0,
            currentPage: parseInt(page),
            total: 0,
          });
        }
        query.courses = { $in: matchingCourseIds };
      }

      // Build sort object
      const sortOrder = order === "asc" ? 1 : -1;
      const sortOptions = { [sort]: sortOrder };

      const combos = await Combo.find(query)
        .populate("instructor", "fullname username avatar")
        .populate("courses", "title thumbnail price category _id")
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort(sortOptions);

      // Nếu có param forManagement=true, thêm số người đăng ký
      let combosWithEnrollment = combos;
      if (req.query.forManagement === "true") {
        combosWithEnrollment = await Promise.all(
          combos.map(async (combo) => {
            const courseIds = combo.courses.map((c) => c._id);
            // Đếm số user đã đăng ký bất kỳ khóa học nào trong combo
            const enrolledCount = await User.countDocuments({
              "enrolledCourses.course": { $in: courseIds },
            });
            return {
              ...combo.toObject(),
              enrolledCount, // Tổng số người đã đăng ký combo/courses trong combo
            };
          }),
        );
      }

      const total = await Combo.countDocuments(query);

      res.json({
        success: true,
        combos: combosWithEnrollment,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Lấy combo theo slug
  getComboBySlug: async (req, res) => {
    try {
      const combo = await Combo.findOne({ slug: req.params.slug })
        .populate("instructor", "fullname username avatar email")
        .populate({
          path: "courses",
          populate: {
            path: "sections",
            populate: {
              path: "lessonsId",
              select: "title duration isTrial",
            },
          },
        });

      if (!combo) {
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy combo!" });
      }

      // Tính toán giá nâng cấp nếu người dùng đã đăng nhập
      let upgradeInfo = null;
      if (req.user) {
        const user = await mongoose.model("User").findById(req.user._id);
        const userEnrolledCourseIds = user.enrolledCourses.map((ec) =>
          ec.course.toString(),
        );

        // Kiểm tra xem người dùng có sở hữu ít nhất 1 khóa học trong combo không
        const hasAnyCourse = combo.courses.some((course) =>
          userEnrolledCourseIds.includes(course._id.toString()),
        );

        if (hasAnyCourse) {
          upgradeInfo = calculateUpgradePrice(combo, userEnrolledCourseIds);
        }
      }

      res.json({
        success: true,
        data: combo,
        upgradeInfo, // Thêm thông tin nâng cấp
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Tạo combo mới (Instructor)
  createCombo: async (req, res) => {
    try {
      const { title, description, thumbnail, courses, price } = req.body;

      // Validate số lượng khóa học
      if (!courses || courses.length < 2 || courses.length > 8) {
        return res.status(400).json({
          success: false,
          message: "Combo phải có từ 2 đến 8 khóa học!",
        });
      }

      // Kiểm tra tất cả courses phải tồn tại và thuộc về instructor này
      const foundCourses = await Course.find({
        _id: { $in: courses },
        instructor: req.user._id,
        status: "published", // Chỉ được chọn course đã published
      });

      if (foundCourses.length !== courses.length) {
        return res.status(400).json({
          success: false,
          message:
            "Một số khóa học không hợp lệ hoặc chưa được phát hành hoặc không thuộc quyền sở hữu của bạn!",
        });
      }

      // Tính tổng giá gốc
      const originalPrice = foundCourses.reduce(
        (sum, course) => sum + course.price,
        0,
      );

      // Tính phần trăm giảm giá
      let discountPercentage = 0;
      if (price >= 0 && originalPrice > 0 && price < originalPrice) {
        discountPercentage = Math.round(
          ((originalPrice - price) / originalPrice) * 100,
        );
      }

      const newCombo = new Combo({
        title,
        description,
        thumbnail,
        courses,
        originalPrice,
        price: price || 0,
        discountPercentage,
        instructor: req.user._id,
      });

      await newCombo.save();

      res.status(201).json({
        success: true,
        message: "Tạo combo thành công! Vui lòng gửi duyệt để công khai.",
        data: newCombo,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Cập nhật combo (Instructor/Admin)
  updateCombo: async (req, res) => {
    try {
      const { courses, price, ...otherData } = req.body;

      // Tìm combo
      let combo;
      if (req.user.role === "admin" || req.user.role === "staff") {
        // Admin/Staff có thể update bất kỳ combo nào
        combo = await Combo.findById(req.params.id);
      } else {
        // Instructor chỉ có thể update combo của mình
        combo = await Combo.findOne({
          _id: req.params.id,
          instructor: req.user._id,
        });
      }

      if (!combo) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy combo hoặc bạn không có quyền chỉnh sửa!",
        });
      }

      // Nếu có cập nhật courses
      if (courses) {
        if (courses.length < 2 || courses.length > 8) {
          return res.status(400).json({
            success: false,
            message: "Combo phải có từ 2 đến 8 khóa học!",
          });
        }

        // Validate courses (chỉ instructor mới cần check ownership)
        let foundCourses;
        if (req.user.role === "admin" || req.user.role === "staff") {
          // Admin/Staff không cần check instructor ownership
          foundCourses = await Course.find({
            _id: { $in: courses },
            status: "published",
          });
        } else {
          // Instructor chỉ có thể chọn courses của mình
          foundCourses = await Course.find({
            _id: { $in: courses },
            instructor: req.user._id,
            status: "published",
          });
        }

        if (foundCourses.length !== courses.length) {
          return res.status(400).json({
            success: false,
            message: "Một số khóa học không hợp lệ!",
          });
        }

        combo.courses = courses;
        combo.originalPrice = foundCourses.reduce(
          (sum, course) => sum + course.price,
          0,
        );
      }

      // Cập nhật các field khác
      Object.assign(combo, otherData);

      // Nếu có cập nhật giá
      if (price !== undefined) {
        combo.price = price;
      }

      // Tính lại discount
      if (combo.originalPrice > 0 && combo.price < combo.originalPrice) {
        combo.discountPercentage = Math.round(
          ((combo.originalPrice - combo.price) / combo.originalPrice) * 100,
        );
      } else {
        combo.discountPercentage = 0;
      }

      await combo.save();

      res.json({
        success: true,
        message: "Cập nhật combo thành công!",
        data: combo,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Xóa combo (Instructor/Admin)
  deleteCombo: async (req, res) => {
    try {
      // Tìm combo
      let combo;
      if (req.user.role === "admin" || req.user.role === "staff") {
        // Admin/Staff có thể xóa bất kỳ combo nào
        combo = await Combo.findById(req.params.id);
      } else {
        // Instructor chỉ có thể xóa combo của mình
        combo = await Combo.findOne({
          _id: req.params.id,
          instructor: req.user._id,
        });
      }

      if (!combo) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy combo hoặc bạn không có quyền xóa!",
        });
      }

      await combo.deleteOne();

      res.json({
        success: true,
        message: "Xóa combo thành công!",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Thêm endpoint mới để lấy combos chứa một khóa học cụ thể
  getCombosContainingCourse: async (req, res) => {
    try {
      const { courseId } = req.params;

      // Tìm tất cả combo chứa khóa học này và đã published
      const combos = await Combo.find({
        courses: courseId,
        status: "published",
      })
        .populate("instructor", "fullname username avatar")
        .populate("courses", "title thumbnail price category _id slug");

      // Nếu người dùng đã đăng nhập, tính giá nâng cấp cho từng combo
      let combosWithUpgradeInfo = combos;
      if (req.user) {
        const user = await mongoose.model("User").findById(req.user._id);
        const userEnrolledCourseIds = user.enrolledCourses.map((ec) =>
          ec.course.toString(),
        );

        combosWithUpgradeInfo = combos.map((combo) => {
          const comboObj = combo.toObject();
          const upgradeInfo = calculateUpgradePrice(
            combo,
            userEnrolledCourseIds,
          );
          return {
            ...comboObj,
            upgradeInfo,
          };
        });
      }

      res.json({
        success: true,
        data: combosWithUpgradeInfo,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

// Hàm helper để tính giá nâng cấp
const calculateUpgradePrice = (combo, userEnrolledCourseIds) => {
  // Lọc các khóa học chưa sở hữu
  const unownedCourses = combo.courses.filter(
    (course) => !userEnrolledCourseIds.includes(course._id.toString()),
  );

  // Nếu đã sở hữu tất cả khóa học
  if (unownedCourses.length === 0) {
    return {
      upgradePrice: 0,
      unownedCourses: [],
      ownedCourses: combo.courses,
      isFullyOwned: true,
    };
  }

  // Tính tổng giá gốc các khóa chưa sở hữu
  const unownedOriginalPrice = unownedCourses.reduce(
    (sum, course) => sum + course.price,
    0,
  );

  // Áp dụng % giảm giá của combo
  const upgradePrice =
    unownedOriginalPrice * (1 - combo.discountPercentage / 100);

  return {
    upgradePrice: Math.round(upgradePrice),
    unownedCourses,
    ownedCourses: combo.courses.filter((course) =>
      userEnrolledCourseIds.includes(course._id.toString()),
    ),
    unownedOriginalPrice,
    isFullyOwned: false,
  };
};

module.exports = comboController;
