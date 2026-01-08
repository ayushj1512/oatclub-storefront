// src/app/checkout/page.jsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Lock } from "lucide-react";
import toast from "react-hot-toast";

import CodConfirmCaptcha from "@/components/checkout/CodConfirmCaptcha";
import OrderSummary from "@/components/checkout/OrderSummary";
import AddressSelection from "@/components/checkout/AddressSelection";
import PaymentOptions from "@/components/checkout/PaymentOptions";

import { useCartStore } from "@/store/cartStore";
import { useAddressStore } from "@/store/addressStore";
import { useAuthStore } from "@/store/authStore";
import { useOrderStore } from "@/store/orderStore";
import { useCouponStore } from "@/store/couponStore";

import { pushEcomEvent } from "@/components/tracking/gtm";
import { mapItem } from "@/components/tracking/ga4Mapper";
import CheckoutCouponSection from "@/components/checkout/CheckoutCouponSection";

/* ---------- utils ---------- */
const isObjectId = (v) => typeof v === "string" && /^[a-fA-F0-9]{24}$/.test(v);

function resolveMongoProductId(it) {
  const pid =
    it?.productIdMongo || it?.productId || it?._id || it?.mongoId || it?.product?._id;
  return isObjectId(pid) ? pid : null;
}

/* ---------- UI bits ---------- */
const Chip = ({ children }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-black/4 px-3 py-1 text-[11px] text-gray-700">
    {children}
  </span>
);

export default function CheckoutPage() {
  const router = useRouter();

  /* ---------------- CART ---------------- */
const cartItems = useCartStore((s) => s.items) || [];
const buyNowItem = useCartStore((s) => s.buyNowItem);
const getCheckoutPayload = useCartStore((s) => s.getCheckoutPayload);
const completeCheckout = useCartStore((s) => s.completeCheckout);

const items = buyNowItem ? [buyNowItem] : cartItems; // ✅ UI + Summary uses this
  const initCart = useCartStore((s) => s.initialize);
  const clearCart = useCartStore((s) => s.clearCart);

  /* ---------------- AUTH ---------------- */
  const user = useAuthStore((s) => s.user);
  const customer = useAuthStore((s) => s.customer);
  const loading = useAuthStore((s) => s.loading);
  const initializeAuth = useAuthStore((s) => s.initialize);
  const createGuestCustomer = useAuthStore((s) => s.createGuestCustomer);

  const [guestInfo, setGuestInfo] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [creatingGuest, setCreatingGuest] = useState(false);

  const updateGuestField = (e) => {
    const { name, value } = e.target;
    setGuestInfo((p) => ({ ...p, [name]: value }));
  };

  /* ---------------- ADDRESS STORE ---------------- */
  const addresses = useAddressStore((s) => s.addresses) || [];
  const fetchAddresses = useAddressStore((s) => s.fetchAddresses);
  const createAddress = useAddressStore((s) => s.createAddress);
  const lookupPincode = useAddressStore((s) => s.lookupPincode);
  const pinLoading = useAddressStore((s) => s.pinLoading);
  const trackAddShippingInfo = useAddressStore((s) => s.trackAddShippingInfo);

  /* ---------------- ORDER ---------------- */
  const createOrder = useOrderStore((s) => s.createOrder);
  const placing = useOrderStore((s) => s.placing);

  /* ---------------- COUPON ---------------- */
  const coupon = useCouponStore((s) => s.coupon);
  const discount = useCouponStore((s) => s.discount);

  /* ---------------- SECTIONS ---------------- */
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const [showSummary, setShowSummary] = useState(true);
  const [showAddress, setShowAddress] = useState(true);
  const [showPayment, setShowPayment] = useState(true);

  const [selectedPayment, setSelectedPayment] = useState("cod");
  const [showCodCaptcha, setShowCodCaptcha] = useState(false);

  /* ---------------- TOTALS ---------------- */
  const subtotal = useMemo(() => {
  return (items || []).reduce((sum, it) => {
    const price = Number(it?.price || 0);
    const qty = Number(it?.quantity ?? it?.qty ?? 1);
    return sum + price * qty;
  }, 0);
}, [items]);


  const payable = useMemo(() => {
    const d = Math.max(0, Number(discount || 0));
    return Math.max(0, subtotal - d);
  }, [subtotal, discount]);

  const selectedAddressObj = useMemo(() => {
    if (!selectedAddressId) return null;
    return addresses.find((a) => String(a?._id) === String(selectedAddressId)) || null;
  }, [addresses, selectedAddressId]);

  /* ---------------- GA4 ITEMS ---------------- */
  const ga4Items = useMemo(() => {
  return (items || []).map((it) =>
    mapItem(
      {
        _id: it?.productId,
        id: it?.productId,
        name: it?.name,
        title: it?.name,
        price: Number(it?.price || 0),
        category: it?.productSnapshot?.category || "",
        variant: [it?.selectedSize, it?.selectedColor].filter(Boolean).join(" / "),
        sku: it?.variant?.sku || it?.productSnapshot?.sku || "",
      },
      Number(it?.quantity ?? it?.qty ?? 1)
    )
  );
}, [items]);


  
  /* ---------------- TRACK SHIPPING INFO ---------------- */
  const lastShipKey = useRef("");

  useEffect(() => {
    if (!selectedAddressObj?._id) return;
    if (!items?.length) return;

    const key = `${selectedAddressObj._id}_${payable}`;
    if (lastShipKey.current === key) return;
    lastShipKey.current = key;

    try {
      trackAddShippingInfo?.({
        currency: "INR",
        value: Number(payable || 0),
        addressId: selectedAddressObj._id,
        shippingTier: "standard",
        items: ga4Items,
      });
    } catch (e) {
      console.warn("📦 add_shipping_info failed", e);
    }
  }, [selectedAddressObj?._id, payable, items?.length, ga4Items]);

  /* ---------------- ADDRESS FORM ---------------- */
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

    firebaseUID: "",
    email: "",
    customerId: "",
  });

  const pinTimer = useRef(null);
  const lastPin = useRef("");

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

    setAddressForm((p) => ({ ...p, [name]: value }));
  };

  /* ---------------- ENSURE GUEST CUSTOMER ---------------- */
const ensureGuestCustomer = async () => {
  // ✅ already logged in
  if (user?.uid && customer?._id) return customer;

  // ✅ guest already has a customer (cookie restored etc.)
  if (!user?.uid && customer?._id) return customer;

  // ✅ ONLY create guest if not logged in AND no customer exists
  if (user?.uid) return customer; // logged in but customer missing (edge)

  const email = addressForm.email?.trim() || guestInfo.email?.trim();
  const phone = addressForm.phone?.trim() || guestInfo.phone?.trim();
  const name = addressForm.fullName?.trim() || guestInfo.name?.trim();
  const password = guestInfo.password?.trim();

  if (!email || !phone || !name || !password) {
    toast.error("Fill Name, Email, Phone & Password");
    return null;
  }

  setCreatingGuest(true);
  const createdCustomer = await createGuestCustomer({ name, email, phone, password });
  setCreatingGuest(false);

  if (!createdCustomer?._id) {
    toast.error("Account creation failed.");
    return null;
  }

  return createdCustomer;
};


  /* ---------------- INIT ---------------- */
  useEffect(() => {
    // initCart?.();
    initializeAuth?.();
  }, []);

  /* ---------------- FETCH ADDRESSES ---------------- */
  useEffect(() => {
  if (loading) return;

  // ✅ LOGGED IN
  if (user?.uid) {
    fetchAddresses?.({ firebaseUID: user.uid }); // ✅ FIXED

    setAddressForm((p) => ({
      ...p,
      firebaseUID: user.uid,
      email: user.email || p.email,
      customerId: customer?._id || p.customerId,
      fullName: p.fullName || customer?.name || user?.name || "",
      phone: p.phone || customer?.phone || "",
    }));
    return;
  }

  // ✅ GUEST WITH CUSTOMER
  if (!user?.uid && customer?._id) {
    fetchAddresses?.({ customerId: customer._id });

    setAddressForm((p) => ({
      ...p,
      firebaseUID: "",
      email: p.email || customer?.email || "",
      customerId: customer._id,
      fullName: p.fullName || customer?.name || "",
      phone: p.phone || customer?.phone || "",
    }));
  }
}, [loading, user?.uid, user?.email, customer?._id]);



  /* ---------------- DEFAULT ADDRESS ---------------- */
  useEffect(() => {
    if (!selectedAddressId && addresses?.length) {
      setSelectedAddressId(addresses[0]?._id || null);
    }
  }, [addresses, selectedAddressId]);

  /* ---------------- SAVE NEW ADDRESS ---------------- */
 const saveNewAddress = async () => {
  let finalCustomer = customer;

  // ✅ if logged in, we should NEVER create guest
  if (user?.uid) {
    if (!finalCustomer?._id) {
      toast.error("Customer profile missing. Please refresh & try again.");
      return;
    }
  }

  // ✅ Guest case: ONLY create guest if no user + no customer
  if (!user?.uid && !finalCustomer?._id) {
    const name = addressForm.fullName?.trim();
    const email = addressForm.email?.trim();
    const phone = addressForm.phone?.trim();
    const password = guestInfo.password?.trim();

    if (!name || !email || !phone) {
      toast.error("Please fill Name, Email & Phone in address form.");
      return;
    }

    if (!password || password.length < 4) {
      toast.error("Password is required to continue as guest.");
      return;
    }

    try {
      setCreatingGuest(true);

      finalCustomer = await createGuestCustomer({
        name,
        email,
        phone,
        password,
      });

      if (!finalCustomer?._id) {
        toast.error("Could not create guest profile. Try again.");
        return;
      }

      toast.success("Guest profile created ✅");
    } finally {
      setCreatingGuest(false);
    }
  }

  // ✅ now we must have customerId
  const customerId = finalCustomer?._id;
  const firebaseUID = user?.uid || ""; // guest => ""
  const email = user?.email || addressForm.email || finalCustomer?.email || "";

  if (!customerId || !email) {
    toast.error("Customer profile missing. Try again.");
    return;
  }

  // ✅ Address validations
  if (!addressForm.postalCode || addressForm.postalCode.length !== 6) {
    toast.error("Enter a valid 6-digit pincode");
    return;
  }
  if (!addressForm.addressLine1) {
    toast.error("Address line 1 is required");
    return;
  }
  if (!addressForm.fullName) {
    toast.error("Full name is required");
    return;
  }
  if (!addressForm.phone) {
    toast.error("Phone is required");
    return;
  }

  try {
    setSavingAddress(true);

    const payload = {
      ...addressForm,
      firebaseUID,
      email,
      customerId,
      fullName: addressForm.fullName,
      phone: addressForm.phone,
    };

    const created = await createAddress?.(payload);

    setShowAddressForm(false);

    if (created?._id) setSelectedAddressId(created._id);
  } finally {
    setSavingAddress(false);
  }
};




  /* ---------------- VALIDATE CHECKOUT ---------------- */
const validate = () => {
  const payload = getCheckoutPayload(); // ✅ cartStore decides buyNow/cart

  if (!payload.length) return "Your cart is empty.";
  if (!user?.uid && !customer?._id) return "Please login or continue as guest.";
  if (!selectedAddressObj) return "Please select an address.";
  if (!["cod", "razorpay"].includes(selectedPayment))
    return "Invalid payment method selected.";

  // ✅ ObjectId check
  const bad = payload.find((it) => !isObjectId(it.productId));
  if (bad) return "Cart item missing Mongo ObjectId.";

  // ✅ VariantId safety check (if present but empty)
  const badVariant = payload.find((it) => ("variantId" in it) && !it.variantId);
  if (badVariant) return "Please select size/color for one item.";

  return null;
};





  const checkoutError = useMemo(() => validate(), [
    items?.length,
    user?.uid,
    customer?._id,
    selectedAddressObj?._id,
    selectedPayment,
  ]);

  const canCheckout = !checkoutError && !placing;

  /* ---------------- PLACE ORDER (COD FLOW) ---------------- */
const handlePlaceOrder = async () => {
  let finalCustomer = customer;

  // ✅ If logged in → MUST already have customer (never create guest)
  if (user?.uid) {
    if (!finalCustomer?._id) {
      toast.error("Customer profile missing. Please refresh & try again.");
      return;
    }
  }

  // ✅ Guest case → create only if missing
  if (!user?.uid && !finalCustomer?._id) {
    finalCustomer = await ensureGuestCustomer();
    if (!finalCustomer?._id) return;
  }

  const err = validate();
  if (err) return toast.error(err);

  if (!selectedAddressObj?._id) {
    toast.error("Shipping address not selected.");
    return;
  }

  const toastId = toast.loading("Placing your order...");

  try {
    // ✅ ✅ ✅ THIS IS THE ONLY SOURCE OF TRUTH
    const orderItems = getCheckoutPayload(); // 🔥 cartStore handles buyNow/cart + variantIds

    if (!orderItems?.length) {
      throw new Error("Checkout items missing.");
    }

    const order = await createOrder({
      customerId: finalCustomer._id,
      shippingAddressId: selectedAddressObj._id,
      billingAddressId: selectedAddressObj._id,
      paymentMethod: selectedPayment,
      items: orderItems,
      source: "website",

      coupon: coupon
        ? {
            code: coupon.code,
            discount,
            finalTotal: payable,
          }
        : null,
    });

    // ✅ Clear based on flow
    if (buyNowItem) {
      completeCheckout?.(); // ✅ clears buyNow cookie + state
    } else {
      clearCart?.(); // ✅ normal cart clear
    }

    toast.success("Order placed successfully!", { id: toastId });

    router.push(
      order?.orderNumber
        ? `/order-success?order=${order.orderNumber}`
        : "/order-success"
    );
  } catch (e) {
    toast.error(e?.message || "Failed to place order.", { id: toastId });
  }
};




  /* ---------------- BEGIN CHECKOUT TRACK EVENT ---------------- */
  const checkoutTracked = useRef(false);

  useEffect(() => {
    if (checkoutTracked.current) return;
    if (!items?.length) return;

    checkoutTracked.current = true;

    try {
      pushEcomEvent("begin_checkout", {
        currency: "INR",
        value: Number(payable || 0),
        coupon: coupon?.code || undefined,
        items: ga4Items,
      });
    } catch (e) {
      console.warn("📈 GA4 begin_checkout failed", e);
    }
  }, [items?.length, payable, coupon?.code, ga4Items]);

  /* ---------------- PAGE UI ---------------- */
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
          {/* ✅ Step 1 */}
          <OrderSummary
            items={items}
            subtotal={subtotal}
            coupon={coupon}
            discount={discount}
            payable={payable}
            showSummary={showSummary}
            setShowSummary={setShowSummary}
          />

             {/* ✅ COUPON SECTION */}
                            <CheckoutCouponSection cartTotal={subtotal} />

          {/* ✅ Step 2 */}
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
          />

          {/* ✅ Step 3 + Total CTA */}
          <PaymentOptions
            showPayment={showPayment}
            setShowPayment={setShowPayment}
            selectedPayment={selectedPayment}
            setSelectedPayment={setSelectedPayment}
            payable={payable}
            coupon={coupon}
            discount={discount}
            placing={placing}
            canCheckout={canCheckout}
            validate={validate}
            setShowCodCaptcha={setShowCodCaptcha}
            items={items}
            selectedAddressObj={selectedAddressObj}
            user={user}
            customer={customer}
            ensureGuestCustomer={ensureGuestCustomer}
            createOrder={createOrder}
          />
        </div>
      </div>

      {/* ✅ COD Captcha Modal */}
      <CodConfirmCaptcha
        open={showCodCaptcha}
        onClose={() => setShowCodCaptcha(false)}
        onVerified={handlePlaceOrder}
      />
    </section>
  );
}
