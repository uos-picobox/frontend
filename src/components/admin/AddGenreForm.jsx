// src/components/admin/AddGenreForm.js
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

const AddGenreForm = ({
  onSubmit,
  initialGenreData,
  isLoading: isSubmitting,
}) => {
  const [genreName, setGenreName] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (initialGenreData) {
      setGenreName(initialGenreData.genreName || "");
    } else {
      setGenreName("");
    }
  }, [initialGenreData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!genreName.trim()) {
      setFormError("장르 이름을 입력해주세요.");
      return;
    }
    const requestData = { genreName: genreName.trim() }; // MovieGenreRequestDto
    try {
      await onSubmit(requestData);
      if (!initialGenreData) setGenreName("");
    } catch (error) {
      setFormError(
        error.message ||
          error.details ||
          "장르 정보 저장 중 오류가 발생했습니다."
      );
    }
  };

  return (
    <FormWrapper onSubmit={handleSubmit}>
      <FormSectionTitle>
        {initialGenreData ? "장르 수정" : "새 장르 추가"}
      </FormSectionTitle>
      {formError && <p style={{ color: "red" }}>{formError}</p>}
      <Input
        name="genreName"
        label="장르 이름"
        value={genreName}
        onChange={(e) => setGenreName(e.target.value)}
        // API 명세에 maxLength가 없으므로 UI에서 제거하거나 유지할 수 있음
        // maxLength="30"
        required
      />
      <Button type="submit" variant="primary" fullWidth disabled={isSubmitting}>
        {isSubmitting
          ? "저장 중..."
          : initialGenreData
          ? "장르 업데이트"
          : "장르 추가하기"}
      </Button>
    </FormWrapper>
  );
};
export default AddGenreForm;
