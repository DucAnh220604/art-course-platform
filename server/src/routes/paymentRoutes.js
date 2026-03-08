const express = require("express");
const paymentController = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// VNPay callback không dùng JWT
router.get("/vnpay-return", paymentController.vnpayReturn);
router.get("/vnpay-ipn", paymentController.vnpayIpn);

// API user
router.post("/create", protect, paymentController.createPayment);
router.post("/checkout-cart", protect, paymentController.checkoutCart);
router.get("/:txnRef/status", protect, paymentController.getPaymentStatus);

module.exports = router;
