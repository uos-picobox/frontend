import apiClient from "./apiClient";
import { API_ENDPOINTS_CUSTOMER } from "../constants/config";
import CryptoJS from "crypto-js";

/**
 * 결제 내역 조회 (특정 예약의 결제 정보)
 * @param {number} reservationId - 예약 ID (필수)
 * @returns {Promise<Object>}
 */
export const getPaymentHistory = async (reservationId) => {
  console.log(
    "paymentService: getPaymentHistory called with reservationId:",
    reservationId
  );

  if (!reservationId) {
    throw new Error("reservationId is required for payment history");
  }

  try {
    const data = await apiClient.get(API_ENDPOINTS_CUSTOMER.PAYMENT_HISTORY, {
      reservationId: reservationId,
    });
    return data || {};
  } catch (error) {
    console.error("paymentService: getPaymentHistory error:", error);

    // 서버 오류나 API가 구현되지 않은 경우 에러 처리
    if (error.status === 404) {
      console.warn(
        "Payment history not found for reservationId:",
        reservationId
      );
      return null;
    } else if (error.status === 500) {
      console.warn(
        "Payment history server error for reservationId:",
        reservationId
      );
      return null;
    }

    throw error;
  }
};

/**
 * 전체 결제 내역 조회
 * @returns {Promise<Array>}
 */
export const getAllPaymentHistory = async () => {
  console.log("paymentService: getAllPaymentHistory called");

  try {
    // 전체 결제 내역 API 시도
    const data = await apiClient.get(
      API_ENDPOINTS_CUSTOMER.PAYMENT_HISTORY_ALL
    );
    return data || [];
  } catch (error) {
    console.error("paymentService: getAllPaymentHistory error:", error);

    // API가 구현되지 않았거나 오류인 경우 빈 배열 반환
    if (error.status === 404) {
      console.warn(
        "전체 결제 내역 API가 구현되지 않았습니다. 빈 배열을 반환합니다."
      );
    } else if (error.status === 500) {
      console.warn("결제 내역 서버 오류가 발생했습니다. 빈 배열을 반환합니다.");
    } else if (error.status === 401) {
      // 인증 오류는 상위로 전달
      throw error;
    } else {
      console.warn("결제 내역 조회 중 오류가 발생했습니다:", error.message);
    }

    // 오류 발생 시 빈 배열 반환하여 페이지 로딩을 중단하지 않음
    return [];
  }
};

/**
 * 할인 정보 조회
 * @returns {Promise<Array>}
 */
export const getDiscountList = async () => {
  console.log("paymentService: getDiscountList called");
  try {
    const data = await apiClient.get(
      API_ENDPOINTS_CUSTOMER.PAYMENT_DISCOUNT_LIST
    );
    return data || [];
  } catch (error) {
    console.error("paymentService: getDiscountList error:", error);

    // If discount API is not available, return empty array to continue with payment
    if (error.status === 404) {
      console.warn("Discount API not found, returning empty discount list");
      return [];
    }

    // For other errors, return empty array to not block the payment process
    console.warn("Discount API error, returning empty discount list");
    return [];
  }
};

/**
 * 결제 전 정보 저장
 * @param {Object} paymentData
 * @param {number} paymentData.reservationId
 * @param {string} paymentData.orderId
 * @param {string} paymentData.paymentMethod
 * @param {string} paymentData.currency
 * @param {number} paymentData.paymentDiscountId
 * @param {number} paymentData.usedPointAmount
 * @param {number} paymentData.amount
 * @param {number} paymentData.finalAmount
 * @returns {Promise<Object>}
 */
export const savePaymentBefore = async (paymentData) => {
  console.log("paymentService: savePaymentBefore called with:", paymentData);
  try {
    const result = await apiClient.post(
      API_ENDPOINTS_CUSTOMER.PAYMENT_BEFORE,
      paymentData
    );
    console.log("paymentService: savePaymentBefore result:", result);

    // Validate the response has required fields
    if (!result || (!result.paymentId && !result.id)) {
      // If backend is not implemented yet, create a mock response for testing
      console.warn(
        "Backend payment API not implemented, using mock data for testing"
      );
      return {
        paymentId: Date.now(), // Use timestamp as mock payment ID
        orderId: paymentData.orderId,
        status: "PENDING",
      };
    }

    return result;
  } catch (error) {
    console.error("paymentService: savePaymentBefore error:", error);

    // If the error is 404 (API not implemented), provide mock data for testing
    if (error.status === 404) {
      console.warn("Payment API not found, using mock data for testing");
      return {
        paymentId: Date.now(), // Use timestamp as mock payment ID
        orderId: paymentData.orderId,
        status: "PENDING",
      };
    }

    throw error;
  }
};

/**
 * 결제 확인
 * @param {Object} confirmData
 * @param {number} confirmData.paymentId
 * @param {string} confirmData.orderId
 * @param {string} confirmData.paymentKey
 * @param {number} confirmData.finalAmount
 * @returns {Promise<Object>}
 */
export const confirmPayment = async (confirmData) => {
  console.log("paymentService: confirmPayment called with:", confirmData);
  try {
    const result = await apiClient.post(
      API_ENDPOINTS_CUSTOMER.PAYMENT_CONFIRM,
      confirmData
    );
    console.log("paymentService: confirmPayment result:", result);
    return result;
  } catch (error) {
    console.error("paymentService: confirmPayment error:", error);
    throw error;
  }
};

/**
 * orderId 생성
 * @returns {string}
 */
export const generateOrderId = () => {
  return "ORDER-" + Date.now() + "-" + Math.floor(Math.random() * 1000000);
};

/**
 * customerKey 생성
 * @param {number|string} userId
 * @returns {string}
 */
export const generateCustomerKey = (userId) => {
  // Ensure userId is valid
  const validUserId = userId?.toString() || "1";
  const saltedUserId = `constant-salt-${validUserId}`;
  const hash = CryptoJS.SHA256(saltedUserId).toString();
  return `user_${hash.slice(0, 20)}`;
};
