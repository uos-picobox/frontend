import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { CreditCard, Smartphone, Building, Globe } from "lucide-react";
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

  // Load discounts and points on mount
  useEffect(() => {
    const loadPaymentOptions = async () => {
      setIsLoading(true);
      try {
        const [discountData, pointData] = await Promise.all([
          paymentService.getDiscountList(),
          pointService.getPointBalance(),
        ]);

        setDiscounts(discountData || []);
        setAvailablePoints(pointData?.balance || 0);
      } catch (error) {
        console.error("Failed to load payment options:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPaymentOptions();
  }, []);

  // Calculate final amount
  const discountAmount = selectedDiscount
    ? selectedDiscount.discountAmount ||
      Math.floor(originalAmount * (selectedDiscount.discountRate / 100))
    : 0;

  const afterDiscountAmount = originalAmount - discountAmount;
  const finalAmount = Math.max(0, afterDiscountAmount - usePoints);

  // Handle point input
  const handlePointChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    const maxPoints = Math.min(availablePoints, afterDiscountAmount);
    setUsePoints(Math.min(value, maxPoints));
  };

  const handleUseAllPoints = () => {
    const maxPoints = Math.min(availablePoints, afterDiscountAmount);
    setUsePoints(maxPoints);
  };

  // Handle payment method selection
  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
  };

  // Memoize payment data to prevent unnecessary re-renders
  const paymentData = useMemo(
    () => ({
      paymentMethod: selectedPaymentMethod,
      selectedDiscount,
      usePoints,
      originalAmount,
      discountAmount,
      finalAmount,
    }),
    [
      selectedPaymentMethod,
      selectedDiscount,
      usePoints,
      originalAmount,
      discountAmount,
      finalAmount,
    ]
  );

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
            }}
          >
            <option value="">할인 선택 안함</option>
            {discounts.map((discount) => (
              <option key={discount.id} value={discount.id}>
                {discount.providerName} - {discount.description}(
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
      {availablePoints > 0 && (
        <PointSection>
          <label>포인트 사용</label>
          <PointInputWrapper>
            <PointInput
              type="number"
              value={usePoints}
              onChange={handlePointChange}
              placeholder="사용할 포인트"
              min="0"
              max={Math.min(availablePoints, afterDiscountAmount)}
            />
            <UseAllPointsButton onClick={handleUseAllPoints}>
              전액 사용
            </UseAllPointsButton>
          </PointInputWrapper>
          <PointInfo>
            보유 포인트: {availablePoints.toLocaleString()}P (최대{" "}
            {Math.min(availablePoints, afterDiscountAmount).toLocaleString()}P
            사용 가능)
          </PointInfo>
        </PointSection>
      )}

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
          <span>{finalAmount.toLocaleString()}원</span>
        </FinalPriceRow>
      </PriceBreakdown>
    </PaymentWrapper>
  );
};

export default PaymentSection;
