import PlacesAutocomplete, { Place } from "expo-google-places-autocomplete";
import { useCallback, useEffect, useRef, useState } from "react";
import { TextInput } from "react-native";
import { Stack, Button, Input, YGroup, ListItem } from "tamagui";

import { googleMapsApiKey } from "../../const";
import {
  DEFAULT_DELTAS,
  type LocationObject,
} from "../../hooks/useCurrentLocation";

type Props = {
  onLocationSelected: (slectedLocation: LocationObject) => void;
};

function ListItems({
  places,
  onPlaceSelected,
}: {
  places: Place[];
  onPlaceSelected: (placeId: string) => void;
}) {
  return (
    <YGroup
      alignSelf="center"
      size="$1"
      marginTop="$2"
      bordered
      style={{
        position: "absolute",
        elevation: 10,
        zIndex: 10,
        width: "100%",
        top: 45,
      }}
    >
      {places.map((place) => (
        <YGroup.Item key={place.placeId}>
          <ListItem
            hoverTheme
            pressTheme
            size="$2"
            subTitle={place.secondaryText}
            onPress={() => onPlaceSelected(place.placeId)}
          >
            {place.primaryText}
          </ListItem>
        </YGroup.Item>
      ))}
    </YGroup>
  );
}

export default function LocationInput({ onLocationSelected }: Props) {
  const textInputRef = useRef<TextInput>();

  const [, setInputValue] = useState("");
  const [results, setResults] = useState<Place[]>([]);

  useEffect(() => {
    PlacesAutocomplete.initPlaces(googleMapsApiKey);
  }, [googleMapsApiKey]);

  const onChangeText = useCallback(async (text: string) => {
    try {
      if (!text) {
        textInputRef.current.clear();
        setResults([]);
        return;
      }

      if (text.length < 3) {
        return;
      }

      const result = await PlacesAutocomplete.findPlaces(text);
      setResults(result.places);
      setInputValue(text);
    } catch (e) {
      console.log(e);
    }
  }, []);

  const clearInput = useCallback(() => {
    textInputRef.current.clear();
    setResults([]);
    onLocationSelected(null);
  }, []);

  const onPlaceSelected = useCallback(
    async (placeId: string) => {
      try {
        setResults([]);

        const details = await PlacesAutocomplete.placeDetails(placeId);
        const { coordinate } = details;

        textInputRef.current.setNativeProps({ text: details.formattedAddress });

        onLocationSelected({
          ...coordinate,
          ...DEFAULT_DELTAS,
          altitude: null,
          accuracy: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        });
      } catch (e) {
        console.log(e);
      }
    },
    [onLocationSelected],
  );

  const onSubmitEditing = useCallback(() => {
    onPlaceSelected(results[0]?.placeId);
  }, [results?.[0], onPlaceSelected]);

  return (
    <Stack paddingTop={4}>
      <Input
        ref={textInputRef}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        borderWidth={2}
        placeholder="Enter location"
        autoComplete="off"
      />
      <Button
        size="$2"
        aria-label="Clear"
        style={{
          position: "absolute",
          right: 6,
          top: 12,
        }}
        onPress={clearInput}
      >
        ✕
      </Button>
      {results.length > 0 && (
        <ListItems places={results} onPlaceSelected={onPlaceSelected} />
      )}
    </Stack>
  );
}
