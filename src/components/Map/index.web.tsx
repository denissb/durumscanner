import { forwardRef } from "react";
import { StyleSheet } from "react-native";
import MapView, { MapViewProps } from "react-native-maps";

import { googleMapsApiKey } from "../../const";

const Map = forwardRef((props: MapViewProps, ref) => {
  return (
    <MapView
      style={styles.map}
      provider="google"
      googleMapsApiKey={googleMapsApiKey}
      loadingEnabled
      ref={ref}
      {...props}
    />
  );
});

export default Map;

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});
