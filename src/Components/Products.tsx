import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from "react-native"
import { useNavigation } from "@react-navigation/native"

const { width } = Dimensions.get("window")

import food from "../Assets/food.png"
import grocery from "../Assets/grocery.png"
import vegetablesAndFruits from "../Assets/vegetables&fruits.png"

export const Products = () => {
  const navigation = useNavigation()
  const categories = [
    { to: "Grocery", src: grocery, alt: "Grocery", label: "Grocery" },
    { to: "Food", src: food, alt: "Foods", label: "Foods" },
    { to: "VegetablesAndFruits", src: vegetablesAndFruits, alt: "Vegetables & Fruits", label: "Vegetables & Fruits" },
  ]

  return (
    <View style={styles.categoriesContainer}>
      {categories.map(({ to, src, alt, label }, index) => (
        <TouchableOpacity key={index} style={styles.categoryCard} onPress={() => navigation.navigate(to)}>
          <Image source={src} style={styles.categoryImage} />
          <Text style={styles.categoryLabel}>{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    padding: 20,
    gap: 20, // Use gap for spacing
  },
  categoryCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    width: (width - 60) / 2, // Two cards per row with 20px padding on each side and 20px gap
    aspectRatio: 1, // Make cards square
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  categoryImage: {
    width: "80%",
    height: "80%",
    resizeMode: "contain",
    marginBottom: 10,
  },
  categoryLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
})
