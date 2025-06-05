// src/services/priceService.js
import apiClient from "./apiClient";
import { API_ENDPOINTS_ADMIN, ensureArray } from "../constants/config";
import { mockPublicPriceSettings } from "../constants/mockData";

// --- Public/User Facing (Using Mock Data) ---
export const getPublicPriceSettingsByRoom = async (roomId) => {
  console.log(
    `priceService: getPublicPriceSettingsByRoom for room ${roomId} (mock)`
  );
  return new Promise((resolve) => {
    setTimeout(() => {
      const settings = mockPublicPriceSettings.filter(
        (ps) => ps.roomId.toString() === roomId.toString()
      );
      resolve(JSON.parse(JSON.stringify(settings)));
    }, 100);
  });
};

// --- Admin Specific (Using Live API) ---

// Removed getAllPriceSettings as per user feedback (no API for getting ALL settings without params)

/**
 * Fetches a specific price setting by roomId and ticketTypeId (Admin).
 * API: /api/admin/price-settings/get?roomId={roomId}&ticketTypeId={ticketTypeId} GET
 * @param {number|string} roomId
 * @param {number|string} ticketTypeId
 * @returns {Promise<PriceSettingResponseDto>}
 */
export const getSpecificPriceSetting = async (roomId, ticketTypeId) => {
  return apiClient.get(
    API_ENDPOINTS_ADMIN.PRICE_SETTING_GET_SPECIFIC(roomId, ticketTypeId)
  );
};

/**
 * Fetches price settings for a specific room (Admin).
 * API: /api/admin/price-settings/room/{roomId} GET
 * @param {number|string} roomId
 * @returns {Promise<PriceSettingResponseDto[]>}
 */
export const getPriceSettingsByRoom_Admin = async (roomId) => {
  const priceSettingsData = await apiClient.get(
    API_ENDPOINTS_ADMIN.PRICE_SETTINGS_GET_BY_ROOM(roomId)
  );
  return ensureArray(priceSettingsData);
};

/**
 * Sets (creates or updates) a price (Admin).
 * API: /api/admin/price-settings/set POST
 * @param {PriceSettingRequestDto} priceSettingData ({ roomId, ticketTypeId, price })
 * @returns {Promise<PriceSettingResponseDto>}
 */
export const setPrice = async (priceSettingData) => {
  return apiClient.post(
    API_ENDPOINTS_ADMIN.PRICE_SETTING_SET,
    priceSettingData
  );
};

/**
 * Deletes a price setting (Admin).
 * API: /api/admin/price-settings/delete?roomId={roomId}&ticketTypeId={ticketTypeId} DELETE
 * @param {number|string} roomId
 * @param {number|string} ticketTypeId
 * @returns {Promise<null>}
 */
export const deletePriceSetting = async (roomId, ticketTypeId) => {
  return apiClient.delete(
    API_ENDPOINTS_ADMIN.PRICE_SETTING_DELETE(roomId, ticketTypeId)
  );
};
