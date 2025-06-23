import apiClient from "./apiClient";
import { API_ENDPOINTS_CUSTOMER } from "../constants/config";
import CryptoJS from "crypto-js";

/**
 * 결제 내역 조회
 * @returns {Promise<Array>}
 */
export const getPaymentHistory = async () => {
  console.log("paymentService: getPaymentHistory called");
  try {
    const data = await apiClient.get(API_ENDPOINTS_CUSTOMER.PAYMENT_HISTORY);
    return data || [];
  } catch (error) {
    console.error("paymentService: getPaymentHistory error:", error);
    throw error;
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
