// src/App.js
import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";

import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import SearchModal from "./components/common/SearchModal";

// Page Components
import HomePage from "./pages/HomePage";
import MovieListPage from "./pages/MovieListPage";
import MovieDetailPage from "./pages/MovieDetailPage";
import ActorDetailPage from "./pages/ActorDetailPage";
import BookingPage from "./pages/BookingPage";
import BookingSelectPage from "./pages/BookingSelectPage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import FindLoginIdPage from "./pages/FindLoginIdPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminSignupPage from "./pages/AdminSignupPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import PaymentFailPage from "./pages/PaymentFailPage";
import NotFoundPage from "./pages/NotFoundPage";

import useAuth from "./hooks/useAuth";

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const MainContent = styled.main`
  flex-grow: 1;
  width: 100%;
`;

// ProtectedRoute for admin pages
const AdminProtectedRoute = ({ children }) => {
  const { isAdmin, isLoadingAuth } = useAuth();
  const location = useLocation();

  if (isLoadingAuth) {
    return <p>인증 정보 확인 중...</p>; // Or a spinner
  }

  if (!isAdmin) {
    // Redirect them to the /admin/login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the admin dashboard page.
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  return children;
};

// ProtectedRoute for user-specific pages like profile
const UserProtectedRoute = ({ children }) => {
  const { user, sessionId, isLoadingAuth } = useAuth();
  const location = useLocation();

  console.log(
    "UserProtectedRoute check - isLoadingAuth:",
    isLoadingAuth,
    "user:",
    !!user,
    "sessionId:",
    !!sessionId
  );

  if (isLoadingAuth) {
    return <p>인증 정보 확인 중...</p>;
  }

  // 더 관대한 조건으로 변경 - user만 있으면 접근 허용
  if (!user) {
    console.log("UserProtectedRoute: No user, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!sessionId) {
    console.warn(
      "UserProtectedRoute: No sessionId but user exists, allowing access"
    );
  }

  return children;
};

function App() {
  const { sessionId, isAdmin, user, logout: authLogout } = useAuth();
  // selectedMovie state is removed. Movie ID will be passed via URL params.
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const navigate = useNavigate(); // React Router's navigate function
  const location = useLocation(); // To get current path for Header

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
    setIsMobileMenuOpen(false); // Close mobile menu on navigation
  }, [location.pathname]);

  const handleAdminLogout = async () => {
    await authLogout();
    navigate("/"); // Redirect to home after admin logout
  };

  const handleUserLogout = async () => {
    await authLogout();
    navigate("/"); // Redirect to home after user logout
  };

  const openSearchModal = () => setIsSearchModalOpen(true);
  const closeSearchModal = () => setIsSearchModalOpen(false);

  // The `MapsTo` prop in Header and other components will now use React Router's Link or navigate

  return (
    <AppContainer>
      <Header
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        isAdminLoggedIn={!!sessionId && isAdmin}
        isUserLoggedIn={!!sessionId && !!user && !isAdmin}
        handleAdminLogout={handleAdminLogout}
        handleUserLogout={handleUserLogout}
        onSearchClick={openSearchModal}
        // No need for currentPage, selectedMovie, movies here if NavLinks use <NavLink>
      />
      <MainContent className="main-content-area">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movies" element={<MovieListPage />} />
          <Route path="/movies/:movieId" element={<MovieDetailPage />} />
          <Route path="/actors/:actorId" element={<ActorDetailPage />} />

          {/* BookingSelectPage - Shows all movies for booking selection */}
          <Route path="/booking" element={<BookingSelectPage />} />
          {/* BookingPage will get movieId from URL param */}
          <Route path="/booking/:movieId" element={<BookingPage />} />

          <Route
            path="/profile"
            element={
              <UserProtectedRoute>
                <ProfilePage />
              </UserProtectedRoute>
            }
          />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/find-login-id" element={<FindLoginIdPage />} />

          {/* Payment Routes */}
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/payment/fail" element={<PaymentFailPage />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/signup" element={<AdminSignupPage />} />
          <Route
            path="/admin/*" // Catch all routes under /admin
            element={
              <AdminProtectedRoute>
                <AdminDashboardPage />
              </AdminProtectedRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </MainContent>
      <Footer />

      {/* 검색 모달 - 전체 화면에 표시 */}
      <SearchModal isOpen={isSearchModalOpen} onClose={closeSearchModal} />
    </AppContainer>
  );
}

export default App;
