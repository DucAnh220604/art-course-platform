import axiosClient from "./axiosClient";

const userApi = {
  updateProfile: (data) => {
    return axiosClient.patch("/users/profile", data);
  },

  changePassword: (data) => {
    return axiosClient.patch("/users/change-password", data);
  },

  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append("avatar", file);

    return axiosClient.post("/users/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  requestInstructor: (data) => {
    const formData = new FormData();
    formData.append("fullName", data.fullName);
    formData.append("phone", data.phone);
    formData.append("email", data.email);
    formData.append("experience", data.experience);
    formData.append("specialization", data.specialization);
    formData.append("introduction", data.introduction || "");
    if (data.cvImage) {
      formData.append("cvImage", data.cvImage);
    }

    return axiosClient.post("/users/request-instructor", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  getInstructorRequestStatus: () => {
    return axiosClient.get("/users/instructor-request-status");
  },

  enrollCourse: (courseId) => {
    return axiosClient.post(`/users/enroll/${courseId}`);
  },

  checkEnrollment: (courseId) => {
    return axiosClient.get(`/users/enroll/${courseId}/check`);
  },

  enrollCombo: (comboId) => {
    return axiosClient.post(`/users/enroll-combo/${comboId}`);
  },

  checkComboEnrollment: (comboId) => {
    return axiosClient.get(`/users/enroll-combo/${comboId}/check`);
  },

  getEnrolledCourses: () => {
    return axiosClient.get("/users/enrolled-courses");
  },

  getInstructorDashboardStats: () => {
    return axiosClient.get("/users/instructor-dashboard");
  },
};

export default userApi;
