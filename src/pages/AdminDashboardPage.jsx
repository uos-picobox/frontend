// src/pages/AdminDashboardPage.js
import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import {
  Routes,
  Route,
  Outlet,
  useNavigate,
  useParams,
  useLocation,
  Link,
  Navigate,
} from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import ViewItemsList from "../components/admin/ViewItemsList";
import Modal from "../components/common/Modal";
import Button from "../components/common/Button";

// Forms
import AddMovieForm from "../components/admin/AddMovieForm";
import AddActorForm from "../components/admin/AddActorForm";
import AddScreeningRoomForm from "../components/admin/AddScreeningRoomForm";
import AddScreeningScheduleForm from "../components/admin/AddScreeningScheduleForm";
import AddGenreForm from "../components/admin/AddGenreForm";
import AddRatingForm from "../components/admin/AddRatingForm";
import AddDistributorForm from "../components/admin/AddDistributorForm";
import AddTicketTypeForm from "../components/admin/AddTicketTypeForm";
import PriceSettingForm from "../components/admin/PriceSettingForm";

// Services
import * as movieService from "../services/movieService";
import * as actorService from "../services/actorService";
import * as roomService from "../services/roomService";
import * as screeningService from "../services/screeningService";
import * as genreService from "../services/genreService";
import * as ratingService from "../services/ratingService";
import * as distributorService from "../services/distributorService";
import * as ticketTypeService from "../services/ticketTypeService";
import * as priceService from "../services/priceService";

import { useData } from "../contexts/DataContext";

// Styled components
const DashboardWrapper = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  min-height: calc(100vh - 120px);
  max-width: ${({ theme }) => theme.breakpoints.xl};
  margin-left: auto;
  margin-right: auto;
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing[6]};
  }
`;
const DashboardTitleGlobal = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["3xl"]};
  color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  padding-left: ${({ theme }) => theme.spacing[1]};
`;
const Layout = styled.div`
  display: flex;
  flex-direction: column;
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-direction: row;
    gap: ${({ theme }) => theme.spacing[6]};
  }
`;
const ContentArea = styled.main`
  flex-grow: 1;
  background-color: ${({ theme }) => theme.colors.surfaceDarker};
  padding: ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
`;
const LoadingErrorDisplay = styled.p`
  text-align: center;
  padding: ${({ theme }) => theme.spacing[4]};
  color: ${({ theme, $isError }) =>
    $isError ? theme.colors.error : theme.colors.textLighter};
  font-size: ${({ theme }) => theme.fontSizes.lg};
`;
const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  padding-bottom: ${({ theme }) => theme.spacing[2]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  text-align: center;
`;
const ContentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  padding-bottom: ${({ theme }) => theme.spacing[3]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  h2 {
    font-size: ${({ theme }) => theme.fontSizes["xl"]};
    color: ${({ theme }) => theme.colors.text};
    margin: 0;
    text-align: left;
    border-bottom: none;
    padding-bottom: 0;
  }
`;
const ErrorDetailsPre = styled.pre`
  /* ... */
`;
const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  isSubmitting,
  showForceOption = false,
  forceDelete,
  setForceDelete,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="삭제 확인"
    footerActions={
      <>
        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
          취소
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={isSubmitting}>
          {isSubmitting ? "삭제 중..." : "삭제"}
        </Button>
      </>
    }
  >
    <p>
      정말로 <strong>{itemName || "선택한 항목"}</strong>을(를)
      삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
    </p>
    {showForceOption && (
      <div style={{ marginTop: "1rem", display: "flex", alignItems: "center" }}>
        <input
          type="checkbox"
          id="forceDeleteCheckbox"
          checked={forceDelete}
          onChange={(e) => setForceDelete(e.target.checked)}
          style={{ marginRight: "0.5rem", width: "auto", height: "auto" }}
        />
        <label
          htmlFor="forceDeleteCheckbox"
          style={{ fontSize: "0.875rem", color: "var(--text-lighter-color)" }}
        >
          강제 삭제
        </label>
      </div>
    )}
  </Modal>
);

// --- CRUD Wrapper Component (Generic) ---
const CrudManager = ({
  entityType,
  title,
  idKey,
  titleKey,
  detailKey = "id",
  GetAllFunc,
  GetByIdFunc,
  AddFunc,
  AddWithImageFunc,
  UpdateFunc,
  UpdateWithImageFunc,
  DeleteFunc,
  FormComponent,
  formProps = {},
  additionalFetch = null,
  forceDeleteSupported = false,
  isPriceCrud = false,
}) => {
  const navigate = useNavigate();
  const {
    id: paramIdFromUrl,
    roomId: paramRoomIdFromUrl,
    ticketTypeId: paramTicketTypeIdFromUrl,
  } = useParams();
  const location = useLocation();

  // For prices, the "main" ID for the list is the roomId from the URL of RoomPriceManager
  // For editing a specific price, we use paramRoomIdForPriceEdit and paramTicketTypeIdForPriceEdit from its own edit URL
  const currentContextRoomId = isPriceCrud ? paramRoomIdFromUrl : null; // This is the roomId from /admin/prices/room/:roomId

  const isEditMode =
    location.pathname.includes("/edit/") &&
    (paramIdFromUrl ||
      (isPriceCrud && paramRoomIdFromUrl && paramTicketTypeIdFromUrl)); // paramTicketTypeIdFromUrl for price edit
  const isAddMode = location.pathname.endsWith("/add");

  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formOpError, setFormOpError] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [forceDeleteFlag, setForceDeleteFlag] = useState(false);
  const [additionalData, setAdditionalData] = useState({});

  const fetchData = useCallback(async () => {
    if (!GetAllFunc) {
      setItems([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await GetAllFunc(
        isPriceCrud ? currentContextRoomId : undefined
      ); // Pass roomId for price list
      setItems(Array.isArray(data) ? data : data ? [data] : []);
      if (additionalFetch) {
        const ad = await additionalFetch();
        setAdditionalData(ad || {});
      }
    } catch (err) {
      setError(`${title} 목록 로딩 실패: ${err.message}`);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [GetAllFunc, title, additionalFetch, isPriceCrud, currentContextRoomId]);

  useEffect(() => {
    if (isPriceCrud && !currentContextRoomId && !isAddMode && !isEditMode) {
      // If it's price crud list view but no roomId in URL (e.g. direct nav to /admin/prices/general-list)
      // then don't fetch, or redirect, or show message. For now, fetchData handles !GetAllFunc or awaits roomId.
      return;
    }
    fetchData();
  }, [fetchData, isPriceCrud, currentContextRoomId, isAddMode, isEditMode]);

  useEffect(() => {
    if (isEditMode && GetByIdFunc) {
      setIsLoading(true);
      setEditingItem(null);
      if (isPriceCrud && paramRoomIdFromUrl && paramTicketTypeIdFromUrl) {
        // Editing a specific price
        GetByIdFunc(paramRoomIdFromUrl, paramTicketTypeIdFromUrl)
          .then((data) => {
            setEditingItem(data);
            setIsLoading(false);
          })
          .catch((err) => {
            setError(`수정할 ${title} 정보 로딩 실패: ${err.message}`);
            setIsLoading(false);
          });
      } else if (paramIdFromUrl && !isPriceCrud) {
        // Editing other entities
        GetByIdFunc(paramIdFromUrl)
          .then((data) => {
            setEditingItem(data);
            setIsLoading(false);
          })
          .catch((err) => {
            setError(`수정할 ${title} 정보 로딩 실패: ${err.message}`);
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    } else {
      setEditingItem(null);
    }
  }, [
    paramIdFromUrl,
    paramRoomIdFromUrl,
    paramTicketTypeIdFromUrl,
    isEditMode,
    GetByIdFunc,
    title,
    entityType,
    isPriceCrud,
  ]);

  const handleFormSubmit = async (submitData, hasNewImage = false) => {
    setFormSubmitting(true);
    setFormOpError(null);
    try {
      let itemIdToUpdate = editingItem
        ? editingItem[idKey] || paramIdFromUrl
        : null;
      // For price settings, submitData contains roomId, ticketTypeId, price.
      // The SetPriceFunc in formProps will be called.
      if (isPriceCrud) {
        if (formProps.SetPriceFunc) {
          await formProps.SetPriceFunc(submitData);
        } else {
          throw new Error("SetPriceFunc not provided for price entity.");
        }
      } else if (isEditMode && editingItem) {
        if (
          (entityType === "movies" || entityType === "actors") &&
          hasNewImage &&
          UpdateWithImageFunc
        ) {
          await UpdateWithImageFunc(itemIdToUpdate, submitData);
        } else if (UpdateFunc) {
          await UpdateFunc(itemIdToUpdate, submitData);
        } else {
          throw new Error("Update function not provided.");
        }
      } else {
        // Add mode for non-price entities
        if (
          (entityType === "movies" || entityType === "actors") &&
          hasNewImage &&
          AddWithImageFunc
        ) {
          await AddWithImageFunc(submitData);
        } else if (AddFunc) {
          await AddFunc(submitData);
        } else {
          throw new Error("Create function not provided.");
        }
      }
      alert(
        `${title} 정보가 성공적으로 ${
          isEditMode ? "업데이트/설정되었습니다" : "추가되었습니다"
        }.`
      );
      const navigateToPath = isPriceCrud
        ? `/admin/prices/room/${
            submitData.roomId || paramRoomIdFromUrl || currentContextRoomId
          }`
        : `/admin/${entityType}`;
      navigate(navigateToPath);
      fetchData();
    } catch (err) {
      const errorMessage = err.details
        ? `저장 실패: ${err.message}. 상세: ${err.details}`
        : `저장 실패: ${err.message || "서버 오류"}`;
      setFormOpError(errorMessage);
      throw err;
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteRequest = (item) => {
    setItemToDelete(item);
    setForceDeleteFlag(false);
    setIsModalOpen(true);
  };
  const confirmDelete = async () => {
    /* ... (이전과 동일, DeleteFunc 호출 부분만 확인) ... */
    if (!itemToDelete || !DeleteFunc) return;
    setFormSubmitting(true);
    setFormOpError(null);
    try {
      const itemIdentifierForDisplay =
        itemToDelete[titleKey] ||
        (isPriceCrud
          ? `${itemToDelete.roomName}-${itemToDelete.ticketTypeName}`
          : itemToDelete[idKey] || "항목");
      if (isPriceCrud) {
        await DeleteFunc(itemToDelete.roomId, itemToDelete.ticketTypeId);
      } else {
        await DeleteFunc(
          itemToDelete[idKey],
          forceDeleteSupported ? forceDeleteFlag : undefined
        );
      }
      alert(`${itemIdentifierForDisplay} 삭제 완료.`);
      fetchData();
    } catch (err) {
      alert("삭제 실패: " + (err.message || err.details || "서버 오류"));
    } finally {
      setIsModalOpen(false);
      setItemToDelete(null);
      setFormSubmitting(false);
    }
  };

  if (isAddMode || (isEditMode && (editingItem || (isLoading && !error)))) {
    if (isLoading && isEditMode && !editingItem)
      return <LoadingErrorDisplay>수정 데이터 로딩 중...</LoadingErrorDisplay>;
    if (error && isEditMode && !editingItem)
      return <LoadingErrorDisplay $isError>{error}</LoadingErrorDisplay>;

    let initialDataForFormProp = {};
    if (editingItem) {
      const propNameSuffix =
        entityType === "ticketTypes"
          ? "TicketTypeData"
          : entityType === "prices"
          ? "PriceData"
          : entityType.charAt(0).toUpperCase() +
            entityType.slice(1).replace(/s$/, "") +
            "Data";
      initialDataForFormProp[`initial${propNameSuffix}`] = editingItem;
    }

    const combinedFormProps = {
      ...formProps,
      ...additionalData,
      onSubmit: handleFormSubmit,
      ...initialDataForFormProp,
      isLoading: formSubmitting,
    };
    if (formOpError) combinedFormProps.submissionError = formOpError;
    // 가격 정책 추가 시 현재 roomId를 form에 전달
    if (isPriceCrud && isAddMode && currentContextRoomId) {
      // paramRoomIdFromUrl -> currentContextRoomId
      combinedFormProps.currentRoomId = parseInt(currentContextRoomId);
    }

    return <FormComponent {...combinedFormProps} />;
  }

  return (
    /* ... ViewItemsList 렌더링 ... */
    <>
      <ViewItemsList
        title={`${title} 관리`}
        items={items}
        renderItem={(item) => (
          <>
            <strong>
              {item[titleKey] ||
                item.title ||
                (isPriceCrud ? item.roomName : `ID: ${item[idKey]}`)}
            </strong>
            {isPriceCrud && item.ticketTypeName && (
              <span className="detail">
                {item.ticketTypeName}: {item.price?.toLocaleString()}원
              </span>
            )}
            {!isPriceCrud && detailKey && item[detailKey] !== undefined && (
              <span className="detail">{String(item[detailKey])}</span>
            )}
            {entityType === "schedules" && item.movie && item.screeningRoom && (
              <span className="detail">
                {item.movie.title} - {item.screeningRoom.roomName} @{" "}
                {item.screeningDate} {item.screeningTime?.substring(11, 16)}{" "}
                (ID: {item.screeningId})
              </span>
            )}
            {!isPriceCrud && (
              <span className="detail" style={{ opacity: 0.6 }}>
                (ID: {item[idKey] || "N/A"})
              </span>
            )}
            {isPriceCrud && (
              <span className="detail" style={{ opacity: 0.6 }}>
                (상영관ID: {item.roomId}, 티켓ID: {item.ticketTypeId})
              </span>
            )}
          </>
        )}
        onEdit={(item) =>
          navigate(
            isPriceCrud
              ? `/admin/prices/room/${item.roomId}/edit/${item.ticketTypeId}`
              : `/admin/${entityType}/edit/${item[idKey]}`
          )
        }
        onDelete={handleDeleteRequest}
        onAddItem={() =>
          navigate(
            isPriceCrud
              ? `/admin/prices/room/${currentContextRoomId}/add`
              : `/admin/${entityType}/add`
          )
        }
        addItemLabel={`새 ${title} ${isPriceCrud ? "정책" : ""} 추가`}
        isLoading={isLoading}
        error={error}
      />
      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        itemName={
          itemToDelete?.[titleKey] ||
          (isPriceCrud && itemToDelete
            ? `${itemToDelete.roomName}-${itemToDelete.ticketTypeName}`
            : "항목")
        }
        isSubmitting={formSubmitting}
        showForceOption={forceDeleteSupported}
        forceDelete={forceDeleteFlag}
        setForceDelete={setForceDeleteFlag}
      />
      {formOpError && (
        <ErrorDetailsPre>오류 발생: {formOpError}</ErrorDetailsPre>
      )}
    </>
  );
};

// --- Price Settings: Step 1 - Room Selector ---
const PriceRoomSelector = ({ rooms, isLoading, error }) => {
  const navigate = useNavigate();
  if (isLoading)
    return <LoadingErrorDisplay>상영관 목록 로딩 중...</LoadingErrorDisplay>;
  if (error) return <LoadingErrorDisplay $isError>{error}</LoadingErrorDisplay>;
  if (!rooms || rooms.length === 0)
    return (
      <SectionTitle
        style={{
          textAlign: "left",
          borderBottom: "none",
          paddingBottom: 0,
          marginBottom: "1rem",
        }}
      >
        등록된 상영관이 없습니다. 먼저 상영관을 추가해주세요.
      </SectionTitle>
    );

  return (
    <div>
      <ContentHeader>
        <h2>가격 정책을 설정할 상영관 선택</h2>
      </ContentHeader>
      <ViewItemsList
        items={rooms}
        renderItem={(room) => (
          <Link
            to={`/admin/prices/room/${room.roomId}`}
            style={{
              textDecoration: "none",
              color: "inherit",
              display: "block",
              padding: "0.5rem 0",
              width: "100%",
            }}
          >
            <strong>{room.roomName}</strong>
            <span className="detail">
              {" "}
              (ID: {room.roomId}, 수용인원: {room.capacity})
            </span>
          </Link>
        )}
      />
    </div>
  );
};

// --- Price Settings: Step 2 - Manager for a specific room ---
const RoomPriceManager = () => {
  const { roomId } = useParams(); // 현재 선택된 상영관 ID
  const navigate = useNavigate();
  const { ticketTypes, isLoadingData: isLoadingTicketTypes } = useData();
  const [currentRoom, setCurrentRoom] = useState(null);
  const [isLoadingRoom, setIsLoadingRoom] = useState(true);

  useEffect(() => {
    if (roomId) {
      setIsLoadingRoom(true);
      roomService
        .getScreeningRoomById_Admin(roomId) // 관리자용 함수 사용
        .then((data) => {
          setCurrentRoom(data);
          setIsLoadingRoom(false);
        })
        .catch((err) => {
          console.error("Error fetching current room for price manager:", err);
          setCurrentRoom(null);
          setIsLoadingRoom(false);
        });
    }
  }, [roomId]);

  if (!roomId) return <Navigate to="/admin/prices" replace />;
  if (isLoadingTicketTypes || isLoadingRoom)
    return (
      <LoadingErrorDisplay>
        상영관 또는 티켓 정보 로딩 중...
      </LoadingErrorDisplay>
    );
  if (!currentRoom)
    return (
      <SectionTitle>
        상영관 정보를 찾을 수 없습니다. (ID: {roomId})
      </SectionTitle>
    );

  return (
    <div>
      <ContentHeader>
        <h2>{currentRoom.roomName} - 가격 정책 관리</h2>
        <Button
          onClick={() => navigate("/admin/prices")}
          variant="text"
          size="sm"
          style={{ padding: 0 }}
        >
          &larr; 상영관 목록으로
        </Button>
      </ContentHeader>
      <CrudManager
        entityType="prices"
        title={`${currentRoom.roomName} 가격`}
        idKey="compositeId"
        titleKey="ticketTypeName"
        detailKey="price"
        GetAllFunc={() => priceService.getPriceSettingsByRoom_Admin(roomId)} // 현재 roomId에 대한 가격 정책 목록
        GetByIdFunc={priceService.getSpecificPriceSetting} // (roomId, ticketTypeId) 받음
        // Add/Update는 SetPriceFunc로 통일
        // AddFunc, UpdateFunc는 사용 안 함
        formProps={{
          SetPriceFunc: priceService.setPrice, // setPrice 함수를 formProps로 전달
          currentRoomId: parseInt(roomId), // PriceSettingForm에 현재 roomId 전달
          screeningRooms: [currentRoom], // PriceSettingForm의 상영관 선택을 현재 상영관으로 제한
        }}
        DeleteFunc={priceService.deletePriceSetting} // (roomId, ticketTypeId) 받음
        FormComponent={PriceSettingForm}
        additionalFetch={() => Promise.resolve({ ticketTypes: ticketTypes })} // 전역 ticketTypes 전달
        isPriceCrud={true}
      />
    </div>
  );
};

const AdminDashboardPage = () => {
  const { isLoadingData: isLoadingGlobal } = useData();
  const [commonFormData, setCommonFormData] = useState({
    moviesForForm: [],
    roomsForForm: [],
    actorsForSelect: [],
  });
  const [isCommonFormLoading, setIsCommonFormLoading] = useState(true);

  const fetchCommonDataForForms = useCallback(async () => {
    setIsCommonFormLoading(true);
    try {
      // 병렬로 데이터 가져오기
      const [moviesData, roomsData, actorsData] = await Promise.all([
        movieService.getAllMovies(), // 관리자용 전체 영화 목록
        roomService.getAllScreeningRooms(), // 관리자용 전체 상영관 목록
        actorService.getAllActors(), // 관리자용 전체 배우 목록
      ]);
      setCommonFormData({
        moviesForForm: moviesData || [],
        roomsForForm: roomsData || [],
        actorsForSelect: actorsData || [],
      });
    } catch (error) {
      console.error("Error fetching common data for admin forms:", error);
    } finally {
      setIsCommonFormLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommonDataForForms();
  }, [fetchCommonDataForForms]);

  if (isLoadingGlobal || isCommonFormLoading) {
    return (
      <DashboardWrapper>
        <DashboardTitleGlobal>관리자 대시보드</DashboardTitleGlobal>
        <LoadingErrorDisplay>관리자 데이터 로딩 중...</LoadingErrorDisplay>
      </DashboardWrapper>
    );
  }

  return (
    <DashboardWrapper>
      <DashboardTitleGlobal>관리자 대시보드</DashboardTitleGlobal>
      <Layout>
        <AdminSidebar />
        <ContentArea>
          <Routes>
            <Route index element={<Navigate to="movies" replace />} />

            <Route
              path="movies/*"
              element={
                <CrudManager
                  entityType="movies"
                  title="영화"
                  idKey="movieId"
                  titleKey="title"
                  detailKey="director"
                  GetAllFunc={movieService.getAllMovies}
                  GetByIdFunc={movieService.getMovieById_Admin}
                  AddFunc={movieService.addMovie}
                  AddWithImageFunc={movieService.addMovieWithImage}
                  UpdateFunc={movieService.updateMovie}
                  UpdateWithImageFunc={movieService.updateMovieWithImage}
                  DeleteFunc={movieService.deleteMovie}
                  FormComponent={AddMovieForm}
                  additionalFetch={() =>
                    Promise.resolve({
                      actorsForSelect: commonFormData.actorsForSelect,
                    })
                  }
                />
              }
            />

            <Route
              path="actors/*"
              element={
                <CrudManager
                  entityType="actors"
                  title="배우"
                  idKey="actorId"
                  titleKey="name"
                  detailKey="birthDate"
                  GetAllFunc={actorService.getAllActors}
                  GetByIdFunc={actorService.getActorById}
                  AddFunc={actorService.addActor}
                  AddWithImageFunc={actorService.addActorWithImage}
                  UpdateFunc={actorService.updateActor}
                  UpdateWithImageFunc={actorService.updateActorWithImage}
                  DeleteFunc={actorService.deleteActor}
                  FormComponent={AddActorForm}
                  forceDeleteSupported={true}
                />
              }
            />

            <Route
              path="genres/*"
              element={
                <CrudManager
                  entityType="genres"
                  title="장르"
                  idKey="genreId"
                  titleKey="genreName"
                  GetAllFunc={genreService.getAllGenres}
                  GetByIdFunc={genreService.getGenreById}
                  AddFunc={genreService.addGenre}
                  UpdateFunc={genreService.updateGenre}
                  DeleteFunc={genreService.deleteGenre}
                  FormComponent={AddGenreForm}
                  forceDeleteSupported={true}
                />
              }
            />

            <Route
              path="ratings/*"
              element={
                <CrudManager
                  entityType="ratings"
                  title="등급"
                  idKey="ratingId"
                  titleKey="ratingName"
                  detailKey="description"
                  GetAllFunc={ratingService.getAllRatings}
                  GetByIdFunc={ratingService.getRatingById}
                  AddFunc={ratingService.addRating}
                  UpdateFunc={ratingService.updateRating}
                  DeleteFunc={ratingService.deleteRating}
                  FormComponent={AddRatingForm}
                />
              }
            />

            <Route
              path="distributors/*"
              element={
                <CrudManager
                  entityType="distributors"
                  title="배급사"
                  idKey="distributorId"
                  titleKey="name"
                  detailKey="phone"
                  GetAllFunc={distributorService.getAllDistributors}
                  GetByIdFunc={distributorService.getDistributorById}
                  AddFunc={distributorService.addDistributor}
                  UpdateFunc={distributorService.updateDistributor}
                  DeleteFunc={distributorService.deleteDistributor}
                  FormComponent={AddDistributorForm}
                />
              }
            />

            <Route
              path="rooms/*"
              element={
                <CrudManager
                  entityType="rooms"
                  title="상영관"
                  idKey="roomId"
                  titleKey="roomName"
                  detailKey="capacity"
                  GetAllFunc={roomService.getAllScreeningRooms}
                  GetByIdFunc={roomService.getScreeningRoomById_Admin}
                  AddFunc={roomService.addScreeningRoom}
                  UpdateFunc={roomService.updateScreeningRoom}
                  DeleteFunc={roomService.deleteScreeningRoom}
                  FormComponent={AddScreeningRoomForm}
                />
              }
            />

            <Route
              path="schedules/*"
              element={
                <CrudManager
                  entityType="schedules"
                  title="상영스케줄"
                  idKey="screeningId"
                  titleKey="movie.title"
                  GetAllFunc={screeningService.getAllScreenings}
                  GetByIdFunc={screeningService.getScreeningById}
                  AddFunc={screeningService.addScreening}
                  UpdateFunc={screeningService.updateScreening}
                  DeleteFunc={screeningService.deleteScreening}
                  FormComponent={AddScreeningScheduleForm}
                  additionalFetch={() =>
                    Promise.resolve({
                      movies: commonFormData.moviesForForm,
                      screeningRooms: commonFormData.roomsForForm,
                    })
                  }
                />
              }
            />

            <Route
              path="ticket-types/*"
              element={
                <CrudManager
                  entityType="ticketTypes"
                  title="티켓 종류"
                  idKey="ticketTypeId"
                  titleKey="typeName"
                  detailKey="description"
                  GetAllFunc={ticketTypeService.getAllTicketTypes}
                  GetByIdFunc={ticketTypeService.getTicketTypeById}
                  AddFunc={ticketTypeService.addTicketType}
                  UpdateFunc={ticketTypeService.updateTicketType}
                  DeleteFunc={ticketTypeService.deleteTicketType}
                  FormComponent={AddTicketTypeForm}
                />
              }
            />

            {/* Price Settings New Routing */}
            <Route
              path="prices"
              element={
                <PriceRoomSelector
                  rooms={commonFormData.roomsForForm}
                  isLoading={isCommonFormLoading}
                />
              }
            />
            <Route
              path="prices/room/:roomId/*"
              element={<RoomPriceManager />}
            />

            <Route
              path="*"
              element={
                <SectionTitle>
                  선택한 관리 섹션을 찾을 수 없습니다.
                </SectionTitle>
              }
            />
          </Routes>
        </ContentArea>
      </Layout>
    </DashboardWrapper>
  );
};

export default AdminDashboardPage;
