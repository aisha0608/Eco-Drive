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
import MapView, { Marker, Polyline } from 'react-native-maps';
import { ScrollView } from 'react-native-gesture-handler';

import Icon from '@expo/vector-icons/Ionicons';
import Cards from '../components/Cards';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import Stars from 'react-native-stars';

const YOUR_TOMTOM_API_KEY = 'T166rLZODnNrHuvhX9CswHERqmjePmgH';



const EvDetails = ({ route, navigation }) => {

    const bottomSheetModalRef = useRef(null);
    const snapPoints = ["50%", "75% ", "90%"];
    const [latitude, setLatitude] = useState(13.006212569689849);
    const [longitude, setLongitude] = useState(80.24194504745343);
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [viewCode, setViewCode] = useState(0);
    const [mapRoute, setRoute] = useState([]);
    const [stations, setStations] = useState([])

    const { station } = route.params;

    const onPressMapIcon = async (startLat, startLon, endLat, endLon) => {
        const startCoord = { latitude: startLat, longitude: startLon };
        const endCoord = { latitude: endLat, longitude: endLon };
        const routeData = await fetchRoute(startCoord, endCoord);

        if (routeData) {
            setRoute(routeData); 
            console.log(viewCode);
            navigation.navigate('stationRoute', { routeData: routeData,codd:{startCoord:startCoord,endCoord:endCoord} })
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
            console.log(satation);
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



    return (
        <View style={styles.container}>
            <ImageBackground
                source={require("../images/unnamed.jpg")}
                style={styles.map}
            >
                <Text style={[styles.textDash, { marginTop: "15%" }]}>{station.poi.name}</Text>
            </ImageBackground>

            <View style={[styles.box, { alignItems: 'flex-start',backgroundColor:'#3D7B45' }]} >
                <View style={[styles.box, { backgroundColor: "red", alignSelf: "left", width: "85%" }]}>
                    <View style={styles.icon}>
                        <Ionicons style={styles.icon1} name="fast-food-outline" size={24} color="black" />
                        <View style={styles.text}>
                            <Text style={styles.head}>PLACES TO CHILL:</Text>
                            <Text style={styles.head1} >KFC</Text>
                        </View>

                        <TouchableOpacity style={[styles.box, { backgroundColor: "black", alignSelf: "left", width: "50%" }]}
                            onPress={() => {
                                onPressMapIcon(latitude, longitude, station.position.lat, station.position.lon)
                                console.log(latitude, longitude, station.position.lat, station.position.lon);
                            }}>
                            <MapView style={{ height: '100%', width: '100%', borderRadius: 30 }}
                                initialRegion={{
                                    latitude: station.position.lat,
                                    longitude: station.position.lon,
                                    latitudeDelta: 0.0922,
                                    longitudeDelta: 0.0421,

                                }}

                            >
                                <Marker
                                    coordinate={{
                                        latitude: station.position.lat,
                                        longitude: station.position.lon,
                                    }}
                                />
                            </MapView>
                            <TouchableOpacity style={{
                                marginTop: -34,
                                alignSelf: 'flex-start'
                            }}
                                onPress={() => {
                                    onPressMapIcon(latitude, longitude, station.position.lat, station.position.lon)
                                    console.log(latitude, longitude, station.position.lat, station.position.lon);
                                }}>
                                <FontAwesome5 name="directions" size={34} color="black" /></TouchableOpacity>
                        </TouchableOpacity>
                    </View>
                    
                </View>
                <Text style={{position:'absolute',bottom:0,color:'#fff'}}>
                    ECO
                </Text>
            </View>

            <ScrollView
                style={{ marginTop: 50 }}
                showsHorizontalScrollIndicator={false}
                horizontal
            >
                <Cards
                    
                    icon="power-plug"
                    title="TOTAL NO. OF PORTS"
                    bg="red"
                    number="4"
                    type="entypo"
                />
                <Cards
                    icon="event-available"
                    title="AVAILABLE"
                    bg="#FFF"
                    number="2"
                    type="material"
                />
                <Cards
                    icon="clock"
                    title="OCCUPIED"
                    bg="#FFF"
                    number="2"
                    type="font-awesome-5"
                />

                <Cards
                    icon="times-circle"
                    title="NON FUNCTIONAL"
                    bg="#FFF"
                    number="0"
                    type="font-awesome-5"
                />
            </ScrollView>
            <View style={{ alignItems: 'center' }}>
                <Stars
                    default={2.5}
                    count={5}
                    half={true}
                    starSize={30} /* Adjust the size as needed */
                    fullStar={<Icon name={'star'} style={[styles.myStarStyle, { fontSize: 30 }]} />}
                    emptyStar={<Icon name={'star-outline'} style={[styles.myStarStyle, styles.myEmptyStarStyle, { fontSize: 30 }]} />}
                    halfStar={<Icon name={'star-half'} style={[styles.myStarStyle, { fontSize: 30 }]} />}
                />
            </View>
            <View style={{ marginBottom: 25 }}>
            <TouchableOpacity style={styles.learnMoreButton} >
                    <Text style={styles.learnMoreButtonText}>Waiting Time : 10 min</Text>
                </TouchableOpacity>
                {/* TouchableOpacity button */}
                <TouchableOpacity
                    onPress={() => {
                        // Handle onPress event here
                        console.log("Review button pressed");
                    }}
                    style={styles.buttonContainer}
                >
                    <Text style={styles.buttonText}>REVIEW</Text>
                </TouchableOpacity>


            </View>
        </View>
    )




}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1c2732",
        alignItems: 'center'
    },
    learnMoreButton: {
        backgroundColor: '#3D7B45',
        padding: 10,
        borderRadius: 10,
        marginBottom:15
    },
    learnMoreButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
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


export default EvDetails;