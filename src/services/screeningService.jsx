// src/services/screeningService.js
import apiClient from "./apiClient";
import {
  API_ENDPOINTS_ADMIN,
  API_ENDPOINTS_CUSTOMER,
  ensureArray,
} from "../constants/config"; // API_ENDPOINTS_CUSTOMER 추가 (공개 API용)

// --- Public/User Facing (Using Real API) ---
/**
 * Fetches all screenings for a specific date for user display using REAL API.
 * @param {string} date - Date in 'YYYY-MM-DD' format
 * @returns {Promise<Array>}
 */
export const getPublicScreeningsByDate = async (date) => {
  console.log(
    `screeningService: getPublicScreeningsByDate called for date ${date} (using real API)`
  );
  try {
    const screeningsData = await apiClient.get(
      API_ENDPOINTS_CUSTOMER.SCREENINGS_GET_BY_DATE(date)
    );
    return ensureArray(screeningsData);
  } catch (error) {
    console.error(
      `screeningService: getPublicScreeningsByDate error for date ${date}:`,
      error
    );
    throw error;
  }
};

/**
 * Fetches screenings for a specific movie on a specific date for user display using REAL API.
 * @param {number|string} movieId
 * @param {string} date - Date in 'YYYY-MM-DD' format
 * @returns {Promise<Array>}
 */
export const getPublicScreeningsForMovieDate = async (movieId, date) => {
  console.log(
    `screeningService: getPublicScreeningsForMovieDate called for movie ${movieId}, date ${date} (using real API)`
  );
  try {
    const screeningsData = await apiClient.get(
      API_ENDPOINTS_CUSTOMER.SCREENINGS_FOR_MOVIE_DATE(movieId, date)
    );
    return ensureArray(screeningsData);
  } catch (error) {
    console.error(
      `screeningService: getPublicScreeningsForMovieDate error for movie ${movieId}, date ${date}:`,
      error
    );
    throw error;
  }
};

/**
 * Fetches seat information for a specific screening
 * @param {number|string} screeningId
 * @returns {Promise<Object>}
 */
export const getScreeningSeats = async (screeningId) => {
  console.log(
    `screeningService: getScreeningSeats called for screening ${screeningId}`
  );
  try {
    const seatData = await apiClient.get(
      API_ENDPOINTS_CUSTOMER.SCREENING_SEATS_GET(screeningId)
    );
    return seatData;
  } catch (error) {
    console.error(
      `screeningService: getScreeningSeats error for screening ${screeningId}:`,
      error
    );
    throw error;
  }
};

/**
 * Fetches ticket prices for a specific screening
 * @param {number|string} screeningId
 * @returns {Promise<Object>}
 */
export const getScreeningTicketPrices = async (screeningId) => {
  console.log(
    `screeningService: getScreeningTicketPrices called for screening ${screeningId}`
  );
  try {
    const priceData = await apiClient.get(
      API_ENDPOINTS_CUSTOMER.SCREENING_TICKET_PRICES(screeningId)
    );
    return priceData;
  } catch (error) {
    console.error(
      `screeningService: getScreeningTicketPrices error for screening ${screeningId}:`,
      error
    );
    throw error;
  }
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
  console.log(
    "screeningService: addScreening called with data:",
    screeningData
  );
  console.log("API endpoint:", API_ENDPOINTS_ADMIN.SCREENING_CREATE);

  try {
    const result = await apiClient.post(
      API_ENDPOINTS_ADMIN.SCREENING_CREATE,
      screeningData
    );
    console.log("screeningService: addScreening successful:", result);
    return result;
  } catch (error) {
    console.error("screeningService: addScreening error:", error);
    throw error;
  }
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
