const userService = require("../services/userService");
const User = require("../models/User");
const Course = require("../models/Course");
const Combo = require("../models/Combo");

exports.updateProfile = async (req, res) => {
  try {
    const user = await userService.updateProfile(req.user._id, req.body);

    res.status(200).json({
      success: true,
      message: "Cập nhật thông tin thành công!",
      data: { user },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng chọn file ảnh để upload!",
      });
    }

    const avatarUrl = req.file.path;
    const userId = req.user._id;

    const updatedUser = await userService.updateUserAvatar(userId, avatarUrl);

    res.status(200).json({
      success: true,
      message: "Cập nhật ảnh đại diện thành công!",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const result = await userService.getAllUsers(req.query);

    res.status(200).json({
      success: true,
      message: "Lấy danh sách người dùng thành công!",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateUserByAdmin = async (req, res) => {
  try {
    const user = await userService.updateUserByAdmin(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: "Cập nhật thông tin người dùng thành công!",
      data: { user },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const hardDelete = req.query.hard === "true";
    const result = await userService.deleteUser(req.params.id, hardDelete);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.user || null,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    const stats = await userService.getUserStats();

    res.status(200).json({
      success: true,
      data: { stats },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.requestInstructor = async (req, res) => {
  try {
    const user = await userService.requestInstructor(req.user._id);

    res.status(200).json({
      success: true,
      message: "Yêu cầu trở thành giảng viên đã được gửi thành công!",
      data: { user },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getInstructorRequestStatus = async (req, res) => {
  try {
    const status = await userService.getInstructorRequestStatus(req.user._id);

    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getInstructorRequests = async (req, res) => {
  try {
    const result = await userService.getInstructorRequests(req.query);

    res.status(200).json({
      success: true,
      message: "Lấy danh sách yêu cầu thành công!",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.handleInstructorRequest = async (req, res) => {
  try {
    const { action } = req.body;
    const userId = req.params.id;

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Action phải là 'approve' hoặc 'reject'",
      });
    }

    const user = await userService.handleInstructorRequest(userId, action);

    res.status(200).json({
      success: true,
      message:
        action === "approve"
          ? "Đã duyệt yêu cầu thành công!"
          : "Đã từ chối yêu cầu!",
      data: { user },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Đăng ký tham gia khóa học
exports.enrollCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const userId = req.user._id;

    // Kiểm tra khóa học tồn tại và đã được publish
    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy khóa học!" });
    }
    if (course.status !== "published") {
      return res
        .status(400)
        .json({ success: false, message: "Khóa học chưa được phát hành!" });
    }

    // Kiểm tra đã đăng ký chưa
    const user = await User.findById(userId);
    const alreadyEnrolled = user.enrolledCourses.some(
      (e) => e.course.toString() === courseId.toString(),
    );
    if (alreadyEnrolled) {
      return res
        .status(400)
        .json({ success: false, message: "Bạn đã đăng ký khóa học này rồi!" });
    }

    // Thêm vào enrolledCourses của user
    user.enrolledCourses.push({ course: courseId });
    await user.save();

    // Tăng totalStudents trên Course
    await Course.findByIdAndUpdate(courseId, { $inc: { totalStudents: 1 } });

    res.status(200).json({
      success: true,
      message: "Đăng ký khóa học thành công! Chúc bé học vui! 🎨",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Kiểm tra user đã đăng ký khóa học chưa
exports.checkEnrollment = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const user = await User.findById(req.user._id);
    const isEnrolled = user.enrolledCourses.some(
      (e) => e.course.toString() === courseId.toString(),
    );
    res.json({ success: true, isEnrolled });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Đăng ký tham gia combo (sẽ enroll vào tất cả các khóa học trong combo)
exports.enrollCombo = async (req, res) => {
  try {
    const comboId = req.params.comboId;
    const userId = req.user._id;

    // Kiểm tra combo tồn tại và đã được publish
    const combo = await Combo.findById(comboId).populate("courses");
    if (!combo) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy combo!" });
    }
    if (combo.status !== "published") {
      return res
        .status(400)
        .json({ success: false, message: "Combo chưa được phát hành!" });
    }

    const user = await User.findById(userId);

    // Enroll vào từng khóa học trong combo
    let enrolledCount = 0;
    let alreadyEnrolledCourses = [];

    for (const course of combo.courses) {
      const alreadyEnrolled = user.enrolledCourses.some(
        (e) => e.course.toString() === course._id.toString(),
      );

      if (!alreadyEnrolled) {
        // Thêm vào enrolledCourses
        user.enrolledCourses.push({ course: course._id });
        // Tăng totalStudents của khóa học
        await Course.findByIdAndUpdate(course._id, {
          $inc: { totalStudents: 1 },
        });
        enrolledCount++;
      } else {
        alreadyEnrolledCourses.push(course.title);
      }
    }

    await user.save();

    // Tăng totalStudents của combo
    await Combo.findByIdAndUpdate(comboId, { $inc: { totalStudents: 1 } });

    let message = `Đăng ký combo thành công! Bạn đã tham gia ${enrolledCount} khóa học. 🎉`;
    if (alreadyEnrolledCourses.length > 0) {
      message += ` (Bạn đã đăng ký trước: ${alreadyEnrolledCourses.join(", ")})`;
    }

    res.status(200).json({
      success: true,
      message,
      data: {
        enrolledCount,
        alreadyEnrolledCourses,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Kiểm tra user đã đăng ký combo chưa
exports.checkComboEnrollment = async (req, res) => {
  try {
    const comboId = req.params.comboId;
    const combo = await Combo.findById(comboId);

    if (!combo) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy combo!" });
    }

    const user = await User.findById(req.user._id);

    // Kiểm tra xem user đã enroll tất cả các khóa học trong combo chưa
    const allEnrolled = combo.courses.every((courseId) =>
      user.enrolledCourses.some(
        (e) => e.course.toString() === courseId.toString(),
      ),
    );

    res.json({ success: true, isEnrolled: allEnrolled });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy danh sách khóa học đã đăng ký
exports.getEnrolledCourses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "enrolledCourses.course",
      populate: { path: "instructor", select: "fullname avatar" },
    });

    const enrolledCourses = user.enrolledCourses.map((item) => ({
      course: item.course,
      enrolledAt: item.enrolledAt,
      progress: item.progress,
    }));

    res.status(200).json({
      success: true,
      data: enrolledCourses,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
