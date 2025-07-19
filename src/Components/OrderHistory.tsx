"use client"
import { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Animated,
  Dimensions,
} from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons" // Assuming Ionicons is installed

const PAGE_SIZE = 5 // Initially render 5 orders, then load 5 more
const { height: screenHeight } = Dimensions.get("window")

const OrderHistory = ({ orders }: { orders: any[] }) => {
  const [visibleOrdersCount, setVisibleOrdersCount] = useState(PAGE_SIZE)
  const [loadingMore, setLoadingMore] = useState(false)
  const [showHistory, setShowHistory] = useState(false) // State to control visibility

  // Animated values for the reveal animation
  const animatedHeight = useRef(new Animated.Value(0)).current
  const animatedOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (showHistory) {
      Animated.parallel([
        Animated.timing(animatedHeight, {
          toValue: screenHeight, // Animate to a large height to reveal content
          duration: 500,
          useNativeDriver: false, // Height animation requires useNativeDriver: false
        }),
        Animated.timing(animatedOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false, // Opacity can be native, but parallel with height means false
        }),
      ]).start()
    } else {
      // Only animate out if it was previously shown
      if (animatedHeight._value > 0) {
        Animated.parallel([
          Animated.timing(animatedHeight, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(animatedOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          }),
        ]).start()
      }
    }
  }, [showHistory])

  if (!orders || orders.length === 0) {
    return (
      <View style={styles.noOrdersContainer}>
        <Ionicons name="receipt-outline" size={60} color="#888" />
        <Text style={styles.noOrdersText}>No order history available</Text>
      </View>
    )
  }

  const getStatusBadge = (status: string) => {
    let badgeStyle = styles.statusBadgeDefault
    let badgeText = status
    switch (status) {
      case "PENDING":
        badgeStyle = styles.statusBadgePending
        break
      case "CONFIRMED":
        badgeStyle = styles.statusBadgeConfirmed
        break
      case "DELIVERED":
        badgeStyle = styles.statusBadgeDelivered
        break
      case "CANCELLED":
        badgeStyle = styles.statusBadgeCancelled
        break
      case "TIMEOUT":
        badgeStyle = styles.statusBadgeTimeout
        badgeText = "TIMED OUT" // More descriptive
        break
      default:
        break
    }
    return <Text style={[styles.statusBadge, badgeStyle]}>{badgeText}</Text>
  }

  const loadMoreOrders = () => {
    if (visibleOrdersCount < orders.length) {
      setLoadingMore(true)
      setTimeout(() => {
        setVisibleOrdersCount((prevCount) => Math.min(prevCount + PAGE_SIZE, orders.length))
        setLoadingMore(false)
      }, 500) // Simulate network delay
    }
  }

  const renderFooter = () => {
    if (loadingMore) {
      return (
        <View style={styles.loadingMoreContainer}>
          <ActivityIndicator size="small" color="#facc15" />
          <Text style={styles.loadingMoreText}>Loading more...</Text>
        </View>
      )
    }
    if (visibleOrdersCount >= orders.length) {
      return (
        <View style={styles.endOfListContainer}>
          <Text style={styles.endOfListText}>End of history</Text>
        </View>
      )
    }
    return (
      <TouchableOpacity onPress={loadMoreOrders} style={styles.loadMoreButton}>
        <Text style={styles.loadMoreButtonText}>Load More ({orders.length - visibleOrdersCount} remaining)</Text>
      </TouchableOpacity>
    )
  }

  const renderOrderItem = ({ item: order }: { item: any }) => {
    const { _id, address, createdAt, products, status } = order
    return (
      <View key={_id} style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View style={styles.orderHeaderTop}>
            <Text style={styles.customerName}>{address?.name}</Text>
            {getStatusBadge(status)}
          </View>
          <Text style={styles.customerContact}>{address?.phone}</Text>
          <Text style={styles.customerAddress}>
            {address?.street}, {address?.area}
          </Text>
          <Text style={styles.customerAddress}>{address?.defaultAddress}</Text>
          <Text style={styles.orderDate}>{new Date(createdAt).toLocaleString()}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.orderProducts}>
          {products.map((product: any) => (
            <View key={product._id} style={styles.productItem}>
              <Text style={styles.productTitle}>
                {product.title} <Text style={styles.productCount}>× {product.count}</Text>
              </Text>
              {product.quantityTwo && product.quantityTwo !== "0" && (
                <Text style={styles.productExtra}>{product.quantityTwo}</Text>
              )}
            </View>
          ))}
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {!showHistory && (
        <TouchableOpacity onPress={() => setShowHistory(true)} style={styles.showHistoryButton}>
          <Ionicons name="time-outline" size={24} color="#facc15" />
          <Text style={styles.showHistoryButtonText}>View Order History</Text>
        </TouchableOpacity>
      )}

      <Animated.View
        style={[
          styles.animatedContainer,
          {
            maxHeight: animatedHeight, // Animate max height
            opacity: animatedOpacity, // Animate opacity
            overflow: "hidden", // Hide content when collapsed
          },
        ]}
      >
        {showHistory && ( // Only render FlatList when showHistory is true to avoid initial rendering issues
          <FlatList
            data={orders.slice(0, visibleOrdersCount)}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item._id}
            ListFooterComponent={renderFooter}
            onEndReached={loadMoreOrders}
            onEndReachedThreshold={0.5}
            contentContainerStyle={styles.flatListContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20, // Add horizontal padding to the main container
    paddingTop: 20, // Add some top padding
  },
  showHistoryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(252, 204, 21, 0.15)",
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#facc15",
    marginBottom: 20,
    shadowColor: "#facc15",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  showHistoryButtonText: {
    color: "#facc15",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  animatedContainer: {
    flex: 1, // Allow it to take available space when expanded
  },
  noOrdersContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  noOrdersText: {
    color: "#ccc",
    fontSize: 18,
    marginTop: 10,
  },
  flatListContent: {
    paddingBottom: 20, // Add some padding at the bottom of the list
  },
  orderCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  orderHeader: {
    marginBottom: 10,
  },
  orderHeaderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  customerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  customerContact: {
    fontSize: 14,
    color: "#ccc",
    marginBottom: 2,
  },
  customerAddress: {
    fontSize: 14,
    color: "#ccc",
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginVertical: 10,
  },
  orderProducts: {},
  productItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  productTitle: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "500",
  },
  productCount: {
    fontSize: 14,
    color: "#facc15",
    fontWeight: "bold",
  },
  productExtra: {
    fontSize: 13,
    color: "#ccc",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  statusBadgeDefault: {
    backgroundColor: "#888",
    color: "#fff",
  },
  statusBadgePending: {
    backgroundColor: "rgba(252, 204, 21, 0.2)",
    color: "#facc15",
  },
  statusBadgeConfirmed: {
    backgroundColor: "rgba(40, 167, 69, 0.2)",
    color: "#28a745",
  },
  statusBadgeDelivered: {
    backgroundColor: "rgba(0, 123, 255, 0.2)",
    color: "#007bff",
  },
  statusBadgeCancelled: {
    backgroundColor: "rgba(220, 53, 69, 0.2)",
    color: "#dc3545",
  },
  statusBadgeTimeout: {
    backgroundColor: "rgba(255, 99, 71, 0.2)",
    color: "#ff6347",
  },
  loadMoreButton: {
    backgroundColor: "rgba(252, 204, 21, 0.15)",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
    borderWidth: 1,
    borderColor: "#facc15",
  },
  loadMoreButtonText: {
    color: "#facc15",
    fontSize: 16,
    fontWeight: "bold",
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
})

export default OrderHistory
