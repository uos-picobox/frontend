// src/components/admin/AddScreeningScheduleForm.js
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

const AddScreeningScheduleForm = ({
  onSubmit,
  movies,
  screeningRooms,
  initialScheduleData,
  isLoading: isSubmitting,
}) => {
  const [formData, setFormData] = useState({
    movieId: "",
    roomId: "",
    screeningTime: "", // HTML input type="datetime-local" gives "YYYY-MM-DDTHH:mm"
  });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (initialScheduleData) {
      setFormData({
        movieId: initialScheduleData.movie?.movieId?.toString() || "",
        roomId: initialScheduleData.screeningRoom?.roomId?.toString() || "",
        // API expects "YYYY-MM-DD HH:mm", initialScheduleData.screeningTime might be "YYYY-MM-DDTHH:mm:ssZ" or "YYYY-MM-DD HH:mm:ss"
        // Convert to "YYYY-MM-DDTHH:mm" for datetime-local input
        screeningTime: initialScheduleData.screeningTime
          ? new Date(initialScheduleData.screeningTime)
              .toISOString()
              .substring(0, 16)
          : "",
      });
    } else {
      setFormData({ movieId: "", roomId: "", screeningTime: "" });
    }
  }, [initialScheduleData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!formData.movieId || !formData.roomId || !formData.screeningTime) {
      setFormError("모든 필드를 입력해주세요.");
      return;
    }

    // Convert "YYYY-MM-DDTHH:mm" from input to "YYYY-MM-DD HH:mm" for API
    const formattedScreeningTime = formData.screeningTime.replace("T", " ");

    const requestData = {
      // ScreeningRequestDto
      movieId: parseInt(formData.movieId),
      roomId: parseInt(formData.roomId),
      screeningTime: formattedScreeningTime,
    };

    try {
      await onSubmit(requestData); // This is addScreening or updateScreening
      if (!initialScheduleData) {
        setFormData({ movieId: "", roomId: "", screeningTime: "" });
      }
    } catch (error) {
      console.error("Screening schedule form submission error:", error);
      setFormError(
        error.message || error.details || "스케줄 저장 중 오류가 발생했습니다."
      );
    }
  };

  // Ensure movies and screeningRooms props are available
  if (!movies || !screeningRooms) {
    return <p>영화 또는 상영관 정보를 불러오는 중입니다...</p>;
  }

  return (
    <FormWrapper onSubmit={handleSubmit}>
      <FormSectionTitle>
        {initialScheduleData ? "스케줄 수정" : "새 상영 스케줄 추가"}
      </FormSectionTitle>
      {formError && <p style={{ color: "red" }}>{formError}</p>}
      <Input
        name="movieId"
        label="영화 선택"
        type="select"
        value={formData.movieId}
        onChange={handleChange}
        required
      >
        <option value="">영화를 선택하세요</option>
        {movies.map((movie) => (
          <option key={movie.movieId} value={movie.movieId}>
            {movie.title} (ID: {movie.movieId})
          </option>
        ))}
      </Input>

      <Input
        name="roomId"
        label="상영관 선택"
        type="select"
        value={formData.roomId}
        onChange={handleChange}
        required
      >
        <option value="">상영관을 선택하세요</option>
        {screeningRooms.map((room) => (
          <option key={room.roomId} value={room.roomId}>
            {room.roomName} (ID: {room.roomId})
          </option>
        ))}
      </Input>

      <Input
        name="screeningTime"
        label="상영 시작 시간 (날짜 및 시간)"
        type="datetime-local"
        value={formData.screeningTime}
        onChange={handleChange}
        required
      />

      <Button type="submit" variant="primary" fullWidth disabled={isSubmitting}>
        {isSubmitting
          ? "저장 중..."
          : initialScheduleData
          ? "스케줄 업데이트"
          : "스케줄 추가하기"}
      </Button>
    </FormWrapper>
  );
};

export default AddScreeningScheduleForm;
