// src/pages/BookingPage.js
import React, { useState, useEffect, useCallback, useRef } from "react";
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
import * as reservationService from "../services/reservationService";
import { useData } from "../contexts/DataContext";
import useAuth from "../hooks/useAuth";
import { getTodayDateString, formatDate, formatTime } from "../utils/dateUtils";
import {
  TICKET_PRICES_FALLBACK,
  MAX_SEATS_PER_BOOKING,
} from "../constants/config";

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
  const { ticketTypes: globalTicketTypes } = useData();

  // Seat hold timeout ref
  const seatHoldTimeoutRef = useRef(null);
  const heldSeatsRef = useRef([]);

  const [movieDetails, setMovieDetails] = useState(
    location.state?.movie || null
  );
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [availableScreenings, setAvailableScreenings] = useState([]);
  const [selectedScreening, setSelectedScreening] = useState(null);
  const [screeningSeatsData, setScreeningSeatsData] = useState(null);

  const [ticketCounts, setTicketCounts] = useState({});
  const [selectedSeats, setSelectedSeats] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [pageError, setPageError] = useState(null);

  // Load movie details if not provided
  useEffect(() => {
    if (!movieDetails && movieId) {
      setIsLoading(true);
      movieService
        .getPublicMovieById(movieId)
        .then((data) => setMovieDetails(data))
        .catch((err) => {
          setPageError("영화 정보를 불러오는데 실패했습니다.");
          console.error(err);
        })
        .finally(() => setIsLoading(false));
    }
  }, [movieId, movieDetails]);

  // Initialize ticket counts when ticket types are available
  useEffect(() => {
    if (globalTicketTypes && globalTicketTypes.length > 0) {
      const initialCounts = {};
      globalTicketTypes.forEach((tt) => {
        initialCounts[tt.ticketTypeId] = 0;
      });
      setTicketCounts(initialCounts);
    }
  }, [globalTicketTypes]);

  // Load screenings when movie and date are selected
  useEffect(() => {
    if (movieDetails && movieDetails.movieId && selectedDate) {
      const fetchScreenings = async () => {
        setIsLoading(true);
        setPageError(null);
        try {
          const data = await screeningService.getPublicScreeningsForMovieDate(
            movieDetails.movieId,
            selectedDate
          );
          setAvailableScreenings(data || []);
          setSelectedScreening(null);
          setScreeningSeatsData(null);
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

  // Load seat data when screening is selected
  useEffect(() => {
    if (selectedScreening?.screeningId) {
      const fetchSeatData = async () => {
        setIsLoading(true);
        setPageError(null);
        try {
          const seatData = await screeningService.getScreeningSeats(
            selectedScreening.screeningId
          );
          setScreeningSeatsData(seatData);
          setSelectedSeats([]);
        } catch (err) {
          setPageError("좌석 정보 로딩 실패: " + err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchSeatData();
    }
  }, [selectedScreening]);

  // Clean up seat holds when component unmounts or seats change
  useEffect(() => {
    return () => {
      if (seatHoldTimeoutRef.current) {
        clearTimeout(seatHoldTimeoutRef.current);
      }
      if (heldSeatsRef.current.length > 0 && selectedScreening?.screeningId) {
        reservationService
          .releaseSeats({
            screeningId: selectedScreening.screeningId,
            seatIds: heldSeatsRef.current,
          })
          .catch(console.error);
      }
    };
  }, [selectedScreening]);

  const handleDateSelect = useCallback((date) => setSelectedDate(date), []);

  const handleScreeningSelect = useCallback(
    (screening) => setSelectedScreening(screening),
    []
  );

  const handleTicketCountChange = useCallback(
    (ticketTypeId, delta) => {
      setTicketCounts((prev) => {
        const currentCount = prev[ticketTypeId] || 0;
        const newCount = Math.max(0, currentCount + delta);
        const updatedCounts = { ...prev, [ticketTypeId]: newCount };
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

  const holdSelectedSeats = useCallback(
    async (seatIds) => {
      if (!selectedScreening?.screeningId || seatIds.length === 0) return;

      try {
        await reservationService.holdSeats({
          screeningId: selectedScreening.screeningId,
          seatIds: seatIds,
        });
        heldSeatsRef.current = seatIds;

        // Set timeout to release seats after 10 minutes
        if (seatHoldTimeoutRef.current) {
          clearTimeout(seatHoldTimeoutRef.current);
        }
        seatHoldTimeoutRef.current = setTimeout(async () => {
          try {
            await reservationService.releaseSeats({
              screeningId: selectedScreening.screeningId,
              seatIds: seatIds,
            });
            heldSeatsRef.current = [];
            alert("좌석 선점 시간이 만료되었습니다. 다시 선택해주세요.");
            setSelectedSeats([]);
          } catch (error) {
            console.error("Failed to release seats:", error);
          }
        }, 10 * 60 * 1000); // 10 minutes
      } catch (error) {
        console.error("Failed to hold seats:", error);
        alert("좌석 선점에 실패했습니다. 다시 시도해주세요.");
      }
    },
    [selectedScreening]
  );

  const releaseSelectedSeats = useCallback(async () => {
    if (!selectedScreening?.screeningId || heldSeatsRef.current.length === 0)
      return;

    try {
      await reservationService.releaseSeats({
        screeningId: selectedScreening.screeningId,
        seatIds: heldSeatsRef.current,
      });
      heldSeatsRef.current = [];
      if (seatHoldTimeoutRef.current) {
        clearTimeout(seatHoldTimeoutRef.current);
      }
    } catch (error) {
      console.error("Failed to release seats:", error);
    }
  }, [selectedScreening]);

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

      setSelectedSeats((prev) => {
        const newSeats = prev.includes(seatId)
          ? prev.filter((s) => s !== seatId)
          : prev.length < totalTickets
          ? [...prev, seatId]
          : (alert(`선택한 인원(${totalTickets}명)만큼 좌석을 선택하셨습니다.`),
            prev);

        // Hold or release seats based on selection
        if (newSeats.length > prev.length) {
          // Seat added, hold all selected seats
          holdSelectedSeats(
            newSeats.map((seat) =>
              typeof seat === "string"
                ? screeningSeatsData?.seats?.find((s) => s.seatNumber === seat)
                    ?.seatId || seat
                : seat
            )
          );
        } else if (newSeats.length < prev.length) {
          // Seat removed, release and re-hold remaining seats
          releaseSelectedSeats().then(() => {
            if (newSeats.length > 0) {
              holdSelectedSeats(
                newSeats.map((seat) =>
                  typeof seat === "string"
                    ? screeningSeatsData?.seats?.find(
                        (s) => s.seatNumber === seat
                      )?.seatId || seat
                    : seat
                )
              );
            }
          });
        }

        return newSeats;
      });
    },
    [ticketCounts, screeningSeatsData, holdSelectedSeats, releaseSelectedSeats]
  );

  const totalSelectedTickets = Object.values(ticketCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  const totalPrice = Object.entries(ticketCounts).reduce(
    (sum, [ticketTypeId, count]) => {
      const ticketType = globalTicketTypes?.find(
        (tt) => tt.ticketTypeId.toString() === ticketTypeId.toString()
      );
      if (ticketType && count > 0) {
        // Use fallback price based on ticket type name
        const price =
          TICKET_PRICES_FALLBACK[ticketType.typeName?.toLowerCase()] ||
          TICKET_PRICES_FALLBACK.adult;
        return sum + count * price;
      }
      return sum;
    },
    0
  );

  const proceedToNextStep = () => {
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

  const goBackStep = () => {
    if (currentStep > 1) {
      if (currentStep === 3) {
        // Going back from payment to seat selection
        setCurrentStep(currentStep - 1);
      } else if (currentStep === 2) {
        // Going back from seat selection to time selection
        releaseSelectedSeats();
        setSelectedSeats([]);
        setCurrentStep(currentStep - 1);
      }
    }
  };

  const handleFinalBooking = async () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      navigate("/login", { state: { from: location } });
      return;
    }

    try {
      // Create reservation
      const tickets = selectedSeats.map((seatIdentifier, index) => {
        const seatId =
          typeof seatIdentifier === "string"
            ? screeningSeatsData?.seats?.find(
                (s) => s.seatNumber === seatIdentifier
              )?.seatId || seatIdentifier
            : seatIdentifier;

        // Distribute ticket types among selected seats
        const ticketTypeEntries = Object.entries(ticketCounts).filter(
          ([_, count]) => count > 0
        );
        let currentIndex = 0;
        let ticketTypeId = null;

        for (const [ttId, count] of ticketTypeEntries) {
          if (index >= currentIndex && index < currentIndex + count) {
            ticketTypeId = parseInt(ttId);
            break;
          }
          currentIndex += count;
        }

        return {
          seatId: seatId,
          ticketTypeId: ticketTypeId || parseInt(Object.keys(ticketCounts)[0]),
        };
      });

      const reservationData = {
        screeningId: selectedScreening.screeningId,
        tickets: tickets,
        usedPoints: 0, // For now, no points usage
      };

      console.log("Creating reservation with data:", reservationData);

      const reservation = await reservationService.createReservation(
        reservationData
      );

      alert(
        `예매가 완료되었습니다!\n` +
          `예매 ID: ${reservation.reservationId}\n` +
          `총 결제 금액: ${totalPrice.toLocaleString()}원\n` +
          `${movieDetails.title} / ${formatDate(selectedDate)} ${
            selectedScreening?.screeningStartTime
              ? formatTime(selectedScreening.screeningStartTime)
              : selectedScreening?.screeningTime
              ? selectedScreening.screeningTime.includes("T")
                ? formatTime(selectedScreening.screeningTime.substring(11, 16))
                : formatTime(selectedScreening.screeningTime)
              : ""
          } / ${
            selectedScreening?.roomName ||
            selectedScreening?.screeningRoom?.roomName
          }\n` +
          `좌석: ${selectedSeats.join(", ")}`
      );

      navigate("/profile");
    } catch (error) {
      console.error("Booking failed:", error);
      alert("예매에 실패했습니다: " + error.message);
    }
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
                disabled={isLoading || !globalTicketTypes?.length}
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
              {selectedScreening?.screeningStartTime
                ? formatTime(selectedScreening.screeningStartTime)
                : selectedScreening?.screeningTime
                ? selectedScreening.screeningTime.includes("T")
                  ? formatTime(
                      selectedScreening.screeningTime.substring(11, 16)
                    )
                  : formatTime(selectedScreening.screeningTime)
                : ""}{" "}
              (
              {selectedScreening?.roomName ||
                selectedScreening?.screeningRoom?.roomName}
              )
            </InfoText>
            {!globalTicketTypes?.length && (
              <LoadingErrorDisplay>티켓 정보 로딩 중...</LoadingErrorDisplay>
            )}
            {globalTicketTypes?.length > 0 && (
              <TicketCounter
                ticketCounts={ticketCounts}
                onTicketCountChange={handleTicketCountChange}
                ticketTypes={globalTicketTypes}
                maxTotalTickets={MAX_SEATS_PER_BOOKING}
                selectedSeatsCount={selectedSeats.length}
              />
            )}
            {isLoading && selectedScreening && (
              <LoadingErrorDisplay>좌석 정보 로딩 중...</LoadingErrorDisplay>
            )}
            {pageError && selectedScreening && (
              <LoadingErrorDisplay $isError>{pageError}</LoadingErrorDisplay>
            )}
            {!isLoading &&
              screeningSeatsData?.seats &&
              totalSelectedTickets > 0 && (
                <SeatLayout
                  seats={screeningSeatsData.seats}
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
              screeningSeatsData?.seats && (
                <Button
                  onClick={proceedToNextStep}
                  fullWidth
                  disabled={isLoading || !globalTicketTypes?.length}
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
                {selectedScreening?.roomName ||
                  selectedScreening?.screeningRoom?.roomName}
              </p>
              <p>
                <strong>날짜:</strong> {formatDate(selectedDate)}
              </p>
              <p>
                <strong>시간:</strong>{" "}
                {selectedScreening?.screeningStartTime
                  ? formatTime(selectedScreening.screeningStartTime)
                  : selectedScreening?.screeningTime
                  ? selectedScreening.screeningTime.includes("T")
                    ? formatTime(
                        selectedScreening.screeningTime.substring(11, 16)
                      )
                    : formatTime(selectedScreening.screeningTime)
                  : ""}
              </p>
              <p>
                <strong>인원:</strong>
                {globalTicketTypes
                  ?.map((tt) =>
                    ticketCounts[tt.ticketTypeId] > 0
                      ? ` ${tt.typeName} ${ticketCounts[tt.ticketTypeId]}명`
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
