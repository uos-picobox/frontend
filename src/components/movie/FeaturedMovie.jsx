// src/components/movie/FeaturedMovie.js
import React, { useState, useEffect, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import Button from "../common/Button";
import { PLACEHOLDER_POSTER_URL } from "../../constants/config";

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0%);
  }
`;

const slideOut = keyframes`
  from {
    opacity: 1;
    transform: translateX(0%);
  }
  to {
    opacity: 0;
    transform: translateX(-100%);
  }
`;

const FeaturedSection = styled.section`
  position: relative;
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
  }
`;

const CarouselContainer = styled.div`
  position: relative;
  width: 100%;
  height: 300px;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    height: 450px;
  }
`;

const MovieSlide = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: ${(props) => (props.isActive ? 1 : 0)};
  animation: ${(props) => (props.isActive ? slideIn : slideOut)} 0.5s
    ease-in-out;
  transition: opacity 0.5s ease-in-out;
`;

const FeaturedImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
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
  bottom: 60px;
  left: 0;
  right: 0;
  padding: ${({ theme }) => theme.spacing[6]};
  margin-left: ${({ theme }) => theme.spacing[12]};
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing[10]};
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
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  max-width: 600px;
  line-height: 1.5;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);

  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  max-height: calc(1.5em * 2 * 1.5);

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.fontSizes.lg};
    -webkit-line-clamp: 3;
    max-height: calc(1.5em * 3 * 1.5);
  }
`;

const NavigationButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;

  &:hover {
    background: rgba(0, 0, 0, 0.8);
    transform: translateY(-50%) scale(1.1);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  ${(props) => (props.direction === "left" ? "left: 20px;" : "right: 20px;")}
`;

const ProgressBarContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  z-index: 5;
`;

const ProgressBar = styled.div`
  height: 100%;
  background: ${({ theme }) => theme.colors.primary};
  width: ${(props) => props.progress}%;
  transition: width 0.1s linear;
`;

const DotsContainer = styled.div`
  position: absolute;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
`;

const Dot = styled.button`
  width: 6px;
  height: 6px;
  min-width: 12px;
  min-height: 12px;
  max-width: 12px;
  max-height: 12px;
  padding: 0;
  margin: 0;
  border-radius: 50%;
  border: none;
  outline: none;
  background: ${(props) =>
    props.isActive ? "white" : "rgba(255, 255, 255, 0.5)"};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: white;
    transform: scale(1.5);
  }

  &:focus {
    outline: 2px solid rgba(255, 255, 255, 0.8);
    outline-offset: 2px;
  }
`;

/**
 * FeaturedMovieCarousel Component
 * @param {object} props
 * @param {MovieResponseDto[]} props.movies - Array of movies to display.
 * @param {function} props.onMovieSelect - Function to call when selected.
 */
const FeaturedMovie = ({ movies, onMovieSelect }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // movies가 없거나 빈 배열이면 null 반환
  // if (!movies || movies.length === 0) return null;

  const totalMovies = movies?.length || 0;
  const currentMovie = movies?.[currentIndex];

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalMovies);
    setProgress(0);
  }, [totalMovies]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalMovies) % totalMovies);
    setProgress(0);
  }, [totalMovies]);

  const goToSlide = useCallback((index) => {
    setCurrentIndex(index);
    setProgress(0);
  }, []);

  // 자동 슬라이드와 프로그레스 바 관리
  useEffect(() => {
    if (isPaused || totalMovies <= 1) return;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + 100 / 50; // 5초 = 5000ms, 100ms마다 2% 증가
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, [isPaused, nextSlide, totalMovies]);

  // movies가 없거나 빈 배열이면 null 반환
  if (!movies || movies.length === 0 || !currentMovie) return null;

  const handleImageError = (e) => {
    e.target.src = PLACEHOLDER_POSTER_URL(1200, 500, "Featured Image Error");
  };

  const getImageUrl = (movie) => {
    return (
      movie.backdropUrl ||
      movie.posterUrl ||
      PLACEHOLDER_POSTER_URL(1200, 500, movie.title)
    );
  };

  return (
    <FeaturedSection
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onClick={() => onMovieSelect(currentMovie)}
    >
      <CarouselContainer>
        {movies.map((movie, index) => (
          <MovieSlide key={movie.movieId} isActive={index === currentIndex}>
            <FeaturedImage
              src={getImageUrl(movie)}
              alt={movie.title}
              onError={handleImageError}
            />
          </MovieSlide>
        ))}
        <GradientOverlay />

        {totalMovies > 1 && (
          <>
            <NavigationButton
              direction="left"
              onClick={(e) => {
                e.stopPropagation();
                prevSlide();
              }}
            >
              ‹
            </NavigationButton>
            <NavigationButton
              direction="right"
              onClick={(e) => {
                e.stopPropagation();
                nextSlide();
              }}
            >
              ›
            </NavigationButton>
          </>
        )}
      </CarouselContainer>

      <ContentContainer>
        <FeaturedTitle>{currentMovie.title}</FeaturedTitle>
        <FeaturedDescription>{currentMovie.description}</FeaturedDescription>
        <Button
          variant="primary"
          size="md"
          onClick={(e) => {
            e.stopPropagation();
            onMovieSelect(currentMovie, true);
          }}
        >
          상세보기 및 예매
        </Button>
      </ContentContainer>

      {totalMovies > 1 && (
        <>
          <DotsContainer>
            {movies.map((_, index) => (
              <Dot
                key={index}
                isActive={index === currentIndex}
                onClick={(e) => {
                  e.stopPropagation();
                  goToSlide(index);
                }}
              />
            ))}
          </DotsContainer>
          <ProgressBarContainer>
            <ProgressBar progress={progress} />
          </ProgressBarContainer>
        </>
      )}
    </FeaturedSection>
  );
};

export default FeaturedMovie;
