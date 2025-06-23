import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Button from "../common/Button";
import Modal from "../common/Modal";
import * as reviewService from "../../services/reviewService";
import * as reservationService from "../../services/reservationService";

const FormContainer = styled.div`
  padding: ${({ theme }) => theme.spacing[4]};
`;

const FormTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const RatingSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const RatingLabel = styled.label`
  display: block;
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const StarRating = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[1]};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const Star = styled.button`
  background: none;
  border: none;
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ filled, theme }) =>
    filled ? theme.colors.warning : theme.colors.textLighter};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing[1]};
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.warning};
  }
`;

const RatingText = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textLighter};
  margin-left: ${({ theme }) => theme.spacing[2]};
`;

const ReservationSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const ReservationLabel = styled.label`
  display: block;
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const ReservationSelect = styled.select`
  width: 100%;
  padding: ${({ theme }) => theme.spacing[3]};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-family: inherit;
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }

  option {
    background-color: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const ReservationInfo = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textLighter};
  margin-top: ${({ theme }) => theme.spacing[1]};
`;

const CommentSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const CommentLabel = styled.label`
  display: block;
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const CommentTextarea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: ${({ theme }) => theme.spacing[3]};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-family: inherit;
  resize: vertical;
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textLighter};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  justify-content: flex-end;
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-top: ${({ theme }) => theme.spacing[1]};
`;

const ReviewForm = ({
  isOpen,
  onClose,
  movieId,
  movieTitle,
  editingReview = null,
  onSuccess,
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [availableReservations, setAvailableReservations] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);

  useEffect(() => {
    if (editingReview) {
      setRating(editingReview.rating);
      setComment(editingReview.comment);
      setSelectedReservation(editingReview.reservationId || null);
      console.log("Editing review loaded:", editingReview);
    } else {
      setRating(5);
      setComment("");
      setSelectedReservation(null);
      // 새 리뷰 작성 시 사용자의 예약 목록을 가져옴
      if (isOpen && movieId) {
        loadUserReservations();
      }
    }
    setError("");
  }, [editingReview, isOpen, movieId]);

  const loadUserReservations = async () => {
    try {
      const reservations = await reservationService.getMyReservations();
      console.log("All reservations:", reservations);

      // 해당 영화에 대한 예약만 필터링
      // API 응답에 movieId가 없고 movieTitle만 있으므로 영화 제목으로 필터링
      const allReservations = reservations.content || reservations || [];
      console.log("Processing reservations for movieTitle:", movieTitle);

      const movieReservations = allReservations.filter((reservation) => {
        console.log(
          "Checking reservation:",
          reservation.movieTitle,
          "vs",
          movieTitle
        );
        // 정확한 매칭을 시도하고, 만약 실패하면 더 유연한 매칭을 시도
        const exactMatch = reservation.movieTitle === movieTitle;
        const flexibleMatch =
          reservation.movieTitle?.toLowerCase().trim() ===
          movieTitle?.toLowerCase().trim();

        console.log(
          "Exact match:",
          exactMatch,
          "Flexible match:",
          flexibleMatch
        );
        return exactMatch || flexibleMatch;
      });

      console.log("Filtered movie reservations:", movieReservations);
      setAvailableReservations(movieReservations);

      // 예약이 하나뿐이면 자동 선택
      if (movieReservations.length === 1) {
        setSelectedReservation(movieReservations[0].reservationId);
        console.log(
          "Auto-selected reservation:",
          movieReservations[0].reservationId
        );
      }
    } catch (error) {
      console.error("Failed to load user reservations:", error);
      // 예약을 불러올 수 없는 경우 빈 배열로 설정
      // 실제 예약이 있어야만 리뷰 작성이 가능
      setAvailableReservations([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!comment.trim()) {
      setError("리뷰 내용을 입력해주세요.");
      return;
    }

    if (comment.trim().length < 10) {
      setError("리뷰는 최소 10자 이상 작성해주세요.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const reviewData = {
        movieId: parseInt(movieId),
        rating: rating,
        comment: comment.trim(),
      };

      // 수정 모드인 경우 기존 예약 ID 사용
      if (editingReview) {
        if (editingReview.reservationId) {
          reviewData.reservationId = editingReview.reservationId;
          console.log(
            "Using existing reservation ID for edit:",
            editingReview.reservationId
          );
        }
        // 수정 모드에서는 예약 ID가 없어도 허용 (기존 리뷰를 수정하는 것이므로)
      } else {
        // 새 리뷰 작성 모드
        if (selectedReservation) {
          reviewData.reservationId = selectedReservation;
          console.log("Using selected reservation:", selectedReservation);
        } else {
          // 예약 ID가 필수인 경우 - 실제로 영화를 관람해야만 리뷰 작성 가능
          console.log(
            "No reservation selected, available reservations:",
            availableReservations
          );
          setError(
            "해당 영화에 대한 관람 기록이 없어 리뷰를 작성할 수 없습니다. 영화를 예매하고 관람한 후 리뷰를 작성해주세요."
          );
          setIsSubmitting(false);
          return;
        }
      }

      if (editingReview) {
        console.log("Updating review:", editingReview.reviewId, reviewData);
        await reviewService.updateReview(editingReview.reviewId, reviewData);
      } else {
        console.log("Creating new review:", reviewData);
        await reviewService.createReview(reviewData);
      }

      alert(`리뷰가 성공적으로 ${editingReview ? "수정" : "작성"}되었습니다.`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to submit review:", error);
      setError(
        error.message ||
          error.response?.data?.message ||
          `리뷰 ${editingReview ? "수정" : "작성"}에 실패했습니다.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingClick = (selectedRating) => {
    setRating(selectedRating);
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          type="button"
          filled={i <= (hoveredRating || rating)}
          onClick={() => handleRatingClick(i)}
          onMouseEnter={() => setHoveredRating(i)}
          onMouseLeave={() => setHoveredRating(0)}
        >
          ★
        </Star>
      );
    }
    return stars;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="600px">
      <FormContainer>
        <FormTitle>
          {editingReview ? "리뷰 수정" : "리뷰 작성"} - {movieTitle}
        </FormTitle>

        <form onSubmit={handleSubmit}>
          <RatingSection>
            <RatingLabel>평점</RatingLabel>
            <StarRating>
              {renderStars()}
              <RatingText>{hoveredRating || rating}점</RatingText>
            </StarRating>
          </RatingSection>

          {!editingReview && (
            <>
              {availableReservations.length > 0 && (
                <ReservationSection>
                  <ReservationLabel>관람한 상영</ReservationLabel>
                  <ReservationSelect
                    value={selectedReservation || ""}
                    onChange={(e) =>
                      setSelectedReservation(
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                    required
                  >
                    <option value="">상영을 선택해주세요</option>
                    {availableReservations.map((reservation) => (
                      <option
                        key={reservation.reservationId}
                        value={reservation.reservationId}
                      >
                        {reservation.screeningTime}
                        {reservation.screeningRoomName &&
                          ` - ${reservation.screeningRoomName}`}
                        {reservation.seatNumbers &&
                          ` (${reservation.seatNumbers})`}
                      </option>
                    ))}
                  </ReservationSelect>
                  <ReservationInfo>
                    리뷰는 실제로 관람한 영화에 대해서만 작성할 수 있습니다.
                  </ReservationInfo>
                </ReservationSection>
              )}

              {availableReservations.length === 0 && (
                <ReservationSection>
                  <ReservationInfo style={{ color: "#f59e0b" }}>
                    ⚠️ 해당 영화에 대한 관람 기록이 없습니다. 영화를 예매하고
                    관람한 후 리뷰를 작성해주세요.
                  </ReservationInfo>
                </ReservationSection>
              )}
            </>
          )}

          {editingReview && (
            <ReservationSection>
              <ReservationInfo style={{ color: "#10b981" }}>
                ✅ 기존 리뷰를 수정하고 있습니다.
              </ReservationInfo>
            </ReservationSection>
          )}

          <CommentSection>
            <CommentLabel>리뷰 내용</CommentLabel>
            <CommentTextarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="영화에 대한 솔직한 리뷰를 작성해주세요. (최소 10자)"
              maxLength={500}
            />
            <div
              style={{ textAlign: "right", fontSize: "12px", color: "#666" }}
            >
              {comment.length}/500
            </div>
          </CommentSection>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <ButtonGroup>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={
                isSubmitting ||
                !comment.trim() ||
                comment.trim().length < 10 ||
                (!editingReview && availableReservations.length === 0) ||
                (!editingReview && !selectedReservation)
              }
            >
              {isSubmitting
                ? `${editingReview ? "수정" : "작성"} 중...`
                : editingReview
                ? "수정하기"
                : "작성하기"}
            </Button>
          </ButtonGroup>
        </form>
      </FormContainer>
    </Modal>
  );
};

export default ReviewForm;
