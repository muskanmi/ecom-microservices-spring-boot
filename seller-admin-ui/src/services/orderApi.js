import api from "./api";

export const getOrders = () => {
  return api.get("/api/seller/orders");
};

export const getOrder = (orderId) => {
  return api.get(`/api/seller/orders/${orderId}`);
};

export const updateShippingInfo = (orderId, shippingData) => {
  return api.put(`/api/seller/orders/${orderId}/shipping`, shippingData);
};

export const updateOrderStatus = (orderId, status) => {
  return api.put(`/api/seller/orders/${orderId}/status`, {
    status,
  });
};

export const updatePaymentStatus = (orderId, paymentStatus) =>
  api.put(`/api/seller/orders/${orderId}/payment-status`, {
    paymentStatus,
  });
