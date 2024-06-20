import { Image, StyleSheet, Text, View, TextInput, ImageBackground, TouchableOpacity } from "react-native";
import React from "react";
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import AwesomeAlert from 'react-native-awesome-alerts';
import Fontisto from 'react-native-vector-icons/Fontisto';
import { LinearGradient } from 'expo-linear-gradient';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation } from "@react-navigation/native";
import { Input, Icon } from '@rneui/themed';



const LoginScreen = () => {

  const [emailInput, onChangeEmailInput] = React.useState('');
  const [passwordInput, onChangePasswordInput] = React.useState('');
  const auth = getAuth();
  const [showAlert, setShowAlert] = React.useState(false)
  const [alertTitle, setAlertTitle] = React.useState('')
  const [alertMessage, setAlertMessage] = React.useState('')
  const navigation = useNavigation();
  const handleRegister = () => {
    navigation.navigate("SignupScreen");

  }



  return (
    <View style={styles.container}>
      <AwesomeAlert
        show={showAlert}
        showProgress={false}
        title={alertTitle}
        message={alertMessage}
        closeOnTouchOutside={false}
        closeOnHardwareBackPress={true}
        showCancelButton={false}
        showConfirmButton={true}
        confirmText="Dismiss"
        confirmButtonColor="#DD6B55"
        onConfirmPressed={() => {
          setShowAlert(false)
        }}
      />

      <View style={styles.topImageContainer}>
        <Image
          source={require("../assets/topVector.png")}
          style={styles.topImage}
        />
      </View>
      <View style={styles.helloContainer}>
        <Text style={styles.helloText}>Hello</Text>
      </View>
      <View>
        <Text style={styles.signInText}>Sign in to your account</Text>
      </View>
      <View style={styles.inputContainer}>
        <Input style={styles.textInput}
          onChangeText={text => onChangeEmailInput(text)}
          leftIcon={{ type: 'font-awesome-5', name: 'user' }}
          placeholder="User ID" />
      </View>
      <View style={styles.inputContainer}>
        <Input style={styles.textInput}
          onChangeText={text => onChangePasswordInput(text)}
          leftIcon={{ type: 'font-awesome-5', name: 'lock' }}
          placeholder="Password" />
      </View>
      <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
      <TouchableOpacity style={styles.signInButtonContainer}
        onPress={() => {
          signInWithEmailAndPassword(auth, emailInput, passwordInput)
            .then((userCredential) => {
              // Signed in 
              const user = userCredential.user;
              // ...
            })
            .catch((error) => {
              const errorCode = error.code;
              const errorMessage = error.message;
              setShowAlert(true)
              setAlertTitle('Login Error');
              setAlertMessage(errorMessage)
              console.log(errorMessage);
            });

        }}>
        <Text style={styles.signIn}>Sign in</Text>
        <LinearGradient colors={['#F97794', '#623AA2']} style={styles.linearGradient}>
          <AntDesign name={"arrowright"} size={24} color={"white"} style={styles.inputicon} />
        </LinearGradient>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleRegister}>
        <Text style={styles.footerText}>Don't have an account? <Text style={{ textDecorationLine: "underline" }}>Create</Text>
        </Text>
      </TouchableOpacity>
      <View style={styles.leftVectorContainer}>
        <ImageBackground source={require("../assets/bottom.png")} style={styles.leftVectorImage} />
      </View>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F5F5F5",
    flex: 1,
    position: "relative",
  },
  topImageContainer: {},
  topImage: {
    width: "100%",
    height: 130,
  },
  helloContainer: {},
  helloText: {
    textAlign: "center",
    fontSize: 70,
    fontWeight: "500",
    color: "#262626",
  },
  signInText: {
    textAlign: "center",
    fontSize: 18,
    color: "#262626",
    marginBottom: 30,
  },
  inputContainer: {
    backgroundColor: "#FFFFFF",
    FlexDirection: "row",
    borderRadius: 20,
    merginHorizontal: 40,
    elevation: 10,
    marginVertical: 20,

    height: 50,
    width: "80%",
    alignSelf: "center",
  },
  inputicon: {
    marginLeft: 15,
    marginRight: 5,

  },
  textInput: {
    flex: 1,
  },
  forgotPasswordText: {
    color: "#BEBEBE",
    textAlign: "right",
    width: "90%",
    fontSize: 15,
  },
  signInButtonContainer: {
    flexDiretion: "row",
    marginTop: 120,
    width: "90%",
    justifyContent: "flex-end",
    alignSelf: 'center',
    flexDirection: 'row',
  },
  signIn: {
    color: "#262626",
    fontSize: 25,
    fontWeight: "bold",
  },
  linearGradient: {
    height: 34,
    width: 56,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
  },
  footerText: {
    color: "#262626",
    textAlign: "center",
    fontSize: 16,
    marginTop: 120,
  },
  leftVectorContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
  },
  leftVectorImage: {
    height: 350,
    width: 150,
  },
});