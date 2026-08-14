// ============================================================
// MEDNEXUS AI - API SERVICE
// ============================================================

const API_BASE_URL = "http://localhost:5000/api";

// ============================================================
// GET AUTH TOKEN
// ============================================================

const getToken = () => {
  return localStorage.getItem("token");
};

// ============================================================
// API REQUEST
// ============================================================

export const apiRequest = async (
  endpoint,
  options = {}
) => {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  // Add JWT token automatically
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  // ==========================================================
  // HANDLE EMPTY RESPONSE
  // ==========================================================

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  // ==========================================================
  // TOKEN EXPIRED / UNAUTHORIZED
  // ==========================================================

  if (response.status === 401) {
    console.warn("Authentication expired or invalid.");

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";

    throw new Error(
      "Your session has expired. Please login again."
    );
  }

  // ==========================================================
  // OTHER API ERRORS
  // ==========================================================

  if (!response.ok) {
    throw new Error(
      data?.message ||
      `Request failed with status ${response.status}`
    );
  }

  return data;
};

// ============================================================
// GET
// ============================================================

export const apiGet = async (endpoint) => {
  return apiRequest(endpoint, {
    method: "GET",
  });
};

// ============================================================
// POST
// ============================================================

export const apiPost = async (
  endpoint,
  body
) => {
  return apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  });
};

// ============================================================
// PUT
// ============================================================

export const apiPut = async (
  endpoint,
  body
) => {
  return apiRequest(endpoint, {
    method: "PUT",
    body: JSON.stringify(body),
  });
};

// ============================================================
// DELETE
// ============================================================

export const apiDelete = async (endpoint) => {
  return apiRequest(endpoint, {
    method: "DELETE",
  });
};

// ============================================================
// EXPORT BASE URL
// ============================================================

export default API_BASE_URL;