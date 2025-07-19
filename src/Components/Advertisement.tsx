import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from "react-native"
import { useNavigation } from "@react-navigation/native"

const { width } = Dimensions.get("window")

export const Advertisement = () => {
  const navigation = useNavigation()

  const goToFood = () => {
    navigation.navigate("Food")
  }

  return (
    <View style={styles.advertisementContainer}>
      {/* First Ad */}
      <View style={styles.adRow}>
        <View style={styles.adImageContainer}>
          <Image source={require( "../Assets/shawarmaOffer.jpg")} style={styles.adImage} resizeMode="contain" />
        </View>
        <View style={styles.adText}>
          <Text style={styles.adTitle}>Shawarma at Lucky Hotel</Text>
          <Text style={styles.adDescription}>Order three and get delivery free! Available now in Eruvadi.</Text>
          <TouchableOpacity style={styles.orderButton} onPress={goToFood}>
            <Text style={styles.orderButtonText}>Order Now</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Second Ad */}
      <View style={[styles.adRow, styles.reverseAdRow]}>
        <View style={styles.adText}>
          <Text style={styles.adTitle}>Biriyani at Aasife</Text>
          <Text style={styles.adDescription}>Famous restaurant with a truly unique taste you can’t miss.</Text>
          <TouchableOpacity style={styles.orderButton} onPress={goToFood}>
            <Text style={styles.orderButtonText}>Order Now</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.adImageContainer}>
          <Image source={require( "../Assets/aasifeOffer.jpg")} style={styles.adImage} resizeMode="contain" />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  advertisementContainer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  adRow: {
    flexDirection: "column", // Always column for mobile
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 15,
    marginBottom: 30,
    padding: 20,
    width: width * 0.9,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  reverseAdRow: {
    flexDirection: "column-reverse", // Reverse order for the second ad
  },
  adImageContainer: {
    width: "100%",
    height: width * 0.9 * (12 / 17), // Maintain aspect ratio
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 20,
  },
  adImage: {
    width: "100%",
    height: "100%",
  },
  adText: {
    alignItems: "center",
    textAlign: "center",
  },
  adTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
  },
  adDescription: {
    fontSize: 16,
    color: "#eee",
    marginBottom: 20,
    textAlign: "center",
  },
  orderButton: {
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
  orderButtonText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
  },
})
