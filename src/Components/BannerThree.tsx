import { useRef } from "react"
import { View, Text, StyleSheet, Dimensions } from "react-native"
import Video from "react-native-video"

const { width } = Dimensions.get("window")

export const BannerThree = () => {
  const videoRef = useRef<Video>(null)

  return (
    <View style={styles.container}>
      {/* Text Section */}
      <View style={styles.textSection}>
        <Text style={styles.title}>
          Fast Delivery with <Text style={styles.highlight}>HAYAS</Text>
        </Text>
        <Text style={styles.subtitle}>
          Experience blazing-fast delivery like never before. HAYAS ensures your packages are at your doorstep in record
          time – reliable, efficient, and trusted by thousands.
        </Text>
      </View>

      {/* Video Section */}
      <View style={styles.videoSection}>
        <Video
          source={require("../Assets/introVid.mp4")}
          muted
          repeat
          paused={false}
          style={styles.video}
          resizeMode="contain"
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column", // Always column for mobile
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
    boxSizing: "border-box",
    overflow: "hidden",
    width: "100%",
    gap: 40, // Spacing between text and video
  },
  textSection: {
    maxWidth: 600,
    textAlign: "center", // Center text for mobile
  },
  title: {
    fontSize: 32, // Adjusted for mobile
    marginBottom: 10,
    color: "#ffffff",
    fontWeight: "bold",
  },
  highlight: {
    color: "#facc15",
    textShadowColor: "rgba(255, 255, 0, 0.6)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  subtitle: {
    fontSize: 16, // Adjusted for mobile
    color: "#ffffff",
    lineHeight: 24,
  },
  videoSection: {
    width: "100%", // Take full width on mobile
    maxWidth: 300, // Max width for the video container
    aspectRatio: 16 / 16, // Maintain aspect ratio
  },
  video: {
    width: "100%",
    height: "100%",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 15,
  },
})
