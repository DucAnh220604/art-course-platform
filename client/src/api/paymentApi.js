import axiosClient from "./axiosClient";

const paymentApi = {
  createPayment: (data) => axiosClient.post("/payments/create", data),
  checkoutCart: () => axiosClient.post("/payments/checkout-cart"),
  getPaymentStatus: (txnRef) => axiosClient.get(`/payments/${txnRef}/status`),
  getMyPayments: () => axiosClient.get("/payments/my-payments"),
};

export default paymentApi;
