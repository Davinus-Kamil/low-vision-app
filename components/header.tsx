import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Menu from "./menu";

const Header: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <View style={styles.headerContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => console.log("Exit button clicked")}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Low-Vision</Text>
        <TouchableOpacity onPress={() => setShowMenu((prev) => !prev)}>
          <Ionicons name="menu" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {showMenu && <Menu onClose={() => setShowMenu(false)} />}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    position: "relative", // crucial for Menu's absolute position to work
    zIndex: 100,
  },
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
