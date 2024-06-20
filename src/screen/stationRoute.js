import React, { useEffect, useReducer, useRef, useState } from 'react'
import {
  Pressable,
  StatusBar,
  StyleSheet,
  View,
  Text,
  LayoutChangeEvent,
  SafeAreaView,
  Dimensions,
  ImageBackground,
  FlatList,
  Alert,
  TouchableOpacity
} from 'react-native'
import { BottomSheetModal, BottomSheetModalProvider, } from "@gorhom/bottom-sheet";
import MapView, { Marker, Polyline } from 'react-native-maps';
import { EV_STATIONS_RESPONSE } from '../database/evSList';
import {
  GestureHandlerRootView, Switch
} from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { ListItem, Avatar, Divider } from '@rneui/themed';
import { ScrollView } from 'react-native-gesture-handler';

import Icon from '@expo/vector-icons/Ionicons';
import Cards from '../components/Cards';
import { Button } from '@rneui/themed';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import Stars from 'react-native-stars';
import Modal from "react-native-modal";
import { GiftedChat } from 'react-native-gifted-chat'
import axios from 'axios';

const YOUR_TOMTOM_API_KEY = 'T166rLZODnNrHuvhX9CswHERqmjePmgH';


const fetchEVChargingStations = async (latitude, longitude) => {
  const apiKey = YOUR_TOMTOM_API_KEY;
  const radius = 20000; // 20km
  const limit = 50; // Number of results to fetch

  const url = `https://api.tomtom.com/search/2/poiSearch/EV%20charging%20station.json?lat=${latitude}&lon=${longitude}&radius=${radius}&limit=${limit}&key=${apiKey}`;
  console.log(url);
  try {
    const response = await fetch(url);
    const json = await response.json();
    return json.results;
  } catch (error) {
    console.error("Fetch error:", error);
    return [];
  }
};




const StationRoute = ({ route, navigation }) => {

  const bottomSheetModalRef = useRef(null);
  const snapPoints = ["50%", "75% ", "90%"];
  const [selectedStations, setSelectedStations] = useState({});
  const [latitude, setLatitude] = useState(13.006212569689849);
  const [longitude, setLongitude] = useState(80.24194504745343);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [viewCode, setViewCode] = useState(0);
  const [mapRoute, setRoute] = useState([]);
  const [stations, setStations] = useState([])
  const { routeData, codd } = route.params;
  const exampleRouteData = [
    {
      "latitude": 13.00601,
      "longitude": 80.24197
    },
    {
      "latitude": 13.00601,
      "longitude": 80.24203
    },
    {
      "latitude": 13.00600,
      "longitude": 80.24214
    },
    {
      "latitude": 13.00591,
      "longitude": 80.24245
    },
    {
      "latitude": 13.00611,
      "longitude": 80.24252
    },
    {
      "latitude": 13.00654,
      "longitude": 80.24260
    },
    {
      "latitude": 13.00656,
      "longitude": 80.24133
    },
    {
      "latitude": 13.00659,
      "longitude": 80.24100
    },
    {
      "latitude": 13.00663,
      "longitude": 80.24078
    },
    {
      "latitude": 13.00672,
      "longitude": 80.24081
    },
    {
      "latitude": 13.00682,
      "longitude": 80.24083
    },
    {
      "latitude": 13.00679,
      "longitude": 80.24095
    },
    {
      "latitude": 13.00679,
      "longitude": 80.24104
    },
    {
      "latitude": 13.00676,
      "longitude": 80.24133
    },
    {
      "latitude": 13.00674,
      "longitude": 80.24181
    },
    {
      "latitude": 13.00673,
      "longitude": 80.24279
    },
    {
      "latitude": 13.00673,
      "longitude": 80.24282
    },
    {
      "latitude": 13.00668,
      "longitude": 80.24290
    },
    {
      "latitude": 13.00670,
      "longitude": 80.24357
    },
    {
      "latitude": 13.00670,
      "longitude": 80.24365
    },
    {
      "latitude": 13.00671,
      "longitude": 80.24397
    },
    {
      "latitude": 13.00671,
      "longitude": 80.24414
    },
    {
      "latitude": 13.00671,
      "longitude": 80.24418
    },
    {
      "latitude": 13.00672,
      "longitude": 80.24457
    },
    {
      "latitude": 13.00673,
      "longitude": 80.24539
    },
    {
      "latitude": 13.00674,
      "longitude": 80.24603
    },
    {
      "latitude": 13.00676,
      "longitude": 80.24706
    },
    {
      "latitude": 13.00677,
      "longitude": 80.24731
    },
    {
      "latitude": 13.00677,
      "longitude": 80.24743
    },
    {
      "latitude": 13.00667,
      "longitude": 80.24742
    },
    {
      "latitude": 13.00643,
      "longitude": 80.24742
    },
    {
      "latitude": 13.00635,
      "longitude": 80.24742
    },
    {
      "latitude": 13.00575,
      "longitude": 80.24739
    },
    {
      "latitude": 13.00571,
      "longitude": 80.24739
    },
    {
      "latitude": 13.00511,
      "longitude": 80.24738
    },
    {
      "latitude": 13.00491,
      "longitude": 80.24741
    },
    {
      "latitude": 13.00475,
      "longitude": 80.24742
    },
    {
      "latitude": 13.00468,
      "longitude": 80.24742
    },
    {
      "latitude": 13.00447,
      "longitude": 80.24744
    },
    {
      "latitude": 13.00430,
      "longitude": 80.24746
    },
    {
      "latitude": 13.00417,
      "longitude": 80.24749
    },
    {
      "latitude": 13.00406,
      "longitude": 80.24750
    },
    {
      "latitude": 13.00399,
      "longitude": 80.24751
    },
    {
      "latitude": 13.00393,
      "longitude": 80.24760
    },
    {
      "latitude": 13.00387,
      "longitude": 80.24764
    },
    {
      "latitude": 13.00278,
      "longitude": 80.24789
    },
    {
      "latitude": 13.00093,
      "longitude": 80.24831
    },
    {
      "latitude": 12.99954,
      "longitude": 80.24867
    },
    {
      "latitude": 12.99888,
      "longitude": 80.24883
    },
    {
      "latitude": 12.99818,
      "longitude": 80.24902
    },
    {
      "latitude": 12.99788,
      "longitude": 80.24912
    },
    {
      "latitude": 12.99774,
      "longitude": 80.24917
    },
    {
      "latitude": 12.99737,
      "longitude": 80.24927
    },
    {
      "latitude": 12.99704,
      "longitude": 80.24936
    },
    {
      "latitude": 12.99670,
      "longitude": 80.24945
    },
    {
      "latitude": 12.99640,
      "longitude": 80.24954
    },
    {
      "latitude": 12.99561,
      "longitude": 80.24976
    },
    {
      "latitude": 12.99445,
      "longitude": 80.25003
    },
    {
      "latitude": 12.99447,
      "longitude": 80.25012
    },
    {
      "latitude": 12.99449,
      "longitude": 80.25019
    },
    {
      "latitude": 12.99450,
      "longitude": 80.25023
    },
    {
      "latitude": 12.99454,
      "longitude": 80.25044
    },
    {
      "latitude": 12.99455,
      "longitude": 80.25050
    },
    {
      "latitude": 12.99459,
      "longitude": 80.25071
    },
    {
      "latitude": 12.99460,
      "longitude": 80.25078
    },
    {
      "latitude": 12.99474,
      "longitude": 80.25133
    },
    {
      "latitude": 12.99501,
      "longitude": 80.25244
    },
    {
      "latitude": 12.99514,
      "longitude": 80.25281
    },
    {
      "latitude": 12.99521,
      "longitude": 80.25298
    },
    {
      "latitude": 12.99543,
      "longitude": 80.25323
    },
    {
      "latitude": 12.99554,
      "longitude": 80.25333
    },
    {
      "latitude": 12.99603,
      "longitude": 80.25383
    },
    {
      "latitude": 12.99627,
      "longitude": 80.25405
    },
    {
      "latitude": 12.99662,
      "longitude": 80.25442
    },
    {
      "latitude": 12.99670,
      "longitude": 80.25451
    },
    {
      "latitude": 12.99674,
      "longitude": 80.25456
    },
    {
      "latitude": 12.99678,
      "longitude": 80.25465
    },
    {
      "latitude": 12.99684,
      "longitude": 80.25489
    },
    {
      "latitude": 12.99687,
      "longitude": 80.25508
    },
    {
      "latitude": 12.99688,
      "longitude": 80.25520
    },
    {
      "latitude": 12.99692,
      "longitude": 80.25526
    },
    {
      "latitude": 12.99695,
      "longitude": 80.25566
    },
    {
      "latitude": 12.99696,
      "longitude": 80.25587
    },
    {
      "latitude": 12.99695,
      "longitude": 80.25598
    },
    {
      "latitude": 12.99693,
      "longitude": 80.25633
    },
    {
      "latitude": 12.99691,
      "longitude": 80.25663
    },
    {
      "latitude": 12.99686,
      "longitude": 80.25669
    },
    {
      "latitude": 12.99679,
      "longitude": 80.25773
    },
    {
      "latitude": 12.99675,
      "longitude": 80.25773
    },
    {
      "latitude": 12.99663,
      "longitude": 80.25772
    }
  ];

  /*   const fetchRoute = async (start, end) => {
      const url = `https://api.tomtom.com/routing/1/calculateRoute/${start.latitude},${start.longitude}:${end.latitude},${end.longitude}/json?key=${YOUR_TOMTOM_API_KEY}`;
      console.log(url);
  
      try {
        const response = await fetch(url);
        const json = await response.json(); // Correctly await the parsing of the JSON response body
        const points = json.routes[0].legs[0].points.map(p => ({
          latitude: p.latitude,
          longitude: p.longitude,
        }));
        return points;
      } catch (error) {
        console.error('Failed to fetch route:', error);
        return null; // Return null to indicate failure
      }
    };
  
  
    const mapLoad = async () => {
      const routeData = fetchRoute(codd.startCoord, codd.endCoord);
  
      if (routeData) {
        setRoute(routeData);
  
      } else {
        Alert.alert("Error", "Unable to fetch the route. Please try again.");
      }
  
    };
   */

  const startPoint = routeData[0];
  const endPoint = routeData[routeData.length - 1];


  return (
    <View style={{
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <MapView
        style={{
          width: Dimensions.get('window').width,
          height: Dimensions.get('window').height,
        }}
        initialRegion={{
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        provider="google"
      >

        {routeData.length > 0 && (
          <Polyline coordinates={routeData} strokeWidth={5} strokeColor="red" />
        )}
        <Marker
                    coordinate={startPoint}
                    title={"Start"}
                />

                <Marker
                    coordinate={endPoint}
                    title={"End"}
                />

      </MapView>
    </View>
  )

}


export default StationRoute;