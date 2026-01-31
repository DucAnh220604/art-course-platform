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
};

export default userApi;
