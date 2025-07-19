import { StyleSheet } from "react-native"
import LinearGradient from "react-native-linear-gradient"
import { useGetVegetablesAndFruitsQuery } from "../Redux/Api/VegetablesAndFruits" // Assuming this path is correct
import ProductListScreen from "../Components/ProductListScreen"

const VegetablesAndFruitsScreen = () => {
  return (
    <LinearGradient
      colors={["#000000", "#011627"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ProductListScreen title="Vegetables And Fruits List" useGetProductsQuery={useGetVegetablesAndFruitsQuery} />
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})

export default VegetablesAndFruitsScreen
