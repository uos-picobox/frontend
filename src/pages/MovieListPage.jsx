// src/pages/MovieListPage.js
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import MovieCard from "../components/movie/MovieCard";
import * as movieService from "../services/movieService";
import { separateMoviesByStatus } from "../utils/dateUtils";

const PageWrapper = styled.div`
  max-width: ${({ theme }) => theme.breakpoints.xl};
  margin-left: auto;
  margin-right: auto;
  margin-bottom: ${({ theme }) => theme.spacing[16]};
  padding-top: ${({ theme }) => theme.spacing[4]};
`;

const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["3xl"]};
  color: ${({ theme }) => theme.colors.primaryLight};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  text-align: center;
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.fontSizes["4xl"]};
    text-align: left;
  }
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  margin-top: ${({ theme }) => theme.spacing[8]};
  color: ${({ theme }) => theme.colors.primaryLight};

  &:first-of-type {
    margin-top: 0;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.fontSizes["3xl"]};
  }
`;

const MovieGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing[4]};

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: repeat(4, 1fr);
    gap: ${({ theme }) => theme.spacing[6]};
  }
  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: repeat(5, 1fr);
  }
  @media (min-width: ${({ theme }) => theme.breakpoints.xl}) {
    grid-template-columns: repeat(6, 1fr);
  }
`;

const LoadingPlaceholder = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  color: ${({ theme }) => theme.colors.textLighter};
  font-size: ${({ theme }) => theme.fontSizes.lg};
`;

const ErrorMessageUI = styled(LoadingPlaceholder)`
  color: ${({ theme }) => theme.colors.error};
`;

const EmptyMessage = styled.p`
  color: ${({ theme }) => theme.colors.textLighter};
  font-size: ${({ theme }) => theme.fontSizes.base};
  text-align: center;
  margin: ${({ theme }) => theme.spacing[8]} 0;
`;

const MovieListPage = () => {
  const [currentlyShowing, setCurrentlyShowing] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllMovies = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // 사용자용 API가 없으므로 목업 데이터를 사용하는 서비스 함수 호출
        const moviesData = await movieService.getPublicAllMovies();

        if (moviesData && moviesData.length > 0) {
          // 영화를 현재 상영중과 개봉예정으로 분류
          const { currentlyShowing: showing, upcoming } =
            separateMoviesByStatus(moviesData);
          setCurrentlyShowing(showing);
          setUpcomingMovies(upcoming);
        } else {
          setCurrentlyShowing([]);
          setUpcomingMovies([]);
        }
      } catch (err) {
        console.error("Failed to fetch public movies for MovieListPage:", err);
        setError(err.message || "영화 목록을 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllMovies();
  }, []);

  const handleMovieSelect = (movie, bookNow = false) => {
    if (bookNow) {
      navigate(`/booking/${movie.movieId}`, {
        state: { movieTitle: movie.title },
      });
    } else {
      navigate(`/movies/${movie.movieId}`);
    }
  };

  if (isLoading) {
    return <LoadingPlaceholder>영화 목록을 불러오는 중...</LoadingPlaceholder>;
  }

  if (error) {
    return <ErrorMessageUI>{error}</ErrorMessageUI>;
  }

  const hasCurrentlyShowing = currentlyShowing.length > 0;
  const hasUpcomingMovies = upcomingMovies.length > 0;

  if (!hasCurrentlyShowing && !hasUpcomingMovies) {
    return (
      <PageWrapper>
        <PageTitle>전체 영화 목록</PageTitle>
        <EmptyMessage>등록된 영화가 없습니다.</EmptyMessage>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <PageTitle>전체 영화 목록</PageTitle>

      {hasCurrentlyShowing && (
        <>
          <SectionTitle>현재 상영중</SectionTitle>
          <MovieGrid>
            {currentlyShowing.map((movie) => (
              <MovieCard
                key={movie.movieId}
                movie={movie}
                onMovieSelect={handleMovieSelect}
              />
            ))}
          </MovieGrid>
        </>
      )}

      {hasUpcomingMovies && (
        <>
          <SectionTitle>개봉 예정</SectionTitle>
          <MovieGrid>
            {upcomingMovies.map((movie) => (
              <MovieCard
                key={movie.movieId}
                movie={movie}
                onMovieSelect={handleMovieSelect}
                isUpcoming={true}
              />
            ))}
          </MovieGrid>
        </>
      )}
    </PageWrapper>
  );
};

export default MovieListPage;
