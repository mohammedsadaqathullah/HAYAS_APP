"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  Image,
} from "react-native"
import { useSelector, useDispatch } from "react-redux"
import LinearGradient from "react-native-linear-gradient"
import Ionicons from "react-native-vector-icons/Ionicons"
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import { updateQuantity, clearCart } from "../Redux/slice/cartSlice"
import { useGetOrdersByEmailQuery, usePlaceOrderMutation } from "../Redux/Api/orderApi"
import { useNavigation } from "@react-navigation/native"
import { io } from "socket.io-client"

// Placeholder for user avatar if ui-avatars.com fails
import defaultUserAvatar from "../Assets/logoWhite.png"
import baseUrl from "../Redux/Api/baseUrl"
import OrderHistory from "../Components/OrderHistory"

const socket = io(baseUrl)

const SUPPORT_CONTACT = {
  phone: "+918220206483", // Replace with actual support number
  name: "Hayas Support",
}

const CartScreen = () => {
  const cart = useSelector((state: any) => state.cart.cart)
  const dispatch = useDispatch()
  const user = useSelector((state: any) => state.user)
  const navigation = useNavigation()

  const [address, setAddress] = useState({
    name: user.name || "",
    phone: user.phone || "",
    street: user.doorNoAndStreetName || "",
    area: user.area || "",
    defaultAddress: "Eruvadi, Tirunelveli District - 627103",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<any>(null)
  const [deliveryPartner, setDeliveryPartner] = useState<any>(null)
  const [orderStatus, setOrderStatus] = useState<string | null>(null)
  const [partnerLoading, setPartnerLoading] = useState(false)
  const [hasActiveOrder, setHasActiveOrder] = useState(false)
  const [timeoutInfo, setTimeoutInfo] = useState<any>(null)
  const [retryLoading, setRetryLoading] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const [placeOrder, { isLoading: placeOrderLoading }] = usePlaceOrderMutation()
  const { data: orders, refetch } = useGetOrdersByEmailQuery(user.email)

  // Check if there's an active order (PENDING, CONFIRMED, or TIMEOUT)
  const checkActiveOrder = (ordersList: any[]) => {
    if (!ordersList || ordersList.length === 0) {
      setHasActiveOrder(false)
      return false
    }
    const activeOrder = ordersList.find(
      (order) => order.status === "PENDING" || order.status === "CONFIRMED" || order.status === "TIMEOUT",
    )
    const hasActive = !!activeOrder
    setHasActiveOrder(hasActive)
    if (hasActive) {
      console.log("Active order found:", activeOrder.status, activeOrder._id)
    }
    return hasActive
  }

  // Fetch delivery partner details with full information
  const fetchDeliveryPartnerDetails = async (email: string) => {
    try {
      setPartnerLoading(true)
      console.log("Fetching delivery partner details for:", email)
      const response = await fetch(`${baseUrl}/delivery-partner/by-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()
      console.log("Delivery partner data received:", data)
      if (response.ok && data.userDetails) {
        setDeliveryPartner(data.userDetails)
      } else {
        console.error("Failed to fetch delivery partner details:", data.error)
        setDeliveryPartner(null)
      }
    } catch (error) {
      console.error("Error fetching delivery partner details:", error)
      setDeliveryPartner(null)
    } finally {
      setPartnerLoading(false)
    }
  }

  // Get assigned delivery partner email from order
  const getAssignedPartnerEmail = (order: any) => {
    const confirmedEntry = order.statusHistory
      ?.filter((entry: any) => entry.status === "CONFIRMED")
      .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0]
    return confirmedEntry ? confirmedEntry.email : null
  }

  // Function to handle cart clearing based on order status
  const handleOrderStatusChange = (updatedOrder: any) => {
    const { status, _id } = updatedOrder
    console.log(`Order status changed to: ${status} for order: ${_id}`)

    // Clear cart ONLY when order is CONFIRMED or DELIVERED
    if (status === "CONFIRMED" || status === "DELIVERED") {
      dispatch(clearCart())
      if (status === "CONFIRMED") {
        console.log("✅ Order accepted! Cart cleared.")
      } else if (status === "DELIVERED") {
        console.log("🚚 Order delivered! Cart cleared.")
      }
    } else if (status === "CANCELLED" || status === "TIMEOUT") {
      console.log(`❌ Order ${status.toLowerCase()}! Cart NOT cleared - user can modify cart.`)
    }
    // Update active order status
    checkActiveOrder([updatedOrder, ...(orders || []).filter((o: any) => o._id !== _id)])
  }

  // Start 2-minute countdown timer
  const startCountdownTimer = () => {
    const startTime = Date.now()
    const duration = 2 * 60 * 1000 // 2 minutes in milliseconds
    setTimeRemaining(duration)

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
    }

    timerIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = duration - elapsed
      if (remaining <= 0) {
        setTimeRemaining(0)
        clearInterval(timerIntervalRef.current!)
        timerIntervalRef.current = null
      } else {
        setTimeRemaining(remaining)
      }
    }, 1000) // Update every second
    console.log("⏰ Countdown timer started - 2 minutes")
  }

  // Stop countdown timer
  const stopCountdownTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
      setTimeRemaining(null)
      console.log("⏰ Countdown timer stopped")
    }
  }

  // Format time remaining for display
  const formatTimeRemaining = (milliseconds: number | null) => {
    if (milliseconds === null || milliseconds <= 0) return "0:00"
    const totalSeconds = Math.ceil(milliseconds / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  // Handle retry order
  const handleRetryOrder = async (orderId: string) => {
    try {
      setRetryLoading(true)
      const response = await fetch(`${baseUrl}/orders/${orderId}/retry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
      const data = await response.json()
      if (response.ok) {
        console.log("Order retried successfully:", data)
        setTimeoutInfo(null)
        startCountdownTimer() // Start new countdown for retry
        refetch()
      } else {
        console.error("Failed to retry order:", data.message)
        Alert.alert("Error", data.message || "Failed to retry order")
      }
    } catch (error) {
      console.error("Error retrying order:", error)
      Alert.alert("Error", "Failed to retry order. Please try again.")
    } finally {
      setRetryLoading(false)
    }
  }

  // Handle manual cart clear
  const handleClearCart = () => {
    Alert.alert(
      "Clear Cart",
      "Are you sure you want to clear your cart? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear",
          onPress: () => {
            dispatch(clearCart())
            console.log("🗑️ Cart manually cleared by user")
          },
        },
      ],
      { cancelable: true },
    )
  }

  // Handle phone call
  const handlePhoneCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`).catch((err) => console.error("Failed to open dialer:", err))
  }

  useEffect(() => {
    if (user?.email) {
      socket.emit("join", user.email)
      socket.on("order-status-updated", (data) => {
        const updatedOrder = data.order
        console.log("Order status changed:", updatedOrder)
        setCurrentOrder(updatedOrder)
        setOrderStatus(updatedOrder.status)
        handleOrderStatusChange(updatedOrder)

        // Stop timer when order is accepted or cancelled
        if (updatedOrder.status === "CONFIRMED" || updatedOrder.status === "CANCELLED") {
          stopCountdownTimer()
        }
        if (updatedOrder.status === "CONFIRMED") {
          const partnerEmail = getAssignedPartnerEmail(updatedOrder)
          if (partnerEmail) {
            fetchDeliveryPartnerDetails(partnerEmail)
          }
        }
        if (updatedOrder.status === "DELIVERED" || updatedOrder.status === "CANCELLED") {
          setTimeout(() => {
            setCurrentOrder(null)
            setOrderStatus(null)
            setDeliveryPartner(null)
            setHasActiveOrder(false)
            setTimeoutInfo(null)
          }, 3000)
        }
        refetch()
      })

      // Handle order timeout
      socket.on("order-timeout", (data) => {
        console.log("Order timed out:", data)
        setCurrentOrder(data.order)
        setOrderStatus("TIMEOUT")
        setTimeoutInfo({
          orderId: data.order._id,
          supportContact: SUPPORT_CONTACT,
        })
        handleOrderStatusChange(data.order)
        stopCountdownTimer() // Stop timer when timeout occurs
        refetch()
      })
    }

    return () => {
      socket.off("order-status-updated")
      socket.off("order-timeout")
      stopCountdownTimer() // Cleanup timer on unmount
    }
  }, [user, dispatch, refetch, orders]) // Added orders to dependency array

  useEffect(() => {
    setAddress({
      name: user.name || "",
      phone: user.phone || "",
      street: user.doorNoAndStreetName || "",
      area: user.area || "",
      defaultAddress: "Eruvadi, Tirunelveli District - 627103",
    })
    setIsLoading(false)
  }, [user])

  // Check for pending/confirmed/timeout orders on component mount and when orders change
  useEffect(() => {
    if (orders && orders.length > 0) {
      const hasActive = checkActiveOrder(orders)
      if (hasActive) {
        const latestActiveOrder = orders.find(
          (order: any) => order.status === "PENDING" || order.status === "CONFIRMED" || order.status === "TIMEOUT",
        )
        if (latestActiveOrder) {
          setCurrentOrder(latestActiveOrder)
          setOrderStatus(latestActiveOrder.status)
          if (latestActiveOrder.status === "CONFIRMED") {
            const partnerEmail = getAssignedPartnerEmail(latestActiveOrder)
            if (partnerEmail) {
              fetchDeliveryPartnerDetails(partnerEmail)
            }
          } else if (latestActiveOrder.status === "TIMEOUT") {
            setTimeoutInfo({
              orderId: latestActiveOrder._id,
              supportContact: SUPPORT_CONTACT,
            })
          }
        }
      } else {
        setCurrentOrder(null)
        setOrderStatus(null)
        setDeliveryPartner(null)
        setTimeoutInfo(null)
      }
    } else {
      setHasActiveOrder(false)
      setCurrentOrder(null)
      setOrderStatus(null)
      setDeliveryPartner(null)
      setTimeoutInfo(null)
    }
  }, [orders])

  const handleUpdateQuantity = (product: any, quantityType: string, actionType: "increase" | "decrease") => {
    if (hasActiveOrder) {
      Alert.alert(
        "Cart Locked",
        "Cannot modify cart while you have a pending, confirmed, or timed out order. Please wait for the current order to be completed or retry it.",
      )
      return
    }
    dispatch(updateQuantity({ product, quantityType, actionType }))
  }

  const handlePlaceOrder = async () => {
    if (!address.name || !address.phone || !address.street || !address.area) {
      Alert.alert("Missing Details", "Please fill in all address details to place your order.")
      return
    }
    if (hasActiveOrder) {
      Alert.alert(
        "Active Order",
        "You already have a pending, confirmed, or timed out order. Please wait for it to be completed or retry it before placing a new order.",
      )
      return
    }

    try {
      const response = await placeOrder({
        products: cart,
        address,
        userEmail: user.email,
      }).unwrap() // Use .unwrap() to get the actual data or throw error

      if (response) {
        setCurrentOrder(response.order)
        setOrderStatus("PENDING")
        setHasActiveOrder(true)
        startCountdownTimer() // Start the 2-minute countdown
      }
      console.log("Order placed successfully:", response)
      refetch()
    } catch (error: any) {
      console.error("Error placing order:", error.data?.message || error.message)
      Alert.alert("Order Error", error.data?.message || "Failed to place order. Please try again.")
    }
  }

  // Function to get avatar or profile image
  const getPartnerAvatar = (partner: any) => {
    if (partner?.profileImage) {
      return { uri: partner.profileImage }
    }
    const initials = partner?.name
      ? partner.name
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "DP"
    return { uri: `https://ui-avatars.com/api/?name=${initials}&background=f4dd0f&color=000&size=80&bold=true` }
  }

  const renderOrderStatus = () => {
    if (!currentOrder) return null

    return (
      <View style={styles.orderStatusContainer}>
        {orderStatus === "PENDING" && (
          <View style={styles.statusCardPending}>
            <View style={styles.statusIconContainer}>
              <Ionicons name="time-outline" size={40} color="#facc15" />
            </View>
            <View style={styles.statusContent}>
              <Text style={styles.statusTitle}>Order Confirmed!</Text>
              <Text style={styles.statusText}>Waiting for delivery partner to accept your order...</Text>
              {timeRemaining !== null && (
                <View style={styles.countdownTimer}>
                  <Text style={styles.timerText}>
                    <Text style={styles.timerNumber}>{formatTimeRemaining(timeRemaining)}</Text> remaining
                  </Text>
                  <Text style={styles.timerWarning}>
                    {timeRemaining > 30000
                      ? "Looking for available delivery partners..."
                      : "Almost timeout - preparing retry options..."}
                  </Text>
                </View>
              )}
              <Text style={styles.orderId}>Order ID: #{currentOrder._id?.slice(-6)}</Text>
            </View>
          </View>
        )}

        {orderStatus === "CONFIRMED" && (
          <View style={styles.statusCardConfirmed}>
            <View style={styles.statusIconContainer}>
              <Ionicons name="checkmark-circle-outline" size={40} color="#28a745" />
            </View>
            <View style={styles.statusContent}>
              <Text style={styles.statusTitle}>Order Accepted!</Text>
              <Text style={styles.statusText}>Your order has been confirmed and will be delivered soon.</Text>
              {partnerLoading ? (
                <View style={styles.partnerLoading}>
                  <ActivityIndicator size="small" color="#facc15" />
                  <Text style={styles.partnerLoadingText}>Loading delivery partner details...</Text>
                </View>
              ) : deliveryPartner ? (
                <View style={styles.partnerDetails}>
                  <Text style={styles.partnerDetailsTitle}>🚚 Delivery Partner Details</Text>
                  <View style={styles.partnerCard}>
                    <Image
                      source={getPartnerAvatar(deliveryPartner)}
                      style={styles.partnerAvatarImage}
                      onError={(e) => {
                        // Fallback to default local avatar if URL fails
                        e.target.src = defaultUserAvatar
                      }}
                    />
                    <View style={styles.partnerInfo}>
                      <Text style={styles.partnerName}>{deliveryPartner.name}</Text>
                      <TouchableOpacity
                        onPress={() => handlePhoneCall(deliveryPartner.phone)}
                        style={styles.partnerContactRow}
                      >
                        <Ionicons name="call-outline" size={16} color="#facc15" />
                        <Text style={styles.partnerContactText}>{deliveryPartner.phone}</Text>
                      </TouchableOpacity>
                      <View style={styles.partnerContactRow}>
                        <MaterialCommunityIcons name="email-outline" size={16} color="#facc15" />
                        <Text style={styles.partnerContactText}>{deliveryPartner.email}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.partnerError}>
                  <Text style={styles.partnerErrorText}>⚠️ Unable to load delivery partner details</Text>
                </View>
              )}
              <Text style={styles.orderId}>Order ID: #{currentOrder._id?.slice(-6)}</Text>
            </View>
          </View>
        )}

        {orderStatus === "TIMEOUT" && timeoutInfo && (
          <View style={styles.statusCardTimeout}>
            <View style={styles.statusIconContainer}>
              <Ionicons name="alert-circle-outline" size={40} color="#ff6347" />
            </View>
            <View style={styles.statusContent}>
              <Text style={styles.statusTitle}>No Partners Available</Text>
              <Text style={styles.statusText}>Sorry, no delivery partners accepted your order within 2 minutes.</Text>
              <View style={styles.timeoutActions}>
                <TouchableOpacity
                  style={styles.retryBtn}
                  onPress={() => handleRetryOrder(timeoutInfo.orderId)}
                  disabled={retryLoading}
                >
                  {retryLoading ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <Ionicons name="refresh-outline" size={20} color="#000" />
                  )}
                  <Text style={styles.retryBtnText}>{retryLoading ? "Retrying..." : "Try Again"}</Text>
                </TouchableOpacity>
                <View style={styles.supportSection}>
                  <Text style={styles.supportText}>Or contact support for immediate assistance:</Text>
                  <TouchableOpacity
                    onPress={() => handlePhoneCall(SUPPORT_CONTACT.phone)}
                    style={styles.supportContact}
                  >
                    <Ionicons name="call-outline" size={16} color="#facc15" />
                    <Text style={styles.supportContactText}>
                      {SUPPORT_CONTACT.name}: {SUPPORT_CONTACT.phone}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.orderId}>Order ID: #{currentOrder._id?.slice(-6)}</Text>
            </View>
          </View>
        )}

        {orderStatus === "CANCELLED" && (
          <View style={styles.statusCardCancelled}>
            <View style={styles.statusIconContainer}>
              <Ionicons name="close-circle-outline" size={40} color="#ff6347" />
            </View>
            <View style={styles.statusContent}>
              <Text style={styles.statusTitle}>Order Cancelled</Text>
              <Text style={styles.statusText}>
                Your order has been cancelled. You can modify your cart and place a new order.
              </Text>
              <Text style={styles.orderId}>Order ID: #{currentOrder._id?.slice(-6)}</Text>
            </View>
          </View>
        )}

        {orderStatus === "DELIVERED" && (
          <View style={styles.statusCardDelivered}>
            <View style={styles.statusIconContainer}>
              <MaterialCommunityIcons name="truck-delivery-outline" size={40} color="#28a745" />
            </View>
            <View style={styles.statusContent}>
              <Text style={styles.statusTitle}>Order Delivered!</Text>
              <Text style={styles.statusText}>Your order has been successfully delivered. Thank you!</Text>
              <Text style={styles.orderId}>Order ID: #{currentOrder._id?.slice(-6)}</Text>
            </View>
          </View>
        )}
      </View>
    )
  }

  const renderCartContent = () => {
    if (hasActiveOrder && cart.length === 0) {
      return (
        <View style={styles.activeOrderNotice}>
          <Ionicons name="warning-outline" size={50} color="#facc15" style={styles.noticeIcon} />
          <Text style={styles.noticeTitle}>Active Order in Progress</Text>
          <Text style={styles.noticeText}>
            You have an active order. Please wait for it to be completed or retry it before adding new items to your
            cart.
          </Text>
        </View>
      )
    }
    if (cart.length === 0) {
      return (
        <View style={styles.emptyCartContainer}>
          <Ionicons name="cart-outline" size={80} color="#ccc" />
          <Text style={styles.emptyCartText}>Your cart is empty</Text>
          <TouchableOpacity style={styles.exploreButton} onPress={() => navigation.navigate("Home")}>
            <Text style={styles.exploreButtonText}>Explore Products</Text>
          </TouchableOpacity>
        </View>
      )
    }

    return (
      <>
        <View style={styles.cartActions}>
          <TouchableOpacity onPress={handleClearCart} style={styles.clearCartBtn}>
            <Ionicons name="trash-outline" size={20} color="#fff" />
            <Text style={styles.clearCartBtnText}>Clear Cart</Text>
          </TouchableOpacity>
        </View>
        {cart.map((item: any, index: number) => (
          <View key={index} style={[styles.cartItem, hasActiveOrder && styles.cartItemDisabled]}>
            <View style={styles.card}>
              <Text style={styles.cartItemTitle}>{item.title}</Text>
              <Text style={styles.cartItemQuantityType}>
                {item.quantityType === "One" ? ` ${item.quantityOne}` : ` ${item.quantityTwo}`}
              </Text>
              <View style={styles.countContainer}>
                <TouchableOpacity
                  onPress={() => handleUpdateQuantity(item, item.quantityType, "decrease")}
                  style={[styles.actionButton, hasActiveOrder && styles.actionButtonDisabled]}
                  disabled={hasActiveOrder}
                >
                  <Text style={styles.actionButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.countText}>{item.count}</Text>
                <TouchableOpacity
                  onPress={() => handleUpdateQuantity(item, item.quantityType, "increase")}
                  style={[styles.actionButton, hasActiveOrder && styles.actionButtonDisabled]}
                  disabled={hasActiveOrder}
                >
                  <Text style={styles.actionButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            {hasActiveOrder && (
              <View style={styles.disabledOverlay}>
                <Text style={styles.disabledOverlayText}>🔒 Cart locked during active order</Text>
              </View>
            )}
          </View>
        ))}
        {!currentOrder && !hasActiveOrder && (
          <View style={styles.addressSection}>
            <Text style={styles.addressSectionTitle}>Delivery Address</Text>
            <TextInput
              placeholder="Full Name"
              value={address.name}
              editable={false} // Read-only
              style={styles.addressInput}
              placeholderTextColor="#999"
            />
            <TextInput
              placeholder="Phone Number"
              value={address.phone}
              editable={false} // Read-only
              style={styles.addressInput}
              keyboardType="phone-pad"
              maxLength={10}
              placeholderTextColor="#999"
            />
            <TextInput
              placeholder="Door No, Street name"
              value={address.street}
              editable={false} // Read-only
              style={styles.addressInput}
              placeholderTextColor="#999"
            />
            <TextInput
              placeholder="Area"
              value={address.area}
              editable={false} // Read-only
              style={styles.addressInput}
              placeholderTextColor="#999"
            />
            <TextInput
              value={address.defaultAddress}
              editable={false} // Disabled
              style={[styles.addressInput, styles.addressInputDisabled]}
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              onPress={handlePlaceOrder}
              style={[
                styles.placeOrderBtn,
                (placeOrderLoading ||
                  hasActiveOrder ||
                  !address.name ||
                  !address.phone ||
                  !address.street ||
                  !address.area) &&
                  styles.placeOrderBtnDisabled,
              ]}
              disabled={
                placeOrderLoading ||
                hasActiveOrder ||
                !address.name ||
                !address.phone ||
                !address.street ||
                !address.area
              }
            >
              {placeOrderLoading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.placeOrderBtnText}>
                  {hasActiveOrder
                    ? "Active Order in Progress"
                    : address.name && address.phone && address.street && address.area
                      ? "Confirm Your Order"
                      : "Fill all the details"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </>
    )
  }

  return (
    <LinearGradient
      colors={["#000000", "#011627"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.fullScreenContainer}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.cartScreenWrapper}>
          <View style={styles.cartContainer}>
            <Text style={styles.cartHeading}>Your Cart</Text>
            {renderOrderStatus()}
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#facc15" />
                <Text style={styles.loadingText}>Loading address...</Text>
              </View>
            ) : (
              renderCartContent()
            )}
          </View>
          <View style={styles.orderHistoryContainer}>
            <Text style={styles.cartHeading}>Your History</Text>
            <OrderHistory orders={orders} />
          </View>
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
  cartScreenWrapper: {
    flex: 1,
    paddingHorizontal: 20,
  },
  cartContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  cartHeading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  emptyCartContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  emptyCartText: {
    color: "#ccc",
    fontSize: 18,
    marginTop: 10,
  },
  exploreButton: {
    backgroundColor: "#facc15",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 20,
  },
  exploreButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  cartActions: {
    alignItems: "flex-end",
    marginBottom: 15,
  },
  clearCartBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dc3545",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  clearCartBtnText: {
    color: "#fff",
    marginLeft: 5,
    fontWeight: "bold",
  },
  cartItem: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
    marginBottom: 10,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  cartItemDisabled: {
    opacity: 0.6,
  },
  card: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cartItemTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    flex: 2,
  },
  cartItemQuantityType: {
    color: "#ccc",
    fontSize: 14,
    flex: 1,
    textAlign: "center",
  },
  countContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 20,
    paddingHorizontal: 5,
  },
  actionButton: {
    backgroundColor: "#facc15",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
  },
  actionButtonDisabled: {
    backgroundColor: "#888",
  },
  actionButtonText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
  },
  countText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    minWidth: 20,
    textAlign: "center",
  },
  disabledOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledOverlayText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  addressSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  addressSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
    textAlign: "center",
  },
  addressInput: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    color: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  addressInputDisabled: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    color: "#888",
  },
  placeOrderBtn: {
    backgroundColor: "#facc15",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  placeOrderBtnDisabled: {
    backgroundColor: "#888",
  },
  placeOrderBtnText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
  },
  orderHistoryContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  // Order Status Styles
  orderStatusContainer: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
  },
  statusCardPending: {
    backgroundColor: "rgba(252, 204, 21, 0.15)", // Yellowish tint
    borderColor: "#facc15",
    borderRadius: 10,
    padding: 15,
    width: "100%",
    alignItems: "center",
  },
  statusCardConfirmed: {
    backgroundColor: "rgba(40, 167, 69, 0.15)", // Greenish tint
    borderColor: "#28a745",
    borderRadius: 10,
    padding: 15,
    width: "100%",
    alignItems: "center",
  },
  statusCardTimeout: {
    backgroundColor: "rgba(255, 99, 71, 0.15)", // Reddish tint
    borderColor: "#ff6347",
    borderRadius: 10,
    padding: 15,
    width: "100%",
    alignItems: "center",
  },
  statusCardCancelled: {
    backgroundColor: "rgba(255, 99, 71, 0.15)", // Reddish tint
    borderColor: "#ff6347",
    borderRadius: 10,
    padding: 15,
    width: "100%",
    alignItems: "center",
  },
  statusCardDelivered: {
    backgroundColor: "rgba(40, 167, 69, 0.15)", // Greenish tint
    borderColor: "#28a745",
    borderRadius: 10,
    padding: 15,
    width: "100%",
    alignItems: "center",
  },
  statusIconContainer: {
    marginBottom: 10,
  },
  statusContent: {
    alignItems: "center",
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
    textAlign: "center",
  },
  statusText: {
    fontSize: 14,
    color: "#ccc",
    textAlign: "center",
    marginBottom: 10,
  },
  orderId: {
    fontSize: 12,
    color: "#888",
    marginTop: 10,
  },
  countdownTimer: {
    alignItems: "center",
    marginTop: 10,
  },
  timerText: {
    fontSize: 24,
    color: "#facc15",
    fontWeight: "bold",
  },
  timerNumber: {
    fontSize: 32,
  },
  timerWarning: {
    fontSize: 12,
    color: "#ccc",
    marginTop: 5,
    textAlign: "center",
  },
  partnerLoading: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  partnerLoadingText: {
    color: "#ccc",
    marginLeft: 10,
  },
  partnerDetails: {
    marginTop: 15,
    width: "100%",
    alignItems: "center",
  },
  partnerDetailsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  partnerCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
    padding: 10,
    width: "90%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  partnerAvatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    borderWidth: 2,
    borderColor: "#facc15",
  },
  partnerInfo: {
    flex: 1,
  },
  partnerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  partnerContactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  partnerContactText: {
    color: "#ccc",
    fontSize: 14,
    marginLeft: 5,
  },
  partnerError: {
    marginTop: 10,
  },
  partnerErrorText: {
    color: "#ff6347",
    fontSize: 14,
    textAlign: "center",
  },
  timeoutActions: {
    marginTop: 15,
    alignItems: "center",
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#facc15",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 15,
  },
  retryBtnText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 5,
  },
  supportSection: {
    alignItems: "center",
  },
  supportText: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 5,
  },
  supportContact: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  supportContactText: {
    color: "#facc15",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 5,
  },
  activeOrderNotice: {
    backgroundColor: "rgba(252, 204, 21, 0.15)",
    borderColor: "#facc15",
    borderWidth: 1,
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  noticeIcon: {
    marginBottom: 10,
  },
  noticeTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
  },
  noticeText: {
    fontSize: 14,
    color: "#ccc",
    textAlign: "center",
  },
})

export default CartScreen
