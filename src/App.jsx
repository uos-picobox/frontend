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

// Page Components
import HomePage from "./pages/HomePage";
import MovieListPage from "./pages/MovieListPage";
import MovieDetailPage from "./pages/MovieDetailPage";
import BookingPage from "./pages/BookingPage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
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
  const { isAdmin, isLoading: isAuthLoading } = useAuth();
  const location = useLocation();

  if (isAuthLoading) {
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
  const { user, token, isLoading: isAuthLoading } = useAuth();
  const location = useLocation();

  if (isAuthLoading) {
    return <p>인증 정보 확인 중...</p>;
  }

  if (!token || !user) {
    // Check for token and user object
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

function App() {
  const { token, isAdmin, logout: authLogout } = useAuth();
  // selectedMovie state is removed. Movie ID will be passed via URL params.
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate(); // React Router's navigate function
  const location = useLocation(); // To get current path for Header

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
    setIsMobileMenuOpen(false); // Close mobile menu on navigation
  }, [location.pathname]);

  const handleAdminLogout = () => {
    authLogout();
    navigate("/"); // Redirect to home after admin logout
  };

  // The `MapsTo` prop in Header and other components will now use React Router's Link or navigate

  return (
    <AppContainer>
      <Header
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        isAdminLoggedIn={!!token && isAdmin}
        handleAdminLogout={handleAdminLogout}
        // No need for currentPage, selectedMovie, movies here if NavLinks use <NavLink>
      />
      <MainContent className="main-content-area">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movies" element={<MovieListPage />} />
          <Route path="/movies/:movieId" element={<MovieDetailPage />} />

          {/* BookingPage will get movieId from URL param */}
          <Route path="/booking/:movieId" element={<BookingPage />} />
          {/* Fallback if someone tries to go to /booking without movieId */}
          <Route path="/booking" element={<Navigate to="/" replace />} />

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

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
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
    </AppContainer>
  );
}

export default App;
