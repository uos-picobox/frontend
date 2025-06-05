// src/components/booking/SeatLayout.js
import React from "react";
import styled from "styled-components";
import Seat from "./Seat";
// generateSeatLayout from utils can be used if API doesn't provide full seat status list
// import { generateSeatLayout as generateLayoutUtil } from '../../utils/seatUtils';

const LayoutWrapper = styled.div`
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  padding: ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const ScreenIndicator = styled.div`
  width: 80%;
  max-width: 400px;
  margin: 0 auto ${({ theme }) => theme.spacing[6]} auto;
  padding: ${({ theme }) => theme.spacing[2]} 0;
  background-color: ${({ theme }) =>
    theme.colors.disabled}; /* Or a specific screen color */
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
  font-weight: 500;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm}
    ${({ theme }) => theme.borderRadius.sm} 0 0;
  letter-spacing: 2px;
  box-shadow: 0px -2px 5px rgba(0, 0, 0, 0.1) inset;
`;

const SeatGrid = styled.div`
  display: grid;
  justify-content: center; /* Centers the grid if it's narrower than container */
  gap: ${({ theme }) => theme.spacing[1.5]}; /* Gap between seats */
  margin-bottom: ${({ theme }) => theme.spacing[4]};

  /* Columns are set dynamically based on the longest row */
  ${({ cols }) => cols && `grid-template-columns: repeat(${cols}, auto);`}
`;

const SeatRow = styled.div`
  display: contents; /* Allows Seat components to be direct children of the grid for layout */
`;

const RowLabel = styled.div`
  grid-column: 1 / 2; /* Assuming first column for labels, adjust if layout is different */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textLighter};
  padding-right: ${({ theme }) => theme.spacing[2]};
`;

const Legend = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[4]};
  margin-top: ${({ theme }) => theme.spacing[4]};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textLighter};
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1.5]};
`;

const LegendColorBox = styled.span`
  width: 16px;
  height: 16px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background-color: ${({ color }) => color};
  border: 1px solid
    ${({ theme, color }) =>
      color === theme.colors.surfaceLight
        ? theme.colors.border
        : "transparent"};
`;

/**
 * SeatLayout Component
 * @param {object} props
 * @param {Array<Array<{id: string, status: string}>>} props.seatMatrix - 2D array of seat objects.
 * Each seat object: { id: 'A1', status: 'available' | 'booked' | 'selected' | 'reserved' | 'unavailable' }
 * @param {string[]} props.selectedSeats - Array of selected seat IDs.
 * @param {function} props.onSeatSelect - (seatId: string) => void.
 * @param {number} props.totalTicketsSelected - Total number of tickets chosen by user.
 * @param {number} props.maxSeatsAllowedForSelection - Max seats user can select based on totalTicketsSelected.
 */
const SeatLayout = ({
  seatMatrix,
  selectedSeats,
  onSeatSelect,
  totalTicketsSelected,
  maxSeatsAllowedForSelection,
}) => {
  if (!seatMatrix || seatMatrix.length === 0) {
    return (
      <LayoutWrapper>
        <p>좌석 정보를 불러올 수 없습니다.</p>
      </LayoutWrapper>
    );
  }

  const maxCols = seatMatrix.reduce((max, row) => Math.max(max, row.length), 0);

  return (
    <LayoutWrapper>
      <ScreenIndicator>SCREEN</ScreenIndicator>
      <SeatGrid cols={maxCols}>
        {seatMatrix.map((row, rowIndex) => (
          // <SeatRow key={`row-${rowIndex}`}> {/* If not using display: contents */}
          // Using React.Fragment for display: contents compatibility
          <React.Fragment key={`row-${rowIndex}`}>
            {/* Optional: Row Label <RowLabel>{String.fromCharCode(65 + rowIndex)}</RowLabel> */}
            {row.map((seat) => (
              <Seat
                key={seat.id}
                seatData={{
                  ...seat,
                  status: selectedSeats.includes(seat.id)
                    ? "selected"
                    : seat.status,
                }}
                onSelect={onSeatSelect}
                // Disable seat if it's not 'available', or if max tickets selected and this seat is not already selected
                isDisabled={
                  seat.status !== "available" ||
                  (selectedSeats.length >= maxSeatsAllowedForSelection &&
                    !selectedSeats.includes(seat.id))
                }
              />
            ))}
          </React.Fragment>
        ))}
      </SeatGrid>
      <Legend>
        <LegendItem>
          <LegendColorBox color={({ theme }) => theme.colors.surfaceLight} />{" "}
          선택 가능
        </LegendItem>
        <LegendItem>
          <LegendColorBox color={({ theme }) => theme.colors.primary} /> 선택
          좌석
        </LegendItem>
        <LegendItem>
          <LegendColorBox color={({ theme }) => theme.colors.error} /> 예매 완료
        </LegendItem>
        <LegendItem>
          <LegendColorBox color={({ theme }) => theme.colors.warning + "AA"} />{" "}
          예약 중
        </LegendItem>
        <LegendItem>
          <LegendColorBox color={({ theme }) => theme.colors.disabled} /> 선택
          불가
        </LegendItem>
      </Legend>
    </LayoutWrapper>
  );
};

export default SeatLayout;
