// src/components/admin/AddActorForm.js
import React, { useState, useEffect, useRef } from "react";
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

const FileInputWrapper = styled.div`
  label {
    display: block;
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: 500;
    color: ${({ theme }) => theme.colors.textDark};
    margin-bottom: ${({ theme }) => theme.spacing[1.5]};
  }
  input[type="file"] {
    display: block; // Ensure it takes block space for styling if needed
    font-size: ${({ theme }) => theme.fontSizes.sm};
    padding: ${({ theme }) => theme.spacing[1.5]}
      ${({ theme }) => theme.spacing[2]};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    background-color: ${({ theme }) => theme.colors.surfaceLight};
  }
`;

const ImagePreview = styled.img`
  max-width: 150px;
  max-height: 150px;
  margin-top: ${({ theme }) => theme.spacing[2]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const AddActorForm = ({ onSubmit, initialData, isLoading: isSubmitting }) => {
  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    biography: "",
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [currentProfileImageUrl, setCurrentProfileImageUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [formError, setFormError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        birthDate: initialData.birthDate || "",
        biography: initialData.biography || "",
      });
      setCurrentProfileImageUrl(initialData.profileImageUrl || "");
      setPreviewUrl(initialData.profileImageUrl || "");
      setProfileImageFile(null);
    } else {
      setFormData({ name: "", birthDate: "", biography: "" });
      setCurrentProfileImageUrl("");
      setPreviewUrl("");
      setProfileImageFile(null);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
      setCurrentProfileImageUrl("");
    } else {
      setProfileImageFile(null);
      setPreviewUrl(currentProfileImageUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!formData.name.trim()) {
      setFormError("배우 이름을 입력해주세요.");
      return;
    }

    const actorDetails = {
      name: formData.name,
      birthDate: formData.birthDate || null,
      biography: formData.biography || null,
    };

    const hasNewImage = !!profileImageFile;

    if (hasNewImage) {
      const submissionData = new FormData();
      submissionData.append(
        "actorDetails",
        new Blob([JSON.stringify(actorDetails)], { type: "application/json" })
      );
      submissionData.append("profileImage", profileImageFile);
      await onSubmit(submissionData, true);
    } else {
      await onSubmit(actorDetails, false);
    }

    if (!initialData) {
      setFormData({ name: "", birthDate: "", biography: "" });
      setProfileImageFile(null);
      setPreviewUrl("");
      setCurrentProfileImageUrl("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = () => {
    if (profileImageFile) {
      setProfileImageFile(null);
      setPreviewUrl(initialData?.profileImageUrl || "");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } else if (currentProfileImageUrl) {
      alert(
        "이미지 삭제는 별도의 API 호출이 필요할 수 있습니다. 현재는 미리보기만 제거됩니다."
      );
      setCurrentProfileImageUrl("");
      setPreviewUrl("");
    }
  };

  return (
    <FormWrapper onSubmit={handleSubmit}>
      <FormSectionTitle>
        {initialData ? "배우 정보 수정" : "새 배우 추가"}
      </FormSectionTitle>
      {formError && <p style={{ color: "red" }}>{formError}</p>}
      <Input
        name="name"
        label="배우 이름"
        value={formData.name}
        onChange={handleChange}
        maxLength="255"
        required
      />
      <Input
        name="birthDate"
        label="생년월일 (선택)"
        type="date"
        value={formData.birthDate}
        onChange={handleChange}
      />
      <Input
        name="biography"
        label="배우 소개 (선택)"
        type="textarea"
        value={formData.biography}
        onChange={handleChange}
      />
      <FileInputWrapper>
        <label htmlFor="profileImageFile">프로필 이미지 (선택)</label>
        <input
          type="file"
          id="profileImageFile"
          name="profileImageFile"
          accept="image/*"
          onChange={handleFileChange}
          ref={fileInputRef}
        />
        {(previewUrl || currentProfileImageUrl) && (
          <div>
            <ImagePreview
              src={previewUrl || currentProfileImageUrl}
              alt="프로필 이미지 미리보기"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemoveImage}
              style={{ marginTop: "0.5rem", marginLeft: "0.5rem" }}
            >
              이미지 제거
            </Button>
          </div>
        )}
      </FileInputWrapper>

      <Button type="submit" variant="primary" fullWidth disabled={isSubmitting}>
        {isSubmitting
          ? "저장 중..."
          : initialData
          ? "배우 정보 업데이트"
          : "배우 추가하기"}
      </Button>
    </FormWrapper>
  );
};

export default AddActorForm;
