import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function SignInPage() {
  return (
    <View style={styles.container}>
      <View style={styles.circle} />
      <View style={styles.line} />
      <View style={styles.line} />
      <TouchableOpacity style={styles.button}>
        <Text>Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ccc",
    marginBottom: 40,
  },
  line: {
    width: 150,
    height: 10,
    backgroundColor: "#ddd",
    marginVertical: 10,
    borderRadius: 5,
  },
  button: {
    marginTop: 20,
    backgroundColor: "#ccc",
    padding: 15,
    borderRadius: 8,
  },
});
