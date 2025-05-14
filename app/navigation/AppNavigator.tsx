import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OCRReaderScreen from '../screens/OCRReaderScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#000000',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="OCRReader"
          component={OCRReaderScreen}
          options={{
            title: 'OCR Reader',
            headerShown: true,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 