const API_URL = "http://localhost:8081";

async function handleResponse(response, fallbackMessage) {
  const data = await response.json().catch(() => null);

  if (response.status === 401 || response.status === 403) {
    throw new Error("Admin access denied. Please sign in again.");
  }

  if (!response.ok) {
    throw new Error(data?.message || fallbackMessage);
  }

  return data;
}

export async function getAllOrders(token) {
  if (!token) {
    throw new Error("Admin session not found. Please sign in again.");
  }

  const response = await fetch(`${API_URL}/api/admin/orders`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await handleResponse(
    response,
    "Failed to load marketplace orders.",
  );

  if (!Array.isArray(data)) {
    throw new Error("Unexpected response from the orders API.");
  }

  return data;
}

export async function getOrderById(token, orderId) {
  if (!token) {
    throw new Error("Admin session not found. Please sign in again.");
  }

  if (!orderId || !Number.isSafeInteger(Number(orderId))) {
    throw new Error("A valid order ID is required.");
  }

  const response = await fetch(
    `${API_URL}/api/admin/orders/${encodeURIComponent(orderId)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await handleResponse(response, "Failed to load order details.");

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Unexpected response from the order details API.");
  }

  return data;
}

export async function updateOrderStatus(token, orderId, status) {
  if (!token) {
    throw new Error("Admin session not found. Please sign in again.");
  }

  if (!orderId || !status) {
    throw new Error("Order ID and status are required.");
  }

  const response = await fetch(
    `${API_URL}/api/admin/orders/${orderId}/status`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    },
  );

  return handleResponse(response);
}

export async function updateShippingInfo(token, orderId, shippingInfo) {
  if (!token) {
    throw new Error("Admin session not found. Please sign in again.");
  }

  if (!orderId) {
    throw new Error("Order ID is required.");
  }

  const response = await fetch(
    `${API_URL}/api/admin/orders/${orderId}/shipping`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        carrier: shippingInfo.carrier.trim(),
        trackingNumber: shippingInfo.trackingNumber.trim(),
        expectedDeliveryDate: shippingInfo.expectedDeliveryDate,
      }),
    },
  );

  return handleResponse(response);
}
