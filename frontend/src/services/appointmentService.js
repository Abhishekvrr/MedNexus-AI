import API_BASE_URL from "../config/api";

const getToken = () => {
  return localStorage.getItem("token");
};

const request = async (url, options = {}) => {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    throw new Error("Session expired");
  }

  if (!response.ok || data.success === false) {
    throw new Error(
      data.message || "Something went wrong"
    );
  }

  return data;
};

export const getAppointments = async () => {
  return request(`${API_BASE_URL}/api/appointments`);
};

export const updateAppointmentStatus = async (
  appointmentId,
  action
) => {
  return request(
    `${API_BASE_URL}/api/appointments/${appointmentId}/${action}`,
    {
      method: "PUT",
    }
  );
};