const User = require("../models/User");
const Course = require("../models/Course");
const Combo = require("../models/Combo");

const ensureCoursePublished = async (courseId) => {
  const course = await Course.findById(courseId);
  if (!course) throw new Error("Không tìm thấy khóa học!");
  if (course.status !== "published")
    throw new Error("Khóa học chưa được phát hành!");
  return course;
};

const ensureComboPublished = async (comboId) => {
  const combo = await Combo.findById(comboId).populate("courses");
  if (!combo) throw new Error("Không tìm thấy combo!");
  if (combo.status !== "published")
    throw new Error("Combo chưa được phát hành!");
  return combo;
};

const isCourseEnrolled = (user, courseId) =>
  user.enrolledCourses.some((e) => e.course.toString() === courseId.toString());

const grantCourseAccess = async (userId, courseId) => {
  const course = await ensureCoursePublished(courseId);
  const user = await User.findById(userId);

  if (isCourseEnrolled(user, courseId)) {
    return { enrolled: false, reason: "already_enrolled", course };
  }

  user.enrolledCourses.push({ course: courseId });
  await user.save();
  await Course.findByIdAndUpdate(courseId, { $inc: { totalStudents: 1 } });

  return { enrolled: true, course };
};

const grantComboAccess = async (userId, comboId) => {
  const combo = await ensureComboPublished(comboId);
  const user = await User.findById(userId);

  let enrolledCount = 0;
  const alreadyEnrolledCourses = [];

  for (const course of combo.courses) {
    if (isCourseEnrolled(user, course._id)) {
      alreadyEnrolledCourses.push(course.title);
      continue;
    }
    user.enrolledCourses.push({ course: course._id });
    await Course.findByIdAndUpdate(course._id, { $inc: { totalStudents: 1 } });
    enrolledCount += 1;
  }

  await user.save();
  await Combo.findByIdAndUpdate(comboId, { $inc: { totalStudents: 1 } });

  return { enrolledCount, alreadyEnrolledCourses, combo };
};

module.exports = {
  ensureCoursePublished,
  ensureComboPublished,
  grantCourseAccess,
  grantComboAccess,
};
