import axiosClient from "./axiosClient";

const paymentApi = {
  createPayment: (data) => axiosClient.post("/payments/create", data),
  getPaymentStatus: (txnRef) => axiosClient.get(`/payments/${txnRef}/status`),
};

export default paymentApi;
