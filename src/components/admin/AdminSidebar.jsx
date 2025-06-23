// src/components/admin/AdminSidebar.js
import React from "react";
import styled from "styled-components";
import { NavLink as RouterNavLink } from "react-router-dom";
import {
  Film,
  Tv2,
  CalendarDays,
  Users,
  Tag,
  BarChart2,
  DollarSign,
  Edit3,
  PlusSquare,
  Video,
  List,
  MessageSquare,
  Percent,
  UserCheck,
  UserX,
} from "lucide-react";

const SidebarWrapper = styled.aside`
  flex-shrink: 0;
  background-color: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    width: 260px; // Slightly wider
  }
  @media (max-width: ${({ theme }) => parseInt(theme.breakpoints.md) - 1}px) {
    margin-bottom: ${({ theme }) => theme.spacing[4]};
  }
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]}; // Reduced gap between items slightly
`;

const NavItemLink = styled(RouterNavLink)`
  display: flex;
  align-items: center;
  width: 100%;
  padding: ${({ theme }) => theme.spacing[2.5]}
    ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  text-align: left;
  font-weight: 500;
  text-decoration: none;
  border: 1px solid transparent;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.textDark};
  transition: background-color 0.2s, color 0.2s, border-left-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceLight};
    color: ${({ theme }) => theme.colors.text};
  }

  &.active {
    // React Router DOM's NavLink active class
    background-color: ${({ theme }) =>
      theme.colors.secondary + "22"}; // Lighter orange active bg
    color: ${({ theme }) => theme.colors.secondary};
    font-weight: 600;
    border-left: 3px solid ${({ theme }) => theme.colors.secondary};
    padding-left: calc(${({ theme }) => theme.spacing[3]} - 3px);
  }

  svg {
    margin-right: ${({ theme }) => theme.spacing[2.5]};
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    opacity: 0.8;
  }
  &.active svg {
    opacity: 1;
  }
`;

const SectionHeader = styled.h4`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textLighter};
  text-transform: uppercase;
  font-weight: 600;
  margin-top: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[1.5]};
  padding: 0 ${({ theme }) => theme.spacing[3]};
  &:first-of-type {
    margin-top: 0;
  }
`;

const AdminSidebar = () => {
  const menuItems = [
    {
      group: "콘텐츠 관리",
      items: [
        { path: "/admin/movies", label: "영화 관리", icon: <Film /> },
        { path: "/admin/actors", label: "배우 관리", icon: <Users /> },
        { path: "/admin/genres", label: "장르 관리", icon: <Tag /> },
        { path: "/admin/ratings", label: "등급 관리", icon: <BarChart2 /> },
        { path: "/admin/distributors", label: "배급사 관리", icon: <Video /> },
      ],
    },
    {
      group: "상영 관리",
      items: [
        { path: "/admin/rooms", label: "상영관 관리", icon: <Tv2 /> },
        {
          path: "/admin/schedules",
          label: "상영 스케줄 관리",
          icon: <CalendarDays />,
        },
      ],
    },
    {
      group: "운영 관리",
      items: [
        {
          path: "/admin/ticket-types",
          label: "티켓 종류 관리",
          icon: <Edit3 />,
        },
        {
          path: "/admin/prices",
          label: "가격 설정 관리",
          icon: <DollarSign />,
        },
      ],
    },
    {
      group: "고객 서비스",
      items: [
        {
          path: "/admin/reviews",
          label: "리뷰 관리",
          icon: <MessageSquare />,
        },
        {
          path: "/admin/discounts",
          label: "할인 관리",
          icon: <Percent />,
        },
        {
          path: "/admin/customers",
          label: "고객 관리",
          icon: <UserCheck />,
        },
      ],
    },
    {
      group: "계정 관리",
      items: [
        {
          path: "/admin/delete-account",
          label: "관리자 탈퇴",
          icon: <UserX />,
        },
      ],
    },
  ];

  return (
    <SidebarWrapper>
      <NavList>
        {menuItems.map((group) => (
          <React.Fragment key={group.group}>
            <SectionHeader>{group.group}</SectionHeader>
            {group.items.map((item) => (
              <li key={item.path}>
                <NavItemLink to={item.path}>
                  {item.icon} &nbsp;&nbsp;
                  {item.label}
                </NavItemLink>
              </li>
            ))}
          </React.Fragment>
        ))}
      </NavList>
    </SidebarWrapper>
  );
};

export default AdminSidebar;
