// App.js or your screen component file
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Button, Alert, Text, ScrollView, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import axios from 'axios';

const YOUR_TOMTOM_API_KEY = 'PoCKt2A2xvu0IGrGECVGEB7GpCtwqsDy';

const RouteScreen = () => {
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [chargingStations, setChargingStations] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    if (!startPoint) {
      setStartPoint({ latitude, longitude });
    } else if (!endPoint) {
      setEndPoint({ latitude, longitude });
      // Once both points are set, fetch the route.
      fetchRoute({ latitude, longitude }, startPoint);
    } else {
      // Reset if both points are already selected
      setStartPoint(null);
      setEndPoint(null);
      setRouteCoordinates([]);
      setChargingStations([]);
    }
  };

  const fetchRoute = async (start, end) => {
    setLoading(true);
    const url = `https://api.tomtom.com/routing/1/calculateRoute/${start.latitude},${start.longitude}:${end.latitude},${end.longitude}/json?&key=${YOUR_TOMTOM_API_KEY}`;

    try {
      const response = await axios.get(url);
      const routeData = response.data.routes[0].legs.flatMap(leg => leg.points);
      setRouteCoordinates(routeData);
      // After fetching the route, find charging stations along it

      findChargingStations(routeData)

    } catch (error) {
      console.error('Failed to fetch route:', error);
      Alert.alert('Error', 'Failed to fetch the route. Please try again.');
    } finally {
      setLoading(false);
    }

  };
  const getPointsEvery250Km = (routeCoordinates) => {
    // Placeholder: Returns every Nth point for simplicity
    // Replace this logic with actual calculations based on distances
    const POINTS_INTERVAL = 5; // Simplified assumption
    return routeCoordinates.filter((_, index) => index % POINTS_INTERVAL === 0);
  };

  const findChargingStations = async (routeCoordinates) => {
    if (routeCoordinates.length === 0) return;

    // Simplification: Find a midpoint for demonstration purposes
    const midpointIndex = Math.floor(routeCoordinates.length / 2);
    const midpoint = routeCoordinates[midpointIndex];

    const searchRadius = 5000; // Search within 50 km radius
    const url = `https://api.tomtom.com/search/2/search/charging_station.json?lat=${midpoint.latitude}&lon=${midpoint.longitude}&radius=${searchRadius}&key=${YOUR_TOMTOM_API_KEY}`;

    try {
      const response = await axios.get(url);
      const stations = response.data.results.map(station => ({
        id: station.id,
        name: station.poi.name,
        lat: station.position.lat,
        lon: station.position.lon,
      }));
      setChargingStations(stations);
    } catch (error) {
      console.error('Failed to find charging stations:', error);
    }
  };


  return (
    <View style={styles.container}>

      <MapView style={styles.map} onPress={handleMapPress}>
        {startPoint && <Marker coordinate={startPoint} title="Start" />}
        {endPoint && <Marker coordinate={endPoint} title="End" />}
        <Polyline coordinates={routeCoordinates} strokeWidth={5} strokeColor="blue" />
        {chargingStations.map((station, index) => (
          <Marker key={index} coordinate={{ latitude: station.lat, longitude: station.lon }} title="Charging Station" />
        ))}
      </MapView>
      {loading && <ActivityIndicator style={styles.loading} />}
      <ScrollView style={styles.stationList}>
        {chargingStations.map((station, index) => (
          <Text key={index} style={styles.stationText}>{station.name}</Text>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.75,
  },
  loading: {
    position: 'absolute',
    margin: 'auto',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  stationList: {
    height: Dimensions.get('window').height * 0.25,
  },
  stationText: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
});

export default RouteScreen;
