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

const AddGenreForm = ({ onSubmit, initialData, isLoading: isSubmitting }) => {
  const [genreName, setGenreName] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (initialData) {
      setGenreName(initialData.genreName || "");
    } else {
      setGenreName("");
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!genreName.trim()) {
      setFormError("장르 이름을 입력해주세요.");
      return;
    }
    const requestData = { genreName: genreName.trim() };
    try {
      await onSubmit(requestData);
      if (!initialData) setGenreName("");
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
        {initialData ? "장르 수정" : "새 장르 추가"}
      </FormSectionTitle>
      {formError && <p style={{ color: "red" }}>{formError}</p>}
      <Input
        name="genreName"
        label="장르 이름"
        value={genreName}
        onChange={(e) => setGenreName(e.target.value)}
        required
      />
      <Button type="submit" variant="primary" fullWidth disabled={isSubmitting}>
        {isSubmitting
          ? "저장 중..."
          : initialData
          ? "장르 업데이트"
          : "장르 추가하기"}
      </Button>
    </FormWrapper>
  );
};
export default AddGenreForm;
