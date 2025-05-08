import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import Header from "./header"; // Ensure the Header component exists in the specified path or adjust the path accordingly.

export default function HomePage() {
  const data = Array.from({ length: 6 });

  return (
    <View style={styles.container}>
      <Header />
      <FlatList
        data={data}
        keyExtractor={(_, index) => index.toString()}
        numColumns={2}
        contentContainerStyle={styles.grid}
        renderItem={() => (
          <View style={styles.imageBox}>
            <Image
              source={require("../assets/placeholder.png")}
              style={styles.image}
            />
          </View>
        )}
      />
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} />
        <TouchableOpacity style={styles.button} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  grid: { padding: 20 },
  imageBox: {
    flex: 1,
    margin: 10,
    aspectRatio: 1,
    backgroundColor: "#ccc",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  image: { width: 50, height: 50 },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingBottom: 20,
  },
  button: {
    width: 120,
    height: 40,
    backgroundColor: "#ccc",
    borderRadius: 12,
  },
});
