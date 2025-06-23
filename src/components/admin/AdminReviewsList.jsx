import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import Button from "../common/Button";
import Modal from "../common/Modal";
import * as adminReviewService from "../../services/adminReviewService";

const Container = styled.div`
  background-color: ${({ theme }) => theme.colors.surfaceDarker};
  padding: ${({ theme }) => theme.spacing[6]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
`;

const Header = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const Controls = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  align-items: center;
  flex-wrap: wrap;
`;

const Select = styled.select`
  padding: ${({ theme }) => theme.spacing[2]};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const ReviewCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing[3]};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const ReviewInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const MovieTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const CustomerInfo = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textLighter};
  margin: 0;
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const Stars = styled.div`
  color: ${({ theme }) => theme.colors.accent};
  font-size: ${({ theme }) => theme.fontSizes.lg};
`;

const RatingValue = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const Comment = styled.p`
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.6;
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

const ReviewMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textLighter};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const LikeCount = styled.span`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-top: ${({ theme }) => theme.spacing[6]};
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing[8]};
  color: ${({ theme }) => theme.colors.textLighter};
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing[8]};
  color: ${({ theme }) => theme.colors.error};
`;

const AdminReviewsList = () => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [sortBy, setSortBy] = useState("latest");
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const pageSize = 10;

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminReviewService.getAllReviews(
        currentPage,
        pageSize,
        sortBy
      );
      setReviews(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      setError("리뷰 목록을 불러오는데 실패했습니다: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, sortBy]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setCurrentPage(0);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleDeleteReview = async () => {
    if (!reviewToDelete) return;

    setIsDeleting(true);
    try {
      await adminReviewService.deleteReview(reviewToDelete.reviewId);
      alert("리뷰가 성공적으로 삭제되었습니다.");
      fetchReviews();
    } catch (err) {
      alert("리뷰 삭제에 실패했습니다: " + err.message);
    } finally {
      setIsDeleting(false);
      setReviewToDelete(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("ko-KR");
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    return (
      <>
        {"★".repeat(fullStars)}
        {hasHalfStar && "☆"}
      </>
    );
  };

  if (isLoading) {
    return <LoadingMessage>리뷰 목록을 불러오는 중...</LoadingMessage>;
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  return (
    <Container>
      <Header>
        <Title>리뷰 관리 ({totalElements}개)</Title>
        <Controls>
          <Select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
          >
            <option value="latest">최신순</option>
            <option value="oldest">오래된순</option>
          </Select>
        </Controls>
      </Header>

      {reviews.length === 0 ? (
        <LoadingMessage>등록된 리뷰가 없습니다.</LoadingMessage>
      ) : (
        <>
          {reviews.map((review) => (
            <ReviewCard key={review.reviewId}>
              <ReviewHeader>
                <ReviewInfo>
                  <MovieTitle>{review.movieTitle}</MovieTitle>
                  <CustomerInfo>
                    작성자: {review.customerLoginId} (ID: {review.customerId})
                  </CustomerInfo>
                </ReviewInfo>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setReviewToDelete(review)}
                >
                  삭제
                </Button>
              </ReviewHeader>

              <Rating>
                <Stars>{renderStars(review.rating)}</Stars>
                <RatingValue>{review.rating}/5</RatingValue>
              </Rating>

              <Comment>{review.comment}</Comment>

              <ReviewMeta>
                <LikeCount>❤️ {review.likeCount}</LikeCount>
                <span>{formatDate(review.createdAt)}</span>
              </ReviewMeta>
            </ReviewCard>
          ))}

          {totalPages > 1 && (
            <Pagination>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 0}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                이전
              </Button>
              <span>
                {currentPage + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages - 1}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                다음
              </Button>
            </Pagination>
          )}
        </>
      )}

      <Modal
        isOpen={!!reviewToDelete}
        onClose={() => setReviewToDelete(null)}
        title="리뷰 삭제 확인"
        footerActions={
          <>
            <Button
              variant="outline"
              onClick={() => setReviewToDelete(null)}
              disabled={isDeleting}
            >
              취소
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteReview}
              disabled={isDeleting}
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </Button>
          </>
        }
      >
        <p>
          정말로 이 리뷰를 삭제하시겠습니까?
          <br />
          <strong>영화:</strong> {reviewToDelete?.movieTitle}
          <br />
          <strong>작성자:</strong> {reviewToDelete?.customerLoginId}
          <br />이 작업은 되돌릴 수 없습니다.
        </p>
      </Modal>
    </Container>
  );
};

export default AdminReviewsList;
