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

export const getCart = (token, userId) => {
  return axios.get(
    API_URL,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-User-Id": userId,
      }
    }
  )
}

export const getCartDetails = (token, userId) => {
  return axios.get(
    `${API_URL}/details`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-User-Id": userId,
      },
    }
  );
};