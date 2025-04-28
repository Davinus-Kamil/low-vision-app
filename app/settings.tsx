import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  TextInput,
} from "react-native";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import { speak } from "../components/utils/tts"; // assuming you have this util
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Speech from "expo-speech";

const SettingsScreen = () => {
  const router = useRouter();

  const [speechRate, setSpeechRate] = useState(0.9);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [voiceFeedbackEnabled, setVoiceFeedbackEnabled] = useState(true);
  const [profileName, setProfileName] = useState("");

  useEffect(() => {
    speak("Settings page loaded");
    (async () => {
      const enabled = await AsyncStorage.getItem("voiceEnabled");
      const rate = await AsyncStorage.getItem("speechRate");
      const name = await AsyncStorage.getItem("profileName");
      if (enabled !== null) setVoiceFeedbackEnabled(enabled === "true");
      if (rate !== null) setSpeechRate(Number(rate));
      if (name !== null) setProfileName(name);
    })();
  }, []);

  const toggleVoiceFeedback = async (value: boolean) => {
    setVoiceFeedbackEnabled(value);
    await AsyncStorage.setItem("voiceEnabled", value.toString());
    if (value) {
      Speech.speak("Voice assistance enabled", { rate: speechRate });
    }
  };

  const handleSpeechRateChange = async (value: number) => {
    setSpeechRate(value);
    await AsyncStorage.setItem("speechRate", value.toString());
    if (voiceFeedbackEnabled) {
      Speech.speak("Speech speed changed", { rate: value });
    }
  };

  const handleProfileNameChange = async (value: string) => {
    setProfileName(value);
    await AsyncStorage.setItem("profileName", value);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Settings</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          value={profileName}
          onChangeText={handleProfileNameChange}
        />

        <View style={styles.settingItem}>
          <Text style={styles.label}>Voice Feedback</Text>
          <Switch
            value={voiceFeedbackEnabled}
            onValueChange={toggleVoiceFeedback}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.label}>Speech Rate</Text>
          <Slider
            value={speechRate}
            onValueChange={handleSpeechRateChange}
            minimumValue={0.5}
            maximumValue={2.0}
            step={0.1}
            minimumTrackTintColor="#DF2935"
            style={styles.slider}
          />
          <Text style={styles.value}>{speechRate.toFixed(1)}</Text>
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.label}>Speech Pitch</Text>
          <Slider
            value={speechPitch}
            onValueChange={setSpeechPitch}
            minimumValue={0.5}
            maximumValue={2.0}
            step={0.1}
            minimumTrackTintColor="#DF2935"
            style={styles.slider}
          />
          <Text style={styles.value}>{speechPitch.toFixed(1)}</Text>
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 24,
  },
  settingItem: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
  slider: {
    height: 40,
  },
  value: {
    fontSize: 14,
    marginTop: 4,
    color: "#555",
  },
  backButton: {
    marginTop: 32,
    backgroundColor: "#DF2935",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 24,
    fontSize: 16,
    color: "#222",
  },
});

export default SettingsScreen;
