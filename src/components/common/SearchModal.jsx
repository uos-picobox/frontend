import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { Search, X, Film, User, Calendar, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Input from "./Input";
import Button from "./Button";
import searchService from "../../services/searchService";
import {
  PLACEHOLDER_POSTER_URL,
  PLACEHOLDER_PROFILE_URL,
} from "../../constants/config";

// 검색 전용 모달 스타일링
const SearchModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  z-index: ${({ theme }) => theme.zIndices.modal};
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  visibility: ${({ $isOpen }) => ($isOpen ? "visible" : "hidden")};
  transition: opacity 0.3s ease, visibility 0.3s ease;
  padding-top: 80px; // 상단 여백 추가
  overflow-y: auto;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding-top: 60px;
  }
`;

const SearchModalContent = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  width: 95%;
  max-width: 700px;
  position: relative;
  transform: ${({ $isOpen }) =>
    $isOpen ? "translateY(0)" : "translateY(-20px)"};
  transition: transform 0.3s ease;
  max-height: calc(100vh - 120px);
  overflow: hidden;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    width: 98%;
    max-height: calc(100vh - 80px);
  }
`;

const SearchModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[6]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surface};
`;

const SearchModalTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ theme }) => theme.colors.primaryLight};
  margin: 0;
`;

const CloseButton = styled(Button)`
  padding: ${({ theme }) => theme.spacing[2]};
  min-width: auto;
  width: 40px;
  height: 40px;
  border-radius: 50%;
`;

const SearchModalBody = styled.div`
  padding: ${({ theme }) => theme.spacing[6]};
  overflow-y: auto;
  max-height: calc(100vh - 200px);

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: ${({ theme }) => theme.spacing[4]};
    max-height: calc(100vh - 160px);
  }
`;

const SearchContainer = styled.div`
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
`;

const SearchInputContainer = styled.div`
  position: relative;
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const SearchInput = styled(Input)`
  padding-left: ${({ theme }) => theme.spacing[12]};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  height: 56px;
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: ${({ theme }) => theme.spacing[4]};
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.textLight};
  width: 20px;
  height: 20px;
  z-index: 1;
`;

const SearchHint = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textLight};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  text-align: center;
`;

const ResultsContainer = styled.div`
  max-height: 400px;
  overflow-y: auto;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const Section = styled.div`
  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }
`;

const SectionHeader = styled.div`
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  font-weight: 600;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textDark};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const ResultItem = styled.button`
  width: 100%;
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceLight};
  }

  &:focus {
    outline: none;
    background-color: ${({ theme }) => theme.colors.surfaceLight};
  }
`;

const ImageContainer = styled.div`
  width: ${({ $isActor }) => ($isActor ? "40px" : "60px")};
  height: ${({ $isActor }) => ($isActor ? "40px" : "80px")};
  border-radius: ${({ theme, $isActor }) =>
    $isActor ? "50%" : theme.borderRadius.sm};
  overflow: hidden;
  flex-shrink: 0;
  background-color: ${({ theme }) => theme.colors.surface};
`;

const ItemImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ItemInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ItemTitle = styled.div`
  font-weight: 600;
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.colors.textDark};
  margin-bottom: ${({ theme }) => theme.spacing[1]};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ItemSubtitle = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textLight};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const NoResults = styled.div`
  padding: ${({ theme }) => theme.spacing[8]} ${({ theme }) => theme.spacing[4]};
  text-align: center;
  color: ${({ theme }) => theme.colors.textLight};

  svg {
    margin-bottom: ${({ theme }) => theme.spacing[2]};
    opacity: 0.5;
  }
`;

const LoadingSpinner = styled.div`
  padding: ${({ theme }) => theme.spacing[8]} ${({ theme }) => theme.spacing[4]};
  text-align: center;
  color: ${({ theme }) => theme.colors.textLight};
`;

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ movies: [], actors: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // 모달이 열릴 때 입력 필드에 포커스
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // 검색어가 변경될 때마다 검색 실행
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (query.trim()) {
        handleSearch();
      } else {
        setResults({ movies: [], actors: [] });
        setError("");
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError("");

    try {
      const searchResults = await searchService.search(query);
      setResults(searchResults);
    } catch (err) {
      setError(err.message);
      setResults({ movies: [], actors: [] });
    } finally {
      setLoading(false);
    }
  };

  // 모달 ESC 키 처리 및 스크롤 방지
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "auto";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleItemClick = (url) => {
    navigate(url);
    handleClose();
  };

  const handleClose = () => {
    setQuery("");
    setResults({ movies: [], actors: [] });
    setError("");
    onClose();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR");
  };

  const isChoseongSearch = searchService.isChoseongSearch(query);
  const totalResults =
    (results.movies?.length || 0) + (results.actors?.length || 0);

  if (!isOpen) return null;

  return (
    <SearchModalOverlay $isOpen={isOpen} onClick={handleClose}>
      <SearchModalContent $isOpen={isOpen} onClick={(e) => e.stopPropagation()}>
        <SearchModalHeader>
          <SearchModalTitle>검색</SearchModalTitle>
          <CloseButton
            variant="text"
            onClick={handleClose}
            size="sm"
            aria-label="검색 창 닫기"
          >
            <X size={20} />
          </CloseButton>
        </SearchModalHeader>
        <SearchModalBody>
          <SearchContainer>
            <SearchInputContainer>
              <SearchIcon />
              <SearchInput
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="영화나 배우를 검색해보세요..."
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    handleClose();
                  }
                }}
              />
            </SearchInputContainer>

            <SearchHint>
              {isChoseongSearch
                ? `"${query}" - 초성 검색 중입니다`
                : query
                ? `"${query}" 검색 결과`
                : "영화 제목이나 배우 이름으로 검색하거나, 초성(ㄱㄴㄷ)으로도 검색할 수 있습니다"}
            </SearchHint>

            {loading && <LoadingSpinner>검색 중...</LoadingSpinner>}

            {error && (
              <NoResults>
                <X size={48} />
                <div>{error}</div>
              </NoResults>
            )}

            {!loading && !error && query && totalResults === 0 && (
              <NoResults>
                <Search size={48} />
                <div>검색 결과가 없습니다</div>
                <div style={{ fontSize: "14px", marginTop: "8px" }}>
                  다른 검색어를 시도해보세요
                </div>
              </NoResults>
            )}

            {!loading && !error && totalResults > 0 && (
              <ResultsContainer>
                {results.movies?.length > 0 && (
                  <Section>
                    <SectionHeader>
                      <Film size={16} />
                      영화 ({results.movies.length})
                    </SectionHeader>
                    {results.movies.map((movie) => (
                      <ResultItem
                        key={movie.movieId}
                        onClick={() =>
                          handleItemClick(`/movies/${movie.movieId}`)
                        }
                      >
                        <ImageContainer>
                          <ItemImage
                            src={
                              movie.posterUrl ||
                              PLACEHOLDER_POSTER_URL(60, 80, "포스터")
                            }
                            alt={movie.title}
                            onError={(e) => {
                              e.target.src = PLACEHOLDER_POSTER_URL(
                                60,
                                80,
                                "포스터"
                              );
                            }}
                          />
                        </ImageContainer>
                        <ItemInfo>
                          <ItemTitle>{movie.title}</ItemTitle>
                          <ItemSubtitle>
                            <Calendar size={14} />
                            {formatDate(movie.releaseDate)}
                            {movie.movieRatingName && (
                              <>
                                <Star size={14} />
                                {movie.movieRatingName}
                              </>
                            )}
                          </ItemSubtitle>
                        </ItemInfo>
                      </ResultItem>
                    ))}
                  </Section>
                )}

                {results.actors?.length > 0 && (
                  <Section>
                    <SectionHeader>
                      <User size={16} />
                      배우 ({results.actors.length})
                    </SectionHeader>
                    {results.actors.map((actor) => (
                      <ResultItem
                        key={actor.actorId}
                        onClick={() =>
                          handleItemClick(`/actors/${actor.actorId}`)
                        }
                      >
                        <ImageContainer $isActor>
                          <ItemImage
                            src={
                              actor.profileImageUrl ||
                              PLACEHOLDER_PROFILE_URL(40, "프로필")
                            }
                            alt={actor.name}
                            onError={(e) => {
                              e.target.src = PLACEHOLDER_PROFILE_URL(
                                40,
                                "프로필"
                              );
                            }}
                          />
                        </ImageContainer>
                        <ItemInfo>
                          <ItemTitle>{actor.name}</ItemTitle>
                        </ItemInfo>
                      </ResultItem>
                    ))}
                  </Section>
                )}
              </ResultsContainer>
            )}
          </SearchContainer>
        </SearchModalBody>
      </SearchModalContent>
    </SearchModalOverlay>
  );
};

export default SearchModal;
