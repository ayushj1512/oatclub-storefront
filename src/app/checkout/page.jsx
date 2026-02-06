// src/app/checkout/page.jsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import toast from "react-hot-toast";

// import CodConfirmCaptcha from "@/components/checkout/CodConfirmCaptcha";
import OrderSummary from "@/components/checkout/OrderSummary";
import AddressSelection from "@/components/checkout/AddressSelection";
import PaymentOptions from "@/components/checkout/PaymentOptions";
import CheckoutCouponSection from "@/components/checkout/CheckoutCouponSection";

import { useCartStore } from "@/store/cartStore";
import { useAddressStore } from "@/store/addressStore";
import { useAuthStore } from "@/store/authStore";
import { useOrderStore } from "@/store/orderStore";
import { useCouponStore } from "@/store/couponStore";

import { pushEcomEvent } from "@/components/tracking/gtm";
import { mapItem } from "@/components/tracking/ga4Mapper";
import { trackSnap } from "@/lib/snap/track.js";

/* ---------- tiny UI ---------- */
const Chip = ({ children }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-black/4 px-3 py-1 text-[11px] text-gray-700">
    {children}
  </span>
);

export default function CheckoutPage() {
  const router = useRouter();

  /* ---------------- STORES ---------------- */
  const cartItems = useCartStore((s) => s.items) || [];
  const buyNowItem = useCartStore((s) => s.buyNowItem);
  const initCart = useCartStore((s) => s.initialize);
  const clearCart = useCartStore((s) => s.clearCart);
  const completeCheckout = useCartStore((s) => s.completeCheckout);
  const getCheckoutPayload = useCartStore((s) => s.getCheckoutPayload);

  const user = useAuthStore((s) => s.user);
  const customer = useAuthStore((s) => s.customer);
  const initializeAuth = useAuthStore((s) => s.initialize);
  const createGuestCustomer = useAuthStore((s) => s.createGuestCustomer);

  const addresses = useAddressStore((s) => s.addresses) || [];
  const fetchAddresses = useAddressStore((s) => s.fetchAddresses);
  const createAddress = useAddressStore((s) => s.createAddress);
  const clearAddresses = useAddressStore((s) => s.clearAddresses);
  const lookupPincode = useAddressStore((s) => s.lookupPincode);
  const pinLoading = useAddressStore((s) => s.pinLoading);
  const trackAddShippingInfo = useAddressStore((s) => s.trackAddShippingInfo);

  const createOrder = useOrderStore((s) => s.createOrder);
  const placing = useOrderStore((s) => s.placing);

  const coupon = useCouponStore((s) => s.coupon);
  const discount = useCouponStore((s) => s.discount);
  const removeCoupon = useCouponStore((s) => s.removeCoupon);

  /* ---------------- LOCAL UI ---------------- */
  const items = buyNowItem ? [buyNowItem] : cartItems;

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState("cod");

  const [showSummary, setShowSummary] = useState(true);
  const [showAddress, setShowAddress] = useState(true);
  const [showPayment, setShowPayment] = useState(true);

  // const [showCodCaptcha, setShowCodCaptcha] = useState(false);

  /* ✅ IMPORTANT: local customer for existing-email users (no login) */
  const [guestCustomer, setGuestCustomer] = useState(null);

  /* ---------------- GUEST + ADDRESS FORM ---------------- */
  const [guestInfo, setGuestInfo] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [creatingGuest, setCreatingGuest] = useState(false);

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  const [addressForm, setAddressForm] = useState({
    postalCode: "",
    city: "",
    state: "",
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    addressType: "home",
    email: "",
  });

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    const st = useCartStore.getState();
    if (!st.items?.length && !st.buyNowItem) initCart?.();
    initializeAuth?.();
  }, []);

  /* ✅ sync local guestCustomer if store customer exists */
    useEffect(() => {
    // ✅ only sync if guestCustomer is empty and store has customer
    if (!guestCustomer?._id && customer?._id) setGuestCustomer(customer);
  }, [customer?._id, guestCustomer?._id]);



  /* ---------------- TOTALS ---------------- */
  const subtotal = useMemo(() => {
    return (items || []).reduce((sum, it) => {
      const price = Number(it?.price ?? it?.productSnapshot?.price ?? 0) || 0;
      const qty = Math.max(1, Number(it?.quantity ?? it?.qty ?? 1) || 1);
      return sum + price * qty;
    }, 0);
  }, [items]);

// coupon discount
const couponDiscount = useMemo(() => {
  return Math.max(0, Number(discount || 0));
}, [discount]);

// payable after coupon (base for razorpay extra)
const payableAfterCoupon = useMemo(() => {
  return Math.max(0, subtotal - Math.min(couponDiscount, subtotal));
}, [subtotal, couponDiscount]);

// ✅ Razorpay extra discount on payableAfterCoupon, not subtotal
const razorpayExtraDiscount = useMemo(() => {
  if (String(selectedPayment).toLowerCase() !== "razorpay") return 0;

  const base = payableAfterCoupon; // 👈 coupon already removed
  const extra = Math.round(base * 0.10);

  return Math.min(extra, base);
}, [selectedPayment, payableAfterCoupon]);

// ✅ final payable
const payable = useMemo(() => {
  return Math.max(0, payableAfterCoupon - razorpayExtraDiscount);
}, [payableAfterCoupon, razorpayExtraDiscount]);

  const selectedAddressObj = useMemo(() => {
    if (!selectedAddressId) return null;
    return (
      addresses.find((a) => String(a?._id) === String(selectedAddressId)) || null
    );
  }, [addresses, selectedAddressId]);

  /* ---------------- DEFAULT ADDRESS ---------------- */
  useEffect(() => {
  if (!addresses?.length) {
    setSelectedAddressId(null);
    return;
  }

  const exists = addresses.some(
    (a) => String(a?._id) === String(selectedAddressId)
  );

  if (!selectedAddressId || !exists) {
    setSelectedAddressId(addresses[0]?._id || null); // ✅ top address selected
  }
}, [addresses, selectedAddressId]);


  /* ---------------- GA4 ITEMS ---------------- */
  const ga4Items = useMemo(() => {
    return (items || []).map((it) => {
      const qty = Math.max(1, Number(it?.quantity ?? it?.qty ?? 1) || 1);
      const price = Number(it?.price ?? it?.productSnapshot?.price ?? 0) || 0;

      const id =
        it?.variant?.sku ||
        it?.productSnapshot?.sku ||
        it?.variantId ||
        it?.productId;

      const variantText = [it?.selectedSize, it?.selectedColor]
        .filter(Boolean)
        .join(" / ");

      return mapItem(
        {
          _id: String(id || ""),
          id: String(id || ""),
          name: it?.name || it?.productSnapshot?.title || "Item",
          title: it?.name || it?.productSnapshot?.title || "Item",
          price,
          category: it?.productSnapshot?.category || "",
          variant: variantText,
          sku: it?.variant?.sku || it?.productSnapshot?.sku || "",
        },
        qty
      );
    });
  }, [items]);

  /* ---------------- TRACK begin_checkout (once) ---------------- */
  /* ---------------- TRACK begin_checkout + Snap START_CHECKOUT (once) ---------------- */
const checkoutTracked = useRef(false);

useEffect(() => {
  if (checkoutTracked.current || !items?.length) return;
  checkoutTracked.current = true;

  // ✅ GA4 begin_checkout (existing)
  try {
    pushEcomEvent("begin_checkout", {
      currency: "INR",
      value: Number(payable || 0),
      coupon: coupon?.code || undefined,
      items: ga4Items,
    });
    console.log("📈 GA4 begin_checkout fired", { value: Number(payable || 0), coupon: coupon?.code || null });
  } catch (e) {
    console.warn("📈 GA4 begin_checkout failed", e);
  }

  // 👻 Snapchat START_CHECKOUT (Pixel + CAPI)
  try {
    const itemIds = (items || [])
      .map((it) => it?.productId || it?.id)
      .filter(Boolean)
      .map((x) => String(x));

    trackSnap("START_CHECKOUT", {
      currency: "INR",
      price: Number(payable || 0),
      item_ids: itemIds,
      ...(coupon?.code ? { coupon: String(coupon.code) } : {}),
    });

    console.log("👻 Snap START_CHECKOUT fired", { price: Number(payable || 0), item_ids: itemIds });
  } catch (e) {
    console.warn("👻 Snap START_CHECKOUT failed", e);
  }
}, [items?.length, payable, coupon?.code, ga4Items, items]);


  /* ---------------- PINCODE LOOKUP ---------------- */
  const pinTimer = useRef(null);
  const lastPin = useRef("");
    // ✅ Prevent multiple parallel ensure calls
  const ensureLockRef = useRef(false);
  const ensuredCustomerRef = useRef(null);


  const lastGuestEmailRef = useRef("");

const resetGuestContext = () => {
  // clear addresses if you have this in store
  clearAddresses?.();

  setSelectedAddressId(null);
  setGuestCustomer(null);

  // reset ensure cache so old customer isn't reused
  ensuredCustomerRef.current = null;
  ensureLockRef.current = false;
};

  const updateAddressField = (e) => {
  const { name, value } = e.target;

  if (name === "postalCode") {
    const cleaned = String(value || "").replace(/\D/g, "").slice(0, 6);
    setAddressForm((p) => ({ ...p, postalCode: cleaned }));

    if (pinTimer.current) clearTimeout(pinTimer.current);
    if (cleaned.length !== 6) return;

    pinTimer.current = setTimeout(async () => {
      if (lastPin.current === cleaned) return;
      lastPin.current = cleaned;

      const info = await lookupPincode?.(cleaned);
      if (info?.state || info?.district || info?.city) {
        setAddressForm((p) => ({
          ...p,
          city: info.city || info.district || p.city,
          state: info.state || p.state,
        }));
      }
    }, 250);

    return;
  }

  // ✅ handle email change (guest flow)
  if (name === "email") {
    const clean = String(value || "").trim().toLowerCase();

    if (clean !== lastGuestEmailRef.current) {
      lastGuestEmailRef.current = clean;
      resetGuestContext();
    }

    setAddressForm((p) => ({ ...p, email: clean }));
    return;
  }

  setAddressForm((p) => ({ ...p, [name]: value }));
};


  const updateGuestField = (e) => {
    const { name, value } = e.target;
    setGuestInfo((p) => ({ ...p, [name]: value }));
  };

  /* ---------------- FETCH ADDRESS FOR LOGGED IN ---------------- */
  useEffect(() => {
    if (!user?.uid) return;

    fetchAddresses?.({ firebaseUID: user.uid });

    setAddressForm((p) => ({
      ...p,
      email: user.email || p.email,
      fullName: p.fullName || customer?.name || "",
      phone: p.phone || customer?.phone || "",
    }));
  }, [user?.uid, user?.email, customer?.name, customer?.phone]);

  /* ---------------- EXISTING CUSTOMER FOUND (guest email flow) ---------------- */
  const onCustomerFound = async (cust) => {
    // ✅ store locally
    setGuestCustomer(cust);

    // ✅ patch email into form
    setAddressForm((p) => ({ ...p, email: cust.email || p.email }));

    // ✅ load addresses
    await fetchAddresses?.({ firebaseUID: cust.firebaseUID });
  };

  /* ---------------- ENSURE CUSTOMER FOR GUEST ---------------- */
  const ensureGuestCustomer = async () => {
  if (user?.uid && customer?._id) return customer;
  if (!user?.uid && guestCustomer?._id) return guestCustomer;

  const email = addressForm.email?.trim();
  const phone = addressForm.phone?.trim();
  const name = addressForm.fullName?.trim();
  const password = guestInfo.password?.trim();

  if (!email || !phone || !name || !password) {
    toast.error("Fill Name, Email, Phone & Password");
    return null;
  }

  // ✅ toast: creating account
  const tId = toast.loading("Creating account...");

  try {
    setCreatingGuest(true);
    const created = await createGuestCustomer({ name, email, phone, password });

    const createdCustomer = created?.customer || null;
    if (!createdCustomer?._id) {
      toast.error("Account creation failed.", { id: tId });
      return null;
    }

    setGuestCustomer(createdCustomer);

    // ✅ toast: created
    toast.success("Account created ✅", { id: tId });
    return createdCustomer;
  } catch (e) {
    console.error("❌ ensureGuestCustomer failed", e);
    toast.error("Account creation failed.", { id: tId });
    return null;
  } finally {
    setCreatingGuest(false);
  }
};




  /**
   * ✅ Universal ensure: Logged-in OR Guest
   * Goal: return a customer with _id, ALWAYS (or null)
   */
  const ensureCustomer = async ({ silent = false } = {}) => {
    // If already ensured in this session, reuse
    if (ensuredCustomerRef.current?._id) return ensuredCustomerRef.current;

    // Store customer already present
    if (customer?._id) {
      ensuredCustomerRef.current = customer;
      return customer;
    }

    // Guest customer already detected via email flow
    if (!user?.uid && guestCustomer?._id) {
      ensuredCustomerRef.current = guestCustomer;
      return guestCustomer;
    }

    // Avoid parallel duplicate creation
    if (ensureLockRef.current) {
      // wait a bit for current ensure to finish
      await new Promise((r) => setTimeout(r, 250));
      return (
        ensuredCustomerRef.current ||
        customer ||
        guestCustomer ||
        null
      );
    }

    ensureLockRef.current = true;

    try {
      // ✅ Logged-in but customer doc missing:
      // We must create/ensure a customer linked to firebaseUID.
      if (user?.uid && !customer?._id) {
        const email = (user?.email || addressForm.email || "").trim();
        const phone = (addressForm.phone || customer?.phone || "").trim();
        const name = (addressForm.fullName || customer?.name || "").trim() || "User";

        // If your backend does NOT need password for logged-in users,
        // you should update backend + store. For now we still call same function.
        const password =
          (guestInfo.password || "").trim() ||
          "__firebase_login__"; // placeholder; backend should ignore in logged-in mode

        if (!email || !phone) {
          if (!silent) toast.error("Please fill email & phone to continue.");
          return null;
        }

        // Prefer backend upsert by firebaseUID/email
        const created = await createGuestCustomer({
          name,
          email,
          phone,
          password,
          firebaseUID: user.uid, // ✅ critical
          mode: "logged_in",     // optional (backend can ignore)
        });

        const c = created?.customer || null;
        if (c?._id) {
          setGuestCustomer(c);
          ensuredCustomerRef.current = c;
          return c;
        }

        if (!silent) toast.error("Could not create customer profile.");
        return null;
      }

      // ✅ Guest flow (no login)
      const c = await ensureGuestCustomer();
      if (c?._id) {
        ensuredCustomerRef.current = c;
        return c;
      }
      return null;
    } catch (e) {
      console.error("❌ ensureCustomer failed", e);
      if (!silent) toast.error("Could not continue. Please try again.");
      return null;
    } finally {
      ensureLockRef.current = false;
    }
  };




  /* ---------------- SAVE NEW ADDRESS ---------------- */
    const saveNewAddress = async () => {
  // ✅ ALWAYS ensure customer (logged-in OR guest)
  const finalCustomer = await ensureCustomer();
  if (!finalCustomer?._id) return false;

  if (!addressForm.postalCode || addressForm.postalCode.length !== 6) {
    toast.error("Enter valid pincode");
    return false;
  }
  if (!addressForm.fullName) {
    toast.error("Full name required");
    return false;
  }
  if (!addressForm.phone) {
    toast.error("Phone required");
    return false;
  }
  if (!addressForm.addressLine1) {
    toast.error("Address required");
    return false;
  }

  const tId = toast.loading("Saving address...");

  try {
    setSavingAddress(true);

    const payload = {
      ...addressForm,
      firebaseUID: finalCustomer?.firebaseUID || user?.uid || null,
      customerId: finalCustomer._id, // ✅ NEVER null now
      email: user?.email || addressForm.email || finalCustomer?.email || "",
    };

    const created = await createAddress?.(payload);

    // ✅ support both response shapes
    const createdId = created?._id || created?.address?._id;

    if (!createdId) {
      toast.error("Address save failed.", { id: tId });
      return false;
    }

    // ✅ IMPORTANT: refresh addresses so UI list updates correctly
    await fetchAddresses?.({ firebaseUID: payload.firebaseUID });

    // ✅ close form and auto-select the newly created address
    setShowAddressForm(false);
    setSelectedAddressId(createdId);

    toast.success("Address saved ✅", { id: tId });
    return true;
  } catch (e) {
    console.error("❌ saveNewAddress failed", e);
    toast.error("Address save failed.", { id: tId });
    return false;
  } finally {
    setSavingAddress(false);
  }
};




  /* ✅✅ FIXED VALIDATION (NO CUSTOMER ID DEPENDENCY) */
  const validateCheckout = () => {
    const payload = getCheckoutPayload();
    if (!payload?.length) return "Your cart is empty.";

    // ✅ guest must enter email
    if (!user?.uid && !addressForm.email?.trim()) {
      return "Please enter your email.";
    }

    // ✅ must select address
    if (!selectedAddressObj?._id) {
      return "Please select or add an address.";
    }

    if (!["cod", "razorpay"].includes(selectedPayment)) {
      return "Invalid payment method.";
    }

    return null;
  };

  /* ---------------- PLACE ORDER ---------------- */
    const handlePlaceOrder = async () => {
    // ✅ ALWAYS ensure customer (logged-in OR guest)
    const finalCustomer = await ensureCustomer();
    if (!finalCustomer?._id) return;

    const err = validateCheckout();
    if (err) return toast.error(err);

    const toastId = toast.loading("Placing your order...");

    try {
      const orderItems = getCheckoutPayload();

      const order = await createOrder({
        customerId: finalCustomer._id, // ✅ stable
        shippingAddressId: selectedAddressObj._id,
        billingAddressId: selectedAddressObj._id,
        paymentMethod: selectedPayment,
        items: orderItems,
        source: "website",
        discount: Number(discount || 0),
        coupon: coupon ? { code: coupon.code } : null,
      });

      if (buyNowItem) completeCheckout?.();
      else clearCart?.();

      removeCoupon?.();

      toast.success("Order placed!", { id: toastId });
      router.push(
        order?.orderNumber
          ? `/order-success?order=${order.orderNumber}`
          : "/order-success"
      );
    } catch (e) {
      toast.error(e?.message || "Failed to place order.", { id: toastId });
    }
  };


  /* ---------------- UI ---------------- */
  return (
    <section className="w-full min-h-screen bg-[#F6F6F8]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-black/[0.06] to-transparent" />

      <div className="relative w-full px-4 sm:px-6 lg:px-10 py-8 sm:py-10">
        <div className="flex flex-col items-center gap-3 mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
            Checkout
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Chip>
              <Lock className="w-3.5 h-3.5" /> Secure
            </Chip>
            <Chip>Fast dispatch</Chip>
            <Chip>Easy returns</Chip>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {/* Step 1: Email + Address */}
          <AddressSelection
            user={user}
            addresses={addresses}
            selectedAddressId={selectedAddressId}
            setSelectedAddressId={setSelectedAddressId}
            showAddress={showAddress}
            setShowAddress={setShowAddress}
            showAddressForm={showAddressForm}
            setShowAddressForm={setShowAddressForm}
            addressForm={addressForm}
            updateAddressField={updateAddressField}
            saveNewAddress={saveNewAddress}
            pinLoading={pinLoading}
            savingAddress={savingAddress}
            creatingGuest={creatingGuest}
            guestInfo={guestInfo}
            updateGuestField={updateGuestField}
            onCustomerFound={onCustomerFound}
          />

          {/* Step 2: Summary */}
         <OrderSummary
  items={items}
  subtotal={subtotal}
  coupon={coupon}
  discount={discount}
  razorpayExtraDiscount={razorpayExtraDiscount}
  payable={payable}
  showSummary={showSummary}
  setShowSummary={setShowSummary}
  email={addressForm.email}
  phone={addressForm.phone}
  customerId={user?.uid || null}
/>



          {/* Step 3: Payment */}
        <PaymentOptions
  showPayment={showPayment}
  setShowPayment={setShowPayment}
  selectedPayment={selectedPayment}
  setSelectedPayment={setSelectedPayment}
  payable={payable}
  subtotal={subtotal} // ✅ NEW (for showing “you save ₹x”)
razorpayExtraDiscount={razorpayExtraDiscount} // ✅ NEW (10% extra off amount)
  coupon={coupon}
  discount={discount}
  placing={placing}
  validate={validateCheckout}
  // setShowCodCaptcha={setShowCodCaptcha}
  onPlaceOrder={handlePlaceOrder}

  selectedAddressObj={selectedAddressObj}
  user={user}
  customer={customer || guestCustomer}
  ensureGuestCustomer={ensureGuestCustomer}
  getCheckoutPayload={getCheckoutPayload}
  createOrder={createOrder}
/>

        </div>
      </div>

      {/* <CodConfirmCaptcha
        open={showCodCaptcha}
        onClose={() => setShowCodCaptcha(false)}
        onVerified={handlePlaceOrder}
      /> */}
    </section>
  );
}
