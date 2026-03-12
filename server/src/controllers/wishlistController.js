const User = require("../models/User");
const Course = require("../models/Course");
const Combo = require("../models/Combo");

exports.getWishlist = async (req, res) => {
  try {
    const { page = 1, limit = 9 } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 9;
    const skip = (pageNum - 1) * limitNum;

    const user = await User.findById(req.user._id)
      .populate("wishlist.product")
      .lean();

    const allWishlistItems = (user.wishlist || [])
      .filter((item) => item.product)
      .map((item) => ({
        _id: item._id,
        product: item.product,
        productModel: item.productModel,
      }))
      .reverse(); // Đảo ngược để hiện cái mới nhất lên đầu

    const total = allWishlistItems.length;
    const wishlistItems = allWishlistItems.slice(skip, skip + limitNum);

    res.json({
      success: true,
      data: wishlistItems,
      pagination: {
        total,
        totalPages: Math.ceil(total / limitNum),
        currentPage: pageNum,
        limit: limitNum,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const { productId, productModel } = req.body;

    if (!productId || !["Course", "Combo"].includes(productModel)) {
      return res
        .status(400)
        .json({ success: false, message: "Dữ liệu không hợp lệ." });
    }

    const Model = productModel === "Course" ? Course : Combo;
    const product = await Model.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Sản phẩm không tồn tại." });
    }

    const user = await User.findById(req.user._id);

    const exists = user.wishlist.some(
      (item) =>
        item.product.toString() === productId &&
        item.productModel === productModel
    );
    if (exists) {
      return res
        .status(400)
        .json({ success: false, message: "Sản phẩm đã có trong danh sách yêu thích." });
    }

    user.wishlist.push({ product: productId, productModel });
    await user.save();

    res.json({ success: true, message: "Đã thêm vào danh sách yêu thích!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId, productModel } = req.body;

    await User.findByIdAndUpdate(req.user._id, {
      $pull: {
        wishlist: { product: productId, productModel },
      },
    });

    res.json({ success: true, message: "Đã xóa khỏi danh sách yêu thích." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.moveToCart = async (req, res) => {
  try {
    const { productId, productModel } = req.body;

    const user = await User.findById(req.user._id);

    // Remove from wishlist
    user.wishlist = user.wishlist.filter(
      (item) =>
        !(
          item.product.toString() === productId &&
          item.productModel === productModel
        )
    );

    // Add to cart if not already there
    const inCart = user.cart.some(
      (item) =>
        item.product.toString() === productId &&
        item.productModel === productModel
    );
    if (!inCart) {
      user.cart.push({ product: productId, productModel });
    }

    await user.save();

    res.json({ success: true, message: "Đã chuyển sang giỏ hàng!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
