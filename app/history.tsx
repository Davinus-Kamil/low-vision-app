import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  Animated,
  Share as RNShare,
  Alert,
  Platform,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Speech from "expo-speech";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import {
  ArrowLeft,
  Clock,
  Share2,
  Download,
  Trash2,
  FileText,
  Search,
  Filter,
  X,
  Calendar,
  Star,
  Image as ImageIcon,
  CheckCircle,
  ArrowUp,
  InfoIcon,
  BookOpen,
} from "lucide-react-native";

type Activity = {
  id: string;
  text: string;
  image?: string;
  action?: string;
  timestamp?: number;
  imagePath?: string;
  category?: string;
  isStarred?: boolean;
};

const SCREEN_WIDTH = Dimensions.get("window").width;

const HistoryScreen = () => {
  const router = useRouter();
  const [activityLog, setActivityLog] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const modalAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Get categories from activities
  const categories = Array.from(
    new Set(activityLog.map((activity) => activity.category || "Uncategorized"))
  );

  // Determine colors based on dark mode
  const colors = {
    background: darkMode ? "#121212" : "#F8F9FA",
    card: darkMode ? "#1E1E1E" : "#FFFFFF",
    primary: "#DF2935",
    text: darkMode ? "#FFFFFF" : "#333333",
    subtext: darkMode ? "#BBBBBB" : "#777777",
    border: darkMode ? "#333333" : "#EEEEEE",
    overlay: darkMode ? "rgba(0,0,0,0.9)" : "rgba(0,0,0,0.75)",
  };

  // Function to load activity log from AsyncStorage
  const loadActivityLog = async () => {
    try {
      setIsLoading(true);
      const log = await AsyncStorage.getItem("activityLog");
      const voiceEnabledSetting = await AsyncStorage.getItem("voiceEnabled");
      const speechRateSetting = await AsyncStorage.getItem("speechRate");
      const darkModeSetting = await AsyncStorage.getItem("darkMode");

      if (log) {
        const parsedLog: Activity[] = JSON.parse(log);
        setActivityLog(parsedLog);
        setFilteredActivities(parsedLog);
      }

      if (voiceEnabledSetting !== null) {
        setVoiceEnabled(voiceEnabledSetting === "true");
      }

      if (speechRateSetting !== null) {
        setSpeechRate(Number(speechRateSetting));
      }

      if (darkModeSetting !== null) {
        setDarkMode(darkModeSetting === "true");
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Failed to load activity log:", error);
      setIsLoading(false);
    }
  };

  // Save activity log to AsyncStorage
  const saveActivityLog = async (newActivityLog: Activity[]) => {
    try {
      await AsyncStorage.setItem("activityLog", JSON.stringify(newActivityLog));
    } catch (error) {
      console.error("Failed to save activity log:", error);
    }
  };

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadActivityLog();
    setRefreshing(false);
  };

  // Filter activities
  const filterActivities = (category: string | null) => {
    if (!category) {
      setFilteredActivities(activityLog);
    } else {
      setFilteredActivities(
        activityLog.filter(
          (activity) =>
            activity.category === category ||
            (!activity.category && category === "Uncategorized")
        )
      );
    }
    setFilterCategory(category);
    setFilterModalVisible(false);
  };

  // Star/unstar activity
  const toggleStar = (id: string) => {
    const updatedActivities = activityLog.map((activity) => {
      if (activity.id === id) {
        return { ...activity, isStarred: !activity.isStarred };
      }
      return activity;
    });

    setActivityLog(updatedActivities);
    setFilteredActivities(
      filterCategory
        ? updatedActivities.filter(
            (a) =>
              a.category === filterCategory ||
              (!a.category && filterCategory === "Uncategorized")
          )
        : updatedActivities
    );

    if (selectedActivity && selectedActivity.id === id) {
      setSelectedActivity({
        ...selectedActivity,
        isStarred: !selectedActivity.isStarred,
      });
    }

    saveActivityLog(updatedActivities);
  };

  // Delete activity
  const deleteActivity = (id: string) => {
    const updatedActivities = activityLog.filter(
      (activity) => activity.id !== id
    );
    setActivityLog(updatedActivities);
    setFilteredActivities(
      filterCategory
        ? updatedActivities.filter(
            (a) =>
              a.category === filterCategory ||
              (!a.category && filterCategory === "Uncategorized")
          )
        : updatedActivities
    );
    saveActivityLog(updatedActivities);
    setShowDeleteConfirm(false);
    setPreviewVisible(false);

    if (voiceEnabled) {
      Speech.speak("Activity deleted", { rate: speechRate });
    }
  };

  // Delete all activities
  const deleteAllActivities = () => {
    Alert.alert(
      "Delete All Activities",
      "Are you sure you want to delete all activities? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem("activityLog");
            setActivityLog([]);
            setFilteredActivities([]);

            if (voiceEnabled) {
              Speech.speak("All activities deleted", { rate: speechRate });
            }
          },
        },
      ]
    );
  };

  // Share activity
  const shareActivity = async (activity: Activity) => {
    try {
      let message = `${activity.action || "Activity"}\n`;
      if (activity.text) {
        message += `${activity.text}\n`;
      }
      message += `${new Date(activity.timestamp || 0).toLocaleString()}`;

      // If there's an image, we'll share it too
      if (activity.imagePath) {
        if (Platform.OS === "ios") {
          // iOS can share text and images together
          await RNShare.share({
            message,
            url: activity.imagePath,
          });
        } else {
          // For Android, we need to decide whether to share image or text
          Alert.alert("Share", "What would you like to share?", [
            {
              text: "Text Only",
              onPress: () => RNShare.share({ message }),
            },
            {
              text: "Image Only",
              onPress: () => Sharing.shareAsync(activity.imagePath || ""),
            },
            { text: "Cancel", style: "cancel" },
          ]);
        }
      } else {
        // No image, just share text
        await RNShare.share({ message });
      }

      if (voiceEnabled) {
        Speech.speak("Activity shared", { rate: speechRate });
      }
    } catch (error) {
      console.error("Error sharing:", error);
      Alert.alert(
        "Sharing failed",
        "There was an error sharing this activity."
      );
    }
  };

  // Save image to gallery
  const saveImageToGallery = async (imagePath: string) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Gallery permission is required to save images"
        );
        return;
      }

      const asset = await MediaLibrary.createAssetAsync(imagePath);
      await MediaLibrary.createAlbumAsync("My Activities", asset, false);

      Alert.alert("Success", "Image saved to gallery");

      if (voiceEnabled) {
        Speech.speak("Image saved to gallery", { rate: speechRate });
      }
    } catch (error) {
      console.error("Error saving image:", error);
      Alert.alert("Save failed", "There was an error saving this image.");
    }
  };

  // Convert activity to text file and share
  const exportActivityAsText = async (activity: Activity) => {
    try {
      const fileContent = `
Activity Details
----------------
Action: ${activity.action || "N/A"}
Description: ${activity.text || "N/A"}
Date: ${new Date(activity.timestamp || 0).toLocaleString()}
Category: ${activity.category || "Uncategorized"}
Starred: ${activity.isStarred ? "Yes" : "No"}
`;

      const fileUri = `${FileSystem.cacheDirectory}activity_${activity.id}.txt`;
      await FileSystem.writeAsStringAsync(fileUri, fileContent);

      if (Platform.OS === "ios") {
        await Sharing.shareAsync(fileUri);
      } else {
        await Sharing.shareAsync(fileUri, {
          mimeType: "text/plain",
          dialogTitle: "Export Activity",
        });
      }

      if (voiceEnabled) {
        Speech.speak("Activity exported as text", { rate: speechRate });
      }
    } catch (error) {
      console.error("Error exporting activity:", error);
      Alert.alert(
        "Export failed",
        "There was an error exporting this activity."
      );
    }
  };

  // Export all activities
  const exportAllActivities = async () => {
    try {
      let fileContent = "ACTIVITY LOG\n============\n\n";

      activityLog.forEach((activity, index) => {
        fileContent += `Activity #${index + 1}\n`;
        fileContent += `Action: ${activity.action || "N/A"}\n`;
        fileContent += `Description: ${activity.text || "N/A"}\n`;
        fileContent += `Date: ${new Date(
          activity.timestamp || 0
        ).toLocaleString()}\n`;
        fileContent += `Category: ${activity.category || "Uncategorized"}\n`;
        fileContent += `Starred: ${activity.isStarred ? "Yes" : "No"}\n\n`;
        fileContent += "--------------------\n\n";
      });

      const fileUri = `${
        FileSystem.cacheDirectory
      }activity_log_${Date.now()}.txt`;
      await FileSystem.writeAsStringAsync(fileUri, fileContent);

      if (Platform.OS === "ios") {
        await Sharing.shareAsync(fileUri);
      } else {
        await Sharing.shareAsync(fileUri, {
          mimeType: "text/plain",
          dialogTitle: "Export All Activities",
        });
      }

      if (voiceEnabled) {
        Speech.speak("All activities exported", { rate: speechRate });
      }
    } catch (error) {
      console.error("Error exporting activities:", error);
      Alert.alert(
        "Export failed",
        "There was an error exporting your activities."
      );
    }
  };

  // Handle scroll event to show/hide scroll to top button
  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.y;
    setShowScrollTop(scrollPosition > 300);
  };

  // Scroll to top
  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  // Animation for modal
  useEffect(() => {
    if (previewVisible) {
      Animated.parallel([
        Animated.timing(modalAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(modalAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [previewVisible]);

  // Load data and speak when screen opens
  useEffect(() => {
    loadActivityLog();

    const checkVoiceSettings = async () => {
      const enabled = await AsyncStorage.getItem("voiceEnabled");
      const rate = await AsyncStorage.getItem("speechRate");

      if (enabled !== null) {
        setVoiceEnabled(enabled === "true");

        if (enabled === "true") {
          const speechRate = rate ? Number(rate) : 1.0;
          Speech.speak("Activity history screen opened", { rate: speechRate });
        }
      }
    };

    checkVoiceSettings();
  }, []);

  // Format date nicely
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today, ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (diffDays === 1) {
      return `Yesterday, ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (diffDays < 7) {
      return `${date.toLocaleDateString([], {
        weekday: "long",
      })}, ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else {
      return (
        date.toLocaleDateString([], {
          month: "short",
          day: "numeric",
          year: "numeric",
        }) +
        `, ${date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`
      );
    }
  };

  // Render individual activity item
  const renderActivityItem = (activity: Activity) => (
    <TouchableOpacity
      key={activity.id}
      style={[
        styles.historyItem,
        { backgroundColor: colors.card, borderColor: colors.border },
        activity.isStarred && styles.starredItem,
      ]}
      activeOpacity={0.8}
      onPress={() => {
        setSelectedActivity(activity);
        setPreviewVisible(true);
        if (voiceEnabled) {
          let speechText = `Previewing activity: ${
            activity.action || "No action"
          }.`;
          if (activity.text) {
            speechText += ` ${activity.text}`;
          }
          Speech.speak(speechText, { rate: speechRate });
        }
      }}
    >
      <View style={styles.historyItemHeader}>
        <View style={styles.activityMeta}>
          <Text style={[styles.historyAction, { color: colors.text }]}>
            {activity.action}
          </Text>
          {activity.category && (
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: colors.primary + "20" },
              ]}
            >
              <Text style={[styles.categoryText, { color: colors.primary }]}>
                {activity.category}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.dateContainer}>
          <Clock size={12} color={colors.subtext} style={{ marginRight: 4 }} />
          <Text style={[styles.historyDate, { color: colors.subtext }]}>
            {formatDate(activity.timestamp || 0)}
          </Text>
        </View>
      </View>

      {activity.imagePath && (
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: activity.imagePath }}
            style={styles.historyImage}
          />
        </View>
      )}

      {activity.text && (
        <Text
          style={[styles.activityText, { color: colors.text }]}
          numberOfLines={2}
        >
          {activity.text}
        </Text>
      )}

      <View style={styles.activityFooter}>
        <TouchableOpacity
          style={[styles.actionIconButton, { borderColor: colors.border }]}
          onPress={() => shareActivity(activity)}
        >
          <Share2 size={16} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionIconButton, { borderColor: colors.border }]}
          onPress={() => toggleStar(activity.id)}
        >
          <Star
            size={16}
            color={activity.isStarred ? "#FFD700" : colors.subtext}
            fill={activity.isStarred ? "#FFD700" : "transparent"}
          />
        </TouchableOpacity>
      </View>

      {activity.isStarred && (
        <View style={styles.starBadge}>
          <Star size={12} color="#FFFFFF" fill="#FFFFFF" />
        </View>
      )}
    </TouchableOpacity>
  );

  // Group activities by date
  const groupActivitiesByDate = () => {
    const groups: { [key: string]: Activity[] } = {};

    filteredActivities.forEach((activity) => {
      if (!activity.timestamp) return;

      const date = new Date(activity.timestamp);
      const dateStr = date.toLocaleDateString([], {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }

      groups[dateStr].push(activity);
    });

    return groups;
  };

  const groupedActivities = groupActivitiesByDate();
  const sortedDates = Object.keys(groupedActivities).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={darkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.headerLeft}>
          {/* <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              if (voiceEnabled) {
                Speech.speak("Going back", { rate: speechRate });
              }
              router.back();
            }}
          >
            <ArrowLeft color="#FFFFFF" size={24} />
          </TouchableOpacity> */}
          <Text style={styles.headerTitle}>Activity History</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setFilterModalVisible(true)}
          >
            <Filter color="#FFFFFF" size={20} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {
              if (activityLog.length > 0) {
                Alert.alert("Export Options", "What would you like to do?", [
                  {
                    text: "Export All Activities",
                    onPress: exportAllActivities,
                  },
                  {
                    text: "Delete All Activities",
                    style: "destructive",
                    onPress: deleteAllActivities,
                  },
                  { text: "Cancel", style: "cancel" },
                ]);
              } else {
                Alert.alert(
                  "No Activities",
                  "There are no activities to export."
                );
              }
            }}
          >
            <FileText color="#FFFFFF" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.historyContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.text }]}>
              Loading activities...
            </Text>
          </View>
        ) : (
          <>
            {filteredActivities.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <BookOpen
                  size={60}
                  color={colors.subtext}
                  style={{ marginBottom: 16 }}
                />
                <Text style={[styles.emptyHistory, { color: colors.subtext }]}>
                  No activities found
                </Text>
                {filterCategory && (
                  <TouchableOpacity
                    style={[
                      styles.clearFilterButton,
                      { backgroundColor: colors.primary },
                    ]}
                    onPress={() => filterActivities(null)}
                  >
                    <Text style={styles.clearFilterText}>Clear Filter</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <ScrollView
                ref={scrollViewRef}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[colors.primary]}
                    tintColor={colors.primary}
                  />
                }
                onScroll={handleScroll}
                scrollEventThrottle={16}
              >
                {filterCategory && (
                  <View
                    style={[
                      styles.filterBanner,
                      { backgroundColor: colors.primary + "20" },
                    ]}
                  >
                    <Text style={[styles.filterText, { color: colors.text }]}>
                      Filtered by: {filterCategory}
                    </Text>
                    <TouchableOpacity
                      style={styles.clearFilterIcon}
                      onPress={() => filterActivities(null)}
                    >
                      <X size={16} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                )}

                {sortedDates.map((dateStr) => (
                  <View key={dateStr}>
                    <View style={styles.dateHeader}>
                      <Calendar
                        size={16}
                        color={colors.primary}
                        style={{ marginRight: 8 }}
                      />
                      <Text
                        style={[styles.dateHeaderText, { color: colors.text }]}
                      >
                        {dateStr}
                      </Text>
                    </View>
                    {groupedActivities[dateStr]
                      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
                      .map((activity) => renderActivityItem(activity))}
                  </View>
                ))}
              </ScrollView>
            )}
          </>
        )}
      </View>

      {/* Scroll to top button */}
      {showScrollTop && (
        <TouchableOpacity
          style={[styles.scrollTopButton, { backgroundColor: colors.primary }]}
          onPress={scrollToTop}
        >
          <ArrowUp size={20} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {/* Activity Preview Modal */}
      <Modal
        visible={previewVisible}
        transparent={true}
        animationType="none"
        onRequestClose={() => setPreviewVisible(false)}
      >
        <Animated.View
          style={[
            styles.modalOverlay,
            {
              backgroundColor: colors.overlay,
              opacity: modalAnim,
            },
          ]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setPreviewVisible(false)}
          />

          <Animated.View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Activity Details
                </Text>
                {selectedActivity?.isStarred && (
                  <Star
                    size={16}
                    color="#FFD700"
                    fill="#FFD700"
                    style={{ marginLeft: 8 }}
                  />
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.closeButton,
                  { backgroundColor: colors.background },
                ]}
                onPress={() => setPreviewVisible(false)}
              >
                <X size={18} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedActivity?.imagePath && (
              <View style={styles.previewImageContainer}>
                <Image
                  source={{ uri: selectedActivity.imagePath }}
                  style={styles.previewImage}
                  resizeMode="contain"
                />
              </View>
            )}

            <ScrollView style={styles.modalBody}>
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: colors.subtext }]}>
                  Action
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {selectedActivity?.action || "No action"}
                </Text>
              </View>

              {selectedActivity?.text && (
                <View style={styles.detailItem}>
                  <Text style={[styles.detailLabel, { color: colors.subtext }]}>
                    Description
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {selectedActivity.text}
                  </Text>
                </View>
              )}

              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: colors.subtext }]}>
                  Date & Time
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {selectedActivity?.timestamp
                    ? new Date(selectedActivity.timestamp).toLocaleString()
                    : "Unknown date"}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: colors.subtext }]}>
                  Category
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {selectedActivity?.category || "Uncategorized"}
                </Text>
              </View>
            </ScrollView>

            <View
              style={[styles.modalFooter, { borderTopColor: colors.border }]}
            >
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: colors.background },
                  ]}
                  onPress={() => toggleStar(selectedActivity?.id || "")}
                >
                  <Star
                    size={20}
                    color={
                      selectedActivity?.isStarred ? "#FFD700" : colors.subtext
                    }
                    fill={
                      selectedActivity?.isStarred ? "#FFD700" : "transparent"
                    }
                  />
                  <Text
                    style={[styles.actionButtonText, { color: colors.text }]}
                  >
                    {selectedActivity?.isStarred ? "Unstar" : "Star"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: colors.background },
                  ]}
                  onPress={() => {
                    if (selectedActivity) {
                      shareActivity(selectedActivity);
                    }
                  }}
                >
                  <Share2 size={20} color={colors.primary} />
                  <Text
                    style={[styles.actionButtonText, { color: colors.text }]}
                  >
                    Share
                  </Text>
                </TouchableOpacity>

                {selectedActivity?.imagePath && (
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { backgroundColor: colors.background },
                    ]}
                    onPress={() => {
                      if (selectedActivity?.imagePath) {
                        saveImageToGallery(selectedActivity.imagePath);
                      }
                    }}
                  >
                    <Download size={20} color={colors.primary} />
                    <Text
                      style={[styles.actionButtonText, { color: colors.text }]}
                    >
                      Save
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: colors.background },
                  ]}
                  onPress={() => {
                    if (selectedActivity) {
                      exportActivityAsText(selectedActivity);
                    }
                  }}
                >
                  <FileText size={20} color={colors.primary} />
                  <Text
                    style={[styles.actionButtonText, { color: colors.text }]}
                  >
                    Export
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: colors.background },
                  ]}
                  onPress={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 size={20} color="#FF3B30" />
                  <Text style={[styles.actionButtonText, { color: "#FF3B30" }]}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <View style={styles.confirmModalOverlay}>
          <View
            style={[
              styles.confirmModalContent,
              { backgroundColor: colors.card },
            ]}
          >
            <Text style={[styles.confirmModalTitle, { color: colors.text }]}>
              Delete Activity
            </Text>
            <Text
              style={[styles.confirmModalMessage, { color: colors.subtext }]}
            >
              Are you sure you want to delete this activity? This action cannot
              be undone.
            </Text>
            <View style={styles.confirmModalActions}>
              <TouchableOpacity
                style={[
                  styles.confirmModalButton,
                  { borderColor: colors.border },
                ]}
                onPress={() => setShowDeleteConfirm(false)}
              >
                <Text
                  style={[
                    styles.confirmModalButtonText,
                    { color: colors.primary },
                  ]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmModalButton,
                  { backgroundColor: "#FF3B30" },
                ]}
                onPress={() => {
                  if (selectedActivity) {
                    deleteActivity(selectedActivity.id);
                  }
                }}
              >
                <Text
                  style={[styles.confirmModalButtonText, { color: "#FFFFFF" }]}
                >
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.filterModalOverlay}>
          <View
            style={[
              styles.filterModalContent,
              { backgroundColor: colors.card },
            ]}
          >
            <View style={styles.filterModalHeader}>
              <Text style={[styles.filterModalTitle, { color: colors.text }]}>
                Filter Activities
              </Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.filterModalBody}>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  filterCategory === null && styles.selectedFilterOption,
                ]}
                onPress={() => filterActivities(null)}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    {
                      color:
                        filterCategory === null
                          ? colors.primary
                          : colors.subtext,
                    },
                  ]}
                >
                  All Categories
                </Text>
                {filterCategory === null && (
                  <CheckCircle size={16} color={colors.primary} />
                )}
              </TouchableOpacity>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.filterOption,
                    filterCategory === category && styles.selectedFilterOption,
                  ]}
                  onPress={() => filterActivities(category)}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      {
                        color:
                          filterCategory === category
                            ? colors.primary
                            : colors.subtext,
                      },
                    ]}
                  >
                    {category}
                  </Text>
                  {filterCategory === category && (
                    <CheckCircle size={16} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 32,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    marginLeft: 16,
  },
  historyContainer: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyHistory: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 8,
  },
  clearFilterButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  clearFilterText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  filterBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    marginBottom: 16,
    borderRadius: 4,
  },
  filterText: {
    flex: 1,
    fontSize: 14,
  },
  clearFilterIcon: {
    padding: 4,
  },
  dateHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  dateHeaderText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  historyItem: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  starredItem: {
    borderColor: "#FFD700",
  },
  historyItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  activityMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  historyAction: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
  categoryBadge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  categoryText: {
    fontSize: 12,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  historyDate: {
    fontSize: 12,
  },
  imageWrapper: {
    marginBottom: 8,
  },
  historyImage: {
    width: SCREEN_WIDTH - 64,
    height: 200,
    borderRadius: 8,
  },
  activityText: {
    fontSize: 14,
    lineHeight: 20,
  },
  activityFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  actionIconButton: {
    padding: 8,
    borderRadius: 4,
    marginLeft: 8,
    borderWidth: 1,
  },
  starBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#FFD700",
    borderRadius: 4,
    padding: 4,
  },
  scrollTopButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    padding: 12,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: SCREEN_WIDTH - 32,
    maxHeight: "90%",
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 8,
    borderRadius: 24,
  },
  previewImageContainer: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  previewImage: {
    width: "100%",
    height: 250,
  },
  modalBody: {
    padding: 16,
  },
  detailItem: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
  },
  modalFooter: {
    borderTopWidth: 1,
    padding: 16,
  },
  actionButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
    borderWidth: 1,
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 14,
  },
  confirmModalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.75)",
  },
  confirmModalContent: {
    width: SCREEN_WIDTH - 64,
    padding: 16,
    borderRadius: 8,
  },
  confirmModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  confirmModalMessage: {
    fontSize: 14,
    marginBottom: 16,
  },
  confirmModalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  confirmModalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginLeft: 8,
  },
  confirmModalButtonText: {
    fontSize: 14,
  },
  filterModalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.75)",
  },
  filterModalContent: {
    width: SCREEN_WIDTH - 64,
    maxHeight: "80%",
    padding: 16,
    borderRadius: 8,
  },
  filterModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  filterModalBody: {
    flex: 1,
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  selectedFilterOption: {
    backgroundColor: "#DF293520",
  },
  filterOptionText: {
    flex: 1,
    fontSize: 14,
  },
});

export default HistoryScreen;
