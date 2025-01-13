import React, { useState, useEffect } from "react";
import * as GoogleGenerativeAI from "@google/generative-ai";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  Platform
} from "react-native";
import * as Speech from "expo-speech";
import { FontAwesome } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import FlashMessage, { showMessage } from "react-native-flash-message";
import {WebView} from 'react-native-webview';
import HTML_FILE from './live2d.html';
const isAndroid = Platform.OS === 'android';

const GeminiChat = () => {
  const [myMessage, setMyMessage] = useState([]);
  const [messages, setMessages] = useState([]);
  const [chat, setChat] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showStopIcon, setShowStopIcon] = useState(false);

  const API_KEY = "AIzaSyDWP3gTU7XvbiR-QhK_vQKj8GYnjJ8cWUE";

  useEffect(() => {
    const startChat = async () => {
      const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = "Halo, nama saya User. Kamu ialah A.R.L.I.E. si asisten pribadi";
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      console.log(text);
      showMessage({
        message: "Halo~ !",
        description: text,
        type: "info",
        icon: "info",
        duration: 2000,
      });
      setChat([
        {
          text,
          user: false,
        },
      ]);
    };
    //function call
    startChat();
  }, []);

  const sendMessage = async () => {
    setLoading(true);
    const userMessage = { text: userInput, user: true};
    setMessages([...messages, userMessage]);
    setChat([...chat, userMessage]);

    const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = userMessage.text;
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    setMessages([...messages, { text, user: false }]);
    setChat([...chat, {text: prompt, user: false}, {text, user: false}]);
    setLoading(false);
    setUserInput("");    
    // if (text) {
    //   Speech.speak(text);
    // }
    if (text && !isSpeaking) {
      Speech.speak(text);
      setIsSpeaking(true);
      setShowStopIcon(true);
    }
  };

  const toggleSpeech = () => {
    console.log("isSpeaking", isSpeaking);
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      Speech.speak(messages[messages.length - 1].text);
      setIsSpeaking(true);
    }
  };

  const ClearMessage = () => {
    setMessages("");
    setIsSpeaking(false);
  };

  const Chat = 
  [{ chat: chat}]

  const Live2D = require('./live2d/arlie.html');

  return (
    <View style={styles.container}>
      <View style={styles.live2DContainer}>
        <WebView
          source={Live2D}
          style={{flex: 1}}
        />
      </View>
      <FlatList
        inverted
        data={Chat}
        renderItem={({ item }) => (
          <View>
            <FlatList
              data={item.chat}
              renderItem={({item, index}) => {
                if (index % 2 == 0) {
                  return  <View style={styles.messageContainer2}>
                            <Text style={[styles.messageText2, item.user && styles.userMessage]}>
                              {item.text}
                            </Text>
                          </View>;
                } else {
                  return  <View style={styles.messageContainer}>
                            <Text style={[styles.messageText, item.user && styles.userMessage]}>
                              {item.text}
                            </Text>
                          </View>;
                }
              }}
              keyExtractor={(item) => item.text}
            />
          </View>
        )}
        keyExtractor={(item, index) => index}
      />
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.micIcon} onPress={toggleSpeech}>
          {isSpeaking ? (
            <FontAwesome
              name="microphone-slash"
              size={24}
              color="white"
              style={{
                justifyContent: "center",
                alignItems: "center",
              }}
            />
          ) : (
            <FontAwesome
              name="microphone"
              size={24}
              color="white"
              style={{
                justifyContent: "center",
                alignItems: "center",
              }}
            />
          )}
        </TouchableOpacity>
        <TextInput
          placeholder="Type a message"
          onChangeText={setUserInput}
          value={userInput}
          onSubmitEditing={sendMessage}
          style={styles.input}
          placeholderTextColor="#fff"
        />
        {
          //show stop icon only when speaking
          showStopIcon && (
            <TouchableOpacity style={styles.stopIcon} onPress={ClearMessage}>
              <Entypo name="controller-stop" size={24} color="white" />
            </TouchableOpacity>
          )
        }
        {/* {loading && <ActivityIndicator size="large" color="black" />} */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: 
  { flex: 1,
    backgroundColor: "#ffff",
    marginTop: 0},
  live2DContainer:
  { flexDirection: "row",
    alignItems: "center",
    height: 250},
  messageContainer: 
  { backgroundColor: "#ffd580", 
    marginTop: 25, padding: 10, 
    marginRight: 25, 
    marginLeft: 100, 
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,},
  messageContainer2: 
  { backgroundColor: "#add8E6", 
    marginTop: 25, padding: 10, 
    marginLeft: 25, 
    marginRight: 100,
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
    borderBottomRightRadius: 15,},
  messageText: { fontSize: 12 },
  messageText2: { fontSize: 12 },
  inputContainer: { flexDirection: "row", alignItems: "center", padding: 10 },
  input: {
    flex: 1,
    padding: 10,
    backgroundColor: "#131314",
    borderRadius: 10,
    height: 50,
    color: "white",
  },
  micIcon: {
    padding: 10,
    backgroundColor: "#131314",
    borderRadius: 25,
    height: 50,
    width: 50,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 5,
  },
  stopIcon: {
    padding: 10,
    backgroundColor: "#131314",
    borderRadius: 25,
    height: 50,
    width: 50,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 3,
  },
  faq: {
    position: 'absolute',
    flex: 1,
    paddingHorizontal: 2,
    top: 30,
    alignSelf: 'flex-end',
    zIndex: 1000,
  }
});

export default GeminiChat;
