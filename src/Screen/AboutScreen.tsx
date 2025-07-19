"use client"

import { useEffect, useRef, useState } from "react"
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Linking, Animated, Dimensions } from "react-native"
import LinearGradient from "react-native-linear-gradient"

// Import local assets
import logoBlack from "../Assets/logoBlack.png"
import whatsapp from "../Assets/whatsapp.png"
import instagram from "../Assets/instagram.png"
import DeveloperFooter from "../Components/DeveloperFooter"

// Placeholder for DeveloperFooter - you can replace this with your actual component


const AboutScreen = () => {
  const fullText = `HAYAS is a trusted local food and grocery delivery service, proudly serving the communities of Eruvadi and the surrounding areas in Tirunelveli District. Founded in 2020, we have made it our mission to bring fresh, quality food and essential groceries directly to your doorstep, all for a flat delivery fee of just ₹30 per order.

Whether you're craving a delicious meal or need to stock up on groceries, HAYAS is here to provide fast, reliable, and affordable delivery services to make your life easier. Our team is committed to delivering your orders with care and convenience, ensuring that you can enjoy your favorite foods and essentials without leaving the comfort of your home.`

  const lines = fullText.split("\n")
  const [customerCountState, setCustomerCountState] = useState(0)
  const [deliveryCountState, setDeliveryCountState] = useState(0)

  // Animated values for text lines
  const animatedLineOpacities = useRef(lines.map(() => new Animated.Value(0))).current
  const animatedLineTranslateYs = useRef(lines.map(() => new Animated.Value(20))).current

  // Function to start counter animation
  const startCounterAnimation = () => {
    const customerInterval = setInterval(() => {
      setCustomerCountState((prevValue) => {
        if (prevValue < 1400) {
          return prevValue + 10
        } else {
          clearInterval(customerInterval)
          return 1400
        }
      })
    }, 10)

    const deliveryInterval = setInterval(() => {
      setDeliveryCountState((prevValue) => {
        if (prevValue < 8000) {
          return prevValue + 10
        } else {
          clearInterval(deliveryInterval)
          return 8000
        }
      })
    }, 10)
  }

  useEffect(() => {
    // Start text line animations
    const lineAnimations = lines.map((_, index) =>
      Animated.parallel([
        Animated.timing(animatedLineOpacities[index], {
          toValue: 1,
          duration: 200,
          delay: index * 100, // Stagger delay
          useNativeDriver: true,
        }),
        Animated.timing(animatedLineTranslateYs[index], {
          toValue: 0,
          duration: 200,
          delay: index * 100, // Stagger delay
          useNativeDriver: true,
        }),
      ]),
    )
    Animated.sequence(lineAnimations).start()

    // Start counter animations after a slight delay or when text animations are done
    const counterTimeout = setTimeout(
      () => {
        startCounterAnimation()
      },
      lines.length * 100 + 500,
    ) // Start after all text lines have started animating

    return () => clearTimeout(counterTimeout)
  }, [])

  const handleWhatsAppPress = () => {
    Linking.openURL("https://wa.me/8220206483")
  }

  const handleInstagramPress = () => {
    Linking.openURL("https://instagram.com/hayas2k20?igsh=MWhwazJ50DNh0TRheg==")
  }

  return (
    <LinearGradient
      colors={["#000000", "#011627"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent} showsVerticalScrollIndicator={false}>
        <View style={styles.imageCont}>
          <View style={styles.logo}>
            <Image style={styles.blackLogo} source={logoBlack} alt="HAYAS Logo" />
          </View>
        </View>

        <View style={styles.aboutContent}>
          {lines.map((line, index) => (
            <Animated.Text
              key={index}
              style={[
                styles.aboutText,
                {
                  opacity: animatedLineOpacities[index],
                  transform: [{ translateY: animatedLineTranslateYs[index] }],
                },
              ]}
            >
              {line}
            </Animated.Text>
          ))}
          <Text style={styles.thankyouText}>
            Thank you for choosing HAYAS {"\n"}
            We’re here to serve you with a smile, every time!
          </Text>
        </View>

        {/* Counters section */}
        <View style={styles.statsContainer}>
          <View style={styles.statsItem}>
            <Text style={styles.statsNumber}>{customerCountState}</Text>
            <Text style={styles.statsSubtitle}>+ Customers</Text>
          </View>
          <View style={styles.statsItem}>
            <Text style={styles.statsNumber}>{deliveryCountState}</Text>
            <Text style={styles.statsSubtitle}>+ Deliveries</Text>
          </View>
        </View>

        <View style={styles.lastBox}>
          <Text style={styles.contactTitle}>Contact us</Text>
          <View style={styles.socialContainer}>
            <TouchableOpacity onPress={handleWhatsAppPress} style={styles.socialButton}>
              <Image source={whatsapp} style={styles.socialIcon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleInstagramPress} style={styles.socialButton}>
              <Image source={instagram} style={{...styles.socialIcon,borderRadius:16}} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}

export default AboutScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  imageCont: {
    width: "100%",
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: 150,
    height: 150,
    borderRadius: 75, // Make it circular
    overflow: "hidden",
    backgroundColor: "#fff", // White background for the black logo
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 15,
  },
  blackLogo: {
    width: "80%",
    height: "80%",
    resizeMode: "contain",
  },
  aboutContent: {
    backgroundColor: "rgba(255, 255, 255, 0.1)", // Glassmorphism background
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  aboutText: {
    fontSize: 16,
    color: "#eee",
    lineHeight: 24,
    marginBottom: 10,
    textAlign: "justify", // Justify text for a professional look
  },
  thankyouText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFD700", // Yellow accent
    textAlign: "center",
    marginTop: 20,
    lineHeight: 28,
  },
  statsContainer: {
    flexDirection: "column",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 40,
    backgroundColor: "rgba(255, 255, 255, 0.1)", // Glassmorphism background
    borderRadius: 20,
    paddingVertical: 25,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    gap:'5%',
  },
  statsItem: {
    alignItems: "center",
  },
  statsNumber: {
    fontSize: Dimensions.get('screen').width * 0.2,
    fontWeight: "bold",
    color: "#FFD700", // Yellow accent
  },
  statsSubtitle: {
    fontSize: 30,
    color: "#fff",
    marginTop: 5,
  },
  lastBox: {
    width: "100%",
    alignItems: "center",
    marginBottom: 30,
    backgroundColor: "rgba(255, 255, 255, 0.1)", // Glassmorphism background
padding:20,
borderRadius:10,
borderWidth: 1,
borderColor: "rgba(255, 255, 255, 0.2)",
  },
  contactTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  socialContainer: {
    flexDirection: "row",
    gap: 20, // Spacing between social icons
    
  },
  socialButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)", // Glassmorphism background for buttons
    borderRadius: 30, // Circular buttons
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  socialIcon: {
    width: 35,
    height: 35,
    resizeMode: "cover",
  },
})

