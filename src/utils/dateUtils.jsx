// src/utils/dateUtils.js

/**
 * Generates an array of date objects for the next N days (Korean timezone).
 * @param {number} numDays - Number of days to generate.
 * @param {Date} [startDate] - The starting date. If not provided, uses Korean today.
 * @returns {Array<{shortDate: string, dayName: string, dayOfMonth: number, fullDate: Date}>}
 */
export const getNextDays = (numDays, startDate) => {
  const days = [];

  // 시작 날짜가 없으면 한국 시간 기준 오늘 날짜 사용
  let baseDate;
  if (startDate) {
    baseDate = new Date(startDate);
  } else {
    // 한국 시간대 기준 오늘 날짜
    const now = new Date();
    const koreanTime = new Date(now.getTime() + 9 * 60 * 60 * 1000); // UTC+9
    baseDate = new Date(
      koreanTime.getUTCFullYear(),
      koreanTime.getUTCMonth(),
      koreanTime.getUTCDate()
    );
  }

  for (let i = 0; i < numDays; i++) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + i);

    // 한국 시간대 기준으로 문자열 생성
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const shortDate = `${year}-${month}-${day}`;

    days.push({
      fullDate: date, // Store the full date object
      shortDate: shortDate, // YYYY-MM-DD
      dayName: date.toLocaleDateString("ko-KR", { weekday: "short" }),
      dayOfMonth: date.getDate(),
    });
  }
  return days;
};

/**
 * Formats a date string or Date object.
 * @param {string|Date} dateInput - The date to format.
 * @param {object} options - Intl.DateTimeFormat options.
 * @returns {string} Formatted date string.
 */
export const formatDate = (
  dateInput,
  options = { year: "numeric", month: "long", day: "numeric" }
) => {
  try {
    const date = new Date(dateInput);
    return date.toLocaleDateString("ko-KR", options);
  } catch (e) {
    return String(dateInput); // Return original if formatting fails
  }
};

/**
 * Formats a time string (HH:mm:ss or HH:mm) to HH:mm AM/PM or 24-hour HH:mm.
 * @param {string} timeString - e.g., "14:30:00" or "14:30"
 * @param {boolean} [use12Hour=false] - Whether to use 12-hour format with AM/PM.
 * @returns {string} Formatted time string.
 */
export const formatTime = (timeString, use12Hour = false) => {
  if (!timeString || typeof timeString !== "string") return "N/A";
  const parts = timeString.split(":");
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);

  if (isNaN(hours) || isNaN(minutes)) return "N/A";

  if (use12Hour) {
    const ampm = hours >= 12 ? "PM" : "AM";
    const h12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM/PM
    return `${h12}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  } else {
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  }
};

/**
 * Converts YYYY-MM-DD HH:mm:ss to YYYY-MM-DD
 * @param {string} dateTimeString
 * @returns {string} date string YYYY-MM-DD
 */
export const extractDate = (dateTimeString) => {
  if (!dateTimeString || typeof dateTimeString !== "string") return "";
  return dateTimeString.split(" ")[0];
};

/**
 * Converts YYYY-MM-DD HH:mm:ss to HH:mm
 * @param {string} dateTimeString
 * @returns {string} time string HH:mm
 */
export const extractTime = (dateTimeString) => {
  if (!dateTimeString || typeof dateTimeString !== "string") return "";
  const parts = dateTimeString.split(" ");
  if (parts.length < 2) return "";
  return parts[1].substring(0, 5); // HH:mm
};

/**
 * Get today's date in YYYY-MM-DD format (Korean timezone).
 * @returns {string}
 */
export const getTodayDateString = () => {
  // 한국 시간대(Asia/Seoul)에 맞춰 날짜 계산
  const now = new Date();
  const koreanTime = new Date(now.getTime() + 9 * 60 * 60 * 1000); // UTC+9

  // 한국 시간대 기준으로 날짜 계산
  const year = koreanTime.getUTCFullYear();
  const month = String(koreanTime.getUTCMonth() + 1).padStart(2, "0");
  const day = String(koreanTime.getUTCDate()).padStart(2, "0");

  // console.log("getTodayDateString - Korean time:", koreanTime.toISOString());
  // console.log("getTodayDateString - Result:", `${year}-${month}-${day}`);

  return `${year}-${month}-${day}`;
};

/**
 * Check if a movie is upcoming based on its release date.
 * @param {string} releaseDate - Release date in YYYY-MM-DD format
 * @returns {boolean} true if the movie is upcoming (release date is in the future)
 */
export const isUpcomingMovie = (releaseDate) => {
  if (!releaseDate) return false;

  const today = new Date();
  const release = new Date(releaseDate);

  // Reset time to 00:00:00 for accurate date comparison
  today.setHours(0, 0, 0, 0);
  release.setHours(0, 0, 0, 0);

  return release > today;
};

/**
 * Check if a movie is currently showing (release date is today or in the past).
 * @param {string} releaseDate - Release date in YYYY-MM-DD format
 * @returns {boolean} true if the movie is currently showing
 */
export const isCurrentlyShowing = (releaseDate) => {
  if (!releaseDate) return true; // If no release date, assume it's showing

  return !isUpcomingMovie(releaseDate);
};

/**
 * Separate movies into currently showing and upcoming based on release date.
 * @param {Array} movies - Array of movie objects with releaseDate property
 * @returns {Object} Object with currentlyShowing and upcoming arrays
 */
export const separateMoviesByStatus = (movies) => {
  if (!Array.isArray(movies)) return { currentlyShowing: [], upcoming: [] };

  const currentlyShowing = [];
  const upcoming = [];

  movies.forEach((movie) => {
    if (isUpcomingMovie(movie.releaseDate)) {
      upcoming.push(movie);
    } else {
      currentlyShowing.push(movie);
    }
  });

  return { currentlyShowing, upcoming };
};
