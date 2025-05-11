import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';

interface TextReaderProps {
  fileUri: string | null;
  onTextExtracted?: (text: string) => void;
}

const TextReader: React.FC<TextReaderProps> = ({ fileUri, onTextExtracted }) => {
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
      if (onTextExtracted) {
        onTextExtracted(text);
      }
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
      const apiUrl = 'https:'; // Replace with your actual OCR API URL
      const apiKey = '7'; // Replace with your actual OCR API key
      
      // Prepare form data
      const formData = new FormData();
      formData.append('base64Image', `data:image/jpeg;base64,${processedImage.base64}`);
      formData.append('language', 'eng'); // English language
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
      {processing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.statusText}>{status}</Text>
        </View>
      ) : (
        <View style={styles.resultContainer}>
          {extractedText ? (
            <Text style={styles.extractedText}>{extractedText}</Text>
          ) : (
            <Text style={styles.noTextMessage}>
              {fileUri ? 'No text extracted' : 'Waiting for file...'}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    marginTop: 10,
    textAlign: 'center',
    color: '#666',
  },
  resultContainer: {
    width: '100%',
    padding: 10,
  },
  extractedText: {
    fontSize: 16,
    lineHeight: 24,
  },
  noTextMessage: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  }
});

export default TextReader;