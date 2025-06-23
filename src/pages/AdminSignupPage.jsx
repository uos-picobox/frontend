import React, { useState } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import * as authService from "../services/authService";

const AdminSignupPageWrapper = styled.div`
  max-width: 500px;
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

const AdminBadge = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 600;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const InputGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: ${({ theme }) => theme.spacing[2]};
  align-items: end;
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

const ValidationMessage = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  margin-top: ${({ theme }) => theme.spacing[1]};
  display: block;

  &.success {
    color: ${({ theme }) => theme.colors.success};
  }

  &.error {
    color: ${({ theme }) => theme.colors.error};
  }
`;

const EmailVerificationSection = styled.div`
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  padding: ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin: ${({ theme }) => theme.spacing[4]} 0;

  h4 {
    color: ${({ theme }) => theme.colors.primaryLight};
    margin-bottom: ${({ theme }) => theme.spacing[3]};
    font-size: ${({ theme }) => theme.fontSizes.lg};
  }

  .verification-step {
    margin-bottom: ${({ theme }) => theme.spacing[3]};

    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const RoleSelector = styled.div`
  .role-option {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing[2]};
    padding: ${({ theme }) => theme.spacing[2]};
    border: 2px solid ${({ theme }) => theme.colors.disabled + "44"};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    margin-bottom: ${({ theme }) => theme.spacing[2]};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: ${({ theme }) => theme.colors.primary + "66"};
    }

    &.selected {
      border-color: ${({ theme }) => theme.colors.primary};
      background-color: ${({ theme }) => theme.colors.primary + "11"};
    }

    input[type="radio"] {
      width: auto;
      height: auto;
    }

    .role-info {
      flex: 1;

      .role-name {
        font-weight: 600;
        color: ${({ theme }) => theme.colors.text};
        margin-bottom: ${({ theme }) => theme.spacing[1]};
      }

      .role-description {
        font-size: ${({ theme }) => theme.fontSizes.sm};
        color: ${({ theme }) => theme.colors.textDark};
      }
    }
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

const AdminSignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    loginId: "",
    password: "",
    repeatPassword: "",
    name: "",
    email: "",
    role: "BASIC",
    adminCode: "",
  });

  const [validationStatus, setValidationStatus] = useState({
    loginId: null,
    email: null,
  });

  const [emailVerification, setEmailVerification] = useState({
    isRequested: false,
    code: "",
    isVerified: false,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear validation status when user modifies input
    if (field === "loginId" || field === "email") {
      setValidationStatus((prev) => ({ ...prev, [field]: null }));
    }
  };

  const checkLoginIdAvailability = async () => {
    if (!formData.loginId.trim()) {
      setValidationStatus((prev) => ({
        ...prev,
        loginId: { isAvailable: false, message: "아이디를 입력해주세요." },
      }));
      return;
    }

    setLoading(true);
    try {
      const result = await authService.checkAdminLoginIdAvailability(
        formData.loginId
      );
      if (result && result.isAvailable !== false) {
        setValidationStatus((prev) => ({
          ...prev,
          loginId: {
            isAvailable: true,
            message: "사용 가능한 아이디입니다.",
          },
        }));
        showMessage("사용 가능한 아이디입니다.", "success");
      } else {
        setValidationStatus((prev) => ({
          ...prev,
          loginId: {
            isAvailable: false,
            message: "이미 사용 중인 아이디입니다.",
          },
        }));
        showMessage("이미 사용 중인 아이디입니다.", "error");
      }
    } catch (error) {
      setValidationStatus((prev) => ({
        ...prev,
        loginId: {
          isAvailable: false,
          message: error.message || "중복 확인 중 오류가 발생했습니다.",
        },
      }));
      showMessage(
        error.message || "중복 확인 중 오류가 발생했습니다.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const checkEmailAvailability = async () => {
    if (!formData.email.trim()) {
      setValidationStatus((prev) => ({
        ...prev,
        email: { isAvailable: false, message: "이메일을 입력해주세요." },
      }));
      return;
    }

    setLoading(true);
    try {
      const result = await authService.checkAdminEmailAvailability(
        formData.email
      );
      if (result && result.isAvailable !== false) {
        setValidationStatus((prev) => ({
          ...prev,
          email: {
            isAvailable: true,
            message: "사용 가능한 이메일입니다.",
          },
        }));
        showMessage("사용 가능한 이메일입니다.", "success");
      } else {
        setValidationStatus((prev) => ({
          ...prev,
          email: {
            isAvailable: false,
            message: "이미 사용 중인 이메일입니다.",
          },
        }));
        showMessage("이미 사용 중인 이메일입니다.", "error");
      }
    } catch (error) {
      setValidationStatus((prev) => ({
        ...prev,
        email: {
          isAvailable: false,
          message: error.message || "중복 확인 중 오류가 발생했습니다.",
        },
      }));
      showMessage(
        error.message || "중복 확인 중 오류가 발생했습니다.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const requestEmailVerification = async () => {
    if (!formData.email.trim()) {
      showMessage("이메일을 먼저 입력해주세요.", "error");
      return;
    }

    setLoading(true);
    try {
      await authService.requestAdminAuthMail({
        email: formData.email,
        purpose: "관리자 이메일 인증",
      });
      setEmailVerification((prev) => ({ ...prev, isRequested: true }));
      showMessage("인증코드가 이메일로 전송되었습니다.", "success");
    } catch (error) {
      showMessage(error.message || "인증코드 전송에 실패했습니다.", "error");
    } finally {
      setLoading(false);
    }
  };

  const verifyEmailCode = async () => {
    if (!emailVerification.code.trim()) {
      showMessage("인증코드를 입력해주세요.", "error");
      return;
    }

    setLoading(true);
    try {
      await authService.verifyAdminAuthMail({
        email: formData.email,
        code: emailVerification.code,
      });
      setEmailVerification((prev) => ({ ...prev, isVerified: true }));
      showMessage("이메일 인증이 완료되었습니다.", "success");
    } catch (error) {
      showMessage(error.message || "인증에 실패했습니다.", "error");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.loginId.trim()) {
      showMessage("아이디를 입력해주세요.", "error");
      return false;
    }

    if (!validationStatus.loginId?.isAvailable) {
      showMessage("아이디 중복 확인을 해주세요.", "error");
      return false;
    }

    if (formData.password.length < 8) {
      showMessage("비밀번호는 8자 이상이어야 합니다.", "error");
      return false;
    }

    if (formData.password !== formData.repeatPassword) {
      showMessage("비밀번호가 일치하지 않습니다.", "error");
      return false;
    }

    if (!formData.name.trim()) {
      showMessage("이름을 입력해주세요.", "error");
      return false;
    }

    if (!formData.email.trim()) {
      showMessage("이메일을 입력해주세요.", "error");
      return false;
    }

    if (!validationStatus.email?.isAvailable) {
      showMessage("이메일 중복 확인을 해주세요.", "error");
      return false;
    }

    if (!emailVerification.isVerified) {
      showMessage("이메일 인증을 완료해주세요.", "error");
      return false;
    }

    if (!formData.adminCode.trim()) {
      showMessage("관리자 코드를 입력해주세요.", "error");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      await authService.adminSignup(formData);
      showMessage("관리자 회원가입이 완료되었습니다!", "success");
      setTimeout(() => {
        navigate("/admin/login");
      }, 2000);
    } catch (error) {
      showMessage(error.message || "회원가입에 실패했습니다.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminSignupPageWrapper>
      <AdminBadge>🛡️ 관리자 회원가입</AdminBadge>
      <PageTitle>관리자 등록</PageTitle>

      {message && <MessageBox className={messageType}>{message}</MessageBox>}

      <Form onSubmit={handleSubmit}>
        <InputGroup>
          <div>
            <Input
              id="loginId"
              name="loginId"
              label="아이디"
              type="text"
              value={formData.loginId}
              onChange={(e) => handleInputChange("loginId", e.target.value)}
              placeholder="아이디를 입력하세요"
              required
            />
            {validationStatus.loginId && (
              <ValidationMessage
                className={
                  validationStatus.loginId.isAvailable ? "success" : "error"
                }
              >
                {validationStatus.loginId.message}
              </ValidationMessage>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={checkLoginIdAvailability}
            disabled={loading}
          >
            중복확인
          </Button>
        </InputGroup>

        <Input
          id="password"
          name="password"
          label="비밀번호"
          type="password"
          value={formData.password}
          onChange={(e) => handleInputChange("password", e.target.value)}
          placeholder="8자 이상 입력하세요"
          required
        />

        <Input
          id="repeatPassword"
          name="repeatPassword"
          label="비밀번호 확인"
          type="password"
          value={formData.repeatPassword}
          onChange={(e) => handleInputChange("repeatPassword", e.target.value)}
          placeholder="비밀번호를 다시 입력하세요"
          required
        />

        <Input
          id="name"
          name="name"
          label="이름"
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          placeholder="이름을 입력하세요"
          required
        />

        <InputGroup>
          <div>
            <Input
              id="email"
              name="email"
              label="이메일"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="이메일을 입력하세요"
              required
            />
            {validationStatus.email && (
              <ValidationMessage
                className={
                  validationStatus.email.isAvailable ? "success" : "error"
                }
              >
                {validationStatus.email.message}
              </ValidationMessage>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={checkEmailAvailability}
            disabled={loading}
          >
            중복확인
          </Button>
        </InputGroup>

        <EmailVerificationSection>
          <h4>이메일 인증</h4>
          <div className="verification-step">
            <Button
              type="button"
              variant={emailVerification.isRequested ? "outline" : "primary"}
              size="sm"
              onClick={requestEmailVerification}
              disabled={
                loading || !formData.email || emailVerification.isVerified
              }
              fullWidth
            >
              {emailVerification.isVerified ? "인증 완료" : "인증코드 전송"}
            </Button>
          </div>

          {emailVerification.isRequested && !emailVerification.isVerified && (
            <div className="verification-step">
              <InputGroup>
                <Input
                  id="emailCode"
                  name="emailCode"
                  label="인증코드"
                  type="text"
                  value={emailVerification.code}
                  onChange={(e) =>
                    setEmailVerification((prev) => ({
                      ...prev,
                      code: e.target.value,
                    }))
                  }
                  placeholder="이메일로 받은 인증코드 입력"
                />
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={verifyEmailCode}
                  disabled={loading}
                >
                  인증
                </Button>
              </InputGroup>
            </div>
          )}
        </EmailVerificationSection>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "500",
            }}
          >
            관리자 권한
          </label>
          <RoleSelector>
            <div
              className={`role-option ${
                formData.role === "BASIC" ? "selected" : ""
              }`}
              onClick={() => handleInputChange("role", "BASIC")}
            >
              <input
                type="radio"
                name="role"
                value="BASIC"
                checked={formData.role === "BASIC"}
                onChange={(e) => handleInputChange("role", e.target.value)}
              />
              <div className="role-info">
                <div className="role-name">일반 관리자</div>
                <div className="role-description">
                  기본적인 관리 기능 사용 가능
                </div>
              </div>
            </div>
            <div
              className={`role-option ${
                formData.role === "SUPER" ? "selected" : ""
              }`}
              onClick={() => handleInputChange("role", "SUPER")}
            >
              <input
                type="radio"
                name="role"
                value="SUPER"
                checked={formData.role === "SUPER"}
                onChange={(e) => handleInputChange("role", e.target.value)}
              />
              <div className="role-info">
                <div className="role-name">슈퍼 관리자</div>
                <div className="role-description">
                  모든 관리 기능 및 시스템 설정 가능
                </div>
              </div>
            </div>
          </RoleSelector>
        </div>

        <Input
          id="adminCode"
          name="adminCode"
          label="관리자 코드"
          type="password"
          value={formData.adminCode}
          onChange={(e) => handleInputChange("adminCode", e.target.value)}
          placeholder="관리자 등록 코드를 입력하세요"
          required
        />

        <Button type="submit" variant="primary" fullWidth disabled={loading}>
          {loading ? "가입 처리 중..." : "관리자 회원가입"}
        </Button>
      </Form>

      <StyledLink to="/admin/login">관리자 로그인으로 돌아가기</StyledLink>
    </AdminSignupPageWrapper>
  );
};

export default AdminSignupPage;
