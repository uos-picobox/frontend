// src/services/apiClient.js
import { API_BASE_URL } from "../constants/config";

const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

const handleResponse = async (response) => {
  if (!response.ok) {
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    let errorDetails = null;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
      if (errorData.errors && Array.isArray(errorData.errors)) {
        // Collecting specific field errors if available
        errorDetails = errorData.errors
          .map((e) => `${e.field}: ${e.defaultMessage || e.reason}`)
          .join(", ");
        errorMessage += ` Details: ${errorDetails}`;
      }
      // If errorData itself is the detail (e.g. for Spring validation errors)
      if (
        typeof errorData === "object" &&
        !errorData.message &&
        !errorData.error &&
        Object.keys(errorData).length > 0
      ) {
        errorDetails = JSON.stringify(errorData);
      }
    } catch (e) {
      // Ignore if response body is not JSON or empty
    }
    const error = new Error(errorMessage);
    error.status = response.status;
    error.details = errorDetails; // Attach more details if parsed
    throw error;
  }
  if (response.status === 204) {
    // No Content
    return null;
  }
  // Check if response is JSON before trying to parse
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return response.json();
  } else {
    return response.text(); // Or handle as blob, etc., if needed
  }
};

const apiClient = {
  get: async (endpoint, params = null) => {
    const token = getAuthToken();
    const headers = {
      // 'Content-Type': 'application/json', // Not needed for GET usually
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    let url = `${API_BASE_URL}${endpoint}`;
    if (params) {
      const queryParams = new URLSearchParams();
      for (const key in params) {
        if (params[key] !== undefined && params[key] !== null) {
          // Ensure only defined values are appended
          queryParams.append(key, params[key]);
        }
      }
      if (queryParams.toString()) {
        url = `${url}?${queryParams.toString()}`;
      }
    }

    const response = await fetch(url, { method: "GET", headers });
    return handleResponse(response);
  },

  post: async (endpoint, data, isFormData = false) => {
    const token = getAuthToken();
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    let body;
    if (isFormData) {
      // For FormData, Content-Type is set automatically by browser with boundary
      body = data; // data is expected to be a FormData object
    } else {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers,
      body,
    });
    return handleResponse(response);
  },

  put: async (endpoint, data, isFormData = false) => {
    const token = getAuthToken();
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    let body;
    if (isFormData) {
      body = data; // data is FormData
    } else {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers,
      body,
    });
    return handleResponse(response);
  },

  delete: async (endpoint, data = null) => {
    // DELETE can sometimes have a body for multiple deletions, though rare
    const token = getAuthToken();
    const headers = {
      // 'Content-Type': 'application/json', // Only if body is present and JSON
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const config = {
      method: "DELETE",
      headers,
    };

    if (data) {
      headers["Content-Type"] = "application/json";
      config.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    return handleResponse(response);
  },
};

export default apiClient;
