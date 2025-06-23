import apiClient from "./apiClient";
import { API_ENDPOINTS_CUSTOMER } from "../constants/config";

/**
 * Get my reservations list
 * @returns {Promise<Array>}
 */
export const getMyReservations = async () => {
  console.log("reservationService: getMyReservations called");
  try {
    const response = await apiClient.get(
      API_ENDPOINTS_CUSTOMER.RESERVATIONS_MY
    );
    console.log("reservationService: getMyReservations success:", response);
    return response || [];
  } catch (error) {
    console.error("reservationService: getMyReservations error:", error);
    throw error;
  }
};

/**
 * Get reservation detail by ID
 * @param {number} reservationId
 * @returns {Promise<Object>}
 */
export const getReservationDetail = async (reservationId) => {
  console.log(
    "reservationService: getReservationDetail called for ID:",
    reservationId
  );
  try {
    const response = await apiClient.get(
      API_ENDPOINTS_CUSTOMER.RESERVATIONS_DETAIL(reservationId)
    );
    console.log("reservationService: getReservationDetail success:", response);
    return response;
  } catch (error) {
    console.error("reservationService: getReservationDetail error:", error);
    throw error;
  }
};

/**
 * Get mobile ticket by reservation ID
 * @param {number} reservationId
 * @returns {Promise<Object>}
 */
export const getReservationTicket = async (reservationId) => {
  console.log(
    "reservationService: getReservationTicket called for ID:",
    reservationId
  );
  try {
    const response = await apiClient.get(
      API_ENDPOINTS_CUSTOMER.RESERVATIONS_TICKET(reservationId)
    );
    console.log("reservationService: getReservationTicket success:", response);
    return response;
  } catch (error) {
    console.error("reservationService: getReservationTicket error:", error);
    throw error;
  }
};

/**
 * Hold seats for reservation
 * @param {Object} holdData - { screeningId, seatIds }
 * @returns {Promise<any>}
 */
export const holdSeats = async (holdData) => {
  console.log("reservationService: holdSeats called with:", holdData);
  try {
    const response = await apiClient.post(
      API_ENDPOINTS_CUSTOMER.RESERVATIONS_HOLD,
      holdData
    );
    console.log("reservationService: holdSeats success:", response);
    return response;
  } catch (error) {
    console.error("reservationService: holdSeats error:", error);
    throw error;
  }
};

/**
 * Release held seats
 * @param {Object} releaseData - { screeningId, seatIds }
 * @returns {Promise<any>}
 */
export const releaseSeats = async (releaseData) => {
  console.log("reservationService: releaseSeats called with:", releaseData);
  try {
    const response = await apiClient.post(
      API_ENDPOINTS_CUSTOMER.RESERVATIONS_RELEASE,
      releaseData
    );
    console.log("reservationService: releaseSeats success:", response);
    return response;
  } catch (error) {
    console.error("reservationService: releaseSeats error:", error);
    throw error;
  }
};

/**
 * Create reservation before payment
 * @param {Object} reservationData - { screeningId, ticketTypes, seatIds }
 * @returns {Promise<any>}
 */
export const createReservation = async (reservationData) => {
  console.log(
    "reservationService: createReservation called with:",
    reservationData
  );
  try {
    const response = await apiClient.post(
      API_ENDPOINTS_CUSTOMER.RESERVATIONS_CREATE,
      reservationData
    );
    console.log("reservationService: createReservation success:", response);

    // 백엔드가 완전히 구현되지 않은 경우 fallback 처리
    if (!response || !response.reservationId) {
      console.warn("reservationService: API response is empty, using fallback");
      const fallbackReservation = {
        reservationId: Date.now(), // 임시 예약 ID
        screeningId: reservationData.screeningId,
        ticketTypes: reservationData.ticketTypes,
        seatIds: reservationData.seatIds,
        status: "PENDING_PAYMENT",
        createdAt: new Date().toISOString(),
        totalAmount: 0, // 실제로는 백엔드에서 계산
      };
      console.log(
        "reservationService: Using fallback reservation:",
        fallbackReservation
      );
      return fallbackReservation;
    }

    return response;
  } catch (error) {
    console.error("reservationService: createReservation error:", error);

    // 404 오류인 경우 (API가 구현되지 않음) fallback 사용
    if (error.status === 404 || error.response?.status === 404) {
      console.warn("reservationService: API not implemented, using fallback");
      const fallbackReservation = {
        reservationId: Date.now(), // 임시 예약 ID
        screeningId: reservationData.screeningId,
        ticketTypes: reservationData.ticketTypes,
        seatIds: reservationData.seatIds,
        status: "PENDING_PAYMENT",
        createdAt: new Date().toISOString(),
        totalAmount: 0, // 실제로는 백엔드에서 계산
      };
      console.log(
        "reservationService: Using fallback reservation for 404:",
        fallbackReservation
      );
      return fallbackReservation;
    }

    throw error;
  }
};

/**
 * Complete payment for reservation
 * @param {number} reservationId
 * @returns {Promise<any>}
 */
export const completeReservation = async (reservationId) => {
  console.log(
    "reservationService: completeReservation called for ID:",
    reservationId
  );
  try {
    const response = await apiClient.post(
      API_ENDPOINTS_CUSTOMER.RESERVATIONS_COMPLETE(reservationId)
    );
    console.log("reservationService: completeReservation success:", response);
    return response;
  } catch (error) {
    console.error("reservationService: completeReservation error:", error);
    throw error;
  }
};

/**
 * Cancel reservation
 * @param {Object} cancelData - { reservationId, refundReason }
 * @returns {Promise<any>}
 */
export const cancelReservation = async (cancelData) => {
  console.log("reservationService: cancelReservation called with:", cancelData);
  try {
    const response = await apiClient.post(
      API_ENDPOINTS_CUSTOMER.RESERVATIONS_CANCEL,
      cancelData
    );
    console.log("reservationService: cancelReservation success:", response);
    return response;
  } catch (error) {
    console.error("reservationService: cancelReservation error:", error);
    throw error;
  }
};
