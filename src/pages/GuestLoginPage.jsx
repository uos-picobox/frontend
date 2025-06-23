import React, { useState } from "react";
import styled from "styled-components";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import useAuth from "../hooks/useAuth";

const GuestLoginPageWrapper = styled.div`
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
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const PageSubtitle = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textDark};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const GuestBadge = styled.div`
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 600;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[5]};
`;

const StyledLink = styled(Link)`
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

const GuestLoginPage = () => {
  const { guestLogin, isLoadingAuth, authError, clearAuthError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearAuthError();

    const success = await guestLogin({ email, password });
    if (success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <GuestLoginPageWrapper>
      <GuestBadge>👤 비회원 로그인</GuestBadge>
      <PageTitle>비회원 로그인</PageTitle>
      <PageSubtitle>
        회원가입 없이 이메일과 비밀번호로 빠르게 로그인하세요
      </PageSubtitle>

      {authError && <ErrorMessageUI>{authError}</ErrorMessageUI>}

      <Form onSubmit={handleSubmit}>
        <Input
          id="email"
          name="email"
          label="이메일"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일을 입력하세요"
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
        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={isLoadingAuth}
        >
          {isLoadingAuth ? "로그인 중..." : "비회원 로그인"}
        </Button>
      </Form>

      <ExtraLinks>
        비회원 계정이 없으신가요?
        <StyledLink to="/guest/signup">비회원 등록</StyledLink>
        <br />
        회원으로 로그인하시겠어요?
        <StyledLink to="/login">회원 로그인</StyledLink>
      </ExtraLinks>
    </GuestLoginPageWrapper>
  );
};

export default GuestLoginPage;
