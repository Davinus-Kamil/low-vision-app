import React from 'react';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import OCRScanner from '../components/OCRScanner';
import { Stack } from 'expo-router';

export default function OCRScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'OCR Reader',
          headerStyle: {
            backgroundColor: '#000000',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <View style={styles.content}>
        <OCRScanner onTextExtracted={(text) => console.log('Extracted text:', text)} />
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