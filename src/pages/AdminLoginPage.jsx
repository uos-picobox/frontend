// src/pages/AdminLoginPage.js
import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom"; // useNavigate, useLocation 추가
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import useAuth from "../hooks/useAuth";

const AdminLoginPageWrapper = styled.div`
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
  color: ${({ theme }) => theme.colors.secondary};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[5]};
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

const AdminLoginPage = () => {
  const { adminLogin, isLoadingAuth, authError, clearAuthError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");

  const from = location.state?.from?.pathname || "/admin/movies"; // Default admin page after login

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearAuthError();
    const success = await adminLogin({ username: loginId, password });
    if (success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <AdminLoginPageWrapper>
      <PageTitle>관리자 로그인</PageTitle>
      {authError && <ErrorMessageUI>{authError}</ErrorMessageUI>}
      <Form onSubmit={handleSubmit}>
        <Input
          id="adminLoginId"
          name="adminLoginId"
          label="사용자명"
          type="text"
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
          placeholder="admin"
          required
        />
        <Input
          id="adminPassword"
          name="adminPassword"
          label="비밀번호"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password123"
          required
        />
        <Button
          type="submit"
          variant="secondary"
          fullWidth
          disabled={isLoadingAuth}
        >
          {isLoadingAuth ? "로그인 중..." : "로그인"}
        </Button>
      </Form>
      <div
        style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.9rem" }}
      >
        관리자 계정이 없으신가요?{" "}
        <a
          href="/admin/signup"
          style={{
            color: "#3b82f6",
            textDecoration: "none",
            fontWeight: "500",
          }}
          onMouseOver={(e) => (e.target.style.textDecoration = "underline")}
          onMouseOut={(e) => (e.target.style.textDecoration = "none")}
        >
          관리자 회원가입
        </a>
      </div>
    </AdminLoginPageWrapper>
  );
};

export default AdminLoginPage;
