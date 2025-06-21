// src/components/layout/NavLinks.js
import React from "react";
import styled, { css } from "styled-components";
import { NavLink as RouterNavLink } from "react-router-dom"; // Use NavLink for active styling
import {
  Film,
  Ticket,
  ShieldCheck,
  LogOut,
  User as UserIcon,
} from "lucide-react";

// NavButton is now NavLinkStyled
const NavLinkStyled = styled(RouterNavLink)`
  display: flex;
  align-items: center;
  font-family: ${({ theme }) => theme.fonts.main};
  font-weight: 500;
  background-color: transparent;
  border: none;
  cursor: pointer;
  transition: color ${({ theme }) => theme.transitions.short},
    background-color ${({ theme }) => theme.transitions.short};
  padding: ${({ theme, $isMobile }) =>
    $isMobile
      ? `${theme.spacing[3]} ${theme.spacing[4]}`
      : `${theme.spacing[1]} ${theme.spacing[2]}`};
  width: ${({ $isMobile }) => ($isMobile ? "100%" : "auto")};
  justify-content: ${({ $isMobile }) => ($isMobile ? "flex-start" : "center")};
  text-decoration: none;

  font-size: ${({ theme, $isMobile }) =>
    $isMobile ? theme.fontSizes.base : theme.fontSizes.base};
  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    font-size: ${({ theme, $isMobile }) =>
      $isMobile ? theme.fontSizes.base : theme.fontSizes.base};
  }

  color: ${({ theme }) => theme.colors.textDark};

  &.active {
    /* React Router DOM's NavLink active class */
    color: ${({ theme, $isAdminLink }) =>
      $isAdminLink ? theme.colors.secondary : theme.colors.primaryLight};
    ${({ $isMobile, theme }) =>
      $isMobile &&
      css`
        background-color: ${theme.colors.surfaceLight};
      `}
  }

  &:hover {
    color: ${({ theme, $isAdminLink }) =>
      $isAdminLink ? theme.colors.secondaryHover : theme.colors.primary};
    text-decoration: none;
    ${({ $isMobile, theme }) =>
      $isMobile &&
      css`
        background-color: ${theme.colors.surface};
      `}
  }

  svg {
    width: ${({ theme, $isMobile }) =>
      $isMobile ? theme.fontSizes.lg : theme.fontSizes.base};
    height: ${({ theme, $isMobile }) =>
      $isMobile ? theme.fontSizes.lg : theme.fontSizes.base};
    margin-right: ${({ theme }) => theme.spacing[2]};
    flex-shrink: 0;
  }
`;

// Button for actions like logout, or non-NavLink items
const ActionButton = styled.button`
  /* Similar styling to NavLinkStyled but it's a button */
  display: flex;
  align-items: center;
  font-family: ${({ theme }) => theme.fonts.main};
  font-weight: 500;
  background-color: transparent;
  border: none;
  cursor: pointer;
  transition: color ${({ theme }) => theme.transitions.short},
    background-color ${({ theme }) => theme.transitions.short};
  padding: ${({ theme, $isMobile }) =>
    $isMobile
      ? `${theme.spacing[3]} ${theme.spacing[4]}`
      : `${theme.spacing[1]} ${theme.spacing[2]}`};
  width: ${({ $isMobile }) => ($isMobile ? "100%" : "auto")};
  justify-content: ${({ $isMobile }) => ($isMobile ? "flex-start" : "center")};
  text-decoration: none;
  font-size: ${({ theme, $isMobile }) =>
    $isMobile ? theme.fontSizes.base : theme.fontSizes.sm};
  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    font-size: ${({ theme, $isMobile }) =>
      $isMobile ? theme.fontSizes.base : theme.fontSizes.base};
  }
  color: ${({ theme }) => theme.colors.textDark};
  &:hover {
    color: ${({ theme, $isDanger }) =>
      $isDanger ? theme.colors.error : theme.colors.primary};
    ${({ $isMobile, theme }) =>
      $isMobile &&
      css`
        background-color: ${theme.colors.surface};
      `}
  }
  svg {
    width: ${({ theme, $isMobile }) =>
      $isMobile ? theme.fontSizes.lg : theme.fontSizes.base};
    height: ${({ theme, $isMobile }) =>
      $isMobile ? theme.fontSizes.lg : theme.fontSizes.base};
    margin-right: ${({ theme }) => theme.spacing[2]};
  }
`;

const NavLinks = ({
  isAdminLoggedIn,
  isUserLoggedIn,
  handleAdminLogout,
  handleUserLogout,
  isMobile = false,
  onLinkClick = () => {},
}) => {
  const mainNavLinks = [
    { name: "영화", path: "/movies", icon: <Film /> },
    // Booking path usually requires a movieId, so direct link here might go to a general booking info page
    // or the first available movie. For now, let's link to movies list.
    // If user clicks "예매" from header, they usually expect to select a movie first or see movie list.
    // Or you could make it a dropdown to select a movie, then go to /booking/:movieId
    { name: "예매", path: "/booking", icon: <Ticket /> }, // Changed to /movies, user selects movie then books
  ];

  return (
    <>
      {mainNavLinks.map((link) => (
        <NavLinkStyled
          key={link.name}
          to={link.path}
          $isMobile={isMobile}
          onClick={onLinkClick}
          title={link.name}
          // end prop ensures NavLink matches exactly for '/' or similar paths if needed
          end={link.path === "/"}
        >
          {link.icon}
          {link.name}
        </NavLinkStyled>
      ))}
      {isAdminLoggedIn && (
        <NavLinkStyled
          to="/admin" // Main admin dashboard path
          $isAdminLink // To apply orange color for admin links
          $isMobile={isMobile}
          onClick={onLinkClick}
          title="관리자"
        >
          <ShieldCheck />
          관리자
        </NavLinkStyled>
      )}
      {/* Mobile specific auth links */}
      {isMobile &&
        (isAdminLoggedIn ? (
          <ActionButton
            onClick={() => {
              handleAdminLogout();
              onLinkClick();
            }}
            $isMobile={isMobile}
            $isDanger
            title="로그아웃"
          >
            <LogOut /> 로그아웃
          </ActionButton>
        ) : isUserLoggedIn ? (
          <>
            <NavLinkStyled
              to="/profile"
              $isMobile={isMobile}
              onClick={onLinkClick}
              title="마이페이지"
            >
              <UserIcon /> 마이페이지
            </NavLinkStyled>
            <ActionButton
              onClick={() => {
                handleUserLogout();
                onLinkClick();
              }}
              $isMobile={isMobile}
              $isDanger
              title="로그아웃"
            >
              <LogOut /> 로그아웃
            </ActionButton>
          </>
        ) : (
          <>
            <NavLinkStyled
              to="/login"
              $isMobile={isMobile}
              onClick={onLinkClick}
              title="로그인"
            >
              <UserIcon /> 로그인
            </NavLinkStyled>
            <NavLinkStyled
              to="/admin/login"
              $isAdminLink
              $isMobile={isMobile}
              onClick={onLinkClick}
              title="관리자 로그인"
            >
              <ShieldCheck /> 관리자 로그인
            </NavLinkStyled>
          </>
        ))}
    </>
  );
};

export default NavLinks;
