// src/services/distributorService.js
import apiClient from "./apiClient";
import { API_ENDPOINTS_ADMIN, ensureArray } from "../constants/config";

/**
 * Fetches all distributors.
 * @returns {Promise<DistributorResponseDto[]>}
 */
export const getAllDistributors = async () => {
  const distributorsData = await apiClient.get(
    API_ENDPOINTS_ADMIN.DISTRIBUTORS_GET_ALL
  );
  return ensureArray(distributorsData);
};

/**
 * Fetches a single distributor by ID.
 * @param {number|string} distributorId
 * @returns {Promise<DistributorResponseDto>}
 */
export const getDistributorById = async (distributorId) => {
  return apiClient.get(
    API_ENDPOINTS_ADMIN.DISTRIBUTOR_GET_BY_ID(distributorId)
  );
};

/**
 * Adds a new distributor.
 * @param {DistributorRequestDto} distributorData
 * @returns {Promise<DistributorResponseDto>}
 */
export const addDistributor = async (distributorData) => {
  return apiClient.post(
    API_ENDPOINTS_ADMIN.DISTRIBUTOR_CREATE,
    distributorData
  );
};

/**
 * Updates an existing distributor.
 * @param {number|string} distributorId
 * @param {DistributorRequestDto} distributorData
 * @returns {Promise<DistributorResponseDto>}
 */
export const updateDistributor = async (distributorId, distributorData) => {
  return apiClient.put(
    API_ENDPOINTS_ADMIN.DISTRIBUTOR_UPDATE(distributorId),
    distributorData
  );
};

/**
 * Deletes a distributor.
 * @param {number|string} distributorId
 * @returns {Promise<null>}
 */
export const deleteDistributor = async (distributorId) => {
  return apiClient.delete(
    API_ENDPOINTS_ADMIN.DISTRIBUTOR_DELETE(distributorId)
  );
};
