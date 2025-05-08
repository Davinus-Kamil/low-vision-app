import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImageManipulator from 'expo-image-manipulator';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, router } from 'expo-router';

type EditParams = {
  imageUri?: string;
};

const EditScreen = () => {
  const params = useLocalSearchParams<EditParams>();
  const [imageUri, setImageUri] = useState<string | null>(params.imageUri || null);
  const [originalUri, setOriginalUri] = useState<string | null>(params.imageUri || null);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('adjust'); // 'adjust', 'filter', 'crop'

  const pickImage = async () => {
    // Request permission to access gallery
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Gallery permissions are needed to select an image');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      if (result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
        setOriginalUri(result.assets[0].uri);
      }
    }
  };

  useEffect(() => {
    if (!imageUri) {
      // If no image is passed via params, open the gallery picker
      pickImage();
    }
  }, [imageUri]);

  const applyChanges = async () => {
    if (!imageUri) return;
    
    setIsProcessing(true);
    try {
      // Convert slider values to image manipulation values
      const brightnessValue = 1 + brightness * 0.02; // e.g. 0.8 to 1.2
      const contrastValue = 1 + contrast * 0.02;
      const saturationValue = 1 + saturation * 0.02;
      
      const result = await ImageManipulator.manipulateAsync(
        originalUri || '',
        [
          ...(brightness !== 0 ? [{ brightness: brightnessValue }] : []),
          ...(contrast !== 0 ? [{ contrast: contrastValue }] : []),
          ...(saturation !== 0 ? [{ saturation: saturationValue }] : []),
        ],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      
      setImageUri(result.uri);
    } catch (error) {
      console.error('Error applying changes:', error);
      Alert.alert('Error', 'Failed to apply changes');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetChanges = () => {
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
    setImageUri(originalUri);
  };

  const saveImage = async () => {
    if (!imageUri) return;
    
    try {
      setIsProcessing(true);
      await MediaLibrary.saveToLibraryAsync(imageUri);
      Alert.alert(
        'Success',
        'Image saved to gallery',
        [{ text: 'OK', onPress: () => router.push('../gallery') }]
      );
    } catch (error) {
      console.error('Error saving image:', error);
      Alert.alert('Error', 'Failed to save image');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderAdjustTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>Brightness</Text>
        <Slider
          style={styles.slider}
          minimumValue={-10}
          maximumValue={10}
          step={1}
          value={brightness}
          onValueChange={setBrightness}
          minimumTrackTintColor="#2196F3"
          maximumTrackTintColor="#CCCCCC"
          thumbTintColor="#2196F3"
        />
        <Text style={styles.sliderValue}>{brightness}</Text>
      </View>
      
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>Contrast</Text>
        <Slider
          style={styles.slider}
          minimumValue={-10}
          maximumValue={10}
          step={1}
          value={contrast}
          onValueChange={setContrast}
          minimumTrackTintColor="#2196F3"
          maximumTrackTintColor="#CCCCCC"
          thumbTintColor="#2196F3"
        />
        <Text style={styles.sliderValue}>{contrast}</Text>
      </View>
      
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>Saturation</Text>
        <Slider
          style={styles.slider}
          minimumValue={-10}
          maximumValue={10}
          step={1}
          value={saturation}
          onValueChange={setSaturation}
          minimumTrackTintColor="#2196F3"
          maximumTrackTintColor="#CCCCCC"
          thumbTintColor="#2196F3"
        />
        <Text style={styles.sliderValue}>{saturation}</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.applyButton} 
        onPress={applyChanges}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Apply Changes</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.resetButton} onPress={resetChanges}>
        <Text style={styles.resetButtonText}>Reset</Text>
      </TouchableOpacity>
    </View>
  );

  // Placeholder for filter and crop tabs...
  const renderFilterTab = () => (
    <View style={styles.tabContent}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
        {['Original', 'Mono', 'Sepia', 'Vintage', 'Cool', 'Warm'].map((filter) => (
          <TouchableOpacity key={filter} style={styles.filterOption}>
            <View style={styles.filterPreview}>
              <Text style={styles.filterPreviewText}>{filter[0]}</Text>
            </View>
            <Text style={styles.filterName}>{filter}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Text style={styles.comingSoonText}>Filter functionality coming soon</Text>
    </View>
  );

  const renderCropTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.comingSoonText}>Crop functionality coming soon</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Image</Text>
        <TouchableOpacity onPress={saveImage} disabled={isProcessing}>
          <MaterialIcons name="save-alt" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>

      <View style={styles.imageContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <ActivityIndicator size="large" color="#2196F3" />
        )}
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'adjust' && styles.activeTab]} 
          onPress={() => setActiveTab('adjust')}
        >
          <Ionicons name="options" size={20} color={activeTab === 'adjust' ? '#2196F3' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'adjust' && styles.activeTabText]}>Adjust</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'filter' && styles.activeTab]}
          onPress={() => setActiveTab('filter')}
        >
          <MaterialIcons name="filter" size={20} color={activeTab === 'filter' ? '#2196F3' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'filter' && styles.activeTabText]}>Filter</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'crop' && styles.activeTab]}
          onPress={() => setActiveTab('crop')}
        >
          <MaterialIcons name="crop" size={20} color={activeTab === 'crop' ? '#2196F3' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'crop' && styles.activeTabText]}>Crop</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'adjust' && renderAdjustTab()}
      {activeTab === 'filter' && renderFilterTab()}
      {activeTab === 'crop' && renderCropTab()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  image: { width: '100%', height: '100%', resizeMode: 'contain' },
  tabs: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#EEEEEE' },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#2196F3' },
  tabText: { marginLeft: 5, color: '#666' },
  activeTabText: { color: '#2196F3' },
  tabContent: { padding: 15 },
  sliderContainer: { marginBottom: 15, flexDirection: 'row', alignItems: 'center' },
  sliderLabel: { width: 90, fontSize: 14, color: '#333' },
  slider: { flex: 1, height: 40 },
  sliderValue: { width: 30, textAlign: 'right', fontSize: 14, color: '#666' },
  applyButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '500' },
  resetButton: {
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  resetButtonText: { color: '#666', fontSize: 16 },
  filtersScroll: { flexDirection: 'row', paddingVertical: 10 },
  filterOption: { alignItems: 'center', marginRight: 16 },
  filterPreview: {
    width: 60,
    height: 60,
    borderRadius: 5,
    backgroundColor: '#EEEEEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  filterPreviewText: { fontSize: 18, fontWeight: 'bold', color: '#999' },
  filterName: { fontSize: 12, color: '#666' },
  comingSoonText: { textAlign: 'center', marginTop: 20, color: '#999', fontStyle: 'italic' },
});

export default EditScreen;