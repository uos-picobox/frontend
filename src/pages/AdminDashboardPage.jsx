// src/pages/AdminDashboardPage.js
import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import {
  Routes,
  Route,
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

// New admin components
import AdminReviewsList from "../components/admin/AdminReviewsList";
import AddDiscountForm from "../components/admin/AddDiscountForm";
import AdminCustomersList from "../components/admin/AdminCustomersList";
import AdminDeleteAccountPage from "./AdminDeleteAccountPage";

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
import * as adminDiscountService from "../services/adminDiscountService";
import * as paymentService from "../services/paymentService";

import { useData } from "../contexts/DataContext";

// --- Styled Components ---
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
          강제 삭제 (사용 중인 항목이어도 삭제)
        </label>
      </div>
    )}
  </Modal>
);

// --- 각 엔티티별 CRUD 관리 컴포넌트 ---

// 1. 영화 관리 (MoviesAdmin)
const MoviesAdmin = ({ actorsForSelect }) => (
  <Routes>
    <Route path="/" element={<MovieList />} />
    <Route
      path="/add"
      element={
        <MovieFormWrapper
          isEditMode={false}
          actorsForSelect={actorsForSelect}
        />
      }
    />
    <Route
      path="/edit/:movieId"
      element={
        <MovieFormWrapper isEditMode={true} actorsForSelect={actorsForSelect} />
      }
    />
  </Routes>
);

const MovieList = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const navigate = useNavigate();

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setItems((await movieService.getAllMovies()) || []);
    } catch (err) {
      setError("영화 목록 로딩 실패: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await movieService.deleteMovie(itemToDelete.movieId);
      fetchItems();
    } catch (err) {
      alert(`삭제 실패: ${err.message}`);
    } finally {
      setItemToDelete(null);
    }
  };

  return (
    <>
      <ViewItemsList
        title="영화 관리"
        items={items}
        isLoading={isLoading}
        error={error}
        renderItem={(item) => (
          <>
            <strong>{item.title}</strong>
            <span className="detail">
              감독: {item.director || "정보 없음"} (ID: {item.movieId})
            </span>
          </>
        )}
        onAddItem={() => navigate("/admin/movies/add")}
        addItemLabel="새 영화 추가"
        onEdit={(item) => navigate(`/admin/movies/edit/${item.movieId}`)}
        onDelete={(item) => setItemToDelete(item)}
      />
      <DeleteConfirmationModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDelete}
        itemName={itemToDelete?.title}
      />
    </>
  );
};

const MovieFormWrapper = ({ isEditMode, actorsForSelect }) => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditMode && movieId) {
      setIsLoading(true);
      movieService
        .getMovieById_Admin(movieId)
        .then((data) => setInitialData(data))
        .catch((err) => setError("영화 정보 로딩 실패: " + err.message))
        .finally(() => setIsLoading(false));
    }
  }, [isEditMode, movieId]);

  const handleSubmit = async (data, hasNewImage) => {
    try {
      if (isEditMode) {
        if (hasNewImage) {
          await movieService.updateMovieWithImage(movieId, data);
        } else {
          await movieService.updateMovie(movieId, data);
        }
      } else {
        await movieService.addMovieWithImage(data);
      }
      alert(
        `영화가 성공적으로 ${isEditMode ? "수정되었습니다" : "추가되었습니다"}.`
      );
      navigate("/admin/movies");
    } catch (err) {
      console.error("영화 저장 실패:", err);
      throw err;
    }
  };

  if (isEditMode && isLoading)
    return <LoadingErrorDisplay>데이터 로딩 중...</LoadingErrorDisplay>;
  if (isEditMode && error)
    return <LoadingErrorDisplay $isError={true}>{error}</LoadingErrorDisplay>;

  return (
    <AddMovieForm
      onSubmit={handleSubmit}
      initialData={initialData}
      actorsForSelect={actorsForSelect}
    />
  );
};

// 2. 다른 엔티티들(배우, 장르 등)도 위와 같은 패턴으로 생성합니다.
// Generic 컴포넌트 대신 각 엔티티별로 명시적인 컴포넌트를 정의합니다.

const ActorsAdmin = () => (
  <Routes>
    <Route path="/" element={<ActorList />} />
    <Route path="/add" element={<ActorFormWrapper isEditMode={false} />} />
    <Route path="/edit/:id" element={<ActorFormWrapper isEditMode={true} />} />
  </Routes>
);
const ActorList = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [forceDelete, setForceDelete] = useState(false);
  const navigate = useNavigate();
  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setItems((await actorService.getAllActors()) || []);
    } catch (err) {
      setError("배우 목록 로딩 실패: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);
  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await actorService.deleteActor(itemToDelete.actorId, forceDelete);
      fetchItems();
    } catch (err) {
      alert(`삭제 실패: ${err.message}`);
    } finally {
      setItemToDelete(null);
    }
  };
  return (
    <>
      {" "}
      <ViewItemsList
        title="배우 관리"
        items={items}
        isLoading={isLoading}
        error={error}
        renderItem={(item) => (
          <>
            <strong>{item.name}</strong>
            <span className="detail">
              {item.birthDate || `(ID: ${item.actorId})`}
            </span>
          </>
        )}
        onAddItem={() => navigate("/admin/actors/add")}
        addItemLabel="새 배우 추가"
        onEdit={(item) => navigate(`/admin/actors/edit/${item.actorId}`)}
        onDelete={(item) => setItemToDelete(item)}
      />{" "}
      <DeleteConfirmationModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDelete}
        itemName={itemToDelete?.name}
        showForceOption={true}
        forceDelete={forceDelete}
        setForceDelete={setForceDelete}
      />{" "}
    </>
  );
};
// src/pages/AdminDashboardPage.jsx 내의 ActorFormWrapper

const ActorFormWrapper = ({ isEditMode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditMode && id) {
      setIsLoading(true);
      actorService
        .getActorById(id)
        .then(setInitialData)
        .catch((err) => setError("배우 정보 로딩 실패: " + err.message))
        .finally(() => setIsLoading(false));
    }
  }, [isEditMode, id]);

  const handleSubmit = async (data, hasNewImage) => {
    try {
      if (isEditMode) {
        if (hasNewImage) {
          // data는 FormData 객체
          await actorService.updateActorWithImage(id, data);
        } else {
          // data는 순수 JSON 객체
          await actorService.updateActor(id, data);
        }
      } else {
        // 새 배우 추가 시: 이미지 유무에 따라 다른 API 호출
        if (hasNewImage) {
          // data는 FormData 객체
          await actorService.addActorWithImage(data);
        } else {
          // data는 순수 JSON 객체
          await actorService.addActor(data);
        }
      }
      alert(
        `배우 정보가 성공적으로 ${
          isEditMode ? "수정되었습니다" : "추가되었습니다"
        }.`
      );
      navigate("/admin/actors");
    } catch (err) {
      console.error("배우 저장 실패:", err);
      throw err;
    }
  };

  if (isEditMode && isLoading)
    return <LoadingErrorDisplay>데이터 로딩 중...</LoadingErrorDisplay>;
  if (isEditMode && error)
    return <LoadingErrorDisplay $isError={true}>{error}</LoadingErrorDisplay>;

  return <AddActorForm onSubmit={handleSubmit} initialData={initialData} />;
};

const GenresAdmin = () => (
  <Routes>
    <Route
      path="/"
      element={
        <ItemListContainer
          title="장르"
          fetchFunction={genreService.getAllGenres}
          deleteFunction={genreService.deleteGenre}
          idKey="genreId"
          titleKey="genreName"
          forceDeleteSupported={true}
        />
      }
    />
    <Route
      path="/add"
      element={
        <ItemFormContainer
          title="새 장르 추가"
          addFunction={genreService.addGenre}
          FormComponent={AddGenreForm}
        />
      }
    />
    <Route
      path="/edit/:id"
      element={
        <ItemFormContainer
          title="장르 수정"
          fetchByIdFunction={genreService.getGenreById}
          updateFunction={genreService.updateGenre}
          FormComponent={AddGenreForm}
          isEditMode={true}
        />
      }
    />
  </Routes>
);

const RatingsAdmin = () => (
  <Routes>
    <Route
      path="/"
      element={
        <ItemListContainer
          title="등급"
          fetchFunction={ratingService.getAllRatings}
          deleteFunction={ratingService.deleteRating}
          idKey="ratingId"
          titleKey="ratingName"
          detailKey="description"
        />
      }
    />
    <Route
      path="/add"
      element={
        <ItemFormContainer
          title="새 등급 추가"
          addFunction={ratingService.addRating}
          FormComponent={AddRatingForm}
        />
      }
    />
    <Route
      path="/edit/:id"
      element={
        <ItemFormContainer
          title="등급 수정"
          fetchByIdFunction={ratingService.getRatingById}
          updateFunction={ratingService.updateRating}
          FormComponent={AddRatingForm}
          isEditMode={true}
        />
      }
    />
  </Routes>
);

const DistributorsAdmin = () => (
  <Routes>
    <Route
      path="/"
      element={
        <ItemListContainer
          title="배급사"
          fetchFunction={distributorService.getAllDistributors}
          deleteFunction={distributorService.deleteDistributor}
          idKey="distributorId"
          titleKey="name"
          detailKey="phone"
        />
      }
    />
    <Route
      path="/add"
      element={
        <ItemFormContainer
          title="새 배급사 추가"
          addFunction={distributorService.addDistributor}
          FormComponent={AddDistributorForm}
        />
      }
    />
    <Route
      path="/edit/:id"
      element={
        <ItemFormContainer
          title="배급사 수정"
          fetchByIdFunction={distributorService.getDistributorById}
          updateFunction={distributorService.updateDistributor}
          FormComponent={AddDistributorForm}
          isEditMode={true}
        />
      }
    />
  </Routes>
);

const RoomsAdmin = () => (
  <Routes>
    <Route
      path="/"
      element={
        <ItemListContainer
          title="상영관"
          fetchFunction={roomService.getAllScreeningRooms}
          deleteFunction={roomService.deleteScreeningRoom}
          idKey="roomId"
          titleKey="roomName"
          detailKey="capacity"
        />
      }
    />
    <Route
      path="/add"
      element={
        <ItemFormContainer
          title="새 상영관 추가"
          addFunction={roomService.addScreeningRoom}
          FormComponent={AddScreeningRoomForm}
        />
      }
    />
    <Route
      path="/edit/:id"
      element={
        <ItemFormContainer
          title="상영관 수정"
          fetchByIdFunction={roomService.getScreeningRoomById_Admin}
          updateFunction={roomService.updateScreeningRoom}
          FormComponent={AddScreeningRoomForm}
          isEditMode={true}
        />
      }
    />
  </Routes>
);

const SchedulesAdmin = ({ movies, rooms }) => (
  <Routes>
    <Route
      path="/"
      element={
        <ItemListContainer
          title="상영스케줄"
          fetchFunction={screeningService.getAllScreenings}
          deleteFunction={screeningService.deleteScreening}
          idKey="screeningId"
          renderItem={(item) => (
            <>
              <strong>
                {item.movie.title} - {item.screeningRoom.roomName}
              </strong>
              <span className="detail">
                {item.screeningDate} {item.screeningTime?.substring(11, 16)}{" "}
                (ID: {item.screeningId})
              </span>
            </>
          )}
        />
      }
    />
    <Route
      path="/add"
      element={
        <ItemFormContainer
          title="새 스케줄 추가"
          addFunction={screeningService.addScreening}
          FormComponent={AddScreeningScheduleForm}
          additionalProps={{ movies, screeningRooms: rooms }}
        />
      }
    />
    <Route
      path="/edit/:id"
      element={
        <ItemFormContainer
          title="스케줄 수정"
          fetchByIdFunction={screeningService.getScreeningById}
          updateFunction={screeningService.updateScreening}
          FormComponent={AddScreeningScheduleForm}
          isEditMode={true}
          additionalProps={{ movies, screeningRooms: rooms }}
        />
      }
    />
  </Routes>
);

const TicketTypesAdmin = () => (
  <Routes>
    <Route
      path="/"
      element={
        <ItemListContainer
          title="티켓 종류"
          fetchFunction={ticketTypeService.getAllTicketTypes}
          deleteFunction={ticketTypeService.deleteTicketType}
          idKey="ticketTypeId"
          titleKey="typeName"
          detailKey="description"
        />
      }
    />
    <Route
      path="/add"
      element={
        <ItemFormContainer
          title="새 티켓 종류 추가"
          addFunction={ticketTypeService.addTicketType}
          FormComponent={AddTicketTypeForm}
        />
      }
    />
    <Route
      path="/edit/:id"
      element={
        <ItemFormContainer
          title="티켓 종류 수정"
          fetchByIdFunction={ticketTypeService.getTicketTypeById}
          updateFunction={ticketTypeService.updateTicketType}
          FormComponent={AddTicketTypeForm}
          isEditMode={true}
        />
      }
    />
  </Routes>
);

// 리뷰 관리 컴포넌트
const ReviewsAdmin = () => (
  <Routes>
    <Route path="/" element={<AdminReviewsList />} />
  </Routes>
);

// 할인 관리 컴포넌트
const DiscountsAdmin = () => {
  const [discounts, setDiscounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [discountToDelete, setDiscountToDelete] = useState(null);

  // 할인 목록을 가져오는 함수 (고객용 할인 목록 API 활용)
  const fetchDiscounts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await paymentService.getDiscountList();
      setDiscounts(data || []);
    } catch (err) {
      setError("할인 목록을 불러오는데 실패했습니다: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDiscounts();
  }, [fetchDiscounts]);

  const handleAddDiscount = async (discountData) => {
    try {
      await adminDiscountService.registerDiscount(discountData);
      alert("할인 정보가 성공적으로 추가되었습니다.");
      setShowForm(false);
      fetchDiscounts();
    } catch (err) {
      throw new Error(err.message || "할인 정보 추가에 실패했습니다.");
    }
  };

  const handleEditDiscount = async (discountData) => {
    try {
      await adminDiscountService.updateDiscount(discountData);
      alert("할인 정보가 성공적으로 수정되었습니다.");
      setEditingDiscount(null);
      setShowForm(false);
      fetchDiscounts();
    } catch (err) {
      throw new Error(err.message || "할인 정보 수정에 실패했습니다.");
    }
  };

  const handleDeleteDiscount = async () => {
    if (!discountToDelete) return;
    try {
      // 할인 정보의 ID 필드명을 확인하여 사용 (paymentDiscountId 또는 id)
      const discountId =
        discountToDelete.paymentDiscountId || discountToDelete.id;
      await adminDiscountService.deleteDiscount(discountId);
      alert("할인 정보가 성공적으로 삭제되었습니다.");
      setDiscountToDelete(null);
      fetchDiscounts();
    } catch (err) {
      alert("할인 정보 삭제에 실패했습니다: " + err.message);
    }
  };

  if (showForm) {
    return (
      <AddDiscountForm
        onSubmit={editingDiscount ? handleEditDiscount : handleAddDiscount}
        initialData={editingDiscount}
        onCancel={() => {
          setShowForm(false);
          setEditingDiscount(null);
        }}
      />
    );
  }

  return (
    <>
      <ViewItemsList
        title="할인 관리"
        items={discounts}
        isLoading={isLoading}
        error={error}
        renderItem={(item) => (
          <>
            <strong>{item.providerName}</strong>
            <span className="detail">
              {item.discountRate > 0 && `${item.discountRate}% 할인`}
              {item.discountAmount > 0 &&
                `${item.discountAmount.toLocaleString()}원 할인`}
              {item.description && ` - ${item.description}`}
            </span>
          </>
        )}
        onAddItem={() => setShowForm(true)}
        addItemLabel="새 할인 추가"
        onEdit={(item) => {
          // ID 필드를 통일하여 전달 (paymentDiscountId가 우선)
          const editItem = {
            ...item,
            id: item.paymentDiscountId || item.id,
          };
          console.log("Edit discount item:", editItem);
          setEditingDiscount(editItem);
          setShowForm(true);
        }}
        onDelete={(item) => setDiscountToDelete(item)}
      />
      <DeleteConfirmationModal
        isOpen={!!discountToDelete}
        onClose={() => setDiscountToDelete(null)}
        onConfirm={handleDeleteDiscount}
        itemName={
          discountToDelete?.providerName || discountToDelete?.description
        }
      />
    </>
  );
};

// 고객 관리 컴포넌트
const CustomersAdmin = () => (
  <Routes>
    <Route path="/" element={<AdminCustomersList />} />
  </Routes>
);

const ItemListContainer = ({
  title,
  fetchFunction,
  deleteFunction,
  idKey,
  titleKey,
  detailKey,
  forceDeleteSupported = false,
  renderItem,
}) => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [forceDelete, setForceDelete] = useState(false);
  const navigate = useNavigate();

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setItems((await fetchFunction()) || []);
    } catch (err) {
      setError(`${title} 목록 로딩 실패: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFunction, title]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteFunction(
        // ✅ 전달받은 함수 사용
        itemToDelete[idKey],
        forceDeleteSupported ? forceDelete : undefined
      );
      fetchItems();
    } catch (err) {
      alert(`삭제 실패: ${err.message}`);
    } finally {
      setItemToDelete(null);
    }
  };

  return (
    <>
      <ViewItemsList
        title={`${title} 관리`}
        items={items}
        isLoading={isLoading}
        error={error}
        renderItem={
          renderItem ||
          ((item) => (
            <>
              <strong>{item[titleKey]}</strong>
              <span className="detail">
                {detailKey ? item[detailKey] : `(ID: ${item[idKey]})`}
              </span>
            </>
          ))
        }
        onAddItem={() => navigate("add")}
        addItemLabel={`새 ${title} 추가`}
        onEdit={(item) => navigate(`edit/${item[idKey]}`)}
        onDelete={(item) => setItemToDelete(item)}
      />
      <DeleteConfirmationModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDelete}
        itemName={itemToDelete?.[titleKey]}
        showForceOption={forceDeleteSupported}
        forceDelete={forceDelete}
        setForceDelete={setForceDelete}
      />
    </>
  );
};

const ItemFormContainer = ({
  title,
  FormComponent,
  isEditMode = false,
  fetchByIdFunction,
  addFunction,
  updateFunction,
  additionalProps = {},
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [initialData, setInitialData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditMode && id) {
      setIsLoading(true);
      fetchByIdFunction(id)
        .then(setInitialData)
        .catch((err) => setError(`${title} 정보 로딩 실패: ${err.message}`))
        .finally(() => setIsLoading(false));
    }
  }, [isEditMode, id, fetchByIdFunction, title]);

  const handleSubmit = async (data) => {
    // 간단한 폼들은 이미지 처리가 없으므로 data만 받음
    console.log("ItemFormContainer: handleSubmit called with data:", data);
    console.log("ItemFormContainer: isEditMode:", isEditMode);
    console.log("ItemFormContainer: title:", title);

    try {
      let result;
      if (isEditMode) {
        console.log("ItemFormContainer: calling updateFunction with id:", id);
        result = await updateFunction(id, data);
      } else {
        console.log("ItemFormContainer: calling addFunction");
        result = await addFunction(data);
      }

      console.log("ItemFormContainer: operation successful:", result);

      alert(
        `${title}이(가) 성공적으로 ${
          isEditMode ? "수정되었습니다" : "추가되었습니다"
        }.`
      );

      navigate(`/admin/${location.pathname.split("/")[2]}`);
    } catch (err) {
      console.error(`${title} 저장 실패:`, err);
      console.error("Error details:", err.details);
      console.error("Error status:", err.status);
      throw err;
    }
  };

  if (isEditMode && isLoading)
    return <LoadingErrorDisplay>데이터 로딩 중...</LoadingErrorDisplay>;
  if (isEditMode && error)
    return <LoadingErrorDisplay $isError={true}>{error}</LoadingErrorDisplay>;

  return (
    <FormComponent
      onSubmit={handleSubmit}
      initialData={initialData}
      {...additionalProps}
    />
  );
};

const PriceRoomSelector = ({ rooms, isLoading, error }) => {
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

const RoomPriceManager = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [currentRoom, setCurrentRoom] = useState(null);
  const [isLoadingRoom, setIsLoadingRoom] = useState(true);

  useEffect(() => {
    if (roomId) {
      setIsLoadingRoom(true);
      roomService
        .getScreeningRoomById_Admin(roomId)
        .then(setCurrentRoom)
        .catch((err) => {
          console.error("Error fetching current room:", err);
          setCurrentRoom(null);
        })
        .finally(() => setIsLoadingRoom(false));
    }
  }, [roomId]);

  if (!roomId) return <Navigate to="/admin/prices" replace />;
  if (isLoadingRoom)
    return <LoadingErrorDisplay>상영관 정보 로딩 중...</LoadingErrorDisplay>;
  if (!currentRoom)
    return (
      <SectionTitle>
        상영관 정보를 찾을 수 없습니다. (ID: {roomId})
      </SectionTitle>
    );

  // --- Sub-component for the Price List ---
  const PriceList = () => {
    const [prices, setPrices] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);
    const navigate = useNavigate();

    const fetchPrices = useCallback(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await priceService.getPriceSettingsByRoom_Admin(roomId);
        setPrices(data || []);
      } catch (err) {
        setError(`가격 정보 로딩 실패: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    }, []);

    useEffect(() => {
      fetchPrices();
    }, [fetchPrices]);

    const handleDelete = async () => {
      if (!itemToDelete) return;
      try {
        await priceService.deletePriceSetting(
          itemToDelete.roomId,
          itemToDelete.ticketTypeId
        );
        alert("가격 정보가 삭제되었습니다.");
        fetchPrices();
      } catch (err) {
        alert(`가격 삭제 실패: ${err.message}`);
      } finally {
        setItemToDelete(null);
      }
    };

    return (
      <>
        <ViewItemsList
          title={`${currentRoom.roomName} 가격 정책`}
          items={prices}
          isLoading={isLoading}
          error={error}
          renderItem={(item) => (
            <>
              <strong>{item.ticketTypeName}</strong>
              <span className="detail">{item.price.toLocaleString()}원</span>
            </>
          )}
          onAddItem={() => navigate(`/admin/prices/room/${roomId}/add`)}
          addItemLabel="새 가격 정책 추가"
          onEdit={(item) =>
            navigate(`/admin/prices/room/${roomId}/edit/${item.ticketTypeId}`)
          }
          onDelete={setItemToDelete}
        />
        <DeleteConfirmationModal
          isOpen={!!itemToDelete}
          onClose={() => setItemToDelete(null)}
          onConfirm={handleDelete}
          itemName={
            itemToDelete &&
            `${
              itemToDelete.ticketType?.typeName
            } (${itemToDelete.price.toLocaleString()}원)`
          }
        />
      </>
    );
  };

  // --- Sub-component for the Price Form (Add/Edit) ---
  const PriceFormWrapper = ({ isEditMode }) => {
    const { ticketTypeId } = useParams();
    const navigate = useNavigate();
    const { ticketTypes, isLoadingData: isLoadingTicketTypes } = useData();
    const [prices, setPrices] = useState([]);
    const [initialData, setInitialData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
      priceService
        .getPriceSettingsByRoom_Admin(roomId)
        .then((data) => setPrices(data || []));
    }, []);

    useEffect(() => {
      if (isEditMode && ticketTypeId) {
        setIsLoading(true);
        priceService
          .getPriceSettingsByRoom_Admin(roomId)
          .then((allPrices) => {
            const priceToEdit = allPrices.find(
              (p) => String(p.ticketTypeId) === String(ticketTypeId)
            );
            if (priceToEdit) {
              setInitialData(priceToEdit);
            } else {
              setError("수정할 가격 정보를 찾을 수 없습니다.");
            }
          })
          .catch((err) => setError(`가격 정보 로딩 실패: ${err.message}`))
          .finally(() => setIsLoading(false));
      }
    }, [isEditMode, ticketTypeId]);

    const handleSubmit = async (formData, formActions) => {
      try {
        const requestData = { ...formData, roomId: parseInt(roomId) };
        if (isEditMode) {
          requestData.ticketTypeId = parseInt(ticketTypeId);
        }
        await priceService.setPrice(requestData);
        alert(
          `가격 정보가 성공적으로 ${
            isEditMode ? "수정되었습니다" : "설정되었습니다"
          }.`
        );
        navigate(`/admin/prices/room/${roomId}`);
      } catch (err) {
        console.error("가격 저장 실패:", err);
        alert(`가격 저장 실패: ${err.message}`);
        throw err;
      }
    };

    if (isLoading || isLoadingTicketTypes)
      return <LoadingErrorDisplay>데이터 로딩 중...</LoadingErrorDisplay>;
    if (error)
      return <LoadingErrorDisplay $isError>{error}</LoadingErrorDisplay>;

    // In add mode, filter out ticket types that already have a price for this room.
    // In edit mode, we pass all ticket types but the form should handle disabling the select.
    const availableTicketTypes = isEditMode
      ? ticketTypes
      : ticketTypes.filter(
          (tt) =>
            !prices.some((p) => p.ticketType?.ticketTypeId === tt.ticketTypeId)
        );

    return (
      <PriceSettingForm
        onSubmit={handleSubmit}
        initialData={initialData}
        ticketTypes={availableTicketTypes}
        // Pass the current room to disable the room selector in the form
        screeningRooms={[currentRoom]}
        isEditMode={isEditMode}
      />
    );
  };

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
      <Routes>
        <Route path="/" element={<PriceList />} />
        <Route path="add" element={<PriceFormWrapper isEditMode={false} />} />
        <Route
          path="edit/:ticketTypeId"
          element={<PriceFormWrapper isEditMode={true} />}
        />
      </Routes>
    </div>
  );
};

// --- AdminDashboardPage: Main Component ---
const AdminDashboardPage = () => {
  const [commonFormData, setCommonFormData] = useState({
    moviesForForm: [],
    roomsForForm: [],
    actorsForSelect: [],
  });
  const [isCommonFormLoading, setIsCommonFormLoading] = useState(true);

  const fetchCommonDataForForms = useCallback(async () => {
    setIsCommonFormLoading(true);
    try {
      const [moviesData, roomsData, actorsData] = await Promise.all([
        movieService.getAllMovies(),
        roomService.getAllScreeningRooms(),
        actorService.getAllActors(),
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

  if (isCommonFormLoading) {
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
                <MoviesAdmin actorsForSelect={commonFormData.actorsForSelect} />
              }
            />
            <Route path="actors/*" element={<ActorsAdmin />} />
            <Route path="genres/*" element={<GenresAdmin />} />
            <Route path="ratings/*" element={<RatingsAdmin />} />
            <Route path="distributors/*" element={<DistributorsAdmin />} />
            <Route path="rooms/*" element={<RoomsAdmin />} />
            <Route
              path="schedules/*"
              element={
                <SchedulesAdmin
                  movies={commonFormData.moviesForForm}
                  rooms={commonFormData.roomsForForm}
                />
              }
            />
            <Route path="ticket-types/*" element={<TicketTypesAdmin />} />

            {/* 가격 설정 라우팅은 별도 컴포넌트를 사용하므로 이 수정사항과 무관 */}
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
              element={
                <RoomPriceManager
                  roomsForSelect={commonFormData.roomsForForm}
                />
              }
            />

            {/* 새로운 관리 기능 라우트들 */}
            <Route path="reviews/*" element={<ReviewsAdmin />} />
            <Route path="discounts/*" element={<DiscountsAdmin />} />
            <Route path="customers/*" element={<CustomersAdmin />} />

            {/* 관리자 계정 관리 */}
            <Route path="delete-account" element={<AdminDeleteAccountPage />} />

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
