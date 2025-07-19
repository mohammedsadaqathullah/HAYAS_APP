import { StyleSheet } from "react-native"
import LinearGradient from "react-native-linear-gradient"
import { useGetToyboxzQuery } from "../Redux/Api/toyboxzApi" // Assuming this path is correct
import ProductListScreen from "../Components/ProductListScreen"

const ToyboxzScreen = () => {
  return (
    <LinearGradient
      colors={["#000000", "#011627"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ProductListScreen title="Toyboxz" useGetProductsQuery={useGetToyboxzQuery} />
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

export default ToyboxzScreen
