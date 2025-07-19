"use client"

import React, { useRef, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions, Image, Animated } from "react-native"
import { useSelector, useDispatch } from "react-redux"
import { updateQuantity } from "../Redux/slice/cartSlice" // Adjust path as needed

const { width } = Dimensions.get("window")
const SCREEN_HORIZONTAL_PADDING = 20 // Consistent with ProductListScreen
const CARD_HORIZONTAL_MARGIN = 15 // Margin between cards in the horizontal list
const CARD_WIDTH_HORIZONTAL = width * 0.28 // Very small cards (28% of screen width)
const MAX_DISPLAY_ITEMS = 10 // Maximum number of items to display before "See More"

// Estimate a fixed height for getItemLayout for horizontal FlatList
// Re-calculating based on CARD_WIDTH_HORIZONTAL = width * 0.28
// Image height: CARD_WIDTH_HORIZONTAL * 0.8
// productInfo padding: 10 (top) + 10 (bottom) = 20
// productTitle (2-3 lines assumed for very small width): 12 * 2.5 + 4 = 34 (using very small font size)
// productDescription (3-4 lines assumed for very small width): 8 * 3.5 + 8 = 36 (using very small font size)
// quantitySection (one): 6 + 6 + 20 (button height) + 8 = 40 (using very small button size)
// quantitySection (two): 40 * 2 = 80
const ESTIMATED_CARD_HEIGHT_HORIZONTAL = CARD_WIDTH_HORIZONTAL * 0.8 + 20 + 34 + 36 + 80

interface Product {
  _id: string
  title: string
  description: string
  imageURL: string
  quantityOne: string
  quantityTwo?: string
}

interface HorizontalCardListProps {
  title: string
  data: Product[] 
  onSeeMore: any 
}

// Nested component for individual horizontal product items
const HorizontalProductItem: React.FC<{ product: Product; cardWidth: number }> = React.memo(
  ({ product, cardWidth }) => {
    const dispatch = useDispatch()
    const animatedOpacity = useRef(new Animated.Value(0)).current
    const animatedTranslateY = useRef(new Animated.Value(20)).current

    useEffect(() => {
      Animated.parallel([
        Animated.timing(animatedOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(animatedTranslateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start()
    }, [])

    const quantityOneCount = useSelector(
      (state: any) =>
        state.cart.cart.find((cartItem: any) => cartItem._id === product._id && cartItem.quantityType === "One")
          ?.count || 0,
    )
    const quantityTwoCount = useSelector(
      (state: any) =>
        state.cart.cart.find((cartItem: any) => cartItem._id === product._id && cartItem.quantityType === "Two")
          ?.count || 0,
    )

    const handleUpdateQuantity = (quantityType: string, actionType: "increase" | "decrease") => {
      dispatch(updateQuantity({ product, quantityType, actionType }))
    }

    return (
      <Animated.View
        style={[
          styles.cardWrapper,
          { width: cardWidth },
          { opacity: animatedOpacity, transform: [{ translateY: animatedTranslateY }] },
          { marginRight: CARD_HORIZONTAL_MARGIN },
        ]}
      >
        <View style={styles.card}>
          <Image source={{ uri: product.imageURL }} style={styles.productImage} />
          <View style={styles.productInfo}>
            <Text style={styles.productTitle} numberOfLines={1} ellipsizeMode="tail">
              {product.title}
            </Text>
            <Text style={styles.productDescription} numberOfLines={3} ellipsizeMode="tail">
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
                  <TouchableOpacity
                    onPress={() => handleUpdateQuantity("Two", "decrease")}
                    style={styles.quantityButton}
                  >
                    <Text style={styles.quantityButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantityCountText}>{quantityTwoCount}</Text>
                  <TouchableOpacity
                    onPress={() => handleUpdateQuantity("Two", "increase")}
                    style={styles.quantityButton}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    )
  },
)

const HorizontalCardList: React.FC<HorizontalCardListProps> = ({ title, data, onSeeMore }) => {
  // Slice the data to display a maximum of MAX_DISPLAY_ITEMS
  const displayedData = data.slice(0, MAX_DISPLAY_ITEMS)
  const showSeeMoreButton = data.length > MAX_DISPLAY_ITEMS

  const renderItem = ({ item, index }: { item: Product; index: number }) => (
    <HorizontalProductItem product={item} cardWidth={CARD_WIDTH_HORIZONTAL} />
  )

  const getItemLayout = React.useCallback(
    (data: any, index: number) => ({
      length: CARD_WIDTH_HORIZONTAL + CARD_HORIZONTAL_MARGIN,
      offset: (CARD_WIDTH_HORIZONTAL + CARD_HORIZONTAL_MARGIN) * index,
      index,
    }),
    [],
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {showSeeMoreButton && (
          <TouchableOpacity onPress={()=>onSeeMore(title)} style={styles.seeMoreButton}>
            <Text style={styles.seeMoreText}>See More</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={displayedData} // Use the sliced data here
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
        getItemLayout={getItemLayout}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={11}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 30,
    marginTop:20,
    height:250
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    marginBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  seeMoreButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  seeMoreText: {
    color: "#FFD700",
    fontSize: 14,
    fontWeight: "bold",
  },
  flatListContent: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
  },
  // --- Styles for the individual cards within HorizontalProductItem ---
  cardWrapper: {
    // width is set dynamically by prop
    // marginRight is set dynamically by prop
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
    height: CARD_WIDTH_HORIZONTAL * 0.5, // Image height based on card width
    resizeMode: "cover",
  },
  productInfo: {
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  productTitle: {
    fontSize: 12, // Smaller font for very small cards
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 8, // Smaller font for very small cards
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
    fontSize: 10, // Smaller font for very small cards
    color: "#fff",
    fontWeight: "500",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  quantityButton: {
    backgroundColor: "#FFD700",
    width: 20, // Even smaller buttons for very small cards
    height: 20,
    borderRadius: 10,
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
    fontSize: 12, // Even smaller text for very small buttons
    fontWeight: "bold",
  },
  quantityCountText: {
    color: "#fff",
    fontSize: 12, // Smaller font for very small cards
    fontWeight: "bold",
    minWidth: 12,
    textAlign: "center",
  },
})

export default HorizontalCardList
