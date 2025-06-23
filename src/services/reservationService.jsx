import apiClient from "./apiClient";
import { API_ENDPOINTS_USER } from "../constants/config";

/**
 * Fetches user's reservation history
 * @returns {Promise<Array>}
 */
export const getMyReservations = async () => {
  console.log("reservationService: getMyReservations called");
  try {
    const reservations = await apiClient.get(
      API_ENDPOINTS_USER.RESERVATIONS_MY
    );
    return Array.isArray(reservations) ? reservations : [];
  } catch (error) {
    console.error("reservationService: getMyReservations error:", error);
    throw error;
  }
};

/**
 * Holds seats for a specific screening
 * @param {Object} holdData - { screeningId, seatIds }
 * @returns {Promise<Object>}
 */
export const holdSeats = async (holdData) => {
  console.log("reservationService: holdSeats called with:", holdData);
  try {
    const result = await apiClient.post(
      API_ENDPOINTS_USER.RESERVATIONS_HOLD,
      holdData
    );
    return result;
  } catch (error) {
    console.error("reservationService: holdSeats error:", error);
    throw error;
  }
};

/**
 * Releases held seats for a specific screening
 * @param {Object} releaseData - { screeningId, seatIds }
 * @returns {Promise<Object>}
 */
export const releaseSeats = async (releaseData) => {
  console.log("reservationService: releaseSeats called with:", releaseData);
  try {
    const result = await apiClient.post(
      API_ENDPOINTS_USER.RESERVATIONS_RELEASE,
      releaseData
    );
    return result;
  } catch (error) {
    console.error("reservationService: releaseSeats error:", error);
    throw error;
  }
};

/**
 * Creates a reservation before payment
 * @param {Object} reservationData - { screeningId, tickets, usedPoints }
 * @returns {Promise<Object>}
 */
export const createReservation = async (reservationData) => {
  console.log(
    "reservationService: createReservation called with:",
    reservationData
  );
  try {
    const result = await apiClient.post(
      API_ENDPOINTS_USER.RESERVATIONS_CREATE,
      reservationData
    );
    return result;
  } catch (error) {
    console.error("reservationService: createReservation error:", error);
    throw error;
  }
};

/**
 * Completes payment for a reservation
 * @param {Object} paymentData - { reservationId, orderId, paymentKey, paymentMethod, usedPointAmount }
 * @returns {Promise<Object>}
 */
export const completeReservation = async (paymentData) => {
  console.log(
    "reservationService: completeReservation called with:",
    paymentData
  );
  try {
    const result = await apiClient.post(
      API_ENDPOINTS_USER.RESERVATIONS_COMPLETE,
      paymentData
    );
    return result;
  } catch (error) {
    console.error("reservationService: completeReservation error:", error);
    throw error;
  }
};
