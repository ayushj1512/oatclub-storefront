# ✅ Tracking Setup (Meta Pixel + GA4) — Today’s Implementation

This document summarizes all tracking work completed today for **OATCLUB** checkout funnel and cart.

Tracking has been implemented for:  
✅ Meta Pixel (Pixel + CAPI via `trackMeta`)  
✅ Google Analytics 4 Ecommerce (via GTM `pushEcomEvent`)  
✅ Internal Analytics Store (Zustand `useAnalyticsStore`)

---

## ✅ Tracking Functions Used

### Meta
All Meta events are fired using:
```js
await trackMeta("EventName", payload);
```

### GA4 (via GTM)
All GA4 ecommerce events are fired using:
```js
pushEcomEvent("event_name", payload);
```

---

# ✅ EVENTS COMPLETED TODAY

## 1) 🛒 Add To Cart

✅ GA4: `add_to_cart`  
✅ Meta: `AddToCart`

**Where implemented:** `cartStore.addToCart()`

Payload includes:
- currency
- value
- items array (GA4)
- contents + content_ids (Meta)

---

## 2) 🛒 Remove From Cart

✅ GA4: `remove_from_cart`  
✅ Meta: `RemoveFromCart`

**Where implemented:** `cartStore.removeFromCart()`  
Also fires on quantity update when qty becomes 0.

Payload includes:
- currency
- value
- items array (GA4)
- contents + content_ids (Meta)

---

## 3) ✅ Begin Checkout

✅ GA4: `begin_checkout`

**Where implemented:** `src/app/checkout/page.jsx`

Fires only once per checkout session using:
```js
const checkoutTracked = useRef(false);
```

Payload includes:
- currency
- value (payable)
- coupon (if applied)
- items array

---

## 4) 📦 Add Shipping Info (Address Selected)

✅ GA4: `add_shipping_info`  
✅ (Optional Meta if inside your store)

**Where implemented:** `src/app/checkout/page.jsx`

Fires when:
- user selects a saved address
- payable changes (coupon applied etc.)

Uses protection key:
```js
lastShipKey.current = `${selectedAddressObj._id}_${payable}`;
```

Payload includes:
- currency
- value
- addressId
- shippingTier
- items array

---

## 5) 💳 Add Payment Info

✅ Meta: `AddPaymentInfo`

**Where implemented:** `orderStore.createOrder()`

Triggered when an order is created with payment method:
- COD
- Razorpay

Payload includes:
- currency
- value
- payment_method
- contents

---

## 6) ✅ Purchase Event (FINAL)

✅ GA4: `purchase` ✅  
✅ Meta: `Purchase` ✅  
✅ Internal Analytics purchase ✅  

**Centralized tracking function:**
```js
useOrderStore.getState().trackPurchaseSuccess(...)
```

### COD Flow
✅ Purchase fires immediately after `/api/orders` success inside `createOrder()`.

### Razorpay Flow
✅ Purchase fires only after:
- payment success
- backend verify call succeeds

Triggered inside `razorpayStore.handler()`.

---

## ✅ Purchase Deduplication Added

Purchase event is protected from duplicate firing using:
- `_lastPurchaseKey`
- `_lastPurchaseAt`
- a 5 second guard

So purchase won’t fire twice accidentally.

---

# ✅ Summary of Today’s Completed Events

✅ add_to_cart (GA4 + Meta)  
✅ remove_from_cart (GA4 + Meta)  
✅ begin_checkout (GA4)  
✅ add_shipping_info (GA4)  
✅ add_payment_info (Meta)  
✅ purchase (GA4 + Meta + internal analytics)  

---

✅ Tracking work completed successfully.

