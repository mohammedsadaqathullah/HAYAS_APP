import { createDrawerNavigator } from "@react-navigation/drawer"
import BottomTabsNavigator from "./BottomTabNavigator" // Assuming this exists
import { CustomDrawerContent } from "./CustomDrawerContent"
import ToyBoxzScreen from "../Screen/ToyBoxzScreen"
import FoodsScreen from "../Screen/FoodsScreen"
import GroceryScreen from "../Screen/GroceryScreen"
import VegetablesScreen from "../Screen/VegetablesScreen"
import AboutScreen from "../Screen/AboutScreen"
import { Header } from "../Components/Header"
import CartScreen from "../Screen/CartScreen"
import ProfileScreen from "../Screen/ProfileScreen"
import IntroLottie from "../IntroLottie"


const Drawer = createDrawerNavigator()

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="HomeTabs"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        header: (props) => <Header {...props} />, // Use our custom header
        drawerStyle: {
          width: 280, // Adjust drawer width
        },
      }}

    >

      <Drawer.Screen name="HomeTabs" component={BottomTabsNavigator} options={{ title: "Home" }} />
      <Drawer.Screen name="ToyBoxz" component={ToyBoxzScreen} options={{ title: "ToyBoxz" }} />
      <Drawer.Screen name="Food" component={FoodsScreen} options={{ title: "Food" }} />
      <Drawer.Screen name="Grocery" component={GroceryScreen} options={{ title: "Grocery" }} />
      <Drawer.Screen
        name="VegetablesAndFruits"
        component={VegetablesScreen}
        options={{ title: "Vegetables & Fruits" }}
      />
      <Drawer.Screen name="Cart" component={CartScreen} options={{ title: "Cart" }} />
      <Drawer.Screen name="Profile" component={ProfileScreen} options={{ title: "Profile" }} />
      <Drawer.Screen name="About" component={AboutScreen} options={{ title: "About Us" }} />
      <Drawer.Screen name="Intro" component={IntroLottie} options={{ title: "Reload App" ,headerShown: false}}  />

    </Drawer.Navigator>
  )
}
