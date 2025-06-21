// src/components/layout/Header.js
import React from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Menu,
  X,
  LogOut,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import NavLinks from "./NavLinks";
import Button from "../common/Button";

const HeaderWrapper = styled.header`
  background-color: ${({ theme }) => theme.colors.background + "CC"};
  backdrop-filter: blur(10px);
  box-shadow: ${({ theme }) => theme.shadows.md};
  position: sticky;
  top: 0;
  z-index: ${({ theme }) => theme.zIndices.sticky};
  width: 100%;
`;

const Container = styled.div`
  width: 100%;
  max-width: ${({ theme }) => theme.breakpoints.xl};
  margin-left: auto;
  margin-right: auto;
  padding: ${({ theme }) => `${theme.spacing[3]} ${theme.spacing[4]}`};
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding-top: ${({ theme }) => theme.spacing[4]};
    padding-bottom: ${({ theme }) => theme.spacing[4]};
  }
`;

const LogoContainer = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  &:hover {
    text-decoration: none;
  }
`;

const Logo = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  font-weight: 900;
  color: ${({ theme }) => theme.colors.primaryLight};
  cursor: pointer;
  margin: 0;
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.fontSizes["4xl"]};
  }
`;

const DesktopNav = styled.nav`
  display: none;
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing[3]};
  }
  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    gap: ${({ theme }) => theme.spacing[5]};
  }
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    gap: ${({ theme }) => theme.spacing[3]};
  }
`;

const IconButton = styled(Button).attrs({ variant: "text", size: "sm" })`
  color: ${({ theme }) => theme.colors.textDark};
  padding: ${({ theme }) => theme.spacing[1.5]};

  &:hover {
    color: ${({ theme }) => theme.colors.primaryLight};
  }
  svg {
    width: ${({ theme }) => theme.fontSizes.xl};
    height: ${({ theme }) => theme.fontSizes.xl};
    margin-right: 0;
    @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
      width: ${({ theme }) => theme.fontSizes["2xl"]};
      height: ${({ theme }) => theme.fontSizes["2xl"]};
    }
  }
`;

const DesktopAuthLink = styled(Link)`
  display: none;
  font-family: ${({ theme }) => theme.fonts.main};
  font-weight: 500;
  align-items: center;
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[2]};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    font-size: ${({ theme }) => theme.fontSizes.base};
  }
  color: ${({ theme }) => theme.colors.textDark};
  text-decoration: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  transition: color 0.2s, background-color 0.2s;

  &:hover {
    color: ${({ theme, $isDanger, $isAdminLink }) =>
      $isDanger
        ? theme.colors.error
        : $isAdminLink
        ? theme.colors.secondaryHover
        : theme.colors.primaryLight};
    background-color: ${({ theme }) => theme.colors.surfaceLight + "55"};
    text-decoration: none;
  }
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    display: inline-flex;
  }
  svg {
    margin-right: ${({ theme }) => theme.spacing[1.5]};
    width: 16px;
    height: 16px;
  }
`;

const DesktopAuthButtonAction = styled(DesktopAuthLink).attrs({ as: "button" })`
  background: none;
  border: none;
  cursor: pointer;
`;

const MobileMenuButton = styled(IconButton)`
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`;

const MobileMenu = styled.div`
  display: ${({ $isOpen }) => ($isOpen ? "block" : "none")};
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing[2]} 0;
  box-shadow: ${({ theme }) => theme.shadows.lg};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`;

const Header = ({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  isAdminLoggedIn,
  isUserLoggedIn,
  handleAdminLogout,
  handleUserLogout,
}) => {
  const navigate = useNavigate();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <HeaderWrapper>
      <Container>
        <LogoContainer to="/" title="PICOBOX 홈으로">
          {" "}
          <Logo>PICOBOX</Logo>
        </LogoContainer>

        <DesktopNav>
          <NavLinks
            isAdminLoggedIn={isAdminLoggedIn}
            isUserLoggedIn={isUserLoggedIn}
            isMobile={false}
            onLinkClick={closeMobileMenu} // Though not strictly needed for desktop, good for consistency
          />
        </DesktopNav>

        <ActionButtonsContainer>
          <IconButton
            title="Search"
            onClick={() => alert("검색 기능은 준비 중입니다.")}
          >
            <Search />
          </IconButton>

          {isAdminLoggedIn ? (
            <>
              <DesktopAuthButtonAction onClick={handleAdminLogout} $isDanger>
                <LogOut size={16} /> 로그아웃
              </DesktopAuthButtonAction>
            </>
          ) : isUserLoggedIn ? (
            <>
              <DesktopAuthLink to="/profile">
                <UserIcon size={16} /> 마이페이지
              </DesktopAuthLink>
              <DesktopAuthButtonAction onClick={handleUserLogout} $isDanger>
                <LogOut size={16} /> 로그아웃
              </DesktopAuthButtonAction>
            </>
          ) : (
            <>
              <DesktopAuthLink to="/login">
                <UserIcon size={16} /> 로그인
              </DesktopAuthLink>
              <DesktopAuthLink to="/admin/login" $isAdminLink>
                <ShieldCheck size={16} /> 관리자 접속
              </DesktopAuthLink>
            </>
          )}
          <MobileMenuButton
            onClick={toggleMobileMenu}
            title={isMobileMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </MobileMenuButton>
        </ActionButtonsContainer>
      </Container>

      <MobileMenu $isOpen={isMobileMenuOpen}>
        <NavLinks
          isAdminLoggedIn={isAdminLoggedIn}
          isUserLoggedIn={isUserLoggedIn}
          handleAdminLogout={handleAdminLogout}
          handleUserLogout={handleUserLogout}
          isMobile={true}
          onLinkClick={closeMobileMenu}
        />
      </MobileMenu>
    </HeaderWrapper>
  );
};

export default Header;
