import * as Speech from 'expo-speech';

let currentSpeech = null;
let currentSettings = {
  speechEnabled: true,
  speechRate: 1.0
};

// Function to update settings
export const updateSpeechSettings = (settings) => {
  currentSettings = settings;
};

/**
 * Speaks the provided text using the device's text-to-speech engine
 * @param {string} text - The text to be spoken
 * @param {Object} options - Optional parameters for speech (rate, pitch, etc.)
 */
export const speak = (text) => {
  if (currentSettings.speechEnabled) {
    // Stop any ongoing speech
    if (currentSpeech) {
      Speech.stop();
    }
    
    // Start new speech
    currentSpeech = Speech.speak(text, {
      rate: currentSettings.speechRate,
      pitch: 1.0,
      language: 'en',
      onDone: () => {
        currentSpeech = null;
      },
      onError: (error) => {
        console.error('Speech error:', error);
        currentSpeech = null;
      }
    });
  }
};

/**
 * Stops any ongoing speech
 */
export const stopSpeech = async () => {
  try {
    await Speech.stop();
    currentSpeech = null;
  } catch (error) {
    console.error('Error stopping speech:', error);
  }
};