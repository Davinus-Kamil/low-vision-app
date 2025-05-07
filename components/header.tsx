import React, { useState } from "react";
import { View, TouchableOpacity, Text, Modal, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const Header: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handleExit = () => {
    setShowModal(true);
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={handleExit}>
        <Ionicons name="close" size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.title}>MyApp</Text>
      <TouchableOpacity onPress={() => router.push("/settings")}>
        <Ionicons name="menu" size={24} color="black" />
      </TouchableOpacity>

      <Modal visible={showModal} transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>Do you want to exit the app?</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  // Handle app exit here (if needed with BackHandler or custom logic)
                }}
              >
                <Text>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 15,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 18, fontWeight: "bold" },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#000000aa",
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
