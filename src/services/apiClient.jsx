// src/services/apiClient.js
import { API_BASE_URL } from "../constants/config";

const getSessionId = () => {
  const sessionId = localStorage.getItem("sessionId");
  if (process.env.NODE_ENV === "development") {
    console.log(
      "apiClient: getSessionId() returning:",
      sessionId ? `${sessionId.substring(0, 10)}...` : null
    );
  }
  return sessionId;
};

const getKoreanErrorMessage = (status) => {
  switch (status) {
    case 400:
      return "잘못된 요청입니다.";
    case 401:
      return "인증되지 않은 사용자입니다.";
    case 403:
      return "접근 권한이 없습니다.";
    case 404:
      return "요청한 리소스를 찾을 수 없습니다.";
    case 409:
      return "충돌이 발생했습니다.";
    case 422:
      return "입력 데이터에 오류가 있습니다.";
    case 500:
      return "서버 내부 오류가 발생했습니다. 관리자에게 문의해주세요.";
    case 502:
      return "서버 연결에 문제가 있습니다.";
    case 503:
      return "서비스를 일시적으로 사용할 수 없습니다.";
    default:
      return `API 오류가 발생했습니다 (${status}).`;
  }
};

const handleResponse = async (response) => {
  if (!response.ok) {
    let errorMessage = getKoreanErrorMessage(response.status);
    let errorDetails = null;

    try {
      const errorData = await response.json();
      // 서버에서 제공하는 한국어 메시지가 있으면 우선 사용
      errorMessage = errorData.message || errorData.error || errorMessage;

      if (errorData.errors && Array.isArray(errorData.errors)) {
        // Collecting specific field errors if available
        errorDetails = errorData.errors
          .map((e) => `${e.field}: ${e.defaultMessage || e.reason}`)
          .join(", ");
        errorMessage += ` 상세: ${errorDetails}`;
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

    // 401 오류 시 세션 정리 (자동 로그아웃) - 하지만 즉시 리다이렉트는 하지 않음
    if (response.status === 401) {
      console.warn("apiClient: 401 Unauthorized - clearing session data");
      localStorage.removeItem("sessionId");
      localStorage.removeItem("sessionExpiresAt");
      localStorage.removeItem("userData");
      localStorage.removeItem("adminData");

      // 쿠키도 정리
      document.cookie =
        "sessionId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      // 즉시 리다이렉트하지 않고 에러를 throw하여 컴포넌트에서 처리하도록 함
      console.warn(
        "apiClient: Session cleared, component should handle the error"
      );
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
    const sessionId = getSessionId();
    const headers = {
      // 'Content-Type': 'application/json', // Not needed for GET usually
    };

    // 여러 인증 방식으로 헤더 설정
    if (sessionId) {
      // 1. Authorization Bearer 헤더 (가장 일반적)
      headers["Authorization"] = `Bearer ${sessionId}`;
      // 2. 커스텀 sessionId 헤더 (기존 방식 유지)
      headers["sessionId"] = sessionId;
      // 3. X-Session-ID 헤더 (일부 백엔드에서 사용)
      headers["X-Session-ID"] = sessionId;
    } else {
      console.warn("apiClient GET: No sessionId found for endpoint:", endpoint);
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

    console.log("apiClient GET:", {
      url: url,
      headers: headers,
      hasSessionId: !!sessionId,
    });

    const response = await fetch(url, {
      method: "GET",
      headers,
      credentials: "include", // 쿠키 포함
    });

    console.log("apiClient GET response:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      url: url,
    });

    return handleResponse(response);
  },

  post: async (endpoint, data, isFormData = false) => {
    const sessionId = getSessionId();
    const headers = {};

    // 여러 인증 방식으로 헤더 설정
    if (sessionId) {
      // 1. Authorization Bearer 헤더 (가장 일반적)
      headers["Authorization"] = `Bearer ${sessionId}`;
      // 2. 커스텀 sessionId 헤더 (기존 방식 유지)
      headers["sessionId"] = sessionId;
      // 3. X-Session-ID 헤더 (일부 백엔드에서 사용)
      headers["X-Session-ID"] = sessionId;
    }

    let body;
    if (isFormData) {
      // For FormData, Content-Type is set automatically by browser with boundary
      body = data; // data is expected to be a FormData object
    } else {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(data);
    }

    console.log("apiClient POST:", {
      url: `${API_BASE_URL}${endpoint}`,
      headers: headers,
      data: data,
      isFormData: isFormData,
      bodyPreview: isFormData ? "[FormData]" : body,
    });

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers,
      body,
      credentials: "include", // 쿠키 포함
    });

    console.log("apiClient POST response:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      url: `${API_BASE_URL}${endpoint}`,
    });

    return handleResponse(response);
  },

  put: async (endpoint, data, isFormData = false) => {
    const sessionId = getSessionId();
    const headers = {};

    // 여러 인증 방식으로 헤더 설정
    if (sessionId) {
      // 1. Authorization Bearer 헤더 (가장 일반적)
      headers["Authorization"] = `Bearer ${sessionId}`;
      // 2. 커스텀 sessionId 헤더 (기존 방식 유지)
      headers["sessionId"] = sessionId;
      // 3. X-Session-ID 헤더 (일부 백엔드에서 사용)
      headers["X-Session-ID"] = sessionId;
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
      credentials: "include", // 쿠키 포함
    });
    return handleResponse(response);
  },

  delete: async (endpoint, data = null) => {
    // DELETE can sometimes have a body for multiple deletions, though rare
    const sessionId = getSessionId();
    const headers = {
      // 'Content-Type': 'application/json', // Only if body is present and JSON
    };

    // 여러 인증 방식으로 헤더 설정
    if (sessionId) {
      // 1. Authorization Bearer 헤더 (가장 일반적)
      headers["Authorization"] = `Bearer ${sessionId}`;
      // 2. 커스텀 sessionId 헤더 (기존 방식 유지)
      headers["sessionId"] = sessionId;
      // 3. X-Session-ID 헤더 (일부 백엔드에서 사용)
      headers["X-Session-ID"] = sessionId;
    }

    const config = {
      method: "DELETE",
      headers,
      credentials: "include", // 쿠키 포함
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
