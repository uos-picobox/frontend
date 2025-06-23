// src/contexts/DataContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import * as genreService from "../services/genreService";
import * as ratingService from "../services/ratingService";
import * as ticketTypeService from "../services/ticketTypeService";
import * as distributorService from "../services/distributorService";
import * as actorService from "../services/actorService"; // Actors might be too many for global context, consider for forms only

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const [genres, setGenres] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [distributors, setDistributors] = useState([]);
  // const [actors, setActors] = useState([]); // Potentially large, load on demand or paginate
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null);

      // 각 데이터를 개별적으로 fetch하여 일부 실패해도 다른 데이터는 로드되도록 함
      const results = await Promise.allSettled([
        genreService.getAllGenres(),
        ratingService.getAllRatings(),
        ticketTypeService.getAllTicketTypes(),
        distributorService.getAllDistributors(),
      ]);

      // 성공한 결과만 설정
      const [
        genresResult,
        ratingsResult,
        ticketTypesResult,
        distributorsResult,
      ] = results;

      if (genresResult.status === "fulfilled") {
        setGenres(genresResult.value || []);
      } else {
        console.warn(
          "DataContext: Failed to fetch genres",
          genresResult.reason
        );
      }

      if (ratingsResult.status === "fulfilled") {
        setRatings(ratingsResult.value || []);
      } else {
        console.warn(
          "DataContext: Failed to fetch ratings",
          ratingsResult.reason
        );
      }

      if (ticketTypesResult.status === "fulfilled") {
        setTicketTypes(ticketTypesResult.value || []);
      } else {
        console.warn(
          "DataContext: Failed to fetch ticket types",
          ticketTypesResult.reason
        );
      }

      if (distributorsResult.status === "fulfilled") {
        setDistributors(distributorsResult.value || []);
      } else {
        console.warn(
          "DataContext: Failed to fetch distributors",
          distributorsResult.reason
        );
      }

      // 모든 요청이 실패한 경우에만 에러 설정
      const failedRequests = results.filter(
        (result) => result.status === "rejected"
      );
      if (failedRequests.length === results.length) {
        setError(
          "일부 데이터를 불러오는데 실패했습니다. 관리자 권한이 필요할 수 있습니다."
        );
      }

      setIsLoading(false);
    };

    fetchAllData();
  }, []);

  const refreshData = async (dataType) => {
    setIsLoading(true);
    try {
      switch (dataType) {
        case "genres":
          setGenres((await genreService.getAllGenres()) || []);
          break;
        case "ratings":
          setRatings((await ratingService.getAllRatings()) || []);
          break;
        case "ticketTypes":
          setTicketTypes((await ticketTypeService.getAllTicketTypes()) || []);
          break;
        case "distributors":
          setDistributors(
            (await distributorService.getAllDistributors()) || []
          );
          break;
        // Add other cases as needed
        default:
          console.warn(
            `DataContext: Unknown data type "${dataType}" for refresh.`
          );
      }
    } catch (err) {
      console.error(`DataContext: Failed to refresh ${dataType}`, err);
      setError(err.message || `Could not refresh ${dataType}.`);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    genres,
    ratings,
    ticketTypes,
    distributors,
    // actors,
    isLoadingData: isLoading, // Renamed to avoid conflict with AuthContext.isLoading
    dataError: error, // Renamed to avoid conflict
    refreshData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

export default DataContext;
