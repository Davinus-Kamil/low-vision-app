// import React from "react";
// import { View, TouchableOpacity, StyleSheet } from "react-native";
// import { Ionicons } from "@expo/vector-icons";

// export default function Header() {
//   return (
//     <View style={styles.header}>
//       <TouchableOpacity>
//         <Ionicons name="arrow-back" size={24} color="black" />
//       </TouchableOpacity>
//       <TouchableOpacity>
//         <Ionicons name="menu" size={24} color="black" />
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   header: {
//     paddingTop: 50,
//     paddingHorizontal: 20,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
// });




import React from "react";
import { View, Text, StyleSheet } from "react-native";

const Header = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Header</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#444",
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default Header;