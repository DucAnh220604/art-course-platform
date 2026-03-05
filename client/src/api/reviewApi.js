import axiosClient from "./axiosClient";

const reviewApi = {
  getCourseReviews: (courseId) => {
    return axiosClient.get(`/reviews/course/${courseId}`);
  },
  createReview: (data) => {
    // data gồm { courseId, rating, comment }
    return axiosClient.post("/reviews", data);
  },
  updateReview: (id, data) => {
    return axiosClient.put(`/reviews/${id}`, data);
  },
  deleteReview: (id) => {
    return axiosClient.delete(`/reviews/${id}`);
  },
};

export default reviewApi;
