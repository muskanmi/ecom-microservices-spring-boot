import axios from "axios";

const API_URL = "http://localhost:8083/api/cart";

export const addToCart = (data, token, userId) => {
  return axios.post(
    `${API_URL}/items`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-User-Id": userId,
      },
    }
  );
};