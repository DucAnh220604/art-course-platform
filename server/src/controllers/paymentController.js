const crypto = require("crypto");
const dayjs = require("dayjs");
const Payment = require("../models/Payment");
const Course = require("../models/Course");
const Combo = require("../models/Combo");
const User = require("../models/User");
const {
  grantCourseAccess,
  grantComboAccess,
  ensureCoursePublished,
  ensureComboPublished,
} = require("../services/enrollmentService");

const vnpConfig = {
  tmnCode: process.env.VNP_TMN_CODE,
  hashSecret: process.env.VNP_HASH_SECRET,
  vnpUrl: process.env.VNP_URL,
  returnUrl: process.env.VNP_RETURN_URL,
};

const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

const sortObject = (obj) => {
  const sorted = {};
  Object.keys(obj)
    .sort()
    .forEach((key) => {
      sorted[key] = obj[key];
    });
  return sorted;
};

const buildSignDataForSend = (params) => {
  const sorted = sortObject(params);
  return Object.entries(sorted)
    .map(([k, v]) => `${k}=${encodeURIComponent(v).replace(/%20/g, "+")}`)
    .join("&");
};

const buildSignDataForVerify = (params) => {
  const sorted = sortObject(params);
  return Object.entries(sorted)
    .filter(
      ([k, v]) =>
        k.startsWith("vnp_") &&
        k !== "vnp_SecureHash" &&
        k !== "vnp_SecureHashType" &&
        v !== "" &&
        v !== null &&
        v !== undefined,
    )
    .map(([k, v]) => `${k}=${v}`) // Giữ nguyên v đã encoded
    .join("&");
};

const sign = (data) =>
  crypto
    .createHmac("sha512", vnpConfig.hashSecret)
    .update(Buffer.from(data, "utf-8"))
    .digest("hex");

// Parse query từ URL gốc (giữ nguyên encoded values)
const parseQueryFromUrl = (url) => {
  const queryString = url.split("?")[1];
  if (!queryString) return {};

  const params = {};
  queryString.split("&").forEach((pair) => {
    const [key, value] = pair.split("=");
    if (key && value !== undefined) {
      params[key] = value; // Giữ nguyên value đã encoded
    }
  });
  return params;
};

const getClientIp = (req) =>
  req.headers["x-forwarded-for"]?.split(",")[0] ||
  req.connection?.remoteAddress ||
  req.socket?.remoteAddress ||
  "127.0.0.1";

const generateTxnRef = () =>
  `AK${Date.now()}${Math.floor(Math.random() * 100000)}`;

const buildPaymentUrl = ({ amount, txnRef, orderInfo, ipAddr }) => {
  const createDate = dayjs().format("YYYYMMDDHHmmss");
  const expireDate = dayjs().add(15, "minute").format("YYYYMMDDHHmmss");

  const params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: vnpConfig.tmnCode,
    vnp_Amount: Math.round(amount * 100), // VND * 100
    vnp_CurrCode: "VND",
    vnp_TxnRef: txnRef,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: "other",
    vnp_Locale: "vn",
    vnp_ReturnUrl: vnpConfig.returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  };

  const signData = buildSignDataForSend(params); // Gửi đi vẫn cần encode
  const secureHash = sign(signData);
  const query = `${signData}&vnp_SecureHash=${secureHash}`;

  return `${vnpConfig.vnpUrl}?${query}`;
};

const verifyVnpay = (query) => {
  const secureHash = query.vnp_SecureHash;
  const signData = buildSignDataForVerify(query);
  const expected = sign(signData);

  console.log("=== Signature Verification Debug ===");
  console.log("Sign Data:", signData);
  console.log("Expected Hash:", expected);
  console.log("Received Hash:", secureHash);

  return secureHash === expected;
};

exports.createPayment = async (req, res) => {
  try {
    const { itemType, itemId } = req.body;
    const userId = req.user._id;

    if (!["course", "combo"].includes(itemType) || !itemId) {
      return res
        .status(400)
        .json({ success: false, message: "Dữ liệu thanh toán không hợp lệ." });
    }

    let item;
    let amount = 0;
    let title = "";
    let isUpgrade = false;
    let upgradeInfo = null;

    // Lấy thông tin user
    const buyer = await User.findById(userId);

    if (itemType === "course") {
      item = await ensureCoursePublished(itemId);
      amount = item.price || 0;
      title = item.title;

      // Kiểm tra đã đăng ký chưa
      const alreadyEnrolled = buyer.enrolledCourses.some(
        (e) => e.course.toString() === itemId.toString(),
      );
      if (alreadyEnrolled) {
        return res.status(400).json({
          success: false,
          message: "Bạn đã đăng ký khóa học này rồi!",
        });
      }
    }

    if (itemType === "combo") {
      const combo = await ensureComboPublished(itemId);
      item = combo;
      title = combo.title;

      // Lấy danh sách các khóa học người dùng đã sở hữu
      const userEnrolledCourseIds = buyer.enrolledCourses.map((ec) =>
        ec.course.toString(),
      );

      // Lọc các khóa học chưa sở hữu
      const unownedCourses = combo.courses.filter(
        (course) => !userEnrolledCourseIds.includes(course._id.toString()),
      );

      // Nếu đã sở hữu tất cả khóa học
      if (unownedCourses.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Bạn đã sở hữu tất cả khóa học trong combo này!",
        });
      }

      // Tính tổng giá gốc các khóa chưa sở hữu
      const unownedOriginalPrice = unownedCourses.reduce(
        (sum, c) => sum + c.price,
        0,
      );

      // Tính giá nâng cấp: áp dụng % giảm giá của combo
      amount = Math.round(
        unownedOriginalPrice * (1 - combo.discountPercentage / 100),
      );

      // Kiểm tra xem có phải là upgrade không (người dùng đã sở hữu ít nhất 1 khóa học)
      const ownedCoursesCount = combo.courses.length - unownedCourses.length;
      if (ownedCoursesCount > 0) {
        isUpgrade = true;
        upgradeInfo = {
          ownedCoursesCount,
          totalCoursesCount: combo.courses.length,
          unownedCourseIds: unownedCourses.map((c) => c._id.toString()),
          originalComboPrice: combo.price,
          unownedOriginalPrice,
          discountPercentage: combo.discountPercentage,
          upgradeSavings: combo.price - amount,
        };
      } else {
        // Người dùng chưa sở hữu khóa học nào, dùng giá combo thông thường
        amount = combo.price || 0;
      }
    }

    // Miễn phí: enroll trực tiếp, không qua VNPay
    if (amount <= 0) {
      if (itemType === "course") {
        const result = await grantCourseAccess(userId, itemId);
        return res.json({
          success: true,
          flow: "free",
          enrolled: true,
          message:
            result.reason === "already_enrolled"
              ? "Bạn đã đăng ký khóa học này rồi!"
              : "Đăng ký khóa học miễn phí thành công!",
        });
      }

      const comboResult = await grantComboAccess(userId, itemId);
      return res.json({
        success: true,
        flow: "free",
        enrolled: true,
        message: `Đăng ký combo miễn phí thành công! Đã thêm ${comboResult.enrolledCount} khóa học.`,
      });
    }

    const txnRef = generateTxnRef();
    const orderInfo = `${itemType}:${itemId}:${userId}${isUpgrade ? ":upgrade" : ""}`;

    // Tạo payment record với thông tin upgrade nếu có
    const paymentData = {
      user: userId,
      itemType,
      itemId,
      amount,
      txnRef,
      orderInfo,
      status: "pending",
      provider: "vnpay",
    };

    // Lưu thông tin upgrade vào metadata
    if (isUpgrade && upgradeInfo) {
      paymentData.metadata = upgradeInfo;
    }

    await Payment.create(paymentData);

    const paymentUrl = buildPaymentUrl({
      amount,
      txnRef,
      orderInfo: isUpgrade
        ? `Nang cap combo ${title}`
        : `Thanh toan ${itemType === "course" ? "khoa hoc" : "combo"} ${title}`,
      ipAddr: getClientIp(req),
    });

    return res.json({
      success: true,
      flow: "vnpay",
      txnRef,
      paymentUrl,
      isUpgrade,
      upgradeInfo: isUpgrade ? upgradeInfo : null,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const grantPaymentAccess = async (payment) => {
  if (payment.itemType === "cart") {
    // Parse cart items from orderInfo: "cart:userId:course:id1,combo:id2,..."
    const parts = payment.orderInfo.split(":");
    // Format: cart:userId:course:id1,combo:id2,...
    const itemsStr = payment.orderInfo.replace(/^cart:[^:]+:/, "");
    const items = itemsStr.split(",");
    for (const item of items) {
      const [type, id] = item.split(":");
      if (type === "course") {
        await grantCourseAccess(payment.user, id);
      } else if (type === "combo") {
        await grantComboAccess(payment.user, id);
      }
    }
    // Clear cart after successful payment
    await User.findByIdAndUpdate(payment.user, { $set: { cart: [] } });
  } else if (payment.itemType === "course") {
    await grantCourseAccess(payment.user, payment.itemId);
    // Xóa khóa học này khỏi cart nếu có
    await User.findByIdAndUpdate(payment.user, {
      $pull: { cart: { product: payment.itemId, productModel: "Course" } },
    });
  } else if (payment.itemType === "combo") {
    // grantComboAccess đã tự động xử lý việc chỉ enroll các khóa học chưa có
    await grantComboAccess(payment.user, payment.itemId);
    // Xóa combo này khỏi cart nếu có
    await User.findByIdAndUpdate(payment.user, {
      $pull: { cart: { product: payment.itemId, productModel: "Combo" } },
    });
  }
};

exports.vnpayReturn = async (req, res) => {
  try {
    console.log("=== VNPay Return Callback ===");
    console.log("Full URL:", req.originalUrl);

    // LẤY QUERY GỐC TỪ URL thay vì dùng req.query
    const originalQuery = parseQueryFromUrl(req.originalUrl);
    console.log(
      "Original Query (encoded):",
      JSON.stringify(originalQuery, null, 2),
    );

    const isValid = verifyVnpay(originalQuery);

    const txnRef = req.query.vnp_TxnRef || "";
    const responseCode = req.query.vnp_ResponseCode || "";

    console.log("Verification Result:", isValid);

    // Redirect helper
    const redirectToClient = (extra = "") =>
      `${clientUrl}/payment-result?txnRef=${encodeURIComponent(txnRef)}&code=${encodeURIComponent(responseCode)}&valid=${isValid ? "1" : "0"}${extra}`;

    const payment = txnRef ? await Payment.findOne({ txnRef }) : null;

    if (!payment) {
      console.log("❌ Payment not found for txnRef:", txnRef);
      return res.redirect(redirectToClient("&status=notfound"));
    }

    if (!isValid) {
      console.log("❌ Invalid signature - updating status and redirecting");
      payment.status = "failed";
      payment.errorMessage = "Chữ ký thanh toán không hợp lệ";
      await payment.save();
      return res.redirect(redirectToClient("&status=failed"));
    }

    console.log("Payment found:", {
      id: payment._id,
      status: payment.status,
      amount: payment.amount,
      itemType: payment.itemType,
      itemId: payment.itemId,
    });

    payment.rawReturn = req.query;

    // Xử lý payment dựa trên response code
    if (responseCode === "00") {
      if (payment.status === "pending") {
        console.log("✅ Processing successful payment (responseCode: 00)");

        // Kiểm tra số tiền
        const amountFromVnp = Number(req.query.vnp_Amount || 0) / 100;
        if (Number(payment.amount) !== amountFromVnp) {
          console.log(
            `❌ Amount mismatch. Expected: ${payment.amount}, Got: ${amountFromVnp}`,
          );
          payment.status = "failed";
          payment.errorMessage = "Số tiền thanh toán không khớp";
          await payment.save();
          return res.redirect(redirectToClient("&status=amount_mismatch"));
        }

        try {
          await grantPaymentAccess(payment);
          console.log("✅ Access granted successfully");

          payment.status = "paid";
          payment.paidAt = new Date();
          payment.vnpTransactionNo = req.query.vnp_TransactionNo;
          payment.vnpBankTranNo = req.query.vnp_BankTranNo;

          await payment.save();
          console.log("✅ Payment saved with status: paid");
        } catch (grantError) {
          console.error("❌ Error granting access:", grantError);
          payment.status = "failed";
          payment.errorMessage = grantError.message;
          await payment.save();

          return res.redirect(redirectToClient("&status=grant_failed"));
        }
      } else {
        console.log(
          "ℹ️ Payment already processed. Current status:",
          payment.status,
        );
      }
    } else {
      console.log("❌ Payment failed with responseCode:", responseCode);
      if (payment.status === "pending") {
        payment.status = "failed";
      }
    }

    await payment.save();
    console.log("=== VNPay Return Complete - Redirecting to client ===");

    return res.redirect(redirectToClient());
  } catch (error) {
    console.error("❌❌❌ VNPay Return Fatal Error:", error);
    const txnRef = req.query?.vnp_TxnRef || "unknown";
    return res.redirect(
      `${clientUrl}/payment-result?txnRef=${txnRef}&error=1&message=${encodeURIComponent(error.message)}`,
    );
  }
};

exports.vnpayIpn = async (req, res) => {
  try {
    console.log("=== VNPay IPN Callback ===");
    console.log("Original URL:", req.originalUrl);

    // LẤY QUERY GỐC
    const originalQuery = parseQueryFromUrl(req.originalUrl);

    const isValid = verifyVnpay(originalQuery);
    if (!isValid) {
      console.log("❌ IPN: Invalid checksum");
      return res
        .status(200)
        .json({ RspCode: "97", Message: "Invalid checksum" });
    }

    const txnRef = req.query.vnp_TxnRef;
    const responseCode = req.query.vnp_ResponseCode;
    const transactionNo = req.query.vnp_TransactionNo;
    const bankTranNo = req.query.vnp_BankTranNo;
    const amountFromVnp = Number(req.query.vnp_Amount || 0) / 100;

    console.log("IPN Data:", { txnRef, responseCode, amountFromVnp });

    const payment = await Payment.findOne({ txnRef });
    if (!payment) {
      console.log("❌ IPN: Payment not found");
      return res
        .status(200)
        .json({ RspCode: "01", Message: "Order not found" });
    }

    // Idempotent: đã paid rồi thì trả OK luôn
    if (payment.status === "paid") {
      console.log("ℹ️ IPN: Payment already paid");
      return res
        .status(200)
        .json({ RspCode: "00", Message: "Confirm Success" });
    }

    // Check amount
    if (Number(payment.amount) !== Number(amountFromVnp)) {
      console.log(
        "❌ IPN: Amount mismatch. Expected:",
        payment.amount,
        "Got:",
        amountFromVnp,
      );
      payment.status = "failed";
      payment.rawIpn = req.query;
      await payment.save();
      return res.status(200).json({ RspCode: "04", Message: "Invalid amount" });
    }

    if (responseCode === "00") {
      console.log("✅ IPN: Processing payment");

      try {
        await grantPaymentAccess(payment);

        payment.status = "paid";
        payment.paidAt = new Date();
        payment.vnpTransactionNo = transactionNo;
        payment.vnpBankTranNo = bankTranNo;
        payment.rawIpn = req.query;
        await payment.save();

        console.log("✅ IPN: Payment processed successfully");
        return res
          .status(200)
          .json({ RspCode: "00", Message: "Confirm Success" });
      } catch (error) {
        console.error("❌ IPN: Error granting access:", error);
        payment.status = "failed";
        payment.errorMessage = error.message;
        payment.rawIpn = req.query;
        await payment.save();
        return res
          .status(200)
          .json({ RspCode: "99", Message: "Unknown error" });
      }
    }

    payment.status = "failed";
    payment.rawIpn = req.query;
    await payment.save();

    console.log("❌ IPN: Payment failed with code:", responseCode);
    return res.status(200).json({ RspCode: "00", Message: "Confirm Success" });
  } catch (error) {
    console.error("❌❌❌ IPN Fatal Error:", error);
    return res.status(200).json({ RspCode: "99", Message: "Unknown error" });
  }
};

exports.getPaymentStatus = async (req, res) => {
  try {
    const { txnRef } = req.params;
    const payment = await Payment.findOne({ txnRef, user: req.user._id });

    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy giao dịch." });
    }

    let itemSlug = null;
    if (payment.itemType === "course") {
      const course = await Course.findById(payment.itemId).select("slug");
      itemSlug = course?.slug || null;
    } else if (payment.itemType === "combo") {
      const combo = await Combo.findById(payment.itemId).select("slug");
      itemSlug = combo?.slug || null;
    }

    return res.json({
      success: true,
      data: {
        txnRef: payment.txnRef,
        status: payment.status,
        itemType: payment.itemType,
        itemId: payment.itemId,
        itemSlug,
        amount: payment.amount,
        paidAt: payment.paidAt,
        metadata: payment.metadata, // Trả về thông tin upgrade nếu có
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.checkoutCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate("cart.product");

    if (!user.cart || user.cart.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Giỏ hàng trống." });
    }

    // Calculate total and validate all items
    let totalAmount = 0;
    const items = [];
    const freeItems = [];
    const alreadyEnrolledItems = [];

    for (const cartItem of user.cart) {
      if (!cartItem.product) continue;

      const product = cartItem.product;

      // Kiểm tra đã enrolled chưa (chỉ áp dụng cho Course)
      if (cartItem.productModel === "Course") {
        const enrolled = user.enrolledCourses.some(
          (e) => e.course.toString() === product._id.toString(),
        );
        if (enrolled) {
          alreadyEnrolledItems.push(cartItem);
          continue;
        }
      }

      const price = product.price || 0;

      if (price <= 0) {
        freeItems.push(cartItem);
      } else {
        totalAmount += price;
        items.push(cartItem);
      }
    }

    // Xóa các item đã enrolled khỏi cart
    if (alreadyEnrolledItems.length > 0) {
      for (const item of alreadyEnrolledItems) {
        user.cart = user.cart.filter(
          (c) =>
            !(
              c.product._id.toString() === item.product._id.toString() &&
              c.productModel === item.productModel
            ),
        );
      }
      await user.save();
    }

    // Enroll free items immediately
    for (const item of freeItems) {
      if (item.productModel === "Course") {
        await grantCourseAccess(userId, item.product._id);
      } else {
        await grantComboAccess(userId, item.product._id);
      }
    }

    // If everything is free
    if (items.length === 0) {
      user.cart = [];
      await user.save();
      return res.json({
        success: true,
        flow: "free",
        message: "Đăng ký thành công tất cả khóa học miễn phí!",
      });
    }

    // Create a single payment for all paid items
    const txnRef = generateTxnRef();
    const itemIds = items.map(
      (i) => `${i.productModel.toLowerCase()}:${i.product._id}`,
    );
    const orderInfo = `cart:${userId}:${itemIds.join(",")}`;

    await Payment.create({
      user: userId,
      itemType: "cart",
      itemId: items[0].product._id, // primary item for reference
      amount: totalAmount,
      txnRef,
      orderInfo,
      status: "pending",
      provider: "vnpay",
    });

    const paymentUrl = buildPaymentUrl({
      amount: totalAmount,
      txnRef,
      orderInfo: `Thanh toan gio hang ArtKids - ${items.length} san pham`,
      ipAddr: getClientIp(req),
    });

    // Remove free items from cart, keep paid items until payment succeeds
    user.cart = user.cart.filter((item) =>
      freeItems.every(
        (f) =>
          !(
            f.product._id.toString() === item.product.toString() &&
            f.productModel === item.productModel
          ),
      ),
    );
    await user.save();

    return res.json({
      success: true,
      flow: "vnpay",
      txnRef,
      paymentUrl,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      user: req.user._id,
      status: { $ne: "pending" },
    })
      .sort({ createdAt: -1 })
      .lean();

    // Populate item info cho từng payment
    for (const payment of payments) {
      if (payment.itemType === "course") {
        const course = await Course.findById(payment.itemId).select(
          "title slug thumbnail",
        );
        payment.item = course;
      } else if (payment.itemType === "combo") {
        const combo = await Combo.findById(payment.itemId).select(
          "title slug thumbnail",
        );
        payment.item = combo;
      } else {
        // cart — parse orderInfo để lấy danh sách items
        const itemsStr = payment.orderInfo.replace(/^cart:[^:]+:/, "");
        const entries = itemsStr.split(",");
        const cartItems = [];
        for (const entry of entries) {
          const [type, id] = entry.split(":");
          if (type === "course") {
            const c = await Course.findById(id).select("title slug thumbnail");
            if (c) cartItems.push({ ...c.toObject(), productModel: "Course" });
          } else if (type === "combo") {
            const cb = await Combo.findById(id).select("title slug thumbnail");
            if (cb) cartItems.push({ ...cb.toObject(), productModel: "Combo" });
          }
        }
        payment.cartItems = cartItems;
      }
    }

    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getInstructorOrders = async (req, res) => {
  try {
    const instructorId = req.user._id;

    // Lấy tất cả courses và combos của instructor
    const myCourses = await Course.find({ instructor: instructorId }).select(
      "_id",
    );
    const myCombos = await Combo.find({ instructor: instructorId }).select(
      "_id",
    );

    const courseIds = myCourses.map((c) => c._id);
    const comboIds = myCombos.map((c) => c._id);

    // Tìm tất cả payments đã paid cho các items của instructor
    const payments = await Payment.find({
      $or: [
        { itemType: "course", itemId: { $in: courseIds }, status: "paid" },
        { itemType: "combo", itemId: { $in: comboIds }, status: "paid" },
      ],
    })
      .populate("user", "username fullname email avatar") // Thông tin người mua
      .sort({ paidAt: -1 })
      .lean();

    // Populate thông tin course/combo
    for (const payment of payments) {
      if (payment.itemType === "course") {
        const course = await Course.findById(payment.itemId).select(
          "title slug thumbnail",
        );
        payment.item = course;
      } else if (payment.itemType === "combo") {
        const combo = await Combo.findById(payment.itemId).select(
          "title slug thumbnail",
        );
        payment.item = combo;
      }
    }

    // Tính tổng doanh thu
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalOrders = payments.length;

    res.json({
      success: true,
      data: {
        orders: payments,
        summary: {
          totalRevenue,
          totalOrders,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET ALL PAYMENTS (ADMIN)
exports.getAllPayments = async (req, res) => {
  try {
    const { status, itemType, search, page = 1, limit = 20 } = req.query;

    // Build filter
    const filter = {};
    if (status && status !== "all") {
      filter.status = status;
    }
    if (itemType && itemType !== "all") {
      filter.itemType = itemType;
    }
    if (search) {
      filter.$or = [
        { txnRef: { $regex: search, $options: "i" } },
        { orderInfo: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    // Get payments
    const payments = await Payment.find(filter)
      .populate("user", "username fullname email avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Populate item info
    for (const payment of payments) {
      if (payment.itemType === "course") {
        const course = await Course.findById(payment.itemId)
          .select("title slug thumbnail instructor")
          .populate("instructor", "username fullname");
        payment.item = course;
      } else if (payment.itemType === "combo") {
        const combo = await Combo.findById(payment.itemId)
          .select("title slug thumbnail instructor")
          .populate("instructor", "username fullname");
        payment.item = combo;
      } else if (payment.itemType === "cart") {
        // Parse cart items from orderInfo
        payment.item = { title: "Giỏ hàng", type: "cart" };
      }
    }

    // Get total count for pagination
    const totalPayments = await Payment.countDocuments(filter);

    // Calculate summary statistics
    const allPayments = await Payment.find({ status: "paid" });
    const totalRevenue = allPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalOrders = allPayments.length;

    // Group by status
    const statusCount = await Payment.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalPayments / limit),
          totalItems: totalPayments,
          itemsPerPage: parseInt(limit),
        },
        summary: {
          totalRevenue,
          totalOrders,
          statusCount: statusCount.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
