// src/pages/ProfilePage.js
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, Link } from "react-router-dom"; // useNavigate, Link 추가
import useAuth from "../hooks/useAuth";
import Button from "../components/common/Button";
import { formatDate } from "../utils/dateUtils";
import * as reservationService from "../services/reservationService";

const ProfilePageWrapper = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  margin-top: ${({ theme }) => theme.spacing[6]};
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: ${({ theme }) => theme.spacing[12]};
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing[6]};
  }
`;

const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  color: ${({ theme }) => theme.colors.primaryLight};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  text-align: center; /* Center title */

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.fontSizes["3xl"]};
  }
`;

const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing[6]};

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    /* Adjust grid for better centering or layout if needed */
  }
`;

const UserInfoCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  padding: ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};

  h3 {
    font-size: ${({ theme }) => theme.fontSizes.xl};
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing[3]};
  }
  p {
    color: ${({ theme }) => theme.colors.textDark};
    margin-bottom: ${({ theme }) => theme.spacing[2]};
    font-size: ${({ theme }) => theme.fontSizes.base};
    display: flex; /* For better alignment of label and value */
    strong {
      color: ${({ theme }) => theme.colors.textLighter};
      margin-right: ${({ theme }) => theme.spacing[2]};
      min-width: 90px;
      display: inline-block;
      font-weight: 500;
    }
    span {
      word-break: break-all; /* For long emails or IDs */
    }
  }
`;

const OtherSections = styled.div`
  display: grid; /* Use grid for other sections for consistent spacing */
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing[5]};
`;

const SectionCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  padding: ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};

  h3 {
    font-size: ${({ theme }) => theme.fontSizes.lg};
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing[3]};
  }
  p {
    color: ${({ theme }) => theme.colors.textLighter};
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }
`;

const ReservationList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  margin-top: ${({ theme }) => theme.spacing[2]};
`;

const ReservationItem = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  border-left: 4px solid ${({ theme }) => theme.colors.primaryLight};

  &:last-child {
    margin-bottom: 0;
  }
`;

const ReservationInfo = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textDark};

  p {
    margin: ${({ theme }) => theme.spacing[1]} 0;

    strong {
      color: ${({ theme }) => theme.colors.text};
      font-weight: 600;
    }
  }
`;

const PaymentStatus = styled.span`
  display: inline-block;
  padding: 2px 8px;
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

// NotLoggedInMessage is removed as App.js's UserProtectedRoute handles redirection

const ProfilePage = () => {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [reservationsLoading, setReservationsLoading] = useState(false);
  const [reservationsError, setReservationsError] = useState(null);

  // Load user's reservations
  useEffect(() => {
    if (user) {
      const loadReservations = async () => {
        setReservationsLoading(true);
        setReservationsError(null);
        try {
          const userReservations = await reservationService.getMyReservations();
          setReservations(userReservations);
        } catch (error) {
          console.error("Failed to load reservations:", error);
          setReservationsError("예매 내역을 불러오는데 실패했습니다.");
        } finally {
          setReservationsLoading(false);
        }
      };
      loadReservations();
    }
  }, [user]);

  if (isLoading) {
    return (
      <ProfilePageWrapper>
        <PageTitle>마이페이지</PageTitle>
        <p>로딩 중...</p>
      </ProfilePageWrapper>
    );
  }

  if (!user) {
    return (
      <ProfilePageWrapper>
        <PageTitle>마이페이지</PageTitle>
        <p>사용자 정보를 불러올 수 없습니다. 다시 로그인해주세요.</p>
        <Button onClick={() => navigate("/login")}>로그인</Button>
      </ProfilePageWrapper>
    );
  }

  const { name, loginId, email, phone, dateOfBirth, gender } = user;

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

  return (
    <ProfilePageWrapper>
      <PageTitle>마이페이지</PageTitle>
      <ProfileGrid>
        <UserInfoCard>
          <h3>회원 정보</h3>
          {name && (
            <p>
              <strong>이름:</strong> <span>{name}</span>
            </p>
          )}
          {loginId && (
            <p>
              <strong>아이디:</strong> <span>{loginId}</span>
            </p>
          )}
          {email && (
            <p>
              <strong>이메일:</strong> <span>{email}</span>
            </p>
          )}
          {phone && (
            <p>
              <strong>전화번호:</strong> <span>{phone}</span>
            </p>
          )}
          {dateOfBirth && (
            <p>
              <strong>생년월일:</strong> <span>{formatDate(dateOfBirth)}</span>
            </p>
          )}
          {gender && (
            <p>
              <strong>성별:</strong> <span>{gender}</span>
            </p>
          )}
          <Button
            variant="outline"
            size="sm"
            style={{ marginTop: "1rem" }}
            onClick={() => alert("회원 정보 수정 기능은 준비 중입니다.")}
          >
            회원 정보 수정
          </Button>
        </UserInfoCard>

        <OtherSections>
          <SectionCard>
            <h3>예매 내역</h3>
            {reservationsLoading && <p>예매 내역을 불러오는 중...</p>}
            {reservationsError && (
              <p style={{ color: "red" }}>{reservationsError}</p>
            )}
            {!reservationsLoading &&
              !reservationsError &&
              reservations.length === 0 && <p>최근 예매 내역이 없습니다.</p>}
            {!reservationsLoading &&
              !reservationsError &&
              reservations.length > 0 && (
                <ReservationList>
                  {reservations.slice(0, 3).map((reservation) => (
                    <ReservationItem key={reservation.reservationId}>
                      <ReservationInfo>
                        <p>
                          <strong>{reservation.movieTitle}</strong>
                        </p>
                        <p>좌석: {reservation.seatNumbers.join(", ")}</p>
                        <p>
                          결제 금액:{" "}
                          {reservation.finalAmount?.toLocaleString() ||
                            reservation.totalAmount?.toLocaleString()}
                          원
                        </p>
                        <p>예매일: {formatDate(reservation.createdAt)}</p>
                        <p>
                          상태:{" "}
                          <PaymentStatus status={reservation.paymentStatus}>
                            {getStatusText(reservation.paymentStatus)}
                          </PaymentStatus>
                        </p>
                      </ReservationInfo>
                    </ReservationItem>
                  ))}
                  {reservations.length > 3 && (
                    <p
                      style={{
                        textAlign: "center",
                        marginTop: "1rem",
                        fontSize: "0.9rem",
                        color: "#666",
                      }}
                    >
                      {reservations.length - 3}개의 예매 내역이 더 있습니다.
                    </p>
                  )}
                </ReservationList>
              )}
          </SectionCard>

          <SectionCard>
            <h3>PICO 포인트</h3>
            <p>0 P (구현 예정)</p>
          </SectionCard>

          <SectionCard>
            <h3>결제 수단 관리</h3>
            <p>등록된 결제 수단이 없습니다. (구현 예정)</p>
            <Button
              variant="outline"
              size="sm"
              style={{ marginTop: "0.5rem" }}
              onClick={() => alert("결제 수단 관리 기능은 준비 중입니다.")}
            >
              카드/계좌 등록
            </Button>
          </SectionCard>
        </OtherSections>
      </ProfileGrid>
      <div style={{ marginTop: "2rem", textAlign: "center" }}>
        <Button
          variant="outline"
          onClick={() => {
            logout();
            navigate("/");
          }}
        >
          로그아웃
        </Button>
      </div>
    </ProfilePageWrapper>
  );
};

export default ProfilePage;
