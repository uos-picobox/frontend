import apiClient from "./apiClient";
import { API_ENDPOINTS_CUSTOMER } from "../constants/config";

// 내가 작성한 리뷰 목록 조회
export const getMyReviews = async (page = 0, size = 10) => {
  try {
    console.log(`reviewService: getMyReviews - page: ${page}, size: ${size}`);

    const response = await apiClient.get(API_ENDPOINTS_CUSTOMER.REVIEWS_MY, {
      page: page,
      size: size,
    });
    return response.data || response;
  } catch (error) {
    console.error("Failed to fetch my reviews:", error);
    throw error;
  }
};

// 영화별 리뷰 목록 조회
export const getReviewsByMovie = async (
  movieId,
  sortBy = "latest",
  page = 0,
  size = 10
) => {
  try {
    console.log(
      `reviewService: getReviewsByMovie - movieId: ${movieId}, sortBy: ${sortBy}, page: ${page}, size: ${size}`
    );

    const response = await apiClient.get(
      API_ENDPOINTS_CUSTOMER.REVIEWS_BY_MOVIE(movieId),
      {
        sortBy: sortBy,
        page: page,
        size: size,
      }
    );

    // API 응답이 null이거나 data가 없는 경우 기본값 반환
    if (!response) {
      return {
        content: [],
        totalPages: 0,
        totalElements: 0,
        size: size,
        number: page,
        first: true,
        last: true,
        empty: true,
      };
    }

    return response.data || response;
  } catch (error) {
    console.error("Failed to fetch movie reviews:", error);

    // 404 오류의 경우 빈 결과 반환
    if (error.status === 404) {
      return {
        content: [],
        totalPages: 0,
        totalElements: 0,
        size: size,
        number: page,
        first: true,
        last: true,
        empty: true,
      };
    }

    throw error;
  }
};

// 영화 리뷰 요약 정보 조회
export const getReviewSummary = async (movieId) => {
  try {
    console.log(`reviewService: getReviewSummary - movieId: ${movieId}`);

    const response = await apiClient.get(
      API_ENDPOINTS_CUSTOMER.REVIEWS_SUMMARY(movieId)
    );

    // API 응답이 null이거나 data가 없는 경우 기본값 반환
    if (!response) {
      return {
        movieId: parseInt(movieId),
        averageRating: 0,
        totalReviews: 0,
      };
    }

    return response.data || response;
  } catch (error) {
    console.error("Failed to fetch review summary:", error);

    // 404 오류의 경우 기본값 반환
    if (error.status === 404) {
      return {
        movieId: parseInt(movieId),
        averageRating: 0,
        totalReviews: 0,
      };
    }

    throw error;
  }
};

// 리뷰 작성
export const createReview = async (reviewData) => {
  try {
    const response = await apiClient.post(
      API_ENDPOINTS_CUSTOMER.REVIEWS_CREATE,
      reviewData
    );
    return response.data;
  } catch (error) {
    console.error("Failed to create review:", error);

    // API가 404를 반환하는 경우 예약 정보 관련 오류일 수 있음
    if (error.status === 404) {
      const errorMessage =
        error.message || "해당 예약 정보를 찾을 수 없습니다.";
      throw new Error(errorMessage);
    }

    throw error;
  }
};

// 리뷰 수정
export const updateReview = async (reviewId, reviewData) => {
  try {
    console.log(
      `reviewService: updateReview - reviewId: ${reviewId}, data:`,
      reviewData
    );

    const response = await apiClient.put(
      API_ENDPOINTS_CUSTOMER.REVIEWS_UPDATE(reviewId),
      reviewData
    );

    console.log("reviewService: updateReview success response:", response);
    return response.data || response;
  } catch (error) {
    console.error("Failed to update review:", error);

    // API가 404를 반환하는 경우 리뷰를 찾을 수 없음
    if (error.status === 404) {
      const errorMessage = error.message || "리뷰를 찾을 수 없습니다.";
      throw new Error(errorMessage);
    }

    // API가 403을 반환하는 경우 권한 없음
    if (error.status === 403) {
      const errorMessage = error.message || "리뷰를 수정할 권한이 없습니다.";
      throw new Error(errorMessage);
    }

    throw error;
  }
};

// 리뷰 삭제
export const deleteReview = async (reviewId) => {
  try {
    await apiClient.delete(API_ENDPOINTS_CUSTOMER.REVIEWS_DELETE(reviewId));
    return true;
  } catch (error) {
    console.error("Failed to delete review:", error);

    // API가 404를 반환하는 경우 리뷰를 찾을 수 없음
    if (error.status === 404) {
      const errorMessage = error.message || "삭제할 리뷰를 찾을 수 없습니다.";
      throw new Error(errorMessage);
    }

    throw error;
  }
};

// 리뷰 좋아요 토글
export const toggleReviewLike = async (reviewId) => {
  try {
    const response = await apiClient.post(
      API_ENDPOINTS_CUSTOMER.REVIEWS_LIKE_TOGGLE(reviewId)
    );
    return response.data;
  } catch (error) {
    console.error("Failed to toggle review like:", error);

    // API가 404를 반환하는 경우 리뷰를 찾을 수 없음
    if (error.status === 404) {
      const errorMessage = error.message || "좋아요할 리뷰를 찾을 수 없습니다.";
      throw new Error(errorMessage);
    }

    throw error;
  }
};
