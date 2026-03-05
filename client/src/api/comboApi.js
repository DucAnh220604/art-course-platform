import axiosClient from "./axiosClient";

const comboApi = {
  // Lấy tất cả combos
  getAllCombos: (params = {}) => axiosClient.get("/combos", { params }),

  // Lấy combo theo slug
  getComboBySlug: (slug) => axiosClient.get(`/combos/${slug}`),

  // Tạo combo mới (Instructor)
  createCombo: (data) => axiosClient.post("/combos", data),

  // Cập nhật combo (Instructor)
  updateCombo: (id, data) => axiosClient.put(`/combos/${id}`, data),

  // Xóa combo (Instructor)
  deleteCombo: (id) => axiosClient.delete(`/combos/${id}`),
};

export default comboApi;
