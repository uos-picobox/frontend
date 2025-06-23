// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useCallback } from "react";
import * as authService from "../services/authService";

const AuthContext = createContext(null);

const DEV_MODE_MOCK_AUTH_ENABLED = false;
const DEV_MODE_MOCK_AS_ADMIN = false;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sessionId, setSessionId] = useState(() =>
    localStorage.getItem("sessionId")
  );
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const loadUserFromStorage = () => {
      const storedSessionId = localStorage.getItem("sessionId");
      const storedExpiresAt = localStorage.getItem("sessionExpiresAt");

      console.log(
        "AuthContext: Loading from storage - sessionId:",
        !!storedSessionId,
        "expiresAt:",
        storedExpiresAt
      );

      // 세션 만료 확인
      if (storedSessionId && storedExpiresAt) {
        const expiryTime = new Date(storedExpiresAt);
        const now = new Date();

        console.log(
          "AuthContext: Session check - now:",
          now.toISOString(),
          "expires:",
          expiryTime.toISOString()
        );

        if (now >= expiryTime) {
          console.log("AuthContext: Session expired, clearing stored data");
          localStorage.removeItem("sessionId");
          localStorage.removeItem("sessionExpiresAt");
          localStorage.removeItem("userData");
          localStorage.removeItem("adminData");
          setUser(null);
          setIsAdmin(false);
          setSessionId(null);
          setIsLoadingAuth(false);
          return;
        }
      } else if (storedSessionId && !storedExpiresAt) {
        console.warn("AuthContext: sessionId exists but no expiry time found");
      }

      if (storedSessionId) {
        setSessionId(storedSessionId);
        const storedAdminData = localStorage.getItem("adminData");
        if (storedAdminData) {
          try {
            const admin = JSON.parse(storedAdminData);
            setUser(admin);
            setIsAdmin(true);
          } catch (e) {
            localStorage.removeItem("adminData");
          }
        } else {
          const storedUserData = localStorage.getItem("userData");
          if (storedUserData) {
            try {
              setUser(JSON.parse(storedUserData));
              setIsAdmin(false);
            } catch (e) {
              localStorage.removeItem("userData");
            }
          } else {
            setUser(null);
            setIsAdmin(false);
          }
        }
      } else {
        if (DEV_MODE_MOCK_AUTH_ENABLED) {
          console.warn(
            "AuthContext: No sessionId found. Using MOCK USER for development."
          );
          const mockUserObject = {
            id: DEV_MODE_MOCK_AS_ADMIN ? 999 : 998,
            loginId: DEV_MODE_MOCK_AS_ADMIN
              ? "dev_admin_mock"
              : "dev_user_mock",
            name: DEV_MODE_MOCK_AS_ADMIN
              ? "개발용 관리자 (Mock)"
              : "개발용 사용자 (Mock)",
            email: DEV_MODE_MOCK_AS_ADMIN
              ? "dev_admin@picobox.com"
              : "dev_user@picobox.com",
            roles: DEV_MODE_MOCK_AS_ADMIN
              ? ["ROLE_ADMIN", "ROLE_USER"]
              : ["ROLE_USER"],
            isAdmin: DEV_MODE_MOCK_AS_ADMIN,
          };
          setUser(mockUserObject);
          setIsAdmin(DEV_MODE_MOCK_AS_ADMIN);
          setSessionId("mock_dev_session_id");
          if (DEV_MODE_MOCK_AS_ADMIN) {
            localStorage.setItem("adminData", JSON.stringify(mockUserObject));
          } else {
            localStorage.setItem("userData", JSON.stringify(mockUserObject));
          }
        } else {
          setUser(null);
          setIsAdmin(false);
          setSessionId(null);
        }
      }
      setIsLoadingAuth(false);
    };
    loadUserFromStorage();
  }, []);

  const handleLoginResponse = (response, isAdminLoginAttempt = false) => {
    console.log(
      "AuthContext: handleLoginResponse called with:",
      response,
      isAdminLoginAttempt
    );

    if (response && response.sessionId) {
      console.log("AuthContext: Setting sessionId:", response.sessionId);
      setSessionId(response.sessionId);
      localStorage.setItem("sessionId", response.sessionId);

      if (response.user) {
        setUser(response.user);
        const determinedIsAdmin =
          isAdminLoginAttempt &&
          (response.user.roles?.includes("ROLE_ADMIN") ||
            response.user.isAdmin === true);
        setIsAdmin(determinedIsAdmin);

        // 일반 사용자 로그인 시 관리자가 아님을 명확히 설정
        if (!isAdminLoginAttempt) {
          setIsAdmin(false);
        }
        if (determinedIsAdmin) {
          localStorage.setItem("adminData", JSON.stringify(response.user));
          localStorage.removeItem("userData");
        } else {
          localStorage.setItem("userData", JSON.stringify(response.user));
          localStorage.removeItem("adminData");
        }

        console.log(
          "AuthContext: Login successful - User:",
          response.user,
          "IsAdmin:",
          determinedIsAdmin,
          "SessionId set:",
          !!response.sessionId
        );
      } else {
        console.log(
          "AuthContext: No user data in response, setting basic state"
        );
        setUser(null);
        setIsAdmin(isAdminLoginAttempt);
        if (isAdminLoginAttempt)
          localStorage.setItem(
            "adminData",
            JSON.stringify({
              tempAdmin: true,
              message:
                "Admin login successful, but no detailed user data in response.",
            })
          );
        else localStorage.removeItem("adminData");
        localStorage.removeItem("userData");
      }

      console.log(
        "AuthContext: Final state after login - sessionId:",
        response.sessionId,
        "user:",
        !!response.user
      );
      return true;
    }
    setAuthError(response?.message || "로그인 응답 형식이 올바르지 않습니다.");
    return false;
  };

  const login = useCallback(async (credentials) => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const response = await authService.login(credentials);
      if (handleLoginResponse(response, false)) return true;
      return false;
    } catch (error) {
      setAuthError(
        error.message || "로그인 실패. 아이디 또는 비밀번호를 확인해주세요."
      );
      return false;
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  const adminLogin = useCallback(async (credentials) => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      // 임시 관리자 로그인 로직 (API가 없으므로)
      if (
        credentials.username === "admin" &&
        credentials.password === "password123"
      ) {
        // Mock 관리자 응답 생성
        const mockAdminResponse = {
          sessionId: "mock_admin_session_" + Date.now(),
          user: {
            id: 1,
            loginId: "admin",
            username: "admin",
            name: "시스템 관리자",
            email: "admin@picobox.com",
            roles: ["ROLE_ADMIN", "ROLE_USER"],
            isAdmin: true,
          },
        };

        if (handleLoginResponse(mockAdminResponse, true)) {
          return true;
        }
        return false;
      } else {
        // 잘못된 크리덴셜
        setAuthError(
          "관리자 로그인 실패. 아이디 또는 비밀번호를 확인해주세요."
        );
        return false;
      }
    } catch (error) {
      setAuthError(
        error.message ||
          "관리자 로그인 실패. 아이디 또는 비밀번호를 확인해주세요."
      );
      return false;
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  const guestLogin = useCallback(async (credentials) => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const response = await authService.guestLogin(credentials);
      if (handleLoginResponse(response, false)) return true;
      return false;
    } catch (error) {
      setAuthError(
        error.message ||
          "비회원 로그인 실패. 이메일 또는 비밀번호를 확인해주세요."
      );
      return false;
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  const signup = useCallback(async (signupData) => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      await authService.signup(signupData);
      return true;
    } catch (error) {
      setAuthError(
        error.message ||
          error.details ||
          "회원가입 실패. 입력 정보를 확인해주세요."
      );
      return false;
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  const logout = useCallback(async () => {
    // logout 함수를 async로 변경
    await authService.logout();
    setSessionId(null);
    setUser(null);
    setIsAdmin(false);
    setAuthError(null);
  }, []);

  const requestAuthMail = useCallback(async (mailRequestData) => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      await authService.requestAuthMail(mailRequestData);
      return true;
    } catch (error) {
      setAuthError(
        error.message || error.details || "인증 코드 발송에 실패했습니다."
      );
      return false;
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  const verifyAuthMail = useCallback(async (authMailData) => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      await authService.verifyAuthMail(authMailData);
      return true;
    } catch (error) {
      setAuthError(
        error.message ||
          error.details ||
          "이메일 인증에 실패했습니다. 코드를 확인해주세요."
      );
      return false;
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  const checkLoginId = useCallback(async (loginId) => {
    setAuthError(null);
    try {
      const isAvailable = await authService.checkLoginIdAvailability(loginId);
      if (isAvailable) {
        return { isAvailable: true, message: "사용 가능한 아이디입니다." };
      } else {
        return { isAvailable: false, message: "이미 사용 중인 아이디입니다." };
      }
    } catch (error) {
      console.error("ID 중복 확인 오류:", error);
      throw new Error(
        error.message || "아이디 중복 확인 중 오류가 발생했습니다."
      );
    }
  }, []);

  const checkEmail = useCallback(async (email) => {
    setAuthError(null);
    try {
      const response = await authService.checkEmailAvailability(email);
      if (response) {
        return { isAvailable: true, message: "사용 가능한 아이디입니다." };
      } else {
        return { isAvailable: false, message: "이미 사용 중인 아이디입니다." };
      }
    } catch (error) {
      console.error("이메일 중복 확인 오류:", error);
      throw error;
    }
  }, []);

  const getMyProfile = useCallback(async () => {
    try {
      const profile = await authService.getMyProfile();
      return profile;
    } catch (error) {
      console.error("프로필 조회 오류:", error);
      throw error;
    }
  }, []);

  const updateMyProfile = useCallback(async (profileData) => {
    try {
      const updatedProfile = await authService.updateMyProfile(profileData);
      // 업데이트된 프로필로 현재 사용자 정보를 갱신
      setUser(updatedProfile);
      localStorage.setItem("userData", JSON.stringify(updatedProfile));
      return updatedProfile;
    } catch (error) {
      console.error("프로필 업데이트 오류:", error);
      throw error;
    }
  }, []);

  const deleteAdminAccount = useCallback(async () => {
    try {
      await authService.deleteAdminAccount();
      // 계정 삭제 후 로그아웃 처리
      setSessionId(null);
      setUser(null);
      setIsAdmin(false);
      setAuthError(null);
      // 로컬 스토리지 정리
      localStorage.removeItem("sessionId");
      localStorage.removeItem("sessionExpiresAt");
      localStorage.removeItem("userData");
      localStorage.removeItem("adminData");
      // 쿠키 정리
      document.cookie =
        "sessionId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      return true;
    } catch (error) {
      console.error("관리자 계정 삭제 오류:", error);
      throw error;
    }
  }, []);

  const value = {
    user,
    isAdmin,
    sessionId,
    isLoadingAuth,
    authError,
    login,
    adminLogin,
    guestLogin,
    signup,
    logout,
    requestAuthMail,
    verifyAuthMail,
    checkLoginId,
    checkEmail,
    getMyProfile,
    updateMyProfile,
    deleteAdminAccount,
    clearAuthError: useCallback(() => setAuthError(null), []),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
