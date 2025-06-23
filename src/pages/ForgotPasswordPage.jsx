import React, { useState } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import * as authService from "../services/authService";

const ForgotPasswordPageWrapper = styled.div`
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

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing[4]};

  .step {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: bold;
    margin: 0 ${({ theme }) => theme.spacing[2]};

    &.active {
      background-color: ${({ theme }) => theme.colors.primary};
      color: white;
    }

    &.completed {
      background-color: ${({ theme }) => theme.colors.success};
      color: white;
    }

    &.inactive {
      background-color: ${({ theme }) => theme.colors.disabled};
      color: white;
    }
  }

  .line {
    flex: 1;
    height: 2px;
    background-color: ${({ theme }) => theme.colors.disabled};
    align-self: center;

    &.completed {
      background-color: ${({ theme }) => theme.colors.success};
    }
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const MessageBox = styled.div`
  padding: ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes.sm};

  &.success {
    background-color: ${({ theme }) => theme.colors.success + "22"};
    color: ${({ theme }) => theme.colors.success};
    border: 1px solid ${({ theme }) => theme.colors.success + "44"};
  }

  &.error {
    background-color: ${({ theme }) => theme.colors.error + "22"};
    color: ${({ theme }) => theme.colors.error};
    border: 1px solid ${({ theme }) => theme.colors.error + "44"};
  }
`;

const StyledLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primaryLight};
  text-decoration: none;
  font-weight: 500;
  text-align: center;
  display: block;
  margin-top: ${({ theme }) => theme.spacing[4]};

  &:hover {
    text-decoration: underline;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: 이메일 입력, 2: 인증코드 입력, 3: 새 비밀번호 입력
  const [loginId, setLoginId] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [verificationToken, setVerificationToken] = useState(""); // 인증 완료 후 받은 토큰
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  const handleRequestEmail = async (e) => {
    e.preventDefault();
    if (!loginId.trim() || !email.trim()) {
      showMessage("아이디와 이메일을 모두 입력해주세요.", "error");
      return;
    }

    setLoading(true);
    try {
      console.log("🔄 비밀번호 재설정 이메일 인증 요청:", { loginId, email });
      const response = await authService.requestPasswordResetEmail({
        loginId,
        email,
      });
      console.log("✅ 이메일 인증 요청 성공:", response);
      showMessage("인증코드가 이메일로 전송되었습니다.", "success");
      setStep(2);
    } catch (error) {
      console.error("❌ 이메일 인증 요청 실패:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "인증코드 전송에 실패했습니다.";
      showMessage(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      showMessage("인증코드를 입력해주세요.", "error");
      return;
    }

    setLoading(true);
    try {
      console.log("🔄 비밀번호 재설정 인증코드 검증:", { email, code });
      const response = await authService.verifyPasswordResetEmail({
        email,
        code,
      });
      console.log("✅ 인증코드 검증 성공:", response);

      // 서버에서 반환한 새로운 코드를 사용해야 함
      const newCode = response?.code || response?.data?.code || code;
      console.log("🔑 비밀번호 재설정에 사용할 코드:", newCode);
      setVerificationToken(newCode); // 서버에서 반환한 새로운 코드 사용

      showMessage("인증이 완료되었습니다.", "success");
      setStep(3);
    } catch (error) {
      console.error("❌ 인증코드 검증 실패:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "잘못된 인증 코드이거나 이미 만료된 코드입니다.";
      showMessage(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!password.trim() || !repeatPassword.trim()) {
      showMessage("새 비밀번호를 모두 입력해주세요.", "error");
      return;
    }

    if (password !== repeatPassword) {
      showMessage("비밀번호가 일치하지 않습니다.", "error");
      return;
    }

    if (password.length < 8) {
      showMessage("비밀번호는 8자 이상이어야 합니다.", "error");
      return;
    }

    setLoading(true);
    try {
      // API 명세서에 따르면 code 파라미터를 사용해야 함
      const resetData = {
        code: verificationToken || code, // 인증 후 받은 토큰 또는 원본 코드 사용
        password,
        repeatPassword,
      };

      console.log("🔄 비밀번호 재설정 요청:", {
        code: resetData.code,
        password: "***",
        repeatPassword: "***",
      });

      const response = await authService.resetPassword(resetData);
      console.log("✅ 비밀번호 재설정 성공:", response);
      showMessage("비밀번호가 성공적으로 변경되었습니다.", "success");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("❌ 비밀번호 재설정 실패:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "비밀번호 변경에 실패했습니다.";

      // 인증코드 관련 오류인 경우 2단계로 돌아가기
      if (
        errorMessage.includes("인증") ||
        errorMessage.includes("코드") ||
        errorMessage.includes("만료")
      ) {
        showMessage(errorMessage + " 인증코드를 다시 입력해주세요.", "error");
        setStep(2);
        setCode(""); // 코드 입력란 초기화
        setVerificationToken(""); // 토큰 초기화
      } else {
        showMessage(errorMessage, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStepClass = (stepNumber) => {
    if (stepNumber < step) return "completed";
    if (stepNumber === step) return "active";
    return "inactive";
  };

  const getLineClass = (stepNumber) => {
    return stepNumber < step ? "completed" : "";
  };

  return (
    <ForgotPasswordPageWrapper>
      <PageTitle>비밀번호 재설정</PageTitle>

      <StepIndicator>
        <div className={`step ${getStepClass(1)}`}>1</div>
        <div className={`line ${getLineClass(2)}`}></div>
        <div className={`step ${getStepClass(2)}`}>2</div>
        <div className={`line ${getLineClass(3)}`}></div>
        <div className={`step ${getStepClass(3)}`}>3</div>
      </StepIndicator>

      {message && <MessageBox className={messageType}>{message}</MessageBox>}

      {step === 1 && (
        <Form onSubmit={handleRequestEmail}>
          <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>
            이메일 인증
          </h3>
          <p
            style={{
              textAlign: "center",
              fontSize: "0.9rem",
              color: "#666",
              marginBottom: "1rem",
            }}
          >
            아이디와 이메일을 입력하면 인증코드를 전송합니다.
          </p>
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
            id="email"
            name="email"
            label="이메일"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일을 입력하세요"
            required
          />
          <Button type="submit" variant="primary" fullWidth disabled={loading}>
            {loading ? "인증코드 전송 중..." : "인증코드 전송"}
          </Button>
        </Form>
      )}

      {step === 2 && (
        <Form onSubmit={handleVerifyCode}>
          <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>
            인증코드 확인
          </h3>
          <p
            style={{
              textAlign: "center",
              fontSize: "0.9rem",
              color: "#666",
              marginBottom: "1rem",
            }}
          >
            {email}로 전송된 인증코드를 입력하세요.
          </p>
          <Input
            id="code"
            name="code"
            label="인증코드"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="인증코드를 입력하세요"
            required
          />
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              disabled={loading}
            >
              이전
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading}
            >
              {loading ? "인증 중..." : "인증하기"}
            </Button>
          </div>
        </Form>
      )}

      {step === 3 && (
        <Form onSubmit={handleResetPassword}>
          <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>
            새 비밀번호 설정
          </h3>
          <p
            style={{
              textAlign: "center",
              fontSize: "0.9rem",
              color: "#666",
              marginBottom: "1rem",
            }}
          >
            새로운 비밀번호를 입력하세요.
          </p>
          <Input
            id="password"
            name="password"
            label="새 비밀번호"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="8자 이상 입력하세요"
            required
          />
          <Input
            id="repeatPassword"
            name="repeatPassword"
            label="비밀번호 확인"
            type="password"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            placeholder="비밀번호를 다시 입력하세요"
            required
          />
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setStep(2);
                setPassword("");
                setRepeatPassword("");
              }}
              disabled={loading}
            >
              이전
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading}
            >
              {loading ? "비밀번호 변경 중..." : "비밀번호 변경"}
            </Button>
          </div>
        </Form>
      )}

      <StyledLink to="/login">로그인 페이지로 돌아가기</StyledLink>
    </ForgotPasswordPageWrapper>
  );
};

export default ForgotPasswordPage;
