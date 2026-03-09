const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    itemType: { type: String, enum: ["course", "combo", "cart"], required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
    amount: { type: Number, required: true, min: 0 },
    txnRef: { type: String, required: true, unique: true },
    orderInfo: { type: String },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "cancelled"],
      default: "pending",
    },
    provider: { type: String, default: "vnpay" },
    vnpTransactionNo: { type: String },
    vnpBankTranNo: { type: String },
    paidAt: { type: Date },
    rawReturn: { type: Object },
    rawIpn: { type: Object },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Payment", paymentSchema);
