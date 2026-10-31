import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/orders`;

const getHeaders = (token, userId) => ({
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
  ...(userId ? { "X-User-Id": userId } : {}),
});

export const validateCoupon = (code, subtotal, token, userId) =>
  axios.post(
    `${API_URL}/coupons/validate`,
    { code, subtotal },
    {
      headers: {
        ...getHeaders(token, userId),
        "Content-Type": "application/json",
      },
    },
  );

export const getAvailableCouponCount = (token, userId) =>
  axios.get(`${API_URL}/coupons/available/count`, {
    headers: getHeaders(token, userId),
  });

export const getAvailableCoupons = (token, userId) =>
  axios.get(`${API_URL}/coupons/available`, {
    headers: getHeaders(token, userId),
  });
