import { Text, View } from "react-native";
import WebDashboard from "../src/webDashboard";
import React from "react";
import { StatusBar } from "expo-status-bar";
export default function Index() {
  return (
    <React.Fragment>
      {/* <View style={{marginBottom:30}}> */}

      {/* </View> */}

      <View style={{ flex: 1 }}>
        <WebDashboard />
      </View>
    </React.Fragment>
  );
}
