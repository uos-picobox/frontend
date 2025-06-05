// src/pages/NotFoundPage.js
import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom"; // Link 추가
import Button from "../components/common/Button";

const NotFoundWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: ${({ theme }) => theme.spacing[8]};
  color: ${({ theme }) => theme.colors.textLighter};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["5xl"]};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

const Subtitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  color: ${({ theme }) => theme.colors.textDark};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const Message = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  margin-bottom: ${({ theme }) => theme.spacing[8]};
`;

const NotFoundPage = () => {
  return (
    <NotFoundWrapper>
      <Title>404</Title>
      <Subtitle>페이지를 찾을 수 없습니다.</Subtitle>
      <Message>
        요청하신 페이지가 존재하지 않거나, 이동되었을 수 있습니다.
      </Message>
      <Button as={Link} to="/" variant="primary" size="lg">
        {" "}
        {/* Button styled as Link */}
        홈으로 돌아가기
      </Button>
    </NotFoundWrapper>
  );
};

export default NotFoundPage;
