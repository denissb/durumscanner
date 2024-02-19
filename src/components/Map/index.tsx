import { forwardRef } from "react";
import { StyleSheet } from "react-native";
import MapView, { PROVIDER_GOOGLE, MapViewProps } from "react-native-maps";

const Map = forwardRef((props: MapViewProps, ref) => {
  return (
    <MapView
      style={styles.map}
      provider={PROVIDER_GOOGLE}
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
