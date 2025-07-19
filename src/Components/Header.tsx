import { View, Text, StyleSheet, TouchableOpacity, Image, Pressable } from "react-native"
import type { DrawerHeaderProps } from "@react-navigation/drawer"
import Icon from "react-native-vector-icons/Ionicons"
import { useSelector } from "react-redux"
import type { RootState } from "../Redux/store"
import Svg, { Path } from 'react-native-svg';

// Placeholder for user avatar
import userAvatar from "../Assets/logoWhite.png" // Create this image file

export const Header = ({ navigation, route, options }: DrawerHeaderProps) => {
  const user = useSelector((state: RootState) => state.user) // Get user data from Redux

  const title = options.title !== undefined ? options.title : route.name

  return (
    <View style={styles.headerContainer}>
      {/* Left: Drawer Toggle */}
      <Pressable
        onPress={() => navigation.toggleDrawer()}
        style={({ pressed }) => [
          styles.iconButton,
          { opacity: pressed ? 0.6 : 1 },
        ]}
      >
       <Svg width={30} height={30} viewBox="0 0 24 24" stroke="#fff" fill="none" strokeWidth="2">
  <Path d="M3 7h10M3 12h14M3 17h7" />
</Svg>

      </Pressable>

      {/* Center: Title */}
      <Text style={styles.headerTitle}>{title}</Text>

      {/* Right: User Avatar/Profile */}
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('Profile')
        }}
        style={styles.iconButton}
      >
        <Image source={userAvatar} style={styles.avatar} resizeMode="contain" />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    height: 60,
    backgroundColor: "#011627", // Dark background matching app theme
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    borderWidth: 1,
    borderColor: "#facc15",
  },
})

