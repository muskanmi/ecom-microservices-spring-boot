import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/payments`;

export const createCheckoutSession = (orderId, token, userId) =>
  axios.post(
    `${API_URL}/checkout-session/${orderId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-User-Id": userId,
      },
    },
  );
