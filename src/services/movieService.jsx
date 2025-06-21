// src/services/movieService.js
import apiClient from "./apiClient";
import {
  API_ENDPOINTS_ADMIN,
  API_ENDPOINTS_USER,
  ensureArray,
} from "../constants/config";
import { mockPublicMovies } from "../constants/mockData";

// --- Public/User Facing (Using Real API) ---
export const getPublicAllMovies = async () => {
  console.log("movieService: getPublicAllMovies called (using real API)");
  try {
    const moviesData = await apiClient.get(API_ENDPOINTS_USER.MOVIES_GET_ALL);
    return ensureArray(moviesData);
  } catch (error) {
    console.error("movieService: getPublicAllMovies error:", error);
    // Fallback to mock data if API fails
    console.log("Falling back to mock data");
    return JSON.parse(JSON.stringify(mockPublicMovies));
  }
};

export const getPublicMovieById = async (movieId) => {
  console.log(
    `movieService: getPublicMovieById called for ID ${movieId} (using real API)`
  );
  try {
    const movieData = await apiClient.get(
      API_ENDPOINTS_USER.MOVIE_GET_BY_ID(movieId)
    );
    return movieData;
  } catch (error) {
    console.error(
      `movieService: getPublicMovieById error for ID ${movieId}:`,
      error
    );
    // Fallback to mock data if API fails
    console.log("Falling back to mock data");
    const movie = mockPublicMovies.find(
      (m) => m.movieId.toString() === movieId.toString()
    );
    return movie ? JSON.parse(JSON.stringify(movie)) : null;
  }
};

// --- Admin Specific (Using Live API) ---
export const getAllMovies = async () => {
  // This is Admin's getAllMovies
  const moviesData = await apiClient.get(API_ENDPOINTS_ADMIN.MOVIES_GET_ALL);
  return ensureArray(moviesData);
};
export const getMovieById_Admin = async (movieId) => {
  return apiClient.get(API_ENDPOINTS_ADMIN.MOVIE_GET_BY_ID(movieId));
};
export const addMovie = async (movieData) => {
  return apiClient.post(API_ENDPOINTS_ADMIN.MOVIE_CREATE, movieData);
};
export const addMovieWithImage = async (formData) => {
  return apiClient.post(
    API_ENDPOINTS_ADMIN.MOVIE_CREATE_WITH_IMAGE,
    formData,
    true
  );
};
export const updateMovie = async (movieId, movieData) => {
  return apiClient.put(API_ENDPOINTS_ADMIN.MOVIE_UPDATE(movieId), movieData);
};
export const updateMovieWithImage = async (movieId, formData) => {
  return apiClient.put(
    API_ENDPOINTS_ADMIN.MOVIE_UPDATE_WITH_IMAGE(movieId),
    formData,
    true
  );
};
export const setMoviePoster = async (movieId, imageFile) => {
  const formData = new FormData();
  if (imageFile) {
    formData.append("posterImage", imageFile);
  }
  return apiClient.put(
    API_ENDPOINTS_ADMIN.MOVIE_UPDATE_POSTER(movieId),
    formData,
    true
  );
};
export const deleteMovie = async (movieId) => {
  return apiClient.delete(API_ENDPOINTS_ADMIN.MOVIE_DELETE(movieId));
};
