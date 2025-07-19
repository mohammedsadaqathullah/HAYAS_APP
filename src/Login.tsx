"use client"

import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  LayoutAnimation, // For subtle layout animations
  UIManager,
  Dimensions, // For LayoutAnimation on Android
} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useNavigation } from "@react-navigation/native"
import { useSendOtpLoginMutation, useVerifyOtpLoginMutation } from "./Redux/Api/LoginOtp"
import LinearGradient from "react-native-linear-gradient"

// Enable LayoutAnimation for Android
if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true)
  }
}

const LoginScreen = () => {
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [error, setError] = useState("")
  const [isFocusedInput, setIsFocusedInput] = useState("")
  const navigation = useNavigation()

  const [sendOtp, { isLoading: sendingOtp }] = useSendOtpLoginMutation()
  const [verifyOtp, { isLoading: verifyingOtp }] = useVerifyOtpLoginMutation()

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleSendOtp = async () => {
    setError("")
    if (!isValidEmail(email)) {
      setError("Invalid email format.")
      return
    }
    try {
      const res = await sendOtp({ email }).unwrap()
      if (res.success) {
        LayoutAnimation.easeInEaseOut() // Animate layout changes
        setOtpSent(true)
      } else {
        setError(res.message || "Failed to send OTP.")
      }
    } catch (err: any) {
      const message = err?.data?.message || err?.error || "Error sending OTP."
      setError(message)
    }
  }

  const handleVerifyOtp = async () => {
    setError("")
    try {
      const res = await verifyOtp({ email: email.trim(), otp: otp.trim() }).unwrap()
      if (res.success) {
        await AsyncStorage.setItem("cachelogged", email.trim().toLowerCase())
        navigation.navigate("Intro" as never) // Navigate back to Intro to handle user data
      } else {
        setError(res.message || "Invalid OTP.")
      }
    } catch (err: any) {
      const message = err?.data?.message || err?.error || "Error verifying OTP."
      setError(message)
    }
  }

  const handleSubmit = () => {
    if (!email.trim()) {
      setError("Email is required.")
      return
    }
    if (otpSent && !otp.trim()) {
      setError("Please enter the OTP.")
      return
    }
    otpSent ? handleVerifyOtp() : handleSendOtp()
  }

  return (
    <LinearGradient
      colors={["#000000", "#011627"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <Image source={require("./Assets/logoWhite.png")} style={styles.logo} />
          <Text style={styles.title}>Welcome Foodiees!</Text>
          <Text style={styles.subtitle}>Sign in to continue to HAYAS</Text>

          <View
            style={[
              styles.inputContainer,
              isFocusedInput === "email" && styles.focusedInputContainer,
              error.toLowerCase().includes("email") && styles.inputErrorContainer,
            ]}
          >
            <TextInput
              placeholder="Email"
              placeholderTextColor="#888"
              value={email.toLowerCase().trim()}
              onChangeText={setEmail}
              onFocus={() => setIsFocusedInput("email")}
              // onBlur={() => setIsFocusedInput("")}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
          </View>

          {otpSent && (
            <View
              style={[
                styles.inputContainer,
                isFocusedInput === "otp" && styles.focusedInputContainer,
                error.toLowerCase().includes("otp") && styles.inputErrorContainer,
              ]}
            >
              <TextInput
                placeholder="Enter OTP"
                placeholderTextColor="#888"
                value={otp}
                onChangeText={setOtp}
                onFocus={() => setIsFocusedInput("otp")}
                // onBlur={() => setIsFocusedInput("")}
                // keyboardType="number-pad"
                style={styles.input}
              />
            </View>
          )}

          <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={sendingOtp || verifyingOtp}>
            <Text style={styles.buttonText}>
              {sendingOtp || verifyingOtp ? "Please wait..." : otpSent ? "Verify OTP" : "Send OTP"}
            </Text>
          </TouchableOpacity>

          {error !== "" && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity onPress={() => navigation.navigate("Register" as never)}>
            <Text style={styles.redirectText}>
              Don't have an account? <Text style={styles.redirectLink}>Register here</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  )
}

export default LoginScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
  },
  logo: {
    width: Dimensions.get('screen').width * 0.8,
    height: 150,
    marginBottom: 0,
    resizeMode: "contain",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#ccc",
    marginBottom: 30,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#2a2a2a",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#3a3a3a",
  },
  focusedInputContainer: {
    borderColor: "#FFD700", // Yellow border on focus
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  inputErrorContainer: {
    borderColor: "#FF6347", // Tomato red for error
  },
  input: {
    flex: 1,
    color: "#fff",
    paddingVertical: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#FFD700", // Yellow button
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    width: "100%",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: "#000", // Black text on yellow button
    fontWeight: "bold",
    fontSize: 18,
  },
  errorText: {
    color: "#FF6347", // Tomato red for error
    marginTop: 15,
    textAlign: "center",
    fontSize: 14,
  },
  redirectText: {
    color: "#ccc",
    marginTop: 25,
    fontSize: 15,
  },
  redirectLink: {
    color: "#FFD700", // Yellow for the link part
    fontWeight: "bold",
  },
})
