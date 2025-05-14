import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, Image, Alert, ActivityIndicator, Platform, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker'; 
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { Asset } from 'expo-asset';
import ViewShot from 'react-native-view-shot';
import TextReader from './TextReader';

interface OCRScannerProps {
  onTextExtracted?: (text: string) => void;
}

const OCRScanner: React.FC<OCRScannerProps> = ({ onTextExtracted }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [status, setStatus] = useState('');
  const [processing, setProcessing] = useState(false);
  const viewShotRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
      setHasPermission(cameraStatus === 'granted' && mediaStatus === 'granted');
    })();
  }, []);

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        setImage(result.assets[0].uri);
        processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        setImage(result.assets[0].uri);
        processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const processImage = async (uri: string) => {
    try {
      setProcessing(true);
      setStatus('Processing image...');
      const text = await extractTextFromImage(uri);
      setExtractedText(text);
      setStatus('');
      onTextExtracted && onTextExtracted(text);
    } catch (error) {
      console.error('Process image error:', error);
      Alert.alert('Error', 'Failed to process image. Please try again with a clearer image.');
    } finally {
      setProcessing(false);
    }
  };

  const extractTextFromImage = async (imageUri: string): Promise<string> => {
    try {
      setStatus('Preparing image for OCR...');
      // Prepare the image (resize, compress, get base64)
      const processedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 1200 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );
      setStatus('Uploading image to OCR API...');
      const apiUrl = 'https://api.ocr.space/parse/image';
      const apiKey = 'K87696567288957';
      
      // Prepare form data
      const formData = new FormData();
      formData.append('base64Image', `data:image/jpeg;base64,${processedImage.base64}`);
      formData.append('language', 'eng'); // Changed from 'mul' to 'eng' for English
      formData.append('apikey', apiKey);
      formData.append('OCREngine', '2'); // Using the more accurate OCR engine
      formData.append('detectOrientation', 'true');
      formData.append('scale', 'true');
      formData.append('isTable', 'false');
      formData.append('isOverlayRequired', 'false');
      
      // Make the API request
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      
      if (result && result.ParsedResults && result.ParsedResults[0] && result.ParsedResults[0].ParsedText) {
        return result.ParsedResults[0].ParsedText;
      } else {
        console.error('OCR API error:', result);
        return '';
      }
    } catch (error) {
      console.error('OCR API error:', error);
      return '';
    }
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text>Requesting permissions...</Text></View>;
  }
  if (hasPermission === false) {
    return <View style={styles.container}><Text>No access to camera or media library</Text></View>;
  }

  return (
    <View style={styles.container}>
      {image && (
        <Image source={{ uri: image }} style={styles.imagePreview} />
      )}
      {processing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.statusText}>{status}</Text>
        </View>
      ) : (
        <View style={styles.buttonContainer}>
          <Button title="Take Photo" onPress={takePhoto} />
          <Button title="Pick Image" onPress={pickImage} />
        </View>
      )}
      {extractedText ? (
        <TextReader text={extractedText} start={true} />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  imagePreview: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  statusText: {
    marginTop: 10,
    fontSize: 16,
  },
  resultContainer: {
    width: '100%',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginTop: 20,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 16,
  },
});

export default OCRScanner; 