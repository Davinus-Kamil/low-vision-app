import React, { createContext, useState, useEffect, useContext } from 'react';
import { Appearance } from 'react-native';
import { getSettings, saveSettings } from '../../components/utils/storageUtils';
import { updateSpeechSettings } from '../../components/utils/tts';

// Create the context
const AppContext = createContext();

// Custom hook to use the app context
export const useAppContext = () => useContext(AppContext);

// App context provider component
export const AppContextProvider = ({ children }) => {
  // App settings state
  const [settings, setSettings] = useState({
    darkMode: false,
    speechEnabled: true,
    speechRate: 1.0,
  });
  
  const [isLoading, setIsLoading] = useState(true);
  
  // Theme state (controlled by system or app settings)
  const [theme, setTheme] = useState(Appearance.getColorScheme() || 'light');
  
  // Load settings on mount
  useEffect(() => {
    loadSettings();
    
    // Listen for system theme changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      // Only update if we're not overriding with app settings
      if (!settings.darkMode) {
        setTheme(colorScheme || 'light');
      }
    });
    
    return () => {
      subscription.remove();
    };
  }, []);
  
  // Update theme when darkMode setting changes
  useEffect(() => {
    if (settings.darkMode) {
      setTheme('dark');
    } else {
      // Use system setting
      setTheme(Appearance.getColorScheme() || 'light');
    }
  }, [settings.darkMode]);

  // Update speech settings when they change
  useEffect(() => {
    updateSpeechSettings(settings);
  }, [settings.speechEnabled, settings.speechRate]);
  
  // Load settings from storage
  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const savedSettings = await getSettings();
      setSettings(savedSettings);
      
      // Set initial theme based on settings
      if (savedSettings.darkMode) {
        setTheme('dark');
      }

      // Update speech settings
      updateSpeechSettings(savedSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update settings
  const updateSettings = async (newSettings) => {
    try {
      setSettings(newSettings);
      await saveSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };
  
  // Toggle dark mode
  const toggleDarkMode = async () => {
    const newSettings = { ...settings, darkMode: !settings.darkMode };
    await updateSettings(newSettings);
  };
  
  // Toggle speech feedback
  const toggleSpeech = async () => {
    const newSettings = { ...settings, speechEnabled: !settings.speechEnabled };
    await updateSettings(newSettings);
  };
  
  // Update speech rate
  const updateSpeechRate = async (rate) => {
    const newSettings = { ...settings, speechRate: rate };
    await updateSettings(newSettings);
  };
  
  // Reset settings to default
  const resetSettings = async () => {
    const defaultSettings = {
      darkMode: false,
      speechEnabled: true,
      speechRate: 1.0,
    };
    await updateSettings(defaultSettings);
  };
  
  // The context value that will be provided
  const contextValue = {
    settings,
    theme,
    isLoading,
    toggleDarkMode,
    toggleSpeech,
    updateSpeechRate,
    resetSettings,
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};