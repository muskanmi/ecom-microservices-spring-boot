export const addToCart = (data, token) => {
  return axios.post(
    "http://localhost:8083/api/cart/items",
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};