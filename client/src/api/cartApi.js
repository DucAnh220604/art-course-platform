import axiosClient from "./axiosClient";

const cartApi = {
  getCart: () => axiosClient.get("/cart"),
  addToCart: (productId, productModel) =>
    axiosClient.post("/cart/add", { productId, productModel }),
  removeFromCart: (productId, productModel) =>
    axiosClient.post("/cart/remove", { productId, productModel }),
  clearCart: () => axiosClient.post("/cart/clear"),
  checkCourseInCart: (courseId) =>
    axiosClient.get(`/cart/check-course/${courseId}`),
};

export default cartApi;
