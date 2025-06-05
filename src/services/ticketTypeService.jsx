// src/services/ticketTypeService.js
import apiClient from "./apiClient";
import { API_ENDPOINTS_ADMIN, ensureArray } from "../constants/config"; // API_ENDPOINTS_ADMIN 사용

/**
 * Fetches all ticket types.
 * @returns {Promise<TicketTypeResponseDto[]>}
 */
export const getAllTicketTypes = async () => {
  // API: /api/admin/ticket-types/get GET
  const ticketTypesData = await apiClient.get(
    API_ENDPOINTS_ADMIN.TICKET_TYPES_GET_ALL
  );
  return ensureArray(ticketTypesData);
};

/**
 * Fetches a single ticket type by ID.
 * @param {number|string} ticketTypeId
 * @returns {Promise<TicketTypeResponseDto>}
 */
export const getTicketTypeById = async (ticketTypeId) => {
  // API: /api/admin/ticket-types/get/{ticketTypeId} GET
  return apiClient.get(API_ENDPOINTS_ADMIN.TICKET_TYPE_GET_BY_ID(ticketTypeId));
};

/**
 * Adds a new ticket type.
 * @param {TicketTypeRequestDto} ticketTypeData ({ typeName, description? })
 * @returns {Promise<TicketTypeResponseDto>}
 */
export const addTicketType = async (ticketTypeData) => {
  // API: /api/admin/ticket-types/create POST
  return apiClient.post(API_ENDPOINTS_ADMIN.TICKET_TYPE_CREATE, ticketTypeData);
};

/**
 * Updates an existing ticket type.
 * @param {number|string} ticketTypeId
 * @param {TicketTypeRequestDto} ticketTypeData ({ typeName, description? })
 * @returns {Promise<TicketTypeResponseDto>}
 */
export const updateTicketType = async (ticketTypeId, ticketTypeData) => {
  // API: /api/admin/ticket-types/update/{ticketTypeId} PUT
  return apiClient.put(
    API_ENDPOINTS_ADMIN.TICKET_TYPE_UPDATE(ticketTypeId),
    ticketTypeData
  );
};

/**
 * Deletes a ticket type.
 * @param {number|string} ticketTypeId
 * @returns {Promise<null>}
 */
export const deleteTicketType = async (ticketTypeId) => {
  // API: /api/admin/ticket-types/delete/{ticketTypeId} DELETE
  return apiClient.delete(API_ENDPOINTS_ADMIN.TICKET_TYPE_DELETE(ticketTypeId));
};
