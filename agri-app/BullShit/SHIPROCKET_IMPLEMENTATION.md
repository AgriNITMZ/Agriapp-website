# Shiprocket Implementation for Mobile App

## Overview
This document describes the Shiprocket shipping integration implemented in the mobile app (`agri-app`). The implementation mirrors the web frontend functionality and uses the same backend API.

## Features Implemented

### 1. **Shiprocket Checkout Screen** (`ShiprocketCheckoutScreen.js`)
- Product selection with quantity management
- Address selection with navigation to address picker
- Real-time shipping cost calculation
- Payment method selection (COD/Online)
- Razorpay integration for online payments
- Order summary with subtotal, shipping, and total

### 2. **Shiprocket Success Screen** (`ShiprocketSuccessScreen.js`)
- Order confirmation display
- Order details (Order ID, Shipment ID, Payment method)
- Order items list with images and prices
- Delivery address display
- Quick actions: Track shipment, View all orders
- Continue shopping option

### 3. **Shiprocket Orders Screen** (`ShiprocketOrdersScreen.js`)
- List all user orders with status badges
- Order items preview with images
- Order summary (subtotal, shipping, total)
- Shipment information display
- Pull-to-refresh functionality
- Track and cancel order actions
- Empty state with CTA

### 4. **Shiprocket Track Screen** (`ShiprocketTrackScreen.js`)
- Real-time shipment tracking
- Current status display with visual indicator
- Shipment details (Courier, AWB code)
- Timeline view of tracking history
- Pull-to-refresh functionality
- Visual timeline with icons and status updates

## File Structure

```
agri-app/src/screens/Shiprocket/
├── ShiprocketCheckoutScreen.js    # Checkout with payment
├── ShiprocketSuccessScreen.js     # Order confirmation
├── ShiprocketOrdersScreen.js      # Orders list
├── ShiprocketTrackScreen.js       # Shipment tracking
└── index.js                       # Export all screens
```

## Navigation Integration

The Shiprocket screens are integrated into the main app navigation in `App.js`:

```javascript
<Stack.Screen name="ShiprocketCheckout" component={ShiprocketCheckoutScreen} />
<Stack.Screen name="ShiprocketSuccess" component={ShiprocketSuccessScreen} />
<Stack.Screen name="ShiprocketOrders" component={ShiprocketOrdersScreen} />
<Stack.Screen name="ShiprocketTrack" component={ShiprocketTrackScreen} />
```

## Navigation Flow

```
Product/Cart → ShiprocketCheckout → SelectAddress → ShiprocketCheckout
                      ↓
                Payment (COD/Online)
                      ↓
              ShiprocketSuccess
                      ↓
         ┌────────────┴────────────┐
         ↓                         ↓
  ShiprocketOrders          ShiprocketTrack
```

## API Endpoints Used

All endpoints are prefixed with `${API_URL}/shiprocket`:

1. **POST** `/check-serviceability` - Check shipping availability and cost
2. **POST** `/payment/create-order` - Create Razorpay payment order
3. **POST** `/payment/verify` - Verify Razorpay payment
4. **POST** `/create` - Create Shiprocket order
5. **GET** `/orders` - Get all user orders
6. **GET** `/track/:shipmentId` - Track shipment
7. **POST** `/cancel/:shipmentId` - Cancel order

## Environment Variables

Add these to `.env` file:

```env
API_URL=http://192.168.0.101:4000/api/v1
RAZORPAY_KEY_ID=your_razorpay_key_id
```

## Dependencies

The implementation uses these existing dependencies:

- `react-native-razorpay` - Payment gateway integration
- `axios` - HTTP requests
- `react-native-toast-message` - Toast notifications
- `lucide-react-native` - Icons
- `@react-navigation/native` - Navigation
- `@react-native-async-storage/async-storage` - Local storage

## Usage Examples

### 1. Navigate to Checkout from Product Detail

```javascript
navigation.navigate('ShiprocketCheckout', {
  preSelectedProduct: {
    productId: product._id,
    name: product.name,
    quantity: 1,
    price: product.price,
    imageUrl: product.images[0],
  },
});
```

### 2. Navigate to Checkout from Cart

```javascript
navigation.navigate('ShiprocketCheckout', {
  cartItems: cartItems.map(item => ({
    productId: item._id,
    name: item.name,
    quantity: item.quantity,
    price: item.price,
    imageUrl: item.image,
  })),
});
```

### 3. View Orders

```javascript
navigation.navigate('ShiprocketOrders');
```

### 4. Track Shipment

```javascript
navigation.navigate('ShiprocketTrack', {
  shipmentId: 'SHIPMENT_ID_HERE',
});
```

## Key Features

### Payment Integration
- **COD (Cash on Delivery)**: Direct order creation
- **Online Payment**: Razorpay integration with payment verification

### Address Management
- Integrated with existing address selection screen
- Supports adding new addresses
- Address validation before checkout

### Shipping Calculation
- Real-time serviceability check
- Dynamic shipping cost calculation
- Estimated delivery time display
- Courier information

### Order Management
- Create orders with multiple items
- View order history
- Track shipments in real-time
- Cancel orders (if not delivered/cancelled)

### Error Handling
- Network error handling
- Payment failure handling
- Address validation
- Product validation
- User-friendly error messages

## Styling

All screens use consistent styling with:
- Color scheme: Green (#16a34a) for primary actions
- Gray scale for text and backgrounds
- Responsive layouts
- Touch-friendly button sizes
- Loading states and spinners
- Empty states with CTAs

## Testing Checklist

- [ ] Checkout with single product
- [ ] Checkout with multiple products
- [ ] COD payment flow
- [ ] Online payment flow
- [ ] Address selection
- [ ] Shipping cost calculation
- [ ] Order creation
- [ ] Order listing
- [ ] Order tracking
- [ ] Order cancellation
- [ ] Error handling
- [ ] Loading states
- [ ] Empty states
- [ ] Pull-to-refresh

## Future Enhancements

1. **Order Filters**: Filter orders by status, date range
2. **Search**: Search orders by ID or product name
3. **Notifications**: Push notifications for order updates
4. **Multiple Addresses**: Support for multiple delivery addresses per order
5. **Saved Cards**: Save payment methods for faster checkout
6. **Order History Export**: Export order history as PDF/CSV
7. **Return/Refund**: Initiate returns and refunds
8. **Ratings**: Rate delivery experience

## Troubleshooting

### Issue: "Session expired" error
**Solution**: User token expired. User needs to log in again.

### Issue: Shipping cost not loading
**Solution**: Check if address has valid pincode. Verify API connectivity.

### Issue: Payment fails
**Solution**: Verify Razorpay key is correct. Check payment gateway status.

### Issue: Order not appearing in list
**Solution**: Pull to refresh. Check network connectivity.

### Issue: Tracking not available
**Solution**: Shipment may not be picked up yet. Try again later.

## Support

For issues or questions:
1. Check backend logs for API errors
2. Verify environment variables are set correctly
3. Ensure user is authenticated
4. Check network connectivity
5. Verify Shiprocket API credentials in backend

## Notes

- All screens require user authentication
- Backend must be running and accessible
- Shiprocket API credentials must be configured in backend
- Razorpay account must be active for online payments
- Test with Razorpay test mode before going live
