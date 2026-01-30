const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const registerUser = async (userData) => {
  const newUser = await User.create({
    fullname: userData.fullname,
    username: userData.username,
    email: userData.email,
    password: userData.password,
    role: "customer",
    avatar: "default-avatar.png",
  });

  const token = generateToken(newUser._id);

  const userResponse = newUser.toObject();
  delete userResponse.password;

  return { user: userResponse, token };
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new Error("Email không tồn tại trong hệ thống.");
  }

  const isMatch = await user.correctPassword(password, user.password);
  if (!isMatch) {
    throw new Error("Mật khẩu không chính xác.");
  }

  const token = generateToken(user._id);

  const userResponse = user.toObject();
  delete userResponse.password;

  return { user: userResponse, token };
};

const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("Người dùng không còn tồn tại.");
  }
  return user;
};

module.exports = {
  registerUser,
  loginUser,
  getUserById,
};
