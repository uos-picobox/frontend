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
  const { adminLogin, isLoading, authError, clearAuthError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const from = location.state?.from?.pathname || "/admin/movies"; // Default admin page after login

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearAuthError();
    const success = await adminLogin({ username, password });
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
          id="adminUsername"
          name="adminUsername"
          label="사용자명"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
          disabled={isLoading}
        >
          {isLoading ? "로그인 중..." : "로그인"}
        </Button>
      </Form>
    </AdminLoginPageWrapper>
  );
};

export default AdminLoginPage;
