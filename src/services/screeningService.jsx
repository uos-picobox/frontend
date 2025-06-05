// src/services/screeningService.js
import apiClient from "./apiClient";
import {
  API_ENDPOINTS_ADMIN,
  API_ENDPOINTS_USER,
  ensureArray,
} from "../constants/config"; // API_ENDPOINTS_USER 추가 (공개 API용)
import { mockPublicScreenings } from "../constants/mockData";

// --- Public/User Facing (Using Mock Data) ---
/**
 * Fetches screenings for a specific movie on a specific date for user display using MOCK DATA.
 * @param {number|string} movieId
 * @param {string} date - Date in 'YYYY-MM-DD' format
 * @returns {Promise<ScreeningResponseDto[]>}
 */
export const getPublicScreeningsForMovieDate = async (movieId, date) => {
  console.log(
    `screeningService: getPublicScreeningsForMovieDate called for movie ${movieId}, date ${date} (using mock data)`
  );
  return new Promise((resolve) => {
    setTimeout(() => {
      const filteredScreenings = mockPublicScreenings.filter(
        (s) =>
          s.movie.movieId.toString() === movieId.toString() &&
          s.screeningDate === date
      );
      resolve(JSON.parse(JSON.stringify(filteredScreenings)));
    }, 250);
  });
};

// --- Admin Specific (Using Live API) ---
/**
 * Fetches all screenings (Admin).
 * @returns {Promise<ScreeningResponseDto[]>}
 */
export const getAllScreenings = async () => {
  const screeningsData = await apiClient.get(
    API_ENDPOINTS_ADMIN.SCREENINGS_GET_ALL
  );
  return ensureArray(screeningsData);
};

/**
 * Fetches a single screening by its ID (Admin).
 * @param {number|string} screeningId
 * @returns {Promise<ScreeningResponseDto>}
 */
export const getScreeningById = async (screeningId) => {
  return apiClient.get(API_ENDPOINTS_ADMIN.SCREENING_GET_BY_ID(screeningId));
};

/**
 * Adds a new screening schedule (Admin).
 * @param {ScreeningRequestDto} screeningData
 * @returns {Promise<ScreeningResponseDto>}
 */
export const addScreening = async (screeningData) => {
  return apiClient.post(API_ENDPOINTS_ADMIN.SCREENING_CREATE, screeningData);
};

/**
 * Updates an existing screening (Admin).
 * @param {number|string} screeningId
 * @param {ScreeningRequestDto} screeningData
 * @returns {Promise<ScreeningResponseDto>}
 */
export const updateScreening = async (screeningId, screeningData) => {
  return apiClient.put(
    API_ENDPOINTS_ADMIN.SCREENING_UPDATE(screeningId),
    screeningData
  );
};

/**
 * Deletes a screening (Admin).
 * @param {number|string} screeningId
 * @returns {Promise<null>}
 */
export const deleteScreening = async (screeningId) => {
  return apiClient.delete(API_ENDPOINTS_ADMIN.SCREENING_DELETE(screeningId));
};
