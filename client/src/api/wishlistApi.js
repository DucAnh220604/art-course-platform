import axiosClient from "./axiosClient";

const wishlistApi = {
  getWishlist: () => axiosClient.get("/wishlist"),
  addToWishlist: (productId, productModel) =>
    axiosClient.post("/wishlist/add", { productId, productModel }),
  removeFromWishlist: (productId, productModel) =>
    axiosClient.post("/wishlist/remove", { productId, productModel }),
  moveToCart: (productId, productModel) =>
    axiosClient.post("/wishlist/move-to-cart", { productId, productModel }),
};

export default wishlistApi;
