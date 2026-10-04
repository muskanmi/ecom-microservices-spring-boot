import axios from "axios";

const API_URL = "http://localhost:8083/api/orders";

export const createOrder = (orderData, token, userId) =>
    axios.post(
        API_URL,
        orderData,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "X-User-Id": userId,
                "Content-Type": "application/json"
            }
        }
    );

export const getOrders = (token, userId) =>
    axios.get(
        API_URL,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "X-User-Id": userId
            }
        }
    );

export const getOrderById = (orderId, token, userId) =>
    axios.get(
        `${API_URL}/${orderId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "X-User-Id": userId
            }
        }
    );

export const cancelOrder = (orderId, token, userId) => {
    return axios.post(
        `${API_URL}/${orderId}/cancel`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "X-User-Id": userId,
                "Content-Type": "application/json"
            }
        }
    );
};