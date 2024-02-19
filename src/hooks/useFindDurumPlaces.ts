import { useEffect, useState } from "react";

import type { LocationObject } from "./useCurrentLocation";
import { googleMapsApiKey } from "../const";

const GOOGLE_API_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
const SPICY_KEYWORDS = "(durum) or (kebab) or (shawarma) or (doner) or (pita)";

export type Place = {
  business_status?: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
    viewport: {
      northeast: {
        lat: number;
        lng: number;
      };
      southwest: {
        lat: number;
        lng: number;
      };
    };
  };
  icon: string;
  name: string;
  opening_hours?: {
    open_now: boolean;
  };
  place_id: string;
  price_level?: number;
  rating?: number;
  reference: string;
  scope: string;
  types: string[];
  user_ratings_total?: number;
  vicinity: string;
  photos: {
    height: number;
    width: number;
    photo_reference: string;
    html_attributions: string[];
  }[];
};

const useFindDurmPlaces = (currentLocation: Pick<LocationObject, "latitude" | "longitude"> | null) => {
  const [places, setPlaces] = useState<Place[]>(null);
  const [error, setError] = useState<Error>(null);

  useEffect(() => {
    const fetchPlaces = async () => {
      const { latitude, longitude } = currentLocation;

      try {
        if (__DEV__) {
          const mockData = await import("../mocks/default-location");
          setPlaces(mockData.default.results);
          return;
        }
        const response = await fetch(
          `${GOOGLE_API_URL}?${new URLSearchParams({
            location: `${latitude},${longitude}`,
            key: googleMapsApiKey,
            keyword: SPICY_KEYWORDS,
            radius: "7000",
            type: "restaurant|meal_takeaway|meal_delivery|store|cafe",
          })}`
        );

        const newData = await response.json();
        setPlaces(newData.results);
      } catch (err) {
        console.error(error);
        setError(err);
      }
    };

    if (currentLocation) {
      fetchPlaces();
    }
  }, [currentLocation?.latitude, currentLocation?.longitude]);

  return { places, error };
};

export default useFindDurmPlaces;
