import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useParams, useNavigate } from "react-router-dom";
import * as actorService from "../services/actorService";
import { formatDate } from "../utils/dateUtils";
import { PLACEHOLDER_PROFILE_URL } from "../constants/config";

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

const DetailsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[6]};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-direction: row;
    gap: ${({ theme }) => theme.spacing[8]};
  }
`;

const ProfileColumn = styled.div`
  flex-shrink: 0;
  width: 100%;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    width: 300px;
  }
  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    width: 350px;
  }
`;

const ProfileImage = styled.img`
  width: 100%;
  height: auto;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  background-color: ${({ theme }) => theme.colors.surfaceLight};
`;

const InfoColumn = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const ActorName = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes["3xl"]};
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primaryLight};
  margin-bottom: ${({ theme }) => theme.spacing[3]};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.fontSizes["4xl"]};
  }
`;

const InfoBlock = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[3]};

  strong {
    color: ${({ theme }) => theme.colors.text};
    font-weight: 500;
  }
  p,
  span {
    color: ${({ theme }) => theme.colors.textDark};
    font-size: ${({ theme }) => theme.fontSizes.base};
    line-height: 1.6;
  }
`;

const Biography = styled.p`
  color: ${({ theme }) => theme.colors.textDark};
  line-height: 1.7;
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  white-space: pre-wrap;
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

const FilmographySection = styled.section`
  margin-top: ${({ theme }) => theme.spacing[8]};
  padding-top: ${({ theme }) => theme.spacing[6]};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const FilmographyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing[4]};
`;

const MovieCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
  }
`;

const MoviePoster = styled.img`
  width: 100%;
  height: 250px;
  object-fit: cover;
  background-color: ${({ theme }) => theme.colors.border};
`;

const MovieInfo = styled.div`
  padding: ${({ theme }) => theme.spacing[3]};

  .title {
    font-weight: bold;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing[1]};
  }

  .year {
    color: ${({ theme }) => theme.colors.textLighter};
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fontSizes.base};
  cursor: pointer;
  margin-bottom: ${({ theme }) => theme.spacing[4]};

  &:hover {
    text-decoration: underline;
  }
`;

const ActorDetailPage = () => {
  const { actorId } = useParams();
  const navigate = useNavigate();
  const [actorDetails, setActorDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!actorId) {
      setError("배우 ID가 제공되지 않았습니다.");
      setIsLoading(false);
      return;
    }

    const fetchActorDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const actorData = await actorService.getPublicActorById(actorId);
        setActorDetails(actorData);
      } catch (err) {
        console.error("Failed to fetch actor details:", err);
        setError(err.message || "배우 상세 정보를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchActorDetails();
  }, [actorId]);

  const handleImageError = (e) => {
    e.target.src = PLACEHOLDER_PROFILE_URL(
      300,
      actorDetails?.name?.substring(0, 5) || "배우"
    );
  };

  const handleMovieClick = (movie) => {
    navigate(`/movies/${movie.movieId}`);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return <LoadingPlaceholder>배우 정보를 불러오는 중...</LoadingPlaceholder>;
  }

  if (error) {
    return <ErrorMessageUI>{error}</ErrorMessageUI>;
  }

  if (!actorDetails) {
    return <ErrorMessageUI>배우 정보를 찾을 수 없습니다.</ErrorMessageUI>;
  }

  return (
    <DetailPageWrapper>
      <ContentContainer>
        <BackButton onClick={handleGoBack}>← 뒤로 가기</BackButton>

        <DetailsWrapper>
          <ProfileColumn>
            <ProfileImage
              src={
                actorDetails.profileImageUrl ||
                PLACEHOLDER_PROFILE_URL(
                  300,
                  actorDetails.name?.substring(0, 5) || "배우"
                )
              }
              alt={`${actorDetails.name} 프로필`}
              onError={handleImageError}
            />
          </ProfileColumn>

          <InfoColumn>
            <ActorName>{actorDetails.name}</ActorName>

            {actorDetails.birthDate && (
              <InfoBlock>
                <strong>생년월일: </strong>
                <span>
                  {formatDate(actorDetails.birthDate, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </InfoBlock>
            )}

            {actorDetails.biography && (
              <InfoBlock>
                <strong>소개:</strong>
                <Biography>{actorDetails.biography}</Biography>
              </InfoBlock>
            )}
          </InfoColumn>
        </DetailsWrapper>

        {actorDetails.filmography && actorDetails.filmography.length > 0 && (
          <FilmographySection>
            <SectionTitle>출연 작품</SectionTitle>
            <FilmographyGrid>
              {actorDetails.filmography.map((movie) => (
                <MovieCard
                  key={movie.movieId}
                  onClick={() => handleMovieClick(movie)}
                >
                  <MoviePoster
                    src={
                      movie.posterUrl || PLACEHOLDER_PROFILE_URL(200, "포스터")
                    }
                    alt={`${movie.title} 포스터`}
                    onError={(e) => {
                      e.target.src = PLACEHOLDER_PROFILE_URL(200, "포스터");
                    }}
                  />
                  <MovieInfo>
                    <div className="title">{movie.title}</div>
                    <div className="year">{movie.releaseYear}년</div>
                  </MovieInfo>
                </MovieCard>
              ))}
            </FilmographyGrid>
          </FilmographySection>
        )}
      </ContentContainer>
    </DetailPageWrapper>
  );
};

export default ActorDetailPage;
