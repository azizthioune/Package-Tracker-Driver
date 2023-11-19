import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
  width: "400px",
  height: "400px",
};

const center = {
  lat: 14.499454,
  lng: -14.445561499999997,
};

function MapComponent({ markers }: any) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "",
  });

  const [map, setMap] = useState(null);

  useEffect(() => {
    if (map && markers) {
      onLoad(map);
    }
  }, [map, markers]);

  const onLoad = React.useCallback(function callback(map) {
    // This is just an example of getting and using the map instance!!! don't just blindly copy!
    // const bounds = new window.google.maps.LatLngBounds(center);
    // map.fitBounds(bounds);
    map.setZoom(7);
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(function callback() {
    setMap(null);
  }, []);

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {length
        ? markers?.map((marker: any, index: number) => (
            <Marker
              key={index}
              title={marker.title}
              position={marker?.position}
            />
          ))
        : null}
    </GoogleMap>
  ) : (
    <></>
  );
}

export default React.memo(MapComponent);
