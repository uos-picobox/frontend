// src/components/admin/AddDistributorForm.js
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

const AddDistributorForm = ({
  onSubmit,
  initialDistributorData,
  isLoading: isSubmitting,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    address: "", // Optional
    phone: "", // Optional
  });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (initialDistributorData) {
      setFormData({
        name: initialDistributorData.name || "",
        address: initialDistributorData.address || "",
        phone: initialDistributorData.phone || "",
      });
    }
  }, [initialDistributorData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!formData.name.trim()) {
      setFormError("배급사 이름을 입력해주세요.");
      return;
    }

    const requestData = {
      // DistributorRequestDto
      name: formData.name,
      address: formData.address || null,
      phone: formData.phone || null,
    };

    try {
      await onSubmit(requestData);
      if (!initialDistributorData) {
        setFormData({ name: "", address: "", phone: "" }); // Reset only on add
      }
    } catch (error) {
      console.error("Distributor form submission error:", error);
      setFormError(error.message || "배급사 정보 저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <FormWrapper onSubmit={handleSubmit}>
      <FormSectionTitle>
        {initialDistributorData ? "배급사 정보 수정" : "새 배급사 추가"}
      </FormSectionTitle>
      {formError && <p style={{ color: "red" }}>{formError}</p>}
      <Input
        name="name"
        label="배급사 이름"
        value={formData.name}
        onChange={handleChange}
        maxLength="50"
        required
      />
      <Input
        name="address"
        label="주소 (선택)"
        value={formData.address}
        onChange={handleChange}
        maxLength="300"
      />
      <Input
        name="phone"
        label="전화번호 (선택)"
        type="tel" // Use tel for better mobile experience
        value={formData.phone}
        onChange={handleChange}
        maxLength="20"
        placeholder="예: 02-1234-5678"
      />
      <Button type="submit" variant="primary" fullWidth disabled={isSubmitting}>
        {isSubmitting
          ? "저장 중..."
          : initialDistributorData
          ? "배급사 업데이트"
          : "배급사 추가하기"}
      </Button>
    </FormWrapper>
  );
};

export default AddDistributorForm;
