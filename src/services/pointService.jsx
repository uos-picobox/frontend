import apiClient from "./apiClient";
import { API_ENDPOINTS_CUSTOMER } from "../constants/config";

/**
 * Get current point balance
 * @returns {Promise<number>}
 */
export const getPointBalance = async () => {
  console.log("pointService: getPointBalance called");
  try {
    const response = await apiClient.get(API_ENDPOINTS_CUSTOMER.POINT_BALANCE);
    console.log("pointService: getPointBalance success:", response);
    return response;
  } catch (error) {
    console.error("pointService: getPointBalance error:", error);
    throw error;
  }
};

/**
 * Get point history
 * @returns {Promise<Array>}
 */
export const getPointHistory = async () => {
  console.log("pointService: getPointHistory called");
  try {
    const response = await apiClient.get(API_ENDPOINTS_CUSTOMER.POINT_HISTORY);
    console.log("pointService: getPointHistory success:", response);
    return response || [];
  } catch (error) {
    console.error("pointService: getPointHistory error:", error);
    throw error;
  }
};
