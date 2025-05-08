import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

type MenuProps = {
  onClose: () => void;
};

const Menu: React.FC<MenuProps> = ({ onClose }) => {
  const router = useRouter();

  const menuItems: { label: string; route: "/settings" | "/info" | "/history"; icon: "settings" | "info" | "clock" }[] = [
    { label: "Settings", route: "/settings", icon: "settings" },
    { label: "Info", route: "/info", icon: "info" },
    { label: "History", route: "/history", icon: "clock" },
  ];

  const handleMenuItemPress = (route: "/settings" | "/info" | "/history") => {
    router.push(route);
    onClose(); // Close the menu after navigation
  };

  return (
    <View style={styles.container}>
      {menuItems.map((item, index) => (
        <TouchableOpacity
          key={item.label}
          style={[
            styles.menuItem,
            index === menuItems.length - 1 && styles.lastItem,
          ]}
          onPress={() => handleMenuItemPress(item.route)}
        >
          <Feather name={item.icon} size={20} color="#666" style={styles.menuIcon} />
          <Text style={styles.menuText}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 60,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    paddingVertical: 8,
    minWidth: 180,
    zIndex: 100,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  menuIcon: {
    marginRight: 12,
  },
  menuText: {
    fontSize: 14,
    color: "#444",
    flex: 1,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
});

export default Menu;