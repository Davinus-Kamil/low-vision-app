import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  StatusBar, 
  ScrollView,
  ActivityIndicator
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Save, History, Image as ImageIcon, X, Settings, Info } from 'lucide-react-native';

const App = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activityLog, setActivityLog] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Load activity log on mount
  useEffect(() => {
    loadActivityLog();
  }, []);

  // Provide voice feedback
  interface Activity {
    id: string;
    action: string;
    imagePath: string;
    timestamp: string;
  }

  const speak = (text: string): void => {
    Speech.speak(text, { rate: 0.9, pitch: 1.0 });
  };

  // Load stored activity log
  const loadActivityLog = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('activityLog');
      if (jsonValue !== null) {
        setActivityLog(JSON.parse(jsonValue));
      }
    } catch (error) {
      console.error('Failed to load activity log:', error);
      speak('Error loading activity history');
    }
  };

  // Save activity to log
  interface SaveActivityParams {
    action: string;
    imagePath: string;
  }

  const saveToActivityLog = async (
    action: SaveActivityParams['action'],
    imagePath: SaveActivityParams['imagePath']
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
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('activityLog', JSON.stringify(updatedLog));
    } catch (error) {
      console.error('Failed to save activity:', error);
      speak('Error saving activity');
    }
  };

  // Handle image picking from gallery
  const pickImage = async () => {
    speak('Opening image gallery');
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        speak('Image selected');
        saveToActivityLog('Selected image', result.assets[0].uri);
      } else {
        speak('Image selection cancelled');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      speak('Error selecting image');
    }
  };

  // Handle camera access
  const takePhoto = async () => {
    speak('Opening camera');
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        speak('Camera permission denied');
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        speak('Photo taken');
        saveToActivityLog('Captured photo', result.assets[0].uri);
      } else {
        speak('Photo capture cancelled');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      speak('Error accessing camera');
    }
  };

  // Save image to local file system
  const saveImage = async () => {
    if (!selectedImage) {
      speak('No image to save');
      return;
    }

    speak('Saving image');
    setLoading(true);
    
    try {
      const fileName = `image_${Date.now()}.jpg`;
      const newPath = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.copyAsync({
        from: selectedImage,
        to: newPath
      });
      
      saveToActivityLog('Saved image', newPath);
      speak('Image saved successfully');
    } catch (error) {
      console.error('Error saving image:', error);
      speak('Failed to save image');
    } finally {
      setLoading(false);
    }
  };

  // Clear selected image
  const clearImage = () => {
    setSelectedImage(null);
    speak('Image cleared');
  };

  // Toggle history view
  const toggleHistory = () => {
    setShowHistory(!showHistory);
    speak(showHistory ? 'Closing history' : 'Opening history');
  };
  // Toggle for setting button
  const togglesetting = () => {
    speak('Settings not implemented yet');
  };
  const toggleinfo = () => {
    speak('Info not implemented yet');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Image Saver</Text>
        <TouchableOpacity 
          style={styles.historyButton} 
          onPress={toggleHistory}
          accessibilityLabel="Toggle history view"
          accessibilityHint="Shows or hides your image saving history">
          <History color="#ffffff" size={24} />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      {showHistory ? (
        <ScrollView style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Activity History</Text>
          {activityLog.length === 0 ? (
            <Text style={styles.emptyHistory}>No activity yet</Text>
          ) : (
            activityLog.map(activity => (
              <View key={activity.id} style={styles.historyItem}>
                <View style={styles.historyItemHeader}>
                  <Text style={styles.historyAction}>{activity.action}</Text>
                  <Text style={styles.historyDate}>
                    {new Date(activity.timestamp).toLocaleDateString()} {new Date(activity.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
                {activity.imagePath && (
                  <Image source={{ uri: activity.imagePath }} style={styles.historyImage} />
                )}
              </View>
            )).reverse()
          )}
        </ScrollView>
      ) : (
        <View style={styles.mainContent}>
          {/* Image Preview Area */}
          <View style={styles.imageContainer}>
            {selectedImage ? (
              <View style={styles.selectedImageContainer}>
                <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
                <TouchableOpacity 
                  style={styles.clearButton} 
                  onPress={clearImage}
                  accessibilityLabel="Clear image"
                  accessibilityHint="Removes the current image from view">
                  <X color="#ffffff" size={20} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.placeholderContainer}>
                <ImageIcon color="#cccccc" size={80} />
                <Text style={styles.placeholderText}>Select or take a photo </Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={pickImage}
              accessibilityLabel="Select image from gallery"
              accessibilityHint="Opens your photo gallery to select an image">
              <ImageIcon color="#ffffff" size={24} />
              <Text style={styles.actionButtonText}>Gallery</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={takePhoto}
              accessibilityLabel="Take photo with camera"
              accessibilityHint="Opens your camera to take a new photo">
              <Camera color="#ffffff" size={24} />
              <Text style={styles.actionButtonText}>Camera</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, !selectedImage && styles.disabledButton]} 
              onPress={saveImage}
              disabled={!selectedImage || loading}
              accessibilityLabel="Save image"
              accessibilityHint="Saves the current image to your device">
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Save color="#ffffff" size={24} />
              )}
              <Text style={styles.actionButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={toggleHistory}
          accessibilityLabel="Home"
          accessibilityHint="Return to main screen">
          <Camera color={!showHistory ? "#DF2935" : "#777777"} size={24} />
          <Text style={[styles.navText, !showHistory && styles.activeNavText]}>Capture</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navButton} 
          onPress={toggleHistory}
          accessibilityLabel="History"
          accessibilityHint="View your saved image history">
          <History color={showHistory ? "#DF2935" : "#777777"} size={24} />
          <Text style={[styles.navText, showHistory && styles.activeNavText]}>History</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navButton}
          onPress={togglesetting}
          accessibilityLabel="Settings"
          accessibilityHint="Open application settings">
          <Settings color="#777777" size={24} />
          <Text style={styles.navText}>Settings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navButton}
          onPress={toggleinfo}
          accessibilityLabel="Info"
          accessibilityHint="View application information">
          <Info color="#777777" size={24} />
          <Text style={styles.navText}>Info</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#DF2935',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
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
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  selectedImageContainer: {
    flex: 1,
    position: 'relative',
  },
  selectedImage: {
    flex: 1,
    resizeMode: 'contain',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#aaaaaa',
    marginTop: 12,
    fontSize: 16,
  },
  clearButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  actionButton: {
    backgroundColor: '#DF2935',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  disabledButton: {
    backgroundColor: '#a0a0a0',
    opacity: 0.7,
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
    color: '#777777',
  },
  activeNavText: {
    color: '#DF2935',
    fontWeight: '600',
  },
  historyContainer: {
    flex: 1,
    padding: 16,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333333',
  },
  historyItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  historyItemHeader: {
    padding: 12,
  },
  historyAction: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  historyDate: {
    fontSize: 12,
    color: '#777777',
    marginTop: 4,
  },
  historyImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  emptyHistory: {
    textAlign: 'center',
    color: '#777777',
    marginTop: 24,
    fontSize: 16,
  },
});

export default App;