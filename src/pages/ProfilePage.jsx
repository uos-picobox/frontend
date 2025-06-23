// src/pages/ProfilePage.js
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, Link } from "react-router-dom"; // useNavigate, Link 추가
import useAuth from "../hooks/useAuth";
import Button from "../components/common/Button";
import { formatDate } from "../utils/dateUtils";
import * as reservationService from "../services/reservationService";
import * as pointService from "../services/pointService";
import * as paymentService from "../services/paymentService";
import ReservationDetailModal from "../components/booking/ReservationDetailModal";

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
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceLight};
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }

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
  const { user, isLoading, logout, updateMyProfile, getMyProfile, sessionId } =
    useAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [reservationsLoading, setReservationsLoading] = useState(false);
  const [reservationsError, setReservationsError] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
  });
  const [profileUpdateLoading, setProfileUpdateLoading] = useState(false);
  const [profileUpdateError, setProfileUpdateError] = useState(null);
  const [actualUserProfile, setActualUserProfile] = useState(null);
  const [pointBalance, setPointBalance] = useState(0);
  const [pointHistory, setPointHistory] = useState([]);
  const [pointLoading, setPointLoading] = useState(false);
  const [pointError, setPointError] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [selectedReservationId, setSelectedReservationId] = useState(null);
  const [showReservationModal, setShowReservationModal] = useState(false);

  // Load user's reservations
  useEffect(() => {
    console.log("ProfilePage useEffect - user:", user, "sessionId:", sessionId);

    if (user) {
      const loadUserData = async () => {
        console.log(
          "ProfilePage: Starting to load user data - user:",
          !!user,
          "sessionId:",
          !!sessionId
        );
        setReservationsLoading(true);
        setReservationsError(null);

        try {
          // 실제 프로필 정보 로드 (백엔드 API에서 제공)
          const profileData = await getMyProfile();
          setActualUserProfile(profileData);

          // 프로필 데이터에 예약 내역이 포함되어 있을 수 있음
          if (profileData && profileData.reservations) {
            setReservations(profileData.reservations);
          } else {
            // 별도 예약 API 호출
            try {
              const userReservations =
                await reservationService.getMyReservations();
              setReservations(userReservations);
            } catch (reservationError) {
              console.warn("Reservations API not available:", reservationError);
              setReservations([]); // 예약 내역이 없거나 API가 없는 경우
            }
          }
        } catch (error) {
          console.error("Failed to load user data:", error);
          // 프로필 로드 실패 시 예약 내역만 시도
          if (error.status === 401) {
            setReservationsError("로그인이 필요합니다.");
          } else {
            // 프로필 API가 실패해도 예약 내역은 별도로 시도
            try {
              const userReservations =
                await reservationService.getMyReservations();
              setReservations(userReservations);
            } catch (reservationError) {
              console.warn(
                "Failed to load both profile and reservations:",
                reservationError
              );
              if (reservationError.status === 500) {
                setReservationsError(
                  "서비스가 일시적으로 이용불가합니다. 잠시 후 다시 시도해주세요."
                );
              } else if (reservationError.status === 404) {
                setReservationsError("예매 내역이 없습니다.");
                setReservations([]);
              } else {
                setReservationsError("데이터를 불러오는데 실패했습니다.");
              }
            }
          }
        } finally {
          setReservationsLoading(false);
        }

        // 포인트 정보 로드 (sessionId가 있을 때만)
        if (sessionId) {
          setPointLoading(true);
          setPointError(null);
          try {
            console.log(
              "ProfilePage: Loading point data with sessionId:",
              !!sessionId
            );
            const [balance, history] = await Promise.allSettled([
              pointService.getPointBalance(),
              pointService.getPointHistory(),
            ]);

            // Promise.allSettled 결과 처리
            if (balance.status === "fulfilled") {
              setPointBalance(balance.value || 0);
            } else {
              console.warn("Failed to load point balance:", balance.reason);
              if (balance.reason?.status === 401) {
                setPointError(
                  "세션이 만료되었습니다. 페이지를 새로고침하거나 다시 로그인해주세요."
                );
              } else {
                setPointError("포인트 잔액을 불러올 수 없습니다.");
              }
            }

            if (history.status === "fulfilled") {
              setPointHistory(history.value || []);
            } else {
              console.warn("Failed to load point history:", history.reason);
              if (
                history.reason?.status !== 401 &&
                balance.status === "fulfilled"
              ) {
                // 잔액은 성공했지만 내역만 실패한 경우
                setPointHistory([]);
                console.log(
                  "Point balance loaded successfully, but history failed"
                );
              }
            }
          } catch (pointError) {
            console.warn("Failed to load point data:", pointError);
            if (pointError.status === 401) {
              setPointError(
                "세션이 만료되었습니다. 페이지를 새로고침하거나 다시 로그인해주세요."
              );
            } else if (pointError.status === 404) {
              setPointBalance(0);
              setPointHistory([]);
            } else {
              setPointError("포인트 정보를 불러올 수 없습니다.");
            }
          } finally {
            setPointLoading(false);
          }
        } else {
          console.warn("ProfilePage: Skipping point data load - no sessionId");
          setPointError("일부 기능을 사용하려면 페이지를 새로고침해주세요.");
          setPointLoading(false);
        }

        // 결제 내역 로드 (sessionId가 있을 때만)
        if (sessionId) {
          setPaymentLoading(true);
          setPaymentError(null);
          try {
            console.log(
              "ProfilePage: Loading payment history with sessionId:",
              !!sessionId
            );
            const paymentData = await paymentService.getPaymentHistory();
            setPaymentHistory(paymentData || []);
          } catch (paymentError) {
            console.warn("Failed to load payment history:", paymentError);
            if (paymentError.status === 401) {
              setPaymentError(
                "세션이 만료되었습니다. 페이지를 새로고침하거나 다시 로그인해주세요."
              );
            } else if (paymentError.status === 404) {
              setPaymentHistory([]);
              console.log("No payment history found");
            } else {
              setPaymentError("결제 내역을 불러올 수 없습니다.");
            }
          } finally {
            setPaymentLoading(false);
          }
        } else {
          console.warn(
            "ProfilePage: Skipping payment data load - no sessionId"
          );
          setPaymentError("일부 기능을 사용하려면 페이지를 새로고침해주세요.");
          setPaymentLoading(false);
        }
      };
      loadUserData();
    } else {
      console.log(
        "ProfilePage: Skipping data load - user:",
        !!user,
        "sessionId:",
        !!sessionId
      );
    }
  }, [user, sessionId, getMyProfile]);

  if (isLoading) {
    return (
      <ProfilePageWrapper>
        <PageTitle>마이페이지</PageTitle>
        <p>로딩 중...</p>
      </ProfilePageWrapper>
    );
  }

  // Handle profile editing
  const handleEditProfile = () => {
    const currentProfile = actualUserProfile || user;
    setEditProfileData({
      name: currentProfile.name || "",
      email: currentProfile.email || "",
      phone: currentProfile.phone || "",
      dateOfBirth: currentProfile.dateOfBirth || "",
      gender: currentProfile.gender || "",
    });
    setIsEditingProfile(true);
    setProfileUpdateError(null);
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setEditProfileData({
      name: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      gender: "",
    });
    setProfileUpdateError(null);
  };

  const handleSaveProfile = async () => {
    setProfileUpdateLoading(true);
    setProfileUpdateError(null);
    try {
      const currentProfile = actualUserProfile || user;
      const updatedProfile = {
        customerId: currentProfile.id || currentProfile.customerId,
        loginId: currentProfile.loginId,
        ...editProfileData,
      };
      const result = await updateMyProfile(updatedProfile);

      // 업데이트된 프로필 데이터로 로컬 상태 업데이트
      if (result) {
        setActualUserProfile(result);
      }

      setIsEditingProfile(false);
      alert("프로필이 성공적으로 업데이트되었습니다.");
    } catch (error) {
      console.error("프로필 업데이트 실패:", error);
      setProfileUpdateError(error.message || "프로필 업데이트에 실패했습니다.");
    } finally {
      setProfileUpdateLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleReservationClick = (reservationId) => {
    setSelectedReservationId(reservationId);
    setShowReservationModal(true);
  };

  const handleCloseReservationModal = () => {
    setShowReservationModal(false);
    setSelectedReservationId(null);
  };

  // 더 관대한 조건으로 변경 - user만 있으면 일단 페이지를 보여줌
  if (!user) {
    console.log("ProfilePage: No user found, redirecting to login");
    return (
      <ProfilePageWrapper>
        <PageTitle>마이페이지</PageTitle>
        <p>사용자 정보를 불러올 수 없습니다. 다시 로그인해주세요.</p>
        <Button onClick={() => navigate("/login")}>로그인</Button>
      </ProfilePageWrapper>
    );
  }

  // sessionId가 없는 경우 경고만 표시하고 페이지는 렌더링
  if (!sessionId) {
    console.warn("ProfilePage: No sessionId found, some features may not work");
  }

  // 실제 프로필 데이터가 있으면 우선 사용, 없으면 AuthContext의 user 데이터 사용
  const profileToDisplay = actualUserProfile || user;
  const { name, loginId, email, phone, dateOfBirth, gender } = profileToDisplay;

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

      {/* 디버그 정보 (개발 환경에서만 표시) */}
      {process.env.NODE_ENV === "development" && (
        <div
          style={{
            background: "#f0f0f0",
            padding: "10px",
            margin: "10px 0",
            borderRadius: "5px",
            fontSize: "12px",
          }}
        >
          <strong>디버그 정보:</strong>
          <br />
          User: {user ? "✓" : "✗"} ({user?.loginId || "none"})<br />
          SessionId: {sessionId ? "✓" : "✗"} (
          {sessionId ? `${sessionId.substring(0, 10)}...` : "none"})<br />
          Point Error: {pointError || "none"}
          <br />
          Reservations Error: {reservationsError || "none"}
          <br />
          <button
            onClick={() => {
              console.log("=== 디버그 정보 ===");
              console.log(
                "localStorage sessionId:",
                localStorage.getItem("sessionId")
              );
              console.log(
                "localStorage userData:",
                localStorage.getItem("userData")
              );
              console.log("document.cookie:", document.cookie);
              console.log("현재 user 상태:", user);
              console.log("현재 sessionId 상태:", sessionId);
            }}
            style={{
              padding: "2px 6px",
              fontSize: "10px",
              marginTop: "5px",
              cursor: "pointer",
            }}
          >
            콘솔에 상세 정보 출력
          </button>
        </div>
      )}

      <ProfileGrid>
        <UserInfoCard>
          <h3>회원 정보</h3>
          {profileUpdateError && (
            <div
              style={{ color: "red", marginBottom: "1rem", fontSize: "0.9rem" }}
            >
              {profileUpdateError}
            </div>
          )}
          {!isEditingProfile ? (
            <>
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
                  <strong>생년월일:</strong>{" "}
                  <span>{formatDate(dateOfBirth)}</span>
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
                onClick={handleEditProfile}
              >
                회원 정보 수정
              </Button>
            </>
          ) : (
            <>
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "500",
                  }}
                >
                  이름:
                </label>
                <input
                  type="text"
                  value={editProfileData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "500",
                  }}
                >
                  이메일:
                </label>
                <input
                  type="email"
                  value={editProfileData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "500",
                  }}
                >
                  전화번호:
                </label>
                <input
                  type="tel"
                  value={editProfileData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "500",
                  }}
                >
                  생년월일:
                </label>
                <input
                  type="date"
                  value={editProfileData.dateOfBirth}
                  onChange={(e) =>
                    handleInputChange("dateOfBirth", e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "500",
                  }}
                >
                  성별:
                </label>
                <select
                  value={editProfileData.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                >
                  <option value="">선택해주세요</option>
                  <option value="Male">남성</option>
                  <option value="Female">여성</option>
                </select>
              </div>
              <div
                style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}
              >
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveProfile}
                  disabled={profileUpdateLoading}
                >
                  {profileUpdateLoading ? "저장 중..." : "저장"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                  disabled={profileUpdateLoading}
                >
                  취소
                </Button>
              </div>
            </>
          )}
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
                    <ReservationItem
                      key={reservation.reservationId}
                      onClick={() =>
                        handleReservationClick(reservation.reservationId)
                      }
                      title="클릭하여 상세 정보 보기"
                    >
                      <ReservationInfo>
                        <p>
                          <strong>{reservation.movieTitle}</strong>
                        </p>
                        <p>
                          좌석:{" "}
                          {Array.isArray(reservation.seatNumbers)
                            ? reservation.seatNumbers.join(", ")
                            : reservation.seatNumbers}
                        </p>
                        <p>
                          결제 금액:{" "}
                          {reservation.finalAmount?.toLocaleString() ||
                            reservation.totalAmount?.toLocaleString()}
                          원
                        </p>
                        <p>
                          예매일:{" "}
                          {formatDate(
                            reservation.reservationDate || reservation.createdAt
                          )}
                        </p>
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
            {pointLoading && <p>포인트 정보를 불러오는 중...</p>}
            {pointError && (
              <p style={{ color: "red", fontSize: "0.9rem" }}>{pointError}</p>
            )}
            {!pointLoading && !pointError && (
              <div>
                <p
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                    color: "#007bff",
                  }}
                >
                  {pointBalance.toLocaleString()} P
                </p>
                {pointHistory.length > 0 && (
                  <div style={{ marginTop: "1rem" }}>
                    <p
                      style={{
                        fontSize: "0.9rem",
                        color: "#666",
                        marginBottom: "0.5rem",
                      }}
                    >
                      최근 포인트 내역:
                    </p>
                    <div style={{ maxHeight: "120px", overflow: "auto" }}>
                      {pointHistory.slice(0, 3).map((history, index) => (
                        <div
                          key={index}
                          style={{
                            fontSize: "0.8rem",
                            padding: "0.25rem 0",
                            borderBottom: "1px solid #eee",
                          }}
                        >
                          <span>{history.description || "포인트 변동"}</span>
                          <span
                            style={{
                              float: "right",
                              color: history.amount > 0 ? "#28a745" : "#dc3545",
                            }}
                          >
                            {history.amount > 0 ? "+" : ""}
                            {history.amount}P
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </SectionCard>

          <SectionCard>
            <h3>결제 내역</h3>
            {paymentLoading && <p>결제 내역을 불러오는 중...</p>}
            {paymentError && (
              <p style={{ color: "red", fontSize: "0.9rem" }}>{paymentError}</p>
            )}
            {!paymentLoading &&
              !paymentError &&
              paymentHistory.length === 0 && <p>결제 내역이 없습니다.</p>}
            {!paymentLoading && !paymentError && paymentHistory.length > 0 && (
              <div style={{ maxHeight: "200px", overflow: "auto" }}>
                {paymentHistory.slice(0, 5).map((payment, index) => (
                  <div
                    key={payment.paymentId || index}
                    style={{
                      padding: "0.75rem",
                      marginBottom: "0.5rem",
                      backgroundColor: "#f8f9fa",
                      borderRadius: "4px",
                      borderLeft: "3px solid #007bff",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <span style={{ fontWeight: "600", fontSize: "0.9rem" }}>
                        {payment.orderName || `주문 #${payment.orderId}`}
                      </span>
                      <span
                        style={{
                          color: "#007bff",
                          fontWeight: "bold",
                          fontSize: "0.9rem",
                        }}
                      >
                        {payment.finalAmount?.toLocaleString() ||
                          payment.amount?.toLocaleString()}
                        원
                      </span>
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#666" }}>
                      <p style={{ margin: "0.25rem 0" }}>
                        결제수단:{" "}
                        {payment.paymentMethod === "CARD"
                          ? "카드"
                          : payment.paymentMethod === "TRANSFER"
                          ? "계좌이체"
                          : payment.paymentMethod === "MOBILE_PHONE"
                          ? "휴대폰"
                          : payment.paymentMethod || "카드"}
                      </p>
                      <p style={{ margin: "0.25rem 0" }}>
                        결제일:{" "}
                        {formatDate(payment.paymentDate || payment.createdAt)}
                      </p>
                      {payment.usedPointAmount > 0 && (
                        <p style={{ margin: "0.25rem 0", color: "#28a745" }}>
                          포인트 사용:{" "}
                          {payment.usedPointAmount?.toLocaleString()}P
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {paymentHistory.length > 5 && (
                  <p
                    style={{
                      textAlign: "center",
                      marginTop: "1rem",
                      fontSize: "0.9rem",
                      color: "#666",
                    }}
                  >
                    {paymentHistory.length - 5}개의 결제 내역이 더 있습니다.
                  </p>
                )}
              </div>
            )}
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

      <ReservationDetailModal
        isOpen={showReservationModal}
        onClose={handleCloseReservationModal}
        reservationId={selectedReservationId}
      />
    </ProfilePageWrapper>
  );
};

export default ProfilePage;
