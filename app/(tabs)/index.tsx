import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Modal,
  StatusBar,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import {
  Trash2,
  ZoomIn,
  Share2,
  PlusCircle,
  Camera,
  Image as ImageIcon,
  ArrowLeft,
  X,
  Info,
} from "lucide-react-native";
import * as Sharing from "expo-sharing";
import * as Speech from "expo-speech";
import { BlurView } from "expo-blur";

const { width, height } = Dimensions.get("window");
const IMAGE_DIR = FileSystem.documentDirectory + "saved_images/";
const THUMBNAIL_SIZE = width / 3 - 16;

export default function ImageUploader() {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageViewMode, setImageViewMode] = useState(false);
  const [infoVisible, setInfoVisible] = useState(false);

  useEffect(() => {
    loadSavedImages();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    await ImagePicker.requestCameraPermissionsAsync();
    await ImagePicker.requestMediaLibraryPermissionsAsync();
  };

  const loadSavedImages = async () => {
    try {
      setLoading(true);
      const dirInfo = await FileSystem.getInfoAsync(IMAGE_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(IMAGE_DIR, { intermediates: true });
      }

      const files = await FileSystem.readDirectoryAsync(IMAGE_DIR);
      const uris = files.map((file) => IMAGE_DIR + file);
      setImages(uris);
    } catch (error) {
      console.error("Error loading images:", error);
      Speech.speak("Failed to load images");
      Alert.alert("Error", "Could not load your saved images.");
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async (fromCamera: boolean) => {
    try {
      setLoading(true);
      const result = fromCamera
        ? await ImagePicker.launchCameraAsync({ 
            quality: 0.8,
            allowsEditing: true,
            aspect: [4, 3],
          })
        : await ImagePicker.launchImageLibraryAsync({ 
            quality: 0.8,
            allowsEditing: true,
            aspect: [4, 3],
          });

      if (result.canceled) {
        Speech.speak("Image selection cancelled");
        return;
      }

      const image = result.assets[0];
      const fileName = `image_${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;
      const newPath = IMAGE_DIR + fileName;

      await FileSystem.copyAsync({ from: image.uri, to: newPath });
      setImages((prev) => [newPath, ...prev]);
      Speech.speak("New image saved successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to pick or save image.");
      Speech.speak("Failed to save image");
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async (uri: string) => {
    try {
      Alert.alert(
        "Confirm Delete",
        "Are you sure you want to delete this image?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              setLoading(true);
              await FileSystem.deleteAsync(uri, { idempotent: true });
              setImages((prev) => prev.filter((img) => img !== uri));
              
              if (imageViewMode) {
                setImageViewMode(false);
              }
              
              Speech.speak("Image deleted");
              setLoading(false);
            },
          },
        ]
      );
    } catch (error) {
      console.error("Failed to delete image:", error);
      Alert.alert("Error", "Could not delete the image.");
    }
  };

  const viewImage = (uri: string) => {
    setSelectedImage(uri);
    setImageViewMode(true);
    Speech.speak("Image opened");
  };

  const shareImage = async (uri: string) => {
    try {
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Sharing not available on this device");
        return;
      }
      await Sharing.shareAsync(uri);
    } catch (error) {
      Alert.alert("Error", "Could not share the image.");
    }
  };

  const speakDescription = (index: number) => {
    Speech.speak(`Image ${index + 1} of ${images.length}`);
  };

  const renderHeader = () => (
    <View className="flex-row justify-between items-center mb-6 pt-12 px-4">
      <Text className="text-3xl font-bold text-indigo-900">Collection</Text>
      <TouchableOpacity
        onPress={() => setInfoVisible(true)}
        className="p-2 rounded-full bg-indigo-100"
      >
        <Info size={20} color="#4338ca" />
      </TouchableOpacity>
    </View>
  );

  const renderActionButtons = () => (
    <View className="flex-row justify-center gap-4 mb-8 px-4">
      <TouchableOpacity
        onPress={() => handlePickImage(false)}
        className="bg-indigo-600 rounded-2xl py-4 px-5 flex-1 flex-row justify-center items-center shadow-md"
        style={{ shadowColor: "#4338ca", elevation: 3 }}
        accessibilityLabel="Select from gallery"
        accessibilityHint="Opens your photo gallery to select an image"
      >
        <ImageIcon size={22} color="white" />
        <Text className="text-white text-base font-semibold ml-2">
          Gallery
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => handlePickImage(true)}
        className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl py-4 px-5 flex-1 flex-row justify-center items-center shadow-md"
        style={{ shadowColor: "#6d28d9", elevation: 3 }}
        accessibilityLabel="Take photo with camera"
        accessibilityHint="Opens camera to take a new photo"
      >
        <Camera size={22} color="white" />
        <Text className="text-white text-base font-semibold ml-2">
          Camera
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderImageGrid = () => {
    if (loading) {
      return (
        <View className="items-center py-12">
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text className="mt-4 text-indigo-600 font-medium">Loading your images...</Text>
        </View>
      );
    }

    if (images.length === 0) {
      return (
        <View className="items-center py-16 bg-indigo-50 rounded-3xl mx-4 shadow-sm">
          <Image
            source={require('./assets/empty-gallery.png')}
            style={{ width: 120, height: 120, opacity: 0.7 }}
          />
          <Text className="text-lg text-indigo-400 mt-6">No images saved yet</Text>
          <TouchableOpacity
            onPress={() => handlePickImage(false)}
            className="mt-4 flex-row items-center bg-white px-6 py-3 rounded-xl shadow-sm"
          >
            <PlusCircle size={18} color="#4f46e5" />
            <Text className="text-indigo-600 font-medium ml-2">
              Add your first image
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View className="px-2">
        <Text className="text-lg font-medium mb-4 text-indigo-900 px-2">
          Saved Images ({images.length})
        </Text>
        
        <View className="flex-row flex-wrap justify-between">
          {images.map((uri, idx) => (
            <View
              key={idx}
              className="mb-5 bg-white rounded-2xl p-2 shadow-sm mx-1"
              style={{ width: THUMBNAIL_SIZE + 10 }}
            >
              <TouchableOpacity
                onPress={() => viewImage(uri)}
                onLongPress={() => speakDescription(idx)}
                className="overflow-hidden rounded-xl"
                style={{ width: THUMBNAIL_SIZE, height: THUMBNAIL_SIZE }}
              >
                <Image
                  source={{ uri }}
                  className="rounded-lg"
                  style={{ width: THUMBNAIL_SIZE, height: THUMBNAIL_SIZE }}
                  resizeMode="cover"
                />
                <View className="absolute bottom-0 left-0 right-0 h-8 bg-black/20" />
              </TouchableOpacity>

              <View className="flex-row justify-around mt-2">
                <TouchableOpacity
                  onPress={() => viewImage(uri)}
                  className="p-2 bg-indigo-50 rounded-full"
                >
                  <ZoomIn size={18} color="#4f46e5" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => shareImage(uri)}
                  className="p-2 bg-indigo-50 rounded-full"
                >
                  <Share2 size={18} color="#4f46e5" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => deleteImage(uri)}
                  className="p-2 bg-red-50 rounded-full"
                >
                  <Trash2 size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderImageViewer = () => (
    <Modal visible={imageViewMode} animationType="fade" transparent>
      <StatusBar backgroundColor="#000" barStyle="light-content" />
      <View className="flex-1 bg-black">
        <TouchableOpacity
          className="absolute top-12 left-4 z-10 bg-black/30 p-3 rounded-full"
          onPress={() => setImageViewMode(false)}
        >
          <ArrowLeft size={26} color="white" />
        </TouchableOpacity>

        {selectedImage && (
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
            maximumZoomScale={5}
            minimumZoomScale={1}
            bouncesZoom={true}
          >
            <Image
              source={{ uri: selectedImage }}
              style={{ width, height: width * 1.3 }}
              resizeMode="contain"
            />
          </ScrollView>
        )}

        {selectedImage && (
          <BlurView 
            intensity={30} 
            tint="dark" 
            className="absolute bottom-10 left-6 right-6 flex-row justify-center py-4 rounded-2xl"
          >
            <TouchableOpacity
              className="bg-white/20 p-3 rounded-full mx-5"
              onPress={() => shareImage(selectedImage)}
            >
              <Share2 size={26} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-white/20 p-3 rounded-full mx-5"
              onPress={() => deleteImage(selectedImage)}
            >
              <Trash2 size={26} color="white" />
            </TouchableOpacity>
          </BlurView>
        )}
      </View>
    </Modal>
  );

  const renderInfoModal = () => (
    <Modal visible={infoVisible} transparent animationType="fade">
      <BlurView intensity={90} tint="dark" className="flex-1 justify-center items-center">
        <View className="bg-white rounded-3xl w-4/5 p-6 shadow-lg">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-indigo-900">About My Images</Text>
            <TouchableOpacity onPress={() => setInfoVisible(false)}>
              <X size={24} color="#4338ca" />
            </TouchableOpacity>
          </View>
          
          <Text className="text-gray-700 mb-3">
            This app allows you to capture and organize your photos in one place.
          </Text>
          
          <Text className="text-gray-700 mb-3">
            • Tap on an image to view it in full screen
          </Text>
          <Text className="text-gray-700 mb-3">
            • Long press on an image for voice description
          </Text>
          <Text className="text-gray-700 mb-3">
            • Use the sharing button to send images to friends
          </Text>
          
          <TouchableOpacity 
            onPress={() => setInfoVisible(false)}
            className="bg-indigo-600 rounded-xl py-3 mt-4 items-center"
          >
            <Text className="text-white font-semibold">Got it</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </Modal>
  );

  return (
    <View className="flex-1 bg-indigo-50">
      <StatusBar backgroundColor="#eef2ff" barStyle="dark-content" />
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {renderHeader()}
        {renderActionButtons()}
        {renderImageGrid()}
      </ScrollView>
      
      {renderImageViewer()}
      {renderInfoModal()}
    </View>
  );
}