"use client"

import React from "react"
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from "react-native"
import { useSelector, useDispatch } from "react-redux"
import { updateQuantity } from "../Redux/slice/cartSlice" // Adjust path as needed

const { width } = Dimensions.get("window")
const SCREEN_HORIZONTAL_PADDING = 20
const GAP_BETWEEN_CARDS = 15
const NUM_COLUMNS = 2
const CARD_WIDTH = (width - 2 * SCREEN_HORIZONTAL_PADDING - GAP_BETWEEN_CARDS) / NUM_COLUMNS

interface Product {
  _id: string
  title: string
  description: string
  imageURL: string
  quantityOne: string
  quantityTwo?: string
}

interface ProductCardProps {
  product: Product
  index: number // Needed for conditional marginRight in FlatList
}

const ProductCard: React.FC<ProductCardProps> = React.memo(({ product, index }) => {
  const dispatch = useDispatch()

  // Use useSelector to get only the relevant quantity for THIS specific product
  // This selector will only cause THIS ProductCard to re-render if its specific quantity changes
  const quantityOneCount = useSelector(
    (state: any) =>
      state.cart.cart.find((item: any) => item._id === product._id && item.quantityType === "One")?.count || 0,
  )
  const quantityTwoCount = useSelector(
    (state: any) =>
      state.cart.cart.find((item: any) => item._id === product._id && item.quantityType === "Two")?.count || 0,
  )

  const handleUpdateQuantity = (quantityType: string, actionType: "increase" | "decrease") => {
    dispatch(updateQuantity({ product, quantityType, actionType }))
  }

  return (
    <View
      style={[
        styles.cardWrapper,
        index % NUM_COLUMNS !== NUM_COLUMNS - 1 && { marginRight: GAP_BETWEEN_CARDS }, // Apply margin to all but the last column
      ]}
    >
      <View style={styles.card}>
        <Image source={{ uri: product.imageURL }} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={styles.productTitle} numberOfLines={1} ellipsizeMode="tail">
            {product.title}
          </Text>
          <Text style={styles.productDescription} numberOfLines={2} ellipsizeMode="tail">
            {product.description}
          </Text>

          {/* Quantity One */}
          <View style={styles.quantitySection}>
            <Text style={styles.quantityLabel}>{product.quantityOne}</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity onPress={() => handleUpdateQuantity("One", "decrease")} style={styles.quantityButton}>
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityCountText}>{quantityOneCount}</Text>
              <TouchableOpacity onPress={() => handleUpdateQuantity("One", "increase")} style={styles.quantityButton}>
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quantity Two (if exists) */}
          {product.quantityTwo && product.quantityTwo !== "0" && product.quantityTwo !== "" && (
            <View style={styles.quantitySection}>
              <Text style={styles.quantityLabel}>{product.quantityTwo}</Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity onPress={() => handleUpdateQuantity("Two", "decrease")} style={styles.quantityButton}>
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityCountText}>{quantityTwoCount}</Text>
                <TouchableOpacity onPress={() => handleUpdateQuantity("Two", "increase")} style={styles.quantityButton}>
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  cardWrapper: {
    width: CARD_WIDTH,
    marginBottom: GAP_BETWEEN_CARDS,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 12,
    flex: 1,
  },
  productImage: {
    width: "100%",
    height: CARD_WIDTH * 0.8,
    resizeMode: "cover",
  },
  productInfo: {
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  productTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 11,
    color: "#ccc",
    marginBottom: 8,
  },
  quantitySection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  quantityLabel: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  quantityButton: {
    backgroundColor: "#FFD700",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  quantityButtonText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
  },
  quantityCountText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    minWidth: 20,
    textAlign: "center",
  },
})

export default ProductCard
