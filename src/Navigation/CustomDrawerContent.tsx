import { View, Text, StyleSheet, TouchableOpacity, Image, Linking } from "react-native"
import { DrawerContentScrollView } from "@react-navigation/drawer"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useDispatch, useSelector } from "react-redux"
import { clearUserData } from "../Redux/slice/userSlice"
import type { RootState } from "../Redux/store" // Import RootState for useSelector
import LinearGradient from "react-native-linear-gradient"
import Icon from "react-native-vector-icons/Ionicons"
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import DeveloperFooter from "../Components/DeveloperFooter"

// Placeholder for user avatar

export const CustomDrawerContent = (props: any) => {
  const dispatch = useDispatch()
  // --- THIS IS WHERE USER DATA IS PULLED FROM REDUX ---
  const user = useSelector((state: RootState) => state.user) // Get user data from Redux

  const handleLogout = async () => {
    await AsyncStorage.removeItem("cachelogged")
    dispatch(clearUserData())
    props.navigation.replace("Intro") // Or 'IntroLottie' based on your app's intro flow
  }

  return (
    <LinearGradient
      colors={["#011627", "#000000"]} // Dark gradient for the drawer background
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollViewContent}>
        {/* Drawer Header - User Info */}
        <View style={styles.drawerHeader}>
          {/* <Image source={userAvatar} style={styles.avatar} /> */}
          {/* --- DISPLAYING USER DATA --- */}
          <Text style={styles.userName}>{user.name || "Guest User"}</Text>
          <Text style={styles.userEmail}>{user.email || "guest@example.com"}</Text>
        </View>

        {/* Drawer Items */}
        <View style={styles.drawerItemsContainer}>
          {props.state.routes.map((route: any, index: number) => {
            const { options } = props.descriptors[route.key]
            const label = options.title !== undefined ? options.title : route.name
            const isFocused = props.state.index === index

            let iconName = "home-outline" // Default icon
            switch (route.name) {
              case "HomeTabs":
                iconName = "home-outline"
                break
              case "ToyBoxz":
                iconName = "cube-outline"
                break
              case "Food":
                iconName = "fast-food-outline"
                break
              case "Grocery":
                iconName = "basket-outline"
                break
              case "VegetablesAndFruits":
                iconName = "leaf-outline"
                break
                case "Cart":
                iconName = "cart"
                break
              case "About":
                iconName = "information-circle-outline"
                break
                case "Intro":
                  iconName = "reload"
                  break
            }

            return (
              <TouchableOpacity
                key={route.key}
                onPress={() => props.navigation.navigate(route.name)}
                style={[styles.drawerItem, isFocused && styles.drawerItemFocused]}
              >
                <Icon name={iconName} size={22} color={isFocused ? "#facc15" : "#eee"} style={styles.drawerItemIcon} />
                <Text style={[styles.drawerItemText, isFocused && styles.drawerItemTextFocused]}>{label}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </DrawerContentScrollView>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <MaterialCommunityIcons name="logout" size={22} color="#d00" style={styles.logoutIcon} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* App Version */}
      <View style={styles.appVersionContainer}>
        <Text style={styles.appVersionText}>HAYAS v1.0.0</Text>
      </View>
      <TouchableOpacity style={styles.appVersionContainer} onPress={(()=>{
            Linking.openURL("https://wa.me/918220206483")
      })}>
        <Text style={{...styles.appVersionText,color:'lightblue'}}>Powered By &copy; {new Date().getFullYear()} Zii Techs</Text>
      </TouchableOpacity>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  drawerHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#facc15",
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: "#ccc",
  },
  drawerItemsContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 8,
  },
  drawerItemFocused: {
    backgroundColor: "rgba(252, 204, 21, 0.2)", // Highlight color for active item
  },
  drawerItemIcon: {
    marginRight: 15,
  },
  drawerItemText: {
    fontSize: 16,
    color: "#eee",
    fontWeight: "500",
  },
  drawerItemTextFocused: {
    color: "#facc15",
    fontWeight: "bold",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255, 0, 0, 0.1)", // Subtle red background for logout
  },
  logoutIcon: {
    marginRight: 10,
  },
  logoutText: {
    fontSize: 16,
    color: "#d00",
    fontWeight: "bold",
  },
  appVersionContainer: {
    padding: 10,
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  appVersionText: {
    fontSize: 12,
    color: "#888",
  },
})
