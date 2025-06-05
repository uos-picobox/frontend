// src/utils/dateUtils.js

/**
 * Generates an array of date objects for the next N days.
 * @param {number} numDays - Number of days to generate.
 * @param {Date} [startDate=new Date()] - The starting date.
 * @returns {Array<{shortDate: string, dayName: string, dayOfMonth: number, fullDate: Date}>}
 */
export const getNextDays = (numDays, startDate = new Date()) => {
  const days = [];
  for (let i = 0; i < numDays; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    days.push({
      fullDate: date, // Store the full date object
      shortDate: date.toISOString().split("T")[0], // YYYY-MM-DD
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
 * Get today's date in YYYY-MM-DD format.
 * @returns {string}
 */
export const getTodayDateString = () => {
  return new Date().toISOString().split("T")[0];
};
