import apiClient from "./apiClient";
import { API_ENDPOINTS_CUSTOMER } from "../constants/config";

/**
 * 포인트 잔액 조회
 * @returns {Promise<Object>}
 */
export const getPointBalance = async () => {
  console.log("pointService: getPointBalance called");
  try {
    const data = await apiClient.get(API_ENDPOINTS_CUSTOMER.POINT_BALANCE);
    return data || { balance: 0 };
  } catch (error) {
    console.error("pointService: getPointBalance error:", error);
    throw error;
  }
};

/**
 * 포인트 사용 내역 조회
 * @returns {Promise<Array>}
 */
export const getPointHistory = async () => {
  console.log("pointService: getPointHistory called");
  try {
    const data = await apiClient.get(API_ENDPOINTS_CUSTOMER.POINT_HISTORY);
    return data || [];
  } catch (error) {
    console.error("pointService: getPointHistory error:", error);
    throw error;
  }
};
