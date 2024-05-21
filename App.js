// web 814496078084-mcgsttnj25f7uknuhvul9f8rofojf8ft.apps.googleusercontent.com
// ios 814496078084-ofi3a6bu9enonermb3ph7hv9sodvcb67.apps.googleusercontent.com
// android 814496078084-cpjm6v2ufqth03hqam9d3g0m3ta40oeb.apps.googleusercontent.com
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, FlatList, Linking, Switch, StyleSheet, ScrollView } from "react-native";
import axios from "axios";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import AsyncStorage from "@react-native-community/async-storage";
import { Speech } from "expo";

WebBrowser.maybeCompleteAuthSession();

const config = {
  clientId: '814496078084-mcgsttnj25f7uknuhvul9f8rofojf8ft.apps.googleusercontent.com',
  redirectUrl: 'http://localhost:8081', // Use the same redirect URI you configured in the Google Cloud Console
  scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
  serviceConfiguration: {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/auth',
    tokenEndpoint: 'https://accounts.google.com/o/oauth2/token',
    revocationEndpoint: 'https://accounts.google.com/o/oauth2/revoke',
  },
};


const App = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [emailText, setEmailText] = useState("");
  const [prediction, setPrediction] = useState("");
  const [emails, setEmails] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [username, setUsername] = useState('');

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId:
      "814496078084-cpjm6v2ufqth03hqam9d3g0m3ta40oeb.apps.googleusercontent.com",
    iosClientId:
      "814496078084-ofi3a6bu9enonermb3ph7hv9sodvcb67.apps.googleusercontent.com",
    webClientId:
      "814496078084-mcgsttnj25f7uknuhvul9f8rofojf8ft.apps.googleusercontent.com",
    scopes: config.scopes,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      setUserInfo(authentication);
      fetchUserInfo(authentication.accessToken);
    }
  }, [response]);

  const fetchUserInfo = async (token) => {
    try {
      const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsername(response.data.name);
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const predictSpam = async () => {
    try {
      const response = await axios.post("http://192.168.43.127:5000/predict", {
        text: emailText,
      });
      setPrediction(response.data.prediction);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const renderItem = ({ item, index }) => (
    <View style={[styles.emailItem, isDarkMode && styles.darkEmailItem]}>
      <View style={styles.emailContent}>
        <Text style={styles.emailNumber}>{index + 1}.</Text>
        <Text style={[styles.emailSnippet, isDarkMode && styles.darkEmailSnippet]}>{item.snippet}</Text>
      </View>
    </View>
  );

  const handlePress = () => {
    // Open gmail.com in the default browser
    Linking.openURL('https://mail.google.com/');
  };

  const handleLogin = async () => {
    try {
      const result = await promptAsync();
      if (result.type === "success") {
        setUserInfo(result.authentication);
        console.log("User info:", result.authentication);
      } else {
        console.log("Authentication failed");
      }
    } catch (e) {
      console.error("Login error:", e.message);
    }
  };

  const fetchEmails = async () => {
    try {
      const token = userInfo.accessToken;
      const response = await axios.get("http://192.168.43.127:5000/emails", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEmails(response.data.emails);
    } catch (error) {
      console.error("Error fetching emails:", error);
    }
  };

  const handleLogout = () => {
    setUserInfo(null);
  };

  const startSpeechToText = async () => {
    try {
      const { status } = await Speech.requestPermissionsAsync();
      if (status === "granted") {
        const result = await Speech.recognizeOnceAsync();
        if (result && result.text) {
          setEmailText(result.text);
        }
      } else {
        console.error("Speech recognition permission not granted");
      }
    } catch (error) {
      console.error("Error in speech recognition:", error);
    }
  };



  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={[styles.container, isDarkMode && styles.darkContainer]}>
        <View style={styles.header}>
          <Text style={[styles.title, isDarkMode && styles.darkTitle]}>Gmail Login</Text>
          <Switch value={isDarkMode} onValueChange={toggleDarkMode} />
        </View>

        {!userInfo ? (
          <Button title="Gmail Login" onPress={handleLogin} color={isDarkMode ? "#bbb" : "#007BFF"} style={styles.button} />
        ) : (
          <View style={styles.signedInContainer}>
            <Text style={[styles.signedInText, isDarkMode && styles.darkSignedInText]}>Signed in as: {username}</Text>
            <Button title="Sign Out" onPress={handleLogout} color={isDarkMode ? "#bbb" : "#007BFF"} style={styles.button}  />
            <Button title="Fetch Emails" onPress={fetchEmails} color={isDarkMode ? "#bbb" : "#007BFF"} style={styles.button} />
            <FlatList
              data={emails}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
            />
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.textInput, isDarkMode && styles.darkTextInput]}
            placeholder="Enter email text..."
            placeholderTextColor={isDarkMode ? "#888" : "#999"}
            onChangeText={(text) => setEmailText(text)}
            value={emailText}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button title="Predict" onPress={predictSpam} color={isDarkMode ? "#bbb" : "#007BFF"} style={styles.button} />
          <View style={{ marginBottom: 10 }} /> {/* Add spacing */}
          <Button title="Go to Gmail" onPress={handlePress} color={isDarkMode ? "#bbb" : "#007BFF"} style={styles.button}  />
        </View>

        {prediction !== "" && (
          <Text style={[styles.predictionText, isDarkMode && styles.darkPredictionText]}>Prediction: {prediction}</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  darkContainer: {
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  darkTitle: {
    color: "#fff",
  },
  signedInContainer: {
    alignItems: "center",
  },
  signedInText: {
    fontSize: 18,
    marginBottom: 10,
  },
  darkSignedInText: {
    color: "#fff",
  },
  emailSnippet: {
    fontSize: 16,
    marginVertical: 5,
  },
  darkEmailSnippet: {
    color: "#ccc",
  },
  inputContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "gray",
    padding: 10,
    marginBottom: 20,
    marginTop: 20,
    width: "80%",
    borderRadius: 5,
  },
  darkTextInput: {
    borderColor: "#888",
    color: "#fff",
  },
  buttonContainer: {
    justifyContent: "center",
    width: "100%",
    alignItems: "center",
    paddingBottom: 10,
    marginTop: 20,
  },
  predictionText: {
    marginTop: 20,
    fontSize: 16,
    color: "#333",
  },
  darkPredictionText: {
    color: "#bbb",
  },
  emailContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    marginVertical: 10,
    width: "80%",
  },
});


export default App;
