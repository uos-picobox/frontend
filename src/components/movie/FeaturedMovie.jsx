// src/components/movie/FeaturedMovie.js
import React from "react";
import styled from "styled-components";
import Button from "../common/Button";
import { PLACEHOLDER_POSTER_URL } from "../../constants/config";

const FeaturedSection = styled.section`
  position: relative;
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  cursor: pointer;
  transition: transform 0.5s ease, box-shadow 0.5s ease;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
  }
`;

const FeaturedImage = styled.img`
  width: 100%;
  height: 300px; // h-64
  object-fit: cover;
  display: block;
  transition: transform ${({ theme }) => theme.transitions.long};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    height: 450px;
  }
`;

const GradientOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.9) 0%,
    rgba(0, 0, 0, 0.6) 30%,
    rgba(0, 0, 0, 0.2) 60%,
    transparent 100%
  );
`;

const ContentContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: ${({ theme }) => theme.spacing[6]}; // p-6

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing[10]}; // md:p-10
  }
`;

const FeaturedTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes["3xl"]};
  font-weight: bold;
  color: ${({ theme }) => theme.colors.white};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.fontSizes["5xl"]};
  }
`;

const FeaturedDescription = styled.p`
  color: ${({ theme }) => theme.colors.textDark};
  font-size: ${({ theme }) => theme.fontSizes.sm}; // text-sm
  margin-bottom: ${({ theme }) => theme.spacing[4]}; // mb-3 md:mb-5
  max-width: 600px; // max-w-2xl
  line-height: 1.5;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);

  /* line-clamp-2 equivalent */
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2; /* Show 2 lines, then ellipsis */
  max-height: calc(1.5em * 2 * 1.5); /* Approx height for 2 lines */

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.fontSizes.lg}; // md:text-lg
    -webkit-line-clamp: 3; /* Show 3 lines on larger screens */
    max-height: calc(1.5em * 3 * 1.5);
  }
`;

/**
 * FeaturedMovie Component
 * @param {object} props
 * @param {MovieResponseDto} props.movie - The featured movie.
 * @param {function} props.onMovieSelect - Function to call when selected.
 */
const FeaturedMovie = ({ movie, onMovieSelect }) => {
  if (!movie) return null;

  const handleImageError = (e) => {
    // For featured, a larger placeholder
    e.target.src = PLACEHOLDER_POSTER_URL(1200, 500, "Featured Image Error");
  };

  // Use posterUrl if available, try to get a larger version if API supports it
  // Original code used .replace('300x450', '1200x500') which is placeholder specific
  // For real API, posterUrl might be the only version or you might have different fields for different sizes.
  const imageUrl =
    movie.backdropUrl ||
    movie.posterUrl ||
    PLACEHOLDER_POSTER_URL(1200, 500, movie.title);

  return (
    <FeaturedSection onClick={() => onMovieSelect(movie)}>
      <FeaturedImage
        src={imageUrl}
        alt={movie.title}
        onError={handleImageError}
      />
      <GradientOverlay />
      <ContentContainer>
        <FeaturedTitle>{movie.title}</FeaturedTitle>
        <FeaturedDescription>{movie.description}</FeaturedDescription>
        <Button
          variant="primary"
          size="md"
          onClick={(e) => {
            e.stopPropagation(); // Prevent section's onClick if button is clicked
            onMovieSelect(movie, true); // true indicates intent to book/see details immediately
          }}
        >
          상세보기 및 예매
        </Button>
      </ContentContainer>
    </FeaturedSection>
  );
};

export default FeaturedMovie;
