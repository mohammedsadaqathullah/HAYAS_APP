import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import Ionicons from "react-native-vector-icons/Ionicons"

import { StyleSheet } from "react-native"
import HomeScreen from "../Screen/Home"
import CartScreen from "../Screen/CartScreen"

const Tab = createBottomTabNavigator()

export default function BottomTabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false, // Keep header hidden as requested
        tabBarStyle: styles.tabBar, // Apply custom styles to the tab bar
        tabBarActiveTintColor: "#facc15", // Active icon and label color (yellow highlight)
        tabBarInactiveTintColor: "#ccc", // Inactive icon and label color
        tabBarLabelStyle: styles.tabBarLabel, // Style for the label text
        tabBarHideOnKeyboard: true, // Hide tab bar when keyboard is open
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
          tabBarLabel: "Home", // Explicitly set label
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="cart" size={size} color={color} />,
          tabBarLabel: "Cart", // Explicitly set label
        }}
      />
    </Tab.Navigator>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#011627", // Dark background for the tab bar
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)", // Subtle top border
    height: 60, // Adjust height as needed
    paddingBottom: 5, // Padding for safe area on newer devices
    shadowColor: "#000", // Shadow for depth
    shadowOffset: {
      width: 0,
      height: -5, // Shadow upwards
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 10, // Android shadow
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 3, // Adjust label position
  },
})
