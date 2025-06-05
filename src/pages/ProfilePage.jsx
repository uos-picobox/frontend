// src/pages/ProfilePage.js
import React from "react";
import styled from "styled-components";
import { useNavigate, Link } from "react-router-dom"; // useNavigate, Link 추가
import useAuth from "../hooks/useAuth";
import Button from "../components/common/Button";
import { formatDate } from "../utils/dateUtils";

const ProfilePageWrapper = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  margin-top: ${({ theme }) => theme.spacing[6]};
  max-width: 900px; /* Added max-width for better layout on large screens */
  margin-left: auto;
  margin-right: auto;

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

// NotLoggedInMessage is removed as App.js's UserProtectedRoute handles redirection

const ProfilePage = () => {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate(); // For programmatic navigation

  // UserProtectedRoute in App.js handles the !user case by redirecting.
  // So, if this component renders, 'user' should exist.
  // isLoading check is still good.

  if (isLoading) {
    return (
      <ProfilePageWrapper>
        <PageTitle>마이페이지</PageTitle>
        <p>로딩 중...</p>
      </ProfilePageWrapper>
    );
  }

  // This check might be redundant if UserProtectedRoute works correctly.
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
            <p>최근 예매 내역이 없습니다. (구현 예정)</p>
            {/* Example Link: <Button as={Link} to="/my-bookings" variant="outline" size="sm">전체 보기</Button> */}
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
          variant="danger"
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
