const express = require("express");
const paymentController = require("../controllers/paymentController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

const router = express.Router();

// VNPay callback không dùng JWT
router.get("/vnpay-return", paymentController.vnpayReturn);
router.get("/vnpay-ipn", paymentController.vnpayIpn);

// API user
router.post("/create", protect, paymentController.createPayment);
router.post("/checkout-cart", protect, paymentController.checkoutCart);
router.get("/my-payments", protect, paymentController.getMyPayments);
router.get(
  "/instructor-orders",
  protect,
  paymentController.getInstructorOrders,
);

router.get(
  "/admin/all",
  protect,
  restrictTo("instructor", "admin"),
  paymentController.getAllPayments,
);
router.get("/:txnRef/status", protect, paymentController.getPaymentStatus);
module.exports = router;
