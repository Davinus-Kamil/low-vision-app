import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Animated,
  Appearance,
  Platform,
  StatusBar,
  Alert,
} from "react-native";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Speech from "expo-speech";
import { 
  Settings, 
  Volume2, 
  User, 
  Moon, 
  Bell, 
  ChevronLeft, 
  Mic, 
  Languages, 
  HelpCircle, 
  Shield, 
  Trash2, 
  LogOut, 
  ChevronRight 
} from "lucide-react-native";

const SettingsScreen = () => {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // Settings state
  const [speechRate, setSpeechRate] = useState(0.9);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [voiceFeedbackEnabled, setVoiceFeedbackEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [language, setLanguage] = useState("English");
  const [speechVoice, setSpeechVoice] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<Speech.Voice[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // Color scheme handling
  const colorScheme = darkModeEnabled ? "dark" : "light";
  const colors = {
    background: colorScheme === "dark" ? "#121212" : "#F8F9FA",
    card: colorScheme === "dark" ? "#1E1E1E" : "#FFFFFF",
    text: colorScheme === "dark" ? "#FFFFFF" : "#333333",
    subtext: colorScheme === "dark" ? "#BBBBBB" : "#666666",
    border: colorScheme === "dark" ? "#333333" : "#EEEEEE",
    primary: "#DF2935",
    accent: "#1E88E5",
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Load settings from storage
    loadSettings();
    
    // Get available voices
    fetchAvailableVoices();
    
    // Speak if voice feedback is enabled
    if (voiceFeedbackEnabled) {
      speakWithCurrentSettings("Settings page loaded");
    }
  }, []);

  const fetchAvailableVoices = async () => {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      setAvailableVoices(voices);
      console.log("Available voices:", voices);
    } catch (error) {
      console.error("Error fetching voices:", error);
    }
  };

  const loadSettings = async () => {
    try {
      const settingsData = await AsyncStorage.multiGet([
        "voiceEnabled",
        "speechRate",
        "speechPitch",
        "profileName",
        "language",
        "darkMode",
        "notifications",
        "speechVoice"
      ]);

      const settings = Object.fromEntries(settingsData);
      
      if (settings.voiceEnabled !== null) setVoiceFeedbackEnabled(settings.voiceEnabled === "true");
      if (settings.speechRate !== null) setSpeechRate(Number(settings.speechRate));
      if (settings.speechPitch !== null) setSpeechPitch(Number(settings.speechPitch));
      if (settings.profileName !== null) setProfileName(settings.profileName);
      if (settings.language !== null) setLanguage(settings.language);
      if (settings.darkMode !== null) setDarkModeEnabled(settings.darkMode === "true");
      if (settings.notifications !== null) setNotificationsEnabled(settings.notifications === "true");
      if (settings.speechVoice !== null) setSpeechVoice(settings.speechVoice);
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  interface SaveSettingsFn {
    (key: string, value: string | number | boolean | null): Promise<void>;
  }

  const saveSettings: SaveSettingsFn = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value !== null ? value.toString() : "");
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  };

  interface SpeakWithCurrentSettingsFn {
    (text: string): void;
  }

  const speakWithCurrentSettings: SpeakWithCurrentSettingsFn = (text) => {
    if (voiceFeedbackEnabled) {
      Speech.speak(text, { 
        rate: speechRate,
        pitch: speechPitch,
        voice: speechVoice ?? undefined
      });
    }
  };

  interface ToggleVoiceFeedbackFn {
    (value: boolean): void;
  }

  const toggleVoiceFeedback: ToggleVoiceFeedbackFn = (value) => {
    setVoiceFeedbackEnabled(value);
    saveSettings("voiceEnabled", value);
    if (value) {
      Speech.speak("Voice assistance enabled", { rate: speechRate, pitch: speechPitch });
    }
  };

  interface ToggleDarkModeFn {
    (value: boolean): void;
  }

  const toggleDarkMode: ToggleDarkModeFn = (value) => {
    setDarkModeEnabled(value);
    saveSettings("darkMode", value);
    speakWithCurrentSettings("Display mode changed");
  };

  interface ToggleNotificationsFn {
    (value: boolean): void;
  }

  const toggleNotifications: ToggleNotificationsFn = (value) => {
    setNotificationsEnabled(value);
    saveSettings("notifications", value);
    speakWithCurrentSettings("Notifications setting changed");
  };

  interface HandleSpeechRateChangeFn {
    (value: number): void;
  }

  const handleSpeechRateChange: HandleSpeechRateChangeFn = (value) => {
    setSpeechRate(value);
    saveSettings("speechRate", value);
  };

  const handleSpeechRateComplete = () => {
    speakWithCurrentSettings("Speech speed adjusted");
  };

  interface HandleSpeechPitchChangeFn {
    (value: number): void;
  }

  const handleSpeechPitchChange: HandleSpeechPitchChangeFn = (value) => {
    setSpeechPitch(value);
    saveSettings("speechPitch", value);
  };

  const handleSpeechPitchComplete = () => {
    speakWithCurrentSettings("Speech pitch adjusted");
  };

  interface HandleProfileNameChangeFn {
    (value: string): void;
  }

  const handleProfileNameChange: HandleProfileNameChangeFn = (value) => {
    setProfileName(value);
    saveSettings("profileName", value);
  };

  const handleProfileNameSubmit = () => {
    setIsEditing(false);
    if (profileName.trim() !== "") {
      speakWithCurrentSettings(`Profile name set to ${profileName}`);
    }
  };

  const selectLanguage = () => {
    Alert.alert(
      "Select Language",
      "Choose your preferred language",
      [
        { text: "English", onPress: () => changeLanguage("English") },
        { text: "Spanish", onPress: () => changeLanguage("Spanish") },
        { text: "French", onPress: () => changeLanguage("French") },
        { text: "German", onPress: () => changeLanguage("German") },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  interface ChangeLanguageFn {
    (lang: string): void;
  }

  const changeLanguage: ChangeLanguageFn = (lang) => {
    setLanguage(lang);
    saveSettings("language", lang);
    speakWithCurrentSettings(`Language set to ${lang}`);
  };

  const selectVoice = () => {
    if (availableVoices.length === 0) {
      Alert.alert("No voices available", "No additional voices were found on your device.");
      return;
    }
    
    // Filter some common voices for the alert (mobile can't show too many options)
    const commonVoices = availableVoices.slice(0, 5);
    
    const options = commonVoices.map(voice => ({
      text: `${voice.name} (${voice.language})`,
      onPress: () => changeVoice(voice.identifier)
    }));
    
    Alert.alert(
      "Select Voice",
      "Choose your preferred voice",
      [
        ...options,
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  interface ChangeVoiceFn {
    (voiceId: string): void;
  }

  const changeVoice: ChangeVoiceFn = (voiceId) => {
    setSpeechVoice(voiceId);
    saveSettings("speechVoice", voiceId);
    speakWithCurrentSettings("Voice changed to this voice");
  };

  const resetSettings = () => {
    Alert.alert(
      "Reset Settings",
      "Are you sure you want to reset all settings to default values?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            // Reset all settings
            setSpeechRate(0.9);
            setSpeechPitch(1.0);
            setVoiceFeedbackEnabled(true);
            setNotificationsEnabled(true);
            setDarkModeEnabled(false);
            setProfileName("");
            setLanguage("English");
            setSpeechVoice(null);
            
            // Clear AsyncStorage
            try {
              await AsyncStorage.multiRemove([
                "voiceEnabled",
                "speechRate",
                "speechPitch",
                "profileName",
                "language",
                "darkMode",
                "notifications",
                "speechVoice"
              ]);
              
              speakWithCurrentSettings("Settings reset to defaults");
            } catch (error) {
              console.error("Error resetting settings:", error);
            }
          }
        }
      ]
    );
  };

  interface RenderSettingItemProps {
    label: string;
    component: React.ReactNode;
    icon: React.ReactNode;
  }

  const renderSettingItem = (
    label: RenderSettingItemProps["label"],
    component: RenderSettingItemProps["component"],
    icon: RenderSettingItemProps["icon"]
  ): JSX.Element => (
    <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
      <View style={styles.settingLabel}>
        {icon}
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      </View>
      {component}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      
      {/* <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            speakWithCurrentSettings("Going back");
            router.back();
          }}
        >
          <ChevronLeft color={colors.primary} size={24} />
        </TouchableOpacity>
        <Text style={[styles.heading, { color: colors.text }]}>Settings</Text>
        <Settings color={colors.primary} size={24} />
      </View> */}
      
      <Animated.ScrollView 
        contentContainerStyle={styles.content}
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      >
        {/* Profile Section */}
        <View style={[styles.profileSection, { backgroundColor: colors.card }]}>
          <View style={styles.profileCircle}>
            <User size={40} color={colors.primary} />
          </View>
          
          {isEditing ? (
            <View style={styles.editNameContainer}>
              <TextInput
                style={[styles.nameInput, { color: colors.text, borderColor: colors.border }]}
                placeholder="Enter your name"
                placeholderTextColor={colors.subtext}
                value={profileName}
                onChangeText={handleProfileNameChange}
                onSubmitEditing={handleProfileNameSubmit}
                autoFocus
              />
              <TouchableOpacity 
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleProfileNameSubmit}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.profileNameContainer}
              onPress={() => setIsEditing(true)}
            >
              <Text style={[styles.profileName, { color: colors.text }]}>
                {profileName || "Set your name"}
              </Text>
              <Text style={[styles.editText, { color: colors.primary }]}>
                Edit
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Accessibility Settings */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Accessibility</Text>
          
          {renderSettingItem("Voice Feedback", 
            <Switch
              value={voiceFeedbackEnabled}
              onValueChange={toggleVoiceFeedback}
              trackColor={{ false: "#767577", true: "#f1c0c0" }}
              thumbColor={voiceFeedbackEnabled ? colors.primary : "#f4f3f4"}
            />,
            <Volume2 size={20} color={colors.primary} style={styles.icon} />
          )}
          
          {voiceFeedbackEnabled && (
            <>
              {renderSettingItem("Speech Rate", 
                <View style={styles.sliderContainer}>
                  <Slider
                    value={speechRate}
                    onValueChange={handleSpeechRateChange}
                    onSlidingComplete={handleSpeechRateComplete}
                    minimumValue={0.5}
                    maximumValue={2.0}
                    step={0.1}
                    minimumTrackTintColor={colors.primary}
                    maximumTrackTintColor={colors.border}
                    thumbTintColor={colors.primary}
                    style={styles.slider}
                  />
                  <Text style={[styles.value, { color: colors.subtext }]}>{speechRate.toFixed(1)}x</Text>
                </View>,
                <Text style={[styles.subIcon, { color: colors.primary }]}>R</Text>
              )}
              
              {renderSettingItem("Speech Pitch", 
                <View style={styles.sliderContainer}>
                  <Slider
                    value={speechPitch}
                    onValueChange={handleSpeechPitchChange}
                    onSlidingComplete={handleSpeechPitchComplete}
                    minimumValue={0.5}
                    maximumValue={2.0}
                    step={0.1}
                    minimumTrackTintColor={colors.primary}
                    maximumTrackTintColor={colors.border}
                    thumbTintColor={colors.primary}
                    style={styles.slider}
                  />
                  <Text style={[styles.value, { color: colors.subtext }]}>{speechPitch.toFixed(1)}</Text>
                </View>,
                <Text style={[styles.subIcon, { color: colors.primary }]}>P</Text>
              )}
              
              {renderSettingItem("Voice Selection", 
                <TouchableOpacity 
                  style={styles.optionButton}
                  onPress={selectVoice}
                >
                  <Text style={[styles.optionValue, { color: colors.subtext }]}>
                    {speechVoice ? speechVoice.substring(0, 15) + "..." : "Default"}
                  </Text>
                  <ChevronRight size={18} color={colors.subtext} />
                </TouchableOpacity>,
                <Mic size={20} color={colors.primary} style={styles.icon} />
              )}
            </>
          )}
        </View>

        {/* Appearance Settings */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
          
          {renderSettingItem("Dark Mode", 
            <Switch
              value={darkModeEnabled}
              onValueChange={toggleDarkMode}
              trackColor={{ false: "#767577", true: "#f1c0c0" }}
              thumbColor={darkModeEnabled ? colors.primary : "#f4f3f4"}
            />,
            <Moon size={20} color={colors.primary} style={styles.icon} />
          )}
          
          {renderSettingItem("Language", 
            <TouchableOpacity 
              style={styles.optionButton}
              onPress={selectLanguage}
            >
              <Text style={[styles.optionValue, { color: colors.subtext }]}>{language}</Text>
              <ChevronRight size={18} color={colors.subtext} />
            </TouchableOpacity>,
            <Languages size={20} color={colors.primary} style={styles.icon} />
          )}
        </View>

        {/* Notifications Settings */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications</Text>
          
          {renderSettingItem("Enable Notifications", 
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: "#767577", true: "#f1c0c0" }}
              thumbColor={notificationsEnabled ? colors.primary : "#f4f3f4"}
            />,
            <Bell size={20} color={colors.primary} style={styles.icon} />
          )}
        </View>

        {/* Other Settings */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Other</Text>
          
          {renderSettingItem("Privacy Policy", 
            <TouchableOpacity 
              style={styles.optionButton}
              onPress={() => {
                speakWithCurrentSettings("Opening privacy policy");
                router.push("/");
              }}
            >
              <ChevronRight size={18} color={colors.subtext} />
            </TouchableOpacity>,
            <Shield size={20} color={colors.primary} style={styles.icon} />
          )}
          
          {renderSettingItem("Help & Support", 
            <TouchableOpacity 
              style={styles.optionButton}
              onPress={() => {
                speakWithCurrentSettings("Opening help and support");
                router.push("/");
              }}
            >
              <ChevronRight size={18} color={colors.subtext} />
            </TouchableOpacity>,
            <HelpCircle size={20} color={colors.primary} style={styles.icon} />
          )}
        </View>

        {/* Danger Zone */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: '#DF2935' }]}>Danger Zone</Text>
          
          {renderSettingItem("Reset Settings", 
            <TouchableOpacity 
              style={styles.optionButton}
              onPress={resetSettings}
            >
              <Text style={{ color: '#DF2935', fontWeight: "500" }}>Reset</Text>
            </TouchableOpacity>,
            <Trash2 size={20} color="#DF2935" style={styles.icon} />
          )}
          
          {renderSettingItem("Log Out", 
            <TouchableOpacity 
              style={styles.optionButton}
              onPress={() => {
                speakWithCurrentSettings("Logging out");
                Alert.alert("Log Out", "Are you sure you want to log out?", [
                  {
                    text: "Cancel",
                    style: "cancel"
                  },
                  {
                    text: "Log Out",
                    style: "destructive",
                    onPress: () => router.replace("/")
                  }
                ]);
              }}
            >
              <Text style={{ color: '#DF2935', fontWeight: "500" }}>Log Out</Text>
            </TouchableOpacity>,
            <LogOut size={20} color="#DF2935" style={styles.icon} />
          )}
        </View>

        <View style={styles.footer}>
          <Text style={[styles.versionText, { color: colors.subtext }]}>
            Version 1.2.5
          </Text>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  backButton: {
    padding: 4,
  },
  heading: {
    fontSize: 20,
    fontWeight: "600",
  },
  content: {
    paddingBottom: 40,
  },
  profileSection: {
    marginTop: 16,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f1f1f1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  profileNameContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    marginRight: 8,
  },
  editText: {
    fontSize: 14,
    fontWeight: "500",
  },
  editNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  nameInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
  },
  saveButton: {
    marginLeft: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  section: {
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    padding: 16,
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingLabel: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 12,
  },
  subIcon: {
    marginRight: 12,
    fontSize: 16,
    fontWeight: "bold",
    width: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
  },
  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
    marginLeft: 8,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 8,
  },
  value: {
    width: 40,
    textAlign: "right",
    fontSize: 14,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionValue: {
    marginRight: 8,
    fontSize: 14,
  },
  footer: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 16,
  },
  versionText: {
    fontSize: 14,
  },
});

export default SettingsScreen;