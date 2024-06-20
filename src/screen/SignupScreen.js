import { Image, StyleSheet, Text, View, Dimensions, TextInput, ImageBackground, TouchableOpacity } from "react-native";
import React from "react";
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Fontisto from 'react-native-vector-icons/Fontisto';
import { LinearGradient } from 'expo-linear-gradient';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import { useNavigation } from "@react-navigation/native";
import { Input, Icon } from '@rneui/themed';
import AwesomeAlert from 'react-native-awesome-alerts';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, addDoc, setDoc, doc } from "firebase/firestore";
import { ScrollView } from 'react-native-gesture-handler'

const SignupScreen = () => {
  const auth = getAuth();
  const db = getFirestore();
  const navigation = useNavigation();
  const handleRegister = () => {
    navigation.navigate("LoginScreen");

  }
  const [emailInput, onChangeEmailInput] = React.useState('tr@tr.com');
  const [passwordInput, onChangePasswordInput] = React.useState('123456');
  const [cityInput, onChangeCityInput] = React.useState('tr@tr.com');
  const [nameInput, onChangeNameInput] = React.useState('123456');
  const [showAlert, setShowAlert] = React.useState(false)
  const [alertTitle, setAlertTitle] = React.useState('')
  const [alertMessage, setAlertMessage] = React.useState('')

  userSignUP = (email, password, confirmPassword) => {
    createUserWithEmailAndPassword(auth, emailInput, passwordInput)
      .then((userCredential) => {
        // Signed up 
        const user = userCredential.user;
        const emailId = user.email
        setDoc(doc(db, "user", emailId), {
          email: emailId,
          city: cityInput,
          name: nameInput,
        });
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        setShowAlert(true)
        setAlertTitle('Sign Error');
        setAlertMessage(errorMessage)
        console.log(errorCode);
        // ..
      });
  }


  return (
    <ScrollView style={styles.container}>
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
      <View>
        <Text style={styles.createAccountText}>Create Account</Text>
      </View>
      <View style={styles.inputContainer}>
        <Input style={styles.textInput}
          leftIcon={{ type: 'font-awesome-5', name: 'user' }}
          placeholder="Name"
          onChangeText={text => onChangeNameInput(text)} />
      </View>
      <View style={styles.inputContainer}>
        <Input style={styles.textInput}
          leftIcon={{ type: 'font-awesome-5', name: 'city' }}
          placeholder="City"
          onChangeText={text => onChangeCityInput(text)} />
      </View>
      <View style={styles.inputContainer}>
        <Input style={styles.textInput}
          leftIcon={{ type: 'font-awesome-5', name: 'envelope' }}
          placeholder="EmailID"
          onChangeText={text => onChangeEmailInput(text)} />
      </View>
      <View style={styles.inputContainer}>
        <Input style={styles.textInput}
          leftIcon={{ type: 'font-awesome-5', name: 'lock' }}
          placeholder="password"
          onChangeText={text => onChangePasswordInput(text)} />
      </View>
      <TouchableOpacity style={styles.signInButtonContainer}
        onPress={() => userSignUP()}>
        <Text style={styles.signIn}>Sign Up</Text>
        <LinearGradient colors={['#F97794', '#623AA2']} style={styles.linearGradient}>
          <AntDesign name={"arrowright"} size={24} color={"white"} style={styles.inputicon} />
        </LinearGradient>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleRegister}>
        <Text style={styles.footerText}> Have Account? Login</Text>
      </TouchableOpacity>

      <View style={styles.leftVectorContainer}>
        <ImageBackground source={require("../assets/bottom.png")} style={styles.leftVectorImage} />
      </View>
    </ScrollView>
  );
};

export default SignupScreen;

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
  createAccountText: {
    textAlign: "center",
    fontSize: 30,
    color: "#262626",
    marginBottom: 30,
    fontWeight: "bold",
  },
  inputContainer: {
    backgroundColor: "#FFFFFF",
    FlexDirection: "row",
    borderRadius: 20,
    merginHorizontal: 40,
    elevation: 10,
    marginVertical: 20,
    alignItems: "center",
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
    marginTop: 40,
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
    marginTop: 80
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
  footerContainer: {
    marginTop: 25,
  },
  socialMediaContainer: {
    dispaly: "flex",
    flexDirection: "row",
    justifyContent: "center",
  },
  socialIcon: {
    backgroundColor: "white",
    elevation: 10,
    margin: 10,
    padding: 10,
    borderRadius: 50,
  }
});

