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

    // 500 서버 오류나 404 API 미구현 시 기본값 반환
    if (error.status === 500) {
      console.warn(
        "포인트 잔액 서버 오류가 발생했습니다. 기본값 0을 반환합니다."
      );
      return { balance: 0 };
    } else if (error.status === 404) {
      console.warn(
        "포인트 잔액 API가 구현되지 않았습니다. 기본값 0을 반환합니다."
      );
      return { balance: 0 };
    } else if (error.status === 401) {
      // 인증 오류는 상위로 전달
      throw error;
    }

    // 기타 오류도 기본값으로 처리하여 페이지 로딩을 방해하지 않음
    console.warn("포인트 잔액 조회 중 오류가 발생했습니다:", error.message);
    return { balance: 0 };
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

    // 500 서버 오류나 404 API 미구현 시 빈 배열 반환
    if (error.status === 500) {
      console.warn(
        "포인트 내역 서버 오류가 발생했습니다. 빈 배열을 반환합니다."
      );
      return [];
    } else if (error.status === 404) {
      console.warn(
        "포인트 내역 API가 구현되지 않았습니다. 빈 배열을 반환합니다."
      );
      return [];
    } else if (error.status === 401) {
      // 인증 오류는 상위로 전달
      throw error;
    }

    // 기타 오류도 빈 배열로 처리하여 페이지 로딩을 방해하지 않음
    console.warn("포인트 내역 조회 중 오류가 발생했습니다:", error.message);
    return [];
  }
};
