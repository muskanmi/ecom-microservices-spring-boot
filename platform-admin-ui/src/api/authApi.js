const API_URL = "http://localhost:8081";

export async function loginAdmin(credentials) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Login failed. Check your credentials.");
  }

  if (data.role !== "ADMIN" || !data.token) {
    throw new Error("Access denied. An Admin account is required.");
  }

  const dashboardResponse = await fetch(`${API_URL}/api/admin/dashboard`, {
    headers: {
      Authorization: `Bearer ${data.token}`,
    },
  });

  if (!dashboardResponse.ok) {
    throw new Error("Admin verification failed. Please try again.");
  }

  return data;
}

export function logoutAdmin() {
  sessionStorage.removeItem("adminToken");
  sessionStorage.removeItem("adminUserId");
  sessionStorage.removeItem("adminRole");
}
