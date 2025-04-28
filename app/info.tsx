import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import {
  Heart,
  Star,
  Download,
  Share2,
  Mail,
  Globe,
  Phone,
  Clock,
  Package,
} from "lucide-react-native";

const AppInfoPage = () => {
  return (
    <ScrollView style={styles.container}>
      {/* App Header */}
      <View style={styles.header}>
        <Image source={require("./assters/icon.png")} style={styles.appIcon} />
        <View style={styles.headerInfo}>
          <Text style={styles.appName}>Low-Vision</Text>
          <Text style={styles.developer}>by PPG College Students</Text>
        </View>
      </View>
      {/* App Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About this app</Text>
        <Text style={styles.description}>
          HealthTracker Pro is your ultimate fitness companion, designed to help
          you reach your health goals with personalized workouts, diet plans,
          and progress tracking. Our app features AI-powered routines that adapt
          to your fitness level and preferences.
        </Text>
      </View>

      {/* Features */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Features</Text>
        <View style={styles.featureItem}>
          <Clock color="#DF2935" size={20} />
          <Text style={styles.featureText}>Real-time workout tracking</Text>
        </View>
        <View style={styles.featureItem}>
          <Heart color="#DF2935" size={20} />
          <Text style={styles.featureText}>
            Heart rate monitoring compatibility
          </Text>
        </View>
        <View style={styles.featureItem}>
          <Star color="#DF2935" size={20} />
          <Text style={styles.featureText}>Personalized fitness goals</Text>
        </View>
      </View>

      {/* Screenshots */}
      {/* <View style={styles.section}>
        <Text style={styles.sectionTitle}>Screenshots</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.screenshotsContainer}>
          <Image source={{ uri: 'https://via.placeholder.com/180x320' }} style={styles.screenshot} />
          <Image source={{ uri: 'https://via.placeholder.com/180x320' }} style={styles.screenshot} />
          <Image source={{ uri: 'https://via.placeholder.com/180x320' }} style={styles.screenshot} />
        </ScrollView>
      </View> */}

      {/* Contact Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Developer</Text>
        <View style={styles.contactItem}>
          <Mail color="#DF2935" size={20} />
          <Text style={styles.contactText}>support@low-vision.com </Text>
        </View>
        <View style={styles.contactItem}>
          <Globe color="#DF2935" size={20} />
          <Text style={styles.contactText}>www.ppg.in </Text>
        </View>
        <View style={styles.contactItem}>
          <Phone color="#DF2935" size={20} />
          <Text style={styles.contactText}>1-800-128310283</Text>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Version</Text>
        <View style={styles.contactItem}>
          <Package color="#DF2935" size={20} />
          <Text style={styles.contactText}>Version 0.0.1 </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#F8F8F8",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  headerInfo: {
    marginLeft: 16,
    justifyContent: "center",
  },
  appName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
  },
  developer: {
    fontSize: 14,
    color: "#666666",
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666666",
  },
  actionButtons: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  mainButton: {
    flex: 1,
    backgroundColor: "#DF2935",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
  },
  mainButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    marginRight: 8,
  },
  secondaryButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEEEEE",
    borderRadius: 20,
    marginLeft: 12,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: "#666666",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: "#444444",
    marginLeft: 12,
  },
  screenshotsContainer: {
    flexDirection: "row",
  },
  screenshot: {
    width: 180,
    height: 320,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    color: "#444444",
    marginLeft: 12,
  },
});

export default AppInfoPage;
