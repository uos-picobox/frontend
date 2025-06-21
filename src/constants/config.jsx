// src/constants/config.js

export const API_BASE_URL = "";

// --- Admin API Endpoints ---
// (이전에 제공된 API_ENDPOINTS.ADMIN_... 형태의 엔드포인트들은 여기에 그대로 유지됩니다)
export const API_ENDPOINTS_ADMIN = {
  MOVIE_GENRES_GET_ALL: `/api/admin/movie-genres/get`,
  MOVIE_GENRE_GET_BY_ID: (genreId) => `/api/admin/movie-genres/get/${genreId}`,
  MOVIE_GENRE_CREATE: `/api/admin/movie-genres/create`,
  MOVIE_GENRE_UPDATE: (genreId) => `/api/admin/movie-genres/update/${genreId}`,
  MOVIE_GENRE_DELETE: (genreId, force = false) =>
    `/api/admin/movie-genres/delete/${genreId}?force=${force}`,

  ACTORS_GET_ALL: `/api/admin/actors/get`,
  ACTOR_GET_BY_ID: (actorId) => `/api/admin/actors/get/${actorId}`,
  ACTOR_CREATE: `/api/admin/actors`,
  ACTOR_CREATE_WITH_IMAGE: `/api/admin/actors/create-with-image`,
  ACTOR_UPDATE: (actorId) => `/api/admin/actors/${actorId}`,
  ACTOR_UPDATE_WITH_IMAGE: (actorId) =>
    `/api/admin/actors/${actorId}/update-with-image`,
  ACTOR_UPDATE_PROFILE_IMAGE: (actorId) =>
    `/api/admin/actors/${actorId}/profile-image`,
  ACTOR_DELETE: (actorId, force = false) =>
    `/api/admin/actors/delete/${actorId}?force=${force}`,

  DISTRIBUTORS_GET_ALL: `/api/admin/distributors/get`,
  DISTRIBUTOR_GET_BY_ID: (distributorId) =>
    `/api/admin/distributors/get/${distributorId}`,
  DISTRIBUTOR_CREATE: `/api/admin/distributors/create`,
  DISTRIBUTOR_UPDATE: (distributorId) =>
    `/api/admin/distributors/update/${distributorId}`,
  DISTRIBUTOR_DELETE: (distributorId) =>
    `/api/admin/distributors/delete/${distributorId}`,

  MOVIE_RATINGS_GET_ALL: `/api/admin/movie-ratings/get`,
  MOVIE_RATING_GET_BY_ID: (ratingId) =>
    `/api/admin/movie-ratings/get/${ratingId}`,
  MOVIE_RATING_CREATE: `/api/admin/movie-ratings/create`,
  MOVIE_RATING_UPDATE: (ratingId) =>
    `/api/admin/movie-ratings/update/${ratingId}`,
  MOVIE_RATING_DELETE: (ratingId) =>
    `/api/admin/movie-ratings/delete/${ratingId}`,

  MOVIES_GET_ALL: `/api/admin/movies/get`,
  MOVIE_GET_BY_ID: (movieId) => `/api/admin/movies/get/${movieId}`,
  MOVIE_CREATE: `/api/admin/movies/`,
  MOVIE_CREATE_WITH_IMAGE: `/api/admin/movies/create-with-image`,
  MOVIE_UPDATE: (movieId) => `/api/admin/movies/${movieId}`,
  MOVIE_UPDATE_WITH_IMAGE: (movieId) =>
    `/api/admin/movies/${movieId}/update-with-image`,
  MOVIE_UPDATE_POSTER: (movieId) => `/api/admin/movies/${movieId}/poster`,
  MOVIE_DELETE: (movieId) => `/api/admin/movies/delete/${movieId}`,

  ROOMS_GET_ALL: `/api/admin/screening-rooms/get`,
  ROOM_GET_BY_ID: (roomId) => `/api/admin/screening-rooms/get/${roomId}`,
  ROOM_CREATE: `/api/admin/screening-rooms/create`,
  ROOM_UPDATE: (roomId) => `/api/admin/screening-rooms/update/${roomId}`,
  ROOM_DELETE: (roomId) => `/api/admin/screening-rooms/delete/${roomId}`,

  SCREENINGS_GET_ALL: `/api/admin/screenings/get`,
  SCREENING_GET_BY_ID: (screeningId) =>
    `/api/admin/screenings/get/${screeningId}`,
  SCREENING_CREATE: `/api/admin/screenings/create`,
  SCREENING_UPDATE: (screeningId) =>
    `/api/admin/screenings/update/${screeningId}`,
  SCREENING_DELETE: (screeningId) =>
    `/api/admin/screenings/delete/${screeningId}`,

  TICKET_TYPES_GET_ALL: `/api/admin/ticket-types/get`,
  TICKET_TYPE_GET_BY_ID: (ticketTypeId) =>
    `/api/admin/ticket-types/get/${ticketTypeId}`,
  TICKET_TYPE_CREATE: `/api/admin/ticket-types/create`,
  TICKET_TYPE_UPDATE: (ticketTypeId) =>
    `/api/admin/ticket-types/update/${ticketTypeId}`,
  TICKET_TYPE_DELETE: (ticketTypeId) =>
    `/api/admin/ticket-types/delete/${ticketTypeId}`,

  PRICE_SETTING_GET_SPECIFIC: (roomId, ticketTypeId) =>
    `/api/admin/price-settings/get?roomId=${roomId}&ticketTypeId=${ticketTypeId}`,
  PRICE_SETTINGS_GET_BY_ROOM: (roomId) =>
    `/api/admin/price-settings/room/${roomId}`,
  PRICE_SETTING_SET: `/api/admin/price-settings/set`,
  PRICE_SETTING_DELETE: (roomId, ticketTypeId) =>
    `/api/admin/price-settings/delete?roomId=${roomId}&ticketTypeId=${ticketTypeId}`,
};

export const API_ENDPOINTS_USER = {
  // Public Movie & Screening APIs
  MOVIES_GET_ALL: `/api/movies`,
  MOVIE_GET_BY_ID: (movieId) => `/api/movies/${movieId}`,
  SCREENINGS_GET_ALL: `/api/screenings`,
  SCREENINGS_FOR_MOVIE_DATE: (movieId, date) =>
    `/api/movies/${movieId}/screenings?date=${date}`,

  // Signup & Auth related
  SIGNUP: `/api/user/signup`,
  SIGNUP_CHECK_LOGINID: (loginId) =>
    `/api/user/signup/check/loginid?loginId=${loginId}`,
  SIGNUP_CHECK_EMAIL: (email) => `/api/user/signup/check/email?email=${email}`,
  SIGNUP_REQUEST_EMAIL_VERIFICATION: `/api/user/signup/verify/email`,
  SIGNUP_AUTH_EMAIL_CODE: `/api/user/signup/auth/email`,
  LOGIN: `/api/user/signin`, // Updated to new signin endpoint
  LOGOUT: `/api/user/signout`, // New signout endpoint
};

// --- UI Constants & Fallbacks ---
export const TICKET_PRICES_FALLBACK = {
  adult: 15000,
  teen: 12000,
  child: 9000,
  // DTO에 따라 'ADULT', 'TEEN', 'CHILD'와 같은 식별자를 사용할 수 있습니다.
  // TicketCounter 컴포넌트에서 API의 TicketTypeResponseDto.typeName을 기반으로 매칭합니다.
};

export const MAX_SEATS_PER_BOOKING = 8;

export const PLACEHOLDER_POSTER_URL = (
  width = 300,
  height = 450,
  text = "이미지 오류"
) =>
  `https://placehold.co/${width}x${height}/1f2937/ffffff?text=${encodeURIComponent(
    text
  )}`;

export const PLACEHOLDER_PROFILE_URL = (size = 100, text = "프로필 없음") =>
  `https://placehold.co/${size}x${size}/374151/e5e7eb?text=${encodeURIComponent(
    text
  )}`;

// --- Utility Functions ---
export const ensureArray = (data) => {
  if (!data) return [];
  return Array.isArray(data) ? data : [data];
};
