const User = require("../models/User");

const updateProfile = async (userId, updateData) => {
  const allowedFields = [
    "fullname",
    "phone",
    "birthday",
    "address",
    "parentName",
    "parentPhone",
  ];
  const filteredData = {};

  Object.keys(updateData).forEach((key) => {
    if (allowedFields.includes(key)) {
      filteredData[key] = updateData[key];
    }
  });

  const user = await User.findByIdAndUpdate(userId, filteredData, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new Error("Người dùng không tồn tại.");
  }

  return user;
};

const updateUserAvatar = async (userId, avatarUrl) => {
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { avatar: avatarUrl },
    { new: true },
  ).select("-password");

  if (!updatedUser) {
    throw new Error("Người dùng không tồn tại.");
  }

  return updatedUser;
};

module.exports = {
  updateUserAvatar,
  updateProfile,
};
