// src/utils/seatUtils.js

/**
 * Generates a seat layout based on row definitions.
 * @param {Array<{rowIdentifier: string, numberOfSeats: number}>} rowDefinitions - From ScreeningRoomResponseDto.seatLayout or ScreeningRoomRequestDto.rowDefinitions.
 * @param {Array<string>} [bookedSeats=[]] - Array of booked seat IDs (e.g., ["A1", "C5"]).
 * @param {Array<string>} [reservedSeats=[]] - Array of temporarily reserved seat IDs (e.g., by other users in real-time).
 * @returns {Array<Array<{id: string, status: 'available'|'booked'|'reserved', row: string, number: number}>>}
 */
export const generateSeatLayout = (
  rowDefinitions,
  bookedSeats = [],
  reservedSeats = []
) => {
  const layout = [];
  if (!rowDefinitions || !Array.isArray(rowDefinitions)) {
    console.warn(
      "generateSeatLayout: rowDefinitions is invalid. Returning empty layout."
    );
    return [];
  }

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"; // Fallback if rowIdentifier is missing

  rowDefinitions.forEach((def, rowIndex) => {
    const rowId = def.rowIdentifier || alphabet[rowIndex];
    if (!def.numberOfSeats || def.numberOfSeats <= 0) {
      console.warn(
        `generateSeatLayout: Invalid numberOfSeats for row ${rowId}. Skipping row.`
      );
      return;
    }
    const row = [];
    for (let j = 0; j < def.numberOfSeats; j++) {
      const seatNumber = j + 1;
      const seatId = `${rowId}${seatNumber}`;
      let status = "available";
      if (bookedSeats.includes(seatId)) {
        status = "booked";
      } else if (reservedSeats.includes(seatId)) {
        status = "reserved"; // Could be 'blocked' or 'temp-unavailable'
      }
      row.push({
        id: seatId,
        status: status,
        row: rowId,
        number: seatNumber,
      });
    }
    layout.push(row);
  });
  return layout;
};

/**
 * Calculates the total capacity from row definitions.
 * @param {Array<{rowIdentifier: string, numberOfSeats: number}>} rowDefinitions
 * @returns {number} Total capacity.
 */
export const calculateCapacity = (rowDefinitions) => {
  if (!rowDefinitions || !Array.isArray(rowDefinitions)) return 0;
  return rowDefinitions.reduce(
    (total, row) => total + (row.numberOfSeats || 0),
    0
  );
};
