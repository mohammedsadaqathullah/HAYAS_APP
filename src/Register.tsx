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
  UIManager, // For LayoutAnimation on Android
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useSendOtpMutation, useVerifyOtpMutation } from "./Redux/Api/otpApi"
import { useSaveUserMutation } from "./Redux/Api/userApi"
import LinearGradient from "react-native-linear-gradient"

// Enable LayoutAnimation for Android
if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true)
  }
}

const RegisterScreen = () => {
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [doorNoAndStreetName, setDoorNoAndStreetName] = useState("")
  const [area, setArea] = useState("")
  const place = "Eruvadi, Tirunelveli District - 627103" // This seems fixed
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [isFocusedInput, setIsFocusedInput] = useState("")

  const navigation = useNavigation()

  const [sendOtp, { isLoading: sendingOtp }] = useSendOtpMutation()
  const [verifyOtp, { isLoading: verifyingOtp }] = useVerifyOtpMutation()
  const [saveUser] = useSaveUserMutation()

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const isValidPhone = (phone: string) => /^\d{10}$/.test(phone)

  const showError = (msg: string) => {
    setError(msg)
    setTimeout(() => setError(""), 5000)
  }

  const handleSendOtp = async () => {
    const normalizedEmail = email.trim().toLowerCase()
    if (!isValidEmail(normalizedEmail)) {
      showError("Invalid email format.")
      return
    }
    try {
      const res = await sendOtp({ email: normalizedEmail }).unwrap()
      if (res.success) {
        LayoutAnimation.easeInEaseOut() // Animate layout changes
        setOtpSent(true)
      } else {
        showError(res.message || "Failed to send OTP.")
      }
    } catch (err: any) {
      const msg = err?.data?.message || err?.error || "Error sending OTP."
      showError(msg)
    }
  }

  const handleVerifyOtp = async () => {
    const normalizedEmail = email.trim().toLowerCase()
    const cleanedOtp = otp.trim()
    if (!cleanedOtp) {
      showError("Please enter the OTP.")
      return
    }
    try {
      const res = await verifyOtp({ email: normalizedEmail, otp: cleanedOtp }).unwrap()
      if (res.success) {
        LayoutAnimation.easeInEaseOut() // Animate layout changes
        setEmailVerified(true)
      } else {
        showError(res.message || "Invalid or expired OTP.")
      }
    } catch (err: any) {
      const msg = err?.data?.message || err?.error || "OTP verification failed."
      showError(msg)
    }
  }

  const handleRegister = async () => {
    if (!name || !phone || !email || !doorNoAndStreetName || !area) {
      showError("Please fill in all fields.")
      return
    }
    if (!isValidEmail(email)) {
      showError("Invalid email format.")
      return
    }
    if (!isValidPhone(phone)) {
      showError("Phone must be 10 digits.")
      return
    }
    if (!emailVerified) {
      showError("Please verify your email first.")
      return
    }
    try {
      setLoading(true)
      const userData = {
        name,
        phone,
        email: email.trim().toLowerCase(),
        doorNoAndStreetName,
        area,
        place,
      }
      await saveUser(userData).unwrap()
      await AsyncStorage.setItem("cachelogged", email)
      navigation.navigate("Home" as never) // Assuming 'Home' is your main app screen
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Registration failed."
      showError(msg)
    } finally {
      setLoading(false)
    }
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
          <Text style={styles.title}>Create Your Account</Text>
          <Text style={styles.subtitle}>Join HAYAS for delicious food delivery!</Text>

          <View style={[styles.inputContainer, isFocusedInput === "name" && styles.focusedInputContainer]}>
            <TextInput
              placeholder="Full Name"
              placeholderTextColor="#888"
              value={name}
              onChangeText={setName}
              onFocus={() => setIsFocusedInput("name")}
              onBlur={() => setIsFocusedInput("")}
              style={styles.input}
            />
          </View>

          <View style={[styles.inputContainer, isFocusedInput === "phone" && styles.focusedInputContainer]}>
            <TextInput
              placeholder="Phone"
              placeholderTextColor="#888"
              keyboardType="number-pad"
              value={phone}
              onChangeText={setPhone}
              onFocus={() => setIsFocusedInput("phone")}
              onBlur={() => setIsFocusedInput("")}
              style={styles.input}
            />
          </View>

          <View
            style={[
              styles.inputContainer,
              isFocusedInput === "email" && styles.focusedInputContainer,
              emailVerified && styles.verifiedInputContainer,
            ]}
          >
            <TextInput
              placeholder="Email"
              placeholderTextColor="#888"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              editable={!emailVerified}
              onFocus={() => setIsFocusedInput("email")}
              onBlur={() => setIsFocusedInput("")}
              style={[styles.input, emailVerified && styles.verifiedInput]}
            />
            {emailVerified && <Text style={styles.verifiedTag}>✔ Verified</Text>}
          </View>

          <View style={[styles.inputContainer, isFocusedInput === "doorNo" && styles.focusedInputContainer]}>
            <TextInput
              placeholder="Door No. and Street Name"
              placeholderTextColor="#888"
              value={doorNoAndStreetName}
              onChangeText={setDoorNoAndStreetName}
              onFocus={() => setIsFocusedInput("doorNo")}
              onBlur={() => setIsFocusedInput("")}
              style={styles.input}
            />
          </View>

          <View style={[styles.inputContainer, isFocusedInput === "area" && styles.focusedInputContainer]}>
            <TextInput
              placeholder="Area"
              placeholderTextColor="#888"
              value={area}
              onChangeText={setArea}
              onFocus={() => setIsFocusedInput("area")}
              onBlur={() => setIsFocusedInput("")}
              style={styles.input}
            />
          </View>

          <View style={[styles.inputContainer, styles.readonlyInputContainer]}>
            <TextInput
              placeholder="Place"
              placeholderTextColor="#888"
              value={place}
              editable={false}
              style={[styles.input, styles.readonlyInput]}
            />
          </View>

          {!emailVerified && (
            <TouchableOpacity style={styles.button} onPress={handleSendOtp} disabled={sendingOtp}>
              <Text style={styles.buttonText}>{sendingOtp ? "Sending..." : "Send OTP"}</Text>
            </TouchableOpacity>
          )}

          {otpSent && !emailVerified && (
            <>
              <View style={[styles.inputContainer, isFocusedInput === "otp" && styles.focusedInputContainer]}>
                <TextInput
                  placeholder="Enter OTP"
                  placeholderTextColor="#888"
                  keyboardType="number-pad"
                  value={otp}
                  onChangeText={setOtp}
                  onFocus={() => setIsFocusedInput("otp")}
                  onBlur={() => setIsFocusedInput("")}
                  style={styles.input}
                />
              </View>
              <TouchableOpacity style={styles.button} onPress={handleVerifyOtp} disabled={verifyingOtp}>
                <Text style={styles.buttonText}>{verifyingOtp ? "Verifying..." : "Verify OTP"}</Text>
              </TouchableOpacity>
            </>
          )}

          {emailVerified && (
            <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? "Registering..." : "Register"}</Text>
            </TouchableOpacity>
          )}

          {error !== "" && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity onPress={() => navigation.navigate("Login" as never)}>
            <Text style={styles.redirectText}>
              Already registered? <Text style={styles.redirectLink}>Login here</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  )
}

export default RegisterScreen

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
    flexGrow: 1,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
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
    flexDirection: "row", // Keep this for potential future icon re-introduction or alignment
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
  inputIcon: {
    // This style is no longer directly used but kept for reference if icons are added back
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#fff",
    paddingVertical: 12,
    fontSize: 16,
  },
  verifiedInputContainer: {
    borderColor: "#32CD32", // LimeGreen for verified
  },
  verifiedInput: {
    backgroundColor: "#1a3a1a", // Darker green background for verified
  },
  verifiedTag: {
    color: "#32CD32",
    fontSize: 12,
    marginLeft: 10,
  },
  readonlyInputContainer: {
    backgroundColor: "#1a1a1a", // Slightly darker for readonly
    borderColor: "#3a3a3a",
  },
  readonlyInput: {
    color: "#888", // Lighter text for readonly
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
