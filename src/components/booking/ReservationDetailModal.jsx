import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { formatDate } from "../../utils/dateUtils";
import * as reservationService from "../../services/reservationService";

const ModalContent = styled.div`
  max-width: 500px;
  width: 100%;
`;

const DetailSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  padding: ${({ theme }) => theme.spacing[3]};
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  border-radius: ${({ theme }) => theme.borderRadius.md};

  h4 {
    margin-bottom: ${({ theme }) => theme.spacing[2]};
    color: ${({ theme }) => theme.colors.primaryLight};
    font-size: ${({ theme }) => theme.fontSizes.lg};
  }

  p {
    margin: ${({ theme }) => theme.spacing[1]} 0;
    font-size: ${({ theme }) => theme.fontSizes.sm};

    strong {
      display: inline-block;
      min-width: 100px;
      color: ${({ theme }) => theme.colors.text};
    }

    span {
      color: ${({ theme }) => theme.colors.textDark};
    }
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 500;
  background-color: ${({ status, theme }) => {
    switch (status) {
      case "COMPLETED":
        return theme.colors.success + "20";
      case "PENDING":
        return theme.colors.warning + "20";
      case "CANCELLED":
        return theme.colors.error + "20";
      default:
        return theme.colors.disabled + "20";
    }
  }};
  color: ${({ status, theme }) => {
    switch (status) {
      case "COMPLETED":
        return theme.colors.success;
      case "PENDING":
        return theme.colors.warning;
      case "CANCELLED":
        return theme.colors.error;
      default:
        return theme.colors.disabled;
    }
  }};
`;

const TicketSection = styled.div`
  border: 2px dashed ${({ theme }) => theme.colors.primaryLight};
  padding: ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;

  h3 {
    margin-bottom: ${({ theme }) => theme.spacing[3]};
    font-size: ${({ theme }) => theme.fontSizes.xl};
  }

  .ticket-info {
    text-align: left;
    margin: ${({ theme }) => theme.spacing[3]} 0;

    p {
      margin: ${({ theme }) => theme.spacing[1]} 0;
      font-size: ${({ theme }) => theme.fontSizes.sm};
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-top: ${({ theme }) => theme.spacing[4]};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
  }
`;

const LoadingText = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textLighter};
  margin: ${({ theme }) => theme.spacing[4]} 0;
`;

const ErrorText = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.error};
  margin: ${({ theme }) => theme.spacing[4]} 0;
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const ReservationDetailModal = ({ isOpen, onClose, reservationId }) => {
  const [reservation, setReservation] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTicket, setShowTicket] = useState(false);

  useEffect(() => {
    if (isOpen && reservationId) {
      loadReservationData();
    }
  }, [isOpen, reservationId]);

  const loadReservationData = async () => {
    setLoading(true);
    setError(null);
    try {
      const reservationData = await reservationService.getReservationDetail(
        reservationId
      );
      setReservation(reservationData);
    } catch (err) {
      console.error("Failed to load reservation detail:", err);
      setError("예매 정보를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const loadTicketData = async () => {
    if (ticket) {
      setShowTicket(true);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const ticketData = await reservationService.getReservationTicket(
        reservationId
      );
      setTicket(ticketData);
      setShowTicket(true);
    } catch (err) {
      console.error("Failed to load ticket data:", err);
      setError("모바일 티켓을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!reservation) return;

    const reason = prompt("취소 사유를 입력해주세요:");
    if (!reason) return;

    try {
      await reservationService.cancelReservation({
        reservationId: reservation.reservationId,
        refundReason: reason,
      });
      alert("예매가 취소되었습니다.");
      onClose();
    } catch (err) {
      console.error("Failed to cancel reservation:", err);
      alert("예매 취소에 실패했습니다.");
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "COMPLETED":
        return "결제완료";
      case "PENDING":
        return "결제대기";
      case "CANCELLED":
        return "예매취소";
      default:
        return status;
    }
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case "CARD":
        return "카드결제";
      case "CASH":
        return "현금결제";
      case "POINT":
        return "포인트결제";
      default:
        return method;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        {loading && <LoadingText>정보를 불러오는 중...</LoadingText>}
        {error && <ErrorText>{error}</ErrorText>}

        {!loading && !error && reservation && !showTicket && (
          <>
            <h2 style={{ marginBottom: "1.5rem", textAlign: "center" }}>
              예매 상세 정보
            </h2>

            <DetailSection>
              <h4>영화 정보</h4>
              <p>
                <strong>영화:</strong> <span>{reservation.movieTitle}</span>
              </p>
              <p>
                <strong>관람등급:</strong>{" "}
                <span>{reservation.movieRating}</span>
              </p>
              <p>
                <strong>상영시간:</strong>{" "}
                <span>
                  {formatDate(reservation.screeningTime)} ~{" "}
                  {formatDate(reservation.screeningEndTime)}
                </span>
              </p>
              <p>
                <strong>상영관:</strong>{" "}
                <span>{reservation.screeningRoomName}</span>
              </p>
              <p>
                <strong>좌석:</strong>{" "}
                <span>
                  {Array.isArray(reservation.seatNumbers)
                    ? reservation.seatNumbers.join(", ")
                    : reservation.seatNumbers}
                </span>
              </p>
            </DetailSection>

            <DetailSection>
              <h4>예매 정보</h4>
              <p>
                <strong>예매번호:</strong>{" "}
                <span>{reservation.reservationId}</span>
              </p>
              <p>
                <strong>예매일:</strong>{" "}
                <span>{formatDate(reservation.reservationDate)}</span>
              </p>
              <p>
                <strong>예매상태:</strong>{" "}
                <StatusBadge status={reservation.reservationStatus}>
                  {getStatusText(reservation.reservationStatus)}
                </StatusBadge>
              </p>
              <p>
                <strong>결제상태:</strong>{" "}
                <StatusBadge status={reservation.paymentStatus}>
                  {getStatusText(reservation.paymentStatus)}
                </StatusBadge>
              </p>
            </DetailSection>

            <DetailSection>
              <h4>결제 정보</h4>
              <p>
                <strong>총 금액:</strong>{" "}
                <span>{reservation.totalAmount?.toLocaleString()}원</span>
              </p>
              {reservation.usedPoints > 0 && (
                <p>
                  <strong>사용 포인트:</strong>{" "}
                  <span>{reservation.usedPoints?.toLocaleString()}P</span>
                </p>
              )}
              <p>
                <strong>결제 금액:</strong>{" "}
                <span>{reservation.finalAmount?.toLocaleString()}원</span>
              </p>
              <p>
                <strong>결제 방법:</strong>{" "}
                <span>{getPaymentMethodText(reservation.paymentMethod)}</span>
              </p>
              {reservation.paymentCompletedAt && (
                <p>
                  <strong>결제 완료:</strong>{" "}
                  <span>{formatDate(reservation.paymentCompletedAt)}</span>
                </p>
              )}
            </DetailSection>

            <ButtonGroup>
              {reservation.reservationStatus === "COMPLETED" && (
                <Button variant="primary" onClick={loadTicketData}>
                  모바일 티켓 보기
                </Button>
              )}
              {reservation.reservationStatus === "COMPLETED" &&
                !reservation.isScreeningCompleted && (
                  <Button variant="outline" onClick={handleCancel}>
                    예매 취소
                  </Button>
                )}
              <Button variant="outline" onClick={onClose}>
                닫기
              </Button>
            </ButtonGroup>
          </>
        )}

        {!loading && !error && ticket && showTicket && (
          <>
            <TicketSection>
              <h3>🎬 모바일 티켓</h3>
              <div className="ticket-info">
                <p>
                  <strong>영화:</strong> {ticket.movieTitle}
                </p>
                <p>
                  <strong>상영시간:</strong>{" "}
                  {formatDate(ticket.screeningStartTime)} ~{" "}
                  {formatDate(ticket.screeningEndTime)}
                </p>
                <p>
                  <strong>상영관:</strong> {ticket.screeningRoom}
                </p>
                <p>
                  <strong>좌석:</strong> {ticket.seats}
                </p>
                <p>
                  <strong>인원:</strong> {ticket.peopleCount}명
                </p>
                <p>
                  <strong>예매자:</strong> {ticket.reserverName}
                </p>
                <p>
                  <strong>예매일:</strong> {formatDate(ticket.reservationDate)}
                </p>
              </div>
            </TicketSection>

            <ButtonGroup>
              <Button variant="outline" onClick={() => setShowTicket(false)}>
                상세정보로 돌아가기
              </Button>
              <Button variant="outline" onClick={onClose}>
                닫기
              </Button>
            </ButtonGroup>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ReservationDetailModal;
