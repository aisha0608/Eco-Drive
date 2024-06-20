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




const Explore = ({ navigation }) => {

    const bottomSheetModalRef = useRef(null);
    const snapPoints = ["50%", "75% ", "90%"];
    const [selectedStations, setSelectedStations] = useState({});
    const [latitude, setLatitude] = useState(13.006212569689849);
    const [longitude, setLongitude] = useState(80.24194504745343);
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [viewCode, setViewCode] = useState(0);
    const [route, setRoute] = useState([]);
    const [stations, setStations] = useState([])

    function handlePresentModal() {
        bottomSheetModalRef.current?.present();
    }
    useEffect(() => {
        handlePresentModal;
        const fetchData = async () => {
            const data = await fetchEVChargingStations(latitude, longitude);
            setStations(data);
        };

        fetchData();
    }, []);

    const onPressMapIcon = async (startLat, startLon, endLat, endLon) => {
        const startCoord = { latitude: startLat, longitude: startLon };
        const endCoord = { latitude: endLat, longitude: endLon };
        const routeData = fetchRoute(startCoord, endCoord);

        if (routeData) {
            setRoute(routeData); // Assuming setRoute updates the state with the fetched route
            setViewCode(2); // Transition to view code 2 to display the route
            console.log(viewCode);
        } else {
            Alert.alert("Error", "Unable to fetch the route. Please try again.");
        }

    };


    const fetchRoute = async (start, end) => {
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


    useEffect(() => {
        (async () => {

            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);
            console.log(location.coords.latitude);
            setLatitude(location.coords.latitude)
            console.log(location.coords.longitude);
            setLongitude(location.coords.longitude)

        })();
    }, []);

    let text = 'Waiting..';
    if (errorMsg) {
        text = errorMsg;
    } else if (location) {
        text = JSON.stringify(location);
    }



    const EvList = ({ station }) => {
        return (
            <TouchableOpacity>
                <ListItem
                    onPress={() => {
                        setSelectedStations(station)
                        navigation.navigate('EvDetails', { station: station })
                    }}
                    ViewComponent={View}
                    style={{
                        width: "100%"
                    }}
                >
                    <ListItem.Content>
                        <ListItem.Title style={{ color: "black", fontWeight: "bold" }}>
                            {station.poi.name}
                        </ListItem.Title>
                        <ListItem.Subtitle style={{ color: "black" }}>
                            {station.address.streetName + ' ( ' + (station.dist / 1000).toFixed(2) + 'Km )'}
                        </ListItem.Subtitle>
                    </ListItem.Content>
                    <ListItem.Chevron color="black" />

                </ListItem>
                <Divider component="li" />
            </TouchableOpacity>
        );
    }

    if (stations.length > 0) {
        handlePresentModal()

        return (

            <SafeAreaView style={{ flex: 1 }}>
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <View style={{
                        flex: 1
                    }}>
                        <MapView
                            style={styles2.map}
                            initialRegion={{
                                latitude: latitude,
                                longitude: longitude,
                                latitudeDelta: 0.0922,
                                longitudeDelta: 0.0421,
                            }}
                            provider="google"
                            scrollEnabled={true}
                            zoomEnabled={true}

                        >
                            {stations.map((station, index) => (

                                <Marker

                                    style={{ flex: 1.4 }}
                                    initialRegion={{
                                        latitude: latitude,
                                        longitude: longitude,
                                        latitudeDelta: 1,
                                        longitudeDelta: 1,
                                    }}

                                    key={index}
                                    coordinate={{
                                        latitude: station.position.lat,
                                        longitude: station.position.lon,
                                    }}
                                    title={station.poi.name}
                                />
                            ))}
                        </MapView>


                        <BottomSheetModalProvider>
                            <View style={styles2.container}>
                                <Button title="Open list of EV Charging Stations" onPress={handlePresentModal} />


                                <BottomSheetModal
                                    ref={bottomSheetModalRef}
                                    index={0}
                                    snapPoints={snapPoints}
                                    backgroundStyle={styles2.bottomSheetBackground}
                                    style={styles2.bottomSheet}
                                >
                                    <FlatList
                                        data={stations}
                                        renderItem={({ item }) => <EvList station={item} />}
                                        keyExtractor={item => item.id.toString()}
                                        nestedScrollEnabled={true}
                                    />
                                </BottomSheetModal>
                            </View>
                        </BottomSheetModalProvider>

                    </View>
                </GestureHandlerRootView>

            </SafeAreaView>
        );

    }


}
const styles2 = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'gray',
        alignItems: 'center',
        justifyContent: 'center',
    },
    contentContainer: {
        flex: 1,
        alignItems: "center",
        paddingHorizontal: 15,
    },
    row:
    {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 10,
    },
    title: {
        fontWeight: "900"
    },
    subtitle:
    {
        color: "#101318",
        fontSize: 14,
        fontWeight: "bold",
    },
    description:
    {
        color: "#101318",
        fontSize: 13,
        fontWeight: "normal",
        width: "100%",
    },
    map: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height / 2,
    },
    bottomSheetBackground: {
        borderRadius: 25,
    },
    bottomSheet: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },

});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1c2732",
        alignItems: 'center'
    },
    cardContainer: {
        height: 150,
        width: 320,
        alignSelf: "center",
        backgroundColor: "#6A706E",
        borderRadius: 30,

    },
    card: {
        height: 150,
        width: 260,
        paddingTop: 20,
        paddingHorizontal: 30,
        backgroundColor: '#2b3240',
        borderRadius: 30,
        flexDirection: 'row'
    },
    title: {
        color: "#6A706E",
        width: 100,
        fontSize: 12,
        fontWeight: "bold"
    },
    number: {
        color: "#FFF",
        width: 100,
        fontSize: 22,
        fontWeight: "bold",
        marginTop: -10,
    },
    textCovid: {
        transform: [{ rotate: "-90deg" }],
        color: "#3a4b4f",
        fontSize: 14,
        width: 90,
        marginLeft: -35,
        fontWeight: 'bold',
        marginTop: 20
    },
    noCard: {
        marginBottom: 10,
        color: '#FFF',
        alignSelf: "center"
    },
    map: {
        height: 150,
        paddingTop: 25,
        paddingHorizontal: 20,

    },
    col: {
        flexDirection: 'row'
    },
    minusIcon: {
        marginTop: -20,
        marginLeft: 5
    },
    avatarContainer: {
        width: "50%",
        alignItems: 'flex-end',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20
    },
    textDash: {
        color: "#FFF",
        fontSize: 20,
        alignSelf: 'center',
        marginTop: 15,
        fontWeight: 'bold'
    },
    colContainer: {
        flexDirection: "row",
        paddingHorizontal: 30,
        alignItems: 'center',
    },
    textGlobal: {
        fontWeight: "bold",
        fontSize: 16,
        color: "red"
    },
    textRussia: {
        fontWeight: "bold",
        fontSize: 16,
        paddingHorizontal: 30,
        color: "#6a706e"
    },
    reloadContainer: {
        backgroundColor: "#FFF",
        elevation: 2,
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: "center",
        marginLeft: 50
    },
    box: {
        backgroundColor: '#FFF',
        height: 150, // Set the desired height
        borderRadius: 30,
        width: "90%",
        alignItems: 'center',
        justifyContent: "center"
    },
    icon:
    {
        display: 'flex',
        flexDirection: 'row-reverse',
        alignSelf: 'flex-start',

    },
    icon1:
    {
        paddingLeft: 100,
        marginTop: 10,

    },
    text:
    {
        bottom: 10,
        position: "absolute",
        color: "#b8b8aa",
        fontWeight: "bold",
        fontSize: 11,
        width: 90
    },
    head: {
        fontWeight: "bold",
        color: "#b8b8aa"
    },
    head1: {
        fontWeight: "bold"
    },
    myStarStyle: {
        color: 'white',
        backgroundColor: 'transparent',
        textShadowColor: 'black',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
        paddingBottom: 30
    },
    myEmptyStarStyle: {
        color: 'white',
    },
    buttonContainer: {
        backgroundColor: 'red',
        paddingVertical: 10,
        paddingHorizontal: 60,
        borderRadius: 5,
        marginBottom: 10,

    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

const chargingStations = [
    {
        "type": "POI",
        "id": "RUbWK1QQgPQ2Mm9K1keRig",
        "score": 0.9847357273,
        "dist": 1747.911354,
        "info": "search:ta:356009046348256-IN",
        "matchConfidence": {
            "score": 0.9292841784302026
        },
        "poi": {
            "name": "Plug Smart EV Charging Station",
            "brands": [
                {
                    "name": "Plugz Smart"
                }
            ],
            "categorySet": [
                {
                    "id": 7309
                }
            ],
            "categories": [
                "electric vehicle station"
            ],
            "classifications": [
                {
                    "code": "ELECTRIC_VEHICLE_STATION",
                    "names": [
                        {
                            "nameLocale": "en-US",
                            "name": "electric vehicle station"
                        }
                    ]
                }
            ]
        },
        "address": {
            "streetName": "Periyar Nagar Road",
            "municipalitySubdivision": "Indian Institute of Technology",
            "municipality": "Chennai",
            "municipalitySecondarySubdivision": "Kanagam",
            "countrySecondarySubdivision": "Chennai",
            "countrySubdivision": "Tamil Nadu",
            "countrySubdivisionName": "Tamil Nadu",
            "countrySubdivisionCode": "TN",
            "postalCode": "600113",
            "countryCode": "IN",
            "country": "India",
            "countryCodeISO3": "IND",
            "freeformAddress": "Periyar Nagar Road, Kanagam, Indian Institute of Technology, Chennai 600113, Tamil Nadu",
            "localName": "Chennai"
        },
        "position": {
            "lat": 12.990495,
            "lon": 80.242185
        },
        "viewport": {
            "topLeftPoint": {
                "lat": 12.99139,
                "lon": 80.24126
            },
            "btmRightPoint": {
                "lat": 12.9896,
                "lon": 80.24311
            }
        },
        "entryPoints": [
            {
                "type": "main",
                "position": {
                    "lat": 12.99053,
                    "lon": 80.24173
                }
            }
        ],
        "chargingPark": {
            "connectors": [
                {
                    "connectorType": "StandardHouseholdCountrySpecific",
                    "ratedPowerKW": 3,
                    "voltageV": 230,
                    "currentA": 16,
                    "currentType": "AC1"
                }
            ]
        }
    },
    {
        "type": "POI",
        "id": "KG5yKODyPUdGY7DnVcBEWA",
        "score": 0.9653185606,
        "dist": 2022.625581,
        "info": "search:ta:356009046348373-IN",
        "matchConfidence": {
            "score": 0.8376043683344037
        },
        "poi": {
            "name": "Ather Grid Charging Station",
            "brands": [
                {
                    "name": "ASR"
                }
            ],
            "categorySet": [
                {
                    "id": 7309
                }
            ],
            "categories": [
                "electric vehicle station"
            ],
            "classifications": [
                {
                    "code": "ELECTRIC_VEHICLE_STATION",
                    "names": [
                        {
                            "nameLocale": "en-US",
                            "name": "electric vehicle station"
                        }
                    ]
                }
            ]
        },
        "address": {
            "streetName": "Malaviya Avenue 1st Street",
            "municipalitySubdivision": "Adyar",
            "municipality": "Chennai",
            "countrySecondarySubdivision": "Chennai",
            "countrySubdivision": "Tamil Nadu",
            "countrySubdivisionName": "Tamil Nadu",
            "countrySubdivisionCode": "TN",
            "postalCode": "600041",
            "countryCode": "IN",
            "country": "India",
            "countryCodeISO3": "IND",
            "freeformAddress": "Malaviya Avenue 1st Street, Adyar, Chennai 600041, Tamil Nadu",
            "localName": "Chennai"
        },
        "position": {
            "lat": 12.996627,
            "lon": 80.257811
        },
        "viewport": {
            "topLeftPoint": {
                "lat": 12.99753,
                "lon": 80.25689
            },
            "btmRightPoint": {
                "lat": 12.99573,
                "lon": 80.25873
            }
        },
        "entryPoints": [
            {
                "type": "main",
                "position": {
                    "lat": 12.99663,
                    "lon": 80.25772
                }
            }
        ],
        "chargingPark": {
            "connectors": [
                {
                    "connectorType": "StandardHouseholdCountrySpecific",
                    "ratedPowerKW": 1,
                    "voltageV": 110,
                    "currentA": 10,
                    "currentType": "AC1"
                },
                {
                    "connectorType": "IEC62196Type2Outlet",
                    "ratedPowerKW": 1,
                    "voltageV": 110,
                    "currentA": 10,
                    "currentType": "AC1"
                }
            ]
        }
    },
    {
        "type": "POI",
        "id": "s4-HdlZCDivLUt9Q_UEMLQ",
        "score": 0.9615575671,
        "dist": 2414.976527,
        "info": "search:ta:356009046348112-IN",
        "matchConfidence": {
            "score": 0.8376043683344037
        },
        "poi": {
            "name": "Ather Grid Charging Station",
            "brands": [
                {
                    "name": "ASR"
                }
            ],
            "categorySet": [
                {
                    "id": 7309
                }
            ],
            "categories": [
                "electric vehicle station"
            ],
            "classifications": [
                {
                    "code": "ELECTRIC_VEHICLE_STATION",
                    "names": [
                        {
                            "nameLocale": "en-US",
                            "name": "electric vehicle station"
                        }
                    ]
                }
            ]
        },
        "address": {
            "streetNumber": "62",
            "streetName": "Anna Salai",
            "municipalitySubdivision": "Guindy",
            "municipality": "Chennai",
            "municipalitySecondarySubdivision": "MGC Golf Course",
            "countrySecondarySubdivision": "Chennai",
            "countrySubdivision": "Tamil Nadu",
            "countrySubdivisionName": "Tamil Nadu",
            "countrySubdivisionCode": "TN",
            "postalCode": "600032",
            "countryCode": "IN",
            "country": "India",
            "countryCodeISO3": "IND",
            "freeformAddress": "62, Anna Salai, MGC Golf Course, Guindy, Chennai 600032, Tamil Nadu",
            "localName": "Chennai"
        },
        "position": {
            "lat": 13.012315,
            "lon": 80.220553
        },
        "viewport": {
            "topLeftPoint": {
                "lat": 13.01321,
                "lon": 80.21963
            },
            "btmRightPoint": {
                "lat": 13.01142,
                "lon": 80.22148
            }
        },
        "entryPoints": [
            {
                "type": "main",
                "position": {
                    "lat": 13.0122,
                    "lon": 80.2206
                }
            }
        ],
        "chargingPark": {
            "connectors": [
                {
                    "connectorType": "StandardHouseholdCountrySpecific",
                    "ratedPowerKW": 1,
                    "voltageV": 110,
                    "currentA": 10,
                    "currentType": "AC1"
                },
                {
                    "connectorType": "IEC62196Type2Outlet",
                    "ratedPowerKW": 1,
                    "voltageV": 110,
                    "currentA": 10,
                    "currentType": "AC1"
                }
            ]
        }
    },
    {
        "type": "POI",
        "id": "YNP8uYfJ0RlaHMlu6b6YeQ",
        "score": 0.9556059241,
        "dist": 2853.755162,
        "info": "search:ta:356009046348177-IN",
        "matchConfidence": {
            "score": 0.8373739854193337
        },
        "poi": {
            "name": "Ather Grid Charging Station",
            "brands": [
                {
                    "name": "ASR"
                }
            ],
            "categorySet": [
                {
                    "id": 7309
                }
            ],
            "categories": [
                "electric vehicle station"
            ],
            "classifications": [
                {
                    "code": "ELECTRIC_VEHICLE_STATION",
                    "names": [
                        {
                            "nameLocale": "en-US",
                            "name": "electric vehicle station"
                        }
                    ]
                }
            ]
        },
        "address": {
            "streetName": "T T K Road",
            "municipalitySubdivision": "Alwarpet",
            "municipality": "Chennai",
            "municipalitySecondarySubdivision": "Austin Nagar",
            "countrySecondarySubdivision": "Chennai",
            "countrySubdivision": "Tamil Nadu",
            "countrySubdivisionName": "Tamil Nadu",
            "countrySubdivisionCode": "TN",
            "postalCode": "600018",
            "countryCode": "IN",
            "country": "India",
            "countryCodeISO3": "IND",
            "freeformAddress": "T T K Road, Austin Nagar, Alwarpet, Chennai 600018, Tamil Nadu",
            "localName": "Chennai"
        },
        "position": {
            "lat": 13.030398,
            "lon": 80.250758
        },
        "viewport": {
            "topLeftPoint": {
                "lat": 13.0313,
                "lon": 80.24983
            },
            "btmRightPoint": {
                "lat": 13.0295,
                "lon": 80.25168
            }
        },
        "entryPoints": [
            {
                "type": "main",
                "position": {
                    "lat": 13.03028,
                    "lon": 80.25091
                }
            }
        ],
        "chargingPark": {
            "connectors": [
                {
                    "connectorType": "StandardHouseholdCountrySpecific",
                    "ratedPowerKW": 1,
                    "voltageV": 110,
                    "currentA": 10,
                    "currentType": "AC1"
                },
                {
                    "connectorType": "IEC62196Type2Outlet",
                    "ratedPowerKW": 1,
                    "voltageV": 110,
                    "currentA": 10,
                    "currentType": "AC1"
                }
            ]
        }
    },
    {
        "type": "POI",
        "id": "VpgJGaP42IQM_G0pCrvswA",
        "score": 0.9538993239,
        "dist": 3196.439245,
        "info": "search:ta:356009046348048-IN",
        "matchConfidence": {
            "score": 0.8367074916522029
        },
        "poi": {
            "name": "Ather Grid Charging Station",
            "brands": [
                {
                    "name": "ASR"
                }
            ],
            "categorySet": [
                {
                    "id": 7309
                }
            ],
            "categories": [
                "electric vehicle station"
            ],
            "classifications": [
                {
                    "code": "ELECTRIC_VEHICLE_STATION",
                    "names": [
                        {
                            "nameLocale": "en-US",
                            "name": "electric vehicle station"
                        }
                    ]
                }
            ]
        },
        "address": {
            "streetName": "Velachery Main Road, Velachery",
            "municipalitySubdivision": "Velachery",
            "municipality": "Chennai",
            "countrySecondarySubdivision": "Chennai",
            "countrySubdivision": "Tamil Nadu",
            "countrySubdivisionName": "Tamil Nadu",
            "countrySubdivisionCode": "TN",
            "postalCode": "600042",
            "countryCode": "IN",
            "country": "India",
            "countryCodeISO3": "IND",
            "freeformAddress": "Velachery Main Road, Velachery, Velachery, Chennai 600042, Tamil Nadu",
            "localName": "Chennai"
        },
        "position": {
            "lat": 12.991449,
            "lon": 80.216631
        },
        "viewport": {
            "topLeftPoint": {
                "lat": 12.99235,
                "lon": 80.21571
            },
            "btmRightPoint": {
                "lat": 12.99055,
                "lon": 80.21755
            }
        },
        "entryPoints": [
            {
                "type": "main",
                "position": {
                    "lat": 12.99181,
                    "lon": 80.21618
                }
            }
        ],
        "chargingPark": {
            "connectors": [
                {
                    "connectorType": "StandardHouseholdCountrySpecific",
                    "ratedPowerKW": 1,
                    "voltageV": 110,
                    "currentA": 10,
                    "currentType": "AC1"
                },
                {
                    "connectorType": "IEC62196Type2Outlet",
                    "ratedPowerKW": 1,
                    "voltageV": 110,
                    "currentA": 10,
                    "currentType": "AC1"
                }
            ]
        }
    },
    {
        "type": "POI",
        "id": "cdeyeyzD-urSyMT_gm3nhA",
        "score": 0.943795681,
        "dist": 4390.928444,
        "info": "search:ta:356009046348206-IN",
        "matchConfidence": {
            "score": 0.858249396894046
        },
        "poi": {
            "name": "EESL Alandur Metro",
            "brands": [
                {
                    "name": "Delta"
                }
            ],
            "categorySet": [
                {
                    "id": 7309
                }
            ],
            "categories": [
                "electric vehicle station"
            ],
            "classifications": [
                {
                    "code": "ELECTRIC_VEHICLE_STATION",
                    "names": [
                        {
                            "nameLocale": "en-US",
                            "name": "electric vehicle station"
                        }
                    ]
                }
            ]
        },
        "address": {
            "streetName": "Sowri Street",
            "municipalitySubdivision": "Alandur",
            "municipality": "Chennai",
            "municipalitySecondarySubdivision": "Mela Ilandaikulam",
            "countrySecondarySubdivision": "Chennai",
            "countrySubdivision": "Tamil Nadu",
            "countrySubdivisionName": "Tamil Nadu",
            "countrySubdivisionCode": "TN",
            "postalCode": "600016",
            "countryCode": "IN",
            "country": "India",
            "countryCodeISO3": "IND",
            "freeformAddress": "Sowri Street, Mela Ilandaikulam, Alandur, Chennai 600016, Tamil Nadu",
            "localName": "Chennai"
        },
        "position": {
            "lat": 13.003476,
            "lon": 80.201514
        },
        "viewport": {
            "topLeftPoint": {
                "lat": 13.00438,
                "lon": 80.20059
            },
            "btmRightPoint": {
                "lat": 13.00258,
                "lon": 80.20244
            }
        },
        "entryPoints": [
            {
                "type": "main",
                "position": {
                    "lat": 13.00339,
                    "lon": 80.2015
                }
            }
        ],
        "chargingPark": {
            "connectors": [
                {
                    "connectorType": "GBT20234Part3",
                    "ratedPowerKW": 25,
                    "voltageV": 400,
                    "currentA": 62,
                    "currentType": "DC"
                }
            ]
        }
    },
    {
        "type": "POI",
        "id": "T54z5Iv2WzqIklfxB94P4A",
        "score": 0.941727519,
        "dist": 3965.416301,
        "info": "search:ta:356009046348095-IN",
        "matchConfidence": {
            "score": 0.8376043683344037
        },
        "poi": {
            "name": "Ather Grid Charging Station",
            "brands": [
                {
                    "name": "ASR"
                }
            ],
            "categorySet": [
                {
                    "id": 7309
                }
            ],
            "categories": [
                "electric vehicle station"
            ],
            "classifications": [
                {
                    "code": "ELECTRIC_VEHICLE_STATION",
                    "names": [
                        {
                            "nameLocale": "en-US",
                            "name": "electric vehicle station"
                        }
                    ]
                }
            ]
        },
        "address": {
            "streetName": "Nageswara Road",
            "municipalitySubdivision": "Thyagaraya Nagar",
            "municipality": "Chennai",
            "municipalitySecondarySubdivision": "Parthasarathy Puram",
            "countrySecondarySubdivision": "Chennai",
            "countrySubdivision": "Tamil Nadu",
            "countrySubdivisionName": "Tamil Nadu",
            "countrySubdivisionCode": "TN",
            "postalCode": "600017",
            "countryCode": "IN",
            "country": "India",
            "countryCodeISO3": "IND",
            "freeformAddress": "Nageswara Road, Parthasarathy Puram, Thyagaraya Nagar, Chennai 600017, Tamil Nadu",
            "localName": "Chennai"
        },
        "position": {
            "lat": 13.040675,
            "lon": 80.232532
        },
        "viewport": {
            "topLeftPoint": {
                "lat": 13.04157,
                "lon": 80.23161
            },
            "btmRightPoint": {
                "lat": 13.03978,
                "lon": 80.23346
            }
        },
        "entryPoints": [
            {
                "type": "main",
                "position": {
                    "lat": 13.04084,
                    "lon": 80.23258
                }
            }
        ],
        "chargingPark": {
            "connectors": [
                {
                    "connectorType": "StandardHouseholdCountrySpecific",
                    "ratedPowerKW": 1,
                    "voltageV": 110,
                    "currentA": 10,
                    "currentType": "AC1"
                },
                {
                    "connectorType": "IEC62196Type2Outlet",
                    "ratedPowerKW": 1,
                    "voltageV": 110,
                    "currentA": 10,
                    "currentType": "AC1"
                }
            ]
        }
    },
    {
        "type": "POI",
        "id": "5iVv7_TBPnyF07WRa1CK7g",
        "score": 0.9335975051,
        "dist": 4552.651821,
        "info": "search:ta:356009046348179-IN",
        "matchConfidence": {
            "score": 0.8376869520551274
        },
        "poi": {
            "name": "Ather Grid Charging Station",
            "brands": [
                {
                    "name": "ASR"
                }
            ],
            "categorySet": [
                {
                    "id": 7309
                }
            ],
            "categories": [
                "electric vehicle station"
            ],
            "classifications": [
                {
                    "code": "ELECTRIC_VEHICLE_STATION",
                    "names": [
                        {
                            "nameLocale": "en-US",
                            "name": "electric vehicle station"
                        }
                    ]
                }
            ]
        },
        "address": {
            "streetName": "North Parade Road",
            "municipalitySubdivision": "Saint Thomas Mount",
            "municipality": "Chennai",
            "municipalitySecondarySubdivision": "Chakrapani Colony",
            "countrySecondarySubdivision": "Chennai",
            "countrySubdivision": "Tamil Nadu",
            "countrySubdivisionName": "Tamil Nadu",
            "countrySubdivisionCode": "TN",
            "postalCode": "600016",
            "countryCode": "IN",
            "country": "India",
            "countryCodeISO3": "IND",
            "freeformAddress": "North Parade Road, Chakrapani Colony, Saint Thomas Mount, Chennai 600016, Tamil Nadu",
            "localName": "Chennai"
        },
        "position": {
            "lat": 13.005949,
            "lon": 80.199925
        },
        "viewport": {
            "topLeftPoint": {
                "lat": 13.00685,
                "lon": 80.199
            },
            "btmRightPoint": {
                "lat": 13.00505,
                "lon": 80.20085
            }
        },
        "entryPoints": [
            {
                "type": "main",
                "position": {
                    "lat": 13.0058,
                    "lon": 80.19993
                }
            }
        ],
        "chargingPark": {
            "connectors": [
                {
                    "connectorType": "StandardHouseholdCountrySpecific",
                    "ratedPowerKW": 1,
                    "voltageV": 110,
                    "currentA": 10,
                    "currentType": "AC1"
                },
                {
                    "connectorType": "IEC62196Type2Outlet",
                    "ratedPowerKW": 1,
                    "voltageV": 110,
                    "currentA": 10,
                    "currentType": "AC1"
                }
            ]
        }
    },
    {
        "type": "POI",
        "id": "oua-Pch9GOB_VkavjJ-00g",
        "score": 0.9330309033,
        "dist": 5644.078931,
        "info": "search:ta:356009046348307-IN",
        "matchConfidence": {
            "score": 0.8367074916522029
        },
        "poi": {
            "name": "Ather Grid Charging Station",
            "brands": [
                {
                    "name": "ASR"
                }
            ],
            "categorySet": [
                {
                    "id": 7309
                }
            ],
            "categories": [
                "electric vehicle station"
            ],
            "classifications": [
                {
                    "code": "ELECTRIC_VEHICLE_STATION",
                    "names": [
                        {
                            "nameLocale": "en-US",
                            "name": "electric vehicle station"
                        }
                    ]
                }
            ]
        },
        "address": {
            "streetName": "Bazaar Main Road",
            "municipalitySubdivision": "Madipakkam",
            "municipality": "Chennai",
            "municipalitySecondarySubdivision": "Ram Nagar Northen Extension",
            "countrySecondarySubdivision": "Chennai",
            "countrySubdivision": "Tamil Nadu",
            "countrySubdivisionName": "Tamil Nadu",
            "countrySubdivisionCode": "TN",
            "postalCode": "600091",
            "countryCode": "IN",
            "country": "India",
            "countryCodeISO3": "IND",
            "freeformAddress": "Bazaar Main Road, Ram Nagar Northen Extension, Madipakkam, Chennai 600091, Tamil Nadu",
            "localName": "Chennai"
        },
        "position": {
            "lat": 12.964566,
            "lon": 80.212166
        },
        "viewport": {
            "topLeftPoint": {
                "lat": 12.96547,
                "lon": 80.21124
            },
            "btmRightPoint": {
                "lat": 12.96367,
                "lon": 80.21309
            }
        },
        "entryPoints": [
            {
                "type": "main",
                "position": {
                    "lat": 12.96453,
                    "lon": 80.21139
                }
            }
        ],
        "chargingPark": {
            "connectors": [
                {
                    "connectorType": "StandardHouseholdCountrySpecific",
                    "ratedPowerKW": 1,
                    "voltageV": 110,
                    "currentA": 10,
                    "currentType": "AC1"
                },
                {
                    "connectorType": "IEC62196Type2Outlet",
                    "ratedPowerKW": 1,
                    "voltageV": 110,
                    "currentA": 10,
                    "currentType": "AC1"
                }
            ]
        }
    },
    {
        "type": "POI",
        "id": "5xHvhHfwfyR4aB2l_fUXug",
        "score": 0.9304157495,
        "dist": 5986.690264,
        "info": "search:ta:356009046347886-IN",
        "matchConfidence": {
            "score": 0.8373739854193337
        },
        "poi": {
            "name": "Ather Grid Charging Station",
            "brands": [
                {
                    "name": "ASR"
                }
            ],
            "categorySet": [
                {
                    "id": 7309
                }
            ],
            "categories": [
                "electric vehicle station"
            ],
            "classifications": [
                {
                    "code": "ELECTRIC_VEHICLE_STATION",
                    "names": [
                        {
                            "nameLocale": "en-US",
                            "name": "electric vehicle station"
                        }
                    ]
                }
            ]
        },
        "address": {
            "streetName": "Arlot Road",
            "municipalitySubdivision": "Vadapalani",
            "municipality": "Chennai",
            "countrySecondarySubdivision": "Chennai",
            "countrySubdivision": "Tamil Nadu",
            "countrySubdivisionName": "Tamil Nadu",
            "countrySubdivisionCode": "TN",
            "postalCode": "600040",
            "countryCode": "IN",
            "country": "India",
            "countryCodeISO3": "IND",
            "freeformAddress": "Arlot Road, Vadapalani, Chennai 600040, Tamil Nadu",
            "localName": "Chennai"
        },
        "position": {
            "lat": 13.049846,
            "lon": 80.209571
        },
        "viewport": {
            "topLeftPoint": {
                "lat": 13.05128,
                "lon": 80.2081
            },
            "btmRightPoint": {
                "lat": 13.04841,
                "lon": 80.21104
            }
        },
        "entryPoints": [
            {
                "type": "main",
                "position": {
                    "lat": 13.04886,
                    "lon": 80.2085
                }
            }
        ],
        "chargingPark": {
            "connectors": [
                {
                    "connectorType": "IEC62196Type2Outlet",
                    "ratedPowerKW": 1,
                    "voltageV": 110,
                    "currentA": 10,
                    "currentType": "AC1"
                }
            ]
        }
    },
    {
        "type": "POI",
        "id": "Uj-4umbNfKwkTZqTkl6xpw",
        "score": 0.921426177,
        "dist": 5888.984933,
        "info": "search:ta:356009046347988-IN",
        "matchConfidence": {
            "score": 0.8376869520551274
        },
        "poi": {
            "name": "Ather Grid Charging Station",
            "brands": [
                {
                    "name": "ASR"
                }
            ],
            "categorySet": [
                {
                    "id": 7309
                }
            ],
            "categories": [
                "electric vehicle station"
            ],
            "classifications": [
                {
                    "code": "ELECTRIC_VEHICLE_STATION",
                    "names": [
                        {
                            "nameLocale": "en-US",
                            "name": "electric vehicle station"
                        }
                    ]
                }
            ]
        },
        "address": {
            "streetNumber": "2/520",
            "streetName": "Sandeep Avenue",
            "municipalitySubdivision": "Palavakkam",
            "municipality": "Chennai",
            "municipalitySecondarySubdivision": "Sakathimorthamman Nagar",
            "countrySecondarySubdivision": "Chennai",
            "countrySubdivision": "Tamil Nadu",
            "countrySubdivisionName": "Tamil Nadu",
            "countrySubdivisionCode": "TN",
            "postalCode": "600041",
            "countryCode": "IN",
            "country": "India",
            "countryCodeISO3": "IND",
            "freeformAddress": "2/520, Sandeep Avenue, Sakathimorthamman Nagar, Palavakkam, Chennai 600041, Tamil Nadu",
            "localName": "Chennai"
        },
        "position": {
            "lat": 12.955888,
            "lon": 80.258879
        },
        "viewport": {
            "topLeftPoint": {
                "lat": 12.95739,
                "lon": 80.25734
            },
            "btmRightPoint": {
                "lat": 12.95439,
                "lon": 80.26042
            }
        },
        "entryPoints": [
            {
                "type": "main",
                "position": {
                    "lat": 12.95454,
                    "lon": 80.2582
                }
            }
        ],
        "chargingPark": {
            "connectors": [
                {
                    "connectorType": "StandardHouseholdCountrySpecific",
                    "ratedPowerKW": 1,
                    "voltageV": 110,
                    "currentA": 10,
                    "currentType": "AC1"
                },
                {
                    "connectorType": "IEC62196Type2Outlet",
                    "ratedPowerKW": 1,
                    "voltageV": 110,
                    "currentA": 10,
                    "currentType": "AC1"
                }
            ]
        }
    },
    {
        "type": "POI",
        "id": "QiyLS1y7yX5wrziXDQOUEA",
        "score": 0.921426177,
        "dist": 6129.584513,
        "info": "search:ta:356009046348376-IN",
        "matchConfidence": {
            "score": 0.8376869520551274
        },
        "poi": {
            "name": "Ather Grid Charging Station",
            "brands": [
                {
                    "name": "ASR"
                }
            ],
            "categorySet": [
                {
                    "id": 7309
                }
            ],
            "categories": [
                "electric vehicle station"
            ],
            "classifications": [
                {
                    "code": "ELECTRIC_VEHICLE_STATION",
                    "names": [
                        {
                            "nameLocale": "en-US",
                            "name": "electric vehicle station"
                        }
                    ]
                }
            ]
        },
        "address": {
            "streetNumber": "153",
            "streetName": "Wallace Garden 2nd Street",
            "municipalitySubdivision": "Thousand Lights",
            "municipality": "Chennai",
            "municipalitySecondarySubdivision": "Thousand Lights West",
            "countrySecondarySubdivision": "Chennai",
            "countrySubdivision": "Tamil Nadu",
            "countrySubdivisionName": "Tamil Nadu",
            "countrySubdivisionCode": "TN",
            "postalCode": "600006",
            "countryCode": "IN",
            "country": "India",
            "countryCodeISO3": "IND",
            "freeformAddress": "153, Wallace Garden 2nd Street, Thousand Lights West, Thousand Lights, Chennai 600006, Tamil Nadu",
            "localName": "Chennai"
        },
        "position": {
            "lat": 13.060965,
            "lon": 80.248509
        },
        "viewport": {
            "topLeftPoint": {
                "lat": 13.06186,
                "lon": 80.24759
            },
            "btmRightPoint": {
                "lat": 13.06007,
                "lon": 80.24943
            }
        },
        "entryPoints": [
            {
                "type": "main",
                "position": {
                    "lat": 13.06107,
                    "lon": 80.24843
                }
            }
        ],
        "chargingPark": {
            "connectors": [
                {
                    "connectorType": "StandardHouseholdCountrySpecific",
                    "ratedPowerKW": 1,
                    "voltageV": 110,
                    "currentA": 10,
                    "currentType": "AC1"
                },
                {
                    "connectorType": "IEC62196Type2Outlet",
                    "ratedPowerKW": 1,
                    "voltageV": 110,
                    "currentA": 10,
                    "currentType": "AC1"
                }
            ]
        }
    },
    {
        "type": "POI",
        "id": "ehiyWHWVcSkHjrf1GdwO_A",
        "score": 0.921426177,
        "dist": 6271.67232,
        "info": "search:ta:356009046347990-IN",
        "matchConfidence": {
            "score": 0.8376869520551274
        },
        "poi": {
            "name": "Ather Grid Charging Station",
            "brands": [
                {
                    "name": "ASR"
                }
            ],
            "categorySet": [
                {
                    "id": 7309
                }
            ],
            "categories": [
                "electric vehicle station"
            ],
            "classifications": [
                {
                    "code": "ELECTRIC_VEHICLE_STATION",
                    "names": [
                        {
                            "nameLocale": "en-US",
                            "name": "electric vehicle station"
                        }
                    ]
                }
            ]
        },
        "address": {
            "streetName": "Radial Road",
            "municipalitySubdivision": "Okkiyam Thuraipakkam",
            "municipality": "Chennai",
            "countrySecondarySubdivision": "Chennai",
            "countrySubdivision": "Tamil Nadu",
            "countrySubdivisionName": "Tamil Nadu",
            "countrySubdivisionCode": "TN",
            "postalCode": "600097",
            "countryCode": "IN",
            "country": "India",
            "countryCodeISO3": "IND",
            "freeformAddress": "Radial Road, Okkiyam Thuraipakkam, Chennai 600097, Tamil Nadu",
            "localName": "Chennai"
        },
        "position": {
            "lat": 12.950052,
            "lon": 80.236591
        },
        "viewport": {
            "topLeftPoint": {
                "lat": 12.95095,
                "lon": 80.23567
            },
            "btmRightPoint": {
                "lat": 12.94915,
                "lon": 80.23751
            }
        },
        "entryPoints": [
            {
                "type": "main",
                "position": {
                    "lat": 12.94982,
                    "lon": 80.23656
                }
            }
        ],
        "chargingPark": {
            "connectors": [
                {
                    "connectorType": "StandardHouseholdCountrySpecific",
                    "ratedPowerKW": 1,
                    "voltageV": 110,
                    "currentA": 10,
                    "currentType": "AC1"
                },
                {
                    "connectorType": "IEC62196Type2Outlet",
                    "ratedPowerKW": 1,
                    "voltageV": 110,
                    "currentA": 10,
                    "currentType": "AC1"
                }
            ]
        }
    },
    {
        "type": "POI",
        "id": "3rXj8r16gOEjusXJjEtvnw",
        "score": 0.9156158566,
        "dist": 7802.662077,
        "info": "search:ta:356009046348091-IN",
        "matchConfidence": {
            "score": 0.8373739854193337
        },
        "poi": {
            "name": "Ather Grid Charging Station",
            "brands": [
                {
                    "name": "ASR"
                }
            ],
            "categorySet": [
                {
                    "id": 7309
                }
            ],
            "categories": [
                "electric vehicle station"
            ],
            "classifications": [
                {
                    "code": "ELECTRIC_VEHICLE_STATION",
                    "names": [
                        {
                            "nameLocale": "en-US",
                            "name": "electric vehicle station"
                        }
                    ]
                }
            ]
        },
        "address": {
            "streetName": "Nelson Manickam Road",
            "municipalitySubdivision": "Aminjikkarai",
            "municipality": "Chennai",
            "countrySecondarySubdivision": "Chennai",
            "countrySubdivision": "Tamil Nadu",
            "countrySubdivisionName": "Tamil Nadu",
            "countrySubdivisionCode": "TN",
            "postalCode": "600029",
            "countryCode": "IN",
            "country": "India",
            "countryCodeISO3": "IND",
            "freeformAddress": "Nelson Manickam Road, Aminjikkarai, Chennai 600029, Tamil Nadu",
            "localName": "Chennai"
        },
        "position": {
            "lat": 13.07348,
            "lon": 80.22144
        },
        "viewport": {
            "topLeftPoint": {
                "lat": 13.07438,
                "lon": 80.22052
            },
            "btmRightPoint": {
                "lat": 13.07258,
                "lon": 80.22236
            }
        },
        "entryPoints": [
            {
                "type": "main",
                "position": {
                    "lat": 13.07348,
                    "lon": 80.22099
                }
            }
        ],
        "chargingPark": {
            "connectors": [
                {
                    "connectorType": "StandardHouseholdCountrySpecific",
                    "ratedPowerKW": 1,
                    "voltageV": 110,
                    "currentA": 10,
                    "currentType": "AC1"
                },
                {
                    "connectorType": "IEC62196Type2Outlet",
                    "ratedPowerKW": 1,
                    "voltageV": 110,
                    "currentA": 10,
                    "currentType": "AC1"
                }
            ]
        }
    },
    {
        "type": "POI",
        "id": "tSHpjoHIbQyzDqnOBLS9QA",
        "score": 0.9059348702,
        "dist": 9101.003951,
        "info": "search:ta:356009046348278-IN",
        "matchConfidence": {
            "score": 0.8373739854193337
        },
        "poi": {
            "name": "Ather Grid Charging Station",
            "brands": [
                {
                    "name": "ASR"
                }
            ],
            "categorySet": [
                {
                    "id": 7309
                }
            ],
            "categories": [
                "electric vehicle station"
            ],
            "classifications": [
                {
                    "code": "ELECTRIC_VEHICLE_STATION",
                    "names": [
                        {
                            "nameLocale": "en-US",
                            "name": "electric vehicle station"
                        }
                    ]
                }
            ]
        },
        "address": {
            "streetName": "Madha Church Street",
            "municipalitySubdivision": "Karapakkam",
            "municipality": "Chennai",
            "countrySecondarySubdivision": "Chennai",
            "countrySubdivision": "Tamil Nadu",
            "countrySubdivisionName": "Tamil Nadu",
            "countrySubdivisionCode": "TN",
            "postalCode": "600097",
            "countryCode": "IN",
            "country": "India",
            "countryCodeISO3": "IND",
            "freeformAddress": "Madha Church Street, Karapakkam, Chennai 600097, Tamil Nadu",
            "localName": "Chennai"
        },
        "position": {
            "lat": 12.924803,
            "lon": 80.233274
        },
        "viewport": {
            "topLeftPoint": {
                "lat": 12.9257,
                "lon": 80.23235
            },
            "btmRightPoint": {
                "lat": 12.9239,
                "lon": 80.2342
            }
        },
        "entryPoints": [
            {
                "type": "main",
                "position": {
                    "lat": 12.92513,
                    "lon": 80.23334
                }
            }
        ],
        "chargingPark": {
            "connectors": [
                {
                    "connectorType": "StandardHouseholdCountrySpecific",
                    "ratedPowerKW": 1,
                    "voltageV": 110,
                    "currentA": 10,
                    "currentType": "AC1"
                },
                {
                    "connectorType": "IEC62196Type2Outlet",
                    "ratedPowerKW": 1,
                    "voltageV": 110,
                    "currentA": 10,
                    "currentType": "AC1"
                }
            ]
        }
    },
    {
        "type": "POI",
        "id": "OBpO1x2IPZW39eNLNQGEww",
        "score": 0.9059348702,
        "dist": 9712.96454,
        "info": "search:ta:356009046348502-IN",
        "matchConfidence": {
            "score": 0.8373739854193337
        },
        "poi": {
            "name": "Ather Grid Charging Station",
            "brands": [
                {
                    "name": "ASR"
                }
            ],
            "categorySet": [
                {
                    "id": 7309
                }
            ],
            "categories": [
                "electric vehicle station"
            ],
            "classifications": [
                {
                    "code": "ELECTRIC_VEHICLE_STATION",
                    "names": [
                        {
                            "nameLocale": "en-US",
                            "name": "electric vehicle station"
                        }
                    ]
                }
            ]
        },
        "address": {
            "streetName": "Anna Nagar 4th Main Road",
            "municipalitySubdivision": "Anna Nagar",
            "municipality": "Chennai",
            "municipalitySecondarySubdivision": "Block T",
            "countrySecondarySubdivision": "Chennai",
            "countrySubdivision": "Tamil Nadu",
            "countrySubdivisionName": "Tamil Nadu",
            "countrySubdivisionCode": "TN",
            "postalCode": "600040",
            "countryCode": "IN",
            "country": "India",
            "countryCodeISO3": "IND",
            "freeformAddress": "Anna Nagar 4th Main Road, Block T, Anna Nagar, Chennai 600040, Tamil Nadu",
            "localName": "Chennai"
        },
        "position": {
            "lat": 13.09026,
            "lon": 80.21752
        },
        "viewport": {
            "topLeftPoint": {
                "lat": 13.09116,
                "lon": 80.2166
            },
            "btmRightPoint": {
                "lat": 13.08936,
                "lon": 80.21844
            }
        },
        "entryPoints": [
            {
                "type": "main",
                "position": {
                    "lat": 13.09036,
                    "lon": 80.21752
                }
            }
        ],
        "chargingPark": {
            "connectors": [
                {
                    "connectorType": "StandardHouseholdCountrySpecific",
                    "ratedPowerKW": 1,
                    "voltageV": 110,
                    "currentA": 10,
                    "currentType": "AC1"
                },
                {
                    "connectorType": "IEC62196Type2Outlet",
                    "ratedPowerKW": 1,
                    "voltageV": 110,
                    "currentA": 10,
                    "currentType": "AC1"
                }
            ]
        }
    },
    {
        "type": "POI",
        "id": "0dPCwl7sle5IesZphzH2dA",
        "score": 0.9046646357,
        "dist": 9588.16643,
        "info": "search:ta:356009046348002-IN",
        "matchConfidence": {
            "score": 0.8367074916522029
        },
        "poi": {
            "name": "Ather Grid Charging Station",
            "brands": [
                {
                    "name": "ASR"
                }
            ],
            "categorySet": [
                {
                    "id": 7309
                }
            ],
            "categories": [
                "electric vehicle station"
            ],
            "classifications": [
                {
                    "code": "ELECTRIC_VEHICLE_STATION",
                    "names": [
                        {
                            "nameLocale": "en-US",
                            "name": "electric vehicle station"
                        }
                    ]
                }
            ]
        },
        "address": {
            "streetName": "Jawaharlal Nehru Road",
            "municipalitySubdivision": "Arumbakkam",
            "municipality": "Chennai",
            "municipalitySecondarySubdivision": "Thirumangalam",
            "countrySecondarySubdivision": "Chennai",
            "countrySubdivision": "Tamil Nadu",
            "countrySubdivisionName": "Tamil Nadu",
            "countrySubdivisionCode": "TN",
            "postalCode": "600040",
            "countryCode": "IN",
            "country": "India",
            "countryCodeISO3": "IND",
            "freeformAddress": "Jawaharlal Nehru Road, Thirumangalam, Arumbakkam, Chennai 600040, Tamil Nadu",
            "localName": "Chennai"
        },
        "position": {
            "lat": 13.080807,
            "lon": 80.197545
        },
        "viewport": {
            "topLeftPoint": {
                "lat": 13.08171,
                "lon": 80.19662
            },
            "btmRightPoint": {
                "lat": 13.07991,
                "lon": 80.19847
            }
        },
        "entryPoints": [
            {
                "type": "main",
                "position": {
                    "lat": 13.08095,
                    "lon": 80.19756
                }
            }
        ],
        "chargingPark": {
            "connectors": [
                {
                    "connectorType": "StandardHouseholdCountrySpecific",
                    "ratedPowerKW": 1,
                    "voltageV": 110,
                    "currentA": 10,
                    "currentType": "AC1"
                },
                {
                    "connectorType": "IEC62196Type2Outlet",
                    "ratedPowerKW": 1,
                    "voltageV": 110,
                    "currentA": 10,
                    "currentType": "AC1"
                }
            ]
        }
    },
    {
        "type": "POI",
        "id": "9N7AANfWDgolt8sgam00wg",
        "score": 0.9007455707,
        "dist": 2662.394475,
        "info": "search:ta:356009046348335-IN",
        "matchConfidence": {
            "score": 0.7972935728729095
        },
        "poi": {
            "name": "Government E Truck Charging Hub",
            "categorySet": [
                {
                    "id": 7309
                }
            ],
            "categories": [
                "electric vehicle station"
            ],
            "classifications": [
                {
                    "code": "ELECTRIC_VEHICLE_STATION",
                    "names": [
                        {
                            "nameLocale": "en-US",
                            "name": "electric vehicle station"
                        }
                    ]
                }
            ]
        },
        "address": {
            "streetName": "Ramakrishna Nagar 4th Cross Street",
            "municipalitySubdivision": "Raja Annamalai Puram",
            "municipality": "Chennai",
            "countrySecondarySubdivision": "Chennai",
            "countrySubdivision": "Tamil Nadu",
            "countrySubdivisionName": "Tamil Nadu",
            "countrySubdivisionCode": "TN",
            "postalCode": "600028",
            "countryCode": "IN",
            "country": "India",
            "countryCodeISO3": "IND",
            "freeformAddress": "Ramakrishna Nagar 4th Cross Street, Raja Annamalai Puram, Chennai 600028, Tamil Nadu",
            "localName": "Chennai"
        },
        "position": {
            "lat": 13.023234,
            "lon": 80.259228
        },
        "viewport": {
            "topLeftPoint": {
                "lat": 13.02413,
                "lon": 80.2583
            },
            "btmRightPoint": {
                "lat": 13.02233,
                "lon": 80.26015
            }
        },
        "entryPoints": [
            {
                "type": "main",
                "position": {
                    "lat": 13.02348,
                    "lon": 80.2593
                }
            }
        ],
        "chargingPark": {
            "connectors": [
                {
                    "connectorType": "StandardHouseholdCountrySpecific",
                    "ratedPowerKW": 3,
                    "voltageV": 230,
                    "currentA": 16,
                    "currentType": "AC1"
                }
            ]
        }
    },
    {
        "type": "POI",
        "id": "U4HgDhC3XZLUpb5w-PBweg",
        "score": 0.8929764032,
        "dist": 3753.90565,
        "info": "search:ta:356009046347856-IN",
        "matchConfidence": {
            "score": 0.7880864753293395
        },
        "poi": {
            "name": "Relux Electric Station",
            "brands": [
                {
                    "name": "Relux"
                }
            ],
            "categorySet": [
                {
                    "id": 7309
                }
            ],
            "categories": [
                "electric vehicle station"
            ],
            "classifications": [
                {
                    "code": "ELECTRIC_VEHICLE_STATION",
                    "names": [
                        {
                            "nameLocale": "en-US",
                            "name": "electric vehicle station"
                        }
                    ]
                }
            ]
        },
        "address": {
            "streetNumber": "16/8",
            "streetName": "Anna Salai",
            "municipalitySubdivision": "Alandur",
            "municipality": "Chennai",
            "municipalitySecondarySubdivision": "Mela Ilandaikulam",
            "countrySecondarySubdivision": "Chennai",
            "countrySubdivision": "Tamil Nadu",
            "countrySubdivisionName": "Tamil Nadu",
            "countrySubdivisionCode": "TN",
            "postalCode": "600032",
            "countryCode": "IN",
            "country": "India",
            "countryCodeISO3": "IND",
            "freeformAddress": "16/8, Anna Salai, Mela Ilandaikulam, Alandur, Chennai 600032, Tamil Nadu",
            "localName": "Chennai"
        },
        "position": {
            "lat": 13.007653,
            "lon": 80.207328
        },
        "viewport": {
            "topLeftPoint": {
                "lat": 13.00855,
                "lon": 80.2064
            },
            "btmRightPoint": {
                "lat": 13.00675,
                "lon": 80.20825
            }
        },
        "entryPoints": [
            {
                "type": "main",
                "position": {
                    "lat": 13.00782,
                    "lon": 80.2073
                }
            }
        ],
        "chargingPark": {
            "connectors": [
                {
                    "connectorType": "GBT20234Part3",
                    "ratedPowerKW": 25,
                    "voltageV": 400,
                    "currentA": 62,
                    "currentType": "DC"
                },
                {
                    "connectorType": "IEC62196Type2CCS",
                    "ratedPowerKW": 50,
                    "voltageV": 400,
                    "currentA": 125,
                    "currentType": "DC"
                },
                {
                    "connectorType": "IEC62196Type2Outlet",
                    "ratedPowerKW": 3,
                    "voltageV": 230,
                    "currentA": 16,
                    "currentType": "AC1"
                }
            ]
        }
    },
    {
        "type": "POI",
        "id": "fXseOteBbpcyU21ZXNbvcA",
        "score": 0.8901945949,
        "dist": 2852.532686,
        "info": "search:ta:356009046347917-IN",
        "matchConfidence": {
            "score": 0.7759639715033354
        },
        "poi": {
            "name": "EESL Nandanam Metro Station",
            "brands": [
                {
                    "name": "Exicom"
                }
            ],
            "categorySet": [
                {
                    "id": 7309
                }
            ],
            "categories": [
                "electric vehicle station"
            ],
            "classifications": [
                {
                    "code": "ELECTRIC_VEHICLE_STATION",
                    "names": [
                        {
                            "nameLocale": "en-US",
                            "name": "electric vehicle station"
                        }
                    ]
                }
            ]
        },
        "address": {
            "streetName": "Mount Road, Nandanam",
            "municipalitySubdivision": "Nandanam",
            "municipality": "Chennai",
            "municipalitySecondarySubdivision": "Rathna Nagar",
            "countrySecondarySubdivision": "Chennai",
            "countrySubdivision": "Tamil Nadu",
            "countrySubdivisionName": "Tamil Nadu",
            "countrySubdivisionCode": "TN",
            "postalCode": "600035",
            "countryCode": "IN",
            "country": "India",
            "countryCodeISO3": "IND",
            "freeformAddress": "Mount Road, Nandanam, Rathna Nagar, Nandanam, Chennai 600035, Tamil Nadu",
            "localName": "Chennai"
        },
        "position": {
            "lat": 13.031866,
            "lon": 80.241972
        },
        "viewport": {
            "topLeftPoint": {
                "lat": 13.03277,
                "lon": 80.24105
            },
            "btmRightPoint": {
                "lat": 13.03097,
                "lon": 80.2429
            }
        },
        "entryPoints": [
            {
                "type": "main",
                "position": {
                    "lat": 13.0318,
                    "lon": 80.24182
                }
            }
        ],
        "chargingPark": {
            "connectors": [
                {
                    "connectorType": "IEC62196Type3",
                    "ratedPowerKW": 3,
                    "voltageV": 230,
                    "currentA": 16,
                    "currentType": "AC1"
                }
            ]
        }
    },
    {
        "type": "POI",
        "id": "PpuZ0AfsQeHFbDQKvd6HOQ",
        "score": 0.8895475864,
        "dist": 2839.357073,
        "info": "search:ta:356009046348390-IN",
        "matchConfidence": {
            "score": 0.7767113393848288
        },
        "poi": {
            "name": "EESL Nandanam Metro Station",
            "brands": [
                {
                    "name": "Delta"
                }
            ],
            "categorySet": [
                {
                    "id": 7309
                }
            ],
            "categories": [
                "electric vehicle station"
            ],
            "classifications": [
                {
                    "code": "ELECTRIC_VEHICLE_STATION",
                    "names": [
                        {
                            "nameLocale": "en-US",
                            "name": "electric vehicle station"
                        }
                    ]
                }
            ]
        },
        "address": {
            "streetName": "Mount Road, Nandanam",
            "municipalitySubdivision": "Nandanam",
            "municipality": "Chennai",
            "municipalitySecondarySubdivision": "Rathna Nagar",
            "countrySecondarySubdivision": "Chennai",
            "countrySubdivision": "Tamil Nadu",
            "countrySubdivisionName": "Tamil Nadu",
            "countrySubdivisionCode": "TN",
            "postalCode": "600035",
            "countryCode": "IN",
            "country": "India",
            "countryCodeISO3": "IND",
            "freeformAddress": "Mount Road, Nandanam, Rathna Nagar, Nandanam, Chennai 600035, Tamil Nadu",
            "localName": "Chennai"
        },
        "position": {
            "lat": 13.031747,
            "lon": 80.241951
        },
        "viewport": {
            "topLeftPoint": {
                "lat": 13.03265,
                "lon": 80.24103
            },
            "btmRightPoint": {
                "lat": 13.03085,
                "lon": 80.24287
            }
        },
        "entryPoints": [
            {
                "type": "main",
                "position": {
                    "lat": 13.03171,
                    "lon": 80.24187
                }
            }
        ],
        "chargingPark": {
            "connectors": [
                {
                    "connectorType": "GBT20234Part3",
                    "ratedPowerKW": 25,
                    "voltageV": 400,
                    "currentA": 62,
                    "currentType": "DC"
                }
            ]
        }
    },
    {
        "type": "POI",
        "id": "u9aDC-OcdM8FozDD4sWn1w",
        "score": 0.877837956,
        "dist": 11512.685949,
        "info": "search:ta:356009046347872-IN",
        "matchConfidence": {
            "score": 0.8376869520551274
        },
        "poi": {
            "name": "Ather Grid Charging Station",
            "brands": [
                {
                    "name": "ASR"
                }
            ],
            "categorySet": [
                {
                    "id": 7309
                }
            ],
            "categories": [
                "electric vehicle station"
            ],
            "classifications": [
                {
                    "code": "ELECTRIC_VEHICLE_STATION",
                    "names": [
                        {
                            "nameLocale": "en-US",
                            "name": "electric vehicle station"
                        }
                    ]
                }
            ]
        },
        "address": {
            "streetNumber": "396/1",
            "streetName": "Medavakkam Mambakkam Road",
            "municipalitySubdivision": "Medavakkam",
            "municipality": "Chennai",
            "municipalitySecondarySubdivision": "VGP Doctor Vimala Nagar",
            "countrySecondarySubdivision": "Chennai",
            "countrySubdivision": "Tamil Nadu",
            "countrySubdivisionName": "Tamil Nadu",
            "countrySubdivisionCode": "TN",
            "postalCode": "600073",
            "countryCode": "IN",
            "country": "India",
            "countryCodeISO3": "IND",
            "freeformAddress": "396/1, Medavakkam Mambakkam Road, VGP Doctor Vimala Nagar, Medavakkam, Chennai 600073, Tamil Nadu",
            "localName": "Chennai"
        },
        "position": {
            "lat": 12.914811,
            "lon": 80.192039
        },
        "viewport": {
            "topLeftPoint": {
                "lat": 12.91571,
                "lon": 80.19112
            },
            "btmRightPoint": {
                "lat": 12.91391,
                "lon": 80.19296
            }
        },
        "entryPoints": [
            {
                "type": "main",
                "position": {
                    "lat": 12.9148,
                    "lon": 80.19214
                }
            }
        ],
        "chargingPark": {
            "connectors": [
                {
                    "connectorType": "StandardHouseholdCountrySpecific",
                    "ratedPowerKW": 1,
                    "voltageV": 110,
                    "currentA": 10,
                    "currentType": "AC1"
                },
                {
                    "connectorType": "IEC62196Type2Outlet",
                    "ratedPowerKW": 1,
                    "voltageV": 110,
                    "currentA": 10,
                    "currentType": "AC1"
                }
            ]
        }
    },
    {
        "type": "POI",
        "id": "OTlZjtAadglOHlZ9QvZK5g",
        "score": 0.877837956,
        "dist": 11580.675856,
        "info": "search:ta:356009046348499-IN",
        "matchConfidence": {
            "score": 0.8376869520551274
        },
        "poi": {
            "name": "Ather Grid Charging Station",
            "brands": [
                {
                    "name": "ASR"
                }
            ],
            "categorySet": [
                {
                    "id": 7309
                }
            ],
            "categories": [
                "electric vehicle station"
            ],
            "classifications": [
                {
                    "code": "ELECTRIC_VEHICLE_STATION",
                    "names": [
                        {
                            "nameLocale": "en-US",
                            "name": "electric vehicle station"
                        }
                    ]
                }
            ]
        },
        "address": {
            "streetNumber": "72",
            "streetName": "Mount Poonamallee High Road",
            "municipalitySubdivision": "Iyappanthangal",
            "municipality": "Chennai",
            "countrySecondarySubdivision": "Chennai",
            "countrySubdivision": "Tamil Nadu",
            "countrySubdivisionName": "Tamil Nadu",
            "countrySubdivisionCode": "TN",
            "postalCode": "600056",
            "countryCode": "IN",
            "country": "India",
            "countryCodeISO3": "IND",
            "freeformAddress": "72, Mount Poonamallee High Road, Iyappanthangal, Chennai 600056, Tamil Nadu",
            "localName": "Chennai"
        },
        "position": {
            "lat": 13.037037,
            "lon": 80.139838
        },
        "viewport": {
            "topLeftPoint": {
                "lat": 13.03794,
                "lon": 80.13891
            },
            "btmRightPoint": {
                "lat": 13.03614,
                "lon": 80.14076
            }
        },
        "entryPoints": [
            {
                "type": "main",
                "position": {
                    "lat": 13.03713,
                    "lon": 80.13985
                }
            }
        ],
        "chargingPark": {
            "connectors": [
                {
                    "connectorType": "StandardHouseholdCountrySpecific",
                    "ratedPowerKW": 1,
                    "voltageV": 110,
                    "currentA": 10,
                    "currentType": "AC1"
                },
                {
                    "connectorType": "IEC62196Type2Outlet",
                    "ratedPowerKW": 1,
                    "voltageV": 110,
                    "currentA": 10,
                    "currentType": "AC1"
                }
            ]
        }
    },
    {
        "type": "POI",
        "id": "oJSM_zQ0F4jqOjTx8Sj5xg",
        "score": 0.877837956,
        "dist": 12095.181667,
        "info": "search:ta:356009046348069-IN",
        "matchConfidence": {
            "score": 0.8376043683344037
        },
        "poi": {
            "name": "Ather Grid Charging Station",
            "brands": [
                {
                    "name": "ASR"
                }
            ],
            "categorySet": [
                {
                    "id": 7309
                }
            ],
            "categories": [
                "electric vehicle station"
            ],
            "classifications": [
                {
                    "code": "ELECTRIC_VEHICLE_STATION",
                    "names": [
                        {
                            "nameLocale": "en-US",
                            "name": "electric vehicle station"
                        }
                    ]
                }
            ]
        },
        "address": {
            "streetNumber": "4A",
            "streetName": "Grand Southern Trunk Road",
            "municipalitySubdivision": "Chromepet",
            "municipality": "Chennai",
            "countrySecondarySubdivision": "Chennai",
            "countrySubdivision": "Tamil Nadu",
            "countrySubdivisionName": "Tamil Nadu",
            "countrySubdivisionCode": "TN",
            "postalCode": "600044",
            "countryCode": "IN",
            "country": "India",
            "countryCodeISO3": "IND",
            "freeformAddress": "4A, Grand Southern Trunk Road, Chromepet, Chennai 600044, Tamil Nadu",
            "localName": "Chennai"
        },
        "position": {
            "lat": 12.955719,
            "lon": 80.143074
        },
        "viewport": {
            "topLeftPoint": {
                "lat": 12.95662,
                "lon": 80.14215
            },
            "btmRightPoint": {
                "lat": 12.95482,
                "lon": 80.144
            }
        },
        "entryPoints": [
            {
                "type": "main",
                "position": {
                    "lat": 12.95576,
                    "lon": 80.14299
                }
            }
        ],
        "chargingPark": {
            "connectors": [
                {
                    "connectorType": "StandardHouseholdCountrySpecific",
                    "ratedPowerKW": 1,
                    "voltageV": 110,
                    "currentA": 10,
                    "currentType": "AC1"
                },
                {
                    "connectorType": "IEC62196Type2Outlet",
                    "ratedPowerKW": 1,
                    "voltageV": 110,
                    "currentA": 10,
                    "currentType": "AC1"
                }
            ]
        }
    },
    {
        "type": "POI",
        "id": "in__JnQe1XeXnb7thitGVg",
        "score": 0.877837956,
        "dist": 13422.163885,
        "info": "search:ta:356009046348469-IN",
        "matchConfidence": {
            "score": 0.8373739854193337
        },
        "poi": {
            "name": "Ather Grid Charging Station",
            "brands": [
                {
                    "name": "ASR"
                }
            ],
            "categorySet": [
                {
                    "id": 7309
                }
            ],
            "categories": [
                "electric vehicle station"
            ],
            "classifications": [
                {
                    "code": "ELECTRIC_VEHICLE_STATION",
                    "names": [
                        {
                            "nameLocale": "en-US",
                            "name": "electric vehicle station"
                        }
                    ]
                }
            ]
        },
        "address": {
            "streetName": "Balaji Nagar 2nd Cross Street",
            "municipalitySubdivision": "Kolathur",
            "municipality": "Chennai",
            "countrySecondarySubdivision": "Chennai",
            "countrySubdivision": "Tamil Nadu",
            "countrySubdivisionName": "Tamil Nadu",
            "countrySubdivisionCode": "TN",
            "postalCode": "600099",
            "countryCode": "IN",
            "country": "India",
            "countryCodeISO3": "IND",
            "freeformAddress": "Balaji Nagar 2nd Cross Street, Kolathur, Chennai 600099, Tamil Nadu",
            "localName": "Chennai"
        },
        "position": {
            "lat": 13.125684,
            "lon": 80.224253
        },
        "viewport": {
            "topLeftPoint": {
                "lat": 13.12658,
                "lon": 80.22333
            },
            "btmRightPoint": {
                "lat": 13.12478,
                "lon": 80.22518
            }
        },
        "entryPoints": [
            {
                "type": "main",
                "position": {
                    "lat": 13.12559,
                    "lon": 80.22426
                }
            }
        ],
        "chargingPark": {
            "connectors": [
                {
                    "connectorType": "StandardHouseholdCountrySpecific",
                    "ratedPowerKW": 1,
                    "voltageV": 110,
                    "currentA": 10,
                    "currentType": "AC1"
                },
                {
                    "connectorType": "IEC62196Type2Outlet",
                    "ratedPowerKW": 1,
                    "voltageV": 110,
                    "currentA": 10,
                    "currentType": "AC1"
                }
            ]
        }
    },
    {
        "type": "POI",
        "id": "P4V45AxkWaL2M8wTlkgoNw",
        "score": 0.8610650897,
        "dist": 2179.16105,
        "info": "search:ta:356009046348117-IN",
        "matchConfidence": {
            "score": 0.75
        },
        "poi": {
            "name": "EESL Little Mount Metro",
            "brands": [
                {
                    "name": "Exicom"
                }
            ],
            "categorySet": [
                {
                    "id": 7309
                }
            ],
            "categories": [
                "electric vehicle station"
            ],
            "classifications": [
                {
                    "code": "ELECTRIC_VEHICLE_STATION",
                    "names": [
                        {
                            "nameLocale": "en-US",
                            "name": "electric vehicle station"
                        }
                    ]
                }
            ]
        },
        "address": {
            "streetName": "Anna Salai",
            "municipalitySubdivision": "Saidapet",
            "municipality": "Chennai",
            "municipalitySecondarySubdivision": "Gotha Medu Housing Board",
            "countrySecondarySubdivision": "Chennai",
            "countrySubdivision": "Tamil Nadu",
            "countrySubdivisionName": "Tamil Nadu",
            "countrySubdivisionCode": "TN",
            "postalCode": "600062",
            "countryCode": "IN",
            "country": "India",
            "countryCodeISO3": "IND",
            "freeformAddress": "Anna Salai, Gotha Medu Housing Board, Saidapet, Chennai 600062, Tamil Nadu",
            "localName": "Chennai"
        },
        "position": {
            "lat": 13.014832,
            "lon": 80.223881
        },
        "viewport": {
            "topLeftPoint": {
                "lat": 13.01573,
                "lon": 80.22296
            },
            "btmRightPoint": {
                "lat": 13.01393,
                "lon": 80.2248
            }
        },
        "entryPoints": [
            {
                "type": "main",
                "position": {
                    "lat": 13.01461,
                    "lon": 80.224
                }
            }
        ],
        "chargingPark": {
            "connectors": [
                {
                    "connectorType": "IEC62196Type2Outlet",
                    "ratedPowerKW": 7,
                    "voltageV": 230,
                    "currentA": 32,
                    "currentType": "AC1"
                },
                {
                    "connectorType": "IEC62196Type2CCS",
                    "ratedPowerKW": 50,
                    "voltageV": 400,
                    "currentA": 125,
                    "currentType": "DC"
                },
                {
                    "connectorType": "Chademo",
                    "ratedPowerKW": 50,
                    "voltageV": 400,
                    "currentA": 125,
                    "currentType": "DC"
                }
            ]
        }
    },
    {
        "type": "POI",
        "id": "6gvXqmkdc9SQHyxAQUdFbQ",
        "score": 0.8610650897,
        "dist": 2227.138893,
        "info": "search:ta:356009046348124-IN",
        "matchConfidence": {
            "score": 0.75
        },
        "poi": {
            "name": "Tata Power EZ Charge",
            "brands": [
                {
                    "name": "TATA Power"
                }
            ],
            "categorySet": [
                {
                    "id": 7309
                }
            ],
            "categories": [
                "electric vehicle station"
            ],
            "classifications": [
                {
                    "code": "ELECTRIC_VEHICLE_STATION",
                    "names": [
                        {
                            "nameLocale": "en-US",
                            "name": "electric vehicle station"
                        }
                    ]
                }
            ]
        },
        "address": {
            "streetNumber": "42",
            "streetName": "Velachery Main Road",
            "municipalitySubdivision": "Guindy",
            "municipality": "Chennai",
            "municipalitySecondarySubdivision": "Guindy National Park",
            "countrySecondarySubdivision": "Chennai",
            "countrySubdivision": "Tamil Nadu",
            "countrySubdivisionName": "Tamil Nadu",
            "countrySubdivisionCode": "TN",
            "postalCode": "600032",
            "countryCode": "IN",
            "country": "India",
            "countryCodeISO3": "IND",
            "freeformAddress": "42, Velachery Main Road, Guindy National Park, Guindy, Chennai 600032, Tamil Nadu",
            "localName": "Chennai"
        },
        "position": {
            "lat": 13.007733,
            "lon": 80.221448
        },
        "viewport": {
            "topLeftPoint": {
                "lat": 13.00863,
                "lon": 80.22052
            },
            "btmRightPoint": {
                "lat": 13.00683,
                "lon": 80.22237
            }
        },
        "entryPoints": [
            {
                "type": "main",
                "position": {
                    "lat": 13.00778,
                    "lon": 80.22135
                }
            }
        ],
        "chargingPark": {
            "connectors": [
                {
                    "connectorType": "IEC62196Type3",
                    "ratedPowerKW": 3,
                    "voltageV": 230,
                    "currentA": 16,
                    "currentType": "AC1"
                },
                {
                    "connectorType": "IEC62196Type2CCS",
                    "ratedPowerKW": 50,
                    "voltageV": 400,
                    "currentA": 125,
                    "currentType": "DC"
                },
                {
                    "connectorType": "Chademo",
                    "ratedPowerKW": 50,
                    "voltageV": 400,
                    "currentA": 125,
                    "currentType": "DC"
                },
                {
                    "connectorType": "StandardHouseholdCountrySpecific",
                    "ratedPowerKW": 3,
                    "voltageV": 230,
                    "currentA": 16,
                    "currentType": "AC1"
                }
            ]
        }
    },
    {
        "type": "POI",
        "id": "KBSIpA4eL_Gg0uUGHOZP3Q",
        "score": 0.8425790071,
        "dist": 16093.52222,
        "info": "search:ta:356009046348311-IN",
        "matchConfidence": {
            "score": 0.8376869520551274
        },
        "poi": {
            "name": "Ather Grid Charging Station",
            "brands": [
                {
                    "name": "ASR"
                }
            ],
            "categorySet": [
                {
                    "id": 7309
                }
            ],
            "categories": [
                "electric vehicle station"
            ],
            "classifications": [
                {
                    "code": "ELECTRIC_VEHICLE_STATION",
                    "names": [
                        {
                            "nameLocale": "en-US",
                            "name": "electric vehicle station"
                        }
                    ]
                }
            ]
        },
        "address": {
            "streetNumber": "14",
            "streetName": "Air Force Road",
            "municipalitySubdivision": "Tambaram",
            "municipality": "Chennai",
            "municipalitySecondarySubdivision": "Professors Colony",
            "countrySecondarySubdivision": "Chennai",
            "countrySubdivision": "Tamil Nadu",
            "countrySubdivisionName": "Tamil Nadu",
            "countrySubdivisionCode": "TN",
            "postalCode": "600059",
            "countryCode": "IN",
            "country": "India",
            "countryCodeISO3": "IND",
            "freeformAddress": "14, Air Force Road, Professors Colony, Tambaram, Chennai 600059, Tamil Nadu",
            "localName": "Chennai"
        },
        "position": {
            "lat": 12.914859,
            "lon": 80.126752
        },
        "viewport": {
            "topLeftPoint": {
                "lat": 12.91576,
                "lon": 80.12583
            },
            "btmRightPoint": {
                "lat": 12.91396,
                "lon": 80.12767
            }
        },
        "entryPoints": [
            {
                "type": "main",
                "position": {
                    "lat": 12.91494,
                    "lon": 80.12668
                }
            }
        ],
        "chargingPark": {
            "connectors": [
                {
                    "connectorType": "StandardHouseholdCountrySpecific",
                    "ratedPowerKW": 1,
                    "voltageV": 110,
                    "currentA": 10,
                    "currentType": "AC1"
                },
                {
                    "connectorType": "IEC62196Type2Outlet",
                    "ratedPowerKW": 1,
                    "voltageV": 110,
                    "currentA": 10,
                    "currentType": "AC1"
                }
            ]
        }
    },
    {
        "type": "POI",
        "id": "5GaC8OBADUTkS11NL_I5lA",
        "score": 0.8406038284,
        "dist": 15541.622614,
        "info": "search:ta:356009046348236-IN",
        "matchConfidence": {
            "score": 0.8367074916522029
        },
        "poi": {
            "name": "Ather Grid Charging Station",
            "brands": [
                {
                    "name": "ASR"
                }
            ],
            "categorySet": [
                {
                    "id": 7309
                }
            ],
            "categories": [
                "electric vehicle station"
            ],
            "classifications": [
                {
                    "code": "ELECTRIC_VEHICLE_STATION",
                    "names": [
                        {
                            "nameLocale": "en-US",
                            "name": "electric vehicle station"
                        }
                    ]
                }
            ]
        },
        "address": {
            "streetName": "Agaram Main Road",
            "municipalitySubdivision": "Selaiyur",
            "municipality": "Chennai",
            "countrySecondarySubdivision": "Chennai",
            "countrySubdivision": "Tamil Nadu",
            "countrySubdivisionName": "Tamil Nadu",
            "countrySubdivisionCode": "TN",
            "postalCode": "600073",
            "countryCode": "IN",
            "country": "India",
            "countryCodeISO3": "IND",
            "freeformAddress": "Agaram Main Road, Selaiyur, Chennai 600073, Tamil Nadu",
            "localName": "Chennai"
        },
        "position": {
            "lat": 12.905749,
            "lon": 80.142234
        },
        "viewport": {
            "topLeftPoint": {
                "lat": 12.90665,
                "lon": 80.14131
            },
            "btmRightPoint": {
                "lat": 12.90485,
                "lon": 80.14316
            }
        },
        "entryPoints": [
            {
                "type": "main",
                "position": {
                    "lat": 12.90573,
                    "lon": 80.14237
                }
            }
        ],
        "chargingPark": {
            "connectors": [
                {
                    "connectorType": "StandardHouseholdCountrySpecific",
                    "ratedPowerKW": 1,
                    "voltageV": 110,
                    "currentA": 10,
                    "currentType": "AC1"
                },
                {
                    "connectorType": "IEC62196Type2Outlet",
                    "ratedPowerKW": 1,
                    "voltageV": 110,
                    "currentA": 10,
                    "currentType": "AC1"
                }
            ]
        }
    },
    {
        "type": "POI",
        "id": "-5-ianGHMqV1c9XlCXJStQ",
        "score": 0.8284733295,
        "dist": 10237.961095,
        "info": "search:ta:356009046348513-IN",
        "matchConfidence": {
            "score": 0.7808929056495524
        },
        "poi": {
            "name": "EESL High Court Station",
            "brands": [
                {
                    "name": "Delta"
                }
            ],
            "categorySet": [
                {
                    "id": 7309
                }
            ],
            "categories": [
                "electric vehicle station"
            ],
            "classifications": [
                {
                    "code": "ELECTRIC_VEHICLE_STATION",
                    "names": [
                        {
                            "nameLocale": "en-US",
                            "name": "electric vehicle station"
                        }
                    ]
                }
            ]
        },
        "address": {
            "streetName": "Esplanade Road",
            "municipalitySubdivision": "George Town",
            "municipality": "Chennai",
            "municipalitySecondarySubdivision": "Parrys",
            "countrySecondarySubdivision": "Chennai",
            "countrySubdivision": "Tamil Nadu",
            "countrySubdivisionName": "Tamil Nadu",
            "countrySubdivisionCode": "TN",
            "postalCode": "600104",
            "countryCode": "IN",
            "country": "India",
            "countryCodeISO3": "IND",
            "freeformAddress": "Esplanade Road, Parrys, George Town, Chennai 600104, Tamil Nadu",
            "localName": "Chennai"
        },
        "position": {
            "lat": 13.088012,
            "lon": 80.285327
        },
        "viewport": {
            "topLeftPoint": {
                "lat": 13.08891,
                "lon": 80.2844
            },
            "btmRightPoint": {
                "lat": 13.08711,
                "lon": 80.28625
            }
        },
        "entryPoints": [
            {
                "type": "main",
                "position": {
                    "lat": 13.08803,
                    "lon": 80.28524
                }
            }
        ],
        "chargingPark": {
            "connectors": [
                {
                    "connectorType": "GBT20234Part3",
                    "ratedPowerKW": 25,
                    "voltageV": 400,
                    "currentA": 62,
                    "currentType": "DC"
                }
            ]
        }
    },
    {
        "type": "POI",
        "id": "teWg-3kc1eK_yfYIjR_JAg",
        "score": 0.8284733295,
        "dist": 10242.183755,
        "info": "search:ta:356009046348355-IN",
        "matchConfidence": {
            "score": 0.7803009404552083
        },
        "poi": {
            "name": "EESL High Court Station",
            "brands": [
                {
                    "name": "Exicom"
                }
            ],
            "categorySet": [
                {
                    "id": 7309
                }
            ],
            "categories": [
                "electric vehicle station"
            ],
            "classifications": [
                {
                    "code": "ELECTRIC_VEHICLE_STATION",
                    "names": [
                        {
                            "nameLocale": "en-US",
                            "name": "electric vehicle station"
                        }
                    ]
                }
            ]
        },
        "address": {
            "streetName": "Esplanade Road",
            "municipalitySubdivision": "George Town",
            "municipality": "Chennai",
            "municipalitySecondarySubdivision": "Parrys",
            "countrySecondarySubdivision": "Chennai",
            "countrySubdivision": "Tamil Nadu",
            "countrySubdivisionName": "Tamil Nadu",
            "countrySubdivisionCode": "TN",
            "postalCode": "600104",
            "countryCode": "IN",
            "country": "India",
            "countryCodeISO3": "IND",
            "freeformAddress": "Esplanade Road, Parrys, George Town, Chennai 600104, Tamil Nadu",
            "localName": "Chennai"
        },
        "position": {
            "lat": 13.088049,
            "lon": 80.285339
        },
        "viewport": {
            "topLeftPoint": {
                "lat": 13.08895,
                "lon": 80.28442
            },
            "btmRightPoint": {
                "lat": 13.08715,
                "lon": 80.28626
            }
        },
        "entryPoints": [
            {
                "type": "main",
                "position": {
                    "lat": 13.08807,
                    "lon": 80.28525
                }
            }
        ],
        "chargingPark": {
            "connectors": [
                {
                    "connectorType": "IEC62196Type3",
                    "ratedPowerKW": 3,
                    "voltageV": 230,
                    "currentA": 16,
                    "currentType": "AC1"
                },
                {
                    "connectorType": "IEC62196Type2Outlet",
                    "ratedPowerKW": 7,
                    "voltageV": 230,
                    "currentA": 32,
                    "currentType": "AC1"
                },
                {
                    "connectorType": "IEC62196Type2CCS",
                    "ratedPowerKW": 50,
                    "voltageV": 400,
                    "currentA": 125,
                    "currentType": "DC"
                },
                {
                    "connectorType": "Chademo",
                    "ratedPowerKW": 50,
                    "voltageV": 400,
                    "currentA": 125,
                    "currentType": "DC"
                }
            ]
        }
    },
    {
        "type": "POI",
        "id": "C5IX9MpiU-QrzgNUZ_dedA",
        "score": 0.8261790276,
        "dist": 19727.291665,
        "info": "search:ta:356009046347977-IN",
        "matchConfidence": {
            "score": 0.8376869520551274
        },
        "poi": {
            "name": "Ather Grid Charging Station",
            "brands": [
                {
                    "name": "ASR"
                }
            ],
            "categorySet": [
                {
                    "id": 7309
                }
            ],
            "categories": [
                "electric vehicle station"
            ],
            "classifications": [
                {
                    "code": "ELECTRIC_VEHICLE_STATION",
                    "names": [
                        {
                            "nameLocale": "en-US",
                            "name": "electric vehicle station"
                        }
                    ]
                }
            ]
        },
        "address": {
            "streetNumber": "34",
            "streetName": "Rajiv Gandhi Salai",
            "municipalitySubdivision": "Thorapakkam",
            "municipality": "Thiruporur",
            "municipalitySecondarySubdivision": "Kazhipathur",
            "countrySecondarySubdivision": "Chengalpattu",
            "countrySubdivision": "Tamil Nadu",
            "countrySubdivisionName": "Tamil Nadu",
            "countrySubdivisionCode": "TN",
            "postalCode": "603103",
            "countryCode": "IN",
            "country": "India",
            "countryCodeISO3": "IND",
            "freeformAddress": "34, Rajiv Gandhi Salai, Kazhipathur, Thorapakkam, Thiruporur 603103, Tamil Nadu",
            "localName": "Thiruporur"
        },
        "position": {
            "lat": 12.829196,
            "lon": 80.229813
        },
        "viewport": {
            "topLeftPoint": {
                "lat": 12.8301,
                "lon": 80.22889
            },
            "btmRightPoint": {
                "lat": 12.8283,
                "lon": 80.23074
            }
        },
        "entryPoints": [
            {
                "type": "main",
                "position": {
                    "lat": 12.82929,
                    "lon": 80.23005
                }
            }
        ],
        "chargingPark": {
            "connectors": [
                {
                    "connectorType": "StandardHouseholdCountrySpecific",
                    "ratedPowerKW": 1,
                    "voltageV": 110,
                    "currentA": 10,
                    "currentType": "AC1"
                },
                {
                    "connectorType": "IEC62196Type2Outlet",
                    "ratedPowerKW": 1,
                    "voltageV": 110,
                    "currentA": 10,
                    "currentType": "AC1"
                }
            ]
        }
    },
    {
        "type": "POI",
        "id": "NFxUWyl4SwEkfrOqFCHcmA",
        "score": 0.8261790276,
        "dist": 19759.074447,
        "info": "search:ta:356009046347867-IN",
        "matchConfidence": {
            "score": 0.8373739854193337
        },
        "poi": {
            "name": "Ather Grid Charging Station",
            "brands": [
                {
                    "name": "ASR"
                }
            ],
            "categorySet": [
                {
                    "id": 7309
                }
            ],
            "categories": [
                "electric vehicle station"
            ],
            "classifications": [
                {
                    "code": "ELECTRIC_VEHICLE_STATION",
                    "names": [
                        {
                            "nameLocale": "en-US",
                            "name": "electric vehicle station"
                        }
                    ]
                }
            ]
        },
        "address": {
            "streetName": "Railway Station Road",
            "municipalitySubdivision": "Thirumalai Rajapuram",
            "municipality": "Chennai",
            "countrySecondarySubdivision": "Chennai",
            "countrySubdivision": "Tamil Nadu",
            "countrySubdivisionName": "Tamil Nadu",
            "countrySubdivisionCode": "TN",
            "postalCode": "600054",
            "countryCode": "IN",
            "country": "India",
            "countryCodeISO3": "IND",
            "freeformAddress": "Railway Station Road, Thirumalai Rajapuram, Chennai 600054, Tamil Nadu",
            "localName": "Chennai"
        },
        "position": {
            "lat": 13.117675,
            "lon": 80.099877
        },
        "viewport": {
            "topLeftPoint": {
                "lat": 13.11857,
                "lon": 80.09895
            },
            "btmRightPoint": {
                "lat": 13.11678,
                "lon": 80.1008
            }
        },
        "entryPoints": [
            {
                "type": "main",
                "position": {
                    "lat": 13.11758,
                    "lon": 80.09988
                }
            }
        ],
        "chargingPark": {
            "connectors": [
                {
                    "connectorType": "StandardHouseholdCountrySpecific",
                    "ratedPowerKW": 1,
                    "voltageV": 110,
                    "currentA": 10,
                    "currentType": "AC1"
                },
                {
                    "connectorType": "IEC62196Type2Outlet",
                    "ratedPowerKW": 1,
                    "voltageV": 110,
                    "currentA": 10,
                    "currentType": "AC1"
                }
            ]
        }
    },
    {
        "type": "POI",
        "id": "yKnWlOlmZYHQcjFcf8Aoww",
        "score": 0.7850106359,
        "dist": 9048.216969,
        "info": "search:ta:356009046348404-IN",
        "matchConfidence": {
            "score": 0.773063159380262
        },
        "poi": {
            "name": "EESL Anna Nagar East Station",
            "brands": [
                {
                    "name": "Delta"
                }
            ],
            "categorySet": [
                {
                    "id": 7309
                }
            ],
            "categories": [
                "electric vehicle station"
            ],
            "classifications": [
                {
                    "code": "ELECTRIC_VEHICLE_STATION",
                    "names": [
                        {
                            "nameLocale": "en-US",
                            "name": "electric vehicle station"
                        }
                    ]
                }
            ]
        },
        "address": {
            "streetName": "Anna Nagar 2nd Avenue",
            "municipalitySubdivision": "Shenoy Nagar",
            "municipality": "Chennai",
            "countrySecondarySubdivision": "Chennai",
            "countrySubdivision": "Tamil Nadu",
            "countrySubdivisionName": "Tamil Nadu",
            "countrySubdivisionCode": "TN",
            "postalCode": "600102",
            "countryCode": "IN",
            "country": "India",
            "countryCodeISO3": "IND",
            "freeformAddress": "Anna Nagar 2nd Avenue, Shenoy Nagar, Chennai 600102, Tamil Nadu",
            "localName": "Chennai"
        },
        "position": {
            "lat": 13.084715,
            "lon": 80.219957
        },
        "viewport": {
            "topLeftPoint": {
                "lat": 13.08561,
                "lon": 80.21903
            },
            "btmRightPoint": {
                "lat": 13.08382,
                "lon": 80.22088
            }
        },
        "entryPoints": [
            {
                "type": "main",
                "position": {
                    "lat": 13.08462,
                    "lon": 80.21995
                }
            }
        ],
        "chargingPark": {
            "connectors": [
                {
                    "connectorType": "GBT20234Part3",
                    "ratedPowerKW": 25,
                    "voltageV": 400,
                    "currentA": 62,
                    "currentType": "DC"
                }
            ]
        }
    },
    {
        "type": "POI",
        "id": "ZBTWxTLL9K9NGGPe4JMIDQ",
        "score": 0.7850106359,
        "dist": 9094.112827,
        "info": "search:ta:356009046348025-IN",
        "matchConfidence": {
            "score": 0.7735021837934036
        },
        "poi": {
            "name": "EESL Anna Nagar East Station",
            "brands": [
                {
                    "name": "Exicom"
                }
            ],
            "categorySet": [
                {
                    "id": 7309
                }
            ],
            "categories": [
                "electric vehicle station"
            ],
            "classifications": [
                {
                    "code": "ELECTRIC_VEHICLE_STATION",
                    "names": [
                        {
                            "nameLocale": "en-US",
                            "name": "electric vehicle station"
                        }
                    ]
                }
            ]
        },
        "address": {
            "streetName": "Anna Nagar 2nd Avenue",
            "municipalitySubdivision": "Shenoy Nagar",
            "municipality": "Chennai",
            "countrySecondarySubdivision": "Chennai",
            "countrySubdivision": "Tamil Nadu",
            "countrySubdivisionName": "Tamil Nadu",
            "countrySubdivisionCode": "TN",
            "postalCode": "600102",
            "countryCode": "IN",
            "country": "India",
            "countryCodeISO3": "IND",
            "freeformAddress": "Anna Nagar 2nd Avenue, Shenoy Nagar, Chennai 600102, Tamil Nadu",
            "localName": "Chennai"
        },
        "position": {
            "lat": 13.084787,
            "lon": 80.218653
        },
        "viewport": {
            "topLeftPoint": {
                "lat": 13.08569,
                "lon": 80.21773
            },
            "btmRightPoint": {
                "lat": 13.08389,
                "lon": 80.21958
            }
        },
        "entryPoints": [
            {
                "type": "main",
                "position": {
                    "lat": 13.08467,
                    "lon": 80.21865
                }
            }
        ],
        "chargingPark": {
            "connectors": [
                {
                    "connectorType": "IEC62196Type3",
                    "ratedPowerKW": 3,
                    "voltageV": 230,
                    "currentA": 16,
                    "currentType": "AC1"
                }
            ]
        }
    },
    {
        "type": "POI",
        "id": "DbA3qPtFR2kFcboo5rSY1w",
        "score": 0.7791026235,
        "dist": 4749.832898,
        "info": "search:ta:356009046348519-IN",
        "matchConfidence": {
            "score": 0.75
        },
        "poi": {
            "name": "Tata Power EZ Charge",
            "brands": [
                {
                    "name": "TATA Power"
                }
            ],
            "categorySet": [
                {
                    "id": 7309
                }
            ],
            "categories": [
                "electric vehicle station"
            ],
            "classifications": [
                {
                    "code": "ELECTRIC_VEHICLE_STATION",
                    "names": [
                        {
                            "nameLocale": "en-US",
                            "name": "electric vehicle station"
                        }
                    ]
                }
            ]
        },
        "address": {
            "streetNumber": "100/48",
            "streetName": "Cathedral Road",
            "municipalitySubdivision": "Gopalapuram",
            "municipality": "Chennai",
            "countrySecondarySubdivision": "Chennai",
            "countrySubdivision": "Tamil Nadu",
            "countrySubdivisionName": "Tamil Nadu",
            "countrySubdivisionCode": "TN",
            "postalCode": "600086",
            "countryCode": "IN",
            "country": "India",
            "countryCodeISO3": "IND",
            "freeformAddress": "100/48, Cathedral Road, Gopalapuram, Chennai 600086, Tamil Nadu",
            "localName": "Chennai"
        },
        "position": {
            "lat": 13.046874,
            "lon": 80.25538
        },
        "viewport": {
            "topLeftPoint": {
                "lat": 13.04777,
                "lon": 80.25446
            },
            "btmRightPoint": {
                "lat": 13.04597,
                "lon": 80.2563
            }
        },
        "entryPoints": [
            {
                "type": "main",
                "position": {
                    "lat": 13.04663,
                    "lon": 80.25529
                }
            }
        ],
        "chargingPark": {
            "connectors": [
                {
                    "connectorType": "GBT20234Part3",
                    "ratedPowerKW": 25,
                    "voltageV": 400,
                    "currentA": 62,
                    "currentType": "DC"
                },
                {
                    "connectorType": "Chademo",
                    "ratedPowerKW": 25,
                    "voltageV": 400,
                    "currentA": 62,
                    "currentType": "DC"
                },
                {
                    "connectorType": "IEC62196Type2Outlet",
                    "ratedPowerKW": 22,
                    "voltageV": 400,
                    "currentA": 32,
                    "currentType": "AC3"
                }
            ]
        }
    },
    {
        "type": "POI",
        "id": "HFLMp8CvsxVMMCLVc9AOZA",
        "score": 0.7655180097,
        "dist": 6510.273466,
        "info": "search:ta:356009046347920-IN",
        "matchConfidence": {
            "score": 0.75
        },
        "poi": {
            "name": "Tata Power EZ Charge",
            "brands": [
                {
                    "name": "TATA Power"
                }
            ],
            "categorySet": [
                {
                    "id": 7309
                }
            ],
            "categories": [
                "electric vehicle station"
            ],
            "classifications": [
                {
                    "code": "ELECTRIC_VEHICLE_STATION",
                    "names": [
                        {
                            "nameLocale": "en-US",
                            "name": "electric vehicle station"
                        }
                    ]
                }
            ]
        },
        "address": {
            "streetName": "Jawaharlal Nehru Road",
            "municipalitySubdivision": "Vadapalani",
            "municipality": "Chennai",
            "municipalitySecondarySubdivision": "NGO Colony",
            "countrySecondarySubdivision": "Chennai",
            "countrySubdivision": "Tamil Nadu",
            "countrySubdivisionName": "Tamil Nadu",
            "countrySubdivisionCode": "TN",
            "postalCode": "600026",
            "countryCode": "IN",
            "country": "India",
            "countryCodeISO3": "IND",
            "freeformAddress": "Jawaharlal Nehru Road, NGO Colony, Vadapalani, Chennai 600026, Tamil Nadu",
            "localName": "Chennai"
        },
        "position": {
            "lat": 13.0565,
            "lon": 80.211168
        },
        "viewport": {
            "topLeftPoint": {
                "lat": 13.0574,
                "lon": 80.21024
            },
            "btmRightPoint": {
                "lat": 13.0556,
                "lon": 80.21209
            }
        },
        "entryPoints": [
            {
                "type": "main",
                "position": {
                    "lat": 13.0565,
                    "lon": 80.21142
                }
            }
        ],
        "chargingPark": {
            "connectors": [
                {
                    "connectorType": "IEC62196Type2CCS",
                    "ratedPowerKW": 25,
                    "voltageV": 400,
                    "currentA": 62,
                    "currentType": "DC"
                },
                {
                    "connectorType": "Chademo",
                    "ratedPowerKW": 25,
                    "voltageV": 400,
                    "currentA": 62,
                    "currentType": "DC"
                }
            ]
        }
    },
    {
        "type": "POI",
        "id": "LmMRlNan6xUPyujykHvb_Q",
        "score": 0.7440017462,
        "dist": 6308.16399,
        "info": "search:ta:356009046347906-IN",
        "matchConfidence": {
            "score": 0.75
        },
        "poi": {
            "name": "Hyundai Indian Oil Harmony Fast Charger",
            "brands": [
                {
                    "name": "Exicom"
                }
            ],
            "categorySet": [
                {
                    "id": 7309
                }
            ],
            "categories": [
                "electric vehicle station"
            ],
            "classifications": [
                {
                    "code": "ELECTRIC_VEHICLE_STATION",
                    "names": [
                        {
                            "nameLocale": "en-US",
                            "name": "electric vehicle station"
                        }
                    ]
                }
            ]
        },
        "address": {
            "streetName": "Grand Southern Trunk Road",
            "municipalitySubdivision": "Pazhavanthangal",
            "municipality": "Chennai",
            "municipalitySecondarySubdivision": "National Airport Authority Colony",
            "countrySecondarySubdivision": "Chennai",
            "countrySubdivision": "Tamil Nadu",
            "countrySubdivisionName": "Tamil Nadu",
            "countrySubdivisionCode": "TN",
            "postalCode": "600024",
            "countryCode": "IN",
            "country": "India",
            "countryCodeISO3": "IND",
            "freeformAddress": "Grand Southern Trunk Road, National Airport Authority Colony, Pazhavanthangal, Chennai 600024, Tamil Nadu",
            "localName": "Chennai"
        },
        "position": {
            "lat": 12.99347,
            "lon": 80.18521
        },
        "viewport": {
            "topLeftPoint": {
                "lat": 12.99437,
                "lon": 80.18429
            },
            "btmRightPoint": {
                "lat": 12.99257,
                "lon": 80.18613
            }
        },
        "entryPoints": [
            {
                "type": "main",
                "position": {
                    "lat": 12.9937,
                    "lon": 80.18508
                }
            }
        ],
        "chargingPark": {
            "connectors": [
                {
                    "connectorType": "IEC62196Type2CCS",
                    "ratedPowerKW": 50,
                    "voltageV": 400,
                    "currentA": 125,
                    "currentType": "DC"
                },
                {
                    "connectorType": "Chademo",
                    "ratedPowerKW": 50,
                    "voltageV": 400,
                    "currentA": 125,
                    "currentType": "DC"
                }
            ]
        }
    },
    {
        "type": "POI",
        "id": "UXyBSJ3ogUZHqrQVM15CAg",
        "score": 0.7289310098,
        "dist": 7552.860873,
        "info": "search:ta:356009046348033-IN",
        "matchConfidence": {
            "score": 0.75
        },
        "poi": {
            "name": "Exicom Power Solutions",
            "brands": [
                {
                    "name": "Exicom"
                }
            ],
            "categorySet": [
                {
                    "id": 7309
                }
            ],
            "categories": [
                "electric vehicle station"
            ],
            "classifications": [
                {
                    "code": "ELECTRIC_VEHICLE_STATION",
                    "names": [
                        {
                            "nameLocale": "en-US",
                            "name": "electric vehicle station"
                        }
                    ]
                }
            ]
        },
        "address": {
            "streetName": "Mount Poonamallee High Road",
            "municipalitySubdivision": "Ramapuram",
            "municipality": "Chennai",
            "municipalitySecondarySubdivision": "Park Dugar",
            "countrySecondarySubdivision": "Chennai",
            "countrySubdivision": "Tamil Nadu",
            "countrySubdivisionName": "Tamil Nadu",
            "countrySubdivisionCode": "TN",
            "postalCode": "600040",
            "countryCode": "IN",
            "country": "India",
            "countryCodeISO3": "IND",
            "freeformAddress": "Mount Poonamallee High Road, Park Dugar, Ramapuram, Chennai 600040, Tamil Nadu",
            "localName": "Chennai"
        },
        "position": {
            "lat": 13.02594,
            "lon": 80.175234
        },
        "viewport": {
            "topLeftPoint": {
                "lat": 13.02684,
                "lon": 80.17431
            },
            "btmRightPoint": {
                "lat": 13.02504,
                "lon": 80.17616
            }
        },
        "entryPoints": [
            {
                "type": "main",
                "position": {
                    "lat": 13.02586,
                    "lon": 80.17518
                }
            }
        ],
        "chargingPark": {
            "connectors": [
                {
                    "connectorType": "IEC62196Type3",
                    "ratedPowerKW": 3,
                    "voltageV": 230,
                    "currentA": 16,
                    "currentType": "AC1"
                },
                {
                    "connectorType": "GBT20234Part3",
                    "ratedPowerKW": 25,
                    "voltageV": 400,
                    "currentA": 62,
                    "currentType": "DC"
                }
            ]
        }
    },
    {
        "type": "POI",
        "id": "cDr9mYrRXXA5n3EMhr--5Q",
        "score": 0.7267432213,
        "dist": 8354.92643,
        "info": "search:ta:356009046347873-IN",
        "matchConfidence": {
            "score": 0.75
        },
        "poi": {
            "name": "EESL Chennai Egmore Metro",
            "brands": [
                {
                    "name": "Delta"
                }
            ],
            "categorySet": [
                {
                    "id": 7309
                }
            ],
            "categories": [
                "electric vehicle station"
            ],
            "classifications": [
                {
                    "code": "ELECTRIC_VEHICLE_STATION",
                    "names": [
                        {
                            "nameLocale": "en-US",
                            "name": "electric vehicle station"
                        }
                    ]
                }
            ]
        },
        "address": {
            "streetName": "Evr Road, Egmore",
            "municipalitySubdivision": "Egmore",
            "municipality": "Chennai",
            "countrySecondarySubdivision": "Chennai",
            "countrySubdivision": "Tamil Nadu",
            "countrySubdivisionName": "Tamil Nadu",
            "countrySubdivisionCode": "TN",
            "postalCode": "600008",
            "countryCode": "IN",
            "country": "India",
            "countryCodeISO3": "IND",
            "freeformAddress": "Evr Road, Egmore, Egmore, Chennai 600008, Tamil Nadu",
            "localName": "Chennai"
        },
        "position": {
            "lat": 13.079005,
            "lon": 80.261064
        },
        "viewport": {
            "topLeftPoint": {
                "lat": 13.0799,
                "lon": 80.26014
            },
            "btmRightPoint": {
                "lat": 13.07811,
                "lon": 80.26199
            }
        },
        "entryPoints": [
            {
                "type": "main",
                "position": {
                    "lat": 13.07907,
                    "lon": 80.26068
                }
            }
        ],
        "chargingPark": {
            "connectors": [
                {
                    "connectorType": "GBT20234Part3",
                    "ratedPowerKW": 25,
                    "voltageV": 400,
                    "currentA": 62,
                    "currentType": "DC"
                }
            ]
        }
    },
    {
        "type": "POI",
        "id": "9glNxKb5VnfHaTbDTANCUA",
        "score": 0.7267432213,
        "dist": 8387.567001,
        "info": "search:ta:356009046348297-IN",
        "matchConfidence": {
            "score": 0.75
        },
        "poi": {
            "name": "EESL Chennai Egmore Metro",
            "brands": [
                {
                    "name": "Exicom"
                }
            ],
            "categorySet": [
                {
                    "id": 7309
                }
            ],
            "categories": [
                "electric vehicle station"
            ],
            "classifications": [
                {
                    "code": "ELECTRIC_VEHICLE_STATION",
                    "names": [
                        {
                            "nameLocale": "en-US",
                            "name": "electric vehicle station"
                        }
                    ]
                }
            ]
        },
        "address": {
            "streetName": "Evr Road, Egmore",
            "municipalitySubdivision": "Egmore",
            "municipality": "Chennai",
            "countrySecondarySubdivision": "Chennai",
            "countrySubdivision": "Tamil Nadu",
            "countrySubdivisionName": "Tamil Nadu",
            "countrySubdivisionCode": "TN",
            "postalCode": "600008",
            "countryCode": "IN",
            "country": "India",
            "countryCodeISO3": "IND",
            "freeformAddress": "Evr Road, Egmore, Egmore, Chennai 600008, Tamil Nadu",
            "localName": "Chennai"
        },
        "position": {
            "lat": 13.079171,
            "lon": 80.261607
        },
        "viewport": {
            "topLeftPoint": {
                "lat": 13.08007,
                "lon": 80.26068
            },
            "btmRightPoint": {
                "lat": 13.07827,
                "lon": 80.26253
            }
        },
        "entryPoints": [
            {
                "type": "main",
                "position": {
                    "lat": 13.07916,
                    "lon": 80.26152
                }
            }
        ],
        "chargingPark": {
            "connectors": [
                {
                    "connectorType": "IEC62196Type2Outlet",
                    "ratedPowerKW": 7,
                    "voltageV": 230,
                    "currentA": 32,
                    "currentType": "AC1"
                },
                {
                    "connectorType": "IEC62196Type2CCS",
                    "ratedPowerKW": 50,
                    "voltageV": 400,
                    "currentA": 125,
                    "currentType": "DC"
                },
                {
                    "connectorType": "Chademo",
                    "ratedPowerKW": 50,
                    "voltageV": 400,
                    "currentA": 125,
                    "currentType": "DC"
                }
            ]
        }
    },
    {
        "type": "POI",
        "id": "LXrQS4F1H_nUd4yH_3zpPg",
        "score": 0.7222815156,
        "dist": 8483.988784,
        "info": "search:ta:356009046348051-IN",
        "matchConfidence": {
            "score": 0.75
        },
        "poi": {
            "name": "Tata Power EZ Charge",
            "brands": [
                {
                    "name": "TATA Power"
                }
            ],
            "categorySet": [
                {
                    "id": 7309
                }
            ],
            "categories": [
                "electric vehicle station"
            ],
            "classifications": [
                {
                    "code": "ELECTRIC_VEHICLE_STATION",
                    "names": [
                        {
                            "nameLocale": "en-US",
                            "name": "electric vehicle station"
                        }
                    ]
                }
            ]
        },
        "address": {
            "streetNumber": "49A",
            "streetName": "Old Mahabalipuram Road, Nehru Nagar",
            "municipalitySubdivision": "Okkiyam Thuraipakkam",
            "municipality": "Chennai",
            "countrySecondarySubdivision": "Chennai",
            "countrySubdivision": "Tamil Nadu",
            "countrySubdivisionName": "Tamil Nadu",
            "countrySubdivisionCode": "TN",
            "postalCode": "600097",
            "countryCode": "IN",
            "country": "India",
            "countryCodeISO3": "IND",
            "freeformAddress": "49A, Old Mahabalipuram Road, Nehru Nagar, Okkiyam Thuraipakkam, Chennai 600097, Tamil Nadu",
            "localName": "Chennai"
        },
        "position": {
            "lat": 12.930662,
            "lon": 80.231007
        },
        "viewport": {
            "topLeftPoint": {
                "lat": 12.93156,
                "lon": 80.23008
            },
            "btmRightPoint": {
                "lat": 12.92976,
                "lon": 80.23193
            }
        },
        "entryPoints": [
            {
                "type": "main",
                "position": {
                    "lat": 12.93083,
                    "lon": 80.23109
                }
            }
        ],
        "chargingPark": {
            "connectors": [
                {
                    "connectorType": "IEC62196Type2CCS",
                    "ratedPowerKW": 25,
                    "voltageV": 400,
                    "currentA": 62,
                    "currentType": "DC"
                },
                {
                    "connectorType": "Chademo",
                    "ratedPowerKW": 25,
                    "voltageV": 400,
                    "currentA": 62,
                    "currentType": "DC"
                },
                {
                    "connectorType": "StandardHouseholdCountrySpecific",
                    "ratedPowerKW": 3,
                    "voltageV": 230,
                    "currentA": 16,
                    "currentType": "AC1"
                }
            ]
        }
    },
    {
        "type": "POI",
        "id": "7V_16oWYaoop9Kud-qBcMg",
        "score": 0.7071724534,
        "dist": 8954.173115,
        "info": "search:ta:356009046348408-IN",
        "matchConfidence": {
            "score": 0.75
        },
        "poi": {
            "name": "Tata Power EZ Charge",
            "brands": [
                {
                    "name": "TATA Power"
                }
            ],
            "categorySet": [
                {
                    "id": 7309
                }
            ],
            "categories": [
                "electric vehicle station"
            ],
            "classifications": [
                {
                    "code": "ELECTRIC_VEHICLE_STATION",
                    "names": [
                        {
                            "nameLocale": "en-US",
                            "name": "electric vehicle station"
                        }
                    ]
                }
            ]
        },
        "address": {
            "streetNumber": "1072",
            "streetName": "EVR Periyar Salai",
            "municipalitySubdivision": "Arumbakkam",
            "municipality": "Chennai",
            "municipalitySecondarySubdivision": "Janakiraman Colony",
            "countrySecondarySubdivision": "Chennai",
            "countrySubdivision": "Tamil Nadu",
            "countrySubdivisionName": "Tamil Nadu",
            "countrySubdivisionCode": "TN",
            "postalCode": "600107",
            "countryCode": "IN",
            "country": "India",
            "countryCodeISO3": "IND",
            "freeformAddress": "1072, EVR Periyar Salai, Janakiraman Colony, Arumbakkam, Chennai 600107, Tamil Nadu",
            "localName": "Chennai"
        },
        "position": {
            "lat": 13.076675,
            "lon": 80.201931
        },
        "viewport": {
            "topLeftPoint": {
                "lat": 13.07757,
                "lon": 80.20101
            },
            "btmRightPoint": {
                "lat": 13.07578,
                "lon": 80.20285
            }
        },
        "entryPoints": [
            {
                "type": "main",
                "position": {
                    "lat": 13.0763,
                    "lon": 80.20189
                }
            }
        ],
        "chargingPark": {
            "connectors": [
                {
                    "connectorType": "Chademo",
                    "ratedPowerKW": 25,
                    "voltageV": 400,
                    "currentA": 62,
                    "currentType": "DC"
                },
                {
                    "connectorType": "IEC62196Type2Outlet",
                    "ratedPowerKW": 22,
                    "voltageV": 400,
                    "currentA": 32,
                    "currentType": "AC3"
                }
            ]
        }
    },
    {
        "type": "POI",
        "id": "h7Un-3v6nzepAE4khGZpSQ",
        "score": 0.7071724534,
        "dist": 9069.762605,
        "info": "search:ta:356009046347801-IN",
        "matchConfidence": {
            "score": 0.75
        },
        "poi": {
            "name": "Exicom Power Solutions",
            "brands": [
                {
                    "name": "Exicom"
                }
            ],
            "categorySet": [
                {
                    "id": 7309
                }
            ],
            "categories": [
                "electric vehicle station"
            ],
            "classifications": [
                {
                    "code": "ELECTRIC_VEHICLE_STATION",
                    "names": [
                        {
                            "nameLocale": "en-US",
                            "name": "electric vehicle station"
                        }
                    ]
                }
            ]
        },
        "address": {
            "streetName": "Koyambedu Market Road, Koyambedu",
            "municipalitySubdivision": "Koyambedu",
            "municipality": "Chennai",
            "countrySecondarySubdivision": "Chennai",
            "countrySubdivision": "Tamil Nadu",
            "countrySubdivisionName": "Tamil Nadu",
            "countrySubdivisionCode": "TN",
            "postalCode": "600107",
            "countryCode": "IN",
            "country": "India",
            "countryCodeISO3": "IND",
            "freeformAddress": "Koyambedu Market Road, Koyambedu, Koyambedu, Chennai 600107, Tamil Nadu",
            "localName": "Chennai"
        },
        "position": {
            "lat": 13.074056,
            "lon": 80.195466
        },
        "viewport": {
            "topLeftPoint": {
                "lat": 13.07496,
                "lon": 80.19454
            },
            "btmRightPoint": {
                "lat": 13.07316,
                "lon": 80.19639
            }
        },
        "entryPoints": [
            {
                "type": "main",
                "position": {
                    "lat": 13.07442,
                    "lon": 80.1954
                }
            }
        ],
        "chargingPark": {
            "connectors": [
                {
                    "connectorType": "IEC62196Type3",
                    "ratedPowerKW": 3,
                    "voltageV": 230,
                    "currentA": 16,
                    "currentType": "AC1"
                }
            ]
        }
    },
    {
        "type": "POI",
        "id": "A0hcMjP3ZEGXekjpKqDOrw",
        "score": 0.7071724534,
        "dist": 9099.693829,
        "info": "search:ta:356009046348272-IN",
        "matchConfidence": {
            "score": 0.75
        },
        "poi": {
            "name": "EESL Koyambedu Metro",
            "brands": [
                {
                    "name": "Delta"
                }
            ],
            "categorySet": [
                {
                    "id": 7309
                }
            ],
            "categories": [
                "electric vehicle station"
            ],
            "classifications": [
                {
                    "code": "ELECTRIC_VEHICLE_STATION",
                    "names": [
                        {
                            "nameLocale": "en-US",
                            "name": "electric vehicle station"
                        }
                    ]
                }
            ]
        },
        "address": {
            "streetName": "Koyambedu Market Road, Koyambedu",
            "municipalitySubdivision": "Koyambedu",
            "municipality": "Chennai",
            "countrySecondarySubdivision": "Chennai",
            "countrySubdivision": "Tamil Nadu",
            "countrySubdivisionName": "Tamil Nadu",
            "countrySubdivisionCode": "TN",
            "postalCode": "600107",
            "countryCode": "IN",
            "country": "India",
            "countryCodeISO3": "IND",
            "freeformAddress": "Koyambedu Market Road, Koyambedu, Koyambedu, Chennai 600107, Tamil Nadu",
            "localName": "Chennai"
        },
        "position": {
            "lat": 13.074228,
            "lon": 80.195233
        },
        "viewport": {
            "topLeftPoint": {
                "lat": 13.07513,
                "lon": 80.19431
            },
            "btmRightPoint": {
                "lat": 13.07333,
                "lon": 80.19616
            }
        },
        "entryPoints": [
            {
                "type": "main",
                "position": {
                    "lat": 13.0744,
                    "lon": 80.1952
                }
            }
        ],
        "chargingPark": {
            "connectors": [
                {
                    "connectorType": "GBT20234Part3",
                    "ratedPowerKW": 25,
                    "voltageV": 400,
                    "currentA": 62,
                    "currentType": "DC"
                }
            ]
        }
    },
    {
        "type": "POI",
        "id": "MyZ6tv07gS4H85JTvj4-Vw",
        "score": 0.7071724534,
        "dist": 9739.447467,
        "info": "search:ta:356009046348234-IN",
        "matchConfidence": {
            "score": 0.75
        },
        "poi": {
            "name": "EESL Thirumangalam Metro",
            "brands": [
                {
                    "name": "Delta"
                }
            ],
            "categorySet": [
                {
                    "id": 7309
                }
            ],
            "categories": [
                "electric vehicle station"
            ],
            "classifications": [
                {
                    "code": "ELECTRIC_VEHICLE_STATION",
                    "names": [
                        {
                            "nameLocale": "en-US",
                            "name": "electric vehicle station"
                        }
                    ]
                }
            ]
        },
        "address": {
            "streetName": "Anna Nagar 2nd Avenue",
            "municipalitySubdivision": "Arumbakkam",
            "municipality": "Chennai",
            "municipalitySecondarySubdivision": "Block L",
            "countrySecondarySubdivision": "Chennai",
            "countrySubdivision": "Tamil Nadu",
            "countrySubdivisionName": "Tamil Nadu",
            "countrySubdivisionCode": "TN",
            "postalCode": "600040",
            "countryCode": "IN",
            "country": "India",
            "countryCodeISO3": "IND",
            "freeformAddress": "Anna Nagar 2nd Avenue, Block L, Arumbakkam, Chennai 600040, Tamil Nadu",
            "localName": "Chennai"
        },
        "position": {
            "lat": 13.084691,
            "lon": 80.202019
        },
        "viewport": {
            "topLeftPoint": {
                "lat": 13.08559,
                "lon": 80.2011
            },
            "btmRightPoint": {
                "lat": 13.08379,
                "lon": 80.20294
            }
        },
        "entryPoints": [
            {
                "type": "main",
                "position": {
                    "lat": 13.08522,
                    "lon": 80.20204
                }
            }
        ],
        "chargingPark": {
            "connectors": [
                {
                    "connectorType": "GBT20234Part3",
                    "ratedPowerKW": 25,
                    "voltageV": 400,
                    "currentA": 62,
                    "currentType": "DC"
                }
            ]
        }
    },
    {
        "type": "POI",
        "id": "ggT7to0IkQ5eBHyMDx9wHw",
        "score": 0.7071724534,
        "dist": 9742.4857,
        "info": "search:ta:356009046348164-IN",
        "matchConfidence": {
            "score": 0.75
        },
        "poi": {
            "name": "EESL Thirumangalam Metro",
            "brands": [
                {
                    "name": "Exicom"
                }
            ],
            "categorySet": [
                {
                    "id": 7309
                }
            ],
            "categories": [
                "electric vehicle station"
            ],
            "classifications": [
                {
                    "code": "ELECTRIC_VEHICLE_STATION",
                    "names": [
                        {
                            "nameLocale": "en-US",
                            "name": "electric vehicle station"
                        }
                    ]
                }
            ]
        },
        "address": {
            "streetName": "Anna Nagar 2nd Avenue",
            "municipalitySubdivision": "Arumbakkam",
            "municipality": "Chennai",
            "municipalitySecondarySubdivision": "Block L",
            "countrySecondarySubdivision": "Chennai",
            "countrySubdivision": "Tamil Nadu",
            "countrySubdivisionName": "Tamil Nadu",
            "countrySubdivisionCode": "TN",
            "postalCode": "600040",
            "countryCode": "IN",
            "country": "India",
            "countryCodeISO3": "IND",
            "freeformAddress": "Anna Nagar 2nd Avenue, Block L, Arumbakkam, Chennai 600040, Tamil Nadu",
            "localName": "Chennai"
        },
        "position": {
            "lat": 13.084702,
            "lon": 80.201979
        },
        "viewport": {
            "topLeftPoint": {
                "lat": 13.0856,
                "lon": 80.20106
            },
            "btmRightPoint": {
                "lat": 13.0838,
                "lon": 80.2029
            }
        },
        "entryPoints": [
            {
                "type": "main",
                "position": {
                    "lat": 13.08522,
                    "lon": 80.202
                }
            }
        ],
        "chargingPark": {
            "connectors": [
                {
                    "connectorType": "IEC62196Type2Outlet",
                    "ratedPowerKW": 7,
                    "voltageV": 230,
                    "currentA": 32,
                    "currentType": "AC1"
                },
                {
                    "connectorType": "IEC62196Type2CCS",
                    "ratedPowerKW": 50,
                    "voltageV": 400,
                    "currentA": 125,
                    "currentType": "DC"
                },
                {
                    "connectorType": "Chademo",
                    "ratedPowerKW": 50,
                    "voltageV": 400,
                    "currentA": 125,
                    "currentType": "DC"
                }
            ]
        }
    }
]

export default Explore;
