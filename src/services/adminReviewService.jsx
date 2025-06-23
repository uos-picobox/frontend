import apiClient from "./apiClient";
import { API_ENDPOINTS_ADMIN } from "../constants/config";

// 전체 리뷰 목록 조회
// sort: "latest" (최신순) 또는 "oldest" (오래된순)
export const getAllReviews = async (page = 0, size = 10, sort = "latest") => {
  try {
    console.log("adminReviewService: getAllReviews called with:", {
      page,
      size,
      sort,
    });

    const response = await apiClient.get(
      API_ENDPOINTS_ADMIN.ADMIN_REVIEWS_GET_ALL,
      {
        page: page,
        size: size,
        sort: sort,
      }
    );

    console.log("adminReviewService: getAllReviews response:", response);

    // 안전한 응답 처리
    if (response === null || response === undefined) {
      console.log(
        "adminReviewService: API returned null/undefined - returning default"
      );
      return { content: [], totalPages: 0, totalElements: 0 };
    }

    if (
      typeof response === "object" &&
      response !== null &&
      response.hasOwnProperty("data")
    ) {
      return response.data || { content: [], totalPages: 0, totalElements: 0 };
    }

    return response || { content: [], totalPages: 0, totalElements: 0 };
  } catch (error) {
    console.error("Error fetching all reviews:", error);
    throw error;
  }
};

// 리뷰 상세 조회
export const getReviewById = async (reviewId) => {
  try {
    console.log("adminReviewService: getReviewById called with:", reviewId);

    const response = await apiClient.get(
      API_ENDPOINTS_ADMIN.ADMIN_REVIEW_GET_BY_ID(reviewId)
    );

    console.log("adminReviewService: getReviewById response:", response);

    // 안전한 응답 처리
    if (response === null || response === undefined) {
      console.log(
        "adminReviewService: API returned null/undefined - returning null"
      );
      return null;
    }

    if (
      typeof response === "object" &&
      response !== null &&
      response.hasOwnProperty("data")
    ) {
      return response.data;
    }

    return response;
  } catch (error) {
    console.error(`Error fetching review ${reviewId}:`, error);
    throw error;
  }
};

// 리뷰 삭제
export const deleteReview = async (reviewId) => {
  try {
    console.log("adminReviewService: deleteReview called with:", reviewId);

    const response = await apiClient.delete(
      API_ENDPOINTS_ADMIN.ADMIN_REVIEW_DELETE(reviewId)
    );

    console.log("adminReviewService: deleteReview response:", response);

    return true;
  } catch (error) {
    console.error(`Error deleting review ${reviewId}:`, error);
    throw error;
  }
};

// 특정 영화의 리뷰 목록 조회
// sort: "latest" (최신순) 또는 "like" (좋아요순)
export const getReviewsByMovie = async (
  movieId,
  page = 0,
  size = 10,
  sort = "latest"
) => {
  try {
    console.log("adminReviewService: getReviewsByMovie called with:", {
      movieId,
      page,
      size,
      sort,
    });

    const response = await apiClient.get(
      API_ENDPOINTS_ADMIN.ADMIN_REVIEWS_BY_MOVIE(movieId),
      {
        page: page,
        size: size,
        sort: sort,
      }
    );

    console.log("adminReviewService: getReviewsByMovie response:", response);

    // 안전한 응답 처리
    if (response === null || response === undefined) {
      console.log(
        "adminReviewService: API returned null/undefined - returning default"
      );
      return { content: [], totalPages: 0, totalElements: 0 };
    }

    if (
      typeof response === "object" &&
      response !== null &&
      response.hasOwnProperty("data")
    ) {
      return response.data || { content: [], totalPages: 0, totalElements: 0 };
    }

    return response || { content: [], totalPages: 0, totalElements: 0 };
  } catch (error) {
    console.error(`Error fetching reviews for movie ${movieId}:`, error);
    throw error;
  }
};

// 특정 고객의 리뷰 목록 조회
// 고객별 리뷰는 sort 파라미터 없음 (page, size만 사용)
export const getReviewsByCustomer = async (customerId, page = 0, size = 10) => {
  try {
    console.log("adminReviewService: getReviewsByCustomer called with:", {
      customerId,
      page,
      size,
    });

    const response = await apiClient.get(
      API_ENDPOINTS_ADMIN.ADMIN_REVIEWS_BY_CUSTOMER(customerId),
      {
        page: page,
        size: size,
      }
    );

    console.log("adminReviewService: getReviewsByCustomer response:", response);

    // 안전한 응답 처리
    if (response === null || response === undefined) {
      console.log(
        "adminReviewService: API returned null/undefined - returning default"
      );
      return { content: [], totalPages: 0, totalElements: 0 };
    }

    if (
      typeof response === "object" &&
      response !== null &&
      response.hasOwnProperty("data")
    ) {
      return response.data || { content: [], totalPages: 0, totalElements: 0 };
    }

    return response || { content: [], totalPages: 0, totalElements: 0 };
  } catch (error) {
    console.error(`Error fetching reviews for customer ${customerId}:`, error);
    throw error;
  }
};
