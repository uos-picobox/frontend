// src/services/authService.js
import apiClient from "./apiClient";
import { API_ENDPOINTS_USER, API_ENDPOINTS_ADMIN } from "../constants/config";

/**
 * User Signup
 * @param {SignupRequestDto} signupData
 * @returns {Promise<any>}
 */
export const signup = async (signupData) => {
  return apiClient.post(API_ENDPOINTS_USER.SIGNUP, signupData);
};

/**
 * Request Email Verification Code
 * @param {{email: string, purpose: string}} mailRequestData
 * @returns {Promise<any>}
 */
export const requestAuthMail = async (mailRequestData) => {
  return apiClient.post(
    API_ENDPOINTS_USER.SIGNUP_REQUEST_EMAIL_VERIFICATION,
    mailRequestData
  );
};

/**
 * Verify Email Auth Code
 * @param {{email: string, code: string}} authMailData
 * @returns {Promise<any>}
 */
export const verifyAuthMail = async (authMailData) => {
  return apiClient.post(
    API_ENDPOINTS_USER.SIGNUP_AUTH_EMAIL_CODE,
    authMailData
  );
};

/**
 * Check if Login ID is duplicate
 * @param {string} loginId
 * @returns {Promise<any>}
 */
export const checkLoginIdAvailability = async (loginId) => {
  return apiClient.get(API_ENDPOINTS_USER.SIGNUP_CHECK_LOGINID(loginId));
};

/**
 * Check if Email is duplicate
 * @param {string} email
 * @returns {Promise<any>}
 */
export const checkEmailAvailability = async (email) => {
  return apiClient.get(API_ENDPOINTS_USER.SIGNUP_CHECK_EMAIL(email));
};

/**
 * Login a user.
 * @param {{ loginId, password }} credentials
 * @returns {Promise<{token: string, user: object}>}
 */
export const login = async (credentials) => {
  try {
    const response = await apiClient.post(
      API_ENDPOINTS_USER.LOGIN,
      credentials
    );
    if (response && response.token) {
      localStorage.setItem("authToken", response.token);
      if (response.user)
        localStorage.setItem("userData", JSON.stringify(response.user));
    }
    return response;
  } catch (error) {
    console.error("Login error in authService:", error);
    throw error;
  }
};

/**
 * Login an admin.
 * @param {{ username, password }} credentials
 * @returns {Promise<{token: string, user: object}>}
 */
export const adminLogin = async (credentials) => {
  try {
    // 관리자 로그인 엔드포인트가 별도로 없다면, 일반 로그인 사용 또는 config에 정의된 ADMIN_LOGIN 사용
    const loginEndpoint =
      API_ENDPOINTS_ADMIN.ADMIN_LOGIN || API_ENDPOINTS_USER.LOGIN; // config.js에 ADMIN_LOGIN 추가 필요
    const response = await apiClient.post(loginEndpoint, credentials);
    if (response && response.token) {
      localStorage.setItem("authToken", response.token);
      if (
        response.user &&
        (response.user.isAdmin || response.user.roles?.includes("ROLE_ADMIN"))
      ) {
        localStorage.setItem("adminData", JSON.stringify(response.user));
      } else if (response.user) {
        localStorage.setItem("userData", JSON.stringify(response.user));
      }
    }
    return response;
  } catch (error) {
    console.error("Admin login error in authService:", error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userData");
  localStorage.removeItem("adminData");
};
