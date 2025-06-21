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
  initialData,
  isLoading: isSubmitting,
}) => {
  const [formData, setFormData] = useState({
    movieId: "",
    roomId: "",
    screeningTime: "",
  });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (initialData) {
      let formattedTime = "";
      if (initialData.screeningTime) {
        // 백엔드에서 ISO 8601 형식으로 오는 경우: 2025-06-05T08:01:21.975Z
        // 또는 일반 문자열로 오는 경우: 2025-06-02 10:30
        let dateTime;
        if (initialData.screeningTime.includes("T")) {
          // ISO 8601 형식
          dateTime = new Date(initialData.screeningTime);
        } else if (initialData.screeningTime.includes(" ")) {
          // 공백 구분 형식
          dateTime = new Date(initialData.screeningTime.replace(" ", "T"));
        } else {
          dateTime = new Date(initialData.screeningTime);
        }

        // datetime-local 입력 필드 형식으로 변환 (YYYY-MM-DDTHH:mm)
        formattedTime = dateTime.toISOString().substring(0, 16);
      }

      setFormData({
        movieId: initialData.movie?.movieId?.toString() || "",
        roomId: initialData.screeningRoom?.roomId?.toString() || "",
        screeningTime: formattedTime,
      });
    } else {
      setFormData({ movieId: "", roomId: "", screeningTime: "" });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    console.log("AddScreeningScheduleForm: handleSubmit called");
    console.log("Form data:", formData);

    // 필수 필드 검증
    if (!formData.movieId || !formData.roomId || !formData.screeningTime) {
      setFormError("모든 필드를 입력해주세요.");
      return;
    }

    // 숫자 형태 검증
    if (isNaN(parseInt(formData.movieId)) || isNaN(parseInt(formData.roomId))) {
      setFormError("영화 또는 상영관 선택이 올바르지 않습니다.");
      return;
    }

    // 날짜/시간 형식 검증
    if (!formData.screeningTime || formData.screeningTime.length < 10) {
      setFormError("올바른 날짜와 시간을 입력해주세요.");
      return;
    }

    // 미래 날짜 검증
    const selectedDateTime = new Date(formData.screeningTime);
    const now = new Date();
    if (selectedDateTime <= now) {
      setFormError("상영 시간은 현재 시간 이후로 설정해주세요.");
      return;
    }

    // 날짜/시간 포맷팅 (백엔드 API 명세에 맞춰 "YYYY-MM-DD HH:mm" 형식으로)
    let formattedScreeningTime;
    if (formData.screeningTime.includes("T")) {
      // datetime-local에서 오는 형식: 2024-01-15T14:30 -> 2024-01-15 14:30
      formattedScreeningTime = formData.screeningTime.replace("T", " ");
    } else if (formData.screeningTime.includes(" ")) {
      // 이미 공백이 있는 경우: 2024-01-15 14:30
      // 초가 있으면 제거 (2024-01-15 14:30:00 -> 2024-01-15 14:30)
      formattedScreeningTime = formData.screeningTime.replace(/:00$/, "");
    } else {
      // 기타 형식
      formattedScreeningTime = formData.screeningTime;
    }

    console.log("Original screeningTime:", formData.screeningTime);
    console.log("Formatted screeningTime:", formattedScreeningTime);

    const requestData = {
      movieId: parseInt(formData.movieId),
      roomId: parseInt(formData.roomId),
      screeningTime: formattedScreeningTime,
    };

    console.log("Request data being sent:", requestData);

    try {
      const result = await onSubmit(requestData);
      console.log("Screening schedule submission successful:", result);

      if (!initialData) {
        setFormData({ movieId: "", roomId: "", screeningTime: "" });
      }
    } catch (error) {
      console.error("Screening schedule form submission error:", error);
      console.error("Error details:", error.details);
      console.error("Error status:", error.status);

      let errorMessage = "스케줄 저장 중 오류가 발생했습니다.";

      if (error.message) {
        errorMessage = error.message;
      } else if (error.details) {
        errorMessage = error.details;
      }

      // 백엔드 검증 에러를 더 자세히 표시
      if (error.status === 400) {
        errorMessage = "입력한 데이터에 문제가 있습니다. " + errorMessage;
      } else if (error.status === 409) {
        errorMessage = "해당 시간에 이미 스케줄이 존재하거나 충돌이 있습니다.";
      } else if (error.status === 500) {
        errorMessage = "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
      }

      setFormError(errorMessage);
    }
  };

  console.log("AddScreeningScheduleForm render:", {
    movies: movies?.length || 0,
    screeningRooms: screeningRooms?.length || 0,
    initialData,
    isSubmitting,
  });

  if (!movies || !screeningRooms) {
    console.warn("Missing data:", {
      movies: !!movies,
      screeningRooms: !!screeningRooms,
    });
    return <p>영화 또는 상영관 정보를 불러오는 중입니다...</p>;
  }

  if (movies.length === 0 || screeningRooms.length === 0) {
    return (
      <p style={{ color: "orange", padding: "1rem" }}>
        {movies.length === 0 && "등록된 영화가 없습니다. "}
        {screeningRooms.length === 0 && "등록된 상영관이 없습니다. "}
        먼저 영화와 상영관을 등록해주세요.
      </p>
    );
  }

  return (
    <FormWrapper onSubmit={handleSubmit}>
      <FormSectionTitle>
        {initialData ? "스케줄 수정" : "새 상영 스케줄 추가"}
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
          : initialData
          ? "스케줄 업데이트"
          : "스케줄 추가하기"}
      </Button>
    </FormWrapper>
  );
};

export default AddScreeningScheduleForm;
