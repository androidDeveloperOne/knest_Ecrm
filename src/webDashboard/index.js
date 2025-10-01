import React, { useEffect, useRef, useState } from "react";
import {
  BackHandler,
  Button,
  Linking,
  Platform,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { WebView } from "react-native-webview";
import { Camera, useCameraPermissions } from "expo-camera";
import { StatusBar } from "expo-status-bar";

const WebDashboard = () => {
  const webViewRef = useRef(null);
  const { width, height } = useWindowDimensions();
  const [canGoBack, setCanGoBack] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [hasPermission, setHasPermission] = useState(false);

  // useEffect(() => {
  //   requestPermissions();
  // }, []);

  // Request permissions for Android
  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: "Storage Permission",
          message: "We need access to your storage to save files.",
          buttonPositive: "OK",
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        setHasPermission(true);
      } else {
        console.log("Storage permission denied");
      }
    }
  };

  useEffect(() => {
    if (Platform.OS === "android") {
      BackHandler.addEventListener("hardwareBackPress", onAndroidBackPress);
    }
    return () => {
      BackHandler.removeEventListener("hardwareBackPress", onAndroidBackPress);
    };
  }, [canGoBack]);

  const onAndroidBackPress = () => {
    if (canGoBack) {
      webViewRef.current.goBack();
      return true;
    } else {
      BackHandler.exitApp();
      return false;
    }
  };

  if (!permission?.granted) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ paddingVertical: 10, textAlign: "center" }}>
          We need your permission to show the camera
        </Text>
        <Button title="grant permission" onPress={requestPermission} />
      </View>
    );
  }

  const onNavigationStateChange = (navState) => {
    console.log("navState", navState);
    setCanGoBack(navState.canGoBack);
  };
  const handleWebViewMessage = (event) => {
    console.log("event", event);
    const data = event.nativeEvent.data;
  };
  const onShouldStartLoadWithRequest = (request) => {
    console.log("request", request);
    // Check if the URL is a file download (you can customize the check)
    const isDownloadRequest = /\.(pdf|zip|docx|mp4)$/i.test(request.url);

    if (isDownloadRequest) {
      // Trigger your download logic here, or just notify the user
      Alert.alert("Download Detected", `Downloading: ${request.url}`);

      // Prevent the WebView from actually navigating to the download link
      return false;
    }

    // Allow the WebView to continue loading other requests
    return true;
  };

  const handleDownload = (e) => {
    console.log("e", e);
  };

  const injectedJavaScript = `
  // Function to handle the keydown event and send data to React Native
  function handleKeydownEvent(e) {
    const eventData = {
      type: e.type,
      timestamp: e.timeStamp,
      key: e.key || null,
      keyCode: e.keyCode || null
    };

    // Log the keydown event data before sending

    // Send the event data to React Native
    window.ReactNativeWebView.postMessage(JSON.stringify(eventData));

    // Prevent the default action for specific keys (e.g., refresh)
    if (e.key === "F5" || e.keyCode === 116) {
      // Prevent default refresh behavior when F5 is pressed
      e.preventDefault();
      // Optionally, send a refresh command to React Native
      window.ReactNativeWebView.postMessage("Refresh triggered by F5");
    }

    // Prevent the default action for the 'Enter' key if needed
    if (e.key === "Enter") {
      e.preventDefault();
    }
  }

  // Add an event listener only for the 'keydown' event
  window.addEventListener('keydown', handleKeydownEvent);

  // Initial message after the page is loaded
  window.ReactNativeWebView.postMessage("Page Loaded");

 document.querySelectorAll('button.grid-download').forEach(button => {
            button.addEventListener('click', function(event) {
              // Send button info to React Native (e.g., class name, text content)
              const buttonText = button.innerText.trim();  // Get the button's text
              window.ReactNativeWebView.postMessage('Button clicked: ' + buttonText);
            });






`;
  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" translucent={false} backgroundColor="#0a2351" />
      <WebView
        ref={webViewRef}
        allowsBackForwardNavigationGestures
        geolocationEnabled={true}
        javaScriptEnabled={true}
        sharedCookiesEnabled={true}
        startInLoadingState={true}
        injectedJavaScript={injectedJavaScript}
        cacheEnabled={true}
        source={{ uri: "https://erp.knestaluform.in" }}
        onMessage={(event) => {
          console.log("event", event);
          try {
            const data = JSON.parse(event.nativeEvent.data); // Parse the URL
            const { url } = data; // Extract the URL

            // if (url) {
            //   handleDownload(url); // Trigger the download by opening URL
            // }
          } catch (error) {
            console.error("Error parsing message from WebView:", error);
          }
        }}
        onNavigationStateChange={onNavigationStateChange}
        style={{ width: width, height: height, borderWidth: 1 }}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        onFileDownload={handleDownload}
        originWhitelist={["*"]}
      />
    </View>
  );
};

export default WebDashboard;
