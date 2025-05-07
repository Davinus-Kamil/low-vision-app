import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const Footer: React.FC = () => {
  // State to toggle between PDF Viewer and Gallery
  const [isPdfViewer, setIsPdfViewer] = useState(true);

  // Placeholder for camera action (open-ended)
  const handleCameraPress = () => {
    console.log("Camera button pressed. Add redirection logic later.");
  };

  // Toggle between PDF Viewer and Gallery
  const handleTogglePress = () => {
    setIsPdfViewer((prev) => !prev); // Toggle the state
  };

  return (
    <View style={styles.footer}>
      {/* Camera Section */}
      <View style={styles.sectionContainer}>
        <TouchableOpacity onPress={handleCameraPress} style={styles.option}>
          <Ionicons name="camera" size={24} color="black" />
          <Text style={styles.optionText}>Camera</Text>
        </TouchableOpacity>
      </View>

      {/* PDF Viewer / Gallery Section */}
      <View style={styles.sectionContainer}>
        <TouchableOpacity onPress={handleTogglePress} style={styles.option}>
          <Ionicons
            name={isPdfViewer ? "document" : "images"}
            size={24} // Consistent icon size
            color="black"
          />
          <Text style={styles.optionText}>
            {isPdfViewer ? "PDF Viewer" : "Gallery"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  footer: {
    flexDirection: "row",
    justifyContent: "space-around", // Ensures even spacing between sections
    alignItems: "center", // Aligns items vertically
    padding: 10,
    backgroundColor: "#eee",
  },
  sectionContainer: {
    alignItems: "center", // Centers content within each section
  },
  option: {
    alignItems: "center", // Centers the icon and text
  },
  optionText: {
    marginTop: 5, // Consistent spacing between icon and text
    fontSize: 12, // Consistent font size
    fontWeight: "normal", // Consistent font weight
    textAlign: "center", // Ensures text is centered under the icon
  },
});

export default Footer;