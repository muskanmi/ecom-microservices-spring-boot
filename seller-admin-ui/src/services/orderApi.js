import api from "./api";

export const getOrders = () => {
  return api.get("/api/admin/orders");
};

export const getOrder = (orderId) => {
  return api.get(`/api/admin/orders/${orderId}`);
};

export const updateShippingInfo = (orderId, shippingData) => {
  return api.put(`/api/admin/orders/${orderId}/shipping`, shippingData);
};

export const updateOrderStatus = (orderId, status) => {
  return api.put(`/api/admin/orders/${orderId}/status`, {
    status,
  });
};

export const updatePaymentStatus = (orderId, paymentStatus) =>
  api.put(`/api/admin/orders/${orderId}/payment-status`, {
    paymentStatus,
  });
