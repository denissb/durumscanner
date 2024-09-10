import { useEffect } from "react";
import { Image, Text, View } from "react-native";
import { CalloutPressEvent, MapMarker, Marker } from "react-native-maps";

import {
  star,
  star1,
  star1_5,
  star1_5_geeen,
  star1_green,
  star_2,
  star_2_5,
  star_2_5_geeen,
  star_2_geeen,
  star_3,
  star_3_green,
} from "./images";
import { LocationObject } from "../../../hooks/useCurrentLocation";

import type { Place } from "../../../hooks/useFindDurumPlaces";

export enum Rating {
  none = "",
  minimum = "1",
  low = "1.5",
  ok = "2",
  good = "2.5",
  premium = "3",
}

export enum Maturity {
  normal = "",
  green = "green",
}

/**
 *
 * @param rating rating from google reviews from 1-5
 * @returns app specific durum rating
 */
function calculateRating(rating: number): Rating {
  switch (true) {
    case rating < 1.5:
      return Rating.minimum;
    case rating < 2.5:
      return Rating.low;
    case rating < 3.9:
      return Rating.ok;
    case rating < 4.5:
      return Rating.good;
    case rating <= 5:
      return Rating.premium;
    default:
      return Rating.none;
  }
}

function calculateRatingMatiruty(userRatingTotal: number): Maturity {
  return userRatingTotal < 69 ? Maturity.green : Maturity.normal;
}

function getIconImage(place: Place) {
  const ratingMaturity = calculateRatingMatiruty(place.user_ratings_total);
  const iconName = `${calculateRating(place.rating)}-star${ratingMaturity ? "-" + ratingMaturity : ratingMaturity}`;

  switch (iconName) {
    case "1-star":
      return star1;
    case "1-star-geeen":
      return star1_green;
    case "1.5-star":
      return star1_5;
    case "1.5-star-geeen":
      return star1_5_geeen;
    case "2-star":
      return star_2;
    case "2-star-geeen":
      return star_2_geeen;
    case "2.5-star":
      return star_2_5;
    case "2.5-star-geeen":
      return star_2_5_geeen;
    case "3-star":
      return star_3;
    case "3-star-green":
      return star_3_green;
    default:
      return star;
  }
}

const isOpen = (isOpen?: boolean) => {
  if (isOpen) {
    return "true";
  }
  if (isOpen === false) {
    return "false";
  }
  return "unknown";
};

const markerRefs = new Map<string, MapMarker>();

type Props = {
  places: Place[] | null;
  focusedPlaceId: string | null;
  currentLocation: LocationObject | null;
  onPlacePress: (place: Place) => void;
  onCalloutPress: (event: CalloutPressEvent) => void;
};

const Places = ({
  places,
  focusedPlaceId,
  currentLocation,
  onPlacePress,
  onCalloutPress,
}: Props) => {
  useEffect(() => {
    if (focusedPlaceId) {
      const marker = markerRefs.get(focusedPlaceId);
      marker?.showCallout();
    }
  }, [focusedPlaceId]);

  return (
    <>
      {places.map((place) => (
        <Marker
          coordinate={{
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
          }}
          key={place.place_id}
          identifier={place.place_id}
          title={place.name}
          ref={(ref) => markerRefs.set(place.place_id, ref)}
          onPress={() => onPlacePress(place)}
          description={`Rating: ${place.rating || "unknown"} Open: ${isOpen(place?.opening_hours?.open_now)}`}
          onCalloutPress={onCalloutPress}
          tracksViewChanges={__DEV__}
        >
            <Image
              source={getIconImage(place)}
              style={{ width: 37, height: 37 }}
              resizeMode="contain"
            />
            {place?.opening_hours?.open_now === false && (
              <Text
                style={{ fontSize: 22, position: 'absolute', top: 2, left: 6 }}
              >
                🚫
              </Text>
            )}
            {place?.opening_hours?.open_now === undefined && (
              <Text
                style={{
                  position: "absolute",
                  top: 2,
                  left: 16,
                  fontSize: 24,
                  fontWeight: "bold",
                  color: "$background",
                }}
              >
                ?
              </Text>
            )}
        </Marker>
      ))}
      {currentLocation && (
        <Marker
          coordinate={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
          }}
          identifier="currentLocation"
          key="currentLocation"
          title="This is your current search location durum lover"
          ref={(ref) => markerRefs.set("currentLocation", ref)}
        />
      )}
    </>
  );
};
export default Places;
