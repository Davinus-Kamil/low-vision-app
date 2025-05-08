import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import Header from "./header"; 

export default function CameraPage() {
  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.controls}>
        <TouchableOpacity style={[styles.button, styles.primary]} />
        <TouchableOpacity style={styles.button} />
        <TouchableOpacity style={styles.folder} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 40,
  },
  button: {
    width: 50,
    height: 50,
    backgroundColor: "#ccc",
    borderRadius: 25,
  },
  primary: {
    backgroundColor: "#444",
  },
  folder: {
    width: 50,
    height: 50,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#000",
  },
});
