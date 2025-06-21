// src/components/movie/MovieCard.js
import React from "react";
import styled from "styled-components";
import { PLACEHOLDER_POSTER_URL } from "../../constants/config"; // For fallback image

const CardWrapper = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  overflow: hidden;
  cursor: pointer;
  transition: transform all 0.3s ease-out;,
    box-shadow ${({ theme }) => theme.transitions.base};
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease-out;
  &:hover {
    transform: translateY(-${({ theme }) => theme.spacing[1]});
    box-shadow: 0 8px 16px ${({ theme }) => theme.colors.primary + "40"};
  }
`;

const PosterImageContainer = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 2 / 3; /* Common poster aspect ratio */
  background-color: ${({ theme }) =>
    theme.colors.surfaceLight}; /* Placeholder bg */

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const HoverOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(0, 0, 0, 0.4) 40%,
    transparent 100%
  );
  opacity: 0;
  transition: opacity ${({ theme }) => theme.transitions.short};
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: ${({ theme }) => theme.spacing[3]};

  ${CardWrapper}:hover & {
    opacity: 1;
  }
`;

const BookButtonSmall = styled.button`
  // Renamed to avoid conflict with common/Button
  font-size: ${({ theme }) => theme.fontSizes.xs};
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing[1.5]}
    ${({ theme }) => theme.spacing[2]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: none;
  width: 100%;
  font-weight: 500;
  transition: background-color ${({ theme }) => theme.transitions.short};

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
  }
`;

const InfoSection = styled.div`
  padding: ${({ theme }) => theme.spacing[3]};
  flex-grow: 1; /* Allows this section to take up remaining space if needed */
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* Pushes details to the bottom if title is short */
`;

const Title = styled.h4`
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: ${({ theme }) => theme.spacing[1]};
  line-height: 1.3;
`;

const Details = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textLighter};
  margin-top: ${({ theme }) => theme.spacing[2]};
`;

/**
 * MovieCard Component
 * @param {object} props
 * @param {MovieResponseDto} props.movie - The movie data.
 * @param {function} props.onMovieSelect - Function to call when card is clicked.
 * @param {boolean} props.showBookingButton - Whether to show booking button text.
 */
const MovieCard = ({ movie, onMovieSelect, showBookingButton = false }) => {
  if (!movie) return null;

  // MovieResponseDto has movieRating.ratingName and voteAverage (if available from API)
  const displayRating = movie.voteAverage
    ? (movie.voteAverage / 2).toFixed(1)
    : parseFloat(movie.ratingFallback || "0").toFixed(1); // Example if API has voteAverage out of 10
  const ageRatingDisplay =
    movie.movieRating?.ratingName?.replace(" 관람가", "").substring(0, 3) ||
    "전체";

  const handleImageError = (e) => {
    e.target.src = PLACEHOLDER_POSTER_URL(
      300,
      450,
      movie.title.substring(0, 10)
    );
    e.target.style.objectFit = "contain"; // Or 'cover' with text
  };

  const handleCardClick = (e) => {
    // Check if the click target is the button itself or its child
    if (e.target.closest("button")) {
      e.stopPropagation(); // Prevent card click if button is clicked
      onMovieSelect(movie, showBookingButton); // Pass showBookingButton flag indicating booking intent
    } else {
      onMovieSelect(movie, showBookingButton);
    }
  };

  return (
    <CardWrapper onClick={handleCardClick}>
      <PosterImageContainer>
        <img
          src={
            movie.posterUrl ||
            PLACEHOLDER_POSTER_URL(300, 450, movie.title.substring(0, 10))
          }
          alt={movie.title}
          onError={handleImageError}
          loading="lazy"
        />
        <HoverOverlay>
          <BookButtonSmall>
            {showBookingButton ? "예매하기" : "상세/예매"}
          </BookButtonSmall>
        </HoverOverlay>
      </PosterImageContainer>
      <InfoSection>
        <div>
          <Title title={movie.title}>{movie.title}</Title>
        </div>
        <Details>
          <span>⭐ {displayRating}</span>
          <span>{ageRatingDisplay}</span>
        </Details>
      </InfoSection>
    </CardWrapper>
  );
};

export default MovieCard;
