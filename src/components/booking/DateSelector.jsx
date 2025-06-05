// src/components/booking/DateSelector.js
import React from "react";
import styled from "styled-components";
import { getNextDays } from "../../utils/dateUtils";

const DateSelectorWrapper = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

const DatesContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  overflow-x: auto;
  padding-bottom: ${({ theme }) =>
    theme.spacing[2]}; /* For scrollbar visibility */

  /* Custom scrollbar for dates */
  &::-webkit-scrollbar {
    height: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.colors.primary};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
  }
  &::-webkit-scrollbar-track {
    background-color: ${({ theme }) => theme.colors.surfaceLight};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
  }
`;

const DateButton = styled.button`
  flex: 0 0 auto; /* Prevent shrinking/growing */
  min-width: 70px;
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  text-align: center;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s, border-color 0.2s;
  border: 1px solid transparent;
  background-color: ${({ theme, isActive }) =>
    isActive ? theme.colors.primary : theme.colors.surfaceLight};
  color: ${({ theme, isActive }) =>
    isActive ? theme.colors.white : theme.colors.textDark};

  &:hover:not(:disabled) {
    background-color: ${({ theme, isActive }) =>
      isActive ? theme.colors.primaryHover : theme.colors.border};
    color: ${({ theme }) => theme.colors.white};
  }

  &:focus-visible {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primaryLight};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryLight}55;
  }
`;

const DayName = styled.span`
  display: block;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  margin-bottom: ${({ theme }) => theme.spacing[0.5]};
`;

const DayOfMonth = styled.span`
  display: block;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: bold;
`;

const DateSelector = ({ selectedDate, onDateSelect, numDaysToShow = 7 }) => {
  const availableDates = getNextDays(numDaysToShow);

  return (
    <DateSelectorWrapper>
      <SectionTitle>1. 날짜 선택</SectionTitle>
      <DatesContainer>
        {availableDates.map((date) => (
          <DateButton
            key={date.shortDate}
            onClick={() => onDateSelect(date.shortDate)}
            isActive={selectedDate === date.shortDate}
            aria-pressed={selectedDate === date.shortDate}
          >
            <DayName>{date.dayName}</DayName>
            <DayOfMonth>{date.dayOfMonth}</DayOfMonth>
          </DateButton>
        ))}
      </DatesContainer>
    </DateSelectorWrapper>
  );
};

export default DateSelector;
