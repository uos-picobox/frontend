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

const AddActorForm = ({
  onSubmit,
  initialActorData,
  isLoading: isSubmitting,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    biography: "",
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [currentProfileImageUrl, setCurrentProfileImageUrl] = useState(""); // For displaying existing image
  const [previewUrl, setPreviewUrl] = useState("");
  const [formError, setFormError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialActorData) {
      setFormData({
        name: initialActorData.name || "",
        birthDate: initialActorData.birthDate || "",
        biography: initialActorData.biography || "",
      });
      setCurrentProfileImageUrl(initialActorData.profileImageUrl || "");
      setPreviewUrl(initialActorData.profileImageUrl || ""); // Show existing image initially
      setProfileImageFile(null); // Reset file input on new initial data
    } else {
      // Reset for add mode
      setFormData({ name: "", birthDate: "", biography: "" });
      setCurrentProfileImageUrl("");
      setPreviewUrl("");
      setProfileImageFile(null);
    }
  }, [initialActorData]);

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
      setCurrentProfileImageUrl(""); // Clear current image URL if new file is selected
    } else {
      setProfileImageFile(null);
      setPreviewUrl(currentProfileImageUrl); // Revert to existing image if file selection is cleared
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!formData.name.trim()) {
      setFormError("배우 이름을 입력해주세요.");
      return;
    }

    // ActorRequestDto for JSON part
    const actorDetails = {
      name: formData.name,
      birthDate: formData.birthDate || null,
      biography: formData.biography || null,
    };

    // FormData for multipart request
    const submissionData = new FormData();
    submissionData.append(
      "actorDetails",
      new Blob([JSON.stringify(actorDetails)], { type: "application/json" })
    );

    let hasNewImage = false;
    if (profileImageFile) {
      submissionData.append("profileImage", profileImageFile);
      hasNewImage = true;
    } else if (initialActorData && !currentProfileImageUrl && !previewUrl) {
      // This means user wants to remove image. API "/profile-image PUT" with no file handles this.
      // For create/update-with-image, if no file is sent, it means no change or no new image.
      // If API expects explicit null for deletion via these endpoints, adjust.
      // The specific API "/{actorId}/profile-image" is for setting/deleting image *only*.
      // For create/update with image, not sending a file usually means "don't change image" or "no initial image".
      // Let's assume if profileImageFile is null, no new image is sent.
    }

    try {
      // onSubmit from AdminDashboardPage will call the appropriate service (addActorWithImage or updateActorWithImage)
      // The service function itself should handle if it's an add or update.
      // The `onSubmit` prop needs to accept FormData.
      await onSubmit(submissionData, hasNewImage); // Pass FormData and flag indicating if image is part of it

      if (!initialActorData) {
        // Reset form only on successful add
        setFormData({ name: "", birthDate: "", biography: "" });
        setProfileImageFile(null);
        setPreviewUrl("");
        setCurrentProfileImageUrl("");
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Actor form submission error:", error);
      setFormError(
        error.message ||
          error.details ||
          "배우 정보 저장 중 오류가 발생했습니다."
      );
    }
  };

  const handleRemoveImage = async () => {
    // This would typically call the dedicated API to remove an image for an existing actor
    if (initialActorData?.actorId && currentProfileImageUrl) {
      if (window.confirm("정말로 프로필 이미지를 삭제하시겠습니까?")) {
        try {
          // Call service actorService.setActorProfileImage(initialActorData.actorId, null);
          // This form's onSubmit might not be the place for this specific action
          // For simplicity, we'll just clear the preview and file for now,
          // actual deletion via API can be a separate button/logic if `updateActorWithImage` doesn't handle null image for delete.
          alert(
            "이미지 삭제는 /api/admin/actors/{actorId}/profile-image PUT (파일 없음) API를 통해 처리됩니다. 이 폼은 생성/수정 시 이미지 포함 여부를 다룹니다."
          );
          setProfileImageFile(null);
          setPreviewUrl("");
          setCurrentProfileImageUrl("");
          if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (error) {
          setFormError("이미지 삭제 중 오류: " + error.message);
        }
      }
    } else if (profileImageFile) {
      // If it's a newly selected file not yet saved
      setProfileImageFile(null);
      setPreviewUrl("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <FormWrapper onSubmit={handleSubmit}>
      <FormSectionTitle>
        {initialActorData
          ? "배우 정보 수정"
          : "새 배우 추가 (이미지 포함 가능)"}
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
          : initialActorData
          ? "배우 정보 업데이트"
          : "배우 추가하기"}
      </Button>
    </FormWrapper>
  );
};

export default AddActorForm;
