import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';

interface OCRScannerProps {
  fileUri: string | null;
  onTextExtracted?: (text: string) => void;
}

const OCRScanner: React.FC<OCRScannerProps> = ({ fileUri, onTextExtracted }) => {
  const [extractedText, setExtractedText] = useState('');
  const [status, setStatus] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (fileUri) {
      processImage(fileUri);
    }
  }, [fileUri]);

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

  return (
    <View style={styles.container}>
      {processing && (
        <Text style={styles.statusText}>{status}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    marginTop: 10,
    textAlign: 'center',
    color: '#666',
  }
});

export default OCRScanner;