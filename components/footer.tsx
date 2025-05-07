import React from "react";
import { View, Text, StyleSheet } from "react-native";

const Footer: React.FC = () => {
  return (
    <View style={styles.footer}>
      <Text>Footer Content</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    padding: 10,
    backgroundColor: "#eee",
    alignItems: "center",
  },
});

export default Footer;
