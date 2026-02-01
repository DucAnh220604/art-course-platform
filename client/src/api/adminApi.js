import axiosClient from "./axiosClient";

const adminApi = {
  getAllUsers: (params = {}) => {
    return axiosClient.get("/users", { params });
  },

  getUserById: (userId) => {
    return axiosClient.get(`/users/${userId}`);
  },

  updateUser: (userId, data) => {
    return axiosClient.patch(`/users/${userId}`, data);
  },

  deleteUser: (userId, hard = false) => {
    return axiosClient.delete(`/users/${userId}`, {
      params: { hard: hard.toString() },
    });
  },

  getUserStats: () => {
    return axiosClient.get("/users/stats");
  },

  getInstructorRequests: (params = {}) => {
    return axiosClient.get("/users/instructor-requests", { params });
  },

  handleInstructorRequest: (userId, action) => {
    return axiosClient.patch(`/users/${userId}/instructor-request`, { action });
  },
};

export default adminApi;
