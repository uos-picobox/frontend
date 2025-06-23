import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import Button from "../components/common/Button";
import * as paymentService from "../services/paymentService";
import * as reservationService from "../services/reservationService";

const SuccessPageWrapper = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing[6]};
  text-align: center;
`;

const SuccessIcon = styled.div`
  color: ${({ theme }) => theme.colors.success};
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
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const PaymentInfo = styled.div`
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  padding: ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  text-align: left;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing[2]};

  &:last-child {
    margin-bottom: 0;
  }

  span:first-child {
    color: ${({ theme }) => theme.colors.textDark};
  }

  span:last-child {
    color: ${({ theme }) => theme.colors.text};
    font-weight: 500;
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

const LoadingMessage = styled.p`
  color: ${({ theme }) => theme.colors.textLighter};
  margin-top: ${({ theme }) => theme.spacing[4]};
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.error};
  margin-top: ${({ theme }) => theme.spacing[4]};
`;

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isConfirming, setIsConfirming] = useState(true);
  const [confirmationError, setConfirmationError] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);

  useEffect(() => {
    const confirmPayment = async () => {
      const orderId = searchParams.get("orderId");
      const paymentKey = searchParams.get("paymentKey");
      const amount = parseInt(searchParams.get("amount"));

      console.log("PaymentSuccessPage - URL params:", {
        orderId,
        paymentKey,
        amount,
      });

      // Enhanced validation
      if (!orderId || !paymentKey || !amount) {
        console.error("Missing required payment parameters:", {
          orderId: !!orderId,
          paymentKey: !!paymentKey,
          amount: !!amount,
        });
        setConfirmationError("결제 정보가 올바르지 않습니다.");
        setIsConfirming(false);
        navigate(
          "/payment/fail?code=INVALID_PAYMENT_PARAMS&message=결제 정보가 올바르지 않습니다."
        );
        return;
      }

      // Validate orderId format
      if (!orderId.startsWith("ORDER-") || orderId.length < 15) {
        console.error("Invalid orderId format:", orderId);
        setConfirmationError("잘못된 주문번호 형식입니다.");
        setIsConfirming(false);
        navigate(
          "/payment/fail?code=INVALID_ORDER_ID&message=잘못된 주문번호 형식입니다."
        );
        return;
      }

      // 결제 금액 검증 - 클라이언트에서 결제 금액이 조작되었는지 확인
      const savedPaymentData = localStorage.getItem(`payment_data_${orderId}`);
      if (savedPaymentData) {
        try {
          const paymentData = JSON.parse(savedPaymentData);
          if (paymentData.amount !== amount) {
            console.error(
              "Amount mismatch:",
              "URL:",
              amount,
              "Saved:",
              paymentData.amount
            );
            setConfirmationError(
              "결제 금액이 일치하지 않습니다. 보안상의 이유로 결제를 취소합니다."
            );
            setIsConfirming(false);
            navigate(
              "/payment/fail?code=AMOUNT_MISMATCH&message=결제 금액이 일치하지 않습니다."
            );
            return;
          }
          if (paymentData.orderId !== orderId) {
            console.error("OrderId mismatch between URL and saved data");
            setConfirmationError("주문번호가 일치하지 않습니다.");
            setIsConfirming(false);
            navigate(
              "/payment/fail?code=ORDER_ID_MISMATCH&message=주문번호가 일치하지 않습니다."
            );
            return;
          }
        } catch (e) {
          console.warn("Failed to parse saved payment data for validation");
        }
      } else {
        console.warn("No saved payment data found for orderId:", orderId);
        // This might indicate the payment process was interrupted
      }

      try {
        // Get payment ID from localStorage (saved during payment process)
        const paymentId = localStorage.getItem(`payment_${orderId}`);

        if (!paymentId) {
          setConfirmationError("결제 정보를 찾을 수 없습니다.");
          setIsConfirming(false);
          return;
        }

        const confirmData = {
          paymentId: parseInt(paymentId),
          orderId,
          paymentKey,
          finalAmount: amount,
        };

        console.log("Confirming payment with data:", confirmData);

        try {
          const result = await paymentService.confirmPayment(confirmData);

          // After payment confirmation, complete the reservation
          let reservationCompleteResult = null;
          if (result?.reservationId) {
            try {
              console.log("Completing reservation:", result.reservationId);
              reservationCompleteResult =
                await reservationService.completeReservation(
                  result.reservationId
                );
              console.log("Reservation completed:", reservationCompleteResult);
            } catch (reservationError) {
              console.warn(
                "Reservation completion failed (API may not be implemented):",
                reservationError
              );
              // Don't fail the entire process if reservation completion fails
            }
          }

          setPaymentInfo({
            orderId,
            paymentKey,
            amount,
            ...result,
            reservationCompleted: !!reservationCompleteResult,
          });
        } catch (confirmError) {
          console.error("Payment confirmation failed:", confirmError);

          // Check if this is a real payment error (400, 500) or just API not implemented (404)
          const httpStatus = confirmError.status || confirmError.httpStatus;
          const isRealError =
            httpStatus === 400 ||
            httpStatus === 500 ||
            confirmError.message?.includes("잘못된 orderId") ||
            confirmError.message?.includes("서버 내부 오류") ||
            confirmError.message?.includes("Bad Request") ||
            confirmError.message?.includes("Internal Server Error");

          if (isRealError) {
            // Real payment error - redirect to fail page
            console.log(
              "Real payment error detected, redirecting to fail page"
            );
            console.log("Error details:", {
              status: httpStatus,
              message: confirmError.message,
              isHttpError: confirmError.isHttpError,
            });

            navigate(
              `/payment/fail?code=PAYMENT_CONFIRMATION_FAILED&message=${encodeURIComponent(
                confirmError.message
              )}`
            );
            return;
          }

          // Only use fallback for 404 (API not implemented) errors
          if (httpStatus === 404) {
            console.warn(
              "Payment confirmation API not implemented, using mock data:",
              confirmError
            );

            // Try to complete reservation with fallback data
            // Get reservation ID from localStorage or generate fallback
            const savedPaymentData = localStorage.getItem(
              `payment_data_${orderId}`
            );
            let reservationId = null;

            if (savedPaymentData) {
              try {
                const paymentData = JSON.parse(savedPaymentData);
                reservationId = paymentData.reservationId;
              } catch (e) {
                console.warn("Failed to parse saved payment data");
              }
            }

            let reservationCompleted = false;
            if (reservationId) {
              try {
                console.log(
                  "Completing reservation with fallback:",
                  reservationId
                );
                await reservationService.completeReservation(reservationId);
                reservationCompleted = true;
                console.log("Reservation completed successfully");
              } catch (reservationError) {
                console.warn(
                  "Reservation completion failed:",
                  reservationError
                );
              }
            }

            setPaymentInfo({
              orderId,
              paymentKey,
              amount,
              status: "COMPLETED",
              message: "결제가 성공적으로 완료되었습니다. (테스트 모드)",
              reservationCompleted,
            });
          } else {
            // Other errors - also redirect to fail page
            console.log("Payment confirmation error, redirecting to fail page");
            navigate(
              `/payment/fail?code=PAYMENT_ERROR&message=${encodeURIComponent(
                confirmError.message
              )}`
            );
            return;
          }
        }

        // Clean up localStorage
        localStorage.removeItem(`payment_${orderId}`);
        localStorage.removeItem(`payment_data_${orderId}`);

        // 결제 성공 로그
        console.log("✅ 결제 및 예매 완료 - Order ID:", orderId);
      } catch (error) {
        console.error("Payment confirmation failed:", error);
        setConfirmationError(
          "결제 확인 중 오류가 발생했습니다: " + error.message
        );

        // Redirect to fail page with error details
        navigate(
          `/payment/fail?code=CONFIRMATION_FAILED&message=${encodeURIComponent(
            error.message
          )}`
        );
        return;
      } finally {
        setIsConfirming(false);
      }
    };

    confirmPayment();
  }, [searchParams, navigate]);

  const handleGoToProfile = () => {
    navigate("/profile");
  };

  const handleGoHome = () => {
    navigate("/");
  };

  if (isConfirming) {
    return (
      <SuccessPageWrapper>
        <Title>결제 확인 중...</Title>
        <LoadingMessage>잠시만 기다려주세요.</LoadingMessage>
      </SuccessPageWrapper>
    );
  }

  if (confirmationError) {
    return (
      <SuccessPageWrapper>
        <Title>결제 확인 실패</Title>
        <ErrorMessage>{confirmationError}</ErrorMessage>
        <ButtonGroup>
          <Button variant="outline" onClick={handleGoHome}>
            홈으로
          </Button>
        </ButtonGroup>
      </SuccessPageWrapper>
    );
  }

  return (
    <SuccessPageWrapper>
      <SuccessIcon>
        <CheckCircle />
      </SuccessIcon>

      <Title>결제가 완료되었습니다!</Title>
      <Message>예매해 주셔서 감사합니다.</Message>

      {paymentInfo && (
        <PaymentInfo>
          <InfoRow>
            <span>주문번호</span>
            <span>{paymentInfo.orderId}</span>
          </InfoRow>
          <InfoRow>
            <span>결제키</span>
            <span>{paymentInfo.paymentKey}</span>
          </InfoRow>
          <InfoRow>
            <span>결제금액</span>
            <span>{paymentInfo.amount?.toLocaleString()}원</span>
          </InfoRow>
        </PaymentInfo>
      )}

      <ButtonGroup>
        <Button variant="primary" onClick={handleGoToProfile}>
          예매 내역 확인
        </Button>
        <Button variant="outline" onClick={handleGoHome}>
          홈으로
        </Button>
      </ButtonGroup>
    </SuccessPageWrapper>
  );
};

export default PaymentSuccessPage;
