// src/components/booking/Seat.js
import React from "react";
import styled, { css } from "styled-components";

const SeatButton = styled.button`
  width: 32px; /* md:w-8 */
  height: 32px; /* md:h-8 */
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s, color 0.2s, opacity 0.2s;
  border: 1px solid transparent; /* Base border */

  /* Default: Available */
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  color: ${({ theme }) => theme.colors.textLighter};
  border-color: ${({ theme }) => theme.colors.border};

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.primaryLight};
    background-color: ${({ theme }) =>
      theme.colors.border}; /* Darken surfaceLight */
  }

  ${({ status, theme }) => {
    switch (status) {
      case "selected":
        return css`
          background-color: ${theme.colors.primary};
          color: ${theme.colors.white};
          border-color: ${theme.colors.primaryHover};
          &:hover:not(:disabled) {
            background-color: ${theme.colors.primaryHover};
          }
        `;
      case "booked":
        return css`
          background-color: ${theme.colors.error};
          color: ${theme.colors.white + "99"};
          border-color: ${theme.colors.error};
          cursor: not-allowed;
          opacity: 0.8;
        `;
      case "reserved": // e.g. held by someone else, not selectable
        return css`
          background-color: ${theme.colors.warning + "AA"};
          color: ${theme.colors.surfaceDarker};
          border-color: ${theme.colors.warning};
          cursor: not-allowed;
          opacity: 0.8;
        `;
      case "unavailable": // General disabled state other than booked
        return css`
          background-color: ${theme.colors.disabled};
          color: ${theme.colors.disabledText};
          border-color: ${theme.colors.disabled};
          cursor: not-allowed;
          opacity: 0.6;
        `;
      default: // available
        return css`
          &:focus-visible {
            outline: none;
            border-color: ${theme.colors.primaryLight};
            box-shadow: 0 0 0 2px ${theme.colors.primaryLight}77;
          }
        `;
    }
  }}

  /* For seat numbers, if you want to show them */
  /* span {
    display: none; // Hide by default, show on hover or if needed
  } */

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    width: 28px;
    height: 28px;
    font-size: 0.6rem;
  }
`;

/**
 * Seat Component
 * @param {object} props
 * @param {{id: string, status: 'available'|'selected'|'booked'|'reserved'|'unavailable', row?: string, number?: number}} props.seatData - Data for the seat
 * @param {function} props.onSelect - (seatId: string) => void
 * @param {boolean} props.isDisabled - Whether the seat is generally disabled for selection (e.g., max seats reached)
 */
const Seat = ({ seatData, onSelect, isDisabled }) => {
  const { id, status, row, number } = seatData;

  const handleClick = () => {
    if (
      status !== "booked" &&
      status !== "reserved" &&
      status !== "unavailable" &&
      !isDisabled
    ) {
      onSelect(id);
    }
  };

  // Determine the effective status for styling if isDisabled is true
  let displayStatus = status;
  if (isDisabled && status === "available") {
    displayStatus = "unavailable";
  }

  return (
    <SeatButton
      onClick={handleClick}
      status={displayStatus}
      disabled={
        status === "booked" ||
        status === "reserved" ||
        status === "unavailable" ||
        isDisabled
      }
      aria-label={`Seat ${id}, Status: ${displayStatus}`}
      title={`Seat ${id} (${displayStatus})`}
    >
      {/* {number} You can display seat number if needed */}
    </SeatButton>
  );
};

export default Seat;
