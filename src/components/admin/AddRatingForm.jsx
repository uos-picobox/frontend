// src/components/admin/AddRatingForm.js
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

const AddRatingForm = ({
  onSubmit,
  initialRatingData,
  isLoading: isSubmitting,
}) => {
  const [formData, setFormData] = useState({
    ratingName: "",
    description: "", // Optional
  });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (initialRatingData) {
      setFormData({
        ratingName: initialRatingData.ratingName || "",
        description: initialRatingData.description || "",
      });
    }
  }, [initialRatingData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!formData.ratingName.trim()) {
      setFormError("등급 이름을 입력해주세요.");
      return;
    }

    const requestData = {
      // MovieRatingRequestDto
      ratingName: formData.ratingName,
      description: formData.description || null,
    };

    try {
      await onSubmit(requestData);
      if (!initialRatingData) {
        setFormData({ ratingName: "", description: "" }); // Reset only on add
      }
    } catch (error) {
      console.error("Rating form submission error:", error);
      setFormError(error.message || "등급 정보 저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <FormWrapper onSubmit={handleSubmit}>
      <FormSectionTitle>
        {initialRatingData ? "관람 등급 수정" : "새 관람 등급 추가"}
      </FormSectionTitle>
      {formError && <p style={{ color: "red" }}>{formError}</p>}
      <Input
        name="ratingName"
        label="등급 이름"
        value={formData.ratingName}
        onChange={handleChange}
        maxLength="30"
        required
      />
      <Input
        name="description"
        label="등급 설명 (선택)"
        type="textarea"
        value={formData.description}
        onChange={handleChange}
        maxLength="500"
      />
      <Button type="submit" variant="primary" fullWidth disabled={isSubmitting}>
        {isSubmitting
          ? "저장 중..."
          : initialRatingData
          ? "등급 업데이트"
          : "등급 추가하기"}
      </Button>
    </FormWrapper>
  );
};

export default AddRatingForm;
