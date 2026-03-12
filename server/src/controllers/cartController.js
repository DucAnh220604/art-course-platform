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

    const user = await User.findById(req.user._id).populate("cart.product");

    // Check if already enrolled
    if (productModel === "Course") {
      const enrolled = user.enrolledCourses.some(
        (e) => e.course.toString() === productId,
      );
      if (enrolled) {
        return res.status(400).json({
          success: false,
          message: "Bạn đã đăng ký khóa học này rồi.",
        });
      }
    }

    // ============================================================
    // KỊCH BẢN 1: Thêm COMBO - Tự động xóa các khóa lẻ trùng
    // ============================================================
    if (productModel === "Combo") {
      // Populate combo với courses
      const combo = await Combo.findById(productId).populate(
        "courses",
        "_id title",
      );
      const comboCoursesIds = combo.courses.map((c) => c._id.toString());

      // Tìm các khóa lẻ trong giỏ hàng trùng với combo
      const conflictingCourses = user.cart.filter(
        (item) =>
          item.productModel === "Course" &&
          comboCoursesIds.includes(item.product._id.toString()),
      );

      // Check if combo already in cart
      const comboExists = user.cart.some(
        (item) =>
          item.product._id.toString() === productId &&
          item.productModel === "Combo",
      );
      if (comboExists) {
        return res.status(400).json({
          success: false,
          message: "Combo đã có trong giỏ hàng.",
        });
      }

      // Xóa các khóa lẻ trùng
      if (conflictingCourses.length > 0) {
        user.cart = user.cart.filter(
          (item) =>
            !(
              item.productModel === "Course" &&
              comboCoursesIds.includes(item.product._id.toString())
            ),
        );

        // Thêm combo vào giỏ
        user.cart.push({ product: productId, productModel });
        await user.save();

        // Tạo message với danh sách các khóa đã gộp
        const removedCourseNames = conflictingCourses
          .map((item) => item.product.title)
          .join(", ");

        return res.json({
          success: true,
          message: `Đã thêm combo vào giỏ hàng!`,
          info: {
            merged: true,
            removedCourses: conflictingCourses.map((item) => ({
              id: item.product._id,
              title: item.product.title,
            })),
            comboTitle: combo.title,
            messageDetail: `${conflictingCourses.length === 1 ? "Khóa học" : "Các khóa học"} "${removedCourseNames}" đã được gộp vào Combo "${combo.title}" để có mức giá tốt nhất.`,
          },
        });
      }

      // Không có conflict, thêm combo bình thường
      user.cart.push({ product: productId, productModel });
      await user.save();

      return res.json({
        success: true,
        message: "Đã thêm combo vào giỏ hàng!",
      });
    }

    // ============================================================
    // KỊCH BẢN 2: Thêm KHÓA LẺ - Kiểm tra xem đã có trong Combo chưa
    // ============================================================
    if (productModel === "Course") {
      // Tìm các combo trong giỏ hàng có chứa khóa học này
      const combosInCart = user.cart.filter(
        (item) => item.productModel === "Combo",
      );

      for (const cartItem of combosInCart) {
        const combo = cartItem.product;
        // Check if this course is in the combo
        const courseInCombo = combo.courses.some(
          (c) => c.toString() === productId,
        );

        if (courseInCombo) {
          return res.status(400).json({
            success: false,
            message: `Khóa học này đã có trong Combo "${combo.title}" ở giỏ hàng của bạn.`,
            info: {
              inCombo: true,
              comboTitle: combo.title,
              comboId: combo._id,
            },
          });
        }
      }

      // Check if already in cart as standalone course
      const courseExists = user.cart.some(
        (item) =>
          item.product._id.toString() === productId &&
          item.productModel === "Course",
      );
      if (courseExists) {
        return res.status(400).json({
          success: false,
          message: "Khóa học đã có trong giỏ hàng.",
        });
      }

      // Thêm khóa học vào giỏ
      user.cart.push({ product: productId, productModel: "Course" });
      await user.save();

      return res.json({
        success: true,
        message: "Đã thêm khóa học vào giỏ hàng!",
      });
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API mới: Check xem course có trong cart không (qua combo hoặc trực tiếp)
exports.checkCourseInCart = async (req, res) => {
  try {
    const { courseId } = req.params;
    const user = await User.findById(req.user._id).populate("cart.product");

    // Check if course is directly in cart
    const directlyInCart = user.cart.some(
      (item) =>
        item.productModel === "Course" &&
        item.product._id.toString() === courseId,
    );

    if (directlyInCart) {
      return res.json({
        success: true,
        inCart: true,
        type: "direct",
        message: "Khóa học đã có trong giỏ hàng.",
      });
    }

    // Check if course is in any combo in cart
    const combosInCart = user.cart.filter(
      (item) => item.productModel === "Combo",
    );

    for (const cartItem of combosInCart) {
      const combo = cartItem.product;
      const courseInCombo = combo.courses.some(
        (c) => c.toString() === courseId,
      );

      if (courseInCombo) {
        return res.json({
          success: true,
          inCart: true,
          type: "combo",
          comboTitle: combo.title,
          comboId: combo._id,
          message: `Khóa học này đã có trong Combo "${combo.title}" ở giỏ hàng.`,
        });
      }
    }

    return res.json({
      success: true,
      inCart: false,
      message: "Khóa học chưa có trong giỏ hàng.",
    });
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
