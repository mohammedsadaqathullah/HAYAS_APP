"use client"

import React from "react"
import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  FlatList,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import LinearGradient from "react-native-linear-gradient"
import GoToCartBottomSheet from "./GoToCartBottomSheet"
import ProductCard from "./ProductCard"

const { width } = Dimensions.get("window")
const SCREEN_HORIZONTAL_PADDING = 20 // Padding for the entire screen content
const GAP_BETWEEN_CARDS = 15 // Desired gap between cards in a row
const NUM_COLUMNS = 2

// Calculate CARD_WIDTH:
// Total available width for cards and gaps = screen width - 2 * screen horizontal padding
// This width needs to accommodate NUM_COLUMNS cards and (NUM_COLUMNS - 1) gaps between them.
// So, (NUM_COLUMNS * CARD_WIDTH) + ((NUM_COLUMNS - 1) * GAP_BETWEEN_CARDS) = width - 2 * SCREEN_HORIZONTAL_PADDING
// 2 * CARD_WIDTH = width - 2 * SCREEN_HORIZONTAL_PADDING - GAP_BETWEEN_CARDS
const CARD_WIDTH = (width - 2 * SCREEN_HORIZONTAL_PADDING - GAP_BETWEEN_CARDS) / NUM_COLUMNS

// Estimate a fixed height for getItemLayout.
// This needs to be carefully measured from the actual rendered card.
// Let's break it down:
// Image height: CARD_WIDTH * 0.8
// productInfo padding: 12 (top) + 12 (bottom) = 24
// productTitle height (approx): 16 (font size) + 4 (marginBottom) = 20
// productDescription height (approx for 2 lines): 11 (font size) * 2 (lines) + 8 (marginBottom) = 30
// quantitySection height (approx): 6 (paddingTop) + 6 (paddingBottom) + 30 (button height) + 8 (marginTop) = 50
// If two quantity sections: 50 * 2 = 100
// Total estimated height for a card with TWO quantity sections:
const ESTIMATED_CARD_HEIGHT = CARD_WIDTH * 0.8 + 24 + 20 + 30 + 50 + 50 + GAP_BETWEEN_CARDS // Add GAP_BETWEEN_CARDS for vertical spacing

const INITIAL_LOAD_COUNT = 25
const LOAD_MORE_COUNT = 25

interface Product {
  _id: string
  title: string
  description: string
  imageURL: string
  quantityOne: string
  quantityTwo?: string
}

interface ProductListScreenProps {
  title: string
  useGetProductsQuery: any // RTK Query hook
}

const ProductListScreen: React.FC<ProductListScreenProps> = ({ title, useGetProductsQuery }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [visibleProductsCount, setVisibleProductsCount] = useState(INITIAL_LOAD_COUNT)
  const [loadingMore, setLoadingMore] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  const { data: products = [], error, isLoading } = useGetProductsQuery()
  // Removed cart useSelector from here, as it's now in ProductCard

  // Debugging: Log product IDs to check for duplicates
  useEffect(() => {
    if (products.length > 0) {
      const ids = products.map((p: Product) => p._id)
      const uniqueIds = new Set(ids)
      if (ids.length !== uniqueIds.size) {
        console.warn(
          "Duplicate product IDs found in data:",
          ids.filter((id, index) => ids.indexOf(id) !== index),
        )
      } else {
        console.log("All product IDs are unique.")
      }
    }
  }, [products])

  const filteredProducts = products.filter(
    (product: Product) =>
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const loadMore = () => {
    if (!loadingMore && visibleProductsCount < filteredProducts.length) {
      setLoadingMore(true)
      setTimeout(() => {
        setVisibleProductsCount((prevCount) => Math.min(prevCount + LOAD_MORE_COUNT, filteredProducts.length))
        setLoadingMore(false)
      }, 500) // Simulate network delay
    }
  }

  // Render ProductCard component
  const renderProductCard = ({ item: product, index }: { item: Product; index: number }) => {
    return <ProductCard product={product} index={index} />
  }

  // getItemLayout for FlatList optimization
  const getItemLayout = React.useCallback(
    (data: any, index: number) => ({
      length: ESTIMATED_CARD_HEIGHT,
      offset: ESTIMATED_CARD_HEIGHT * index,
      index,
    }),
    [],
  )

  const renderFooter = () => {
    if (isLoading || loadingMore) {
      return (
        <View style={styles.loadingMoreContainer}>
          <ActivityIndicator size="small" color="#FFD700" />
          <Text style={styles.loadingMoreText}>Loading more...</Text>
        </View>
      )
    }
    if (visibleProductsCount >= filteredProducts.length && filteredProducts.length > INITIAL_LOAD_COUNT) {
      return (
        <View style={styles.endOfListContainer}>
          <Text style={styles.endOfListText}>End of list</Text>
        </View>
      )
    }
    if (filteredProducts.length === 0 && !isLoading && searchQuery === "") {
      return (
        <View style={styles.noProductsContainer}>
          <Text style={styles.noProductsIcon}>😔</Text>
          <Text style={styles.noProductsText}>No products available</Text>
        </View>
      )
    }
    if (filteredProducts.length === 0 && !isLoading && searchQuery !== "") {
      return (
        <View style={styles.noProductsContainer}>
          <Text style={styles.noProductsIcon}>🔎</Text>
          <Text style={styles.noProductsText}>No products found for "{searchQuery}"</Text>
        </View>
      )
    }
    return null
  }

  return (
    <LinearGradient
      colors={["#000000", "#011627"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.fullScreenContainer}
    >
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.foodContainer}>
          <View style={styles.foodHead}>
            <Text style={styles.heading}>{title}</Text>
          </View>

          <View
            style={[
              styles.searchContainer,
              isSearchFocused && styles.searchContainerFocused, // Apply focus style
            ]}
          >
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search Item Here..."
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
          </View>

          {isLoading && filteredProducts.length === 0 ? (
            // Render loading indicator within the same padded area as FlatList content
            <View style={[styles.loadingIndicator, { paddingHorizontal: SCREEN_HORIZONTAL_PADDING }]}>
              <ActivityIndicator size="large" color="#FFD700" />
              <Text style={styles.loadingText}>Loading products...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredProducts.slice(0, visibleProductsCount)}
              renderItem={renderProductCard}
              keyExtractor={(item) => item._id} // Use _id as key, assuming it's always present and unique
              numColumns={NUM_COLUMNS}
              columnWrapperStyle={styles.row}
              contentContainerStyle={styles.foodBoxes} // This now includes horizontal padding
              onEndReached={loadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={renderFooter}
              ListEmptyComponent={
                !isLoading && filteredProducts.length === 0 && searchQuery === "" ? (
                  <View style={styles.noProductsContainer}>
                    <Text style={styles.noProductsIcon}>😔</Text>
                    <Text style={styles.noProductsText}>No products available</Text>
                  </View>
                ) : null
              }
              getItemLayout={getItemLayout} // Add getItemLayout for performance
              initialNumToRender={INITIAL_LOAD_COUNT} // Render more initially
              maxToRenderPerBatch={LOAD_MORE_COUNT} // Render more per batch
              windowSize={21} // Keep more items in memory
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </KeyboardAvoidingView>
      <GoToCartBottomSheet />
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  foodContainer: {
    flex: 1,
    paddingTop: 20,
  },
  foodHead: {
    marginBottom: 20,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING, // Apply padding to header
  },
  heading: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    marginHorizontal: SCREEN_HORIZONTAL_PADDING, // Apply padding to search bar
  },
  searchContainerFocused: {
    borderColor: "#FFD700",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  searchIcon: {
    fontSize: 20,
    color: "#888",
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    color: "#fff",
    fontSize: 16,
  },
  foodBoxes: {
    paddingBottom: 80, // Space for the bottom sheet
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING, // Apply padding here for FlatList content
  },
  row: {
    justifyContent: "flex-start", // Align items to the start, margins will handle spacing
    marginBottom: GAP_BETWEEN_CARDS, // Vertical gap between rows
  },
  cardWrapper: {
    width: CARD_WIDTH, // Use the precisely calculated width
    marginBottom: GAP_BETWEEN_CARDS, // Vertical gap below each card
    // marginRight is applied conditionally in renderProductCard
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
  loadingIndicator: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
    width: "100%", // Ensure it takes full width
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
  },
  loadingMoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
  },
  loadingMoreText: {
    color: "#ccc",
    marginLeft: 10,
    fontSize: 16,
  },
  endOfListContainer: {
    alignItems: "center",
    paddingVertical: 15,
  },
  endOfListText: {
    color: "#888",
    fontSize: 14,
  },
  noProductsContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  noProductsIcon: {
    fontSize: 60,
    color: "#ccc",
    marginBottom: 10,
  },
  noProductsText: {
    color: "#ccc",
    fontSize: 18,
    marginTop: 10,
    textAlign: "center",
  },
})

export default ProductListScreen
