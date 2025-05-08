import React from 'react';
import { View, Text,StyleSheet } from 'react-native'
import { useRouter } from 'expo-router';
import { HelloWave } from './HelloWave';

const Header: React.FC = () => {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <Text style={styles.title}>Low-Vision </Text>
      <HelloWave />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#DF2935',
    paddingHorizontal: 20,
    paddingVertical: 10,
    height: 60,
  },
  logo: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginLeft: 15,
  },
});

export default Header;
