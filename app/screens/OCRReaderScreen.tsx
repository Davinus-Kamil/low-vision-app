import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import OCRScanner from '../../components/OCRScanner';

export default function OCRReaderScreen() {
  const [extractedText, setExtractedText] = useState('');

  const handleTextExtracted = (text: string) => {
    setExtractedText(text);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <OCRScanner onTextExtracted={handleTextExtracted} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
  },
}); 