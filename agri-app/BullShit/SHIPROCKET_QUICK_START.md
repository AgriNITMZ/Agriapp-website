# Shiprocket Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Configure Backend

1. Open `agri_backend/.env` and ensure these are set:
```env
SHIPROCKET_EMAIL=your_shiprocket_email
SHIPROCKET_PASSWORD=your_shiprocket_password
SHIPROCKET_API_URL=https://apiv2.shiprocket.in/v1/external
RAZORPAY_KEY=rzp_test_bCwRAS88ZwEfxA
RAZORPAY_SECRET=d9xSHTcjcvcDjjEKgthYatcf
```

2. Start the backend:
```bash
cd agri_backend
npm start
```

### Step 2: Configure Mobile App

1. Find your local IP address:
   - **Windows**: `ipconfig` (look for IPv4)
   - **Mac/Linux**: `ifconfig` (look for inet)

2. Update `agri-app/.env`:
```env
API_URL=http://YOUR_LOCAL_IP:4000/api/v1
RAZORPAY_KEY_ID=rzp_test_bCwRAS88ZwEfxA
```

Example:
```env
API_URL=http://192.168.0.101:4000/api/v1
RAZORPAY_KEY_ID=rzp_test_bCwRAS88ZwEfxA
```

3. Start the mobile app:
```bash
cd agri-app
npm start
# Press 'a' for Android or 'i' for iOS
```

### Step 3: Test the Flow

1. **Login** to the app
2. **Browse products** and select one
3. **Navigate to Shiprocket Checkout**:
   ```javascript
   // From product detail screen
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

4. **Select/Add Address**
5. **Choose Payment Method** (COD or Online)
6. **Place Order**
7. **View in Orders** → Navigate to "ShiprocketOrders"
8. **Track Shipment** → Click "Track" button

---

## 📱 Navigation Routes

Add these to your navigation to access Shiprocket screens:

```javascript
// From anywhere in the app
navigation.navigate('ShiprocketCheckout');
navigation.navigate('ShiprocketOrders');
navigation.navigate('ShiprocketTrack', { shipmentId: 'SHIPMENT_ID' });
```

---

## 🧪 Test with Sample Data

### Test COD Order
1. Go to ShiprocketCheckout
2. Select a product
3. Choose an address
4. Select "Cash on Delivery"
5. Click "Place Order"
6. Should navigate to success screen

### Test Online Payment (Test Mode)
1. Go to ShiprocketCheckout
2. Select a product
3. Choose an address
4. Select "Pay Online"
5. Click "Place Order"
6. Use Razorpay test card:
   - Card: `4111 1111 1111 1111`
   - CVV: Any 3 digits
   - Expiry: Any future date
7. Should navigate to success screen

---

## 🎯 Quick Access Points

### From Product Detail Screen
```javascript
<TouchableOpacity
  onPress={() => navigation.navigate('ShiprocketCheckout', {
    preSelectedProduct: {
      productId: product._id,
      name: product.name,
      quantity: 1,
      price: product.price,
      imageUrl: product.images[0],
    },
  })}
>
  <Text>Buy with Shiprocket</Text>
</TouchableOpacity>
```

### From Cart Screen
```javascript
<TouchableOpacity
  onPress={() => navigation.navigate('ShiprocketCheckout', {
    cartItems: cartItems.map(item => ({
      productId: item._id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      imageUrl: item.image,
    })),
  })}
>
  <Text>Checkout with Shiprocket</Text>
</TouchableOpacity>
```

### View Orders
```javascript
<TouchableOpacity
  onPress={() => navigation.navigate('ShiprocketOrders')}
>
  <Text>My Shiprocket Orders</Text>
</TouchableOpacity>
```

---

## 🔍 Verify Installation

Run these checks:

### 1. Backend Running
```bash
curl http://localhost:4000/api/v1/shiprocket/orders
# Should return 401 (unauthorized) - means route exists
```

### 2. Mobile App Files
```bash
ls agri-app/src/screens/Shiprocket/
# Should show:
# - ShiprocketCheckoutScreen.js
# - ShiprocketSuccessScreen.js
# - ShiprocketOrdersScreen.js
# - ShiprocketTrackScreen.js
# - index.js
```

### 3. Navigation Registered
Check `agri-app/App.js` contains:
```javascript
<Stack.Screen name="ShiprocketCheckout" component={ShiprocketCheckoutScreen} />
<Stack.Screen name="ShiprocketSuccess" component={ShiprocketSuccessScreen} />
<Stack.Screen name="ShiprocketOrders" component={ShiprocketOrdersScreen} />
<Stack.Screen name="ShiprocketTrack" component={ShiprocketTrackScreen} />
```

---

## 🐛 Common Issues

### Issue: "Cannot connect to server"
**Fix**: 
- Ensure backend is running
- Check IP address in `.env` is correct
- Ensure phone and computer on same WiFi

### Issue: "Session expired"
**Fix**: 
- Log out and log in again
- Token may have expired

### Issue: "Payment failed"
**Fix**: 
- Use Razorpay test card numbers
- Ensure Razorpay key is correct
- Check backend logs

### Issue: "No orders showing"
**Fix**: 
- Pull down to refresh
- Check if orders exist in backend
- Verify user is logged in

---

## 📊 Test Checklist

- [ ] Backend running on port 4000
- [ ] Mobile app can reach backend
- [ ] User can log in
- [ ] Can navigate to ShiprocketCheckout
- [ ] Can select products
- [ ] Can select/add address
- [ ] Shipping cost calculates
- [ ] Can place COD order
- [ ] Can place online payment order
- [ ] Order appears in ShiprocketOrders
- [ ] Can track order
- [ ] Can cancel order
- [ ] Pull-to-refresh works

---

## 🎉 Success Indicators

You'll know it's working when:

1. ✅ You can navigate to Shiprocket screens
2. ✅ Products appear in checkout
3. ✅ Addresses load correctly
4. ✅ Shipping cost displays
5. ✅ Payment flows complete
6. ✅ Orders appear in list
7. ✅ Tracking shows timeline
8. ✅ No console errors

---

## 📞 Need Help?

1. Check `SHIPROCKET_INTEGRATION_SUMMARY.md` for detailed info
2. Check `agri-app/SHIPROCKET_IMPLEMENTATION.md` for technical details
3. Review backend logs for API errors
4. Check mobile app console for errors
5. Verify all environment variables are set

---

## 🎯 Next Steps

Once basic flow works:

1. Test with real Shiprocket credentials
2. Test on physical device
3. Add to main navigation menu
4. Customize UI to match app theme
5. Add analytics tracking
6. Test edge cases
7. Deploy to production

---

**You're all set! Happy shipping! 🚀📦**
