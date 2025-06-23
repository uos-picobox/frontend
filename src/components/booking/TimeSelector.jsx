// src/components/booking/TimeSelector.js
import React from "react";
import styled from "styled-components";
import { formatTime } from "../../utils/dateUtils"; // Assuming extractTime from ScreeningResponseDto.screeningTime

const TimeSelectorWrapper = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

const TimesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: ${({ theme }) => theme.spacing[3]};

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
`;

const TimeButton = styled.button`
  padding: ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s, border-color 0.2s,
    box-shadow 0.2s;
  border: 1px solid
    ${({ theme, isActive }) =>
      isActive ? theme.colors.primaryLight : theme.colors.border};
  background-color: ${({ theme, isActive }) =>
    isActive ? theme.colors.primary : theme.colors.surfaceLight};
  color: ${({ theme, isActive }) =>
    isActive ? theme.colors.white : theme.colors.textDark};

  &:hover:not(:disabled) {
    background-color: ${({ theme, isActive }) =>
      isActive ? theme.colors.primaryHover : theme.colors.border};
    border-color: ${({ theme, isActive }) =>
      isActive ? theme.colors.primary : theme.colors.primaryLight};
    color: ${({ theme, isActive }) =>
      isActive ? theme.colors.white : theme.colors.text};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.disabled + "55"};
    color: ${({ theme }) => theme.colors.disabledText};
    border-color: ${({ theme }) => theme.colors.disabled};
    cursor: not-allowed;
    p {
      color: ${({ theme }) => theme.colors.disabledText};
    }
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryLight}77;
  }
`;

const TimeText = styled.p`
  font-weight: bold;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  margin: 0 0 ${({ theme }) => theme.spacing[1]} 0;
  color: inherit; /* Inherit color from parent button */
`;

const RoomText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  margin: 0 0 ${({ theme }) => theme.spacing[1]} 0;
  color: inherit;
`;

const SeatsText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  margin: 0;
  color: ${({ theme, isActive }) =>
    isActive ? theme.colors.white : theme.colors.primaryLight};
`;

const NoScreeningsText = styled.p`
  color: ${({ theme }) => theme.colors.textLighter};
`;

/**
 * TimeSelector Component
 * @param {object} props
 * @param {ScreeningResponseDto[]} props.screenings - Array of screenings for the selected date.
 * @param {ScreeningResponseDto | null} props.selectedScreening - The currently selected screening.
 * @param {function} props.onScreeningSelect - Function to call when a screening is selected.
 */
const TimeSelector = ({ screenings, selectedScreening, onScreeningSelect }) => {
  if (!screenings) {
    return (
      <TimeSelectorWrapper>
        <SectionTitle>2. 시간 선택</SectionTitle>
        <NoScreeningsText>날짜를 먼저 선택해주세요.</NoScreeningsText>
      </TimeSelectorWrapper>
    );
  }

  return (
    <TimeSelectorWrapper>
      <SectionTitle>2. 시간 선택</SectionTitle>
      {screenings.length > 0 ? (
        <TimesGrid>
          {screenings.map((screening) => (
            <TimeButton
              key={screening.screeningId}
              onClick={() => onScreeningSelect(screening)}
              isActive={
                selectedScreening?.screeningId === screening.screeningId
              }
              disabled={
                (screening.availableSeatsCount ||
                  screening.availableSeats ||
                  0) <= 0
              } // Disable if no seats available
              title={
                (screening.availableSeatsCount ||
                  screening.availableSeats ||
                  0) <= 0
                  ? "매진"
                  : `${
                      screening.availableSeatsCount || screening.availableSeats
                    }석 남음`
              }
            >
              <TimeText>
                {screening.screeningStartTime
                  ? formatTime(screening.screeningStartTime)
                  : screening.screeningTime
                  ? screening.screeningTime.includes("T")
                    ? formatTime(screening.screeningTime.substring(11, 16))
                    : formatTime(screening.screeningTime)
                  : "시간 미정"}
              </TimeText>
              <RoomText>
                {screening.roomName ||
                  screening.screeningRoom?.roomName ||
                  "상영관 미정"}
              </RoomText>
              <SeatsText
                isActive={
                  selectedScreening?.screeningId === screening.screeningId
                }
              >
                {(screening.availableSeatsCount || screening.availableSeats) > 0
                  ? `${
                      screening.availableSeatsCount || screening.availableSeats
                    }석 남음`
                  : "매진"}
              </SeatsText>
            </TimeButton>
          ))}
        </TimesGrid>
      ) : (
        <NoScreeningsText>
          선택하신 날짜에 상영 정보가 없습니다.
        </NoScreeningsText>
      )}
    </TimeSelectorWrapper>
  );
};

export default TimeSelector;
