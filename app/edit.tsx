import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function EditPage() {
  return (
    <View style={styles.container}>
      <Text>Image Editing Tools Here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
});
