// src/services/genreService.js
import apiClient from "./apiClient";
import { API_ENDPOINTS_ADMIN, ensureArray } from "../constants/config";

/**
 * Fetches all movie genres.
 * @returns {Promise<MovieGenreResponseDto[]>}
 */
export const getAllGenres = async () => {
  const genresData = await apiClient.get(
    API_ENDPOINTS_ADMIN.MOVIE_GENRES_GET_ALL
  );
  return ensureArray(genresData);
};

/**
 * Fetches a single genre by ID.
 * @param {number|string} genreId
 * @returns {Promise<MovieGenreResponseDto>}
 */
export const getGenreById = async (genreId) => {
  return apiClient.get(API_ENDPOINTS_ADMIN.MOVIE_GENRE_GET_BY_ID(genreId));
};

/**
 * Adds a new movie genre.
 * @param {MovieGenreRequestDto} genreData
 * @returns {Promise<MovieGenreResponseDto>}
 */
export const addGenre = async (genreData) => {
  return apiClient.post(API_ENDPOINTS_ADMIN.MOVIE_GENRE_CREATE, genreData);
};

/**
 * Updates an existing movie genre.
 * @param {number|string} genreId
 * @param {MovieGenreRequestDto} genreData
 * @returns {Promise<MovieGenreResponseDto>}
 */
export const updateGenre = async (genreId, genreData) => {
  return apiClient.put(
    API_ENDPOINTS_ADMIN.MOVIE_GENRE_UPDATE(genreId),
    genreData
  );
};

/**
 * Deletes a movie genre.
 * @param {number|string} genreId
 * @param {boolean} [force=false]
 * @returns {Promise<null>}
 */
export const deleteGenre = async (genreId, force = false) => {
  return apiClient.delete(
    API_ENDPOINTS_ADMIN.MOVIE_GENRE_DELETE(genreId, force)
  );
};
