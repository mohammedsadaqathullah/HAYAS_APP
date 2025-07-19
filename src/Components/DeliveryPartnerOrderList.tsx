"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from "react-native"
import { io } from "socket.io-client"
import Ionicons from "react-native-vector-icons/Ionicons"
import LinearGradient from "react-native-linear-gradient"
import baseUrl from "../Redux/Api/baseUrl"

const socket = io(baseUrl)

const DeliveryPartnerOrderList = ({ partnerEmail }: { partnerEmail: string }) => {
  const [availableOrders, setAvailableOrders] = useState<any[]>([])
  const [processingOrders, setProcessingOrders] = useState<Set<string>>(new Set())
  const [hiddenOrders, setHiddenOrders] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (partnerEmail) {
      socket.emit("join", partnerEmail)

      // Listen for new orders
      socket.on("new-order", (data) => {
        const { order, isRetry } = data
        console.log(`📦 New order received: ${order._id}`, isRetry ? "(RETRY)" : "")
        // Add order to available list if not hidden
        if (!hiddenOrders.has(order._id)) {
          setAvailableOrders((prev) => {
            const exists = prev.find((o) => o._id === order._id)
            if (!exists) {
              return [order, ...prev]
            }
            return prev
          })
        }
      })

      // Listen for order no longer available
      socket.on("order-no-longer-available", (data) => {
        const { orderId, assignedTo, action } = data
        console.log(`❌ Order ${orderId} no longer available - assigned to ${assignedTo}`)
        if (action === "hide_order") {
          // Hide order from UI
          setHiddenOrders((prev) => new Set([...prev, orderId]))
          setAvailableOrders((prev) => prev.filter((order) => order._id !== orderId))
          setProcessingOrders((prev) => {
            const newSet = new Set(prev)
            newSet.delete(orderId)
            return newSet
          })
        }
      })

      // Listen for order available again
      socket.on("order-available-again", (data) => {
        const { order } = data
        console.log(`🔄 Order ${order._id} available again`)
        // Remove from hidden orders and add back to available
        setHiddenOrders((prev) => {
          const newSet = new Set(prev)
          newSet.delete(order._id)
          return newSet
        })
        setAvailableOrders((prev) => {
          const exists = prev.find((o) => o._id === order._id)
          if (!exists) {
            return [order, ...prev]
          }
          return prev
        })
      })

      // Listen for order status updates
      socket.on("order-status-updated", (data) => {
        const { order } = data
        console.log(`📊 Order status updated: ${order._id} - ${order.status}`)
        // Remove from available orders if confirmed or delivered
        if (order.status === "CONFIRMED" || order.status === "DELIVERED") {
          setAvailableOrders((prev) => prev.filter((o) => o._id !== order._id))
        }
      })
    }

    return () => {
      socket.off("new-order")
      socket.off("order-no-longer-available")
      socket.off("order-available-again")
      socket.off("order-status-updated")
    }
  }, [partnerEmail])

  const handleAcceptOrder = async (orderId: string) => {
    if (processingOrders.has(orderId)) {
      console.log(`Order ${orderId} is already being processed`)
      return
    }
    try {
      setProcessingOrders((prev) => new Set([...prev, orderId]))
      console.log(`🎯 Attempting to accept order ${orderId}`)
      const response = await fetch(`${baseUrl}/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "CONFIRMED",
          updatedByEmail: partnerEmail,
        }),
      })
      const data = await response.json()
      if (response.ok && data.success) {
        console.log(`✅ Order ${orderId} accepted successfully`)
        // Remove from available orders
        setAvailableOrders((prev) => prev.filter((order) => order._id !== orderId))
        Alert.alert("Success", "Order accepted successfully!")
      } else {
        console.log(`❌ Failed to accept order ${orderId}:`, data.message)
        if (data.action === "hide_order") {
          // Hide order from UI as it was accepted by someone else
          setHiddenOrders((prev) => new Set([...prev, orderId]))
          setAvailableOrders((prev) => prev.filter((order) => order._id !== orderId))
        }
        Alert.alert("Error", data.message || "Failed to accept order")
      }
    } catch (error) {
      console.error(`Error accepting order ${orderId}:`, error)
      Alert.alert("Error", "Network error. Please try again.")
    } finally {
      setProcessingOrders((prev) => {
        const newSet = new Set(prev)
        newSet.delete(orderId)
        return newSet
      })
    }
  }

  const handleRejectOrder = async (orderId: string) => {
    if (processingOrders.has(orderId)) {
      console.log(`Order ${orderId} is already being processed`)
      return
    }
    try {
      setProcessingOrders((prev) => new Set([...prev, orderId]))
      console.log(`❌ Attempting to reject order ${orderId}`)
      const response = await fetch(`${baseUrl}/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "CANCELLED",
          updatedByEmail: partnerEmail,
        }),
      })
      const data = await response.json()
      if (response.ok) {
        console.log(`✅ Order ${orderId} rejected successfully`)
        // Remove from available orders
        setAvailableOrders((prev) => prev.filter((order) => order._id !== orderId))
        Alert.alert("Success", "Order rejected successfully!")
      } else {
        console.log(`❌ Failed to reject order ${orderId}:`, data.message)
        if (data.action === "hide_order") {
          // Hide order from UI
          setHiddenOrders((prev) => new Set([...prev, orderId]))
          setAvailableOrders((prev) => prev.filter((order) => order._id !== orderId))
        }
        Alert.alert("Error", data.message || "Failed to reject order")
      }
    } catch (error) {
      console.error(`Error rejecting order ${orderId}:`, error)
      Alert.alert("Error", "Network error. Please try again.")
    } finally {
      setProcessingOrders((prev) => {
        const newSet = new Set(prev)
        newSet.delete(orderId)
        return newSet
      })
    }
  }

  const formatAddress = (address: any) => {
    return `${address.name}, ${address.phone}, ${address.street}, ${address.area}, ${address.defaultAddress}`
  }

  const formatProducts = (products: any[]) => {
    return products.map((product) => `${product.title} (${product.count})`).join(", ")
  }

  return (
    <LinearGradient
      colors={["#000000", "#011627"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.fullScreenContainer}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.container}>
          <Text style={styles.heading}>Available Orders ({availableOrders.length})</Text>
          {availableOrders.length === 0 ? (
            <View style={styles.noOrders}>
              <Ionicons name="cube-outline" size={60} color="#888" />
              <Text style={styles.noOrdersText}>No orders available at the moment</Text>
              <Text style={styles.noOrdersSubText}>You'll be notified when new orders arrive</Text>
            </View>
          ) : (
            <View style={styles.ordersList}>
              {availableOrders.map((order) => (
                <View key={order._id} style={styles.orderCard}>
                  <View style={styles.orderHeader}>
                    <Text style={styles.orderIdText}>Order #{order._id.slice(-6)}</Text>
                    <Text style={styles.orderTime}>{new Date(order.createdAt).toLocaleTimeString()}</Text>
                  </View>
                  <View style={styles.orderDetails}>
                    <View style={styles.customerInfo}>
                      <Text style={styles.subHeading}>Customer Details:</Text>
                      <Text style={styles.detailText}>{formatAddress(order.address)}</Text>
                    </View>
                    <View style={styles.productsInfo}>
                      <Text style={styles.subHeading}>Items:</Text>
                      <Text style={styles.detailText}>{formatProducts(order.products)}</Text>
                    </View>
                  </View>
                  <View style={styles.orderActions}>
                    <TouchableOpacity
                      style={styles.acceptBtn}
                      onPress={() => handleAcceptOrder(order._id)}
                      disabled={processingOrders.has(order._id)}
                    >
                      {processingOrders.has(order._id) ? (
                        <ActivityIndicator size="small" color="#000" />
                      ) : (
                        <Ionicons name="checkmark-circle-outline" size={20} color="#000" />
                      )}
                      <Text style={styles.acceptBtnText}>
                        {processingOrders.has(order._id) ? "Processing..." : "Accept Order"}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.rejectBtn}
                      onPress={() => handleRejectOrder(order._id)}
                      disabled={processingOrders.has(order._id)}
                    >
                      {processingOrders.has(order._id) ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Ionicons name="close-circle-outline" size={20} color="#fff" />
                      )}
                      <Text style={styles.rejectBtnText}>
                        {processingOrders.has(order._id) ? "Processing..." : "Reject Order"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {processingOrders.has(order._id) && (
                    <View style={styles.processingOverlay}>
                      <ActivityIndicator size="large" color="#facc15" />
                      <Text style={styles.processingText}>Processing your request...</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  noOrders: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  noOrdersText: {
    color: "#ccc",
    fontSize: 18,
    marginTop: 10,
  },
  noOrdersSubText: {
    color: "#888",
    fontSize: 14,
    marginTop: 5,
  },
  ordersList: {},
  orderCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    marginBottom: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    position: "relative",
    overflow: "hidden",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  orderIdText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  orderTime: {
    fontSize: 14,
    color: "#ccc",
  },
  orderDetails: {
    marginBottom: 15,
  },
  customerInfo: {
    marginBottom: 10,
  },
  productsInfo: {},
  subHeading: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#facc15",
    marginBottom: 5,
  },
  detailText: {
    fontSize: 14,
    color: "#eee",
    marginBottom: 3,
  },
  orderActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  acceptBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#28a745",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    minWidth: 120,
    justifyContent: "center",
  },
  acceptBtnText: {
    color: "#000",
    fontSize: 15,
    fontWeight: "bold",
    marginLeft: 5,
  },
  rejectBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dc3545",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    minWidth: 120,
    justifyContent: "center",
  },
  rejectBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
    marginLeft: 5,
  },
  processingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  processingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
  },
})

export default DeliveryPartnerOrderList
