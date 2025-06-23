// src/pages/BookingPage.js
import React, { useState, useEffect, useCallback, useRef } from "react";
import styled from "styled-components";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import DateSelector from "../components/booking/DateSelector";
import TimeSelector from "../components/booking/TimeSelector";
import TicketCounter from "../components/booking/TicketCounter";
import SeatLayout from "../components/booking/SeatLayout";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
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

const LoginSelectionOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${({ theme }) => theme.spacing[4]};
`;

const LoginSelectionModal = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing[6]};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  max-width: 500px;
  width: 100%;
  text-align: center;
  max-height: 90vh;
  overflow-y: auto;
`;

const LoginSelectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ theme }) => theme.colors.primaryLight};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const LoginSelectionText = styled.p`
  color: ${({ theme }) => theme.colors.textDark};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  font-size: ${({ theme }) => theme.fontSizes.base};
`;

const LoginButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const LoginOptionButton = styled(Button)`
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
  font-size: ${({ theme }) => theme.fontSizes.base};

  &.member {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    color: white;

    &:hover {
      background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
    }
  }

  &.guest {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    border: none;
    color: white;

    &:hover {
      background: linear-gradient(135deg, #e081e9 0%, #e3475a 100%);
    }
  }
`;

const CancelButton = styled(Button).attrs({ variant: "outline" })`
  color: ${({ theme }) => theme.colors.textDark};
`;

// 비회원 가입 폼 스타일
const GuestAuthForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
  text-align: left;
  margin-top: ${({ theme }) => theme.spacing[4]};
`;

const FormRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};

  & > * {
    flex: 1;
  }
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing[2]};
`;

const SuccessMessage = styled.p`
  color: ${({ theme }) => theme.colors.success || "#10b981"};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing[2]};
`;

const EmailVerificationSection = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing[4]};
  background-color: ${({ theme }) => theme.colors.surfaceLight};
`;

const VerificationRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  align-items: end;
`;

const BookingPage = () => {
  const { movieId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, guestLogin } = useAuth();
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

  // Login selection states
  const [showLoginSelection, setShowLoginSelection] = useState(false);
  const [pendingScreening, setPendingScreening] = useState(null);
  const [loginModalStep, setLoginModalStep] = useState("selection"); // 'selection', 'guest-signup'

  // 비회원 가입 폼 상태
  const [guestFormData, setGuestFormData] = useState({
    email: "",
    password: "",
    name: "",
    birthdate: "",
    phone: "",
    repeatPassword: "",
  });
  const [guestAuthError, setGuestAuthError] = useState("");
  const [guestAuthSuccess, setGuestAuthSuccess] = useState("");
  const [isGuestAuthLoading, setIsGuestAuthLoading] = useState(false);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [emailVerificationCode, setEmailVerificationCode] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);

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

  // Handle login completion - set pending screening if user logged in
  useEffect(() => {
    if (user && pendingScreening) {
      setSelectedScreening(pendingScreening);
      setPendingScreening(null);
      setShowLoginSelection(false);
    }
  }, [user, pendingScreening]);

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

  // 예매 취소 함수 (먼저 정의)
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
        console.warn("예매 취소 실패:", error);

        // 409 오류 (이미 완료된 예매 등)는 정상적인 상황일 수 있음
        if (error.status === 409) {
          console.warn(
            "예매 상태로 인해 취소할 수 없습니다 (이미 완료되었을 수 있음)"
          );
        } else if (error.status === 404) {
          console.warn("예매를 찾을 수 없습니다 (이미 처리되었을 수 있음)");
        }

        // 어떤 오류든 로컬 상태는 정리
        currentReservationRef.current = null;
      }
    },
    []
  );

  // 🔥 새로운 즉시 좌석 해제 함수 (동기적, 블로킹)
  const forceReleaseSeatsImmediate = useCallback(
    async (reason = "강제 해제") => {
      if (
        !selectedScreening?.screeningId ||
        heldSeatsRef.current.length === 0
      ) {
        return;
      }

      const seatsToRelease = [...new Set(heldSeatsRef.current)];
      console.log(`🚨 즉시 좌석 해제 시작 - ${reason}:`, seatsToRelease);

      try {
        // 여러 방법으로 즉시 해제 시도
        const releasePromises = [];

        // 1. 일반 API 호출
        releasePromises.push(
          reservationService.releaseSeats({
            screeningId: selectedScreening.screeningId,
            seatIds: seatsToRelease,
          })
        );

        // 2. sendBeacon으로도 백업 요청 (브라우저가 닫혀도 전송됨)
        if (navigator.sendBeacon) {
          const beaconData = JSON.stringify({
            screeningId: selectedScreening.screeningId,
            seatIds: seatsToRelease,
          });

          navigator.sendBeacon(
            `/api/protected/reservations/release`,
            new Blob([beaconData], { type: "application/json" })
          );
          console.log(`📡 Beacon 좌석 해제 요청 전송됨`);
        }

        // 3. Fetch API keepalive로도 백업 (더 안전한 전송)
        try {
          fetch("/api/protected/reservations/release", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              screeningId: selectedScreening.screeningId,
              seatIds: seatsToRelease,
            }),
            keepalive: true, // 페이지가 닫혀도 요청 유지
          }).catch((err) => console.warn("Fetch keepalive 요청 실패:", err));

          console.log(`🔄 Fetch keepalive 좌석 해제 요청 전송됨`);
        } catch (fetchError) {
          console.warn("Fetch keepalive 실패:", fetchError);
        }

        // 일반 API 호출 결과 기다리기 (빠른 응답 기대)
        await Promise.race([
          Promise.all(releasePromises),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("타임아웃")), 3000)
          ),
        ]);

        heldSeatsRef.current = [];
        if (seatHoldTimeoutRef.current) {
          clearTimeout(seatHoldTimeoutRef.current);
        }

        // 🔥 hold 시간 초기화
        if (window.seatHoldStartTime) {
          delete window.seatHoldStartTime;
          console.log("좌석 hold 시간 기록 초기화");
        }

        console.log(`✅ 즉시 좌석 해제 완료 - ${reason}`);
      } catch (error) {
        console.error(`❌ 즉시 좌석 해제 실패 - ${reason}:`, error);

        // 실패해도 로컬 상태는 정리하고 계속 진행
        heldSeatsRef.current = [];
        if (seatHoldTimeoutRef.current) {
          clearTimeout(seatHoldTimeoutRef.current);
        }

        // 🔥 hold 시간 초기화
        if (window.seatHoldStartTime) {
          delete window.seatHoldStartTime;
          console.log("좌석 hold 시간 기록 초기화 (실패 시)");
        }
      }
    },
    [selectedScreening]
  );

  // 🔥 페이지 이탈 감지 및 즉시 해제 훅
  useEffect(() => {
    let isPageUnloading = false;
    let releaseInterval;

    // 페이지 이탈 전 즉시 해제
    const handleBeforeUnload = (event) => {
      isPageUnloading = true;

      const hasHeldSeats = heldSeatsRef.current.length > 0;
      const hasPendingPayment =
        currentReservationRef.current?.status === "PENDING_PAYMENT";

      console.log(
        `🚨 beforeunload 이벤트 - 좌석: ${hasHeldSeats}, 결제: ${hasPendingPayment}`
      );

      if (hasHeldSeats || hasPendingPayment) {
        // 동기적으로 즉시 해제 (블로킹)
        if (hasHeldSeats) {
          forceReleaseSeatsImmediate("beforeunload");
        }

        if (hasPendingPayment) {
          cancelCurrentReservation("beforeunload - 창 닫기").catch(
            console.error
          );
        }

        // 브라우저에 경고 메시지 표시
        const message = hasPendingPayment
          ? "결제 진행 중입니다. 페이지를 벗어나면 예매가 취소됩니다."
          : "선택한 좌석이 있습니다. 페이지를 벗어나면 좌석이 해제됩니다.";

        event.preventDefault();
        event.returnValue = message;
        return message;
      }
    };

    // 페이지 숨김 시 즉시 해제 (더 확실함)
    const handlePageHide = () => {
      console.log("🚨 pagehide 이벤트");
      isPageUnloading = true;

      const hasHeldSeats = heldSeatsRef.current.length > 0;
      const hasPendingPayment =
        currentReservationRef.current?.status === "PENDING_PAYMENT";

      if (hasHeldSeats) {
        forceReleaseSeatsImmediate("pagehide");
      }

      if (hasPendingPayment) {
        cancelCurrentReservation("pagehide - 페이지 숨김").catch(console.error);
      }
    };

    // 페이지 가시성 변화 시 즉시 해제
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && !isPageUnloading) {
        console.log("🚨 visibilitychange - hidden");

        const hasHeldSeats = heldSeatsRef.current.length > 0;
        const hasPendingPayment =
          currentReservationRef.current?.status === "PENDING_PAYMENT";

        if (hasHeldSeats) {
          forceReleaseSeatsImmediate("visibilitychange - hidden");
        }

        if (hasPendingPayment) {
          cancelCurrentReservation("visibilitychange - 페이지 숨김").catch(
            console.error
          );
        }
      }
    };

    // 브라우저 뒤로가기/앞으로가기
    const handlePopState = () => {
      console.log("🚨 popstate 이벤트");
      isPageUnloading = true;

      const hasHeldSeats = heldSeatsRef.current.length > 0;
      const hasPendingPayment =
        currentReservationRef.current?.status === "PENDING_PAYMENT";

      if (hasHeldSeats || hasPendingPayment) {
        if (hasHeldSeats) {
          forceReleaseSeatsImmediate("popstate - 브라우저 이동");
        }

        if (hasPendingPayment) {
          cancelCurrentReservation("popstate - 브라우저 뒤로가기").catch(
            console.error
          );
        }
      }
    };

    // 🔥 주기적 백업 해제 (10초마다 체크, 페이지가 활성 상태일 때만)
    const startBackupReleaseCheck = () => {
      releaseInterval = setInterval(() => {
        // 페이지가 언로딩 중이거나 숨겨진 상태가 아닐 때만 실행
        if (!isPageUnloading && document.visibilityState === "visible") {
          const hasHeldSeats = heldSeatsRef.current.length > 0;

          if (hasHeldSeats) {
            console.log("🔄 백업 좌석 상태 체크:", heldSeatsRef.current);

            // 좌석이 10분 이상 hold되었으면 자동 해제
            const holdStartTime = window.seatHoldStartTime || Date.now();
            const holdDuration = Date.now() - holdStartTime;

            if (holdDuration > 10 * 60 * 1000) {
              // 10분
              console.log("⏰ 좌석 hold 시간 초과, 자동 해제");
              forceReleaseSeatsImmediate("백업 체크 - 시간 초과");
            }
          }
        }
      }, 10000); // 10초마다
    };

    // 이벤트 리스너 등록
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("popstate", handlePopState);

    // 백업 체크 시작
    startBackupReleaseCheck();

    // 정리 함수
    return () => {
      isPageUnloading = true;

      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("popstate", handlePopState);

      if (releaseInterval) {
        clearInterval(releaseInterval);
      }

      // 컴포넌트 언마운트 시 최종 정리
      const hasHeldSeats = heldSeatsRef.current.length > 0;
      const hasPendingPayment =
        currentReservationRef.current?.status === "PENDING_PAYMENT";

      if (hasHeldSeats || hasPendingPayment) {
        console.log("🧹 컴포넌트 언마운트 - 최종 정리");

        if (hasHeldSeats) {
          forceReleaseSeatsImmediate("컴포넌트 언마운트");
        }

        if (hasPendingPayment) {
          cancelCurrentReservation("컴포넌트 언마운트").catch(console.error);
        }
      }
    };
  }, [forceReleaseSeatsImmediate, cancelCurrentReservation]);

  // 🔥 개선된 releaseSelectedSeats (기존 함수는 유지하되 즉시 해제 로직 추가)
  const releaseSelectedSeats = useCallback(async () => {
    if (!selectedScreening?.screeningId || heldSeatsRef.current.length === 0)
      return;

    // 즉시 해제 시도
    await forceReleaseSeatsImmediate("일반 좌석 해제");
  }, [selectedScreening, forceReleaseSeatsImmediate]);

  // 좌석 해제 및 예매 취소 통합 함수
  const cleanupReservationAndSeats = useCallback(
    async (reason = "페이지 이탈") => {
      console.log("🧹 예매 및 좌석 정리 시작:", reason);

      // 병렬로 좌석 해제와 예매 취소 진행
      const promises = [];

      if (heldSeatsRef.current.length > 0) {
        promises.push(forceReleaseSeatsImmediate(reason));
      }

      if (currentReservationRef.current) {
        promises.push(cancelCurrentReservation(reason));
      }

      if (promises.length > 0) {
        try {
          await Promise.all(promises);
          console.log("🧹 예매 및 좌석 정리 완료:", reason);
        } catch (error) {
          console.warn("🧹 예매 및 좌석 정리 중 일부 실패:", error);
        }
      }
    },
    [forceReleaseSeatsImmediate, cancelCurrentReservation]
  );

  const handleDateSelect = useCallback((date) => setSelectedDate(date), []);

  const handleScreeningSelect = useCallback(
    (screening) => {
      // Check if user is logged in when selecting screening
      if (!user) {
        // Show login selection UI instead of simple confirm
        setPendingScreening(screening);
        setShowLoginSelection(true);
        return;
      }
      setSelectedScreening(screening);
    },
    [user]
  );

  const handleLoginSelection = (loginType) => {
    if (loginType === "member") {
      setShowLoginSelection(false);
      navigate("/login", { state: { from: location } });
    } else if (loginType === "guest") {
      setLoginModalStep("guest-signup");
      setGuestFormData({
        email: "",
        password: "",
        name: "",
        birthdate: "",
        phone: "",
        repeatPassword: "",
      });
      setGuestAuthError("");
      setGuestAuthSuccess("");
    } else {
      // 취소한 경우
      cancelLoginSelection();
    }
  };

  const cancelLoginSelection = () => {
    setShowLoginSelection(false);
    setPendingScreening(null);
    setLoginModalStep("selection");
    setGuestFormData({
      email: "",
      password: "",
      name: "",
      birthdate: "",
      phone: "",
      repeatPassword: "",
    });
    setGuestAuthError("");
    setGuestAuthSuccess("");
    setEmailVerificationSent(false);
    setEmailVerificationCode("");
    setIsEmailVerified(false);
  };

  const handleGuestFormChange = (field, value) => {
    setGuestFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setGuestAuthError("");
  };

  const handleSendEmailVerification = async () => {
    if (!guestFormData.email) {
      setGuestAuthError("이메일을 입력해주세요.");
      return;
    }

    setIsGuestAuthLoading(true);
    setGuestAuthError("");

    try {
      const { requestGuestAuthMail } = await import("../services/authService");
      await requestGuestAuthMail({
        email: guestFormData.email,
        purpose: "비회원 이메일 인증",
      });
      setEmailVerificationSent(true);
      setGuestAuthSuccess("인증 코드가 이메일로 전송되었습니다.");
    } catch (error) {
      setGuestAuthError(error.message || "인증 코드 전송에 실패했습니다.");
    } finally {
      setIsGuestAuthLoading(false);
    }
  };

  const handleVerifyEmailCode = async () => {
    if (!emailVerificationCode) {
      setGuestAuthError("인증 코드를 입력해주세요.");
      return;
    }

    setIsGuestAuthLoading(true);
    setGuestAuthError("");

    try {
      const { verifyGuestAuthMail } = await import("../services/authService");
      await verifyGuestAuthMail({
        email: guestFormData.email,
        code: emailVerificationCode,
      });
      setIsEmailVerified(true);
      setGuestAuthSuccess("이메일 인증이 완료되었습니다.");
    } catch (error) {
      setGuestAuthError(error.message || "인증 코드가 올바르지 않습니다.");
    } finally {
      setIsGuestAuthLoading(false);
    }
  };

  const handleGuestSignup = async (e) => {
    e.preventDefault();

    if (!isEmailVerified) {
      setGuestAuthError("이메일 인증을 완료해주세요.");
      return;
    }

    if (guestFormData.password !== guestFormData.repeatPassword) {
      setGuestAuthError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (guestFormData.password.length < 8) {
      setGuestAuthError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    setIsGuestAuthLoading(true);
    setGuestAuthError("");

    try {
      const { guestSignup } = await import("../services/authService");
      await guestSignup({
        name: guestFormData.name,
        email: guestFormData.email,
        birthdate: guestFormData.birthdate,
        phone: guestFormData.phone,
        password: guestFormData.password,
        repeatPassword: guestFormData.repeatPassword,
      });

      setGuestAuthSuccess("비회원 가입이 완료되었습니다. 로그인 중...");

      // 가입 완료 후 자동 로그인
      setTimeout(async () => {
        try {
          const success = await guestLogin({
            email: guestFormData.email,
            password: guestFormData.password,
          });

          if (success) {
            setSelectedScreening(pendingScreening);
            setPendingScreening(null);
            setShowLoginSelection(false);
            setLoginModalStep("selection");
          }
        } catch (loginError) {
          setGuestAuthError(
            "가입은 완료되었지만 자동 로그인에 실패했습니다. 다시 시도해주세요."
          );
        }
      }, 1500);
    } catch (error) {
      setGuestAuthError(error.message || "가입에 실패했습니다.");
    } finally {
      setIsGuestAuthLoading(false);
    }
  };

  const checkEmailAvailability = async () => {
    if (!guestFormData.email) return;

    try {
      const { checkGuestEmailAvailability } = await import(
        "../services/authService"
      );
      await checkGuestEmailAvailability(guestFormData.email);
      setGuestAuthSuccess("사용 가능한 이메일입니다.");
    } catch (error) {
      setGuestAuthError("이미 사용 중인 이메일입니다.");
    }
  };

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

  const holdNewSeats = useCallback(
    async (newSeatIds) => {
      if (!selectedScreening?.screeningId || newSeatIds.length === 0) return;

      // 중복 제거 및 이미 보유한 좌석 필터링
      const uniqueNewSeatIds = [...new Set(newSeatIds)];
      const seatsToHold = uniqueNewSeatIds.filter(
        (id) => !heldSeatsRef.current.includes(id)
      );

      if (seatsToHold.length === 0) {
        console.log("No new seats to hold");
        return;
      }

      try {
        console.log("Holding new seats:", seatsToHold);
        await reservationService.holdSeats({
          screeningId: selectedScreening.screeningId,
          seatIds: seatsToHold,
        });

        // Add new held seats to the current list (중복 방지)
        heldSeatsRef.current = [
          ...new Set([...heldSeatsRef.current, ...seatsToHold]),
        ];

        // 🔥 좌석 hold 시작 시간 기록 (백업 해제용)
        if (heldSeatsRef.current.length > 0 && !window.seatHoldStartTime) {
          window.seatHoldStartTime = Date.now();
          console.log(
            "좌석 hold 시간 기록 시작:",
            new Date(window.seatHoldStartTime)
          );
        }

        console.log("Currently held seats:", heldSeatsRef.current);

        // Reset timeout for all held seats
        if (seatHoldTimeoutRef.current) {
          clearTimeout(seatHoldTimeoutRef.current);
        }
        seatHoldTimeoutRef.current = setTimeout(async () => {
          try {
            if (heldSeatsRef.current.length > 0) {
              await reservationService.releaseSeats({
                screeningId: selectedScreening.screeningId,
                seatIds: [...new Set(heldSeatsRef.current)], // 중복 제거
              });
            }
            heldSeatsRef.current = [];
            alert("좌석 선점 시간이 만료되었습니다. 다시 선택해주세요.");
            setSelectedSeats([]);
          } catch (error) {
            console.error("Failed to release seats on timeout:", error);
            // 타임아웃 시 좌석 해제 실패해도 로컬 상태는 정리
            heldSeatsRef.current = [];
            setSelectedSeats([]);
          }
        }, 10 * 60 * 1000); // 10 minutes
      } catch (error) {
        console.error("Failed to hold new seats:", error);

        // Handle specific 409 error
        if (
          error.message?.includes("이미 선택된 좌석") ||
          error.status === 409
        ) {
          console.warn("Some seats are already held, trying to continue...");
          // 이미 선점된 좌석이라도 로컬 상태에는 추가 (UI 일관성 위해)
          heldSeatsRef.current = [
            ...new Set([...heldSeatsRef.current, ...seatsToHold]),
          ];
        } else {
          alert("좌석 선점에 실패했습니다. 다시 시도해주세요.");
        }
      }
    },
    [selectedScreening]
  );

  const releaseSpecificSeats = useCallback(
    async (seatIds) => {
      if (!selectedScreening?.screeningId || seatIds.length === 0) return;

      // 중복 제거
      const uniqueSeatIds = [...new Set(seatIds)];

      try {
        console.log("Releasing specific seats:", uniqueSeatIds);
        await reservationService.releaseSeats({
          screeningId: selectedScreening.screeningId,
          seatIds: uniqueSeatIds,
        });

        // Remove released seats from held seats list
        heldSeatsRef.current = heldSeatsRef.current.filter(
          (id) => !uniqueSeatIds.includes(id)
        );
        console.log("Remaining held seats:", heldSeatsRef.current);
      } catch (error) {
        console.error("Failed to release specific seats:", error);

        // 409 오류 (이미 해제되었거나 권한 없음)인 경우에도 로컬 상태는 정리
        if (error.status === 409) {
          console.warn(
            "Seats already released or no permission, cleaning local state"
          );
          heldSeatsRef.current = heldSeatsRef.current.filter(
            (id) => !uniqueSeatIds.includes(id)
          );
        }
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
          // Seat added, hold only the new seat
          const newSeatNumber = newSeats[newSeats.length - 1]; // Last added seat
          const newSeatId =
            typeof newSeatNumber === "string"
              ? screeningSeatsData?.seats?.find(
                  (s) => s.seatNumber === newSeatNumber
                )?.seatId || newSeatNumber
              : newSeatNumber;

          console.log("Holding new seat:", newSeatId);
          holdNewSeats([newSeatId]);
        } else if (newSeats.length < prev.length) {
          // Seat removed, release only the removed seat
          const removedSeat = prev.find((seat) => !newSeats.includes(seat));
          if (removedSeat) {
            const removedSeatId =
              typeof removedSeat === "string"
                ? screeningSeatsData?.seats?.find(
                    (s) => s.seatNumber === removedSeat
                  )?.seatId || removedSeat
                : removedSeat;

            console.log("Releasing removed seat:", removedSeatId);
            releaseSpecificSeats([removedSeatId]);
          }
        }

        return newSeats;
      });
    },
    [
      ticketCounts,
      selectedSeats,
      screeningSeatsData,
      holdNewSeats,
      releaseSpecificSeats,
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
      // 전화번호에서 특수문자 제거 (Toss Payments 요구사항)
      const cleanPhoneNumber = (phone) => {
        if (!phone) return "01000000000";
        // 숫자만 남기고 모든 특수문자 제거
        const cleaned = phone.replace(/[^0-9]/g, "");
        // 올바른 한국 휴대폰 번호 형식인지 확인
        if (cleaned.length === 11 && cleaned.startsWith("010")) {
          return cleaned;
        }
        // 기본값 반환
        return "01000000000";
      };

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
        customerMobilePhone: cleanPhoneNumber(user?.phone || user?.mobile),
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

      {/* Login Selection Modal */}
      {showLoginSelection && (
        <LoginSelectionOverlay onClick={cancelLoginSelection}>
          <LoginSelectionModal onClick={(e) => e.stopPropagation()}>
            {loginModalStep === "selection" ? (
              <>
                <LoginSelectionTitle>
                  🎬 예매를 진행하시려면 로그인이 필요합니다
                </LoginSelectionTitle>
                <LoginSelectionText>
                  예매 방법을 선택해주세요. 회원 로그인 시 포인트 적립과 예매
                  내역 관리가 가능합니다.
                </LoginSelectionText>
                <LoginButtonsContainer>
                  <LoginOptionButton
                    className="member"
                    onClick={() => handleLoginSelection("member")}
                    fullWidth
                  >
                    👤 회원 로그인
                    <br />
                    <small>포인트 적립 • 예매 내역 관리</small>
                  </LoginOptionButton>
                  <LoginOptionButton
                    className="guest"
                    onClick={() => handleLoginSelection("guest")}
                    fullWidth
                  >
                    🚀 비회원 로그인
                    <br />
                    <small>간편 빠른 예매 • 임시 계정 생성</small>
                  </LoginOptionButton>
                </LoginButtonsContainer>
                <CancelButton onClick={cancelLoginSelection} fullWidth>
                  취소
                </CancelButton>
              </>
            ) : (
              <>
                <LoginSelectionTitle>🚀 비회원 로그인</LoginSelectionTitle>
                <LoginSelectionText>
                  빠른 예매를 위한 임시 계정을 만들어보세요.
                </LoginSelectionText>
                <GuestAuthForm onSubmit={handleGuestSignup}>
                  <FormRow>
                    <Input
                      label="이름"
                      type="text"
                      value={guestFormData.name}
                      onChange={(e) =>
                        handleGuestFormChange("name", e.target.value)
                      }
                      placeholder="이름을 입력하세요"
                      required
                    />
                    <Input
                      label="생년월일"
                      type="date"
                      value={guestFormData.birthdate}
                      onChange={(e) =>
                        handleGuestFormChange("birthdate", e.target.value)
                      }
                      required
                    />
                  </FormRow>

                  <Input
                    label="전화번호"
                    type="tel"
                    value={guestFormData.phone}
                    onChange={(e) =>
                      handleGuestFormChange("phone", e.target.value)
                    }
                    placeholder="010-1234-5678"
                    required
                  />

                  <EmailVerificationSection>
                    <VerificationRow>
                      <Input
                        label="이메일"
                        type="email"
                        value={guestFormData.email}
                        onChange={(e) =>
                          handleGuestFormChange("email", e.target.value)
                        }
                        placeholder="이메일을 입력하세요"
                        required
                        disabled={emailVerificationSent}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleSendEmailVerification}
                        disabled={
                          isGuestAuthLoading ||
                          emailVerificationSent ||
                          !guestFormData.email
                        }
                      >
                        {emailVerificationSent ? "전송됨" : "인증 요청"}
                      </Button>
                    </VerificationRow>

                    {emailVerificationSent && (
                      <VerificationRow style={{ marginTop: "1rem" }}>
                        <Input
                          label="인증 코드"
                          type="text"
                          value={emailVerificationCode}
                          onChange={(e) =>
                            setEmailVerificationCode(e.target.value)
                          }
                          placeholder="인증 코드를 입력하세요"
                          required
                          disabled={isEmailVerified}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleVerifyEmailCode}
                          disabled={
                            isGuestAuthLoading ||
                            isEmailVerified ||
                            !emailVerificationCode
                          }
                        >
                          {isEmailVerified ? "인증완료" : "인증하기"}
                        </Button>
                      </VerificationRow>
                    )}
                  </EmailVerificationSection>

                  <FormRow>
                    <Input
                      label="비밀번호"
                      type="password"
                      value={guestFormData.password}
                      onChange={(e) =>
                        handleGuestFormChange("password", e.target.value)
                      }
                      placeholder="비밀번호 (8자 이상)"
                      required
                    />
                    <Input
                      label="비밀번호 확인"
                      type="password"
                      value={guestFormData.repeatPassword}
                      onChange={(e) =>
                        handleGuestFormChange("repeatPassword", e.target.value)
                      }
                      placeholder="비밀번호 확인"
                      required
                    />
                  </FormRow>

                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    disabled={isGuestAuthLoading || !isEmailVerified}
                  >
                    {isGuestAuthLoading ? "처리 중..." : "비회원 로그인"}
                  </Button>
                </GuestAuthForm>

                {guestAuthError && (
                  <ErrorMessage>{guestAuthError}</ErrorMessage>
                )}
                {guestAuthSuccess && (
                  <SuccessMessage>{guestAuthSuccess}</SuccessMessage>
                )}
                <div style={{ marginTop: "1rem" }}>
                  <CancelButton
                    onClick={() => setLoginModalStep("selection")}
                    fullWidth
                  >
                    뒤로 가기
                  </CancelButton>
                </div>
              </>
            )}
          </LoginSelectionModal>
        </LoginSelectionOverlay>
      )}
    </BookingPageWrapper>
  );
};

export default BookingPage;
