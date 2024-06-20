import React, { useState } from 'react';
import { StyleSheet, View, Dimensions, Button, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import axios from 'axios';

const MapScreen = () => {
  const [selectedPoints, setSelectedPoints] = useState({ start: null, end: null });
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    if (!selectedPoints.start) {
      setSelectedPoints({ start: { latitude, longitude }, end: null });
    } else if (!selectedPoints.end) {
      setSelectedPoints({ ...selectedPoints, end: { latitude, longitude } });
    } else {
      Alert.alert("Reset Points", "Reset and select new start point?", [
        { text: "OK", onPress: () => setSelectedPoints({ start: null, end: null }) },
        { text: "Cancel", style: "cancel" }
      ]);
    }
  };

  const fetchEVRoute = async () => {
    setLoading(true);
    const { start, end } = selectedPoints;
    const apiKey = '5aND0PYr3jmcZtwxm1ilqPEvGAYk3DNV';

    // Example EV-specific parameters - adjust according to your needs
    const vehicleWeight = 1600; // Vehicle weight in kg
    const currentChargeInkWh = 20; // Current charge in kWh
    const maxChargeInkWh = 40; // Maximum charge capacity in kWh
    const energyConsumptionInkWhPer100km = 15; // Consumption in kWh per 100km

    const url = `https://api.tomtom.com/routing/1/calculateLongDistanceEVRoute/${start.latitude},${start.longitude}:${end.latitude},${end.longitude}/json?vehicleWeight=${vehicleWeight}&currentChargeInkWh=${currentChargeInkWh}&maxChargeInkWh=${maxChargeInkWh}&energyConsumptionInkWhPer100km=${energyConsumptionInkWhPer100km}&key=${apiKey}`;

    try {
      const response = await axios.get(url);
      const points = response.data.routes[0].legs.flatMap(leg =>
        leg.points.map(p => ({
          latitude: p.latitude,
          longitude: p.longitude,
        }))
      );
      setRouteCoordinates(points);
    } catch (error) {
      console.error(error);
      Alert.alert("Routing Error", "Failed to fetch EV route.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} onPress={handleMapPress}>
        {selectedPoints.start && <Marker coordinate={selectedPoints.start} title="Start" />}
        {selectedPoints.end && <Marker coordinate={selectedPoints.end} title="End" />}
        {routeCoordinates.length > 0 && (
          <Polyline coordinates={routeCoordinates} strokeWidth={5} strokeColor="red" />
        )}
      </MapView>
      <View style={{position:'absolute',bottom:10}}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />
      ) : (
        <Button title="Get EV Route" onPress={fetchEVRoute} disabled={!selectedPoints.start || !selectedPoints.end} />
      )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  loadingIndicator: {
    position: 'absolute',
    alignSelf: 'center',
  },
});

export default MapScreen;
