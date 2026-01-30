const authService = require("../services/authService");

exports.register = async (req, res) => {
  try {
    const result = await authService.registerUser(req.body);

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công!",
      token: result.token,
      data: { user: result.user },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message.includes("duplicate")
        ? "Email này đã được sử dụng."
        : error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Vui lòng nhập đủ email và mật khẩu",
        });
    }

    const result = await authService.loginUser(email, password);

    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công!",
      token: result.token,
      data: { user: result.user },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await authService.getUserById(req.user._id);

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};
