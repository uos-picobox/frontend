// src/components/booking/TicketCounter.js
import React from "react";
import styled from "styled-components";
import { PlusCircle, MinusCircle } from "lucide-react";
import { useData } from "../../contexts/DataContext"; // To get ticket types
import { TICKET_PRICES_FALLBACK } from "../../constants/config"; // Fallback if API fails

const CounterWrapper = styled.div`
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  padding: ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const SectionTitle = styled.h4`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

const TicketTypeRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing[3]} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const TicketInfo = styled.div`
  span:first-child {
    // Type name
    color: ${({ theme }) => theme.colors.text};
    text-transform: capitalize;
  }
  span:last-child {
    // Price
    font-size: ${({ theme }) => theme.fontSizes.xs};
    color: ${({ theme }) => theme.colors.textLighter};
    margin-left: ${({ theme }) => theme.spacing[2]};
  }
`;

const CountControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const ControlButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  color: ${({ theme }) => theme.colors.primaryLight};
  cursor: pointer;
  display: flex; /* for icon alignment */
  align-items: center; /* for icon alignment */

  &:disabled {
    color: ${({ theme }) => theme.colors.disabled};
    cursor: not-allowed;
  }
  &:hover:not(:disabled) {
    color: ${({ theme }) => theme.colors.primary};
  }
  svg {
    width: 24px;
    height: 24px;
  }
`;

const CountDisplay = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  min-width: 30px; /* Ensure space for 2 digits */
  text-align: center;
`;

const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  margin-top: ${({ theme }) => theme.spacing[2]};
`;

const WarningText = styled.p`
  color: ${({ theme }) => theme.colors.warning};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  margin-top: ${({ theme }) => theme.spacing[2]};
`;

/**
 * TicketCounter Component
 * @param {object} props
 * @param {object} props.ticketCounts - e.g., { ADULT: 0, TEEN: 0, CHILD: 0 } (keys should match ticketType.typeName or ID)
 * @param {function} props.onTicketCountChange - (typeIdentifier: string, delta: number) => void
 * @param {PriceSettingResponseDto[]} props.priceSettings - Price settings for the current room/screening.
 * @param {number} props.maxTotalTickets - Maximum total tickets allowed (e.g., 8)
 * @param {number} props.selectedSeatsCount - Number of currently selected seats
 */
const TicketCounter = ({
  ticketCounts,
  onTicketCountChange,
  priceSettings,
  maxTotalTickets = 8,
  selectedSeatsCount,
}) => {
  const { ticketTypes, isLoadingData, dataError } = useData(); // Get globally fetched ticket types

  // Create a combined list of ticket types with their prices for the current context
  const displayableTicketTypes = (ticketTypes || [])
    .map((tt) => {
      const setting = priceSettings?.find(
        (ps) => ps.ticketTypeId === tt.ticketTypeId
      );
      return {
        id: tt.ticketTypeId, // Use ID for internal mapping
        identifier: tt.typeName.toUpperCase(), // Use a consistent identifier like "ADULT"
        name: tt.typeName,
        description: tt.description,
        // Use price from settings if available, otherwise a fallback or indicate not available
        price: setting
          ? setting.price
          : TICKET_PRICES_FALLBACK[tt.typeName.toLowerCase()] || 0,
        isPriceAvailable: !!setting,
      };
    })
    .sort((a, b) => a.id - b.id); // Ensure consistent order (e.g., Adult, Teen, Child)

  const totalSelectedTickets = Object.values(ticketCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  if (isLoadingData) return <p>티켓 정보 로딩 중...</p>;
  if (dataError && (!ticketTypes || ticketTypes.length === 0))
    return (
      <ErrorText>티켓 종류를 불러오는데 실패했습니다: {dataError}</ErrorText>
    );
  if (!displayableTicketTypes.length)
    return <p>현재 예매 가능한 티켓 종류가 없습니다.</p>;

  return (
    <CounterWrapper>
      <SectionTitle>관람 인원 선택</SectionTitle>
      {displayableTicketTypes.map((type) => (
        <TicketTypeRow key={type.id}>
          <TicketInfo>
            <span>{type.name}</span>
            {type.isPriceAvailable ? (
              <span>({type.price.toLocaleString()}원)</span>
            ) : (
              <span>(가격 정보 없음)</span>
            )}
          </TicketInfo>
          <CountControls>
            <ControlButton
              onClick={() => onTicketCountChange(type.identifier, -1)}
              disabled={ticketCounts[type.identifier] === 0}
              aria-label={`${type.name} 한 명 줄이기`}
            >
              <MinusCircle />
            </ControlButton>
            <CountDisplay>{ticketCounts[type.identifier] || 0}</CountDisplay>
            <ControlButton
              onClick={() => onTicketCountChange(type.identifier, 1)}
              disabled={
                totalSelectedTickets >= maxTotalTickets ||
                !type.isPriceAvailable
              }
              aria-label={`${type.name} 한 명 늘리기`}
            >
              <PlusCircle />
            </ControlButton>
          </CountControls>
        </TicketTypeRow>
      ))}
      {totalSelectedTickets > maxTotalTickets && (
        <ErrorText>최대 {maxTotalTickets}명까지 선택 가능합니다.</ErrorText>
      )}
      {totalSelectedTickets > 0 &&
        selectedSeatsCount > totalSelectedTickets && (
          <ErrorText>
            선택한 인원({totalSelectedTickets}명)보다 많은 좌석(
            {selectedSeatsCount}석)을 선택했습니다. 좌석 선택을 조절해주세요.
          </ErrorText>
        )}
      {totalSelectedTickets > 0 &&
        selectedSeatsCount < totalSelectedTickets && (
          <WarningText>
            선택한 인원({totalSelectedTickets}명)보다 적은 좌석(
            {selectedSeatsCount}석)을 선택했습니다. 좌석을{" "}
            {totalSelectedTickets - selectedSeatsCount}개 더 선택해주세요.
          </WarningText>
        )}
    </CounterWrapper>
  );
};

export default TicketCounter;
