import axiosClient from "./axiosClient";

const contactApi = {
  // Gửi tin nhắn liên hệ (public)
  sendMessage: (data) => {
    return axiosClient.post("/contact", data);
  },

  // Lấy tất cả tin nhắn (staff/admin)
  getAllMessages: (params = {}) => {
    return axiosClient.get("/contact", { params });
  },

  // Lấy chi tiết tin nhắn (staff/admin)
  getMessageById: (id) => {
    return axiosClient.get(`/contact/${id}`);
  },

  // Phản hồi tin nhắn qua email (staff/admin)
  replyMessage: (id, replyContent) => {
    return axiosClient.post(`/contact/${id}/reply`, { replyContent });
  },

  // Cập nhật trạng thái tin nhắn (staff/admin)
  updateStatus: (id, status) => {
    return axiosClient.patch(`/contact/${id}/status`, { status });
  },

  // Xóa tin nhắn (admin only)
  deleteMessage: (id) => {
    return axiosClient.delete(`/contact/${id}`);
  },
};

export default contactApi;
