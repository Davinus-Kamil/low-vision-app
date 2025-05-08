// components/footer.tsx

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from './ui/IconSymbol';

export default function Footer() {
  const router = useRouter();

  return (
    <View style={styles.footer}>
      <TouchableOpacity onPress={() => router.push('/gallery')}>
        <IconSymbol name="gallery.fill" size={28} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/camera')}>
        <IconSymbol name="camera.fill" size={28} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/pdf-viewer')}>
        <IconSymbol name="pdf.fill" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#222',
    paddingVertical: 28,
    // borderTopWidth: 0.5,
    borderTopColor: '#444',
    bottom: 0,  
  },
});
