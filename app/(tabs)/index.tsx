import React from 'react';
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import * as Speech from 'expo-speech';
import { useRouter } from 'expo-router';

const App = () => {
  const router = useRouter();
  const speak = (text: string): void => {
    Speech.speak(text, { rate: 0.9, pitch: 1.0 });
  };
  const welcome = () => {
    Speech.speak('Welcome to Low Vision, your companion app designed to make digital content more accessible. Whether you are reading, navigating, or exploring, we have got you covered.');
    router.push('/camera'); // Navigate to the home screen
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.appName}>Low Vision</Text>
        <Text style={styles.tagline}>Empowering accessibility for everyone </Text>
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        <Text style={styles.description}>
          Welcome to Low Vision, your companion app designed to make digital content more accessible. 
          Whether you're reading, navigating, or exploring, we've got you covered.
        </Text>
      </View>

      {/* Call to Action Button */}
      <TouchableOpacity style={styles.button} onPress={welcome}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Light theme background
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#DF2935', // Dark text for contrast
  },
  tagline: {
    fontSize: 18,
    color: '#666666', // Slightly lighter text for secondary info
    marginTop: 5,
  },
  content: {
    alignItems: 'center',
    marginBottom: 30,
  },
  description: {
    fontSize: 16,
    color: '#444444', // Medium-dark text for readability
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#DF2935', // Primary button color
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF', // White text for contrast
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default App;