import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = 'lva_settings';

export const getSettings = async () => {
  try {
    const settingsString = await AsyncStorage.getItem(SETTINGS_KEY);
    return settingsString ? JSON.parse(settingsString) : {
      // Default settings
      darkMode: false,
      speechEnabled: true,
      speechRate: 1.0,
    };
  } catch (error) {
    console.error('Error getting settings:', error);
    return {
      darkMode: false,
      speechEnabled: true,
      speechRate: 1.0,
    };
  }
};

export const saveSettings = async (settings) => {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
};