// src/pages/BookingPage.js
import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import DateSelector from "../components/booking/DateSelector";
import TimeSelector from "../components/booking/TimeSelector";
import TicketCounter from "../components/booking/TicketCounter";
import SeatLayout from "../components/booking/SeatLayout";
import Button from "../components/common/Button";
import { ChevronLeft } from "lucide-react";

import * as movieService from "../services/movieService";
import * as screeningService from "../services/screeningService";
import * as roomService from "../services/roomService"; // For public room data
import * as priceService from "../services/priceService"; // For public price data
import { useData } from "../contexts/DataContext";
import useAuth from "../hooks/useAuth";
import { getTodayDateString, formatDate, formatTime } from "../utils/dateUtils";
import { generateSeatLayout as generateSeatMatrixUtil } from "../utils/seatUtils";
import {
  TICKET_PRICES_FALLBACK,
  MAX_SEATS_PER_BOOKING,
} from "../constants/config";
import {
  mockPublicScreeningRooms,
  mockPublicTicketTypes,
  mockPublicPriceSettings,
  generateMockSeatLayout,
} from "../constants/mockData"; // For detailed mock seat layout

const BookingPageWrapper = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  margin-top: ${({ theme }) => theme.spacing[6]};
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing[6]};
  }
  max-width: ${({ theme }) => theme.breakpoints.xl};
  margin-left: auto;
  margin-right: auto;
`;
const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  color: ${({ theme }) => theme.colors.primaryLight};
  margin-bottom: ${({ theme }) => theme.spacing[1]};
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.fontSizes["3xl"]};
  }
`;
const MovieTitleSmall = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.textLighter};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;
const StepContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing[6]};
`;
const StepHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;
const BackButton = styled(Button).attrs({ variant: "text", size: "sm" })`
  margin-right: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[1]};
  color: ${({ theme }) => theme.colors.primaryLight};
  svg {
    margin-right: ${({ theme }) => theme.spacing[1]};
  }
`;
const StepTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;
const InfoText = styled.p`
  color: ${({ theme }) => theme.colors.textLighter};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;
const SummarySection = styled.div`
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  padding: ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-top: ${({ theme }) => theme.spacing[6]};
  h4 {
    font-size: ${({ theme }) => theme.fontSizes.xl};
    color: ${({ theme }) => theme.colors.primaryLight};
    margin-bottom: ${({ theme }) => theme.spacing[3]};
  }
  p {
    color: ${({ theme }) => theme.colors.textDark};
    margin-bottom: ${({ theme }) => theme.spacing[2]};
    strong {
      color: ${({ theme }) => theme.colors.text};
    }
  }
`;
const TotalPriceDisplay = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding-top: ${({ theme }) => theme.spacing[3]};
  margin-top: ${({ theme }) => theme.spacing[3]};
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: bold;
  span:first-child {
    color: ${({ theme }) => theme.colors.text};
  }
  span:last-child {
    color: ${({ theme }) => theme.colors.primaryLight};
  }
`;
const LoadingErrorDisplay = styled.p`
  text-align: center;
  padding: ${({ theme }) => theme.spacing[4]};
  color: ${({ theme, $isError }) =>
    $isError ? theme.colors.error : theme.colors.textLighter};
`;

const BookingPage = () => {
  const { movieId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  // DataContext provides admin-fetched ticket types. For public, we use mockPublicTicketTypes.
  // const { ticketTypes: globalTicketTypesFromAdminContext, isLoadingData: isLoadingGlobalData } = useData();
  const [publicTicketTypes, setPublicTicketTypes] = useState(
    mockPublicTicketTypes
  ); // Use our mock for public

  const [movieDetails, setMovieDetails] = useState(
    location.state?.movie || null
  );
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [availableScreenings, setAvailableScreenings] = useState([]);
  const [selectedScreening, setSelectedScreening] = useState(null);

  const [priceSettingsForRoom, setPriceSettingsForRoom] = useState([]);
  const [ticketCounts, setTicketCounts] = useState({});

  const [seatMatrix, setSeatMatrix] = useState([]);
  const [bookedSeatsForScreening, setBookedSeatsForScreening] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [pageError, setPageError] = useState(null); // Renamed from error to avoid conflict

  useEffect(() => {
    if (!movieDetails && movieId) {
      setIsLoading(true);
      movieService
        .getPublicMovieById(movieId) // Use public mock service
        .then((data) => setMovieDetails(data))
        .catch((err) => {
          setPageError("영화 정보를 불러오는데 실패했습니다.");
          console.error(err);
        })
        .finally(() => setIsLoading(false));
    } else if (movieDetails && movieDetails.movieId?.toString() !== movieId) {
      setIsLoading(true);
      movieService
        .getPublicMovieById(movieId) // Use public mock service
        .then((data) => setMovieDetails(data))
        .catch((err) => {
          setPageError("영화 정보를 불러오는데 실패했습니다.");
          console.error(err);
        })
        .finally(() => setIsLoading(false));
    }
  }, [movieId, movieDetails]);

  useEffect(() => {
    if (publicTicketTypes && publicTicketTypes.length > 0) {
      const initialCounts = {};
      publicTicketTypes.forEach((tt) => {
        initialCounts[tt.typeName.toUpperCase().replace(" (MOCK)", "")] = 0; // Key from mock data
      });
      setTicketCounts(initialCounts);
    }
  }, [publicTicketTypes]);

  useEffect(() => {
    if (movieDetails && movieDetails.movieId && selectedDate) {
      const fetchScreenings = async () => {
        setIsLoading(true);
        setPageError(null);
        try {
          const data = await screeningService.getPublicScreeningsForMovieDate(
            movieDetails.movieId,
            selectedDate
          ); // Use public mock
          setAvailableScreenings(data || []);
          setSelectedScreening(null);
          setSeatMatrix([]);
          setSelectedSeats([]);
        } catch (err) {
          setPageError("상영 정보 로딩 실패: " + err.message);
          setAvailableScreenings([]);
        } finally {
          setIsLoading(false);
        }
      };
      fetchScreenings();
    }
  }, [movieDetails, selectedDate]);

  useEffect(() => {
    if (
      selectedScreening?.screeningRoom?.roomId &&
      selectedScreening?.screeningId
    ) {
      const fetchDetails = async () => {
        setIsLoading(true);
        setPageError(null);
        try {
          const roomData = await roomService.getPublicScreeningRoomById(
            selectedScreening.screeningRoom.roomId
          ); // Use public mock

          const mockBooked = []; // Simulate some booked seats for mock
          if (roomData?.seatLayout) {
            const allSeatIds = roomData.seatLayout.flatMap((rowDef) =>
              Array.from(
                { length: rowDef.numberOfSeats },
                (_, i) => `${rowDef.rowIdentifier}${i + 1}`
              )
            );
            const alreadyBookedCount = Math.floor(
              allSeatIds.length *
                (1 -
                  selectedScreening.availableSeats /
                    selectedScreening.totalSeats) *
                0.7
            ); // 70% of calculated booked
            for (
              let i = 0;
              i < alreadyBookedCount && allSeatIds.length > 0;
              i++
            ) {
              const randomIndex = Math.floor(Math.random() * allSeatIds.length);
              mockBooked.push(allSeatIds.splice(randomIndex, 1)[0]);
            }
          }
          setBookedSeatsForScreening(mockBooked);
          if (roomData && roomData.seatLayout) {
            setSeatMatrix(
              generateSeatMatrixUtil(roomData.seatLayout, mockBooked)
            );
          } else {
            setSeatMatrix([]);
          }

          const prices = await priceService.getPublicPriceSettingsByRoom(
            selectedScreening.screeningRoom.roomId
          ); // Use public mock
          setPriceSettingsForRoom(prices || []);
        } catch (err) {
          setPageError("좌석/가격 정보 로딩 실패: " + err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchDetails();
      setSelectedSeats([]);
    }
  }, [selectedScreening]);

  // Callbacks (handleDateSelect, handleScreeningSelect, handleTicketCountChange, handleSeatSelect) remain largely the same logic
  const handleDateSelect = useCallback((date) => setSelectedDate(date), []);
  const handleScreeningSelect = useCallback(
    (screening) => setSelectedScreening(screening),
    []
  );
  const handleTicketCountChange = useCallback(
    (typeIdentifier, delta) => {
      setTicketCounts((prev) => {
        const currentCount = prev[typeIdentifier] || 0;
        const newCount = Math.max(0, currentCount + delta);
        const updatedCounts = { ...prev, [typeIdentifier]: newCount };
        const totalTickets = Object.values(updatedCounts).reduce(
          (sum, count) => sum + count,
          0
        );
        if (totalTickets > MAX_SEATS_PER_BOOKING && delta > 0) {
          alert(`최대 ${MAX_SEATS_PER_BOOKING}매까지 예매 가능합니다.`);
          return prev;
        }
        if (delta < 0 && selectedSeats.length > totalTickets) {
          setSelectedSeats((currentSelectedSeats) =>
            currentSelectedSeats.slice(0, totalTickets)
          );
        }
        return updatedCounts;
      });
    },
    [selectedSeats.length]
  );

  const handleSeatSelect = useCallback(
    (seatId) => {
      const totalTickets = Object.values(ticketCounts).reduce(
        (sum, count) => sum + count,
        0
      );
      if (totalTickets === 0) {
        alert("먼저 관람 인원을 선택해주세요.");
        return;
      }
      setSelectedSeats((prev) =>
        prev.includes(seatId)
          ? prev.filter((s) => s !== seatId)
          : prev.length < totalTickets
          ? [...prev, seatId]
          : (alert(`선택한 인원(${totalTickets}명)만큼 좌석을 선택하셨습니다.`),
            prev)
      );
    },
    [ticketCounts]
  );

  const totalSelectedTickets = Object.values(ticketCounts).reduce(
    (sum, count) => sum + count,
    0
  );
  const totalPrice = Object.entries(ticketCounts).reduce(
    (sum, [typeIdentifier, count]) => {
      const ticketTypeInfo = publicTicketTypes?.find(
        (tt) =>
          tt.typeName.toUpperCase().replace(" (MOCK)", "") === typeIdentifier
      );
      if (ticketTypeInfo) {
        const priceSetting = priceSettingsForRoom.find(
          (ps) => ps.ticketTypeId === ticketTypeInfo.ticketTypeId
        );
        // Use TICKET_PRICES_FALLBACK if specific price setting not found for the mock ticket type
        const price = priceSetting
          ? priceSetting.price
          : TICKET_PRICES_FALLBACK[
              ticketTypeInfo.typeName.toLowerCase().replace(" (mock)", "")
            ] || 0;
        return sum + count * price;
      }
      return sum;
    },
    0
  );

  const proceedToNextStep = () => {
    /* Same as before */
    if (currentStep === 1 && selectedScreening) setCurrentStep(2);
    else if (
      currentStep === 2 &&
      totalSelectedTickets > 0 &&
      selectedSeats.length === totalSelectedTickets
    )
      setCurrentStep(3);
    else {
      if (currentStep === 1 && !selectedScreening)
        alert("상영 시간을 선택해주세요.");
      else if (currentStep === 2 && totalSelectedTickets === 0)
        alert("관람 인원을 선택해주세요.");
      else if (
        currentStep === 2 &&
        selectedSeats.length !== totalSelectedTickets
      )
        alert("선택한 인원 수만큼 좌석을 선택해주세요.");
    }
  };
  const goBackStep = () => currentStep > 1 && setCurrentStep(currentStep - 1);

  const handleFinalBooking = async () => {
    /* Same as before */
    if (!user) {
      alert("로그인이 필요합니다.");
      navigate("/login", { state: { from: location } });
      return;
    }
    alert(
      `최종 결제 금액: ${totalPrice.toLocaleString()}원\n${
        movieDetails.title
      } / ${selectedDate} ${
        selectedScreening
          ? formatTime(selectedScreening.screeningTime.substring(11, 16))
          : ""
      } / ${
        selectedScreening?.screeningRoom.roomName
      }\n좌석: ${selectedSeats.join(", ")}\n(실제 결제 로직 필요)`
    );
    // navigate('/profile'); // Or to a booking confirmation page
  };

  if (!movieDetails && isLoading)
    return (
      <BookingPageWrapper>
        <LoadingErrorDisplay>영화 정보 로딩 중...</LoadingErrorDisplay>
      </BookingPageWrapper>
    );
  if (!movieDetails && !isLoading)
    return (
      <BookingPageWrapper>
        <PageTitle>영화 정보 없음</PageTitle>
        <InfoText>
          예매할 영화 정보를 불러올 수 없습니다.{" "}
          <Button onClick={() => navigate("/")}>홈으로</Button>
        </InfoText>
      </BookingPageWrapper>
    );

  const renderStepContent = () => {
    /* ... (switch case for steps as before, but use pageError) ... */
    switch (currentStep) {
      case 1:
        return (
          <>
            <DateSelector
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
            />
            {isLoading && selectedDate && (
              <LoadingErrorDisplay>상영 시간표 로딩 중...</LoadingErrorDisplay>
            )}
            {pageError && selectedDate && (
              <LoadingErrorDisplay $isError>{pageError}</LoadingErrorDisplay>
            )}
            {selectedDate && !isLoading && !pageError && (
              <TimeSelector
                screenings={availableScreenings}
                selectedScreening={selectedScreening}
                onScreeningSelect={handleScreeningSelect}
              />
            )}
            {selectedScreening && (
              <Button
                onClick={proceedToNextStep}
                fullWidth
                disabled={isLoading || !publicTicketTypes?.length}
              >
                다음 (인원/좌석 선택)
              </Button>
            )}
          </>
        );
      case 2:
        return (
          <>
            <StepHeader>
              <BackButton onClick={goBackStep}>
                <ChevronLeft size={20} /> 날짜/시간
              </BackButton>
              <StepTitle>인원 / 좌석 선택</StepTitle>
            </StepHeader>
            <InfoText>
              {movieDetails.title} / {formatDate(selectedDate)} /{" "}
              {selectedScreening
                ? formatTime(selectedScreening.screeningTime.substring(11, 16))
                : ""}{" "}
              ({selectedScreening?.screeningRoom.roomName})
            </InfoText>
            {!publicTicketTypes?.length && (
              <LoadingErrorDisplay>티켓 정보 로딩 중...</LoadingErrorDisplay>
            )}
            {publicTicketTypes?.length > 0 && (
              <TicketCounter
                ticketCounts={ticketCounts}
                onTicketCountChange={handleTicketCountChange}
                priceSettings={priceSettingsForRoom} // These are now public mock price settings
                maxTotalTickets={MAX_SEATS_PER_BOOKING}
                selectedSeatsCount={selectedSeats.length}
                // Pass publicTicketTypes to TicketCounter if it needs to map them by ID/name
                // For simplicity, TicketCounter now relies on keys of ticketCounts object matching typeName.toUpperCase().
                // You might want to pass `publicTicketTypes` to `TicketCounter` for more robust mapping.
              />
            )}
            {isLoading && selectedScreening && (
              <LoadingErrorDisplay>좌석 정보 로딩 중...</LoadingErrorDisplay>
            )}
            {pageError && selectedScreening && (
              <LoadingErrorDisplay $isError>{pageError}</LoadingErrorDisplay>
            )}
            {!isLoading &&
              seatMatrix.length > 0 &&
              totalSelectedTickets > 0 && (
                <SeatLayout
                  seatMatrix={seatMatrix}
                  selectedSeats={selectedSeats}
                  onSeatSelect={handleSeatSelect}
                  totalTicketsSelected={totalSelectedTickets}
                  maxSeatsAllowedForSelection={totalSelectedTickets}
                />
              )}
            {totalSelectedTickets === 0 && (
              <InfoText>관람 인원을 먼저 선택해주세요.</InfoText>
            )}
            {totalSelectedTickets > 0 &&
              selectedSeats.length === totalSelectedTickets &&
              seatMatrix.length > 0 && (
                <Button
                  onClick={proceedToNextStep}
                  fullWidth
                  disabled={isLoading || !publicTicketTypes?.length}
                >
                  다음 (최종 확인)
                </Button>
              )}
          </>
        );
      case 3:
        return (
          <>
            <StepHeader>
              <BackButton onClick={goBackStep}>
                <ChevronLeft size={20} /> 좌석 선택
              </BackButton>
              <StepTitle>최종 확인 및 결제</StepTitle>
            </StepHeader>
            <SummarySection>
              <h4>예매 정보 확인</h4>
              <p>
                <strong>영화:</strong> {movieDetails.title}
              </p>
              <p>
                <strong>상영관:</strong>{" "}
                {selectedScreening?.screeningRoom.roomName}
              </p>
              <p>
                <strong>날짜:</strong> {formatDate(selectedDate)}
              </p>
              <p>
                <strong>시간:</strong>{" "}
                {selectedScreening
                  ? formatTime(
                      selectedScreening.screeningTime.substring(11, 16)
                    )
                  : ""}
              </p>
              <p>
                <strong>인원:</strong>
                {publicTicketTypes
                  ?.map((tt) =>
                    ticketCounts[
                      tt.typeName.toUpperCase().replace(" (MOCK)", "")
                    ] > 0
                      ? ` ${tt.typeName} ${
                          ticketCounts[
                            tt.typeName.toUpperCase().replace(" (MOCK)", "")
                          ]
                        }명`
                      : ""
                  )
                  .join(", ")
                  .trim() || "선택 안함"}
              </p>
              <p>
                <strong>선택 좌석:</strong> {selectedSeats.join(", ")}
              </p>
              <TotalPriceDisplay>
                <span>총 결제 금액:</span>
                <span>{totalPrice.toLocaleString()}원</span>
              </TotalPriceDisplay>
            </SummarySection>
            <SummarySection style={{ marginTop: "1rem" }}>
              <h4>결제 수단</h4>
              <InfoText>실제 결제 모듈(PG 연동)이 여기에 연결됩니다.</InfoText>
            </SummarySection>
            <Button
              onClick={handleFinalBooking}
              variant="primary"
              size="lg"
              fullWidth
              style={{ marginTop: "2rem" }}
            >
              {totalPrice.toLocaleString()}원 결제하기
            </Button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <BookingPageWrapper>
      <PageTitle>예매하기</PageTitle>
      <MovieTitleSmall>
        {movieDetails?.title || "영화 선택 중..."}
      </MovieTitleSmall>
      <StepContainer>{renderStepContent()}</StepContainer>
    </BookingPageWrapper>
  );
};

export default BookingPage;
