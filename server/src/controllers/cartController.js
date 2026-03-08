const User = require("../models/User");
const Course = require("../models/Course");
const Combo = require("../models/Combo");

exports.getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("cart.product")
      .lean();

    const cartItems = (user.cart || [])
      .filter((item) => item.product) // filter out deleted products
      .map((item) => ({
        _id: item._id,
        product: item.product,
        productModel: item.productModel,
      }));

    res.json({ success: true, data: cartItems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, productModel } = req.body;

    if (!productId || !["Course", "Combo"].includes(productModel)) {
      return res
        .status(400)
        .json({ success: false, message: "Dữ liệu không hợp lệ." });
    }

    // Verify product exists
    const Model = productModel === "Course" ? Course : Combo;
    const product = await Model.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Sản phẩm không tồn tại." });
    }

    const user = await User.findById(req.user._id);

    // Check if already in cart
    const exists = user.cart.some(
      (item) =>
        item.product.toString() === productId &&
        item.productModel === productModel
    );
    if (exists) {
      return res
        .status(400)
        .json({ success: false, message: "Sản phẩm đã có trong giỏ hàng." });
    }

    // Check if already enrolled (course)
    if (productModel === "Course") {
      const enrolled = user.enrolledCourses.some(
        (e) => e.course.toString() === productId
      );
      if (enrolled) {
        return res
          .status(400)
          .json({ success: false, message: "Bạn đã đăng ký khóa học này rồi." });
      }
    }

    user.cart.push({ product: productId, productModel });
    await user.save();

    res.json({ success: true, message: "Đã thêm vào giỏ hàng!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { productId, productModel } = req.body;

    await User.findByIdAndUpdate(req.user._id, {
      $pull: {
        cart: { product: productId, productModel },
      },
    });

    res.json({ success: true, message: "Đã xóa khỏi giỏ hàng." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $set: { cart: [] } });
    res.json({ success: true, message: "Đã xóa toàn bộ giỏ hàng." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
