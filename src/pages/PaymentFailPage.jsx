import React from "react";
import styled from "styled-components";
import { useSearchParams, useNavigate } from "react-router-dom";
import { XCircle } from "lucide-react";
import Button from "../components/common/Button";

const FailPageWrapper = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing[6]};
  text-align: center;
`;

const FailIcon = styled.div`
  color: ${({ theme }) => theme.colors.error};
  margin-bottom: ${({ theme }) => theme.spacing[4]};

  svg {
    width: 80px;
    height: 80px;
  }
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const Message = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.textLighter};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const ErrorInfo = styled.div`
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  padding: ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  text-align: left;
`;

const ErrorRow = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[2]};

  &:last-child {
    margin-bottom: 0;
  }

  strong {
    color: ${({ theme }) => theme.colors.text};
    display: block;
    margin-bottom: ${({ theme }) => theme.spacing[1]};
  }

  span {
    color: ${({ theme }) => theme.colors.textDark};
    font-family: monospace;
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  justify-content: center;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
  }
`;

const PaymentFailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const errorCode = searchParams.get("code");
  const errorMessage = searchParams.get("message");

  const handleRetry = () => {
    // Go back to the previous page or booking page
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const getErrorDescription = (code) => {
    const errorDescriptions = {
      // 결제 취소/중단 관련
      PAY_PROCESS_CANCELED: "사용자가 결제를 취소했습니다.",
      PAY_PROCESS_ABORTED: "결제 진행 중 오류가 발생했습니다.",

      // 카드 관련 오류
      REJECT_CARD_COMPANY:
        "카드사에서 결제를 거절했습니다. 카드 정보를 확인해주세요.",
      INSUFFICIENT_FUNDS: "잔액이 부족합니다.",
      INVALID_CARD: "유효하지 않은 카드입니다.",
      CARD_NOT_SUPPORTED: "지원하지 않는 카드입니다.",
      EXCEED_MAX_DAILY_PAYMENT_COUNT: "일일 결제 한도를 초과했습니다.",
      EXCEED_MAX_ONE_DAY_PAYMENT_AMOUNT: "일일 결제 금액 한도를 초과했습니다.",

      // API 관련 오류
      UNAUTHORIZED_KEY: "API 키가 올바르지 않습니다.",
      NOT_FOUND_PAYMENT_SESSION:
        "결제 시간이 만료되어 결제 진행 데이터가 존재하지 않습니다.",
      FORBIDDEN_REQUEST:
        "요청이 거부되었습니다. 주문번호나 결제 정보를 확인해주세요.",

      // 기타 오류
      CONFIRMATION_FAILED: "결제 확인 중 오류가 발생했습니다.",
      NETWORK_ERROR: "네트워크 오류가 발생했습니다.",
      TIMEOUT: "결제 시간이 초과되었습니다.",
    };

    return errorDescriptions[code] || "알 수 없는 오류가 발생했습니다.";
  };

  return (
    <FailPageWrapper>
      <FailIcon>
        <XCircle />
      </FailIcon>

      <Title>결제에 실패했습니다</Title>
      <Message>결제 처리 중 문제가 발생했습니다.</Message>

      {(errorCode || errorMessage) && (
        <ErrorInfo>
          {errorCode && (
            <ErrorRow>
              <strong>오류 코드</strong>
              <span>{errorCode}</span>
            </ErrorRow>
          )}
          <ErrorRow>
            <strong>오류 내용</strong>
            <span>{errorMessage || getErrorDescription(errorCode)}</span>
          </ErrorRow>
        </ErrorInfo>
      )}

      <ButtonGroup>
        <Button variant="primary" onClick={handleRetry}>
          다시 시도
        </Button>
        <Button variant="outline" onClick={handleGoHome}>
          홈으로
        </Button>
      </ButtonGroup>
    </FailPageWrapper>
  );
};

export default PaymentFailPage;
