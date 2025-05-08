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
const imageMargin = 8; // Define margin for spacing
const imageSize = (width - (imageMargin * (numColumns + 1))) / numColumns; // Adjust image size calculation to account for margins

const Gallery = () => {
  // Sample gallery data using local images with require
  // Adjust the relative path based on your actual project structure.
  const galleryItems = [
    { id: 1, uri: require('../../assets/images/download - Copy (2).png') },
    { id: 2, uri: require('../images/download - Copy (2).png') },
    { id: 3, uri: require('../images/download - Copy (2).png') },
    { id: 4, uri: require('../images/download - Copy (2).png') },
    { id: 5, uri: require('../images/download - Copy (2).png') },
    { id: 6, uri: require('../images/download - Copy (2).png') },
    { id: 7, uri: require('../images/download - Copy (2).png') },
    { id: 8, uri: require('../images/download - Copy (2).png') },
    { id: 9, uri: require('../images/download - Copy (2).png') },
    { id: 10, uri: require('../images/download - Copy (2).png') },
    { id: 11, uri: require('../images/download - Copy (2).png') },
    { id: 12, uri: require('../images/download - Copy (2).png') },
  ];

  // Function to handle image selection/tap
  const handleImagePress = (id: number) => {
    console.log(`Image ${id} pressed`);
    // For example, navigate to the edit screen:
    // router.push(`/edit?imageId=${id}`);
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
                  <Image source={item.uri} style={styles.image} />
                </TouchableOpacity>
              ))}
              {/* Fill empty spaces if row is not complete */}
              {row.length < numColumns &&
                Array.from({ length: numColumns - row.length }).map((_, i) => (
                  <View key={`empty-${i}`} style={styles.emptySpace} />
                ))
              }
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
    backgroundColor: '#f0f0f0', // Softer background color
  },
  title: {
    fontSize: 28, // Increased font size
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20, // Increased vertical margin
    color: '#2c3e50', // Darker, more modern color
  },
  scrollContent: {
    paddingBottom: 60, // Space for footer
    paddingHorizontal: imageMargin / 2, // Add some horizontal padding
  },
  galleryContainer: {
    flex: 1,
    paddingHorizontal: imageMargin / 2, // Add horizontal padding for the grid
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start', // Align items to the start
  },
  imageContainer: {
    width: imageSize,
    height: imageSize,
    margin: imageMargin / 2, // Add margin for spacing around each image
    borderRadius: 8, // Rounded corners for the container
    backgroundColor: '#fff', // Background for the image container, helps with shadow
    // iOS Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Android Shadow
    elevation: 3,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8, // Rounded corners for the image itself
  },
  emptySpace: {
    width: imageSize,
    height: imageSize,
    margin: imageMargin / 2, // Consistent margin
  },
});

export default Gallery;