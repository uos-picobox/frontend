// src/pages/LoginPage.js
import React, { useState } from "react";
import styled from "styled-components";
import { Link, useNavigate, useLocation } from "react-router-dom"; // Link, useNavigate, useLocation 추가
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import useAuth from "../hooks/useAuth";

const LoginPageWrapper = styled.div`
  max-width: 450px;
  margin: ${({ theme }) => theme.spacing[12]} auto;
  background-color: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing[6]};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  box-shadow: ${({ theme }) => theme.shadows.lg};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing[8]};
  }
`;

const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  color: ${({ theme }) => theme.colors.primaryLight};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[5]};
`;

const OptionsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};

  input[type="checkbox"] {
    width: auto;
    height: 1em;
    accent-color: ${({ theme }) => theme.colors.primary};
  }
  label {
    color: ${({ theme }) => theme.colors.textLighter};
    cursor: pointer;
  }
`;

const StyledLink = styled(Link)`
  // Changed from LinkText (which was an <a>)
  color: ${({ theme }) => theme.colors.primaryLight};
  text-decoration: none;
  font-weight: 500;
  &:hover {
    text-decoration: underline;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const ExtraLinks = styled.p`
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textLighter};
  margin-top: ${({ theme }) => theme.spacing[6]};

  a {
    margin-left: ${({ theme }) => theme.spacing[1]};
  }
`;

const ErrorMessageUI = styled.p`
  color: ${({ theme }) => theme.colors.error};
  background-color: ${({ theme }) => theme.colors.error + "22"};
  padding: ${({ theme }) => theme.spacing[2]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const LoginPage = () => {
  const { login, isLoading, authError, clearAuthError, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const from = location.state?.from?.pathname || (isAdmin ? "/admin" : "/"); // Redirect to admin if isAdmin, else home

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearAuthError();
    const success = await login({ loginId, password });
    if (success) {
      // After successful login, AuthContext updates isAdmin state.
      // We need a slight delay or to check updated isAdmin state for correct redirection.
      // For now, we check isAdmin *after* login resolves.
      // A better way might be for login function in context to return user role.
      const loggedInUserIsAdmin = localStorage.getItem("adminData"); // Crude check, AuthContext should provide this better.
      navigate(
        location.state?.from?.pathname ||
          (loggedInUserIsAdmin ? "/admin/viewMovies" : "/"),
        { replace: true }
      );
    }
  };

  return (
    <LoginPageWrapper>
      <PageTitle>로그인</PageTitle>
      {authError && <ErrorMessageUI>{authError}</ErrorMessageUI>}
      <Form onSubmit={handleSubmit}>
        <Input
          id="loginId"
          name="loginId"
          label="아이디"
          type="text"
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
          placeholder="아이디를 입력하세요"
          required
        />
        <Input
          id="password"
          name="password"
          label="비밀번호"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호를 입력하세요"
          required
        />
        <OptionsRow>
          <CheckboxWrapper>
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="remember-me">아이디 저장</label>
          </CheckboxWrapper>
          <StyledLink
            to="/forgot-password"
            onClick={(e) => {
              e.preventDefault();
              alert("비밀번호 찾기 기능은 준비 중입니다.");
            }}
          >
            비밀번호를 잊으셨나요?
          </StyledLink>
        </OptionsRow>
        <Button type="submit" variant="primary" fullWidth disabled={isLoading}>
          {isLoading ? "로그인 중..." : "로그인"}
        </Button>
      </Form>
      <ExtraLinks>
        계정이 없으신가요?
        <StyledLink to="/signup">회원가입</StyledLink>
      </ExtraLinks>
    </LoginPageWrapper>
  );
};

export default LoginPage;
