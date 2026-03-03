import axiosClient from "./axiosClient";

const userApi = {
  updateProfile: (data) => {
    return axiosClient.patch("/users/profile", data);
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

  requestInstructor: () => {
    return axiosClient.post("/users/request-instructor");
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
};

export default userApi;
