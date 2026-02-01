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

const getAllUsers = async (queryParams) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    role = "",
    isActive = "",
    sortBy = "createdAt",
    sortOrder = "desc",
  } = queryParams;

  const query = {};

  if (search) {
    query.$or = [
      { username: { $regex: search, $options: "i" } },
      { fullname: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  if (role && role !== "all") {
    query.role = role;
  }

  if (isActive !== "" && isActive !== "all") {
    query.isActive = isActive === "true";
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOptions = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

  const [users, totalCount] = await Promise.all([
    User.find(query)
      .select("-password")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit)),
    User.countDocuments(query),
  ]);

  return {
    users,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      totalCount,
      limit: parseInt(limit),
    },
  };
};

const getUserById = async (userId) => {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw new Error("Người dùng không tồn tại.");
  }

  return user;
};

const updateUserByAdmin = async (userId, updateData) => {
  const allowedFields = [
    "fullname",
    "phone",
    "birthday",
    "address",
    "parentName",
    "parentPhone",
    "role",
    "isActive",
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
  }).select("-password");

  if (!user) {
    throw new Error("Người dùng không tồn tại.");
  }

  return user;
};

const deleteUser = async (userId, hardDelete = false) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("Người dùng không tồn tại.");
  }

  if (user.role === "admin") {
    throw new Error("Không thể xóa tài khoản admin.");
  }

  if (hardDelete) {
    await User.findByIdAndDelete(userId);
    return { message: "Đã xóa vĩnh viễn người dùng." };
  } else {
    user.isActive = false;
    await user.save();
    return { message: "Đã vô hiệu hóa người dùng.", user };
  }
};

const getUserStats = async () => {
  const [totalUsers, activeUsers, inactiveUsers, roleStats] = await Promise.all(
    [
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false }),
      User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
    ],
  );

  const roleCount = {};
  roleStats.forEach((item) => {
    roleCount[item._id] = item.count;
  });

  return {
    totalUsers,
    activeUsers,
    inactiveUsers,
    roleCount,
  };
};

const requestInstructor = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("Người dùng không tồn tại.");
  }

  if (user.role !== "customer") {
    throw new Error("Chỉ khách hàng mới có thể yêu cầu trở thành giảng viên.");
  }

  if (user.instructorRequestStatus === "pending") {
    throw new Error("Bạn đã gửi yêu cầu trước đó. Vui lòng chờ xét duyệt.");
  }

  if (user.instructorRequestStatus === "approved") {
    throw new Error("Yêu cầu của bạn đã được duyệt.");
  }

  user.instructorRequestStatus = "pending";
  await user.save();

  return user;
};

const getInstructorRequestStatus = async (userId) => {
  const user = await User.findById(userId).select(
    "role instructorRequestStatus",
  );

  if (!user) {
    throw new Error("Người dùng không tồn tại.");
  }

  return {
    role: user.role,
    instructorRequestStatus: user.instructorRequestStatus,
  };
};

const getInstructorRequests = async (queryParams) => {
  const { page = 1, limit = 10, search = "", status = "pending" } = queryParams;

  const query = {};

  if (status && status !== "all") {
    query.instructorRequestStatus = status;
  } else {
    query.instructorRequestStatus = { $ne: "none" };
  }

  if (search) {
    query.$or = [
      { username: { $regex: search, $options: "i" } },
      { fullname: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [requests, totalCount] = await Promise.all([
    User.find(query)
      .select("-password")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    User.countDocuments(query),
  ]);

  return {
    requests,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      totalCount,
      limit: parseInt(limit),
    },
  };
};

const handleInstructorRequest = async (userId, action) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("Người dùng không tồn tại.");
  }

  if (user.instructorRequestStatus !== "pending") {
    throw new Error("Yêu cầu này đã được xử lý.");
  }

  if (action === "approve") {
    user.instructorRequestStatus = "approved";
    user.role = "instructor";
  } else {
    user.instructorRequestStatus = "rejected";
  }

  await user.save();

  return user;
};

module.exports = {
  updateUserAvatar,
  updateProfile,
  getAllUsers,
  getUserById,
  updateUserByAdmin,
  deleteUser,
  getUserStats,
  requestInstructor,
  getInstructorRequestStatus,
  getInstructorRequests,
  handleInstructorRequest,
};
