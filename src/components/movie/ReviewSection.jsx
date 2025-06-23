import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Button from "../common/Button";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";
import useAuth from "../../hooks/useAuth";
import * as reviewService from "../../services/reviewService";

const ReviewSectionContainer = styled.section`
  margin-top: ${({ theme }) => theme.spacing[8]};
  padding-top: ${({ theme }) => theme.spacing[6]};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const ReviewSummary = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  padding: ${({ theme }) => theme.spacing[4]};
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
`;

const AverageRating = styled.div`
  text-align: center;
`;

const RatingNumber = styled.div`
  font-size: ${({ theme }) => theme.fontSizes["3xl"]};
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
`;

const RatingStars = styled.div`
  color: ${({ theme }) => theme.colors.warning};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  margin-bottom: ${({ theme }) => theme.spacing[1]};
`;

const TotalReviews = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textLighter};
`;

const FilterControls = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const FilterButton = styled.button`
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ active, theme }) =>
    active ? theme.colors.primary : theme.colors.surface};
  color: ${({ active, theme }) =>
    active ? theme.colors.white : theme.colors.text};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ active, theme }) =>
      active ? theme.colors.primaryDark : theme.colors.surfaceLight};
  }
`;

const ReviewList = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const LoadMoreButton = styled.div`
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing[4]};
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing[8]};
  color: ${({ theme }) => theme.colors.textLighter};
  font-size: ${({ theme }) => theme.fontSizes.lg};
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing[4]};
  color: ${({ theme }) => theme.colors.textLighter};
`;

const REVIEWS_PER_PAGE = 10;

const ReviewSection = ({ movieId, movieTitle }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [sortBy, setSortBy] = useState("latest");
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    loadReviews(true);
    loadReviewSummary();
  }, [movieId, sortBy]);

  const loadReviews = async (reset = false) => {
    const page = reset ? 0 : currentPage + 1; // 다음 페이지 로드
    const loadingState = reset ? setIsLoading : setIsLoadingMore;

    console.log(
      `ReviewSection: Loading reviews - reset: ${reset}, page: ${page}, sortBy: ${sortBy}`
    );

    loadingState(true);
    try {
      const response = await reviewService.getReviewsByMovie(
        movieId,
        sortBy,
        page,
        REVIEWS_PER_PAGE
      );

      console.log(`ReviewSection: API response for page ${page}:`, response);

      if (reset) {
        // 새로운 검색이나 정렬 변경 시
        setReviews(response.content || []);
        setCurrentPage(0);
      } else {
        // 더 보기 버튼 클릭 시
        setReviews((prev) => [...prev, ...(response.content || [])]);
        setCurrentPage(page);
      }

      setHasMore(!response.last);
    } catch (error) {
      console.error("Failed to load reviews:", error);

      // API 오류 시 빈 데이터로 초기화
      if (reset) {
        setReviews([]);
        setCurrentPage(0);
        setHasMore(false);
      }
    } finally {
      loadingState(false);
    }
  };

  const loadReviewSummary = async () => {
    try {
      const summary = await reviewService.getReviewSummary(movieId);
      setReviewSummary(summary);
    } catch (error) {
      console.error("Failed to load review summary:", error);
    }
  };

  const handleWriteReview = () => {
    if (!user) {
      alert("리뷰를 작성하려면 로그인이 필요합니다.");
      return;
    }
    setEditingReview(null);
    setIsFormOpen(true);
  };

  const handleEditReview = (review) => {
    console.log("Edit review handler called with:", review);
    setEditingReview(review);
    setIsFormOpen(true);
  };

  const handleDeleteReview = (reviewId) => {
    setReviews((prev) => prev.filter((review) => review.reviewId !== reviewId));
    loadReviewSummary(); // 요약 정보 다시 로드
  };

  const handleFormSuccess = () => {
    console.log("Review form success - reloading reviews and summary");
    loadReviews(true);
    loadReviewSummary();
    setEditingReview(null); // 수정 모드 초기화
  };

  const handleSortChange = (newSortBy) => {
    console.log(`ReviewSection: Sort changed from ${sortBy} to ${newSortBy}`);
    setSortBy(newSortBy);
    // 정렬 변경 시 페이지네이션 상태 초기화
    setCurrentPage(0);
    setHasMore(true);
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      console.log(
        `ReviewSection: Load more clicked - current page: ${currentPage}`
      );
      loadReviews(false); // reset = false로 더 보기 실행
    }
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = "★".repeat(fullStars);
    if (hasHalfStar) stars += "☆";
    stars += "☆".repeat(5 - Math.ceil(rating));
    return stars;
  };

  return (
    <ReviewSectionContainer>
      <SectionHeader>
        <SectionTitle>관람평</SectionTitle>
        <Button variant="primary" onClick={handleWriteReview}>
          리뷰 작성하기
        </Button>
      </SectionHeader>

      {reviewSummary && (
        <ReviewSummary>
          <AverageRating>
            <RatingNumber>
              {reviewSummary.averageRating.toFixed(1)}
            </RatingNumber>
            <RatingStars>
              {renderStars(reviewSummary.averageRating)}
            </RatingStars>
            <TotalReviews>{reviewSummary.totalReviews}개의 평가</TotalReviews>
          </AverageRating>
        </ReviewSummary>
      )}

      <FilterControls>
        <FilterButton
          active={sortBy === "latest"}
          onClick={() => handleSortChange("latest")}
        >
          최신순
        </FilterButton>
        <FilterButton
          active={sortBy === "like"}
          onClick={() => handleSortChange("like")}
        >
          좋아요순
        </FilterButton>
      </FilterControls>

      <ReviewList>
        {isLoading ? (
          <LoadingMessage>리뷰를 불러오는 중...</LoadingMessage>
        ) : reviews.length > 0 ? (
          <>
            {reviews.map((review) => (
              <ReviewCard
                key={review.reviewId}
                review={review}
                onUpdate={handleEditReview}
                onDelete={handleDeleteReview}
              />
            ))}
            {hasMore && (
              <LoadMoreButton>
                <Button
                  variant="secondary"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? "불러오는 중..." : "더 보기"}
                </Button>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    textAlign: "center",
                    marginTop: "8px",
                  }}
                >
                  현재 페이지: {currentPage} | 로드된 리뷰: {reviews.length}개
                </div>
              </LoadMoreButton>
            )}
          </>
        ) : (
          <EmptyMessage>
            아직 작성된 리뷰가 없습니다.
            <br />첫 번째 리뷰를 작성해보세요!
          </EmptyMessage>
        )}
      </ReviewList>

      <ReviewForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        movieId={movieId}
        movieTitle={movieTitle}
        editingReview={editingReview}
        onSuccess={handleFormSuccess}
      />
    </ReviewSectionContainer>
  );
};

export default ReviewSection;
