import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/orders`;

export const validateCoupon = (code, subtotal, token, userId) =>
  axios.post(
    `${API_URL}/coupons/validate`,
    {
      code,
      subtotal,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-User-Id": userId,
        "Content-Type": "application/json",
      },
    },
  );
