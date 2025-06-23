// src/pages/MovieDetailPage.js
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useParams, useNavigate } from "react-router-dom";
import MovieDetailsDisplay from "../components/movie/MovieDetailsDisplay";
import ReviewSection from "../components/movie/ReviewSection";
import Button from "../components/common/Button";
import * as movieService from "../services/movieService";
import * as screeningService from "../services/screeningService"; // Ensure this is correct path
import { formatDate, formatTime, getTodayDateString } from "../utils/dateUtils";

const DetailPageWrapper = styled.div`
  max-width: ${({ theme }) => theme.breakpoints.xl};
  padding: ${({ theme }) => theme.spacing[4]} 0;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  margin-top: ${({ theme }) => theme.spacing[6]};
  margin-left: auto;
  margin-right: auto;
  margin-bottom: ${({ theme }) => theme.spacing[16]};
`;

const ContentContainer = styled.div`
  padding: ${({ theme }) => theme.spacing[4]};
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing[6]};
  }
  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    padding: ${({ theme }) => theme.spacing[8]};
  }
`;

const ShowtimesSection = styled.section`
  margin-top: ${({ theme }) => theme.spacing[8]};
  padding-top: ${({ theme }) => theme.spacing[6]};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const ShowtimesTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const ShowtimesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: ${({ theme }) => theme.spacing[3]};
`;

const ShowtimeCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  padding: ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  text-align: center;

  .time {
    font-size: ${({ theme }) => theme.fontSizes.lg};
    font-weight: bold;
    color: ${({ theme }) => theme.colors.primaryLight};
    margin-bottom: ${({ theme }) => theme.spacing[1]};
  }
  .room {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.textLighter};
    margin-bottom: ${({ theme }) => theme.spacing[1]};
  }
  .seats {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    color: ${({ theme }) => theme.colors.primaryLight};
  }
`;

const LoadingPlaceholder = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: ${({ theme }) => theme.colors.textLighter};
  font-size: ${({ theme }) => theme.fontSizes.xl};
`;

const ErrorMessageUI = styled(LoadingPlaceholder)`
  color: ${({ theme }) => theme.colors.error};
`;

const BookNowButtonContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing[8]};
  text-align: center;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    text-align: left;
  }
`;

const MovieDetailPage = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [movieDetails, setMovieDetails] = useState(null);
  const [screeningsToday, setScreeningsToday] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!movieId) {
      setError("영화 ID가 제공되지 않았습니다.");
      setIsLoading(false);
      return;
    }

    const fetchDetailsAndScreenings = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // 사용자용 API가 없으므로 목업 데이터를 사용하는 서비스 함수 호출
        const detailsData = await movieService.getPublicMovieById(movieId);
        setMovieDetails(detailsData);

        if (detailsData) {
          const today = getTodayDateString();
          // 사용자용 API가 없으므로 목업 데이터를 사용하는 서비스 함수 호출
          const screeningsData =
            await screeningService.getPublicScreeningsForMovieDate(
              movieId,
              today
            );
          setScreeningsToday(screeningsData || []);
        } else {
          setError("영화를 찾을 수 없습니다.");
        }
      } catch (err) {
        console.error(
          "Failed to fetch public movie details or screenings:",
          err
        );
        setError(
          err.message ||
            "영화 상세 정보 또는 상영 시간을 불러오는데 실패했습니다."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetailsAndScreenings();
  }, [movieId]);

  const handleBookNow = () => {
    if (movieDetails) {
      navigate(`/booking/${movieDetails.movieId}`, {
        state: { movieTitle: movieDetails.title },
      });
    }
  };

  if (isLoading) {
    return <LoadingPlaceholder>영화 정보를 불러오는 중...</LoadingPlaceholder>;
  }

  if (error) {
    return <ErrorMessageUI>{error}</ErrorMessageUI>;
  }

  if (!movieDetails) {
    return <ErrorMessageUI>영화 정보를 찾을 수 없습니다.</ErrorMessageUI>;
  }

  const sortedScreeningsToday = screeningsToday.sort((a, b) => {
    const timeA = a.screeningStartTime || a.screeningTime || "";
    const timeB = b.screeningStartTime || b.screeningTime || "";
    return timeA.localeCompare(timeB);
  });

  return (
    <DetailPageWrapper>
      <ContentContainer>
        <MovieDetailsDisplay movie={movieDetails} />

        <ShowtimesSection>
          <ShowtimesTitle>
            상영 시간표 (오늘:{" "}
            {(() => {
              const today = getTodayDateString();
              console.log("MovieDetailPage - getTodayDateString():", today);
              const formatted = formatDate(today);
              console.log("MovieDetailPage - formatDate result:", formatted);
              return formatted;
            })()}
            )
          </ShowtimesTitle>
          {sortedScreeningsToday.length > 0 ? (
            <ShowtimesGrid>
              {sortedScreeningsToday.map((screening) => (
                <ShowtimeCard key={screening.screeningId}>
                  <p className="time">
                    {screening.screeningStartTime
                      ? formatTime(screening.screeningStartTime)
                      : screening.screeningTime
                      ? screening.screeningTime.includes("T")
                        ? formatTime(screening.screeningTime.substring(11, 16))
                        : formatTime(screening.screeningTime)
                      : "시간 미정"}
                  </p>
                  <p className="room">
                    {screening.roomName ||
                      screening.screeningRoom?.roomName ||
                      "상영관 미정"}
                  </p>
                  <p className="seats">
                    {(screening.availableSeatsCount ||
                      screening.availableSeats ||
                      0) > 0
                      ? `${
                          screening.availableSeatsCount ||
                          screening.availableSeats
                        }석 남음`
                      : "매진"}
                  </p>
                </ShowtimeCard>
              ))}
            </ShowtimesGrid>
          ) : (
            <p>오늘 상영 정보가 없습니다.</p>
          )}
        </ShowtimesSection>

        <BookNowButtonContainer>
          <Button
            variant="primary"
            size="lg"
            onClick={handleBookNow}
            disabled={!movieDetails || screeningsToday.length === 0}
            title={
              screeningsToday.length === 0
                ? "오늘 상영 일정이 없습니다."
                : "예매하기"
            }
          >
            예매하기
          </Button>
        </BookNowButtonContainer>

        <ReviewSection
          movieId={movieDetails.movieId}
          movieTitle={movieDetails.title}
        />
      </ContentContainer>
    </DetailPageWrapper>
  );
};

export default MovieDetailPage;
