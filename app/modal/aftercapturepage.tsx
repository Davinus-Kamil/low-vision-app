import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import Header from "./header";

export default function AfterCapturePage() {
  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.sliderBar} />
      <View style={styles.footerButtons}>
        <TouchableOpacity style={styles.footerButton} />
        <TouchableOpacity style={styles.footerButton} />
        <TouchableOpacity style={styles.footerButton} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sliderBar: {
    height: 6,
    marginTop: 50,
    marginHorizontal: 40,
    backgroundColor: "#c9a7f9",
    borderRadius: 3,
  },
  footerButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingBottom: 30,
    marginTop: "auto",
  },
  footerButton: {
    width: 80,
    height: 30,
    backgroundColor: "#ccc",
    borderRadius: 12,
  },
});
