const userService = require("../services/userService");

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
