// src/pages/BookingPage.js
import React, { useState, useEffect, useCallback, useRef } from "react";
import styled from "styled-components";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import DateSelector from "../components/booking/DateSelector";
import TimeSelector from "../components/booking/TimeSelector";
import TicketCounter from "../components/booking/TicketCounter";
import SeatLayout from "../components/booking/SeatLayout";
import Button from "../components/common/Button";
import PaymentSection from "../components/booking/PaymentSection";
import { ChevronLeft } from "lucide-react";
// Toss Payments는 전역 스크립트로 로드됨

import * as movieService from "../services/movieService";
import * as screeningService from "../services/screeningService";
import * as reservationService from "../services/reservationService";
import * as paymentService from "../services/paymentService";
import { useData } from "../contexts/DataContext";
import useAuth from "../hooks/useAuth";
import { getTodayDateString, formatDate, formatTime } from "../utils/dateUtils";
import {
  TICKET_PRICES_FALLBACK,
  MAX_SEATS_PER_BOOKING,
  TOSS_PAYMENTS_CONFIG,
} from "../constants/config";

const BookingPageWrapper = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[12]};
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
  margin-bottom: ${({ theme }) => theme.spacing[6]};
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
  const currentReservationRef = useRef(null);

  const [movieDetails, setMovieDetails] = useState(
    location.state?.movie || null
  );
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [availableScreenings, setAvailableScreenings] = useState([]);
  const [selectedScreening, setSelectedScreening] = useState(null);
  const [screeningSeatsData, setScreeningSeatsData] = useState(null);
  const [screeningTicketPrices, setScreeningTicketPrices] = useState(null);

  const [ticketCounts, setTicketCounts] = useState({});
  const [selectedSeats, setSelectedSeats] = useState([]);

  // Payment related states
  const [paymentData, setPaymentData] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

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

  // Load seat data and ticket prices when screening is selected
  useEffect(() => {
    if (selectedScreening?.screeningId) {
      const fetchScreeningData = async () => {
        setIsLoading(true);
        setPageError(null);
        console.log(
          `Fetching screening data for screening ID: ${selectedScreening.screeningId}`
        );
        try {
          // Fetch both seat data and ticket prices in parallel
          const [seatData, ticketPriceData] = await Promise.all([
            screeningService.getScreeningSeats(selectedScreening.screeningId),
            screeningService.getScreeningTicketPrices(
              selectedScreening.screeningId
            ),
          ]);

          console.log("Fetched seat data:", seatData);
          console.log("Fetched ticket price data:", ticketPriceData);

          setScreeningSeatsData(seatData);
          setScreeningTicketPrices(ticketPriceData);
          setSelectedSeats([]);

          // Reset ticket counts based on new pricing
          if (ticketPriceData?.ticketPrices) {
            const initialCounts = {};
            ticketPriceData.ticketPrices.forEach((ticketPrice) => {
              initialCounts[ticketPrice.ticketTypeId] = 0;
            });
            console.log("Setting initial ticket counts:", initialCounts);
            setTicketCounts(initialCounts);
          }
        } catch (err) {
          console.error("Error fetching screening data:", err);
          setPageError("상영 정보 로딩 실패: " + err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchScreeningData();
    }
  }, [selectedScreening]);

  // 예매 취소 함수
  const cancelCurrentReservation = useCallback(
    async (reason = "사용자 취소") => {
      if (!currentReservationRef.current) {
        console.log("취소할 예매가 없습니다.");
        return;
      }

      const { reservationId, status } = currentReservationRef.current;

      // 이미 완료된 예매는 취소하지 않음
      if (status === "COMPLETED") {
        console.log("이미 완료된 예매는 취소하지 않습니다.");
        return;
      }

      try {
        console.log(
          "🚫 예매 취소 시도 - Reservation ID:",
          reservationId,
          "Reason:",
          reason
        );

        await reservationService.cancelReservation({
          reservationId: reservationId,
          refundReason: reason,
        });

        console.log("✅ 예매 취소 완료");
        currentReservationRef.current = null;
      } catch (error) {
        console.warn("예매 취소 실패 (API가 구현되지 않았을 수 있음):", error);
        // API가 구현되지 않았어도 로컬 상태는 정리
        currentReservationRef.current = null;
      }
    },
    []
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

  // 좌석 해제 및 예매 취소 함수
  const cleanupReservationAndSeats = useCallback(
    async (reason = "페이지 이탈") => {
      console.log("🧹 예매 및 좌석 정리 시작:", reason);

      // 좌석 해제
      await releaseSelectedSeats();

      // 예매 취소
      await cancelCurrentReservation(reason);

      console.log("🧹 예매 및 좌석 정리 완료");
    },
    [releaseSelectedSeats, cancelCurrentReservation]
  );

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

  // 브라우저 이벤트 처리 (창 닫기, 새로고침, 페이지 이탈)
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (currentReservationRef.current?.status === "PENDING_PAYMENT") {
        // 브라우저가 페이지를 닫기 전에 예매 취소 시도
        navigator.sendBeacon(
          "/api/protected/reservations/cancel",
          JSON.stringify({
            reservationId: currentReservationRef.current.reservationId,
            refundReason: "브라우저 창 닫기",
          })
        );

        event.preventDefault();
        event.returnValue =
          "결제 진행 중입니다. 페이지를 벗어나면 예매가 취소됩니다.";
        return event.returnValue;
      }
    };

    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "hidden" &&
        currentReservationRef.current?.status === "PENDING_PAYMENT"
      ) {
        // 페이지가 숨겨질 때 (탭 변경, 앱 변경 등)
        cleanupReservationAndSeats("페이지 숨김");
      }
    };

    // 이벤트 리스너 등록
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 컴포넌트 언마운트 시 정리
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      // 컴포넌트 언마운트 시에도 예매 취소
      if (currentReservationRef.current?.status === "PENDING_PAYMENT") {
        cleanupReservationAndSeats("컴포넌트 언마운트");
      }
    };
  }, [cleanupReservationAndSeats]);

  const handleDateSelect = useCallback((date) => setSelectedDate(date), []);

  const handleScreeningSelect = useCallback(
    (screening) => {
      // Check if user is logged in when selecting screening
      if (!user) {
        const confirmLogin = window.confirm(
          "예매를 진행하시려면 로그인이 필요합니다.\n" +
            "확인: 회원 로그인\n" +
            "취소: 비회원 예매 (기능 준비 중)"
        );

        if (confirmLogin) {
          navigate("/login", { state: { from: location } });
          return;
        } else {
          // For now, alert that guest booking is not available
          // In the future, this could redirect to guest booking
          alert(
            "비회원 예매 기능은 준비 중입니다. 회원 로그인을 이용해주세요."
          );
          navigate("/login", { state: { from: location } });
          return;
        }
      }
      setSelectedScreening(screening);
    },
    [user, navigate, location]
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

  const handleSeatSelect = useCallback(
    (seatId) => {
      const totalTickets = Object.values(ticketCounts).reduce(
        (sum, count) => sum + count,
        0
      );

      console.log(
        `Seat selection: seatId=${seatId}, totalTickets=${totalTickets}, currentSelectedSeats=`,
        selectedSeats
      );

      if (totalTickets === 0) {
        alert("먼저 관람 인원을 선택해주세요.");
        return;
      }

      setSelectedSeats((prev) => {
        const isAlreadySelected = prev.includes(seatId);
        let newSeats;

        if (isAlreadySelected) {
          // Deselecting a seat
          newSeats = prev.filter((s) => s !== seatId);
          console.log("Deselecting seat:", seatId);
        } else {
          // Selecting a new seat
          if (prev.length >= totalTickets) {
            alert(`선택한 인원(${totalTickets}명)만큼 좌석을 선택하셨습니다.`);
            return prev; // No change
          }
          newSeats = [...prev, seatId];
          console.log("Selecting seat:", seatId);
        }

        console.log("Updated selected seats:", newSeats);

        // Hold or release seats based on selection
        if (newSeats.length > prev.length) {
          // Seat added, hold all selected seats
          const seatIdsToHold = newSeats.map((seat) =>
            typeof seat === "string"
              ? screeningSeatsData?.seats?.find((s) => s.seatNumber === seat)
                  ?.seatId || seat
              : seat
          );
          console.log("Holding seats:", seatIdsToHold);
          holdSelectedSeats(seatIdsToHold);
        } else if (newSeats.length < prev.length) {
          // Seat removed, release and re-hold remaining seats
          console.log("Releasing seats and re-holding remaining");
          releaseSelectedSeats().then(() => {
            if (newSeats.length > 0) {
              const seatIdsToHold = newSeats.map((seat) =>
                typeof seat === "string"
                  ? screeningSeatsData?.seats?.find(
                      (s) => s.seatNumber === seat
                    )?.seatId || seat
                  : seat
              );
              console.log("Re-holding seats:", seatIdsToHold);
              holdSelectedSeats(seatIdsToHold);
            }
          });
        }

        return newSeats;
      });
    },
    [
      ticketCounts,
      selectedSeats,
      screeningSeatsData,
      holdSelectedSeats,
      releaseSelectedSeats,
    ]
  );

  const totalSelectedTickets = Object.values(ticketCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  const totalPrice = Object.entries(ticketCounts).reduce(
    (sum, [ticketTypeId, count]) => {
      if (count > 0) {
        // Use actual screening ticket price if available
        const ticketPrice = screeningTicketPrices?.ticketPrices?.find(
          (tp) => tp.ticketTypeId.toString() === ticketTypeId.toString()
        );

        if (ticketPrice) {
          return sum + count * ticketPrice.price;
        }

        // Fallback to global ticket type with fallback pricing
        const globalTicketType = globalTicketTypes?.find(
          (tt) => tt.ticketTypeId.toString() === ticketTypeId.toString()
        );
        if (globalTicketType) {
          const price =
            TICKET_PRICES_FALLBACK[globalTicketType.typeName?.toLowerCase()] ||
            TICKET_PRICES_FALLBACK.adult;
          return sum + count * price;
        }
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

  const goBackStep = async () => {
    if (currentStep > 1) {
      if (currentStep === 3) {
        // Going back from payment to seat selection - 예매 취소
        await cancelCurrentReservation("사용자가 결제 단계에서 뒤로가기");
        setCurrentStep(currentStep - 1);
      } else if (currentStep === 2) {
        // Going back from seat selection to time selection
        releaseSelectedSeats();
        setSelectedSeats([]);
        setCurrentStep(currentStep - 1);
      }
    }
  };

  const handlePaymentReady = useCallback((paymentInfo) => {
    setPaymentData(paymentInfo);
  }, []);

  const handleFinalBooking = async () => {
    console.log("handleFinalBooking called with:", {
      user: !!user,
      paymentData,
    });

    if (!user) {
      alert("로그인이 필요합니다.");
      navigate("/login", { state: { from: location } });
      return;
    }

    if (!paymentData) {
      alert("결제 정보를 설정해주세요.");
      return;
    }

    if (paymentData.finalAmount <= 0) {
      // Free booking (no payment required)
      await handleFreeBooking();
      return;
    }

    if (paymentData.finalAmount < 100) {
      alert("결제 최소 금액은 100원입니다.");
      return;
    }

    // Start payment process
    await handleTossPayment();
  };

  const handleFreeBooking = async () => {
    try {
      setIsProcessingPayment(true);

      // Prepare seat IDs
      const seatIds = selectedSeats.map((seatIdentifier) => {
        const seatId =
          typeof seatIdentifier === "string"
            ? screeningSeatsData?.seats?.find(
                (s) => s.seatNumber === seatIdentifier
              )?.seatId || seatIdentifier
            : seatIdentifier;
        return parseInt(seatId);
      });

      // Prepare ticket types with counts
      const ticketTypes = Object.entries(ticketCounts)
        .filter(([_, count]) => count > 0)
        .map(([ticketTypeId, count]) => ({
          ticketTypeId: parseInt(ticketTypeId),
          count: count,
        }));

      const reservationData = {
        screeningId: selectedScreening.screeningId,
        ticketTypes: ticketTypes,
        seatIds: seatIds,
      };

      console.log("Creating free reservation with data:", reservationData);

      const reservation = await reservationService.createReservation(
        reservationData
      );

      console.log(
        "🆓 무료 예매 - Reservation ID:",
        reservation?.reservationId || reservation?.id
      );

      // 무료 예매 정보 저장
      const reservationId = reservation?.reservationId || reservation?.id;
      currentReservationRef.current = {
        reservationId: reservationId,
        status: "COMPLETED", // 무료 예매는 바로 완료
      };

      alert(
        `예매가 완료되었습니다! (무료 예매)\n` +
          `예매 ID: ${reservation.reservationId}\n` +
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
      console.error("Free booking failed:", error);
      alert("예매에 실패했습니다: " + error.message);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleTossPayment = async () => {
    try {
      setIsProcessingPayment(true);

      console.log("Starting Toss payment process...");
      console.log("Current state:", {
        user,
        paymentData,
        selectedSeats,
        screeningSeatsData: !!screeningSeatsData,
        selectedScreening: !!selectedScreening,
        movieDetails: !!movieDetails,
      });

      // Validate all required data before starting
      if (!user) {
        throw new Error("사용자 정보를 찾을 수 없습니다.");
      }
      if (!paymentData) {
        throw new Error("결제 정보를 찾을 수 없습니다.");
      }
      if (!selectedSeats?.length) {
        throw new Error("선택된 좌석이 없습니다.");
      }
      if (!selectedScreening) {
        throw new Error("선택된 상영 정보가 없습니다.");
      }

      // First, create reservation
      const seatIds = selectedSeats.map((seatIdentifier) => {
        const seatId =
          typeof seatIdentifier === "string"
            ? screeningSeatsData?.seats?.find(
                (s) => s.seatNumber === seatIdentifier
              )?.seatId || seatIdentifier
            : seatIdentifier;
        const numericSeatId = parseInt(seatId);
        if (isNaN(numericSeatId)) {
          throw new Error(`유효하지 않은 좌석 ID: ${seatId}`);
        }
        return numericSeatId;
      });

      const ticketTypes = Object.entries(ticketCounts)
        .filter(([_, count]) => count > 0)
        .map(([ticketTypeId, count]) => ({
          ticketTypeId: parseInt(ticketTypeId),
          count: count,
        }));

      const reservationData = {
        screeningId: selectedScreening.screeningId,
        ticketTypes: ticketTypes,
        seatIds: seatIds,
      };

      console.log("Creating reservation for payment:", reservationData);
      const reservation = await reservationService.createReservation(
        reservationData
      );

      console.log("Reservation created:", reservation);

      // Improved validation with better error handling
      if (!reservation) {
        throw new Error("예약 생성에 실패했습니다. 서버 응답이 없습니다.");
      }

      const reservationId = reservation.reservationId || reservation.id;
      if (!reservationId) {
        console.error("Reservation object:", reservation);
        throw new Error("예약 생성에 실패했습니다. 예약 ID를 받지 못했습니다.");
      }

      // 결제 과정에서 reservationId 출력
      console.log("🎫 결제 진행 중 - Reservation ID:", reservationId);

      // Generate payment identifiers
      const orderId = paymentService.generateOrderId();

      // 현재 예매 정보 저장 (취소를 위해)
      currentReservationRef.current = {
        reservationId: reservationId,
        orderId: orderId,
        status: "PENDING_PAYMENT",
      };
      const userId = getUserId(user);
      console.log("Generated userId for payment:", userId);
      const customerKey = paymentService.generateCustomerKey(userId);

      // Save payment info before payment
      const paymentBeforeData = {
        reservationId: reservationId,
        orderId: orderId,
        paymentMethod: paymentData.paymentMethod || "CARD",
        currency: "KRW",
        paymentDiscountId: paymentData.selectedDiscount?.id || null,
        usedPointAmount: paymentData.usePoints || 0,
        amount: paymentData.originalAmount || 0,
        finalAmount: paymentData.finalAmount || 0,
      };

      console.log(
        "💰 결제 정보 저장 - Reservation ID:",
        reservationId,
        "Final Amount:",
        paymentData.finalAmount
      );

      // Validate payment data before sending
      if (paymentBeforeData.finalAmount <= 0) {
        throw new Error("유효하지 않은 결제 금액입니다.");
      }

      console.log("Saving payment before data:", paymentBeforeData);
      const paymentBeforeResult = await paymentService.savePaymentBefore(
        paymentBeforeData
      );

      console.log("Payment before result:", paymentBeforeResult);

      // Improved payment ID validation
      const paymentId = getPaymentId(paymentBeforeResult);
      if (!paymentId) {
        console.error("Payment before result:", paymentBeforeResult);
        throw new Error(
          "결제 정보 저장에 실패했습니다. 결제 ID를 받지 못했습니다."
        );
      }

      localStorage.setItem(`payment_${orderId}`, paymentId.toString());

      // Save payment data for later use in success page
      localStorage.setItem(
        `payment_data_${orderId}`,
        JSON.stringify({
          reservationId: reservationId,
          paymentId: paymentId,
          orderId: orderId,
          amount: paymentData.finalAmount,
        })
      );

      // Check if TossPayments is available from global script
      if (typeof window.TossPayments === "undefined") {
        throw new Error(
          "Toss Payments 스크립트가 로드되지 않았습니다. 페이지를 새로고침해주세요."
        );
      }

      // Initialize Toss Payments v2 SDK with client key
      const tossPayments = window.TossPayments(TOSS_PAYMENTS_CONFIG.CLIENT_KEY);

      // Create payment instance with customerKey
      const payment = tossPayments.payment({ customerKey });

      const orderName = `${movieDetails?.title || "영화"} 예매`;

      // Validate required data before payment request
      if (!paymentData || !paymentData.finalAmount || !orderId) {
        throw new Error("결제에 필요한 정보가 부족합니다.");
      }

      // Map payment method to Toss Payments v2 format
      let paymentMethod;
      let paymentAmount = paymentData.finalAmount;
      let currency = "KRW";

      switch (paymentData.paymentMethod) {
        case "CARD":
          paymentMethod = "CARD";
          break;
        case "TRANSFER":
          paymentMethod = "TRANSFER";
          break;
        case "VIRTUAL_ACCOUNT":
          paymentMethod = "VIRTUAL_ACCOUNT";
          break;
        case "MOBILE_PHONE":
          paymentMethod = "MOBILE_PHONE";
          break;
        case "CULTURE_GIFT_CERTIFICATE":
          paymentMethod = "CULTURE_GIFT_CERTIFICATE";
          break;
        case "FOREIGN_EASY_PAY":
          paymentMethod = "FOREIGN_EASY_PAY";
          // PayPal의 경우 USD로 변환 (임시로 1000원 = 1달러로 계산)
          paymentAmount = Math.ceil(paymentData.finalAmount / 1000);
          currency = "USD";
          break;
        default:
          paymentMethod = "CARD";
      }

      // Prepare payment request data for v2 SDK
      const paymentRequestData = {
        method: paymentMethod,
        amount: {
          currency: currency,
          value: paymentAmount,
        },
        orderId: orderId,
        orderName: orderName,
        successUrl: TOSS_PAYMENTS_CONFIG.SUCCESS_URL,
        failUrl: TOSS_PAYMENTS_CONFIG.FAIL_URL,
        customerEmail: user?.email || `customer${userId}@example.com`,
        customerName: user?.name || user?.nickname || `고객${userId}`,
        customerMobilePhone: user?.phone || user?.mobile || "01000000000",
      };

      // Add method-specific options
      if (paymentMethod === "CARD") {
        paymentRequestData.card = {
          useEscrow: false,
          flowMode: "DEFAULT", // 통합결제창 여는 옵션
          useCardPoint: false,
          useAppCardOnly: false,
        };
      }

      console.log("Requesting payment with method:", paymentMethod);
      console.log("Payment request data:", paymentRequestData);

      // Request payment using v2 SDK
      await payment.requestPayment(paymentRequestData);
    } catch (error) {
      console.error("Payment process failed:", error);

      // 결제 실패 시 예매 취소
      await cancelCurrentReservation("결제 실패");

      // Handle specific Toss Payment errors
      if (error.code && error.message) {
        // Toss Payments specific error
        navigate(
          `/payment/fail?code=${error.code}&message=${encodeURIComponent(
            error.message
          )}`
        );
      } else {
        // Generic error
        alert(
          "결제 처리 중 오류가 발생했습니다: " +
            (error.message || "알 수 없는 오류")
        );
      }
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Helper function to safely get user ID
  const getUserId = (user) => {
    if (!user) return 1;
    return user.id || user.userId || user.customerId || user.loginId || 1;
  };

  // Helper function to safely get payment ID
  const getPaymentId = (paymentResult) => {
    if (!paymentResult) return null;
    return paymentResult.paymentId || paymentResult.id;
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
            {selectedScreening &&
              (() => {
                const hasScreeningTickets =
                  !!screeningTicketPrices?.ticketPrices?.length;
                const hasGlobalTickets = !!globalTicketTypes?.length;
                const hasAnyTicketData =
                  hasScreeningTickets || hasGlobalTickets;
                const buttonDisabled = isLoading || !hasAnyTicketData;

                console.log("Step 1 Button state:", {
                  selectedScreening: !!selectedScreening,
                  isLoading,
                  hasScreeningTickets,
                  hasGlobalTickets,
                  hasAnyTicketData,
                  buttonDisabled,
                  screeningTicketPrices: screeningTicketPrices?.ticketPrices,
                  globalTicketTypes,
                });

                return (
                  <Button
                    onClick={proceedToNextStep}
                    fullWidth
                    disabled={buttonDisabled}
                  >
                    다음 (인원/좌석 선택)
                  </Button>
                );
              })()}
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
            {!(
              screeningTicketPrices?.ticketPrices?.length ||
              globalTicketTypes?.length
            ) && (
              <LoadingErrorDisplay>티켓 정보 로딩 중...</LoadingErrorDisplay>
            )}
            {(screeningTicketPrices?.ticketPrices || globalTicketTypes)
              ?.length > 0 && (
              <TicketCounter
                ticketCounts={ticketCounts}
                onTicketCountChange={handleTicketCountChange}
                ticketTypes={
                  screeningTicketPrices?.ticketPrices || globalTicketTypes
                }
                maxTotalTickets={MAX_SEATS_PER_BOOKING}
                selectedSeatsCount={selectedSeats.length}
                useActualPrices={!!screeningTicketPrices?.ticketPrices}
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
                  disabled={
                    isLoading ||
                    !(screeningTicketPrices?.ticketPrices || globalTicketTypes)
                      ?.length
                  }
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
                {(screeningTicketPrices?.ticketPrices || globalTicketTypes)
                  ?.map((tt) => {
                    const ticketTypeId = tt.ticketTypeId;
                    const count = ticketCounts[ticketTypeId];
                    return count > 0 ? ` ${tt.typeName} ${count}명` : "";
                  })
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
            <PaymentSection
              originalAmount={totalPrice}
              onPaymentReady={handlePaymentReady}
              isProcessing={isProcessingPayment}
            />
            <Button
              onClick={handleFinalBooking}
              variant="primary"
              size="lg"
              fullWidth
              style={{ marginTop: "2rem" }}
              disabled={isProcessingPayment || !paymentData}
            >
              {isProcessingPayment
                ? "처리 중..."
                : paymentData?.finalAmount > 0
                ? `${paymentData.finalAmount.toLocaleString()}원 결제하기`
                : "무료 예매하기"}
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
