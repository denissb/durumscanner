import * as Location from "expo-location";
import type { LocationSubscription, LocationObjectCoords } from "expo-location";
import { useState, useEffect } from "react";

export const DEFAULT_DELTAS = {
  latitudeDelta: 0.04,
  longitudeDelta: 0.05,
};

export type LocationObject = LocationObjectCoords & {
  latitudeDelta: number;
  longitudeDelta: number;
};

const useCurrentLocation = () => {
  const [location, setLocation] = useState<LocationObject | null>(null);
  const [selectedLocation, setSelectedLocation] =
    useState<LocationObject>(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (selectedLocation) {
      setLocation(selectedLocation);
      return;
    }

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      if (__DEV__) {
        setLocation({
          latitude: 37.4087456,
          longitude: -122.0232455,
          altitude: null,
          accuracy: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
          ...DEFAULT_DELTAS,
        });
        return;
      }

      const { coords } = await Location.getCurrentPositionAsync({});
      setLocation({
        ...coords,
        ...DEFAULT_DELTAS,
      });
    })();
  }, [selectedLocation]);

  useEffect(() => {
    let subscription: LocationSubscription;
    async function watchPosition() {
      subscription = await Location.watchPositionAsync(
        {
          timeInterval: 8000,
          distanceInterval: 100,
        },
        ({ coords }) => {
          if (selectedLocation) {
            return;
          }

          setLocation({
            ...coords,
            ...DEFAULT_DELTAS,
          });
        },
      );
    }

    if (!__DEV__) {
      watchPosition();
    }

    return () => {
      subscription?.remove();
    };
  }, [selectedLocation]);

  return { location, setSelectedLocation, errorMsg };
};

export default useCurrentLocation;
