import apiClient from "./apiClient";
import { API_ENDPOINTS_ADMIN } from "../constants/config";

// 전체 회원 목록 조회
export const getAllCustomers = async (
  sort = "registeredAt",
  isActive = null
) => {
  try {
    const params = { sort: sort };
    if (isActive !== null) {
      params.isActive = isActive;
    }

    console.log("adminCustomerService: getAllCustomers called with:", {
      sort,
      isActive,
    });

    const response = await apiClient.get(
      API_ENDPOINTS_ADMIN.ADMIN_CUSTOMERS_GET_ALL,
      params
    );

    console.log("adminCustomerService: getAllCustomers response:", response);

    // 안전한 응답 처리
    if (response === null || response === undefined) {
      console.log(
        "adminCustomerService: API returned null/undefined - returning empty array"
      );
      return [];
    }

    if (
      typeof response === "object" &&
      response !== null &&
      response.hasOwnProperty("data")
    ) {
      return response.data || [];
    }

    if (Array.isArray(response)) {
      return response;
    }

    return [];
  } catch (error) {
    console.error("Error fetching all customers:", error);
    throw error;
  }
};

// 회원 상세 정보 조회
export const getCustomerById = async (customerId) => {
  try {
    console.log(
      "adminCustomerService: getCustomerById called with:",
      customerId
    );

    const response = await apiClient.get(
      API_ENDPOINTS_ADMIN.ADMIN_CUSTOMER_GET_BY_ID(customerId)
    );

    console.log("adminCustomerService: getCustomerById response:", response);

    // 안전한 응답 처리
    if (response === null || response === undefined) {
      console.log(
        "adminCustomerService: API returned null/undefined - returning null"
      );
      return null;
    }

    if (
      typeof response === "object" &&
      response !== null &&
      response.hasOwnProperty("data")
    ) {
      return response.data;
    }

    return response;
  } catch (error) {
    console.error(`Error fetching customer ${customerId}:`, error);
    throw error;
  }
};

// 이름으로 회원 검색
export const searchCustomersByName = async (name) => {
  try {
    console.log(
      "adminCustomerService: searchCustomersByName called with:",
      name
    );

    const response = await apiClient.get(
      API_ENDPOINTS_ADMIN.ADMIN_CUSTOMERS_SEARCH_BY_NAME,
      {
        name: name,
      }
    );

    console.log(
      "adminCustomerService: searchCustomersByName response:",
      response
    );

    // 안전한 응답 처리
    if (response === null || response === undefined) {
      console.log(
        "adminCustomerService: API returned null/undefined - returning empty array"
      );
      return [];
    }

    if (
      typeof response === "object" &&
      response !== null &&
      response.hasOwnProperty("data")
    ) {
      return response.data || [];
    }

    if (Array.isArray(response)) {
      return response;
    }

    return [];
  } catch (error) {
    console.error(`Error searching customers by name ${name}:`, error);
    throw error;
  }
};

// 로그인 ID로 회원 검색
export const searchCustomersByLoginId = async (loginId) => {
  try {
    console.log(
      "adminCustomerService: searchCustomersByLoginId called with:",
      loginId
    );

    const response = await apiClient.get(
      API_ENDPOINTS_ADMIN.ADMIN_CUSTOMERS_SEARCH_BY_LOGIN_ID,
      {
        loginId: loginId,
      }
    );

    console.log(
      "adminCustomerService: searchCustomersByLoginId response:",
      response
    );

    // 안전한 응답 처리
    if (response === null || response === undefined) {
      console.log(
        "adminCustomerService: API returned null/undefined - returning empty array"
      );
      return [];
    }

    if (
      typeof response === "object" &&
      response !== null &&
      response.hasOwnProperty("data")
    ) {
      return response.data || [];
    }

    if (Array.isArray(response)) {
      return response;
    }

    return [];
  } catch (error) {
    console.error(`Error searching customers by loginId ${loginId}:`, error);
    throw error;
  }
};

// 이메일로 회원 검색
export const searchCustomersByEmail = async (email) => {
  try {
    console.log(
      "adminCustomerService: searchCustomersByEmail called with:",
      email
    );

    const response = await apiClient.get(
      API_ENDPOINTS_ADMIN.ADMIN_CUSTOMERS_SEARCH_BY_EMAIL,
      {
        email: email,
      }
    );

    console.log(
      "adminCustomerService: searchCustomersByEmail response:",
      response
    );

    // 안전한 응답 처리
    if (response === null || response === undefined) {
      console.log(
        "adminCustomerService: API returned null/undefined - returning empty array"
      );
      return [];
    }

    if (
      typeof response === "object" &&
      response !== null &&
      response.hasOwnProperty("data")
    ) {
      return response.data || [];
    }

    if (Array.isArray(response)) {
      return response;
    }

    return [];
  } catch (error) {
    console.error(`Error searching customers by email ${email}:`, error);
    throw error;
  }
};

// 회원 상태 변경
export const updateCustomerStatus = async (customerId, statusData) => {
  try {
    console.log(
      "adminCustomerService: updateCustomerStatus called with:",
      customerId,
      statusData
    );

    const response = await apiClient.patch(
      API_ENDPOINTS_ADMIN.ADMIN_CUSTOMER_STATUS_UPDATE(customerId),
      statusData
    );

    console.log(
      "adminCustomerService: updateCustomerStatus response:",
      response
    );
    console.log("adminCustomerService: response type:", typeof response);
    console.log("adminCustomerService: response === null:", response === null);
    console.log(
      "adminCustomerService: response === undefined:",
      response === undefined
    );

    // API 응답이 null이거나 빈 응답인 경우 성공으로 처리
    // 고객 상태 변경 API는 성공 시 빈 응답(204 No Content)을 보낼 수 있음
    if (response === null || response === undefined) {
      console.log(
        "adminCustomerService: API returned null/undefined - treating as success"
      );
      return { success: true };
    }

    // response가 객체이고 data 속성이 있는 경우
    if (
      typeof response === "object" &&
      response !== null &&
      response.hasOwnProperty("data")
    ) {
      console.log(
        "adminCustomerService: returning response.data:",
        response.data
      );
      return response.data;
    }

    // response 자체가 데이터인 경우
    console.log("adminCustomerService: returning response directly:", response);
    return response;
  } catch (error) {
    console.error(`Error updating customer ${customerId} status:`, error);
    console.error("Error details:", {
      message: error.message,
      status: error.status,
      details: error.details,
    });
    throw error;
  }
};
