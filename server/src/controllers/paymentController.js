const crypto = require("crypto");
const dayjs = require("dayjs");
const Payment = require("../models/Payment");
const Course = require("../models/Course");
const Combo = require("../models/Combo");
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

const buildSignData = (params) => {
  const sorted = sortObject(params);
  return Object.entries(sorted)
    .map(([k, v]) => `${k}=${encodeURIComponent(v).replace(/%20/g, "+")}`)
    .join("&");
};

const sign = (data) =>
  crypto
    .createHmac("sha512", vnpConfig.hashSecret)
    .update(Buffer.from(data, "utf-8"))
    .digest("hex");

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

  const signData = buildSignData(params);
  const secureHash = sign(signData);
  const query = `${signData}&vnp_SecureHash=${secureHash}`;

  return `${vnpConfig.vnpUrl}?${query}`;
};

const verifyVnpay = (query) => {
  const cloned = { ...query };
  const secureHash = cloned.vnp_SecureHash;
  delete cloned.vnp_SecureHash;
  delete cloned.vnp_SecureHashType;

  const signData = buildSignData(cloned);
  const expected = sign(signData);

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

    if (itemType === "course") {
      item = await ensureCoursePublished(itemId);
      amount = item.price || 0;
      title = item.title;
    } else {
      item = await ensureComboPublished(itemId);
      amount = item.price || 0;
      title = item.title;
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
    const orderInfo = `${itemType}:${itemId}:${userId}`;

    await Payment.create({
      user: userId,
      itemType,
      itemId,
      amount,
      txnRef,
      orderInfo,
      status: "pending",
      provider: "vnpay",
    });

    const paymentUrl = buildPaymentUrl({
      amount,
      txnRef,
      orderInfo,
      ipAddr: getClientIp(req),
    });

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

exports.vnpayReturn = async (req, res) => {
  try {
    const isValid = verifyVnpay(req.query);
    const txnRef = req.query.vnp_TxnRef || "";
    const responseCode = req.query.vnp_ResponseCode || "";

    // Redirect helper
    const redirectToClient = (extra = "") =>
      `${clientUrl}/payment-result?txnRef=${encodeURIComponent(txnRef)}&code=${encodeURIComponent(responseCode)}&valid=${isValid ? "1" : "0"}${extra}`;

    if (!isValid) {
      return res.redirect(redirectToClient("&status=failed"));
    }

    const payment = txnRef ? await Payment.findOne({ txnRef }) : null;

    if (payment) {
      payment.rawReturn = req.query;

      // Fallback xử lý thành công ngay tại return nếu IPN chưa tới
      if (responseCode === "00" && payment.status === "pending") {
        if (payment.itemType === "course") {
          await grantCourseAccess(payment.user, payment.itemId);
        } else {
          await grantComboAccess(payment.user, payment.itemId);
        }

        payment.status = "paid";
        payment.paidAt = new Date();
        payment.vnpTransactionNo = req.query.vnp_TransactionNo;
        payment.vnpBankTranNo = req.query.vnp_BankTranNo;
      } else if (responseCode !== "00" && payment.status === "pending") {
        payment.status = "failed";
      }

      await payment.save();
    }

    return res.redirect(redirectToClient());
  } catch (error) {
    return res.redirect(`${clientUrl}/payment-result?error=1`);
  }
};

exports.vnpayIpn = async (req, res) => {
  try {
    const isValid = verifyVnpay(req.query);
    if (!isValid) {
      return res
        .status(200)
        .json({ RspCode: "97", Message: "Invalid checksum" });
    }

    const txnRef = req.query.vnp_TxnRef;
    const responseCode = req.query.vnp_ResponseCode;
    const transactionNo = req.query.vnp_TransactionNo;
    const bankTranNo = req.query.vnp_BankTranNo;
    const amountFromVnp = Number(req.query.vnp_Amount || 0) / 100;

    const payment = await Payment.findOne({ txnRef });
    if (!payment) {
      return res
        .status(200)
        .json({ RspCode: "01", Message: "Order not found" });
    }

    // Idempotent: đã paid rồi thì trả OK luôn
    if (payment.status === "paid") {
      return res
        .status(200)
        .json({ RspCode: "00", Message: "Confirm Success" });
    }

    // Check amount
    if (Number(payment.amount) !== Number(amountFromVnp)) {
      payment.status = "failed";
      payment.rawIpn = req.query;
      await payment.save();
      return res.status(200).json({ RspCode: "04", Message: "Invalid amount" });
    }

    if (responseCode === "00") {
      if (payment.itemType === "course") {
        await grantCourseAccess(payment.user, payment.itemId);
      } else {
        await grantComboAccess(payment.user, payment.itemId);
      }

      payment.status = "paid";
      payment.paidAt = new Date();
      payment.vnpTransactionNo = transactionNo;
      payment.vnpBankTranNo = bankTranNo;
      payment.rawIpn = req.query;
      await payment.save();

      return res
        .status(200)
        .json({ RspCode: "00", Message: "Confirm Success" });
    }

    payment.status = "failed";
    payment.rawIpn = req.query;
    await payment.save();

    return res.status(200).json({ RspCode: "00", Message: "Confirm Success" });
  } catch (error) {
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

    return res.json({
      success: true,
      data: {
        txnRef: payment.txnRef,
        status: payment.status,
        itemType: payment.itemType,
        itemId: payment.itemId,
        amount: payment.amount,
        paidAt: payment.paidAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
