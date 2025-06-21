// src/pages/HomePage.js
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import FeaturedMovie from "../components/movie/FeaturedMovie";
import MovieCard from "../components/movie/MovieCard";
import * as movieService from "../services/movieService"; // movieService 임포트
import { separateMoviesByStatus } from "../utils/dateUtils"; // 날짜 유틸리티 함수 임포트

const HomePageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[12]};
  max-width: ${({ theme }) => theme.breakpoints.xl};
  margin-left: auto;
  margin-right: auto;
`;

const Section = styled.section``;

const UpcomingSection = styled(Section)`
  margin-bottom: ${({ theme }) => theme.spacing[16]};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  color: ${({ theme }) => theme.colors.primaryLight};

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
  },
`;

const LoadingPlaceholder = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  color: ${({ theme }) => theme.colors.textLighter};
  font-size: ${({ theme }) => theme.fontSizes.lg};
`;

const ErrorMessageUI = styled(LoadingPlaceholder)`
  color: ${({ theme }) => theme.colors.error};
`;

const SkeletonMovieCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing[3]};
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .poster-skeleton {
    width: 100%;
    aspect-ratio: 2 / 3;
    background-color: ${({ theme }) => theme.colors.surfaceLight};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    margin-bottom: ${({ theme }) => theme.spacing[2]};
  }
  .title-skeleton {
    height: ${({ theme }) => theme.fontSizes.base};
    width: 75%;
    background-color: ${({ theme }) => theme.colors.surfaceLight};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    margin-bottom: ${({ theme }) => theme.spacing[1]};
  }
  .detail-skeleton {
    height: ${({ theme }) => theme.fontSizes.xs};
    width: 50%;
    background-color: ${({ theme }) => theme.colors.surfaceLight};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
  }
`;

const HomePage = () => {
  const [allMovies, setAllMovies] = useState([]);
  const [currentlyShowing, setCurrentlyShowing] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const moviesData = await movieService.getPublicAllMovies();
        if (moviesData && moviesData.length > 0) {
          setAllMovies(moviesData);

          // 영화를 현재 상영중과 개봉예정으로 분류
          const { currentlyShowing: showing, upcoming } =
            separateMoviesByStatus(moviesData);
          setCurrentlyShowing(showing);
          setUpcomingMovies(upcoming);

          // 피처드 영화는 현재 상영중인 영화 중 첫 번째 또는 전체 영화 중 첫 번째
          setFeaturedMovie(showing.length > 0 ? showing[0] : moviesData[0]);
        } else {
          setAllMovies([]);
          setCurrentlyShowing([]);
          setUpcomingMovies([]);
        }
      } catch (err) {
        console.error("Failed to fetch public movies for HomePage:", err);
        setError(err.message || "영화 목록을 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMovies();
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
    return (
      <HomePageWrapper>
        <Section>
          <div
            style={{
              height: "450px",
              backgroundColor: "var(--surface-color)",
              borderRadius: "12px",
              animation: "pulse 1.5s infinite",
            }}
          ></div>
        </Section>
        <Section>
          <SectionTitle>현재 상영중</SectionTitle>
          <MovieGrid>
            {[...Array(6)].map((_, index) => (
              <SkeletonMovieCard key={index}>
                <div className="poster-skeleton"></div>
                <div className="title-skeleton"></div>
                <div className="detail-skeleton"></div>
              </SkeletonMovieCard>
            ))}
          </MovieGrid>
        </Section>
      </HomePageWrapper>
    );
  }

  if (error) {
    return <ErrorMessageUI>{error}</ErrorMessageUI>;
  }

  return (
    <HomePageWrapper>
      {featuredMovie && (
        <Section>
          <FeaturedMovie
            movie={featuredMovie}
            onMovieSelect={handleMovieSelect}
          />
        </Section>
      )}

      <Section>
        <SectionTitle>현재 상영중</SectionTitle>
        {currentlyShowing.length > 0 ? (
          <MovieGrid>
            {currentlyShowing.map((movie) => (
              <MovieCard
                key={movie.movieId}
                movie={movie}
                onMovieSelect={handleMovieSelect}
              />
            ))}
          </MovieGrid>
        ) : (
          <p>현재 상영중인 영화가 없습니다.</p>
        )}
      </Section>

      <UpcomingSection>
        <SectionTitle>개봉 예정</SectionTitle>
        {upcomingMovies.length > 0 ? (
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
        ) : (
          <p>개봉 예정인 영화가 없습니다.</p>
        )}
      </UpcomingSection>
    </HomePageWrapper>
  );
};

export default HomePage;
