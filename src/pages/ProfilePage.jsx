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
  const {
    user,
    isLoading,
    logout,
    updateMyProfile,
    getMyProfile,
    sessionId,
    deleteMyAccount,
  } = useAuth();
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
    if (user && sessionId) {
      const loadUserData = async () => {
        setReservationsLoading(true);
        setReservationsError(null);

        try {
          // 실제 프로필 정보를 API에서 로드
          const profileData = await getMyProfile();

          // API 응답이 빈 문자열이거나 null인 경우 처리
          if (
            !profileData ||
            profileData === "" ||
            (typeof profileData === "string" && profileData.trim() === "")
          ) {
            throw new Error("API에서 빈 프로필 데이터를 반환했습니다.");
          }

          // 문자열 응답인 경우 JSON 파싱 시도
          let parsedProfileData = profileData;
          if (typeof profileData === "string") {
            try {
              parsedProfileData = JSON.parse(profileData);
            } catch (parseError) {
              throw new Error("API 응답을 파싱할 수 없습니다.");
            }
          }

          if (
            parsedProfileData &&
            (parsedProfileData.customerId ||
              parsedProfileData.loginId ||
              parsedProfileData.id)
          ) {
            // API 응답 구조에 따라 프로필 데이터 설정
            const normalizedProfile = {
              customerId: parsedProfileData.customerId || parsedProfileData.id,
              loginId: parsedProfileData.loginId,
              name: parsedProfileData.name,
              email: parsedProfileData.email,
              phone: parsedProfileData.phone,
              dateOfBirth: parsedProfileData.dateOfBirth,
              gender: parsedProfileData.gender,
              points: parsedProfileData.points || 0,
              registeredAt: parsedProfileData.registeredAt,
              lastLoginAt: parsedProfileData.lastLoginAt,
              isActive: parsedProfileData.isActive,
            };
            setActualUserProfile(normalizedProfile);

            // 프로필 로드 성공했으므로 에러 메시지 초기화
            setReservationsError(null);
          } else {
            setReservationsError("프로필 정보가 유효하지 않습니다.");
            setActualUserProfile(null);
          }

          // 프로필 데이터에 예약 내역이 포함되어 있을 수 있음
          if (profileData && profileData.reservations) {
            setReservations(profileData.reservations);
          } else {
            // 별도 예약 API 호출
            try {
              const userReservations =
                await reservationService.getMyReservations();
              setReservations(userReservations || []);
            } catch (reservationError) {
              console.warn("예약 내역 조회 실패:", reservationError.message);
              setReservations([]); // 실패해도 빈 배열로 설정
              if (reservationError.status === 401) {
                setReservationsError(
                  "세션이 만료되었습니다. 다시 로그인해주세요."
                );
              } else if (reservationError.status === 500) {
                // 500 오류는 로그만 남기고 에러 메시지는 표시하지 않음
                console.warn("예약 내역 서버 오류 발생, 빈 목록으로 표시");
              } else if (reservationError.status !== 404) {
                // 404가 아닌 경우만 에러 메시지 표시 (404는 예약 내역이 없는 정상 상황)
                setReservationsError("예약 내역을 불러올 수 없습니다.");
              }
            }
          }
        } catch (error) {
          if (error.status === 401) {
            setReservationsError("세션이 만료되었습니다. 다시 로그인해주세요.");
            setActualUserProfile(null);
          } else if (error.status === 404) {
            setReservationsError(
              "프로필 API가 구현되지 않았습니다. 개발자에게 문의하세요."
            );
            setActualUserProfile(null);
          } else {
            setReservationsError(
              "회원 정보를 불러오는데 실패했습니다: " + error.message
            );
            setActualUserProfile(null);
          }

          // 프로필 실패해도 예약 내역은 시도
          try {
            const userReservations =
              await reservationService.getMyReservations();
            setReservations(userReservations || []);
          } catch (reservationError) {
            console.warn(
              "예약 내역 조회 실패 (프로필 실패 후):",
              reservationError.message
            );
            setReservations([]); // 실패해도 빈 배열로 설정
            if (reservationError.status === 401) {
              // 이미 프로필에서 401 오류 처리했으므로 중복 메시지 방지
              if (!reservationsError) {
                setReservationsError(
                  "세션이 만료되었습니다. 다시 로그인해주세요."
                );
              }
            } else if (reservationError.status === 500) {
              // 500 오류는 로그만 남기고 사용자에게는 일반적인 메시지
              console.warn("예약 내역 서버 오류 발생");
              if (!reservationsError) {
                setReservationsError(
                  "일시적으로 예약 내역을 불러올 수 없습니다."
                );
              }
            } else if (reservationError.status !== 404) {
              // 404가 아닌 경우만 에러 메시지 표시
              if (!reservationsError) {
                setReservationsError("예약 내역을 불러올 수 없습니다.");
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
            const [balance, history] = await Promise.allSettled([
              pointService.getPointBalance(),
              pointService.getPointHistory(),
            ]);

            // Promise.allSettled 결과 처리
            if (balance.status === "fulfilled") {
              // API 응답 구조에 따라 포인트 값 추출
              let pointValue = 0;
              if (balance.value !== null && balance.value !== undefined) {
                if (typeof balance.value === "object") {
                  // 객체인 경우 여러 가능한 필드명 체크
                  pointValue =
                    balance.value.balance ||
                    balance.value.points ||
                    balance.value.point ||
                    balance.value.amount ||
                    balance.value.value ||
                    0;
                } else if (typeof balance.value === "number") {
                  pointValue = balance.value;
                } else {
                  pointValue = parseInt(balance.value) || 0;
                }
              }

              setPointBalance(pointValue);
            } else {
              // 포인트 잔액 조회 실패 시에도 기본값으로 설정
              console.warn("포인트 잔액 조회 실패:", balance.reason?.message);
              setPointBalance(0);
              if (balance.reason?.status === 401) {
                setPointError(
                  "세션이 만료되었습니다. 페이지를 새로고침하거나 다시 로그인해주세요."
                );
              }
              // 500, 404 등 기타 오류는 에러 메시지 표시하지 않고 기본값만 설정
            }

            if (history.status === "fulfilled") {
              setPointHistory(history.value || []);
            } else {
              // 포인트 내역 조회 실패 시에도 빈 배열로 설정
              console.warn("포인트 내역 조회 실패:", history.reason?.message);
              setPointHistory([]);
              // 잔액 조회가 실패하지 않은 경우에만 내역 오류는 무시
            }
          } catch (pointError) {
            // catch 블록은 Promise.allSettled에서는 실행되지 않지만 안전장치로 유지
            console.warn("포인트 정보 로드 중 예외 발생:", pointError);
            setPointBalance(0);
            setPointHistory([]);
            if (pointError.status === 401) {
              setPointError(
                "세션이 만료되었습니다. 페이지를 새로고침하거나 다시 로그인해주세요."
              );
            }
          } finally {
            setPointLoading(false);
          }
        } else {
          setPointError("일부 기능을 사용하려면 페이지를 새로고침해주세요.");
          setPointLoading(false);
        }

        // 결제 내역 로드
        if (sessionId) {
          setPaymentLoading(true);
          setPaymentError(null);
          try {
            const paymentData = await paymentService.getAllPaymentHistory();
            setPaymentHistory(paymentData || []);
          } catch (paymentError) {
            // 결제 내역 조회 실패해도 빈 배열로 설정하여 페이지 로딩 방해하지 않음
            console.warn("결제 내역 조회 실패:", paymentError.message);
            setPaymentHistory([]);
            if (paymentError.status === 401) {
              setPaymentError(
                "세션이 만료되었습니다. 페이지를 새로고침하거나 다시 로그인해주세요."
              );
            }
            // 500, 404 등 기타 오류는 이미 paymentService에서 처리되므로 에러 메시지 표시하지 않음
          } finally {
            setPaymentLoading(false);
          }
        } else {
          setPaymentError("일부 기능을 사용하려면 페이지를 새로고침해주세요.");
          setPaymentLoading(false);
        }
      };
      loadUserData();
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

    // 성별 값을 API에서 받은 형식에서 폼에 맞는 형식으로 변환
    const normalizeGender = (gender) => {
      if (!gender) return "";
      if (gender === "Male") return "MALE";
      if (gender === "Female") return "FEMALE";
      return gender; // 이미 MALE/FEMALE 형식인 경우 그대로 유지
    };

    setEditProfileData({
      name: currentProfile.name || "",
      email: currentProfile.email || "",
      phone: currentProfile.phone || "",
      dateOfBirth: currentProfile.dateOfBirth || "",
      gender: normalizeGender(currentProfile.gender),
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

      // 성별 값이 올바른 형식인지 확인 (디버깅용)
      console.log("프로필 업데이트 데이터:", updatedProfile);
      if (updatedProfile.gender) {
        console.log("전송될 성별 값:", updatedProfile.gender);
      }

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

  const handleDeleteAccount = async () => {
    // 2단계 확인
    const firstConfirm = window.confirm(
      "정말로 회원 탈퇴를 하시겠습니까?\n\n탈퇴 시 다음 사항이 적용됩니다:\n• 모든 개인정보가 삭제됩니다\n• 예매 내역 및 포인트가 모두 사라집니다\n• 이 작업은 되돌릴 수 없습니다"
    );

    if (!firstConfirm) return;

    const secondConfirm = window.confirm(
      "정말로 탈퇴하시겠습니까?\n\n이 작업은 즉시 실행되며 되돌릴 수 없습니다."
    );

    if (!secondConfirm) return;

    try {
      await deleteMyAccount();
      alert("회원 탈퇴가 완료되었습니다. 그동안 이용해 주셔서 감사합니다.");
      navigate("/");
    } catch (error) {
      console.error("회원 탈퇴 실패:", error);
      alert(
        "회원 탈퇴 중 오류가 발생했습니다: " +
          (error.message || "알 수 없는 오류가 발생했습니다.")
      );
    }
  };

  // 실제 프로필 데이터가 있으면 우선 사용, 없으면 AuthContext의 user 데이터 사용
  const profileToDisplay = actualUserProfile || user;

  const { name, loginId, email, phone, dateOfBirth, gender } =
    profileToDisplay || {};

  // 사용자가 없는 경우 로그인 페이지로 리다이렉트
  if (!user) {
    return (
      <ProfilePageWrapper>
        <PageTitle>마이페이지</PageTitle>
        <p>사용자 정보를 불러올 수 없습니다. 다시 로그인해주세요.</p>
        <Button onClick={() => navigate("/login")}>로그인</Button>
      </ProfilePageWrapper>
    );
  }

  // sessionId가 없는 경우 경고 표시하고 페이지는 렌더링
  if (!sessionId) {
    return (
      <ProfilePageWrapper>
        <PageTitle>마이페이지</PageTitle>
        <div
          style={{
            background: "#fff3cd",
            border: "1px solid #ffeaa7",
            borderRadius: "8px",
            padding: "1rem",
            marginBottom: "2rem",
            textAlign: "center",
          }}
        >
          <p style={{ color: "#856404", margin: 0 }}>
            ⚠️ 세션이 만료되었습니다. 페이지를 새로고침하거나 다시
            로그인해주세요.
          </p>
          <div style={{ marginTop: "1rem" }}>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
              style={{ marginRight: "0.5rem" }}
            >
              새로고침
            </Button>
            <Button
              onClick={() => navigate("/login")}
              variant="primary"
              size="sm"
            >
              다시 로그인
            </Button>
          </div>
        </div>
      </ProfilePageWrapper>
    );
  }

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

          {/* API 로드 상태 표시 */}
          {reservationsLoading && (
            <div
              style={{
                color: "#007bff",
                marginBottom: "1rem",
                fontSize: "0.9rem",
              }}
            >
              <span>🔄 프로필 정보를 불러오는 중...</span>
            </div>
          )}

          {/* API 에러 표시 */}
          {reservationsError && (
            <div
              style={{
                color: "#dc3545",
                marginBottom: "1rem",
                fontSize: "0.9rem",
              }}
            >
              <span>⚠️ {reservationsError}</span>
            </div>
          )}

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
                  <strong>성별:</strong>{" "}
                  <span>
                    {gender === "MALE" || gender === "Male"
                      ? "남성"
                      : gender === "FEMALE" || gender === "Female"
                      ? "여성"
                      : gender}
                  </span>
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
                  <option value="MALE">남성</option>
                  <option value="FEMALE">여성</option>
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
                  {typeof pointBalance === "number"
                    ? pointBalance.toLocaleString()
                    : "0"}{" "}
                  P
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
                            {typeof history.amount === "number"
                              ? history.amount
                              : "0"}
                            P
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
        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="outline"
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            로그아웃
          </Button>
          <Button
            variant="outline"
            onClick={handleDeleteAccount}
            style={{
              color: "#dc3545",
              borderColor: "#dc3545",
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#dc3545";
              e.target.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
              e.target.style.color = "#dc3545";
            }}
          >
            회원 탈퇴
          </Button>
        </div>
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
