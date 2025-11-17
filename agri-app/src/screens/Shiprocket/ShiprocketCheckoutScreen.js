import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import {
  Package,
  Truck,
  CreditCard,
  MapPin,
  Plus,
  Minus,
  Edit,
} from "lucide-react-native";
import axios from "axios";
import Toast from "react-native-toast-message";
import RazorpayCheckout from "react-native-razorpay";
import { API_URL } from "@env";
import { getUserFromLocalStorage } from "../../utils/localStorage";

const ShiprocketCheckoutScreen = ({ navigation, route }) => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [shippingInfo, setShippingInfo] = useState(null);
  const [loadingShipping, setLoadingShipping] = useState(false);

  useEffect(() => {
    // Get pre-selected products from navigation params
    if (route.params?.preSelectedProduct) {
      setSelectedProducts([route.params.preSelectedProduct]);
    } else if (route.params?.cartItems) {
      setSelectedProducts(route.params.cartItems);
    }

    // Get selected address from navigation params
    if (route.params?.selectedAddress) {
      setSelectedAddress(route.params.selectedAddress);
      checkShippingCost(route.params.selectedAddress.zipCode);
    }
  }, [route.params]);

  const checkShippingCost = async (zipCode) => {
    if (!zipCode) return;

    setLoadingShipping(true);
    try {
      const user = await getUserFromLocalStorage();
      const response = await axios.post(
        `${API_URL}/shiprocket/check-serviceability`,
        {
          pincode: zipCode,
          pickupPincode: "110001",
          weight: 0.5,
          cod: paymentMethod === "cod" ? 1 : 0,
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      if (response.data.success && response.data.serviceable) {
        setShippingInfo({
          cost: response.data.shippingCost,
          estimatedDays: response.data.estimatedDays,
          courierName: response.data.courierName,
        });
      } else {
        setShippingInfo(null);
        Toast.show({
          type: "error",
          text1: "Delivery not available to this pincode",
        });
      }
    } catch (error) {
      console.error("Error checking shipping:", error);
      setShippingInfo(null);
    } finally {
      setLoadingShipping(false);
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      setSelectedProducts(
        selectedProducts.filter((p) => p.productId !== productId)
      );
      return;
    }
    setSelectedProducts(
      selectedProducts.map((p) =>
        p.productId === productId ? { ...p, quantity: newQuantity } : p
      )
    );
  };

  const calculateSubtotal = () => {
    return selectedProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + (shippingInfo?.cost || 0);
  };

  const handlePayment = async () => {
    if (!selectedAddress) {
      Toast.show({ type: "error", text1: "Please select a delivery address" });
      return;
    }

    if (selectedProducts.length === 0) {
      Toast.show({
        type: "error",
        text1: "Please select at least one product",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const user = await getUserFromLocalStorage();
      const totalAmount = calculateTotal();

      if (paymentMethod === "cod") {
        // Direct order creation for COD
        const orderResponse = await axios.post(
          `${API_URL}/shiprocket/create`,
          {
            addressId: selectedAddress._id,
            paymentMethod: "cod",
            items: selectedProducts,
            shippingCost: shippingInfo?.cost || 0,
            shippingInfo: shippingInfo,
          },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );

        if (orderResponse.data.success) {
          Toast.show({ type: "success", text1: "Order placed successfully!" });
          navigation.navigate("ShiprocketSuccess", {
            order: orderResponse.data.order,
            shiprocket: orderResponse.data.shiprocket,
          });
        }
      } else {
        // Online payment flow
        const paymentOrderResponse = await axios.post(
          `${API_URL}/shiprocket/payment/create-order`,
          { amount: totalAmount },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );

        if (!paymentOrderResponse.data.success) {
          Toast.show({
            type: "error",
            text1: "Failed to create payment order",
          });
          setIsProcessing(false);
          return;
        }

        const razorpayOrder = paymentOrderResponse.data.order;

        const options = {
          key: process.env.RAZORPAY_KEY_ID,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: "Shiprocket Checkout",
          description: "Order Payment",
          order_id: razorpayOrder.id,
          prefill: {
            name: selectedAddress.Name,
            contact: selectedAddress.mobile,
          },
          theme: { color: "#16a34a" },
        };

        RazorpayCheckout.open(options)
          .then(async (data) => {
            // Verify payment
            const verifyResponse = await axios.post(
              `${API_URL}/shiprocket/payment/verify`,
              {
                razorpay_payment_id: data.razorpay_payment_id,
                razorpay_order_id: data.razorpay_order_id,
                razorpay_signature: data.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${user.token}` } }
            );

            if (verifyResponse.data.success) {
              // Create Shiprocket order
              const orderResponse = await axios.post(
                `${API_URL}/shiprocket/create`,
                {
                  addressId: selectedAddress._id,
                  paymentMethod: "online",
                  items: selectedProducts,
                  shippingCost: shippingInfo?.cost || 0,
                  shippingInfo: shippingInfo,
                  paymentInfo: {
                    razorpay_payment_id: data.razorpay_payment_id,
                    razorpay_order_id: data.razorpay_order_id,
                    razorpay_signature: data.razorpay_signature,
                  },
                },
                { headers: { Authorization: `Bearer ${user.token}` } }
              );

              if (orderResponse.data.success) {
                Toast.show({ type: "success", text1: "Payment successful!" });
                navigation.navigate("ShiprocketSuccess", {
                  order: orderResponse.data.order,
                  shiprocket: orderResponse.data.shiprocket,
                });
              }
            }
          })
          .catch((error) => {
            Toast.show({ type: "error", text1: "Payment cancelled" });
          })
          .finally(() => {
            setIsProcessing(false);
          });
      }
    } catch (error) {
      console.error("Payment error:", error);
      Toast.show({
        type: "error",
        text1: error.response?.data?.message || "Payment failed",
      });
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Shiprocket Checkout</Text>
          <Text style={styles.headerSubtitle}>Fast and reliable shipping</Text>
        </View>

        {/* Selected Products */}
        {selectedProducts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Selected Items</Text>
            {selectedProducts.map((product) => (
              <View key={product.productId} style={styles.productCard}>
                <Image
                  source={{
                    uri: product.imageUrl || "https://via.placeholder.com/60",
                  }}
                  style={styles.productImage}
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productPrice}>₹{product.price}</Text>
                </View>
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    onPress={() =>
                      updateQuantity(product.productId, product.quantity - 1)
                    }
                    style={styles.quantityButton}
                  >
                    <Minus size={16} color="#666" />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{product.quantity}</Text>
                  <TouchableOpacity
                    onPress={() =>
                      updateQuantity(product.productId, product.quantity + 1)
                    }
                    style={styles.quantityButton}
                  >
                    <Plus size={16} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Delivery Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("SelectAddress", { fromShiprocket: true })
              }
            >
              <Edit size={20} color="#16a34a" />
            </TouchableOpacity>
          </View>
          {selectedAddress ? (
            <View style={styles.addressCard}>
              <MapPin size={20} color="#16a34a" />
              <View style={styles.addressInfo}>
                <Text style={styles.addressName}>{selectedAddress.Name}</Text>
                <Text style={styles.addressText}>
                  {selectedAddress.streetAddress}
                </Text>
                <Text style={styles.addressText}>
                  {selectedAddress.city}, {selectedAddress.state}{" "}
                  {selectedAddress.zipCode}
                </Text>
                <Text style={styles.addressText}>
                  Phone: {selectedAddress.mobile}
                </Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addAddressButton}
              onPress={() =>
                navigation.navigate("SelectAddress", { fromShiprocket: true })
              }
            >
              <Text style={styles.addAddressText}>Select Address</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === "cod" && styles.paymentOptionSelected,
            ]}
            onPress={() => setPaymentMethod("cod")}
          >
            <Truck
              size={20}
              color={paymentMethod === "cod" ? "#16a34a" : "#666"}
            />
            <Text style={styles.paymentOptionText}>Cash on Delivery</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === "online" && styles.paymentOptionSelected,
            ]}
            onPress={() => setPaymentMethod("online")}
          >
            <CreditCard
              size={20}
              color={paymentMethod === "online" ? "#16a34a" : "#666"}
            />
            <Text style={styles.paymentOptionText}>Pay Online</Text>
          </TouchableOpacity>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Subtotal ({selectedProducts.length} items)
            </Text>
            <Text style={styles.summaryValue}>
              ₹{calculateSubtotal().toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping Charges</Text>
            {loadingShipping ? (
              <ActivityIndicator size="small" color="#16a34a" />
            ) : (
              <Text style={styles.summaryValue}>
                ₹{shippingInfo ? shippingInfo.cost.toFixed(2) : "0.00"}
              </Text>
            )}
          </View>
          {shippingInfo && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabelSmall}>Estimated Delivery</Text>
              <Text style={styles.summaryValueSmall}>
                {shippingInfo.estimatedDays} days
              </Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.summaryTotal]}>
            <Text style={styles.summaryTotalLabel}>Total Amount</Text>
            <Text style={styles.summaryTotalValue}>
              ₹{calculateTotal().toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.placeOrderButton,
            (!selectedAddress ||
              selectedProducts.length === 0 ||
              isProcessing) &&
              styles.placeOrderButtonDisabled,
          ]}
          onPress={handlePayment}
          disabled={
            !selectedAddress || selectedProducts.length === 0 || isProcessing
          }
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.placeOrderButtonText}>Place Order</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  section: {
    backgroundColor: "#fff",
    marginTop: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  productCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    marginBottom: 8,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#16a34a",
    marginTop: 4,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    padding: 8,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "500",
    marginHorizontal: 12,
  },
  addressCard: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
  },
  addressInfo: {
    flex: 1,
    marginLeft: 12,
  },
  addressName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  addressText: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  addAddressButton: {
    padding: 16,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    alignItems: "center",
  },
  addAddressText: {
    fontSize: 16,
    color: "#16a34a",
    fontWeight: "500",
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  paymentOptionSelected: {
    borderColor: "#16a34a",
    backgroundColor: "#f0fdf4",
  },
  paymentOptionText: {
    fontSize: 16,
    marginLeft: 12,
    color: "#111827",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  summaryValue: {
    fontSize: 14,
    color: "#111827",
  },
  summaryLabelSmall: {
    fontSize: 12,
    color: "#6b7280",
  },
  summaryValueSmall: {
    fontSize: 12,
    fontWeight: "600",
    color: "#16a34a",
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 12,
    marginTop: 4,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#16a34a",
  },
  footer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  placeOrderButton: {
    backgroundColor: "#16a34a",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  placeOrderButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  placeOrderButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ShiprocketCheckoutScreen;
