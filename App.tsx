import React, { useEffect, useReducer, useRef, useState } from 'react'
import {
  Pressable,
  StatusBar,
  StyleSheet,
  View,
  Text,
  LayoutChangeEvent,
} from 'react-native'
// navigation
import { NavigationContainer } from '@react-navigation/native'
import { BottomTabBarProps, BottomTabNavigationOptions, createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
// svg
import Svg, { Path } from 'react-native-svg'
// reanimated
import Animated, { useAnimatedStyle, withTiming, useDerivedValue } from 'react-native-reanimated'
// lottie
import Lottie from 'lottie-react-native'
import Explore from './src/screen/explore'
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { initializeApp } from "firebase/app";
import firebaseConfig from './firebaseConfig';
import LoginScreen from './src/screen/LoginScreen';
import { createStackNavigator } from "@react-navigation/stack"
import StationRoute from './src/screen/stationRoute'
import Profile from './src/screen/profile'
import MapScreen from './src/screen/MapScreen'
import RouteScreen from './src/screen/temp';
import Home from './src/screen/Home';
import SignupScreen from './src/screen/SignupScreen'
import EvDetails from './src/screen/EvDetails'
import { Entypo } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';

const Stack = createStackNavigator();

// ------------------------------------------------------------------

const Tab = createBottomTabNavigator()

const AnimatedSvg = Animated.createAnimatedComponent(Svg)

// ------------------------------------------------------------------

function AuthStack() {
  const app = initializeApp(firebaseConfig);

  return (
    <Stack.Navigator
      initialRouteName='LoginScreen'
    >


      <Stack.Screen
        name="LoginScreen"
        component={LoginScreen}
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="SignupScreen"
        component={SignupScreen}
        options={{
          headerShown: false
        }}
      />
    </Stack.Navigator>
  );
}

function MainApp() {


  return (
    <Tab.Navigator
      tabBar={(props) => <AnimatedTabBar {...props} />}
    >
      <Tab.Screen
        name="Home"
        options={{
          // @ts-ignore
          tabBarIcon: ({ ref }) => <Lottie ref={ref} loop={false} source={require('./src/assets/lottie/home.icon.json')} style={styles.icon} />,
          headerShown: false
        }}
        component={DashboardNavigator}
      />
      <Tab.Screen
        name="Upload"
        options={{
          // @ts-ignore
          tabBarIcon: ({ ref }) => <Entypo name="direction" size={30} color="black" />,
          headerShown: false
        }}
        component={ExploreNavigator}
      />
      <Tab.Screen
        name="Chat"
        options={{
          // @ts-ignore
          tabBarIcon: ({ ref }) => <FontAwesome5 name="map-pin" size={24} color="black" />,
          headerShown: false
        }}
        component={JourneyNavigator}
      />
      <Tab.Screen
        name="Settings"
        options={{
          // @ts-ignore
          tabBarIcon: ({ ref }) => <Lottie ref={ref} loop={false} source={require('./src/assets/lottie/settings.icon.json')} style={styles.icon} />,
          headerShown: false
        }}
        component={Profile}
      />
    </Tab.Navigator>
  );
}

function DashboardNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="dashboard"
        component={Home}
        options={{ headerShown: false }}
      />

    </Stack.Navigator>
  );
}

function ExploreNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="explore"
        component={Explore}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EvDetails"
        component={EvDetails}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="stationRoute"
        component={StationRoute}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function JourneyNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Journey"
        component={RouteScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}



const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const app = initializeApp(firebaseConfig);

  const auth = getAuth(app);
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/auth.user
      const uid = user.uid;
      setIsLoggedIn(true)
      // ...
    } else {
      // User is signed out
      // ...
      setIsLoggedIn(false)
    }
  });

  return (
    <>
      <StatusBar barStyle="light-content" />
      <NavigationContainer>
        {isLoggedIn ? <MainApp /> : <AuthStack />}
      </NavigationContainer>
    </>
  )
}

// ------------------------------------------------------------------

const PlaceholderScreen = () => {
  return (
    <View style={{ flex: 1, backgroundColor: '#604AE6' }} />
  )
}

// ------------------------------------------------------------------

const AnimatedTabBar = ({ state: { index: activeIndex, routes }, navigation, descriptors }: BottomTabBarProps) => {
  const { bottom } = useSafeAreaInsets()

  // get information about the components position on the screen -----

  const reducer = (state: any, action: { x: number, index: number }) => {
    // Add the new value to the state
    return [...state, { x: action.x, index: action.index }]
  }

  const [layout, dispatch] = useReducer(reducer, [])

  const handleLayout = (event: LayoutChangeEvent, index: number) => {
    dispatch({ x: event.nativeEvent.layout.x, index })
  }

  // animations ------------------------------------------------------

  const xOffset = useDerivedValue(() => {
    if (layout.length !== routes.length) return 0;
    return [...layout].find(({ index }) => index === activeIndex)!.x - 25
  }, [activeIndex, layout])

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: withTiming(xOffset.value, { duration: 250 }) }],
    }
  })

  return (
    <View style={[styles.tabBar, { paddingBottom: bottom }]}>
      <AnimatedSvg
        width={110}
        height={60}
        viewBox="0 0 110 60"
        style={[styles.activeBackground, animatedStyles]}
      >
        <Path
          fill="#604AE6"
          d="M20 0H0c11.046 0 20 8.953 20 20v5c0 19.33 15.67 35 35 35s35-15.67 35-35v-5c0-11.045 8.954-20 20-20H20z"
        />
      </AnimatedSvg>

      <View style={styles.tabBarContainer}>
        {routes.map((route, index) => {
          const active = index === activeIndex
          const { options } = descriptors[route.key]

          return (
            <TabBarComponent
              key={route.key}
              active={active}
              options={options}
              onLayout={(e) => handleLayout(e, index)}
              onPress={() => navigation.navigate(route.name)}
            />
          )
        })}
      </View>
    </View>
  )
}

// ------------------------------------------------------------------

type TabBarComponentProps = {
  active?: boolean
  options: BottomTabNavigationOptions
  onLayout: (e: LayoutChangeEvent) => void
  onPress: () => void
}

const TabBarComponent = ({ active, options, onLayout, onPress }: TabBarComponentProps) => {
  const ref = useRef(null)

  useEffect(() => {
    if (active && ref?.current) {
      ref.current.play()
    }
  }, [active])

  // animations ------------------------------------------------------

  const animatedComponentCircleStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withTiming(active ? 1 : 0, { duration: 250 })
        }
      ]
    }
  })

  const animatedIconContainerStyles = useAnimatedStyle(() => {
    return {
      opacity: withTiming(active ? 1 : 0.5, { duration: 250 })
    }
  })

  return (
    <Pressable onPress={onPress} onLayout={onLayout} style={styles.component}>
      <Animated.View
        style={[styles.componentCircle, animatedComponentCircleStyles]}
      />
      <Animated.View style={[styles.iconContainer, animatedIconContainerStyles]}>
        {/* @ts-ignore */}
        {options.tabBarIcon ? options.tabBarIcon({ ref }) : <Text>?</Text>}
      </Animated.View>
    </Pressable>
  )
}

// ------------------------------------------------------------------

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'white',
  },
  activeBackground: {
    position: 'absolute',
  },
  tabBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  component: {
    height: 60,
    width: 60,
    marginTop: -5,
  },
  componentCircle: {
    flex: 1,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  iconContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center'
  },
  icon: {
    height: 36,
    width: 36,
  }
})

export default App;