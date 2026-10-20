const API_URL = import.meta.env.VITE_API_URL;

function getAuthHeaders(token) {
  if (!token) {
    throw new Error("Admin session not found. Please sign in again.");
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

async function parseResponse(response, fallbackMessage) {
  const data = await response.json().catch(() => null);

  if (response.status === 401 || response.status === 403) {
    throw new Error("Admin access denied. Please sign in again.");
  }

  if (!response.ok) {
    throw new Error(data?.message || fallbackMessage);
  }

  return data;
}

export async function getAllSellers(token) {
  const response = await fetch(`${API_URL}/api/admin/sellers`, {
    method: "GET",
    headers: getAuthHeaders(token),
  });

  const data = await parseResponse(response, "Failed to load sellers.");

  if (!Array.isArray(data)) {
    throw new Error("Unexpected response received from the seller API.");
  }

  return data;
}

export async function updateSellerApproval(token, sellerProfileId, status) {
  const response = await fetch(
    `${API_URL}/api/admin/sellers/${sellerProfileId}/approval`,
    {
      method: "PUT",
      headers: getAuthHeaders(token),
      body: JSON.stringify({ status }),
    },
  );

  return parseResponse(response, `Failed to set seller status to ${status}.`);
}
