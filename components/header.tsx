import React, { useState } from "react";
import { View, TouchableOpacity, Text, Modal, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Modal Component
interface ExitModalProps {
  visible: boolean;
  onClose: () => void;
  onExit: () => void;
}

const ExitModal: React.FC<ExitModalProps> = ({ visible, onClose, onExit }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text>Do you want to exit the app?</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={onClose} accessibilityLabel="No, cancel exit">
              <Text>No</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onExit} accessibilityLabel="Yes, exit app">
              <Text>Yes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Header Component
const Header: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  // Constants for icons
  const ICON_SIZE = 24;
  const ICON_COLOR = "black";

  // Handlers
  const handleExit = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  return (
    <View style={styles.header}>
      {/* Exit Button */}
      <TouchableOpacity onPress={handleExit} accessibilityLabel="Close app">
        <Ionicons name="close" size={ICON_SIZE} color={ICON_COLOR} />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>MyApp</Text>

      {/* Menu Button */}
      <TouchableOpacity onPress={() => router.push("/settings")} accessibilityLabel="Open settings menu">
        <Ionicons name="menu" size={ICON_SIZE} color={ICON_COLOR} />
      </TouchableOpacity>

      {/* Exit Modal */}
      <ExitModal
        visible={showModal}
        onClose={handleCloseModal}
        onExit={() => {
          // Handle app exit logic here (e.g., BackHandler.exitApp())
          console.log("Exiting the app...");
        }}
      />
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  header: {
    padding: 15,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalContent: {
    margin: 30,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
});

export default Header;