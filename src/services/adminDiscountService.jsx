import apiClient from "./apiClient";
import { API_ENDPOINTS_ADMIN } from "../constants/config";

// 할인 정보 등록
export const registerDiscount = async (discountData) => {
  try {
    console.log(
      "adminDiscountService: registerDiscount called with:",
      discountData
    );

    const response = await apiClient.post(
      API_ENDPOINTS_ADMIN.ADMIN_PAYMENT_DISCOUNT_REGISTER,
      discountData
    );

    console.log("adminDiscountService: registerDiscount response:", response);

    // API 응답이 null이거나 빈 응답인 경우 성공으로 처리
    // 할인 등록 API는 성공 시 빈 응답(204 No Content)을 보낼 수 있음
    if (response === null || response === undefined) {
      console.log(
        "adminDiscountService: API returned null/undefined - treating as success"
      );
      return { success: true };
    }

    // response가 객체이고 data 속성이 있는 경우
    if (typeof response === "object" && response.hasOwnProperty("data")) {
      return response.data;
    }

    // response 자체가 데이터인 경우
    return response;
  } catch (error) {
    console.error("Error registering discount:", error);
    throw error;
  }
};

// 할인 정보 수정
export const updateDiscount = async (discountData) => {
  try {
    console.log(
      "adminDiscountService: updateDiscount called with:",
      discountData
    );

    const response = await apiClient.put(
      API_ENDPOINTS_ADMIN.ADMIN_PAYMENT_DISCOUNT_UPDATE,
      discountData
    );

    console.log("adminDiscountService: updateDiscount response:", response);

    // API 응답이 null이거나 빈 응답인 경우 성공으로 처리
    // 할인 수정 API는 성공 시 빈 응답(204 No Content)을 보낼 수 있음
    if (response === null || response === undefined) {
      console.log(
        "adminDiscountService: API returned null/undefined - treating as success"
      );
      return { success: true };
    }

    // response가 객체이고 data 속성이 있는 경우
    if (typeof response === "object" && response.hasOwnProperty("data")) {
      return response.data;
    }

    // response 자체가 데이터인 경우
    return response;
  } catch (error) {
    console.error("Error updating discount:", error);
    throw error;
  }
};

// 할인 정보 삭제
export const deleteDiscount = async (paymentDiscountId) => {
  try {
    console.log(
      "adminDiscountService: deleteDiscount called with ID:",
      paymentDiscountId
    );

    const response = await apiClient.delete(
      API_ENDPOINTS_ADMIN.ADMIN_PAYMENT_DISCOUNT_DELETE(paymentDiscountId)
    );

    console.log("adminDiscountService: deleteDiscount response:", response);
    return true;
  } catch (error) {
    console.error(`Error deleting discount ${paymentDiscountId}:`, error);
    throw error;
  }
};
