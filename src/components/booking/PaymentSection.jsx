import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import {
  CreditCard,
  Smartphone,
  Building,
  Globe,
  RefreshCw,
} from "lucide-react";
import Button from "../common/Button";
import * as paymentService from "../../services/paymentService";
import * as pointService from "../../services/pointService";

const PaymentWrapper = styled.div`
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  padding: ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const SectionTitle = styled.h4`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

const DiscountSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const DiscountSelect = styled.select`
  width: 100%;
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const PointSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const PointBalanceWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const PointBalanceInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const PointBalance = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
`;

const RefreshButton = styled(Button).attrs({
  variant: "outline",
  size: "sm",
})`
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[2]};
  font-size: ${({ theme }) => theme.fontSizes.xs};
`;

const PointInputWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing[2]};
`;

const PointInput = styled.input`
  flex: 1;
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.surfaceLight};
    cursor: not-allowed;
  }
`;

const UseAllPointsButton = styled(Button).attrs({
  variant: "outline",
  size: "sm",
})`
  margin-left: ${({ theme }) => theme.spacing[2]};
`;

const PointInfo = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textLighter};
  margin-top: ${({ theme }) => theme.spacing[1]};
`;

const PointError = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.error};
  margin-top: ${({ theme }) => theme.spacing[1]};
`;

const MinAmountWarning = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.warning || "#f59e0b"};
  margin-top: ${({ theme }) => theme.spacing[1]};
  font-weight: 500;
`;

const PaymentMethodSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const PaymentMethodGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${({ theme }) => theme.spacing[2]};
  margin-top: ${({ theme }) => theme.spacing[2]};
`;

const PaymentMethodButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${({ theme }) => theme.spacing[3]};
  border: 2px solid
    ${({ theme, isActive }) =>
      isActive ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ theme, isActive }) =>
    isActive ? theme.colors.primary + "11" : theme.colors.surface};
  color: ${({ theme, isActive }) =>
    isActive ? theme.colors.primary : theme.colors.text};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => theme.colors.primary + "11"};
  }

  svg {
    margin-bottom: ${({ theme }) => theme.spacing[1]};
  }

  span {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    font-weight: 500;
  }
`;

const PriceBreakdown = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding-top: ${({ theme }) => theme.spacing[3]};
  margin-top: ${({ theme }) => theme.spacing[3]};
`;

const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing[2]};

  span:first-child {
    color: ${({ theme }) => theme.colors.textDark};
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }

  span:last-child {
    color: ${({ theme }) => theme.colors.text};
    font-weight: 500;
  }
`;

const FinalPriceRow = styled(PriceRow)`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding-top: ${({ theme }) => theme.spacing[2]};
  margin-top: ${({ theme }) => theme.spacing[2]};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: bold;

  span:last-child {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const PaymentMethods = {
  CARD: { label: "카드결제", icon: CreditCard },
  TRANSFER: { label: "계좌이체", icon: Building },
  VIRTUAL_ACCOUNT: { label: "가상계좌", icon: Building },
  MOBILE_PHONE: { label: "휴대폰결제", icon: Smartphone },
  CULTURE_GIFT_CERTIFICATE: { label: "문화상품권", icon: CreditCard },
  FOREIGN_EASY_PAY: { label: "페이팔", icon: Globe },
};

const PaymentSection = ({
  originalAmount,
  onPaymentReady,
  isProcessing = false,
}) => {
  const [discounts, setDiscounts] = useState([]);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [availablePoints, setAvailablePoints] = useState(0);
  const [usePoints, setUsePoints] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("CARD");
  const [isLoading, setIsLoading] = useState(false);
  const [pointError, setPointError] = useState("");
  const [isRefreshingPoints, setIsRefreshingPoints] = useState(false);

  // 최소 결제 금액 (Toss Payments 기준)
  const MIN_PAYMENT_AMOUNT = 100;

  // Load discounts and points on mount
  useEffect(() => {
    loadPaymentOptions();
  }, []);

  const loadPaymentOptions = async () => {
    setIsLoading(true);
    setPointError("");

    try {
      const [discountData, pointData] = await Promise.all([
        paymentService.getDiscountList(),
        loadPointBalance(),
      ]);

      setDiscounts(discountData || []);
    } catch (error) {
      console.error("Failed to load payment options:", error);
      setPointError("결제 정보를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadPointBalance = async () => {
    try {
      const pointData = await pointService.getPointBalance();
      console.log("Point balance data:", pointData);

      // 포인트 잔액 추출 (다양한 응답 형태 지원)
      let balance = 0;
      if (pointData) {
        if (typeof pointData === "number") {
          balance = pointData;
        } else if (typeof pointData === "object") {
          balance =
            pointData.balance ||
            pointData.points ||
            pointData.point ||
            pointData.amount ||
            pointData.value ||
            0;
        }
      }

      // 음수나 NaN 방지
      balance = Math.max(0, parseInt(balance) || 0);

      setAvailablePoints(balance);
      console.log("Available points set to:", balance);

      return balance;
    } catch (error) {
      console.error("Failed to load point balance:", error);
      setPointError("포인트 잔액을 불러올 수 없습니다.");
      setAvailablePoints(0);
      return 0;
    }
  };

  const refreshPointBalance = async () => {
    setIsRefreshingPoints(true);
    setPointError("");

    try {
      await loadPointBalance();
    } catch (error) {
      console.error("Failed to refresh point balance:", error);
      setPointError("포인트 잔액을 새로고침하는 중 오류가 발생했습니다.");
    } finally {
      setIsRefreshingPoints(false);
    }
  };

  // Calculate discount amount
  const discountAmount = useMemo(() => {
    if (!selectedDiscount) return 0;

    if (selectedDiscount.discountAmount) {
      return Math.min(selectedDiscount.discountAmount, originalAmount);
    }

    if (selectedDiscount.discountRate) {
      return Math.floor(originalAmount * (selectedDiscount.discountRate / 100));
    }

    return 0;
  }, [selectedDiscount, originalAmount]);

  // Calculate amounts
  const afterDiscountAmount = originalAmount - discountAmount;
  const maxUsablePoints = Math.min(availablePoints, afterDiscountAmount);
  const finalAmount = Math.max(0, afterDiscountAmount - usePoints);

  // Validate if final amount meets minimum payment requirement
  const isValidPaymentAmount =
    finalAmount === 0 || finalAmount >= MIN_PAYMENT_AMOUNT;
  const needsMinAmountAdjustment =
    finalAmount > 0 && finalAmount < MIN_PAYMENT_AMOUNT;

  // Handle point input with validation
  const handlePointChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    const validatedValue = Math.min(Math.max(0, value), maxUsablePoints);

    setUsePoints(validatedValue);
    setPointError("");

    // Check if the resulting amount would be below minimum
    const resultingAmount = afterDiscountAmount - validatedValue;
    if (resultingAmount > 0 && resultingAmount < MIN_PAYMENT_AMOUNT) {
      setPointError(
        `최소 결제 금액 ${MIN_PAYMENT_AMOUNT}원을 만족하려면 포인트를 ${
          afterDiscountAmount - MIN_PAYMENT_AMOUNT
        }P 이하로 사용하거나 전액 사용해주세요.`
      );
    }
  };

  const handleUseAllPoints = () => {
    const maxPoints = Math.min(availablePoints, afterDiscountAmount);
    setUsePoints(maxPoints);
    setPointError("");
  };

  // Suggest optimal point usage for minimum payment
  const handleOptimalPointUsage = () => {
    if (needsMinAmountAdjustment) {
      const optimalPoints = afterDiscountAmount - MIN_PAYMENT_AMOUNT;
      if (optimalPoints >= 0 && optimalPoints <= availablePoints) {
        setUsePoints(optimalPoints);
        setPointError("");
      }
    }
  };

  // Handle payment method selection
  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
  };

  // Memoize payment data to prevent unnecessary re-renders
  const paymentData = useMemo(() => {
    const data = {
      paymentMethod: selectedPaymentMethod,
      selectedDiscount,
      usePoints,
      originalAmount,
      discountAmount,
      finalAmount,
      isValidPayment: isValidPaymentAmount,
      availablePoints,
      maxUsablePoints,
    };

    console.log("Payment data updated:", data);
    return data;
  }, [
    selectedPaymentMethod,
    selectedDiscount,
    usePoints,
    originalAmount,
    discountAmount,
    finalAmount,
    isValidPaymentAmount,
    availablePoints,
    maxUsablePoints,
  ]);

  // Notify parent component about payment readiness
  useEffect(() => {
    if (onPaymentReady) {
      onPaymentReady(paymentData);
    }
  }, [paymentData, onPaymentReady]);

  if (isLoading) {
    return (
      <PaymentWrapper>
        <SectionTitle>결제 수단</SectionTitle>
        <p>결제 정보를 불러오는 중...</p>
      </PaymentWrapper>
    );
  }

  return (
    <PaymentWrapper>
      <SectionTitle>결제 수단</SectionTitle>

      {/* Discount Selection */}
      {discounts.length > 0 && (
        <DiscountSection>
          <label>할인 선택</label>
          <DiscountSelect
            value={selectedDiscount?.id || ""}
            onChange={(e) => {
              const discountId = e.target.value;
              const discount = discounts.find(
                (d) => d.id.toString() === discountId
              );
              setSelectedDiscount(discount || null);
              // Reset points when discount changes
              setUsePoints(0);
              setPointError("");
            }}
            disabled={isProcessing}
          >
            <option value="">할인 선택 안함</option>
            {discounts.map((discount) => (
              <option key={discount.id} value={discount.id}>
                {discount.providerName} - {discount.description} (
                {discount.discountRate
                  ? `${discount.discountRate}%`
                  : `${discount.discountAmount?.toLocaleString()}원`}{" "}
                할인)
              </option>
            ))}
          </DiscountSelect>
        </DiscountSection>
      )}

      {/* Point Usage */}
      <PointSection>
        <PointBalanceWrapper>
          <label>포인트 사용</label>
          <PointBalanceInfo>
            <PointBalance>
              보유: {availablePoints.toLocaleString()}P
            </PointBalance>
            <RefreshButton
              onClick={refreshPointBalance}
              disabled={isRefreshingPoints || isProcessing}
            >
              <RefreshCw size={12} />
              {isRefreshingPoints ? "새로고침중" : "새로고침"}
            </RefreshButton>
          </PointBalanceInfo>
        </PointBalanceWrapper>

        {availablePoints > 0 ? (
          <>
            <PointInputWrapper>
              <PointInput
                type="number"
                value={usePoints}
                onChange={handlePointChange}
                placeholder="사용할 포인트"
                min="0"
                max={maxUsablePoints}
                disabled={isProcessing}
              />
              <UseAllPointsButton
                onClick={handleUseAllPoints}
                disabled={isProcessing || maxUsablePoints === 0}
              >
                전액 사용
              </UseAllPointsButton>
            </PointInputWrapper>

            <PointInfo>
              최대 {maxUsablePoints.toLocaleString()}P 사용 가능
              {needsMinAmountAdjustment && (
                <>
                  <br />
                  <Button
                    variant="text"
                    size="sm"
                    onClick={handleOptimalPointUsage}
                    style={{
                      padding: "0",
                      fontSize: "inherit",
                      textDecoration: "underline",
                    }}
                  >
                    {(
                      afterDiscountAmount - MIN_PAYMENT_AMOUNT
                    ).toLocaleString()}
                    P 사용하여 최소 결제금액 맞추기
                  </Button>
                </>
              )}
            </PointInfo>

            {pointError && <PointError>{pointError}</PointError>}

            {needsMinAmountAdjustment && (
              <MinAmountWarning>
                ⚠️ 최소 결제 금액은 {MIN_PAYMENT_AMOUNT}원입니다. 포인트를
                조정하거나 전액 사용해주세요.
              </MinAmountWarning>
            )}
          </>
        ) : (
          <PointInfo>
            사용 가능한 포인트가 없습니다.
            {pointError && <PointError>{pointError}</PointError>}
          </PointInfo>
        )}
      </PointSection>

      {/* Payment Method Selection */}
      <PaymentMethodSection>
        <label>결제 수단 선택</label>
        <PaymentMethodGrid>
          {Object.entries(PaymentMethods).map(
            ([method, { label, icon: Icon }]) => (
              <PaymentMethodButton
                key={method}
                isActive={selectedPaymentMethod === method}
                onClick={() => handlePaymentMethodSelect(method)}
                disabled={isProcessing}
              >
                <Icon size={24} />
                <span>{label}</span>
              </PaymentMethodButton>
            )
          )}
        </PaymentMethodGrid>
      </PaymentMethodSection>

      {/* Price Breakdown */}
      <PriceBreakdown>
        <PriceRow>
          <span>원래 금액</span>
          <span>{originalAmount.toLocaleString()}원</span>
        </PriceRow>
        {discountAmount > 0 && (
          <PriceRow>
            <span>할인 금액</span>
            <span>-{discountAmount.toLocaleString()}원</span>
          </PriceRow>
        )}
        {usePoints > 0 && (
          <PriceRow>
            <span>포인트 사용</span>
            <span>-{usePoints.toLocaleString()}P</span>
          </PriceRow>
        )}
        <FinalPriceRow>
          <span>최종 결제 금액</span>
          <span
            style={{
              color: !isValidPaymentAmount ? "#dc3545" : undefined,
            }}
          >
            {finalAmount.toLocaleString()}원
            {!isValidPaymentAmount && finalAmount > 0 && (
              <small
                style={{
                  display: "block",
                  fontSize: "0.7em",
                  fontWeight: "normal",
                }}
              >
                (최소 {MIN_PAYMENT_AMOUNT}원 필요)
              </small>
            )}
          </span>
        </FinalPriceRow>
      </PriceBreakdown>
    </PaymentWrapper>
  );
};

export default PaymentSection;
