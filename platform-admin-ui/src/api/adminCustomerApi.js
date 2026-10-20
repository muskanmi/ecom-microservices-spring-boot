const API_URL = import.meta.env.VITE_API_URL;

export async function getAllCustomers(token) {
  if (!token) {
    throw new Error("Admin session not found. Please sign in again.");
  }

  const response = await fetch(`${API_URL}/api/admin/customers`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => null);

  if (response.status === 401 || response.status === 403) {
    throw new Error("Admin access denied. Please sign in again.");
  }

  if (!response.ok) {
    throw new Error(data?.message || "Failed to load customers.");
  }

  if (!Array.isArray(data)) {
    throw new Error("Unexpected response from the customer API.");
  }

  return data;
}
