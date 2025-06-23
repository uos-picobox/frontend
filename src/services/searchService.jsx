import { getChoseong, canBeChoseong } from "es-hangul";
import { API_ENDPOINTS_CUSTOMER } from "../constants/config";
import apiClient from "./apiClient";

class SearchService {
  /**
   * 검색 쿼리 실행
   * @param {string} query - 검색어
   * @returns {Promise<{movies: Array, actors: Array}>} 검색 결과
   */
  async search(query) {
    try {
      if (!query || query.trim() === "") {
        return { movies: [], actors: [] };
      }

      const response = await apiClient.get(API_ENDPOINTS_CUSTOMER.SEARCH, {
        query: query.trim(),
      });

      return response;
    } catch (error) {
      console.error("검색 중 오류 발생:", error);
      throw new Error(error.message || "검색 중 오류가 발생했습니다.");
    }
  }

  /**
   * 초성 검색인지 판단
   * @param {string} query - 검색어
   * @returns {boolean} 초성 검색 여부
   */
  isChoseongSearch(query) {
    if (!query || query.length === 0) return false;
    return canBeChoseong(query[0]);
  }

  /**
   * 텍스트에서 초성 추출
   * @param {string} text - 대상 텍스트
   * @returns {string} 추출된 초성
   */
  extractChoseong(text) {
    return getChoseong(text);
  }

  /**
   * 로컬 검색 필터링 (클라이언트 사이드에서 추가 필터링이 필요한 경우)
   * @param {Array} items - 검색 대상 아이템 배열
   * @param {string} query - 검색어
   * @param {string} searchField - 검색할 필드명
   * @returns {Array} 필터링된 결과
   */
  filterByQuery(items, query, searchField = "title") {
    if (!query || !items?.length) return items || [];

    const normalizedQuery = query.toLowerCase().trim();
    const isChoseong = this.isChoseongSearch(normalizedQuery);

    return items.filter((item) => {
      const targetText = item[searchField] || "";

      if (isChoseong) {
        // 초성 검색
        const choseong = this.extractChoseong(targetText);
        return choseong.toLowerCase().includes(normalizedQuery);
      } else {
        // 일반 검색
        return targetText.toLowerCase().includes(normalizedQuery);
      }
    });
  }

  /**
   * 검색 결과를 타입별로 분류
   * @param {Array} movies - 영화 검색 결과
   * @param {Array} actors - 배우 검색 결과
   * @returns {Object} 분류된 검색 결과
   */
  categorizeResults(movies = [], actors = []) {
    return {
      movies: movies.map((movie) => ({
        ...movie,
        type: "movie",
        displayName: movie.title,
        url: `/movies/${movie.movieId}`,
      })),
      actors: actors.map((actor) => ({
        ...actor,
        type: "actor",
        displayName: actor.name,
        url: `/actors/${actor.actorId}`,
      })),
    };
  }

  /**
   * 통합 검색 결과를 단일 배열로 변환
   * @param {Object} searchResult - 검색 결과 객체
   * @returns {Array} 통합된 검색 결과 배열
   */
  flattenResults(searchResult) {
    const { movies = [], actors = [] } = this.categorizeResults(
      searchResult.movies,
      searchResult.actors
    );

    return [...movies, ...actors];
  }
}

const searchServiceInstance = new SearchService();
export default searchServiceInstance;
