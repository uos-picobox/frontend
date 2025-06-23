import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Button from "../common/Button";
import Input from "../common/Input";

const FormContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.surfaceDarker};
  padding: ${({ theme }) => theme.spacing[6]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  max-width: 600px;
  margin: 0 auto;
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const Label = styled.label`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const TextArea = styled.textarea`
  padding: ${({ theme }) => theme.spacing[3]};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  resize: vertical;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.secondary};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  justify-content: center;
  margin-top: ${({ theme }) => theme.spacing[6]};
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing[2]};
`;

const AddDiscountForm = ({ onSubmit, initialData, onCancel }) => {
  const [formData, setFormData] = useState({
    providerName: "",
    discountRate: "",
    discountAmount: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        providerName: initialData.providerName || "",
        discountRate: initialData.discountRate || "",
        discountAmount: initialData.discountAmount || "",
        description: initialData.description || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // 할인율과 할인금액 중 하나만 입력할 수 있도록 처리
    if (name === "discountRate" && value) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        discountAmount: "", // 할인율 입력 시 할인금액 초기화
      }));
    } else if (name === "discountAmount" && value) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        discountRate: "", // 할인금액 입력 시 할인율 초기화
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // 유효성 검사
    if (!formData.providerName.trim()) {
      setError("제공업체명을 입력해주세요.");
      return;
    }

    // 할인율과 할인금액 중 하나는 반드시 입력되어야 함
    const hasDiscountRate =
      formData.discountRate && formData.discountRate !== "";
    const hasDiscountAmount =
      formData.discountAmount && formData.discountAmount !== "";

    if (!hasDiscountRate && !hasDiscountAmount) {
      setError("할인율 또는 할인금액 중 하나는 입력해주세요.");
      return;
    }

    // 할인율 유효성 검사
    if (hasDiscountRate) {
      const rate = parseInt(formData.discountRate);
      if (isNaN(rate) || rate < 0 || rate > 100) {
        setError("할인율은 0~100 사이의 숫자여야 합니다.");
        return;
      }
    }

    // 할인금액 유효성 검사
    if (hasDiscountAmount) {
      const amount = parseInt(formData.discountAmount);
      if (isNaN(amount) || amount < 0) {
        setError("할인금액은 0 이상의 숫자여야 합니다.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        providerName: formData.providerName.trim(),
        description: formData.description.trim(),
      };

      // 할인율과 할인금액 중 하나만 설정, 나머지는 null
      if (hasDiscountRate) {
        submitData.discountRate = parseInt(formData.discountRate);
        submitData.discountAmount = null; // null로 설정
      } else if (hasDiscountAmount) {
        submitData.discountAmount = parseInt(formData.discountAmount);
        submitData.discountRate = null; // null로 설정
      }

      if (initialData?.id) {
        submitData.id = initialData.id;
      }

      console.log("Submitting discount data:", submitData);
      await onSubmit(submitData);
    } catch (err) {
      setError(err.message || "할인 정보 저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormContainer>
      <Title>{initialData ? "할인 정보 수정" : "새 할인 정보 추가"}</Title>

      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="providerName">제공업체명 *</Label>
          <Input
            id="providerName"
            name="providerName"
            value={formData.providerName}
            onChange={handleChange}
            placeholder="예: PicoBox"
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="discountRate">
            할인율 (%){" "}
            {formData.discountAmount && "- 할인금액 입력 시 비활성화"}
          </Label>
          <Input
            id="discountRate"
            name="discountRate"
            type="number"
            min="0"
            max="100"
            value={formData.discountRate}
            onChange={handleChange}
            placeholder="예: 15"
            disabled={!!formData.discountAmount}
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="discountAmount">
            할인금액 (원) {formData.discountRate && "- 할인율 입력 시 비활성화"}
          </Label>
          <Input
            id="discountAmount"
            name="discountAmount"
            type="number"
            min="0"
            value={formData.discountAmount}
            onChange={handleChange}
            placeholder="예: 3000"
            disabled={!!formData.discountRate}
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="description">설명</Label>
          <TextArea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="할인에 대한 상세 설명을 입력해주세요."
          />
        </FormGroup>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <ButtonGroup>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "저장 중..." : initialData ? "수정" : "추가"}
          </Button>
        </ButtonGroup>
      </Form>
    </FormContainer>
  );
};

export default AddDiscountForm;
