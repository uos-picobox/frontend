// src/components/admin/AddTicketTypeForm.js
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Input from "../common/Input";
import Button from "../common/Button";

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

const AddTicketTypeForm = ({
  onSubmit,
  initialTicketTypeData,
  isLoading: isSubmitting,
}) => {
  const [formData, setFormData] = useState({
    typeName: "",
    description: "", // Optional
  });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (initialTicketTypeData) {
      setFormData({
        typeName: initialTicketTypeData.typeName || "",
        description: initialTicketTypeData.description || "",
      });
    }
  }, [initialTicketTypeData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!formData.typeName.trim()) {
      setFormError("티켓 종류 이름을 입력해주세요.");
      return;
    }

    const requestData = {
      // TicketTypeRequestDto
      typeName: formData.typeName,
      description: formData.description || null,
    };

    try {
      await onSubmit(requestData);
      if (!initialTicketTypeData) {
        setFormData({ typeName: "", description: "" }); // Reset only on add
      }
    } catch (error) {
      console.error("Ticket type form submission error:", error);
      setFormError(error.message || "티켓 종류 저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <FormWrapper onSubmit={handleSubmit}>
      <FormSectionTitle>
        {initialTicketTypeData ? "티켓 종류 수정" : "새 티켓 종류 추가"}
      </FormSectionTitle>
      {formError && <p style={{ color: "red" }}>{formError}</p>}
      <Input
        name="typeName"
        label="티켓 종류 이름"
        value={formData.typeName}
        onChange={handleChange}
        maxLength="30"
        required
        placeholder="예: 성인, 청소년, 경로"
      />
      <Input
        name="description"
        label="설명 (선택)"
        type="textarea"
        value={formData.description}
        onChange={handleChange}
        maxLength="500"
        placeholder="예: 만 19세 이상 일반 관람객"
      />
      <Button type="submit" variant="primary" fullWidth disabled={isSubmitting}>
        {isSubmitting
          ? "저장 중..."
          : initialTicketTypeData
          ? "티켓 종류 업데이트"
          : "티켓 종류 추가하기"}
      </Button>
    </FormWrapper>
  );
};

export default AddTicketTypeForm;
