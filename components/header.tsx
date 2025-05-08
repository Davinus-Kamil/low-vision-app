import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Quit from "../components/quit"; 

const Header: React.FC = () => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const handleExit = () => setShowModal(true);

  const confirmExit = () => {
    setShowModal(false);
    console.log("User confirmed exit");
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={handleExit}>
        <Ionicons name="close" size={24} color="white" />
      </TouchableOpacity>
      <Text style={styles.title}>Low-Vision</Text>
      <TouchableOpacity onPress={() => console.log("Menu pressed")}>
        <Ionicons name="menu" size={28} color="white" />
      </TouchableOpacity>
      <Quit
        visible={showModal}
        onCancel={() => setShowModal(false)}
        onConfirm={confirmExit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#e53935",
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default Header;
