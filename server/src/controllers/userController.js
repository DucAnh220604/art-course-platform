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
