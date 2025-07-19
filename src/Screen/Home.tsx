"use client"

import { ScrollView, StyleSheet, View, Text, ActivityIndicator } from "react-native"
import LinearGradient from "react-native-linear-gradient"
import { MainBannerTwo } from "../Components/MainBannerTwo"
import { Products } from "../Components/Products"
import { BannerThree } from "../Components/BannerThree"
import { Advertisement } from "../Components/Advertisement"
import MainBanner from "../Components/MainBanner"
import HorizontalCardList from "../Components/HorizontalCardList" // Import the new component
import { useGetFoodQuery } from "../Redux/Api/foodApi"
import { useGetGroceryQuery } from "../Redux/Api/groceryApi"
import { useGetVegetablesAndFruitsQuery } from "../Redux/Api/VegetablesAndFruits"
import { useGetToyboxzQuery } from "../Redux/Api/toyboxzApi"
import { useNavigation } from "@react-navigation/native"

const HomeScreen = () => {

  const navigation = useNavigation()

  const { data: FoodProducts = [], isLoading: productsLoading } = useGetFoodQuery()
  const { data: groceryProducts = [], isLoading: groceryLoading } = useGetGroceryQuery()
  const { data: vegetablesProducts = [], isLoading: vegetablesLoading } = useGetVegetablesAndFruitsQuery()

  const handleSeeMorePopular = (title: string) => {
  if (title === 'Groceries') {
      navigation.navigate('Grocery')

    } else if (title === 'Foods') {
      navigation.navigate('Food')

    } else {
      navigation.navigate('VegetablesAndFruits')

    }

  }

  return (
    <LinearGradient
      colors={["#000000", "#011627"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent} showsVerticalScrollIndicator={false}>
        <MainBanner />
        <MainBannerTwo />

        <Products />
        {!groceryLoading && groceryProducts.length > 0 && (
          <HorizontalCardList title="Groceries" data={groceryProducts} onSeeMore={handleSeeMorePopular} />
        )}

        {!productsLoading && FoodProducts.length > 0 && (
          <HorizontalCardList title="Foods" data={FoodProducts} onSeeMore={handleSeeMorePopular} />
        )}
        {!vegetablesLoading && vegetablesProducts.length > 0 && (
          <HorizontalCardList title="Vegetables & Fruits" data={vegetablesProducts} onSeeMore={handleSeeMorePopular} />
        )}
        {productsLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFD700" />
            <Text style={styles.loadingText}>Loading popular items...</Text>
          </View>
        )}

        <BannerThree />
        <Advertisement />
      </ScrollView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 20, // Add some padding at the bottom for better scroll experience
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
  },
})

export default HomeScreen
