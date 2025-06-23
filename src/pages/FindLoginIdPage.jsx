import React, { useState } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import * as authService from "../services/authService";

const FindLoginIdPageWrapper = styled.div`
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

const ResultBox = styled.div`
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  padding: ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing[4]};

  .found-id {
    font-size: ${({ theme }) => theme.fontSizes.lg};
    font-weight: bold;
    color: ${({ theme }) => theme.colors.primaryLight};
    margin: ${({ theme }) => theme.spacing[2]} 0;
    padding: ${({ theme }) => theme.spacing[2]};
    background-color: ${({ theme }) => theme.colors.surface};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    border: 2px solid ${({ theme }) => theme.colors.primary + "33"};
  }
`;

const StyledLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primaryLight};
  text-decoration: none;
  font-weight: 500;
  text-align: center;
  display: block;
  margin-top: ${({ theme }) => theme.spacing[2]};

  &:hover {
    text-decoration: underline;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-top: ${({ theme }) => theme.spacing[4]};
`;

const FindLoginIdPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: 이메일 입력, 2: 인증코드 입력, 3: 결과 표시
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [foundLoginId, setFoundLoginId] = useState("");
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
    if (!name.trim() || !email.trim()) {
      showMessage("이름과 이메일을 모두 입력해주세요.", "error");
      return;
    }

    setLoading(true);
    try {
      console.log("🔄 아이디 찾기 이메일 인증 요청:", { name, email });
      const response = await authService.requestFindLoginIdEmail({
        name,
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
      console.log("🔄 아이디 찾기 인증코드 검증:", { email, code });
      const response = await authService.verifyFindLoginIdEmail({
        email,
        code,
      });
      console.log("✅ 인증코드 검증 성공:", response);
      // API 응답에서 찾은 아이디를 추출 (실제 응답 구조에 따라 조정 필요)
      const loginId =
        response.loginId ||
        response.data?.loginId ||
        response.result?.loginId ||
        "찾은 아이디";
      setFoundLoginId(loginId);
      showMessage("아이디를 찾았습니다!", "success");
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

  const getStepClass = (stepNumber) => {
    if (stepNumber < step) return "completed";
    if (stepNumber === step) return "active";
    return "inactive";
  };

  const getLineClass = (stepNumber) => {
    return stepNumber < step ? "completed" : "";
  };

  const handleReset = () => {
    setStep(1);
    setName("");
    setEmail("");
    setCode("");
    setFoundLoginId("");
    setMessage("");
    setMessageType("");
  };

  return (
    <FindLoginIdPageWrapper>
      <PageTitle>아이디 찾기</PageTitle>

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
            본인 확인
          </h3>
          <p
            style={{
              textAlign: "center",
              fontSize: "0.9rem",
              color: "#666",
              marginBottom: "1rem",
            }}
          >
            가입 시 입력한 이름과 이메일을 입력하면 인증코드를 전송합니다.
          </p>
          <Input
            id="name"
            name="name"
            label="이름"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="가입 시 입력한 이름을 입력하세요"
            required
          />
          <Input
            id="email"
            name="email"
            label="이메일"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="가입 시 입력한 이메일을 입력하세요"
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
        <div>
          <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>
            아이디 찾기 완료
          </h3>
          <ResultBox>
            <p style={{ marginBottom: "1rem", color: "#666" }}>
              {name}님의 아이디를 찾았습니다.
            </p>
            <div className="found-id">{foundLoginId}</div>
            <p style={{ fontSize: "0.9rem", color: "#666", marginTop: "1rem" }}>
              해당 아이디로 로그인하실 수 있습니다.
            </p>
          </ResultBox>

          <ButtonGroup>
            <Button
              variant="primary"
              fullWidth
              onClick={() => navigate("/login")}
            >
              로그인하기
            </Button>
            <Button variant="outline" onClick={handleReset}>
              다시 찾기
            </Button>
          </ButtonGroup>
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <StyledLink to="/login">로그인 페이지로 돌아가기</StyledLink>
        <StyledLink to="/forgot-password">비밀번호를 잊으셨나요?</StyledLink>
      </div>
    </FindLoginIdPageWrapper>
  );
};

export default FindLoginIdPage;
