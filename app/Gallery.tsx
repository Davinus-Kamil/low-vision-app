import React from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ScrollView, 
  Dimensions, 
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { Link } from 'expo-router';

// Get screen width to calculate image dimensions
const { width } = Dimensions.get('window');
const numColumns = 3; // Number of columns in the grid
const imageSize = width / numColumns;

const Gallery = () => {
  // Sample gallery data - replace with your actual image sources
  // In a real app, you might load these from storage or an API
  const galleryItems = [
    { id: 1, uri:     '/images/download - Copy (2).png'
    }, // Replace with actual image sources
    { id: 2, uri: '/images/download - Copy (2).png' },
    { id: 3, uri: '/images/download - Copy (2).png' },
    { id: 4, uri: '/images/download - Copy (2).png' },
    { id: 5, uri: '/images/download - Copy (2).png' },
    { id: 6, uri: '/images/download - Copy (2).png' },
    { id: 7, uri: '/images/download - Copy (2).png' },
    { id: 8, uri: '/images/download - Copy (2).png' },
    { id: 9, uri: '/images/download - Copy (2).png' },
    { id: 10, uri: '/images/download - Copy (2).png' },
    { id: 11, uri: '/images/download - Copy (2).png' },
    { id: 12, uri: '/images/download - Copy (2).png' },
  ];

  // Function to handle image selection/tap
  const handleImagePress = (id: number) => {
    console.log(`Image ${id} pressed`);
    // Here you would navigate to edit screen or show options
    // For example: router.push(`/edit?imageId=${id}`);
  };

  // Function to chunk the array into rows
  const chunkArray = (array: Array<any>, size: number) => {
    return Array.from({ length: Math.ceil(array.length / size) }, (_, index) =>
      array.slice(index * size, index * size + size)
    );
  };

  // Organize images into rows for the grid
  const rows = chunkArray(galleryItems, numColumns);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Gallery</Text>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.galleryContainer}>
          {rows.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.row}>
              {row.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.imageContainer}
                  onPress={() => handleImagePress(item.id)}
                >
                  <Image source={{ uri: item.uri }} style={styles.image} />
                </TouchableOpacity>
              ))}
              {/* Fill empty spaces if row is not complete */}
              {row.length < numColumns &&
                Array.from({ length: numColumns - row.length }).map((_, i) => (
                  <View key={`empty-${i}`} style={styles.emptySpace} />
                ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 12,
    color: '#333',
  },
  scrollContent: {
    paddingBottom: 60, // Space for footer
  },
  galleryContainer: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
  },
  imageContainer: {
    width: imageSize,
    height: imageSize,
    padding: 1, // Very small gap between images
  },
  image: {
    width: '100%',
    height: '100%',
  },
  emptySpace: {
    width: imageSize,
    height: imageSize,
  },
});

export default Gallery;