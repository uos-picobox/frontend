// src/services/authService.js
import apiClient from "./apiClient";
import {
  API_ENDPOINTS_CUSTOMER,
  API_ENDPOINTS_GUEST,
  API_ENDPOINTS_ADMIN_AUTH,
} from "../constants/config";

/**
 * Customer Signup
 * @param {SignupRequestDto} signupData
 * @returns {Promise<any>}
 */
export const signup = async (signupData) => {
  return apiClient.post(API_ENDPOINTS_CUSTOMER.SIGNUP, signupData);
};

/**
 * Request Email Verification Code for Customer
 * @param {{email: string, purpose: string}} mailRequestData
 * @returns {Promise<any>}
 */
export const requestAuthMail = async (mailRequestData) => {
  return apiClient.post(
    API_ENDPOINTS_CUSTOMER.SIGNUP_REQUEST_EMAIL_VERIFICATION,
    mailRequestData
  );
};

/**
 * Verify Email Auth Code for Customer
 * @param {{email: string, code: string}} authMailData
 * @returns {Promise<any>}
 */
export const verifyAuthMail = async (authMailData) => {
  return apiClient.post(
    API_ENDPOINTS_CUSTOMER.SIGNUP_AUTH_EMAIL_CODE,
    authMailData
  );
};

/**
 * Check if Login ID is duplicate for Customer
 * @param {string} loginId
 * @returns {Promise<any>}
 */
export const checkLoginIdAvailability = async (loginId) => {
  return apiClient.get(API_ENDPOINTS_CUSTOMER.SIGNUP_CHECK_LOGINID(loginId));
};

/**
 * Check if Email is duplicate for Customer
 * @param {string} email
 * @returns {Promise<any>}
 */
export const checkEmailAvailability = async (email) => {
  return apiClient.get(API_ENDPOINTS_CUSTOMER.SIGNUP_CHECK_EMAIL(email));
};

/**
 * Login a customer.
 * @param {{ loginId, password }} credentials
 * @returns {Promise<{sessionId: string, user: object}>}
 */
export const login = async (credentials) => {
  try {
    const response = await apiClient.post(
      API_ENDPOINTS_CUSTOMER.LOGIN,
      credentials
    );

    console.log("Login API response:", response);

    // 실제 API 응답 구조: { loginId, sessionId, expiresAt }
    if (response && response.sessionId && response.loginId) {
      // sessionId와 expiresAt 저장
      localStorage.setItem("sessionId", response.sessionId);
      if (response.expiresAt) {
        localStorage.setItem("sessionExpiresAt", response.expiresAt);
      }

      // 쿠키에도 sessionId 저장 (백엔드가 쿠키 기반 인증을 사용할 수 있음)
      const expiryDate = response.expiresAt
        ? new Date(response.expiresAt)
        : new Date(Date.now() + 24 * 60 * 60 * 1000); // 24시간 후
      document.cookie = `sessionId=${
        response.sessionId
      }; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;

      // 로그인 후 프로필 정보를 가져와서 실제 사용자 정보 설정
      let user;
      try {
        // 로그인 직후 프로필 정보 가져오기
        console.log("authService: Attempting to fetch profile after login");
        const profileData = await getMyProfile();
        console.log("authService: Profile data fetched:", profileData);
        console.log("authService: Profile data type:", typeof profileData);

        // 프로필 데이터 유효성 검사
        if (
          !profileData ||
          profileData === "" ||
          (typeof profileData === "string" && profileData.trim() === "")
        ) {
          throw new Error("Empty profile data received");
        }

        // 문자열 응답인 경우 JSON 파싱 시도
        let parsedProfileData = profileData;
        if (typeof profileData === "string") {
          try {
            parsedProfileData = JSON.parse(profileData);
            console.log(
              "authService: Parsed string profile response:",
              parsedProfileData
            );
          } catch (parseError) {
            console.error(
              "authService: Failed to parse profile string response:",
              parseError
            );
            throw new Error("Failed to parse profile response");
          }
        }

        if (
          parsedProfileData &&
          (parsedProfileData.customerId ||
            parsedProfileData.loginId ||
            parsedProfileData.id)
        ) {
          user = {
            id: parsedProfileData.customerId || parsedProfileData.id,
            loginId: response.loginId,
            name: parsedProfileData.name || response.loginId,
            email: parsedProfileData.email || response.loginId + "@example.com",
            phone: parsedProfileData.phone,
            dateOfBirth: parsedProfileData.dateOfBirth,
            gender: parsedProfileData.gender,
            points: parsedProfileData.points || 0,
            roles: ["ROLE_USER"],
            isAdmin: false,
          };
          console.log("authService: User object created from profile:", user);
        } else {
          throw new Error("Invalid profile data structure");
        }
      } catch (profileError) {
        console.warn(
          "authService: Failed to fetch profile after login:",
          profileError
        );
        // 프로필 가져오기 실패 시 최소한의 기본 정보만 사용
        // 실제 프로필 정보는 ProfilePage에서 다시 시도
        user = {
          id: Math.floor(Math.random() * 1000) + 1, // 임시 ID
          loginId: response.loginId,
          name: response.loginId, // 임시 이름에서 "_사용자" 제거
          email: response.loginId + "@example.com",
          roles: ["ROLE_USER"],
          isAdmin: false,
          _profileNotLoaded: true, // 프로필이 로드되지 않았음을 표시
        };
        console.log("authService: User object created with basic info:", user);
      }

      localStorage.setItem("userData", JSON.stringify(user));

      // AuthContext에서 기대하는 형태로 응답 변환
      return {
        sessionId: response.sessionId,
        user: user,
        expiresAt: response.expiresAt,
      };
    }

    throw new Error("Invalid login response format");
  } catch (error) {
    console.error("Login error in authService:", error);
    throw error;
  }
};

/**
 * Login an admin.
 * @param {{ username, password }} credentials
 * @returns {Promise<{sessionId: string, user: object}>}
 */
export const adminLogin = async (credentials) => {
  try {
    const response = await apiClient.post(
      API_ENDPOINTS_ADMIN_AUTH.LOGIN,
      credentials
    );
    if (response && response.sessionId) {
      localStorage.setItem("sessionId", response.sessionId);

      // 쿠키에도 sessionId 저장
      const expiryDate = response.expiresAt
        ? new Date(response.expiresAt)
        : new Date(Date.now() + 24 * 60 * 60 * 1000); // 24시간 후
      document.cookie = `sessionId=${
        response.sessionId
      }; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;

      if (response.expiresAt) {
        localStorage.setItem("sessionExpiresAt", response.expiresAt);
      }

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

export const logout = async () => {
  try {
    // 백엔드에 로그아웃 API 호출 (customer 기준)
    await apiClient.post(API_ENDPOINTS_CUSTOMER.LOGOUT);
  } catch (error) {
    console.error("Logout error in authService:", error);
    // 로그아웃 API 호출 실패해도 로컬 세션은 정리
  } finally {
    // 로컬 스토리지에서 세션 정보 제거
    localStorage.removeItem("sessionId");
    localStorage.removeItem("sessionExpiresAt");
    localStorage.removeItem("userData");
    localStorage.removeItem("adminData");

    // 쿠키도 정리
    document.cookie =
      "sessionId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }
};

export const adminLogout = async () => {
  try {
    // 백엔드에 관리자 로그아웃 API 호출
    await apiClient.post(API_ENDPOINTS_ADMIN_AUTH.LOGOUT);
  } catch (error) {
    console.error("Admin logout error in authService:", error);
    // 로그아웃 API 호출 실패해도 로컬 세션은 정리
  } finally {
    // 로컬 스토리지에서 세션 정보 제거
    localStorage.removeItem("sessionId");
    localStorage.removeItem("sessionExpiresAt");
    localStorage.removeItem("userData");
    localStorage.removeItem("adminData");

    // 쿠키도 정리
    document.cookie =
      "sessionId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }
};

// ===== Customer Profile API =====
/**
 * Get Customer Profile
 * @returns {Promise<any>}
 */
export const getMyProfile = async () => {
  console.log(
    "authService: getMyProfile() called with endpoint:",
    API_ENDPOINTS_CUSTOMER.GET_MY_INFO
  );
  try {
    const result = await apiClient.get(API_ENDPOINTS_CUSTOMER.GET_MY_INFO);
    console.log("authService: getMyProfile() result:", result);
    console.log("authService: getMyProfile() result type:", typeof result);
    return result;
  } catch (error) {
    console.error("authService: getMyProfile() error:", error);
    throw error;
  }
};

/**
 * Update Customer Profile
 * @param {object} profileData
 * @returns {Promise<any>}
 */
export const updateMyProfile = async (profileData) => {
  return apiClient.put(API_ENDPOINTS_CUSTOMER.UPDATE_MY_INFO, profileData);
};

/**
 * Delete my account (회원 탈퇴)
 * @returns {Promise<any>}
 */
export const deleteMyAccount = async () => {
  return apiClient.delete(API_ENDPOINTS_CUSTOMER.DELETE_MY_ACCOUNT);
};

// ===== Password Reset API =====
/**
 * Request email verification for password reset
 * @param {{loginId: string, email: string}} data
 * @returns {Promise<any>}
 */
export const requestPasswordResetEmail = async (data) => {
  return apiClient.post(
    API_ENDPOINTS_CUSTOMER.FIND_PASSWORD_VERIFY_EMAIL,
    data
  );
};

/**
 * Verify email code for password reset
 * @param {{email: string, code: string}} data
 * @returns {Promise<any>}
 */
export const verifyPasswordResetEmail = async (data) => {
  return apiClient.post(API_ENDPOINTS_CUSTOMER.FIND_PASSWORD_AUTH_EMAIL, data);
};

/**
 * Reset password
 * @param {{code: string, password: string, repeatPassword: string}} data
 * @returns {Promise<any>}
 */
export const resetPassword = async (data) => {
  return apiClient.post(API_ENDPOINTS_CUSTOMER.FIND_PASSWORD_RESET, data);
};

// ===== Find Login ID API =====
/**
 * Request email verification for finding login ID
 * @param {{name: string, email: string}} data
 * @returns {Promise<any>}
 */
export const requestFindLoginIdEmail = async (data) => {
  return apiClient.post(API_ENDPOINTS_CUSTOMER.FIND_LOGINID_VERIFY_EMAIL, data);
};

/**
 * Verify email code for finding login ID
 * @param {{email: string, code: string}} data
 * @returns {Promise<any>}
 */
export const verifyFindLoginIdEmail = async (data) => {
  return apiClient.post(API_ENDPOINTS_CUSTOMER.FIND_LOGINID_AUTH_EMAIL, data);
};

// ===== Admin Signup API =====
/**
 * Admin Signup
 * @param {object} signupData
 * @returns {Promise<any>}
 */
export const adminSignup = async (signupData) => {
  return apiClient.post(API_ENDPOINTS_ADMIN_AUTH.SIGNUP, signupData);
};

/**
 * Request Email Verification Code for Admin
 * @param {{email: string, purpose: string}} mailRequestData
 * @returns {Promise<any>}
 */
export const requestAdminAuthMail = async (mailRequestData) => {
  return apiClient.post(
    API_ENDPOINTS_ADMIN_AUTH.SIGNUP_REQUEST_EMAIL_VERIFICATION,
    mailRequestData
  );
};

/**
 * Verify Email Auth Code for Admin
 * @param {{email: string, code: string}} authMailData
 * @returns {Promise<any>}
 */
export const verifyAdminAuthMail = async (authMailData) => {
  return apiClient.post(
    API_ENDPOINTS_ADMIN_AUTH.SIGNUP_AUTH_EMAIL_CODE,
    authMailData
  );
};

/**
 * Check if Admin Login ID is duplicate
 * @param {string} loginId
 * @returns {Promise<any>}
 */
export const checkAdminLoginIdAvailability = async (loginId) => {
  return apiClient.get(API_ENDPOINTS_ADMIN_AUTH.SIGNUP_CHECK_LOGINID(loginId));
};

/**
 * Check if Admin Email is duplicate
 * @param {string} email
 * @returns {Promise<any>}
 */
export const checkAdminEmailAvailability = async (email) => {
  return apiClient.get(API_ENDPOINTS_ADMIN_AUTH.SIGNUP_CHECK_EMAIL(email));
};

// ===== Guest API =====
/**
 * Guest Login
 * @param {{email: string, password: string}} credentials
 * @returns {Promise<any>}
 */
export const guestLogin = async (credentials) => {
  try {
    const response = await apiClient.post(
      API_ENDPOINTS_GUEST.LOGIN,
      credentials
    );
    if (response && response.sessionId) {
      localStorage.setItem("sessionId", response.sessionId);

      // 쿠키에도 sessionId 저장
      const expiryDate = response.expiresAt
        ? new Date(response.expiresAt)
        : new Date(Date.now() + 24 * 60 * 60 * 1000); // 24시간 후
      document.cookie = `sessionId=${
        response.sessionId
      }; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;

      if (response.expiresAt) {
        localStorage.setItem("sessionExpiresAt", response.expiresAt);
      }

      if (response.user) {
        localStorage.setItem("userData", JSON.stringify(response.user));
      }
    }
    return response;
  } catch (error) {
    console.error("Guest login error in authService:", error);
    throw error;
  }
};

/**
 * Guest Logout
 * @returns {Promise<any>}
 */
export const guestLogout = async () => {
  try {
    await apiClient.post(API_ENDPOINTS_GUEST.LOGOUT);
  } catch (error) {
    console.error("Guest logout error in authService:", error);
    // 로그아웃 API 호출 실패해도 로컬 세션은 정리
  } finally {
    // 로컬 스토리지에서 세션 정보 제거
    localStorage.removeItem("sessionId");
    localStorage.removeItem("sessionExpiresAt");
    localStorage.removeItem("userData");
    localStorage.removeItem("adminData");

    // 쿠키도 정리
    document.cookie =
      "sessionId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }
};

/**
 * Guest Signup
 * @param {object} signupData
 * @returns {Promise<any>}
 */
export const guestSignup = async (signupData) => {
  return apiClient.post(API_ENDPOINTS_GUEST.SIGNUP, signupData);
};

/**
 * Check if Guest Email is duplicate
 * @param {string} email
 * @returns {Promise<any>}
 */
export const checkGuestEmailAvailability = async (email) => {
  return apiClient.get(API_ENDPOINTS_GUEST.SIGNUP_CHECK_EMAIL(email));
};

/**
 * Request Email Verification Code for Guest
 * @param {{email: string, purpose: string}} mailRequestData
 * @returns {Promise<any>}
 */
export const requestGuestAuthMail = async (mailRequestData) => {
  return apiClient.post(
    API_ENDPOINTS_GUEST.SIGNUP_REQUEST_EMAIL_VERIFICATION,
    mailRequestData
  );
};

/**
 * Verify Email Auth Code for Guest
 * @param {{email: string, code: string}} authMailData
 * @returns {Promise<any>}
 */
export const verifyGuestAuthMail = async (authMailData) => {
  return apiClient.post(
    API_ENDPOINTS_GUEST.SIGNUP_AUTH_EMAIL_CODE,
    authMailData
  );
};

/**
 * Delete Admin Account
 * @returns {Promise<any>}
 */
export const deleteAdminAccount = async () => {
  return apiClient.delete(API_ENDPOINTS_ADMIN_AUTH.DELETE_ACCOUNT);
};
