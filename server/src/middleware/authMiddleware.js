const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Vui lòng đăng nhập." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res
        .status(401)
        .json({ success: false, message: "User không tồn tại." });
    }

    req.user = currentUser;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Token hết hạn hoặc không hợp lệ." });
  }
};
