import React, { useState } from "react";
import styled from "styled-components";
import Button from "../common/Button";
import useAuth from "../../hooks/useAuth";
import * as reviewService from "../../services/reviewService";

const ReviewCardContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

const ReviewerInfo = styled.div`
  flex: 1;
`;

const ReviewerName = styled.h4`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing[1]} 0;
`;

const ReviewDate = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textLighter};
  margin: 0;
`;

const RatingStars = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const Star = styled.span`
  color: ${({ filled, theme }) =>
    filled ? theme.colors.warning : theme.colors.textLighter};
  font-size: ${({ theme }) => theme.fontSizes.lg};
`;

const RatingText = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textLighter};
  margin-left: ${({ theme }) => theme.spacing[1]};
`;

const ReviewContent = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.6;
  margin: ${({ theme }) => theme.spacing[3]} 0;
`;

const ReviewActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing[3]};
`;

const LikeButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  background: none;
  border: none;
  color: ${({ liked, theme }) =>
    liked ? theme.colors.primary : theme.colors.textLighter};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[2]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.primary};
  }
  margin-left: -8px;
`;

const OwnerActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const ReviewCard = ({ review, onUpdate, onDelete }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(
    user ? review.isLikedByCurrentUser : false
  );
  const [likeCount, setLikeCount] = useState(review.likeCount);
  const [isLoading, setIsLoading] = useState(false);

  const isOwner =
    user &&
    (user.customerId === review.customerId ||
      user.loginId === review.customerLoginId);

  console.log("ReviewCard ownership check:", {
    userCustomerId: user?.customerId,
    userLoginId: user?.loginId,
    reviewCustomerId: review.customerId,
    reviewCustomerLoginId: review.customerLoginId,
    isOwner,
  });

  const handleLikeToggle = async () => {
    if (!user) {
      alert("좋아요를 누르려면 로그인이 필요합니다.");
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    try {
      await reviewService.toggleReviewLike(review.reviewId);
      setIsLiked(!isLiked);
      setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
    } catch (error) {
      console.error("Failed to toggle like:", error);
      alert("좋아요 처리에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    console.log("Edit button clicked for review:", review);
    onUpdate(review);
  };

  const handleDelete = async () => {
    if (!window.confirm("정말로 이 리뷰를 삭제하시겠습니까?")) return;

    try {
      await reviewService.deleteReview(review.reviewId);
      onDelete(review.reviewId);
    } catch (error) {
      console.error("Failed to delete review:", error);
      alert("리뷰 삭제에 실패했습니다.");
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} filled>
            ★
          </Star>
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star key={i} filled>
            ☆
          </Star>
        );
      } else {
        stars.push(<Star key={i}>☆</Star>);
      }
    }
    return stars;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <ReviewCardContainer>
      <ReviewHeader>
        <ReviewerInfo>
          <ReviewerName>{review.customerLoginId}</ReviewerName>
          <ReviewDate>{formatDate(review.createdAt)}</ReviewDate>
        </ReviewerInfo>
        <RatingStars>
          {renderStars(review.rating)}
          <RatingText>{review.rating}</RatingText>
        </RatingStars>
      </ReviewHeader>

      <ReviewContent>{review.comment}</ReviewContent>

      <ReviewActions>
        <LikeButton
          liked={isLiked}
          onClick={handleLikeToggle}
          disabled={isLoading}
          style={{
            opacity: !user ? 0.6 : 1,
            cursor: !user ? "not-allowed" : "pointer",
          }}
          title={!user ? "로그인이 필요합니다" : ""}
        >
          {user && isLiked ? "❤️" : "🤍"} {likeCount}
        </LikeButton>

        {isOwner && (
          <OwnerActions>
            <Button variant="secondary" size="sm" onClick={handleEdit}>
              수정
            </Button>
            <Button variant="danger" size="sm" onClick={handleDelete}>
              삭제
            </Button>
          </OwnerActions>
        )}
      </ReviewActions>
    </ReviewCardContainer>
  );
};

export default ReviewCard;
