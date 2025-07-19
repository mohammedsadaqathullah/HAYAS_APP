import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native"
import { useSelector } from "react-redux"
import { useNavigation } from "@react-navigation/native"
import Ionicons from "react-native-vector-icons/Ionicons"

const { width } = Dimensions.get("window")

const GoToCartBottomSheet = () => {
  const cart = useSelector((state: any) => state.cart.cart)
  const navigation = useNavigation()

  if (!cart || cart.length === 0) return null

  const totalItems = cart.length

  return (
    <View style={styles.goToCartSheet}>
      <View style={styles.textContainer}>
        <Ionicons name="cart-outline" size={20} color="#333" style={styles.cartIcon} />
        <Text style={styles.goToCartText}>{totalItems} item(s) in cart</Text>
      </View>
      <TouchableOpacity style={styles.goToCartButton} onPress={() => navigation.navigate("Cart")}>
        <Text style={styles.goToCartButtonText}>Go to Cart</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  goToCartSheet: {
    position: "absolute",
    bottom: 20, // Adjusted for better spacing from bottom
    left: 0,
    right: 0,
    marginHorizontal: 20, // Add horizontal margin
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
    width: width - 40, // Adjust width based on screen size
    alignSelf: "center", // Center horizontally
  },
  textContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  cartIcon: {
    marginRight: 8,
  },
  goToCartText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  goToCartButton: {
    backgroundColor: "#28a745", // Green button
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  goToCartButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
})

export default GoToCartBottomSheet
