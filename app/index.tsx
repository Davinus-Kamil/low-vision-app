import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Speech from "expo-speech";
import * as ImagePicker from "expo-image-picker";
import {
  Camera,
  Save,
  Image as ImageIcon,
  X,
  FileText,
} from "lucide-react-native";
import * as MediaLibrary from "expo-media-library";
import * as DocumentPicker from "expo-document-picker";
import * as Linking from "expo-linking";
import OCRScanner from '../components/OCRScanner';

const App = () => {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activityLog, setActivityLog] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speechRate, setSpeechRate] = useState(0.9);
  const [extractedText, setExtractedText] = useState('');
  const [showOCR, setShowOCR] = useState(false);


  useEffect(() => {
    loadActivityLog();
  }, []);

  interface Activity {
    id: string;
    action: string;
    imagePath: string;
    timestamp: string;
  }
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);

  const clearPdf = () => {
    setSelectedPdf(null);
  };

  const speak = (text: string): void => {
    if (voiceEnabled) {
      Speech.speak(text, { rate: speechRate, pitch: 1.0 });
    }
  };

  const handleTextExtracted = (text: string) => {
    setExtractedText(text);
    // Do something with the extracted text
    console.log('Extracted text:', text);
  };

  const loadActivityLog = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem("activityLog");
      if (jsonValue !== null) {
        setActivityLog(JSON.parse(jsonValue));
      }
    } catch (error) {
      console.error("Failed to load activity log:", error);
      speak("Error loading activity history");
    }
  };

  const saveToActivityLog = async (
    action: string,
    imagePath: string
  ): Promise<void> => {
    try {
      const newActivity: Activity = {
        id: Date.now().toString(),
        action,
        imagePath,
        timestamp: new Date().toISOString(),
      };
      const updatedLog: Activity[] = [...activityLog, newActivity];
      setActivityLog(updatedLog);
      await AsyncStorage.setItem("activityLog", JSON.stringify(updatedLog));
    } catch (error) {
      console.error("Failed to save activity:", error);
      speak("Error saving activity");
    }
  };

  const pickFile = async () => {
    speak("Opening file picker");
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: true, // makes a local copy if needed
        multiple: false,
      });

      if (result.assets && result.assets.length > 0) {
        const { uri, mimeType, name } = result.assets[0];

        if (mimeType?.startsWith("image/")) {
          setSelectedImage(uri);
          speak("Image selected");
          saveToActivityLog("Selected image", uri);
        } else if (mimeType === "application/pdf") {
          // setSelectedPdf(uri); // Uncomment if you have setSelectedPdf defined
          speak("PDF selected");
          saveToActivityLog("Selected PDF", uri);
        } else {
          speak("Unsupported file type");
        }
      } else {
        speak("File selection cancelled");
      }
    } catch (error) {
      console.error("Error picking file:", error);
      speak("Error selecting file");
    }
  };

  const takePhoto = async () => {
    speak("Opening camera");
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        speak("Camera permission denied");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        speak("Photo taken");
        saveToActivityLog("Captured photo", result.assets[0].uri);
      } else {
        speak("Photo capture cancelled");
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      speak("Error accessing camera");
    }
  };

  const saveImage = async () => {
    if (!selectedImage) {
      speak("No image to save");
      return;
    }

    speak("Saving image");
    setLoading(true);

    try {
      const fileName = `image_${Date.now()}.jpg`;
      const newPath = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.copyAsync({
        from: selectedImage,
        to: newPath,
      });

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        speak("Permission denied for saving to gallery");
        Alert.alert(
          "Permission Denied",
          "Cannot save image to gallery without permission."
        );
      } else {
        const asset = await MediaLibrary.createAssetAsync(newPath);
        await MediaLibrary.createAlbumAsync("Low-vision", asset, false);
        speak("Image saved to gallery");
      }

      saveToActivityLog("Saved image", newPath);

      speak("Image saved successfully");
      Alert.alert("Success", "Image saved to device and gallery!");
    } catch (error) {
      console.error("Error saving image:", error);
      speak("Failed to save image");
      Alert.alert("Error", "Failed to save image.");
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    speak("Image cleared");
  };

  const openPdf = async () => {
    if (selectedPdf) {
      await Linking.openURL(selectedPdf);
    }
  };

  const runOCRScanner = () => {
    if (!selectedImage) return;

    return (
      <OCRScanner
        fileUri={selectedImage}
        onTextExtracted={handleTextExtracted}
      />
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.mainContent}>
        <View style={styles.mainContent}>
          <View style={styles.imageContainer}>
            {selectedImage || selectedPdf ? (
              <View style={styles.selectedImageContainer}>
                {selectedImage && (
                  <>
                    <Image
                      source={{ uri: selectedImage }}
                      style={styles.selectedImage}
                    />
                    <TouchableOpacity
                      style={styles.clearButton}
                      onPress={clearImage}
                    >
                      <X color="#ffffff" size={20} />
                    </TouchableOpacity>
                  </>
                )}
                {selectedPdf && (
                  <>
                    <View style={styles.pdfPreview}>
                      <FileText color="#666666" size={80} />
                      <Text style={styles.pdfText}>PDF Selected</Text>
                      <TouchableOpacity
                        style={[styles.actionButton, { marginTop: 16 }]}
                        onPress={openPdf}
                      >
                        <Text style={styles.actionButtonText}>Open PDF</Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      style={styles.clearButton}
                      onPress={clearPdf}
                    >
                      <X color="#ffffff" size={20} />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            ) : (
              <View style={styles.placeholderContainer}>
                <ImageIcon color="#cccccc" size={80} />
                <Text style={styles.placeholderText}>
                  Select an image or PDF{" "}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={pickFile}>
            <ImageIcon color="#ffffff" size={24} />
            <Text style={styles.actionButtonText}>Upload</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
            <Camera color="#ffffff" size={24} />
            <Text style={styles.actionButtonText}>Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              !selectedImage && styles.disabledButton,
            ]}
            onPress={() => {  // if you still need this
              setShowOCR(true); // trigger OCRScanner rendering
            }}
            disabled={!selectedImage || loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Save color="#ffffff" size={24} />
            )}
            <Text style={styles.actionButtonText}>OCR</Text>
          </TouchableOpacity>


          <TouchableOpacity
            style={[
              styles.actionButton,
              !selectedImage && styles.disabledButton,
            ]}
            onPress={saveImage}
            disabled={!selectedImage || loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Save color="#ffffff" size={24} />
            )}
            <Text style={styles.actionButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.mainContent}>
          {showOCR && runOCRScanner()}

          {extractedText ? (
            <View style={{
              marginTop: 20,
              padding: 16,
              backgroundColor: '#f0f0f0',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#ddd',
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}>
              <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>
                Extracted Text
              </Text>
              <Text style={{ fontSize: 14, lineHeight: 20, color: '#333' }}>
                {extractedText}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingBottom: 86,
  },
  header: {
    backgroundColor: "#DF2935",
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  historyButton: {
    padding: 8,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  imageContainer: {
    flex: 1,
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#ffffff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  selectedImageContainer: {
    flex: 1,
    position: "relative",
  },
  selectedImage: {
    flex: 1,
    resizeMode: "contain",
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#aaaaaa",
    marginTop: 12,
    fontSize: 16,
  },
  clearButton: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap", // allows buttons to wrap and adjust on small screens
    paddingVertical: 8,
  },

  actionButton: {
    backgroundColor: "#DF2935",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    margin: 6,
    alignItems: "center",
    flexDirection: "row",
    width: "38%", // percentage for responsive layout
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  disabledButton: {
    backgroundColor: "#a0a0a0",
    opacity: 0.7,
  },
  actionButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    marginLeft: 8,
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
  },
  navButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
    color: "#777777",
  },
  activeNavText: {
    color: "#DF2935",
    fontWeight: "600",
  },
  historyContainer: {
    flex: 1,
    padding: 16,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333333",
  },
  pdfPreview: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
  },

  pdfText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333333",
  },

  historyItem: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  historyItemHeader: {
    padding: 12,
  },
  historyAction: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  historyDate: {
    fontSize: 12,
    color: "#777777",
    marginTop: 4,
  },
  historyImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  emptyHistory: {
    textAlign: "center",
    color: "#777777",
    marginTop: 24,
    fontSize: 16,
  },
});
export default App;
