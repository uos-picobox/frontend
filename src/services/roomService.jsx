// src/services/roomService.js
import apiClient from "./apiClient";
import { API_ENDPOINTS_ADMIN, ensureArray } from "../constants/config";
import { mockPublicScreeningRooms } from "../constants/mockData";

// --- Public/User Facing (Using Mock Data) ---
/**
 * Fetches a single screening room by its ID for public display using MOCK DATA.
 * Needed for BookingPage to get seatLayout.
 * @param {number|string} roomId
 * @returns {Promise<ScreeningRoomResponseDto | null>}
 */
export const getPublicScreeningRoomById = async (roomId) => {
  console.log(
    `roomService: getPublicScreeningRoomById called for room ${roomId} (using mock data)`
  );
  return new Promise((resolve) => {
    setTimeout(() => {
      const room = mockPublicScreeningRooms.find(
        (r) => r.roomId.toString() === roomId.toString()
      );
      resolve(room ? JSON.parse(JSON.stringify(room)) : null);
    }, 150);
  });
};

// --- Admin Specific (Using Live API) ---
/**
 * Fetches all screening rooms (Admin).
 * @returns {Promise<ScreeningRoomResponseDto[]>}
 */
export const getAllScreeningRooms = async () => {
  const roomsData = await apiClient.get(API_ENDPOINTS_ADMIN.ROOMS_GET_ALL);
  return ensureArray(roomsData);
};

/**
 * Fetches a single screening room by its ID (Admin).
 * @param {number|string} roomId
 * @returns {Promise<ScreeningRoomResponseDto>}
 */
export const getScreeningRoomById_Admin = async (roomId) => {
  return apiClient.get(API_ENDPOINTS_ADMIN.ROOM_GET_BY_ID(roomId));
};

/**
 * Adds a new screening room (Admin).
 * @param {ScreeningRoomRequestDto} roomData
 * @returns {Promise<ScreeningRoomResponseDto>}
 */
export const addScreeningRoom = async (roomData) => {
  return apiClient.post(API_ENDPOINTS_ADMIN.ROOM_CREATE, roomData);
};

/**
 * Updates an existing screening room (Admin).
 * @param {number|string} roomId
 * @param {ScreeningRoomRequestDto} roomData
 * @returns {Promise<ScreeningRoomResponseDto>}
 */
export const updateScreeningRoom = async (roomId, roomData) => {
  return apiClient.put(API_ENDPOINTS_ADMIN.ROOM_UPDATE(roomId), roomData);
};

/**
 * Deletes a screening room (Admin).
 * @param {number|string} roomId
 * @returns {Promise<null>}
 */
export const deleteScreeningRoom = async (roomId) => {
  return apiClient.delete(API_ENDPOINTS_ADMIN.ROOM_DELETE(roomId));
};
