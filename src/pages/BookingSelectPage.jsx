import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import * as movieService from "../services/movieService";
import MovieCard from "../components/movie/MovieCard";
import { separateMoviesByStatus } from "../utils/dateUtils";

const PageWrapper = styled.div`
  width: 100%;
  max-width: ${({ theme }) => theme.breakpoints.xl};
  margin-left: auto;
  margin-right: auto;
  padding: ${({ theme }) => theme.spacing[6]} ${({ theme }) => theme.spacing[4]};
`;

const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["3xl"]};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textDark};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  text-align: center;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.fontSizes["4xl"]};
  }
`;

const PageSubtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.textLighter};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing[8]};
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

const ErrorMessage = styled(LoadingPlaceholder)`
  color: ${({ theme }) => theme.colors.error};
`;

const EmptyMessage = styled(LoadingPlaceholder)`
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
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

const InfoMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.primary + "40"};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  text-align: center;
`;

const BookingSelectPage = () => {
  const [currentlyShowing, setCurrentlyShowing] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
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
        console.error("Failed to fetch movies for booking selection:", err);
        setError(err.message || "영화 목록을 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMovies();
  }, []);

  const handleMovieSelect = (movie) => {
    navigate(`/booking/${movie.movieId}`, {
      state: { movieTitle: movie.title },
    });
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <PageTitle>예매하기</PageTitle>
        <PageSubtitle>예매할 영화를 선택해주세요</PageSubtitle>
        <MovieGrid>
          {[...Array(8)].map((_, index) => (
            <SkeletonMovieCard key={index}>
              <div className="poster-skeleton"></div>
              <div className="title-skeleton"></div>
              <div className="detail-skeleton"></div>
            </SkeletonMovieCard>
          ))}
        </MovieGrid>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <PageTitle>예매하기</PageTitle>
        <ErrorMessage>{error}</ErrorMessage>
      </PageWrapper>
    );
  }

  const hasCurrentlyShowing = currentlyShowing.length > 0;
  const hasUpcomingMovies = upcomingMovies.length > 0;

  if (!hasCurrentlyShowing && !hasUpcomingMovies) {
    return (
      <PageWrapper>
        <PageTitle>예매하기</PageTitle>
        <EmptyMessage>
          <div>현재 상영 중인 영화가 없습니다.</div>
          <div>곧 새로운 영화가 상영될 예정입니다.</div>
        </EmptyMessage>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <PageTitle>예매하기</PageTitle>
      <PageSubtitle>예매할 영화를 선택해주세요</PageSubtitle>

      {hasCurrentlyShowing && (
        <>
          <SectionTitle>현재 상영중 (예매 가능)</SectionTitle>
          <MovieGrid>
            {currentlyShowing.map((movie) => (
              <MovieCard
                key={movie.movieId}
                movie={movie}
                onMovieSelect={(selectedMovie) =>
                  handleMovieSelect(selectedMovie)
                }
                showBookingButton={true}
              />
            ))}
          </MovieGrid>
        </>
      )}

      {hasUpcomingMovies && (
        <>
          <SectionTitle>개봉 예정 (예매 불가)</SectionTitle>
          <InfoMessage>
            아래 영화들은 아직 개봉 전이므로 예매할 수 없습니다. 상세 정보만
            확인 가능합니다.
          </InfoMessage>
          <MovieGrid>
            {upcomingMovies.map((movie) => (
              <MovieCard
                key={movie.movieId}
                movie={movie}
                onMovieSelect={(selectedMovie) =>
                  navigate(`/movies/${selectedMovie.movieId}`)
                }
                showBookingButton={true}
                isUpcoming={true}
              />
            ))}
          </MovieGrid>
        </>
      )}
    </PageWrapper>
  );
};

export default BookingSelectPage;
