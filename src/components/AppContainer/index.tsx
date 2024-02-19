import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { findNearest } from "geolib";
import React, { useEffect, useCallback, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
// this provides some helpful reset styles to ensure a more consistent look
// only import this from your web app, not native
// import '@tamagui/core/reset.css'
import { showLocation } from "react-native-map-link";
import { Marker } from "react-native-maps";
import {
  TamaguiProvider,
  H1,
  H4,
  XStack,
  YStack,
  Button,
  isWeb,
} from "tamagui";

import LocationInput from "../../components/LocationInput";
import Map from "../../components/Map";
import Places from "../../components/Map/Places";
import config from "../../config/tamagui.config";
import useCurrentLocation, {
  DEFAULT_DELTAS,
  LocationObject,
} from "../../hooks/useCurrentLocation";
import useFindDurmPlaces, { Place } from "../../hooks/useFindDurumPlaces";

export default function App() {
  const [loaded] = useFonts({
    Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
  });

  const mapRef = useRef(null);
  const [focusedPlaceId, setFocusedPlaceId] = useState<string>(null);

  useEffect(() => {
    if (loaded) {
      // can hide splash screen here
    }
  }, [loaded]);

  const { location, setSelectedLocation } = useCurrentLocation();
  const { places } = useFindDurmPlaces(location);

  useEffect(() => {
    if (location && mapRef.current !== null) {
      mapRef.current.animateToRegion(location);
    }
  }, [location]);

  const onPlacePress = useCallback((place: Place) => {
    setFocusedPlaceId(place.place_id);
  }, []);

  const onOpenInMapsPress = useCallback(() => {
    const place = places.find((place) => place.place_id === focusedPlaceId);

    showLocation({
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      title: place.name,
      app: "google-maps",
    });
  }, [focusedPlaceId, places]);

  const onMapPress = useCallback(() => {
    setFocusedPlaceId(null);
  }, []);

  const findClosest = useCallback(() => {
    const nearest = findNearest(
      location,
      places.map((place) => ({
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        placeId: place.place_id,
      })),
    );

    // @ts-ignore
    setFocusedPlaceId(nearest.placeId);

    mapRef.current.animateToRegion({
      ...nearest,
      ...DEFAULT_DELTAS,
    });
  }, [places, location, mapRef]);

  const findBest = useCallback(() => {
    const best = places.sort((a, b) => {
      if (!b.rating) {
        return -1;
      }
      if (a.rating > b.rating) {
        return -1;
      }
      if (a.rating < b.rating) {
        return 1;
      }

      return 0;
    })[0];

    mapRef.current.animateToRegion({
      latitude: best.geometry.location.lat,
      longitude: best.geometry.location.lng,
      ...DEFAULT_DELTAS,
    });

    setFocusedPlaceId(best.place_id);
  }, [places, location, mapRef]);

  const onLocationSelected = useCallback((loc: LocationObject) => {
    setSelectedLocation(loc);
    if (!loc) {
      setFocusedPlaceId(null);
    }
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <TamaguiProvider config={config}>
      <View style={styles.container}>
        <StatusBar style="auto" />
        <YStack
          padding={14}
          paddingTop={24}
          backgroundColor="$background"
          overflow="visible"
          style={{
            elevation: 10,
            zIndex: 10,
          }}
        >
          <H1 alignSelf="center">DurumScanner</H1>
          <LocationInput onLocationSelected={onLocationSelected} />
        </YStack>
        <Map
          ref={mapRef}
          initialRegion={location}
          showsUserLocation
          showsMyLocationButton
          showsCompass
          scrollEnabled
          zoomEnabled
          pitchEnabled
          rotateEnabled
          toolbarEnabled={false}
          onPress={onMapPress}
        >
          <>
            {location && isWeb && (
              <Marker
                title="You are here durum lover!"
                description="Go find your snack!"
                coordinate={location}
              />
            )}
            {places && (
              <Places
                places={places}
                focusedPlaceId={focusedPlaceId}
                currentLocation={location}
                onPlacePress={onPlacePress}
                onCalloutPress={onOpenInMapsPress}
              />
            )}
          </>
        </Map>
        {places && places.length > 0 && (
          <XStack
            style={styles.controls}
            backgroundColor={null}
            flexWrap="wrap"
          >
            <Button style={styles.button} onPress={findClosest}>
              Closest 🚶
            </Button>
            <Button style={styles.button} onPress={findBest}>
              Best ⭐
            </Button>
            {focusedPlaceId && (
              <Button style={styles.button} onPress={onOpenInMapsPress}>
                Open 🗺
              </Button>
            )}
          </XStack>
        )}
        {places && !places.length && (
          <YStack
            style={styles.message}
            padding={14}
            backgroundColor="$background"
          >
            <H4 alignSelf="center">No durums in your area 🙁</H4>
          </YStack>
        )}
      </View>
    </TamaguiProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  controls: {
    position: "absolute",
    bottom: 10,
    padding: 8,
    paddingHorizontal: 4,
    width: "100%",
  },
  message: {
    position: "absolute",
    alignSelf: "center",
    bottom: 14,
    padding: 14,
  },
  button: {
    margin: 8,
  },
});
