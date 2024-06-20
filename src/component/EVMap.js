/* import React from 'react';
import MapboxGL from '@react-native-mapbox-gl/maps';

const EVMap = ({ stations }) => {
  return (
    <MapboxGL.MapView style={{ flex: 1 }}>
      <MapboxGL.Camera
        zoomLevel={10}
        centerCoordinate={[stations[0].longitude, stations[0].latitude]}
      />
      {stations.map((station, index) => (
        <MapboxGL.PointAnnotation
          key={index}
          id={String(index)}
          coordinate={[station.longitude, station.latitude]}
        >
          <MapboxGL.Callout title={station.name || "Charging Station"} />
        </MapboxGL.PointAnnotation>
      ))}
    </MapboxGL.MapView>
  );
};

export default EVMap;
 */