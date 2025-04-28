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
  History,
  Image as ImageIcon,
  X,
  Settings,
  Info,
  FileText,
} from "lucide-react-native";
import * as MediaLibrary from "expo-media-library";
import * as DocumentPicker from "expo-document-picker";

type Activity = {
  id: string;
  text: string;
  image?: string;
  action?: string;
  timestamp?: number;
  imagePath?: string;
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
    justifyContent: "space-around",
    paddingVertical: 16,
  },
  actionButton: {
    backgroundColor: "#DF2935",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    flexDirection: "row",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
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

const HistoryScreen = () => {
  const router = useRouter();
  const [activityLog, setActivityLog] = useState<Activity[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speechRate, setSpeechRate] = useState(0.9);

  // Function to load activity log from AsyncStorage
  const loadActivityLog = async () => {
    try {
      const log = await AsyncStorage.getItem("activityLog");
      if (log) {
        setActivityLog(JSON.parse(log));
      }
    } catch (error) {
      console.error("Failed to load activity log:", error);
    }
  };

  useEffect(() => {
    loadActivityLog();
  }, []);
  return (
    <View style={styles.container}>
    <ScrollView style={styles.historyContainer}>
      <Text style={styles.historyTitle}>Activity History</Text>
      {activityLog.length === 0 ? (
        <Text style={styles.emptyHistory}>No activity yet</Text>
      ) : (
        activityLog
          .map((activity) => (
            <View key={activity.id} style={styles.historyItem}>
              <View style={styles.historyItemHeader}>
                <Text style={styles.historyAction}>{activity.action}</Text>
                <Text style={styles.historyDate}>
                  {new Date(activity.timestamp ?? 0).toLocaleDateString()}{" "}
                  {new Date(activity.timestamp ?? 0).toLocaleTimeString()}
                </Text>
              </View>
              {activity.imagePath && (
                <Image
                  source={{ uri: activity.imagePath }}
                  style={styles.historyImage}
                />
              )}
            </View>
          ))
          .reverse()
      )}
    </ScrollView>
    </View>
  );
};
export default HistoryScreen;
