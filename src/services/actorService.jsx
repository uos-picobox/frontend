// src/services/actorService.js
import apiClient from "./apiClient";
// API_ENDPOINTS 대신 API_ENDPOINTS_ADMIN를 임포트합니다.
import {
  API_ENDPOINTS_ADMIN,
  API_ENDPOINTS_CUSTOMER,
  ensureArray,
} from "../constants/config";
import { mockPublicActorsData } from "../constants/mockData";

/**
 * Fetches all actors.
 * @returns {Promise<ActorResponseDto[]>}
 */
export const getAllActors = async () => {
  const actorsData = await apiClient.get(API_ENDPOINTS_ADMIN.ACTORS_GET_ALL);
  return ensureArray(actorsData);
};

/**
 * Fetches a single actor by ID.
 * @param {number|string} actorId
 * @returns {Promise<ActorResponseDto>}
 */
export const getActorById = async (actorId) => {
  return apiClient.get(API_ENDPOINTS_ADMIN.ACTOR_GET_BY_ID(actorId));
};

/**
 * Adds a new actor (JSON data only).
 * @param {ActorRequestDto} actorData
 * @returns {Promise<ActorResponseDto>}
 */
export const addActor = async (actorData) => {
  return apiClient.post(API_ENDPOINTS_ADMIN.ACTOR_CREATE, actorData);
};

/**
 * Adds a new actor with a profile image.
 * @param {FormData} formData
 * @returns {Promise<ActorResponseDto>}
 */
export const addActorWithImage = async (formData) => {
  return apiClient.post(
    API_ENDPOINTS_ADMIN.ACTOR_CREATE_WITH_IMAGE,
    formData,
    true
  );
};

/**
 * Updates an existing actor (JSON data only).
 * @param {number|string} actorId
 * @param {ActorRequestDto} actorData
 * @returns {Promise<ActorResponseDto>}
 */
export const updateActor = async (actorId, actorData) => {
  return apiClient.put(API_ENDPOINTS_ADMIN.ACTOR_UPDATE(actorId), actorData);
};

/**
 * Updates an existing actor with a new profile image.
 * @param {number|string} actorId
 * @param {FormData} formData
 * @returns {Promise<ActorResponseDto>}
 */
export const updateActorWithImage = async (actorId, formData) => {
  return apiClient.put(
    API_ENDPOINTS_ADMIN.ACTOR_UPDATE_WITH_IMAGE(actorId),
    formData,
    true
  );
};

/**
 * Updates/sets or deletes an actor's profile image.
 * @param {number|string} actorId
 * @param {File|null} imageFile
 * @returns {Promise<ActorResponseDto>}
 */
export const setActorProfileImage = async (actorId, imageFile) => {
  const formData = new FormData();
  if (imageFile) {
    formData.append("profileImageFile", imageFile);
  }
  return apiClient.put(
    API_ENDPOINTS_ADMIN.ACTOR_UPDATE_PROFILE_IMAGE(actorId),
    formData,
    true
  );
};

/**
 * Deletes an actor.
 * @param {number|string} actorId
 * @param {boolean} [force=false]
 * @returns {Promise<null>}
 */
export const deleteActor = async (actorId, force = false) => {
  return apiClient.delete(API_ENDPOINTS_ADMIN.ACTOR_DELETE(actorId, force));
};

// ===== Public API Functions =====
/**
 * Fetches a single actor by ID for public use.
 * @param {number|string} actorId
 * @returns {Promise<ActorResponseDto>}
 */
export const getPublicActorById = async (actorId) => {
  try {
    return await apiClient.get(API_ENDPOINTS_CUSTOMER.ACTOR_GET_BY_ID(actorId));
  } catch (error) {
    console.warn(
      `API call failed for actor ${actorId}, using mock data:`,
      error
    );
    // API 호출 실패 시 목업 데이터로 fallback
    const mockActor = mockPublicActorsData.find(
      (actor) => actor.actorId.toString() === actorId.toString()
    );

    if (mockActor) {
      return mockActor;
    } else {
      throw new Error(`배우 ID ${actorId}를 찾을 수 없습니다.`);
    }
  }
};
