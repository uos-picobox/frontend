import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import Button from "../common/Button";
import Input from "../common/Input";
import Modal from "../common/Modal";
import * as adminCustomerService from "../../services/adminCustomerService";
import * as adminReviewService from "../../services/adminReviewService";

const Container = styled.div`
  background-color: ${({ theme }) => theme.colors.surfaceDarker};
  padding: ${({ theme }) => theme.spacing[6]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const Controls = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  align-items: center;
  flex-wrap: wrap;
`;

const Select = styled.select`
  padding: ${({ theme }) => theme.spacing[2]};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const SearchSection = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  flex-wrap: wrap;
  align-items: end;
`;

const SearchGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textLighter};
`;

const CustomerCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
  ${(props) =>
    !props.$isActive &&
    `
    opacity: 0.7;
    border-left: 4px solid ${props.theme.colors.error};
  `}
`;

const CustomerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing[3]};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const CustomerInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const CustomerName = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const CustomerDetail = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textLighter};
  margin: 0;
`;

const StatusBadge = styled.span`
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[2]};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 600;
  ${(props) =>
    props.$isActive
      ? `
    background-color: ${props.theme.colors.success}22;
    color: ${props.theme.colors.success};
  `
      : `
    background-color: ${props.theme.colors.error}22;
    color: ${props.theme.colors.error};
  `}
`;

const CustomerStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${({ theme }) => theme.spacing[3]};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textLighter};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  flex-wrap: wrap;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing[8]};
  color: ${({ theme }) => theme.colors.textLighter};
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing[8]};
  color: ${({ theme }) => theme.colors.error};
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: ${({ theme }) => theme.spacing[3]};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  resize: vertical;
  min-height: 100px;
  margin-top: ${({ theme }) => theme.spacing[2]};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.secondary};
  }
`;

const AdminCustomersList = () => {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("registeredAt");
  const [filterActive, setFilterActive] = useState(null);

  // 검색 관련 상태
  const [searchType, setSearchType] = useState("name");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // 상태 변경 모달 관련
  const [customerToUpdate, setCustomerToUpdate] = useState(null);
  const [statusReason, setStatusReason] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminCustomerService.getAllCustomers(
        sortBy,
        filterActive
      );
      setCustomers(data || []);
    } catch (err) {
      setError("고객 목록을 불러오는데 실패했습니다: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [sortBy, filterActive]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchCustomers();
      return;
    }

    setIsSearching(true);
    setError(null);
    try {
      let data = [];
      switch (searchType) {
        case "name":
          data = await adminCustomerService.searchCustomersByName(searchTerm);
          break;
        case "loginId":
          data = await adminCustomerService.searchCustomersByLoginId(
            searchTerm
          );
          break;
        case "email":
          data = await adminCustomerService.searchCustomersByEmail(searchTerm);
          break;
        default:
          break;
      }
      setCustomers(data || []);
    } catch (err) {
      setError("검색에 실패했습니다: " + err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    if (searchTerm.trim()) {
      setSearchTerm("");
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilterActive(newFilter);
    if (searchTerm.trim()) {
      setSearchTerm("");
    }
  };

  const handleStatusUpdate = async () => {
    if (!customerToUpdate) return;

    setIsUpdatingStatus(true);
    try {
      const newStatus = !customerToUpdate.isActive;
      await adminCustomerService.updateCustomerStatus(
        customerToUpdate.customerId,
        {
          isActive: newStatus,
          reason:
            statusReason.trim() ||
            (newStatus ? "계정 활성화" : "계정 비활성화"),
        }
      );

      alert(
        `고객 상태가 성공적으로 ${newStatus ? "활성화" : "비활성화"}되었습니다.`
      );
      fetchCustomers();
    } catch (err) {
      alert("상태 변경에 실패했습니다: " + err.message);
    } finally {
      setIsUpdatingStatus(false);
      setCustomerToUpdate(null);
      setStatusReason("");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("ko-KR");
  };

  const formatGender = (gender) => {
    switch (gender) {
      case "MALE":
        return "남성";
      case "FEMALE":
        return "여성";
      default:
        return "미지정";
    }
  };

  if (isLoading) {
    return <LoadingMessage>고객 목록을 불러오는 중...</LoadingMessage>;
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  return (
    <Container>
      <Header>
        <Title>고객 관리 ({customers.length}명)</Title>
        <Controls>
          <Select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
          >
            <option value="registeredAt">가입일순</option>
            <option value="name">이름순</option>
            <option value="lastLoginAt">최근 로그인순</option>
            <option value="points">포인트순</option>
          </Select>
          <Select
            value={filterActive || ""}
            onChange={(e) => handleFilterChange(e.target.value || null)}
          >
            <option value="">전체</option>
            <option value="true">활성 회원</option>
            <option value="false">비활성 회원</option>
          </Select>
        </Controls>
      </Header>

      <SearchSection>
        <SearchGroup>
          <Label>검색 타입</Label>
          <Select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
          >
            <option value="name">이름</option>
            <option value="loginId">로그인 ID</option>
            <option value="email">이메일</option>
          </Select>
        </SearchGroup>
        <SearchGroup>
          <Label>검색어</Label>
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`${
              searchType === "name"
                ? "이름"
                : searchType === "loginId"
                ? "로그인 ID"
                : "이메일"
            }을 입력하세요`}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
        </SearchGroup>
        <Button
          onClick={handleSearch}
          disabled={isSearching}
          variant="secondary"
        >
          {isSearching ? "검색 중..." : "검색"}
        </Button>
        {searchTerm && (
          <Button
            onClick={() => {
              setSearchTerm("");
              fetchCustomers();
            }}
            variant="outline"
          >
            초기화
          </Button>
        )}
      </SearchSection>

      {customers.length === 0 ? (
        <LoadingMessage>등록된 고객이 없습니다.</LoadingMessage>
      ) : (
        customers.map((customer) => (
          <CustomerCard key={customer.customerId} $isActive={customer.isActive}>
            <CustomerHeader>
              <CustomerInfo>
                <CustomerName>
                  {customer.name}
                  <StatusBadge $isActive={customer.isActive}>
                    {customer.isActive ? "활성" : "비활성"}
                  </StatusBadge>
                </CustomerName>
                <CustomerDetail>ID: {customer.loginId}</CustomerDetail>
                <CustomerDetail>이메일: {customer.email}</CustomerDetail>
                <CustomerDetail>전화번호: {customer.phone}</CustomerDetail>
              </CustomerInfo>
              <ActionButtons>
                <Button
                  variant={customer.isActive ? "danger" : "success"}
                  size="sm"
                  onClick={() => setCustomerToUpdate(customer)}
                >
                  {customer.isActive ? "비활성화" : "활성화"}
                </Button>
              </ActionButtons>
            </CustomerHeader>

            <CustomerStats>
              <StatItem>
                <StatValue>{customer.points.toLocaleString()}</StatValue>
                <StatLabel>포인트</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{formatGender(customer.gender)}</StatValue>
                <StatLabel>성별</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{customer.dateOfBirth}</StatValue>
                <StatLabel>생년월일</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{formatDate(customer.registeredAt)}</StatValue>
                <StatLabel>가입일</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>
                  {customer.lastLoginAt
                    ? formatDate(customer.lastLoginAt)
                    : "없음"}
                </StatValue>
                <StatLabel>최근 로그인</StatLabel>
              </StatItem>
            </CustomerStats>
          </CustomerCard>
        ))
      )}

      <Modal
        isOpen={!!customerToUpdate}
        onClose={() => {
          setCustomerToUpdate(null);
          setStatusReason("");
        }}
        title="고객 상태 변경"
        footerActions={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setCustomerToUpdate(null);
                setStatusReason("");
              }}
              disabled={isUpdatingStatus}
            >
              취소
            </Button>
            <Button
              variant={customerToUpdate?.isActive ? "danger" : "success"}
              onClick={handleStatusUpdate}
              disabled={isUpdatingStatus}
            >
              {isUpdatingStatus
                ? "변경 중..."
                : customerToUpdate?.isActive
                ? "비활성화"
                : "활성화"}
            </Button>
          </>
        }
      >
        <p>
          <strong>{customerToUpdate?.name}</strong> 고객의 상태를{" "}
          <strong>{customerToUpdate?.isActive ? "비활성화" : "활성화"}</strong>
          하시겠습니까?
        </p>
        <Label>사유 (선택사항)</Label>
        <TextArea
          value={statusReason}
          onChange={(e) => setStatusReason(e.target.value)}
          placeholder="상태 변경 사유를 입력해주세요."
        />
      </Modal>
    </Container>
  );
};

export default AdminCustomersList;
