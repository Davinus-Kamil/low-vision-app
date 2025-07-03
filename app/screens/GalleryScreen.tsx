import React, { useEffect, useState } from 'react';
import { View, FlatList, Image, TouchableOpacity, Modal, Text, StyleSheet, Dimensions, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const numColumns = 3;
const screenWidth = Dimensions.get('window').width;
const imageSize = screenWidth / numColumns - 8;

type Activity = {
  id: string;
  text: string;
  imagePath?: string;
  action?: string;
  timestamp?: number;
  gallerySaved?: boolean;
};

export default function GalleryScreen() {
  const [images, setImages] = useState<Activity[]>([]);
  const [selectedImage, setSelectedImage] = useState<Activity | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const log = await AsyncStorage.getItem('activityLog');
      const activityLog: Activity[] = log ? JSON.parse(log) : [];
      // Only show activities with imagePath
      setImages(activityLog.filter((a: Activity) => a.imagePath));
    } catch (error) {
      console.error('Error loading gallery:', error);
    }
  };

  const handleImagePress = (item: Activity) => {
    setSelectedImage(item);
    setModalVisible(true);
  };

  const handleSaveToGallery = async () => {
    if (!selectedImage) return;
    try {
      // Mark as saved to gallery (optional, for demo)
      const log = await AsyncStorage.getItem('activityLog');
      let activityLog: Activity[] = log ? JSON.parse(log) : [];
      activityLog = activityLog.map((a: Activity) =>
        a.id === selectedImage.id ? { ...a, gallerySaved: true } : a
      );
      await AsyncStorage.setItem('activityLog', JSON.stringify(activityLog));
      Alert.alert('Saved', 'Image saved to gallery!');
      setModalVisible(false);
      loadImages();
    } catch (error) {
      console.error('Error saving to gallery:', error);
      Alert.alert('Error', 'Failed to save image to gallery.');
    }
  };

  const renderItem = ({ item }: { item: Activity }) => (
    <TouchableOpacity onPress={() => handleImagePress(item)}>
      <Image source={{ uri: item.imagePath }} resizeMode="contain" style={styles.image} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={images}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        contentContainerStyle={styles.grid}
      />
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedImage && (
              <Image source={{ uri: selectedImage.imagePath }} resizeMode="contain" style={styles.previewImage} />
            )}
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveToGallery}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  grid: {
    padding: 4,
  },
  image: {
    width: imageSize,
    height: imageSize,
    margin: 2,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '85%',
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  closeButtonText: {
    color: '#333',
    fontSize: 15,
  },
}); 