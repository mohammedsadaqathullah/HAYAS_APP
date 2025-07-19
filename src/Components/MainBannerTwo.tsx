import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from "react-native"
import { useNavigation } from "@react-navigation/native"
import HorizontalCardList from "./HorizontalCardList"
import { useGetToyboxzQuery } from "../Redux/Api/toyboxzApi"

const { width } = Dimensions.get("window")

export const MainBannerTwo = () => {

  const navigation = useNavigation()
  const { data: toyBoxzProducts = [], isLoading: toyBoxzLoading } = useGetToyboxzQuery()


  const handleSeeMorePopular = (title: string) => {
   
      navigation.navigate('ToyBoxz')
 
  }

  return (
    <View style={styles.mainBannerTwo}>
      <View style={styles.bannerContent}>
        {/* Left: Image */}
       
        {/* Right: Text */}
        <View style={styles.glassContainerTwo}>
        <View style={styles.bannerImageWrapper}>
          <Image source={require("../Assets/ToyBoxz.jpg")} style={styles.bannerImage} resizeMode="contain" />
        </View>
          <Text style={styles.bannerTitle}>
            Discover the World of <Text style={styles.highlight}>ToyBoxz</Text>
          </Text>
          <Text style={styles.bannerSubtitle}>Imagination unlocked—find magical toys for every age.</Text>

  {!toyBoxzLoading && toyBoxzProducts.length > 0 && (
          <HorizontalCardList title="Popular Toys" data={toyBoxzProducts} onSeeMore={handleSeeMorePopular} />
        )}

          <TouchableOpacity style={styles.ctaButton} onPress={() => navigation.navigate("ToyBoxz")}>
            <Text style={styles.ctaButtonText}>Explore ToyBoxz</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  mainBannerTwo: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerContent: {
    flexDirection: "column",
    alignItems: "center",
    width: width * 0.9,
  },
  bannerImageWrapper: {
    width: "100%",
    height: width * 0.9 * (9 / 16), // Maintain aspect ratio
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  glassContainerTwo: {
    backgroundColor: "rgba(255, 255, 255, 0.09)",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    width: "100%",
  },
  bannerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
  },
  highlight: {
    color: "#facc15",
  },
  bannerSubtitle: {
    fontSize: 16,
    color: "#eee",
    textAlign: "center",
    marginBottom: 20,
  },
  ctaButton: {
    backgroundColor: "#facc15",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    shadowColor: "#facc15",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  ctaButtonText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
  },
})
