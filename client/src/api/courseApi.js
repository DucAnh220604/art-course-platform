import axiosClient from "./axiosClient";

const courseApi = {
  // --- COURSE API ---
  getAllCourses: (params = {}) => axiosClient.get("/courses", { params }),
  getCategories: () => axiosClient.get("/courses/categories/all"),
  getCourseBySlug: (slug) => axiosClient.get(`/courses/${slug}`),
  createCourse: (data) => axiosClient.post("/courses", data),
  updateCourse: (id, data) => axiosClient.put(`/courses/${id}`, data),
  deleteCourse: (id) => axiosClient.delete(`/courses/${id}`),

  // --- SECTION API ---
  createSection: (data) => axiosClient.post("/sections", data),
  updateSection: (id, data) => axiosClient.put(`/sections/${id}`, data),
  deleteSection: (id) => axiosClient.delete(`/sections/${id}`),

  // --- LESSON API ---
  createLesson: (data) => axiosClient.post("/lessons", data),
  getLessonById: (id) => axiosClient.get(`/lessons/${id}`),
  updateLesson: (id, data) => axiosClient.put(`/lessons/${id}`, data),
  deleteLesson: (id) => axiosClient.delete(`/lessons/${id}`),

  // --- LESSON PROGRESS ---
  markLessonComplete: (lessonId) =>
    axiosClient.post(`/lessons/${lessonId}/complete`),
  getCourseProgress: (courseId) =>
    axiosClient.get(`/lessons/progress/${courseId}`),
};

export default courseApi;
