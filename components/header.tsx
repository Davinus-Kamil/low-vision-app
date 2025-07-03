import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, Platform, BackHandler } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useThemeColor } from "../hooks/useThemeColor";
import Menu from "./menu";
import { Camera, History, Settings, Info, X as XIcon } from 'lucide-react-native';

const Header: React.FC = () => {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  const handleCloseApp = () => {
    if (Platform.OS === 'android') {
      BackHandler.exitApp();
    } else {
      // On iOS, apps can't be closed programmatically; you might show an alert or do nothing
      // Alert.alert('Close', 'You can close the app from the app switcher.');
    }
  };

  return (
    <View style={[styles.header, { backgroundColor }]}>
      <TouchableOpacity style={styles.closeContainer} onPress={handleCloseApp}>
        <XIcon color={textColor} size={28} />
      </TouchableOpacity>
      <Text style={[styles.title, { color: textColor }]}>Low-Vision</Text>
      <TouchableOpacity style={styles.burgerContainer} onPress={() => setMenuVisible(true)}>
        <Feather name="menu" size={28} color={textColor} />
      </TouchableOpacity>
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuPopover}>
            <TouchableOpacity style={styles.menuItem} onPress={() => { router.push('/'); setMenuVisible(false); }}>
              <Camera color={textColor} size={20} style={styles.menuIcon} />
              <Text style={[styles.menuText, { color: textColor }]}>Capture</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { router.push('/history'); setMenuVisible(false); }}>
              <History color={textColor} size={20} style={styles.menuIcon} />
              <Text style={[styles.menuText, { color: textColor }]}>History</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { router.push('/settings'); setMenuVisible(false); }}>
              <Settings color={textColor} size={20} style={styles.menuIcon} />
              <Text style={[styles.menuText, { color: textColor }]}>Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { router.push('/info'); setMenuVisible(false); }}>
              <Info color={textColor} size={20} style={styles.menuIcon} />
              <Text style={[styles.menuText, { color: textColor }]}>Info</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    height: 60,
    position: "relative",
  },
  closeContainer: {
    padding: 4,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  burgerContainer: {
    marginLeft: 8,
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  menuPopover: {
    marginTop: 60,
    marginRight: 16,
    minWidth: 180,
    borderRadius: 8,
    backgroundColor: "black",
    shadowColor: "red",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 100,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: 'transparent',
  },
  menuIcon: {
    marginRight: 12,
  },
  menuText: {
    fontSize: 14,
    flex: 1,
  },
});

export default Header;
