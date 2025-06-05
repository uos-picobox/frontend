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
      try {
        const [genresData, ratingsData, ticketTypesData, distributorsData] =
          await Promise.all([
            genreService.getAllGenres(),
            ratingService.getAllRatings(),
            ticketTypeService.getAllTicketTypes(),
            distributorService.getAllDistributors(),
            // actorService.getAllActors(), // Consider if needed globally
          ]);
        setGenres(genresData || []);
        setRatings(ratingsData || []);
        setTicketTypes(ticketTypesData || []);
        setDistributors(distributorsData || []);
        // setActors(actorsData || []);
      } catch (err) {
        console.error("DataContext: Failed to fetch common data", err);
        setError(err.message || "Could not load essential data.");
      } finally {
        setIsLoading(false);
      }
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
