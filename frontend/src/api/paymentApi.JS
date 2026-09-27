import axios from "axios";

const API_URL = "http://localhost:8085/api/payments";

export const createCheckoutSession = (
    orderId,
    token,
    userId
) =>
    axios.post(
        `${API_URL}/checkout-session/${orderId}`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "X-User-Id": userId
            }
        }
    );