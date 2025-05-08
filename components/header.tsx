import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; 

const Header: React.FC = () => {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => console.log("Exit pressed")}>
        <Ionicons name="close" size={24} color="white" />
      </TouchableOpacity>
      <Text style={styles.title}>Low-Vision </Text>
      <TouchableOpacity onPress={() => console.log("Menu pressed")}>
        <Ionicons name="menu" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#DF2935",
    paddingHorizontal: 20,
    paddingVertical: 10,
    height: 60,
  },
  logo: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginLeft: 15,
  },
});

export default Header;
