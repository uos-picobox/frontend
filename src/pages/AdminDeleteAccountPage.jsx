import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Shield, UserX } from "lucide-react";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import useAuth from "../hooks/useAuth";

const AdminDeleteAccountPageWrapper = styled.div`
  max-width: 600px;
  margin: ${({ theme }) => theme.spacing[8]} auto;
  background-color: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing[8]};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  box-shadow: ${({ theme }) => theme.shadows.lg};
`;

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing[8]};
`;

const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  color: ${({ theme }) => theme.colors.error};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const PageDescription = styled.p`
  color: ${({ theme }) => theme.colors.textLighter};
  font-size: ${({ theme }) => theme.fontSizes.lg};
`;

const WarningSection = styled.div`
  background-color: ${({ theme }) => theme.colors.error + "11"};
  border: 2px solid ${({ theme }) => theme.colors.error + "33"};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing[6]};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const WarningTitle = styled.h3`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.spacing[3]};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const WarningList = styled.ul`
  color: ${({ theme }) => theme.colors.textDark};
  padding-left: ${({ theme }) => theme.spacing[4]};

  li {
    margin-bottom: ${({ theme }) => theme.spacing[2]};
    line-height: 1.6;
  }
`;

const ConfirmationSection = styled.div`
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing[6]};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const ConfirmationTitle = styled.h3`
  color: ${({ theme }) => theme.colors.primaryLight};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const Checkbox = styled.input`
  margin-top: 4px;
  width: 18px;
  height: 18px;
  accent-color: ${({ theme }) => theme.colors.error};
`;

const CheckboxLabel = styled.label`
  color: ${({ theme }) => theme.colors.textDark};
  line-height: 1.5;
  cursor: pointer;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  margin-top: ${({ theme }) => theme.spacing[4]};
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

const AdminDeleteAccountPage = () => {
  const navigate = useNavigate();
  const { user, deleteAdminAccount, logout } = useAuth();
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
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

  const handleDeleteAccount = async (e) => {
    e.preventDefault();

    if (!confirmPassword.trim()) {
      showMessage("현재 비밀번호를 입력해주세요.", "error");
      return;
    }

    if (confirmText !== "관리자 탈퇴") {
      showMessage("확인 문구를 정확히 입력해주세요.", "error");
      return;
    }

    if (!agreedToTerms) {
      showMessage("탈퇴 약관에 동의해주세요.", "error");
      return;
    }

    setLoading(true);
    try {
      console.log("🔄 관리자 계정 삭제 요청");
      await deleteAdminAccount();
      console.log("✅ 관리자 계정 삭제 성공");
      showMessage("관리자 계정이 성공적으로 삭제되었습니다.", "success");

      // 2초 후 로그아웃 및 홈페이지로 이동
      setTimeout(() => {
        logout();
        navigate("/", { replace: true });
      }, 2000);
    } catch (error) {
      console.error("❌ 관리자 계정 삭제 실패:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "계정 삭제에 실패했습니다.";
      showMessage(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin");
  };

  return (
    <AdminDeleteAccountPageWrapper>
      <PageHeader>
        <PageTitle>
          <UserX size={32} />
          관리자 계정 탈퇴
        </PageTitle>
        <PageDescription>관리자 계정을 영구적으로 삭제합니다.</PageDescription>
      </PageHeader>

      {message && <MessageBox className={messageType}>{message}</MessageBox>}

      <WarningSection>
        <WarningTitle>
          <AlertTriangle size={24} />
          경고: 계정 삭제 시 주의사항
        </WarningTitle>
        <WarningList>
          <li>
            <strong>모든 관리자 권한이 영구적으로 삭제됩니다.</strong>
          </li>
          <li>관리 기록 및 설정 정보가 모두 삭제됩니다.</li>
          <li>삭제된 계정은 복구할 수 없습니다.</li>
          <li>동일한 아이디로 재가입이 불가능할 수 있습니다.</li>
          <li>진행 중인 관리 업무가 있다면 먼저 완료해주세요.</li>
        </WarningList>
      </WarningSection>

      <ConfirmationSection>
        <ConfirmationTitle>
          <Shield size={24} />
          계정 삭제 확인
        </ConfirmationTitle>

        <Form onSubmit={handleDeleteAccount}>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            label="현재 비밀번호"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="현재 비밀번호를 입력하세요"
            required
          />

          <Input
            id="confirmText"
            name="confirmText"
            label='확인 문구 입력 (정확히 "관리자 탈퇴"라고 입력하세요)'
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="관리자 탈퇴"
            required
          />

          <CheckboxWrapper>
            <Checkbox
              id="agreedToTerms"
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
            />
            <CheckboxLabel htmlFor="agreedToTerms">
              위의 모든 내용을 확인했으며, 관리자 계정 삭제에 동의합니다.
              <br />
              <strong>이 작업은 되돌릴 수 없음을 이해합니다.</strong>
            </CheckboxLabel>
          </CheckboxWrapper>

          <ButtonGroup>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              fullWidth
            >
              취소
            </Button>
            <Button type="submit" variant="danger" disabled={loading} fullWidth>
              {loading ? "계정 삭제 중..." : "관리자 계정 삭제"}
            </Button>
          </ButtonGroup>
        </Form>
      </ConfirmationSection>

      {user && (
        <div
          style={{
            textAlign: "center",
            color: "#666",
            fontSize: "0.9rem",
            marginTop: "2rem",
          }}
        >
          현재 로그인된 관리자: <strong>{user.name || user.loginId}</strong>
        </div>
      )}
    </AdminDeleteAccountPageWrapper>
  );
};

export default AdminDeleteAccountPage;
