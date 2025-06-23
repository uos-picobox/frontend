// src/components/movie/MovieDetailsDisplay.js
import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { formatDate, formatTime } from "../../utils/dateUtils";
import { PLACEHOLDER_POSTER_URL } from "../../constants/config";

const DetailsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[6]};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-direction: row;
    gap: ${({ theme }) => theme.spacing[8]};
  }
`;

const PosterColumn = styled.div`
  flex-shrink: 0;
  width: 100%; /* Full width on mobile */

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    width: 300px; /* Fixed width on desktop, e.g. md:w-1/3 */
  }
  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    width: 350px;
  }
`;

const PosterImage = styled.img`
  width: 100%;
  height: auto;
  aspect-ratio: 2/3;
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

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes["3xl"]};
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primaryLight};
  margin-bottom: ${({ theme }) => theme.spacing[3]};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.fontSizes["4xl"]};
  }
`;

const MetaInfoBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  color: ${({ theme }) => theme.colors.textDark};
  font-size: ${({ theme }) => theme.fontSizes.sm};

  span {
    display: inline-flex;
    align-items: center;
  }

  .separator {
    display: none; /* Hidden by default */
    @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
      display: inline; /* Show on sm and up */
      margin: 0 ${({ theme }) => theme.spacing[1]};
    }
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

const CastList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[3]};

  span {
    background-color: ${({ theme }) => theme.colors.surfaceLight};
    padding: ${({ theme }) => theme.spacing[1]}
      ${({ theme }) => theme.spacing[2]};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    font-size: ${({ theme }) => theme.fontSizes.xs};
  }
`;

const ActorSpan = styled.span`
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[2]};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary + "33"};
    color: ${({ theme }) => theme.colors.primaryLight};
  }
`;

const GenresList = styled(CastList)`
  span {
    background-color: ${({ theme }) => theme.colors.primary + "33"};
    color: ${({ theme }) => theme.colors.primaryLight};
  }
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.textDark};
  line-height: 1.7;
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  white-space: pre-wrap; /* Preserve line breaks from description */
`;

/**
 * MovieDetailsDisplay Component
 * @param {object} props
 * @param {MovieResponseDto} props.movie - The detailed movie data.
 */
const MovieDetailsDisplay = ({ movie }) => {
  const navigate = useNavigate();

  if (!movie) return <p>영화를 불러오는 중...</p>; // Or a more sophisticated loader

  const handleImageError = (e) => {
    e.target.src = PLACEHOLDER_POSTER_URL(
      400,
      600,
      movie.title.substring(0, 10)
    );
  };

  const handleActorClick = (actorId) => {
    navigate(`/actors/${actorId}`);
  };

  // MovieResponseDto has voteAverage
  const displayRating = movie.voteAverage
    ? (movie.voteAverage / 2).toFixed(1)
    : parseFloat(movie.ratingFallback || "0").toFixed(1);

  return (
    <DetailsWrapper>
      <PosterColumn>
        <PosterImage
          src={
            movie.posterUrl ||
            PLACEHOLDER_POSTER_URL(400, 600, movie.title.substring(0, 10))
          }
          alt={`${movie.title} poster`}
          onError={handleImageError}
        />
      </PosterColumn>
      <InfoColumn>
        <Title>{movie.title}</Title>
        <MetaInfoBar>
          <span>⭐ {displayRating || "N/A"}</span>
          <span className="separator">|</span>
          <span>{movie.duration}분</span>
          <span className="separator">|</span>
          <span>{movie.movieRating?.ratingName || "등급 미정"}</span>
          <span className="separator">|</span>
          <span>
            개봉:{" "}
            {movie.releaseDate
              ? formatDate(movie.releaseDate, {
                  year: "numeric",
                  month: "numeric",
                  day: "numeric",
                })
              : "미정"}
          </span>
        </MetaInfoBar>

        <InfoBlock>
          <strong>감독: </strong>
          <span>{movie.director || "정보 없음"}</span>
        </InfoBlock>

        {movie.genres && movie.genres.length > 0 && (
          <InfoBlock>
            <strong>장르: </strong>
            <GenresList>
              {movie.genres.map((genre) => (
                <span key={genre.genreId}>{genre.genreName}</span>
              ))}
            </GenresList>
          </InfoBlock>
        )}

        {movie.distributor && (
          <InfoBlock>
            <strong>배급사: </strong>
            <span>{movie.distributor.name}</span>
          </InfoBlock>
        )}

        {movie.movieCasts && movie.movieCasts.length > 0 && (
          <InfoBlock>
            <strong>출연:</strong>
            <CastList>
              {movie.movieCasts.map((castMember) => (
                <ActorSpan
                  key={castMember.actor.actorId}
                  onClick={() => handleActorClick(castMember.actor.actorId)}
                >
                  {castMember.actor.name} ({castMember.role})
                </ActorSpan>
              ))}
            </CastList>
          </InfoBlock>
        )}

        {movie.language && (
          <InfoBlock>
            <strong>언어: </strong>
            <span>{movie.language}</span>
          </InfoBlock>
        )}

        <InfoBlock>
          <strong>줄거리:</strong>
          <Description>
            {movie.description || "줄거리 정보가 없습니다."}
          </Description>
        </InfoBlock>

        {/* Trailer section can be added here if movie.trailerUrl exists */}
        {/* {movie.trailerUrl && (
          <InfoBlock>
            <strong>예고편:</strong>
            <TrailerPlayer src={movie.trailerUrl} />
          </InfoBlock>
        )} */}
      </InfoColumn>
    </DetailsWrapper>
  );
};

export default MovieDetailsDisplay;
