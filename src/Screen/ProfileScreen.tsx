"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
} from "react-native"
import { useSelector, useDispatch } from "react-redux"
import { useNavigation } from "@react-navigation/native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import Ionicons from "react-native-vector-icons/Ionicons" // Import Ionicons
import LinearGradient from "react-native-linear-gradient" // For background gradient
import { useUpdateUserMutation } from "../Redux/Api/userApi"
import { clearUserData } from "../Redux/slice/userSlice"
import { RootState } from "../Redux/store"

const { width } = Dimensions.get("window")

const ProfileScreen = () => {
  const dispatch = useDispatch()
  const navigation = useNavigation<any>()
  const user = useSelector((state: RootState) => state.user)

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [doorNoAndStreetName, setDoorNoAndStreetName] = useState("")
  const [area, setArea] = useState("")
  const [place, setPlace] = useState("")

  const [initialData, setInitialData] = useState({
    name: "",
    phone: "",
    doorNoAndStreetName: "",
    area: "",
  })

  const [updateUser, { isLoading }] = useUpdateUserMutation()

  useEffect(() => {
    if (user) {
      setName(user.name || "")
      setPhone(user.phone || "")
      setDoorNoAndStreetName(user.doorNoAndStreetName || "")
      setArea(user.area || "")
      setPlace(user.place || "Eruvadi, Tirunelveli District - 627103")
      setInitialData({
        name: user.name || "",
        phone: user.phone || "",
        doorNoAndStreetName: user.doorNoAndStreetName || "",
        area: user.area || "",
      })
    }
  }, [user])

  const isPhoneValid = (inputPhone: string) => {
    return /^\d{10}$/.test(inputPhone)
  }

  const isFormValid = () => {
    return name.trim() && isPhoneValid(phone) && doorNoAndStreetName.trim() && area.trim()
  }

  const isChanged = () => {
    return (
      name !== initialData.name ||
      phone !== initialData.phone ||
      doorNoAndStreetName !== initialData.doorNoAndStreetName ||
      area !== initialData.area
    )
  }

  const handleUpdate = async () => {
    if (!isFormValid()) {
      Alert.alert("Validation Error", "Please fill in all fields correctly. Phone number must be 10 digits.")
      return
    }

    try {
      await updateUser({
        email: user.email,
        data: {
          name,
          phone,
          doorNoAndStreetName,
          area,
        },
      }).unwrap()
      Alert.alert("Success", "Address updated successfully!")
navigation.navigate('Intro')
    } catch (error: any) {
      console.error("Update failed:", error)
      Alert.alert("Update Failed", error?.data?.message || "Failed to update address. Please try again.")
    }
  }

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("cachelogged")
            dispatch(clearUserData())
            navigation.replace("Login")
          } catch (e) {
            console.error("Failed to clear async storage or logout:", e)
            Alert.alert("Logout Error", "Failed to log out. Please try again.")
          }
        },
      },
    ])
  }

  if (!user) {
    return (
      <LinearGradient
        colors={["#000000", "#011627"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.loadingContainer}
      >
        <Text style={styles.loadingText}>Loading user data...</Text>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient
      colors={["#000000", "#011627"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.fullScreenContainer}
    >
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.profileIconContainer}>
              <Ionicons name="person-circle-outline" size={width * 0.25} color="#FFD700" />
            </View>
            <Text style={styles.userName}>{user.name || "Guest User"}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>

          {/* Personal Information Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <View style={styles.inputGroup}>
              <Ionicons name="person-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Full Name"
                placeholderTextColor="#888"
              />
            </View>
            <View style={styles.inputGroup}>
              <Ionicons name="call-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={(text) => {
                  const input = text.replace(/\D/g, "")
                  if (input.length <= 10) setPhone(input)
                }}
                placeholder="Phone (10 digits)"
                placeholderTextColor="#888"
                keyboardType="number-pad"
                maxLength={10}
              />
            </View>
          </View>

          {/* Address Details Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Address Details</Text>
            <View style={styles.inputGroup}>
              <Ionicons name="home-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={doorNoAndStreetName}
                onChangeText={setDoorNoAndStreetName}
                placeholder="Door No. & Street Name"
                placeholderTextColor="#888"
              />
            </View>
            <View style={styles.inputGroup}>
              <Ionicons name="location-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={area}
                onChangeText={setArea}
                placeholder="Area"
                placeholderTextColor="#888"
              />
            </View>
            <View style={[styles.inputGroup, styles.disabledInputGroup]}>
              <Ionicons name="map-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={place}
                editable={false}
                placeholder="Place"
                placeholderTextColor="#888"
              />
            </View>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={[styles.updateButton, (!isFormValid() || !isChanged() || isLoading) && styles.disabledButton]}
            onPress={handleUpdate}
            disabled={!isFormValid() || !isChanged() || isLoading}
          >
            <Ionicons name="save-outline" size={20} color="#000" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>{isLoading ? "Updating..." : "Update Changes"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    fontSize: 18,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
    width: "100%",
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  profileIconContainer: {
    marginBottom: 15,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: width * 0.15, // Half of size for circle
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  userName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: "#ccc",
  },
  sectionCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFD700", // Yellow accent for titles
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    paddingBottom: 10,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)", // Darker background for inputs
    borderRadius: 10,
    paddingHorizontal: 15,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#fff",
    paddingVertical: 12,
    fontSize: 16,
  },
  disabledInputGroup: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  disabledInput: {
    color: "#888",
  },
  updateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFD700",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    width: "100%",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dc3545", // Red for logout
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    width: "100%",
    shadowColor: "#dc3545",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 18,
    marginLeft: 10, // Space between icon and text
  },
  logoutButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    marginLeft: 10, // Space between icon and text
  },
  buttonIcon: {
    // Styles for the icon inside the button
  },
  disabledButton: {
    opacity: 0.5,
  },
})

export default ProfileScreen
