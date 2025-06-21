// src/components/layout/Footer.js
import React from "react";
import styled from "styled-components";

const FooterWrapper = styled.footer`
  background-color: ${({ theme }) =>
    theme.colors.surfaceDarker}; /* bg-gray-950 */
  border-top: 1px solid ${({ theme }) => theme.colors.border + "80"}; /* border-gray-700/50 */
  color: ${({ theme }) => theme.colors.textLighter};
  padding: ${({ theme }) => theme.spacing[12]} 0;
  padding-bottom: ${({ theme }) => theme.spacing[4]};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  text-align: center; /* Default to center for bottom text */
`;

const FooterContainer = styled.div`
  /* Uses .container class from GlobalStyles or define here */
  width: 100%;
  max-width: ${({ theme }) => theme.breakpoints.xl};
  margin-left: auto;
  margin-right: auto;
  padding-left: ${({ theme }) => theme.spacing[4]};
  padding-right: ${({ theme }) => theme.spacing[4]};
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing[8]};
  margin-bottom: ${({ theme }) => theme.spacing[8]};
  text-align: left; /* Align grid items to left */

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const FooterSection = styled.div``;

const SectionTitle = styled.h3`
  /* Was h4 in original */
  font-size: ${({ theme }) => theme.fontSizes.lg}; /* Was md */
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textDark};
  margin-bottom: ${({ theme }) => theme.spacing[3]};

  ${({ isLogo }) =>
    isLogo &&
    `
    color: ${({ theme }) => theme.colors.primaryLight};
  `}
`;

const FooterLinkList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1.5]}; /* space-y-1 like */
`;

const FooterLink = styled.a`
  color: ${({ theme }) => theme.colors.textLighter};
  text-decoration: none;
  &:hover {
    color: ${({ theme }) => theme.colors.primaryLight};
    text-decoration: none;
  }
`;

const CopyrightSection = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border + "80"};
  padding-top: ${({ theme }) => theme.spacing[8]};
  font-size: ${({ theme }) => theme.fontSizes.xs};

  p {
    margin-bottom: ${({ theme }) => theme.spacing[1.5]};
    color: ${({ theme }) => theme.colors.textLighter};
  }
`;

const Footer = () => {
  return (
    <FooterWrapper>
      <FooterContainer>
        <GridContainer>
          <FooterSection>
            <SectionTitle isLogo>PICOBOX</SectionTitle>
            <p>최고의 영화 경험을 PICOBOX에서 만나보세요.</p>
          </FooterSection>
          <FooterSection>
            <SectionTitle>고객센터</SectionTitle>
            <p>1588-XXXX (오전 9시 ~ 오후 6시)</p>
            <p>uospicobox@gmail.com</p>
          </FooterSection>
          <FooterSection>
            <SectionTitle>바로가기</SectionTitle>
            <FooterLinkList>
              <li>
                <FooterLink href="#">회사소개</FooterLink>
              </li>
              <li>
                <FooterLink href="#">이용약관</FooterLink>
              </li>
              <li>
                <FooterLink href="#">개인정보처리방침</FooterLink>
              </li>
              <li>
                <FooterLink href="#">FAQ</FooterLink>
              </li>
            </FooterLinkList>
          </FooterSection>
        </GridContainer>
        <CopyrightSection>
          <p>
            &copy; {new Date().getFullYear()} PICOBOX Inc. All rights reserved.
          </p>
          <p>주소: 서울특별시 동대문구 서울시립대로 163</p>
        </CopyrightSection>
      </FooterContainer>
    </FooterWrapper>
  );
};

export default Footer;
