// web 814496078084-mcgsttnj25f7uknuhvul9f8rofojf8ft.apps.googleusercontent.com
// ios 814496078084-ofi3a6bu9enonermb3ph7hv9sodvcb67.apps.googleusercontent.com
// android 814496078084-cpjm6v2ufqth03hqam9d3g0m3ta40oeb.apps.googleusercontent.com
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, FlatList } from "react-native";
import axios from "axios";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import AsyncStorage from "@react-native-community/async-storage";
import { Speech } from "expo";

WebBrowser.maybeCompleteAuthSession();

const App = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [emailText, setEmailText] = useState("");
  const [prediction, setPrediction] = useState("");
  const [emails, setEmails] = useState([]);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId:
      "814496078084-cpjm6v2ufqth03hqam9d3g0m3ta40oeb.apps.googleusercontent.com",
    iosClientId:
      "814496078084-ofi3a6bu9enonermb3ph7hv9sodvcb67.apps.googleusercontent.com",
    webClientId:
      "814496078084-mcgsttnj25f7uknuhvul9f8rofojf8ft.apps.googleusercontent.com",
  });

  const predictSpam = async () => {
    try {
      const response = await axios.post("http://192.168.43.47:5000/predict", {
        text: emailText,
      });
      setPrediction(response.data.prediction);
    } catch (error) {
      console.error("Error:", error);
    }
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
      const response = await axios.get("http://192.168.57.228:5000/emails", {
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

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {!userInfo ? (
        <Button title="Access Gmail" onPress={handleLogin} />
      ) : (
        <View>
          <Text>Signed in as: {userInfo?.displayName}</Text>
          <Button title="Sign Out" onPress={handleLogout} />
          <Button
            title="Fetch Emails"
            onPress={fetchEmails}
            style={{ padding: 10 }}
          />
          <FlatList
            data={emails}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <Text>{item.snippet}</Text>}
          />
        </View>
      )}
      <View style={{ flexDirection: "row" }}>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: "gray",
            padding: 10,
            marginBottom: 20,
            marginTop: 20,
            width: "80%",
          }}
          placeholder="Enter email text..."
          onChangeText={(text) => setEmailText(text)}
          value={emailText}
        />
        <Button title="Speech" onPress={startSpeechToText} />
      </View>
      <Button title="Predict" onPress={predictSpam} />
      {prediction !== "" && (
        <Text style={{ marginTop: 20 }}>Prediction: {prediction}</Text>
      )}
    </View>
  );
};

export default App;
