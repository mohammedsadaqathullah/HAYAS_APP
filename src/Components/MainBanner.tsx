"use client"

import { useState, useRef, useEffect } from "react"
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from "react-native"
import Video from "react-native-video"
import Icon from "react-native-vector-icons/Ionicons"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import { useNavigation } from "@react-navigation/native"

const { width } = Dimensions.get("window")

import hayasBike from "../Assets/hayasBike.jpeg"
import videoSrc from "../Assets/video.mp4"

export default function MainBanner() {
  const navigation = useNavigation()
  const [slideIndex, setSlideIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const videoRef = useRef<Video>(null)

  const slides = [
    { type: "image", src: hayasBike },
    { type: "video", src: videoSrc },
  ]

  const handleNext = () => {
    setSlideIndex((prev) => (prev + 1) % slides.length)
  }

  const handlePrev = () => {
    setSlideIndex((prev) => (prev - 1 + slides.length) % slides.length)
  }

  
  const toggleMute = () => {
    setIsMuted((prev) => !prev)
  }

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.setNativeProps({ paused: true })
      } else {
        videoRef.current.setNativeProps({ paused: false })
      }
      setIsPlaying((prev) => !prev)
    }
  }

  return (
    <View style={styles.mainBanner}>
      {/* Left: Glass Text */}
      <View style={styles.glassContainer}>
        <Text style={styles.mainTitle}>
          Welcome to <Text style={styles.highlight}>HAYAS</Text>
        </Text>
        <Text style={styles.mainSubtitle}>Where your cravings summon magical meals to your door.</Text>
        <TouchableOpacity style={styles.ctaButton} onPress={() => navigation.navigate("Foods")}>
          <Text style={styles.ctaButtonText}>Explore Menu</Text>
        </TouchableOpacity>
      </View>

      {/* Right: Video/Image Slider */}
      <View style={styles.rightBannerSlider}>
        {slides[slideIndex].type === "image" ? (
          <Image key="image" source={slides[slideIndex].src} style={styles.sliderContent} resizeMode="contain" />
        ) : (
          <View key="video" style={styles.videoWrapper}>
            <Video
              // ref={videoRef}
              source={slides[slideIndex].src}
              style={styles.video}
              resizeMode="contain"
              // repeat
              // muted={isMuted}
              // paused={!isPlaying}
              controls
              onLoad={() => {
                // Ensure video starts playing when loaded if it's the current slide
                if (slides[slideIndex].type === "video") {
                  setIsPlaying(true)
                }
              }}
            />
            {/* <View style={styles.controls}>
              <TouchableOpacity onPress={toggleMute} style={styles.controlButton}>
                <Icon name={isMuted ? "volume-mute" : "volume-high"} size={26} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={togglePlayPause} style={styles.controlButton}>
                <Icon name={isPlaying ? "pause-circle-outline" : "play-circle-outline"} size={26} color="#fff" />
              </TouchableOpacity>
            </View> */}
          </View>
        )}

        {/* Navigation Buttons */}
        <View style={styles.sliderNav}>
          <TouchableOpacity style={[styles.sliderNavButton, styles.leftNav]} onPress={handlePrev}>
            <MaterialIcons name="navigate-before" size={30} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.sliderNavButton, styles.rightNav]} onPress={handleNext}>
            <MaterialIcons name="navigate-next" size={30} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  mainBanner: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    minHeight: 500,
  },
  glassContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.09)",
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    width: width * 0.9,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
  },
  highlight: {
    color: "#facc15",
  },
  mainSubtitle: {
    fontSize: 16,
    color: "#eee",
    textAlign: "center",
    marginBottom: 20,
  },
  ctaButton: {
    backgroundColor: "#facc15",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    shadowColor: "#facc15",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  ctaButtonText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
  },
  rightBannerSlider: {
    width: width * 0.9,
    height: width * 0.9 * (9 / 8), // Maintain aspect ratio
    borderRadius: 15,
    overflow: "hidden",
    position: "relative",
    // backgroundColor: "#333",
  },
  sliderContent: {
    width: "100%",
    height: "100%",
  },
  videoWrapper: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  controls: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    gap: 10,
  },
  controlButton: {
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 8,
  },
  sliderNav: {
    position: "absolute",
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: 10,
    top: "90%",
    transform: [{ translateY: -24 }], // Center vertically
  },
  sliderNavButton: {
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 30,
    padding: 5,
  },
  leftNav: {
    alignSelf: "flex-start",
  },
  rightNav: {
    alignSelf: "flex-end",
  },
})
