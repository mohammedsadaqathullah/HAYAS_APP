import { StyleSheet } from "react-native"
import LinearGradient from "react-native-linear-gradient"
import { useGetGroceryQuery } from "../Redux/Api/groceryApi" // Assuming this path is correct
import ProductListScreen from "../Components/ProductListScreen"

const GroceryScreen = () => {
  return (
    <LinearGradient
      colors={["#000000", "#011627"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ProductListScreen title="Grocery List" useGetProductsQuery={useGetGroceryQuery} />
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 20,
  },
  text: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
})

export default GroceryScreen
