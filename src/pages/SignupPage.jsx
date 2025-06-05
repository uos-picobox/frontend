// src/pages/SignupPage.js
import React, { useState } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import useAuth from "../hooks/useAuth";

const SignupPageWrapper = styled.div`
  max-width: 600px;
  margin: ${({ theme }) => theme.spacing[8]} auto;
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
  gap: ${({ theme }) => theme.spacing[2]};
`;
const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing[4]};
  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr 1fr;
  }
`;
const EmailVerificationSection = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  align-items: flex-end;
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  & > div:first-child {
    flex-grow: 1;
    margin-bottom: 0;
  }
`;
const MessageUI = styled.p`
  padding: ${({ theme }) => theme.spacing[2]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  color: ${({ theme, type }) =>
    type === "error" ? theme.colors.error : theme.colors.success};
  background-color: ${({ theme, type }) =>
    type === "error" ? theme.colors.error + "22" : theme.colors.success + "22"};
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
const FieldMessage = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme, type }) =>
    type === "error"
      ? theme.colors.error
      : type === "success"
      ? theme.colors.success
      : theme.colors.textLighter};
  margin-top: ${({ theme }) => theme.spacing[1]};
  display: block;
  min-height: 1.2em; /* Reserve space to prevent layout shifts */
`;

const SignupPage = () => {
  const {
    signup,
    requestAuthMail,
    verifyAuthMail,
    checkLoginId,
    checkEmail,
    isLoadingAuth,
    authError,
    clearAuthError,
  } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    loginId: "",
    password: "",
    repeatPassword: "", // 이 필드는 API 요청 본문에 포함되어야 함
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
  });
  const [validationMessages, setValidationMessages] = useState({
    loginId: "",
    email: "",
  });
  const [authCode, setAuthCode] = useState("");
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [isEmailVerifying, setIsEmailVerifying] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [formOpMessage, setFormOpMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationMessages[name]) {
      setValidationMessages((prev) => ({ ...prev, [name]: "" }));
    }
    if (formOpMessage.text) setFormOpMessage({ type: "", text: "" });
    if (name === "email") {
      setIsEmailSent(false);
      setIsEmailVerified(false);
      setAuthCode("");
    }
  };

  const handleBlur = async (e) => {
    const { name, value } = e.target;
    if (!value.trim()) {
      setValidationMessages((prev) => ({ ...prev, [name]: "" }));
      return;
    }
    if (authError) clearAuthError();

    try {
      let response;
      if (name === "loginId") {
        response = await checkLoginId(value);
        setValidationMessages((prev) => ({
          ...prev,
          loginId: response?.isAvailable // API가 boolean을 isAvailable 필드에 담아 반환한다고 가정
            ? "사용 가능한 아이디입니다."
            : response?.message || "이미 사용 중인 아이디입니다.",
        }));
      } else if (name === "email") {
        response = await checkEmail(value);
        setValidationMessages((prev) => ({
          ...prev,
          email: response?.isAvailable // API가 boolean을 isAvailable 필드에 담아 반환한다고 가정
            ? "사용 가능한 이메일입니다."
            : response?.message || "이미 등록된 이메일입니다.",
        }));
      }
    } catch (error) {
      console.error(`Validation error for ${name}:`, error);
      setValidationMessages((prev) => ({
        ...prev,
        [name]: error.message || `확인 중 오류 발생`,
      }));
    }
  };

  const handleSendVerificationCode = async () => {
    if (authError) clearAuthError();
    setFormOpMessage({ type: "", text: "" });
    if (!formData.email) {
      setFormOpMessage({ type: "error", text: "이메일을 입력해주세요." });
      return;
    }
    try {
      const emailCheckResponse = await checkEmail(formData.email);
      // API가 isAvailable을 boolean으로 반환한다고 가정
      if (emailCheckResponse && emailCheckResponse.isAvailable === false) {
        // isAvailable이 명시적으로 false일 때만 중복으로 처리
        setValidationMessages((prev) => ({
          ...prev,
          email: emailCheckResponse.message || "이미 등록된 이메일입니다.",
        }));
        setFormOpMessage({
          type: "error",
          text:
            emailCheckResponse.message ||
            "이미 등록된 이메일입니다. 다른 이메일을 사용해주세요.",
        });
        return;
      }
    } catch (error) {
      setFormOpMessage({
        type: "error",
        text: "이메일 확인 중 오류: " + error.message,
      });
      return;
    }

    setIsEmailSending(true);
    const success = await requestAuthMail({
      email: formData.email,
      purpose: "회원가입", // API 명세에 purpose 필드가 있음
    });
    if (success) {
      setIsEmailSent(true);
      setFormOpMessage({
        type: "success",
        text: "인증 코드가 발송되었습니다. 이메일을 확인해주세요.",
      });
    } else {
      setFormOpMessage({
        type: "error",
        text: authError || "인증 코드 발송에 실패했습니다.",
      });
    }
    setIsEmailSending(false);
  };

  const handleVerifyCode = async () => {
    if (authError) clearAuthError();
    setFormOpMessage({ type: "", text: "" });
    if (!authCode) {
      setFormOpMessage({ type: "error", text: "인증 코드를 입력해주세요." });
      return;
    }
    setIsEmailVerifying(true);
    const success = await verifyAuthMail({
      email: formData.email,
      code: authCode,
    });
    if (success) {
      setIsEmailVerified(true);
      setFormOpMessage({
        type: "success",
        text: "이메일 인증이 완료되었습니다.",
      });
    } else {
      setFormOpMessage({
        type: "error",
        text: authError || "인증 코드가 올바르지 않습니다.",
      });
    }
    setIsEmailVerifying(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (authError) clearAuthError();
    setFormOpMessage({ type: "", text: "" });

    if (formData.password !== formData.repeatPassword) {
      setFormOpMessage({
        type: "error",
        text: "비밀번호가 일치하지 않습니다.",
      });
      return;
    }
    if (!isEmailVerified) {
      setFormOpMessage({
        type: "error",
        text: "이메일 인증을 먼저 완료해주세요.",
      });
      return;
    }
    const requiredFields = ["loginId", "password", "name", "email", "phone"];
    for (const field of requiredFields) {
      if (!formData[field]?.trim()) {
        setFormOpMessage({
          type: "error",
          text: `필수 항목 '${fieldToKorean(field)}'을(를) 입력해주세요.`,
        });
        return;
      }
    }
    const phonePattern = /^(010|011|016|017|018|019)-?\d{3,4}-?\d{4}$/;
    if (!phonePattern.test(formData.phone)) {
      setFormOpMessage({
        type: "error",
        text: "올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)",
      });
      return;
    }

    try {
      const finalLoginIdCheck = await checkLoginId(formData.loginId);
      if (finalLoginIdCheck && finalLoginIdCheck.isAvailable === false) {
        // isAvailable이 명시적으로 false일 때만 중복으로 처리
        setValidationMessages((prev) => ({
          ...prev,
          loginId: finalLoginIdCheck.message || "이미 사용 중인 아이디입니다.",
        }));
        setFormOpMessage({
          type: "error",
          text: "아이디가 중복됩니다. 다른 아이디를 사용해주세요.",
        });
        return;
      }
    } catch (error) {
      setFormOpMessage({
        type: "error",
        text: "가입 전 최종 아이디 확인 중 오류: " + error.message,
      });
      return;
    }

    // API 요청 본문에 repeatPassword 포함
    const signupData = {
      loginId: formData.loginId,
      password: formData.password,
      repeatPassword: formData.repeatPassword, // repeatPassword 포함
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      dateOfBirth: formData.dateOfBirth || undefined,
      gender: formData.gender || undefined,
    };

    const success = await signup(signupData);
    if (success) {
      setFormOpMessage({
        type: "success",
        text: "회원가입이 완료되었습니다! 잠시 후 로그인 페이지로 이동합니다.",
      });
      setTimeout(() => navigate("/login"), 2500);
    } else {
      setFormOpMessage({
        type: "error",
        text: authError || "회원가입에 실패했습니다. 다시 시도해주세요.",
      });
    }
  };

  const fieldToKorean = (field) => {
    const map = {
      loginId: "아이디",
      password: "비밀번호",
      name: "이름",
      email: "이메일",
      phone: "전화번호",
    };
    return map[field] || field;
  };

  return (
    <SignupPageWrapper>
      <PageTitle>회원가입</PageTitle>
      {formOpMessage.text && (
        <MessageUI type={formOpMessage.type}>{formOpMessage.text}</MessageUI>
      )}
      {authError && !formOpMessage.text && (
        <MessageUI type="error">{authError}</MessageUI>
      )}
      <Form onSubmit={handleSubmit}>
        <Input
          name="loginId"
          label="아이디"
          value={formData.loginId}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          maxLength="12"
          disabled={isLoadingAuth}
        />
        <FieldMessage
          type={
            validationMessages.loginId?.includes("사용 가능")
              ? "success"
              : validationMessages.loginId // 메시지가 있으면 error로 간주 (API 응답에 따라 조정)
              ? "error"
              : ""
          }
        >
          {validationMessages.loginId}
        </FieldMessage>

        <Grid>
          <Input
            name="password"
            label="비밀번호"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="8"
            maxLength="20"
            disabled={isLoadingAuth}
          />
          <Input
            name="repeatPassword"
            label="비밀번호 확인"
            type="password"
            value={formData.repeatPassword}
            onChange={handleChange}
            required
            disabled={isLoadingAuth}
          />
        </Grid>
        <Input
          name="name"
          label="이름"
          value={formData.name}
          onChange={handleChange}
          required
          disabled={isLoadingAuth}
        />

        <EmailVerificationSection>
          <Input
            name="email"
            label="이메일"
            type="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            disabled={
              isLoadingAuth ||
              isEmailVerified ||
              (isEmailSent && !isEmailVerified)
            }
          />
          {!isEmailVerified && (
            <Button
              type="button"
              onClick={handleSendVerificationCode}
              disabled={
                isLoadingAuth ||
                isEmailSending ||
                validationMessages.email?.includes("이미 등록된") // 이미 등록된 이메일이면 발송 버튼 비활성화
              }
              size="sm"
              style={{ whiteSpace: "nowrap" }}
            >
              {isEmailSending
                ? "전송 중..."
                : isEmailSent
                ? "코드 재전송"
                : "인증 코드 발송"}
            </Button>
          )}
        </EmailVerificationSection>
        <FieldMessage
          type={
            validationMessages.email?.includes("사용 가능")
              ? "success"
              : validationMessages.email
              ? "error"
              : ""
          }
        >
          {validationMessages.email}
        </FieldMessage>

        {isEmailSent && !isEmailVerified && (
          <EmailVerificationSection>
            <Input
              name="authCode"
              label="인증 코드"
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value)}
              required
              disabled={isLoadingAuth || isEmailVerifying}
            />
            <Button
              type="button"
              onClick={handleVerifyCode}
              disabled={isLoadingAuth || isEmailVerifying}
              size="sm"
              style={{ whiteSpace: "nowrap" }}
            >
              {isEmailVerifying ? "확인 중..." : "코드 확인"}
            </Button>
          </EmailVerificationSection>
        )}

        <Input
          name="phone"
          label="전화번호"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          required
          placeholder="010-1234-5678"
          disabled={isLoadingAuth}
        />
        <Grid>
          <Input
            name="dateOfBirth"
            label="생년월일 (선택)"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleChange}
            disabled={isLoadingAuth}
          />
          <Input
            name="gender"
            label="성별 (선택)"
            type="select"
            value={formData.gender}
            onChange={handleChange}
            disabled={isLoadingAuth}
          >
            <option value="">선택안함</option>
            <option value="Male">남성</option>
            <option value="Female">여성</option>
          </Input>
        </Grid>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={isLoadingAuth || !isEmailVerified}
        >
          {isLoadingAuth && !isEmailSending && !isEmailVerifying
            ? "가입 처리 중..."
            : "회원가입 완료"}
        </Button>
      </Form>
      <ExtraLinks>
        이미 계정이 있으신가요?
        <StyledLink to="/login">로그인</StyledLink>
      </ExtraLinks>
    </SignupPageWrapper>
  );
};

export default SignupPage;
