import apiClient from "./apiClient";
import { API_ENDPOINTS_CUSTOMER } from "../constants/config";

/**
 * 포인트 잔액을 안전하게 추출하는 헬퍼 함수
 * @param {any} data - API 응답 데이터
 * @returns {number} 포인트 잔액
 */
const extractPointBalance = (data) => {
  if (data === null || data === undefined) {
    return 0;
  }

  // 숫자인 경우 직접 반환
  if (typeof data === "number") {
    return Math.max(0, parseInt(data) || 0);
  }

  // 문자열인 경우 숫자로 변환
  if (typeof data === "string") {
    const parsed = parseInt(data);
    return Math.max(0, isNaN(parsed) ? 0 : parsed);
  }

  // 객체인 경우 다양한 필드명 시도
  if (typeof data === "object") {
    const possibleFields = [
      "balance",
      "points",
      "point",
      "amount",
      "value",
      "pointBalance",
      "totalPoints",
      "availablePoints",
    ];

    for (const field of possibleFields) {
      if (data.hasOwnProperty(field)) {
        const value = data[field];
        if (typeof value === "number") {
          return Math.max(0, value);
        }
        if (typeof value === "string") {
          const parsed = parseInt(value);
          return Math.max(0, isNaN(parsed) ? 0 : parsed);
        }
      }
    }
  }

  return 0;
};

/**
 * 포인트 잔액 조회
 * @returns {Promise<Object>} { balance: number }
 */
export const getPointBalance = async () => {
  console.log("pointService: getPointBalance called");
  try {
    const data = await apiClient.get(API_ENDPOINTS_CUSTOMER.POINT_BALANCE);
    const balance = extractPointBalance(data);

    console.log(
      "pointService: getPointBalance success - raw data:",
      data,
      "extracted balance:",
      balance
    );

    return { balance };
  } catch (error) {
    console.error("pointService: getPointBalance error:", error);

    // 401 인증 오류는 상위로 전달 (로그인 필요)
    if (error.status === 401) {
      throw error;
    }

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
    console.log("pointService: getPointHistory success:", data);
    return data || [];
  } catch (error) {
    console.error("pointService: getPointHistory error:", error);

    // 401 인증 오류는 상위로 전달
    if (error.status === 401) {
      throw error;
    }

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
    }

    // 기타 오류도 빈 배열로 처리하여 페이지 로딩을 방해하지 않음
    console.warn("포인트 내역 조회 중 오류가 발생했습니다:", error.message);
    return [];
  }
};
