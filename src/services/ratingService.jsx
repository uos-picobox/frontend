// src/services/ratingService.js
import apiClient from "./apiClient";
import { API_ENDPOINTS_ADMIN, ensureArray } from "../constants/config"; // API_ENDPOINTS_ADMIN 사용

/**
 * Fetches all movie ratings.
 * @returns {Promise<MovieRatingResponseDto[]>}
 */
export const getAllRatings = async () => {
  // API: /api/admin/movie-ratings/get GET
  const ratingsData = await apiClient.get(
    API_ENDPOINTS_ADMIN.MOVIE_RATINGS_GET_ALL
  );
  return ensureArray(ratingsData);
};

/**
 * Fetches a single rating by ID.
 * @param {number|string} ratingId
 * @returns {Promise<MovieRatingResponseDto>}
 */
export const getRatingById = async (ratingId) => {
  // API: /api/admin/movie-ratings/get/{ratingId} GET
  return apiClient.get(API_ENDPOINTS_ADMIN.MOVIE_RATING_GET_BY_ID(ratingId));
};

/**
 * Adds a new movie rating.
 * @param {MovieRatingRequestDto} ratingData ({ ratingName, description? })
 * @returns {Promise<MovieRatingResponseDto>}
 */
export const addRating = async (ratingData) => {
  // API: /api/admin/movie-ratings/create POST
  return apiClient.post(API_ENDPOINTS_ADMIN.MOVIE_RATING_CREATE, ratingData);
};

/**
 * Updates an existing movie rating.
 * @param {number|string} ratingId
 * @param {MovieRatingRequestDto} ratingData ({ ratingName, description? })
 * @returns {Promise<MovieRatingResponseDto>}
 */
export const updateRating = async (ratingId, ratingData) => {
  // API: /api/admin/movie-ratings/update/{ratingId} PUT
  return apiClient.put(
    API_ENDPOINTS_ADMIN.MOVIE_RATING_UPDATE(ratingId),
    ratingData
  );
};

/**
 * Deletes a movie rating.
 * @param {number|string} ratingId
 * @returns {Promise<null>}
 */
export const deleteRating = async (ratingId) => {
  // API: /api/admin/movie-ratings/delete/{ratingId} DELETE
  return apiClient.delete(API_ENDPOINTS_ADMIN.MOVIE_RATING_DELETE(ratingId));
};
