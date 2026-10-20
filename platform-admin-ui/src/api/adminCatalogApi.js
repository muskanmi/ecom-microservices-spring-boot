const API_URL = import.meta.env.VITE_API_URL;
export const CATALOG_URL = import.meta.env.VITE_API_URL;

async function parseResponse(response) {
  return response.json().catch(() => null);
}

function handleError(response, data, fallbackMessage) {
  if (response.status === 401 || response.status === 403) {
    throw new Error("Admin access denied. Please sign in again.");
  }

  if (!response.ok) {
    throw new Error(data?.message || fallbackMessage);
  }
}

export async function getAllCatalogProducts(token) {
  if (!token) {
    throw new Error("Admin session not found. Please sign in again.");
  }

  const response = await fetch(`${API_URL}/api/admin/catalog/products`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await parseResponse(response);

  handleError(response, data, "Failed to load catalog products.");

  if (!Array.isArray(data)) {
    throw new Error("Unexpected response from the catalog API.");
  }

  return data;
}

export async function updateCatalogProductActivation(productId, active, token) {
  if (!token) {
    throw new Error("Admin session not found. Please sign in again.");
  }

  if (productId == null) {
    throw new Error("Product ID is required.");
  }

  const response = await fetch(
    `${API_URL}/api/admin/catalog/products/${productId}/activation?active=${active}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await parseResponse(response);

  handleError(
    response,
    data,
    `Failed to ${active ? "activate" : "deactivate"} product.`,
  );

  return data;
}
