// components/Menu.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera, History, Settings, Info } from 'lucide-react-native';

const Menu: React.FC = () => {
  const router = useRouter();

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => router.push('/capture')}
      >
        <Camera color="#fff" size={24} />
        <Text style={styles.navText}>Capture</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navButton}
        onPress={() => router.push('/history')}
      >
        <History color="#fff" size={24} />
        <Text style={styles.navText}>History</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navButton}
        onPress={() => router.push('/settings')}
      >
        <Settings color="#fff" size={24} />
        <Text style={styles.navText}>Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navButton}
        onPress={() => router.push('/info')}
      >
        <Info color="#fff" size={24} />
        <Text style={styles.navText}>Info</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#DF2935',
    paddingVertical: 20,
  },
  navButton: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#fff',
    paddingTop: 5,
  },
});

export default Menu;
