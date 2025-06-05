// src/components/admin/PriceSettingForm.js
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Input from "../common/Input";
import Button from "../common/Button";
import { useData } from "../../contexts/DataContext"; // To get ticket types
// screeningRooms would be passed as a prop or fetched from DataContext if made global

const FormWrapper = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
  padding: ${({ theme }) => theme.spacing[4]};
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
`;

const FormSectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  padding-bottom: ${({ theme }) => theme.spacing[2]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const PriceSettingForm = ({
  onSubmit,
  screeningRooms,
  initialPriceData,
  isLoading: isSubmitting,
}) => {
  const { ticketTypes, isLoadingData: isLoadingTicketTypes } = useData();
  const [formData, setFormData] = useState({
    roomId: "", // integer (ID)
    ticketTypeId: "", // integer (ID)
    price: "", // integer
  });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    // initialPriceData would be PriceSettingResponseDto which has roomId and ticketTypeId
    if (initialPriceData) {
      setFormData({
        roomId: initialPriceData.roomId?.toString() || "",
        ticketTypeId: initialPriceData.ticketTypeId?.toString() || "",
        price: initialPriceData.price?.toString() || "",
      });
    }
  }, [initialPriceData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!formData.roomId || !formData.ticketTypeId || !formData.price) {
      setFormError("모든 필드 (상영관, 티켓 종류, 가격)를 입력해주세요.");
      return;
    }
    const priceValue = parseInt(formData.price);
    if (isNaN(priceValue) || priceValue < 0) {
      setFormError("가격은 0 이상의 숫자여야 합니다.");
      return;
    }

    const requestData = {
      // PriceSettingRequestDto
      roomId: parseInt(formData.roomId),
      ticketTypeId: parseInt(formData.ticketTypeId),
      price: priceValue,
    };

    try {
      await onSubmit(requestData);
      // For price settings, usually you don't "add new" in the same way,
      // it's more like setting or updating. So, reset might not be needed unless specified.
      // If this form is for both adding and editing:
      // if (!initialPriceData) {
      //   setFormData({ roomId: '', ticketTypeId: '', price: '' });
      // }
    } catch (error) {
      console.error("Price setting form submission error:", error);
      setFormError(error.message || "가격 설정 저장 중 오류가 발생했습니다.");
    }
  };

  if (isLoadingTicketTypes && (!ticketTypes || ticketTypes.length === 0)) {
    return <p>티켓 종류 로딩 중...</p>;
  }
  if (!screeningRooms || screeningRooms.length === 0) {
    return <p>상영관 정보를 먼저 등록해주세요.</p>;
  }

  return (
    <FormWrapper onSubmit={handleSubmit}>
      <FormSectionTitle>
        {initialPriceData ? "가격 설정 수정" : "새 가격 설정"}
      </FormSectionTitle>
      {formError && <p style={{ color: "red" }}>{formError}</p>}
      <Input
        name="roomId"
        label="상영관 선택"
        type="select"
        value={formData.roomId}
        onChange={handleChange}
        required
        // If editing, you might want to disable this field or handle changes carefully
        // disabled={!!initialPriceData}
      >
        <option value="">상영관을 선택하세요</option>
        {screeningRooms.map((room) => (
          <option key={room.roomId} value={room.roomId}>
            {room.roomName}
          </option>
        ))}
      </Input>

      <Input
        name="ticketTypeId"
        label="티켓 종류 선택"
        type="select"
        value={formData.ticketTypeId}
        onChange={handleChange}
        required
        // disabled={!!initialPriceData}
      >
        <option value="">티켓 종류를 선택하세요</option>
        {ticketTypes.map((tt) => (
          <option key={tt.ticketTypeId} value={tt.ticketTypeId}>
            {tt.typeName}
          </option>
        ))}
      </Input>

      <Input
        name="price"
        label="가격 (원)"
        type="number"
        value={formData.price}
        onChange={handleChange}
        min="0"
        required
        placeholder="예: 15000"
      />

      <Button type="submit" variant="primary" fullWidth disabled={isSubmitting}>
        {isSubmitting
          ? "저장 중..."
          : initialPriceData
          ? "가격 업데이트"
          : "가격 설정하기"}
      </Button>
    </FormWrapper>
  );
};

export default PriceSettingForm;
