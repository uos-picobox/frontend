// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useCallback } from "react";
import * as authService from "../services/authService";

const AuthContext = createContext(null);

const DEV_MODE_MOCK_AUTH_ENABLED = true;
const DEV_MODE_MOCK_AS_ADMIN = true;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem("authToken"));
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const loadUserFromStorage = () => {
      const storedToken = localStorage.getItem("authToken");
      if (storedToken) {
        setToken(storedToken);
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
            "AuthContext: No authToken found. Using MOCK USER for development."
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
          setToken("mock_dev_auth_token");
          if (DEV_MODE_MOCK_AS_ADMIN) {
            localStorage.setItem("adminData", JSON.stringify(mockUserObject));
          } else {
            localStorage.setItem("userData", JSON.stringify(mockUserObject));
          }
        } else {
          setUser(null);
          setIsAdmin(false);
          setToken(null);
        }
      }
      setIsLoadingAuth(false);
    };
    loadUserFromStorage();
  }, []);

  const handleLoginResponse = (response, isAdminLoginAttempt = false) => {
    if (response && response.token) {
      setToken(response.token);
      localStorage.setItem("authToken", response.token);

      if (response.user) {
        setUser(response.user);
        const determinedIsAdmin =
          isAdminLoginAttempt &&
          (response.user.roles?.includes("ROLE_ADMIN") ||
            response.user.isAdmin === true);
        setIsAdmin(determinedIsAdmin);
        if (determinedIsAdmin) {
          localStorage.setItem("adminData", JSON.stringify(response.user));
          localStorage.removeItem("userData");
        } else {
          localStorage.setItem("userData", JSON.stringify(response.user));
          localStorage.removeItem("adminData");
        }
      } else {
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
      const response = await authService.adminLogin(credentials);
      if (handleLoginResponse(response, true)) {
        if (
          !response.user ||
          !(
            response.user.roles?.includes("ROLE_ADMIN") ||
            response.user.isAdmin === true
          )
        ) {
          // `handleLoginResponse`에서 이미 토큰과 임시 adminData를 저장했을 수 있으므로, 여기서 로그아웃 처리하여 확실히 정리
          authService.logout();
          setToken(null);
          setUser(null);
          setIsAdmin(false);
          setAuthError(null);
          throw new Error("관리자 계정이 아닙니다.");
        }
        return true;
      }
      return false;
    } catch (error) {
      // 이미 위에서 로그아웃 처리되었을 수 있지만, 만약을 위해 여기서도 호출
      authService.logout();
      setToken(null);
      setUser(null);
      setIsAdmin(false);
      setAuthError(
        error.message ||
          "관리자 로그인 실패. 아이디 또는 비밀번호를 확인해주세요."
      );
      return false;
    } finally {
      setIsLoadingAuth(false);
    }
  }, []); // logout을 의존성 배열에 추가할 필요는 없음. logout은 상태를 바꾸는 함수.

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

  const logout = useCallback(() => {
    // adminLogin에서 logout을 호출하므로, logout 자체도 useCallback으로 감싸줍니다.
    authService.logout();
    setToken(null);
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

  const value = {
    user,
    isAdmin,
    token,
    isLoadingAuth,
    authError,
    login,
    adminLogin,
    signup,
    logout,
    requestAuthMail,
    verifyAuthMail,
    checkLoginId,
    checkEmail,
    clearAuthError: useCallback(() => setAuthError(null), []), // clearAuthError도 useCallback으로 감싸서 value 객체가 불필요하게 재생성되지 않도록 합니다.
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
