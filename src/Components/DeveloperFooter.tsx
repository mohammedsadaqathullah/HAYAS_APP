"use client"

import { useEffect, useRef } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Linking, Animated, Image } from "react-native"

// Import local assets for social media icons
import whatsapp from '../Assets/whatsapp.png'

const DeveloperFooter = () => {
  const animatedOpacity = useRef(new Animated.Value(0)).current
  const animatedTranslateY = useRef(new Animated.Value(20)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(animatedOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(animatedTranslateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const handleWhatsAppPress = () => {
    Linking.openURL("https://wa.me/918220206483")
  }

  const handleEmailPress = () => {
    Linking.openURL("mailto:mdsadaq.fed@gmail.com")
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: animatedOpacity,
          transform: [{ translateY: animatedTranslateY }],
        },
      ]}
    >
      <Text style={styles.title}>Developer</Text>
      <View style={styles.row}>
        <TouchableOpacity onPress={handleWhatsAppPress} style={styles.item}>
          <Image source={whatsapp} style={[styles.icon, { tintColor: "#4ade80" }]} />
          <Text style={styles.linkText}>+91 8220206483</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleEmailPress} style={styles.item}>
          {/* Using a simple text character or no icon for email */}
          <Text style={[styles.iconText, { color: "#60a5fa" }]}>✉</Text>
          <Text style={styles.linkText}>mdsadaq.fed@gmail.com</Text>
        </TouchableOpacity>

        <View style={styles.item}>
          {/* Using a simple text character or no icon for location */}
          <Text style={[styles.iconText, { color: "#f87171" }]}>📍</Text>
          <Text style={styles.text}>Tamil Nadu, India</Text>
        </View>
      </View>
      <Text style={styles.copyright}>&copy; {new Date().getFullYear()} Zii Techs</Text>
    </Animated.View>
  )
}

export default DeveloperFooter

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(255, 255, 255, 0.05)", // Slightly transparent dark background
    paddingVertical: 20,
    paddingHorizontal: 20,
    textAlign: "center",
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)", // Subtle top border
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 }, // Shadow upwards
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8, // For Android shadow
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 20,
    color: "#fff",
    textAlign: "center",
  },
  row: {
    flexDirection: "column", // Stack items vertically on mobile
    alignItems: "center", // Center items horizontally
    gap: 15, // Spacing between items
    marginBottom: 20,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.1)", // Glassmorphism background for each item
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    width: "90%", // Make items take more width
    maxWidth: 300, // Max width for larger screens
  },
  icon: {
    width: 20, // Size for image icons
    height: 20,
    resizeMode: "contain",
  },
  iconText: {
    fontSize: 20, // Size for text-based icons
  },
  linkText: {
    color: "#fff",
    fontSize: 16,
    textDecorationLine: "none", // No underline by default in RN
  },
  text: {
    color: "#fff",
    fontSize: 16,
  },
  copyright: {
    fontSize: 12,
    color: "#aaa",
    marginTop: 20,
    textAlign: "center",
  },
})
