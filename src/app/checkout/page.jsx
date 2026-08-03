"use client";

import { Lock, PackageCheck, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

// import CodConfirmCaptcha from "@/components/checkout/CodConfirmCaptcha";
import AddressSelection from "@/components/checkout/AddressSelection";
import OrderSummary from "@/components/checkout/OrderSummary";
import PaymentOptions from "@/components/checkout/PaymentOptions";
import { trackSnap } from "@/lib/snap/track.js";
import { useAddressStore } from "@/store/addressStore";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useCouponStore } from "@/store/couponStore";
import useGtmStore from "@/store/gtmStore";
import { useOrderStore } from "@/store/orderStore";
import { useRazorpayStore } from "@/store/razorpayStore";

import { useMarketingCampaignStore } from "@/store/marketing-campaignStore";

import useCustomerStore from "@/store/customerStore";

/* ---------- tiny UI ---------- */
const Chip = ({ children }) => (
  <span className="inline-flex h-7 items-center gap-1.5 border border-neutral-200 bg-[#fbfaf7] px-2.5 text-[9px] font-black uppercase tracking-[0.14em] text-black/55">
    {children}
  </span>
);

const HeaderPromise = ({ icon, title, text }) => (
  <div className="border-l border-neutral-200 px-2 first:border-l-0 sm:px-4 sm:first:pl-0">
    <div className="flex flex-col items-center gap-1 text-center text-[8px] font-black uppercase leading-3 tracking-[0.08em] text-black sm:flex-row sm:text-left sm:text-[10px] sm:tracking-[0.14em]">
      {icon}
      {title}
    </div>
    <p className="mt-1 hidden text-[9px] font-bold uppercase leading-4 tracking-[0.08em] text-black/42 sm:block">
      {text}
    </p>
  </div>
);

export default function CheckoutPage() {
  const router = useRouter();
  const trackCheckoutStarted = useMarketingCampaignStore(
    (s) => s.trackCheckoutStarted
  );
  const markConversion = useMarketingCampaignStore((s) => s.markConversion);

  /* ---------------- STORES ---------------- */
  const cartItems = useCartStore((s) => s.items) || [];
  const buyNowItem = useCartStore((s) => s.buyNowItem);
  const initCart = useCartStore((s) => s.initialize);
  const clearCart = useCartStore((s) => s.clearCart);
  const completeCheckout = useCartStore((s) => s.completeCheckout);
  const getCheckoutPayload = useCartStore((s) => s.getCheckoutPayload);
  const getCouponCartItems = useCartStore((s) => s.getCouponCartItems);

  const user = useAuthStore((s) => s.user);
  const customer = useAuthStore((s) => s.customer);
  const initializeAuth = useAuthStore((s) => s.initialize);
  const createGuestCustomer = useAuthStore((s) => s.createGuestCustomer);

  const addresses = useAddressStore((s) => s.addresses) || [];
  const addressesLoading = useAddressStore((s) => s.loading);
  const fetchAddressesBoth = useAddressStore((s) => s.fetchAddressesBoth);
  const fetchAddressesByEmail = useAddressStore(
    (s) => s.fetchAddressesByEmail
  );
  const createAddress = useAddressStore((s) => s.createAddress);
  const clearAddresses = useAddressStore((s) => s.clearAddresses);
  const lookupPincode = useAddressStore((s) => s.lookupPincode);
  const pinLoading = useAddressStore((s) => s.pinLoading);
  const trackAddShippingInfo = useAddressStore((s) => s.trackAddShippingInfo);

  const createOrder = useOrderStore((s) => s.createOrder);
  const placing = useOrderStore((s) => s.placing);

  const payWithRazorpay = useRazorpayStore((s) => s.payWithRazorpay);
  const razorpayLoading = useRazorpayStore((s) => s.loading);
  const resetRazorpay = useRazorpayStore((s) => s.reset);

  const coupon = useCouponStore((s) => s.coupon);
  const discount = useCouponStore((s) => s.discount);
  const removeCoupon = useCouponStore((s) => s.removeCoupon);

  const fetchCustomerCreditSummary = useCustomerStore(
    (s) => s.fetchCustomerCreditSummary
  );

  const creditSummary = useCustomerStore((s) => s.creditSummary);

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

  const activeCustomer = customer || guestCustomer;

  const isCustomerBlacklisted =
    activeCustomer?.isBlacklisted === true;

  const walletBalance = Number(
    creditSummary?.balance ||
    activeCustomer?.credits?.balance ||
    0
  );
  const [useWallet, setUseWallet] = useState(false);
  const [walletAmount, setWalletAmount] = useState(0);

  /* ---------------- GUEST + ADDRESS FORM ---------------- */

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
    if (
      isCustomerBlacklisted &&
      selectedPayment === "cod"
    ) {
      setSelectedPayment("razorpay");
      setShowPayment(true);
    }
  }, [isCustomerBlacklisted, selectedPayment]);

  /* ✅ sync local guestCustomer if store customer exists */
  useEffect(() => {
    // ✅ only sync if guestCustomer is empty and store has customer
    if (!guestCustomer?._id && customer?._id) setGuestCustomer(customer);
  }, [customer?._id, guestCustomer?._id]);

  useEffect(() => {
    const customerId = activeCustomer?._id;

    if (!customerId) return;

    fetchCustomerCreditSummary(customerId).catch((err) => {
      console.warn("Credit summary fetch failed", err);
    });
  }, [activeCustomer?._id]);



  /* ---------------- TOTALS ---------------- */
  const subtotal = useMemo(() => {
    return (items || []).reduce((sum, it) => {
      const price = Number(it?.price ?? it?.productSnapshot?.price ?? 0) || 0;
      const qty = Math.max(1, Number(it?.quantity ?? it?.qty ?? 1) || 1);
      return sum + price * qty;
    }, 0);
  }, [items]);


  const couponCartItems = useMemo(() => {
    if (buyNowItem) {
      const price = Number(buyNowItem?.price ?? buyNowItem?.productSnapshot?.price ?? 0) || 0;

      return [
        {
          productId: buyNowItem.productId,
          productCode: buyNowItem.productSnapshot?.productCode || buyNowItem.productCode || "",
          title: buyNowItem.name || buyNowItem.productSnapshot?.title || "",
          quantity: Number(buyNowItem.quantity || 1),
          price,
          isPrimaryProduct: Boolean(
            buyNowItem.isPrimaryProduct || buyNowItem.productSnapshot?.isPrimaryProduct
          ),
          categories: buyNowItem.categories || buyNowItem.productSnapshot?.categories || [],
          collections: buyNowItem.collections || buyNowItem.productSnapshot?.collections || [],
          product: {
            _id: buyNowItem.productId,
            price,
            isPrimaryProduct: Boolean(
              buyNowItem.isPrimaryProduct || buyNowItem.productSnapshot?.isPrimaryProduct
            ),
            categories: buyNowItem.categories || buyNowItem.productSnapshot?.categories || [],
            collections: buyNowItem.collections || buyNowItem.productSnapshot?.collections || [],
          },
        },
      ];
    }

    return typeof getCouponCartItems === "function" ? getCouponCartItems() : [];
  }, [buyNowItem, getCouponCartItems, cartItems]);

  // coupon discount
  const couponDiscount = useMemo(() => {
    return Math.max(0, Number(discount || 0));
  }, [discount]);

  // payable after coupon (base for razorpay extra)
  const payableAfterCoupon = useMemo(() => {
    return Math.max(0, subtotal - Math.min(couponDiscount, subtotal));
  }, [subtotal, couponDiscount]);

  // ✅ Razorpay extra discount on payableAfterCoupon, not subtotal
  const appliedWalletAmount = useMemo(() => {
    if (!useWallet && selectedPayment !== "wallet") return 0;

    return Math.min(
      Math.max(0, Number(walletAmount || 0)),
      Math.max(0, Number(walletBalance || 0)),
      Math.max(0, Number(payableAfterCoupon || 0))
    );
  }, [useWallet, selectedPayment, walletAmount, walletBalance, payableAfterCoupon]);

  const payableAfterWallet = useMemo(() => {
    return Math.max(0, payableAfterCoupon - appliedWalletAmount);
  }, [payableAfterCoupon, appliedWalletAmount]);

  const razorpayExtraDiscount = useMemo(() => {
    if (String(selectedPayment).toLowerCase() !== "razorpay") return 0;

    const base = payableAfterWallet;
    const extra = Math.round(base * 0.10);

    return Math.min(extra, base);
  }, [selectedPayment, payableAfterWallet]);

  const payable = useMemo(() => {
    return Math.max(0, payableAfterWallet - razorpayExtraDiscount);
  }, [payableAfterWallet, razorpayExtraDiscount]);

  const paymentOptionsPayable = payableAfterWallet;

  const selectedAddressObj = useMemo(() => {
    if (showAddressForm || !selectedAddressId) return null;

    return (
      addresses.find(
        (address) =>
          String(address?._id) === String(selectedAddressId)
      ) || null
    );
  }, [addresses, selectedAddressId, showAddressForm]);

  const usingSavedAddress = Boolean(
    !showAddressForm && selectedAddressObj?._id
  );

  /* ---------------- DEFAULT ADDRESS ---------------- */
  useEffect(() => {
    if (addressesLoading) return;

    if (!addresses?.length) {
      setSelectedAddressId(null);
      setShowAddressForm(true);
      return;
    }

    const selectedExists = addresses.some(
      (address) =>
        String(address?._id) === String(selectedAddressId)
    );

    if (!selectedExists) {
      const defaultAddress =
        addresses.find((address) => address?.isDefaultShipping) ||
        addresses.find((address) => address?.isDefaultBilling) ||
        addresses[0];

      setSelectedAddressId(defaultAddress?._id || null);
      setShowAddressForm(false);
    }
  }, [addresses, addressesLoading, selectedAddressId]);


  /* ---------------- GA4 ITEMS ---------------- */


  /* ---------------- TRACK begin_checkout (once) ---------------- */
  /* ---------------- TRACK begin_checkout + Snap START_CHECKOUT (once) ---------------- */
  const checkoutTracked = useRef(false);

  useEffect(() => {
    if (checkoutTracked.current || !items?.length) return;
    checkoutTracked.current = true;

    try {
      useGtmStore.getState().beginCheckout({
        items,
        total: Number(payable || 0),
        coupon: coupon?.code || "",
      });

      console.log("📈 GA4 begin_checkout fired", {
        value: Number(payable || 0),
        coupon: coupon?.code || null,
      });
    } catch (e) {
      console.warn("📈 GA4 begin_checkout failed", e);
    }

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

      console.log("👻 Snap START_CHECKOUT fired", {
        price: Number(payable || 0),
        item_ids: itemIds,
      });
    } catch (e) {
      console.warn("👻 Snap START_CHECKOUT failed", e);
    }

    try {
      trackCheckoutStarted({
        cartValue: Number(payable || 0),
        pageUrl: typeof window !== "undefined" ? window.location.href : "",
      });

      console.log("📣 Marketing campaign checkout_started fired");
    } catch (e) {
      console.warn("📣 Marketing campaign checkout_started failed", e);
    }
  }, [
    items?.length,
    payable,
    coupon?.code,
    items,
    trackCheckoutStarted,
  ]);

  /* ---------------- PINCODE LOOKUP ---------------- */
  const pinTimer = useRef(null);
  const lastPin = useRef("");
  // ✅ Prevent multiple parallel ensure calls
  const ensureLockRef = useRef(false);
  const ensuredCustomerRef = useRef(null);
  const placingOrderRef = useRef(false);

  const lastGuestEmailRef = useRef("");

  const getGuestPassword = (email = "") => {
    const normalizedEmail = String(email)
      .trim()
      .toLowerCase();

    return `Oatclub@${btoa(normalizedEmail).slice(0, 16)}`;
  };

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




  /* ---------------- FETCH ADDRESS FOR LOGGED IN ---------------- */
  useEffect(() => {
    const firebaseUID =
      user?.uid ||
      user?.firebaseUID ||
      activeCustomer?.firebaseUID ||
      "";

    const customerId =
      activeCustomer?._id ||
      activeCustomer?.id ||
      "";

    if (!firebaseUID && !customerId) return;

    fetchAddressesBoth?.({
      firebaseUID,
      customerId,
    });

    setAddressForm((current) => ({
      ...current,
      email:
        user?.email ||
        activeCustomer?.email ||
        current.email,
      fullName:
        current.fullName ||
        activeCustomer?.name ||
        user?.displayName ||
        "",
      phone:
        current.phone ||
        activeCustomer?.phone ||
        activeCustomer?.mobile ||
        "",
    }));
  }, [
    user?.uid,
    user?.firebaseUID,
    user?.email,
    user?.displayName,
    activeCustomer?._id,
    activeCustomer?.id,
    activeCustomer?.firebaseUID,
    activeCustomer?.email,
    activeCustomer?.name,
    activeCustomer?.phone,
    activeCustomer?.mobile,
    fetchAddressesBoth,
  ]);

  /* ---------------- EXISTING CUSTOMER FOUND (guest email flow) ---------------- */
  const onCustomerFound = async (cust) => {
    if (!cust) return;

    setGuestCustomer(cust);

    setAddressForm((current) => ({
      ...current,
      email: cust?.email || current.email,
      fullName: current.fullName || cust?.name || "",
      phone:
        current.phone ||
        cust?.phone ||
        cust?.mobile ||
        "",
    }));

    if (cust?.email) {
      await fetchAddressesByEmail?.(cust.email);
      return;
    }

    await fetchAddressesBoth?.({
      customerId: cust?._id,
      firebaseUID: cust?.firebaseUID,
    });
  };

  /* ---------------- ENSURE CUSTOMER FOR GUEST ---------------- */
  const ensureGuestCustomer = async () => {
    if (customer?._id) return customer;
    if (guestCustomer?._id) return guestCustomer;

    const name = addressForm.fullName?.trim();
    const email = addressForm.email?.trim().toLowerCase();
    const phone = addressForm.phone?.trim();

    if (!name || !email || !phone) {
      toast.error("Please fill name, email and phone.");
      return null;
    }

    try {
      setCreatingGuest(true);

      const result = await createGuestCustomer({
        name,
        email,
        phone,
        password: getGuestPassword(email),
        mode: "checkout",
      });

      const createdCustomer = result?.customer || result;

      if (!createdCustomer?._id) {
        throw new Error("Customer could not be created.");
      }

      setGuestCustomer(createdCustomer);
      return createdCustomer;
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Could not continue checkout.",
      );

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
        const password = "__firebase_login__";

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

  /* ---------------- DIRECT ORDER ADDRESS SNAPSHOT ---------------- */

  const buildCheckoutAddressSnapshot = (finalCustomer = {}) => {
    const source = usingSavedAddress
      ? selectedAddressObj
      : addressForm;

    return {
      fullName:
        source?.fullName ||
        source?.name ||
        finalCustomer?.name ||
        "",

      phone:
        source?.phone ||
        finalCustomer?.phone ||
        finalCustomer?.mobile ||
        "",

      email:
        source?.email ||
        addressForm?.email ||
        finalCustomer?.email ||
        user?.email ||
        "",

      addressLine1:
        source?.addressLine1 ||
        source?.line1 ||
        "",

      addressLine2:
        source?.addressLine2 ||
        source?.line2 ||
        "",

      city: source?.city || "",

      state: source?.state || "",

      postalCode:
        source?.postalCode ||
        source?.pincode ||
        "",

      country:
        source?.country ||
        "IN",
    };
  };




  /* ---------------- SAVE ADDRESS AFTER ORDER ---------------- */

  const saveAddressInBackground = (finalCustomer) => {
    if (!finalCustomer?._id) return;

    if (usingSavedAddress) return;

    const payload = {
      ...addressForm,

      firebaseUID:
        finalCustomer.firebaseUID ||
        user?.uid ||
        null,

      customerId: finalCustomer._id,

      email:
        user?.email ||
        addressForm.email ||
        finalCustomer.email ||
        "",
    };

    Promise.resolve(createAddress?.(payload))
      .then((created) => {
        const address = created?.address || created;

        if (address?._id) {
          setSelectedAddressId(address._id);
        }
      })
      .catch((error) => {
        console.warn(
          "Background address save failed:",
          error?.message || error,
        );
      });
  };

  const refreshCustomerByEmail = async () => {
    const email =
      addressForm.email ||
      customer?.email ||
      guestCustomer?.email ||
      user?.email ||
      "";

    if (!email) return null;

    try {
      const baseURL =
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        "http://localhost:6001";

      const res = await fetch(
        `${baseURL}/api/customers/search?email=${encodeURIComponent(email)}`
      );

      const data = await res.json();

      const found =
        data?.customer ||
        data?.items?.[0] ||
        data?.data?.customer ||
        data?.customers?.[0] ||
        data?.data?.[0] ||
        null;

      if (found?._id) {
        setGuestCustomer(found);
        fetchCustomerCreditSummary(found._id).catch(() => { });

        if (found?.email) {
          await fetchAddressesByEmail?.(found.email);
        } else {
          await fetchAddressesBoth?.({
            customerId: found._id,
            firebaseUID: found.firebaseUID,
          });
        }

        return found;
      }

      return null;
    } catch (e) {
      console.warn("Customer refresh by email failed", e);
      return null;
    }
  };

  useEffect(() => {
    const email = addressForm.email || user?.email || "";
    if (!email) return;

    refreshCustomerByEmail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressForm.email, user?.email]);



  /* ---------------- CHECKOUT VALIDATION ---------------- */
  const validateCheckout = (paymentMethod = selectedPayment) => {
    const checkoutItems = getCheckoutPayload?.() || [];

    if (!checkoutItems.length) {
      return "Your cart is empty.";
    }

    const email =
      addressForm.email ||
      activeCustomer?.email ||
      user?.email ||
      "";

    if (!String(email).trim()) {
      return "Please enter your email.";
    }

    if (usingSavedAddress) {
      const postalCode =
        selectedAddressObj?.postalCode ||
        selectedAddressObj?.pincode ||
        "";

      if (
        !selectedAddressObj?.fullName ||
        !selectedAddressObj?.phone ||
        !selectedAddressObj?.addressLine1 ||
        !selectedAddressObj?.city ||
        !selectedAddressObj?.state ||
        !/^\d{6}$/.test(String(postalCode))
      ) {
        return "Selected address is incomplete.";
      }
    } else {
      const phone = String(addressForm.phone || "").replace(/\D/g, "");

      if (!addressForm.fullName?.trim()) {
        return "Please enter your full name.";
      }

      if (phone.length !== 10) {
        return "Please enter a valid phone number.";
      }

      if (!addressForm.addressLine1?.trim()) {
        return "Please enter your delivery address.";
      }

      if (!addressForm.city?.trim()) {
        return "Please enter your city.";
      }

      if (!addressForm.state?.trim()) {
        return "Please enter your state.";
      }

      if (!/^\d{6}$/.test(String(addressForm.postalCode || ""))) {
        return "Please enter a valid PIN code.";
      }
    }

    if (
      !["cod", "razorpay", "wallet"].includes(
        String(paymentMethod || "").toLowerCase()
      )
    ) {
      return "Please select a valid payment method.";
    }

    return null;
  };

  /* ---------------- ORDER SUCCESS ---------------- */
  const finishSuccessfulOrder = async ({
    order,
    revenue,
    toastId,
    paymentMethod,
  }) => {
    try {
      await markConversion({
        orderId: order?._id || order?.id || order?.orderId,
        orderNumber: order?.orderNumber,
        revenue: Number(
          revenue ||
          order?.finalPayable ||
          order?.totalAmount ||
          0
        ),
      });

      console.log("📣 Marketing campaign conversion tracked", {
        orderId: order?._id || order?.id || order?.orderId,
        orderNumber: order?.orderNumber,
        revenue: Number(
          revenue ||
          order?.finalPayable ||
          order?.totalAmount ||
          0
        ),
        paymentMethod,
      });
    } catch (error) {
      console.warn("📣 Marketing campaign conversion failed", error);
    }

    if (buyNowItem) {
      completeCheckout?.();
    } else {
      clearCart?.();
    }

    removeCoupon?.();

    toast.success(
      paymentMethod === "razorpay"
        ? "Payment successful! Order confirmed."
        : "Order placed successfully!",
      toastId ? { id: toastId } : undefined
    );

    router.push(
      order?.orderNumber
        ? `/order-success?order=${encodeURIComponent(order.orderNumber)}`
        : "/order-success"
    );
  };

  /* ---------------- PLACE ORDER ---------------- */
  const handlePlaceOrder = async (paymentSelection = {}) => {
    if (placingOrderRef.current) {
      console.warn("Duplicate place-order click blocked");
      return;
    }

    placingOrderRef.current = true;

    const requestedPaymentMethod =
      paymentSelection?.paymentMethod || selectedPayment;

    const resolvedPaymentMethod =
      payable <= 0 ? "wallet" : requestedPaymentMethod;

    if (
      !["cod", "razorpay", "wallet"].includes(
        String(resolvedPaymentMethod || "").toLowerCase()
      )
    ) {
      placingOrderRef.current = false;
      toast.error("Please select a valid payment method.");
      setShowPayment(true);
      return;
    }

    const validationMessage = validateCheckout(resolvedPaymentMethod);
    if (validationMessage) {
      placingOrderRef.current = false;

      toast.error(validationMessage);
      setShowAddress(true);

      if (!usingSavedAddress) {
        setShowAddressForm(true);
      }

      return;
    }

    const finalCustomer = await ensureCustomer();

    if (!finalCustomer?._id) {
      placingOrderRef.current = false;
      return;
    }

    const checkoutAddress =
      buildCheckoutAddressSnapshot(finalCustomer);

    const toastId = toast.loading(
      resolvedPaymentMethod === "razorpay"
        ? "Creating secure payment..."
        : "Placing your order..."
    );

    try {
      const baseOrderItems = getCheckoutPayload();

      const orderItems = baseOrderItems.map((item) => {
        const richItem =
          items.find(
            (currentItem) =>
              String(currentItem?.productId || currentItem?.id) ===
              String(item?.productId || item?.id)
          ) ||
          couponCartItems.find(
            (currentItem) =>
              String(currentItem?.productId || currentItem?.id) ===
              String(item?.productId || item?.id)
          ) ||
          {};

        const price = Number(
          richItem?.price ??
          richItem?.productSnapshot?.price ??
          item?.price ??
          item?.productSnapshot?.price ??
          0
        );

        const collections =
          richItem.collections ||
          richItem.productSnapshot?.collections ||
          item.collections ||
          item.productSnapshot?.collections ||
          [];

        const isPrimaryProduct =
          richItem.isPrimaryProduct === true ||
          richItem.productSnapshot?.isPrimaryProduct === true ||
          item.isPrimaryProduct === true ||
          item.productSnapshot?.isPrimaryProduct === true;

        return {
          ...item,
          ...richItem,
          productId:
            item.productId ||
            richItem.productId ||
            richItem.id,
          quantity:
            item.quantity ||
            richItem.quantity ||
            1,
          variantId:
            item.variantId ||
            richItem.variantId ||
            richItem?.variant?._id,

          price,
          itemPrice: price,
          item_price: price,

          collections,
          isPrimaryProduct,

          productSnapshot: {
            ...(item.productSnapshot || {}),
            ...(richItem.productSnapshot || {}),
            price,
            collections,
            isPrimaryProduct,
          },
        };
      });

      const attribution =
        useMarketingCampaignStore
          .getState()
          .getAttributionPayload?.() || null;

      console.log("🧾 CHECKOUT ORDER DEBUG:", {
        subtotal,
        discount,
        razorpayExtraDiscount,
        payable,
        selectedPayment: resolvedPaymentMethod,
        coupon,
        cartItems: items,
        orderItems,
        attribution,
      });

      const order = await createOrder({
        customerId: finalCustomer._id,

        customer: {
          ...finalCustomer,
          shippingAddressSnapshot: checkoutAddress,
        },

        ...(usingSavedAddress
          ? {
            shippingAddressId: selectedAddressObj._id,
            billingAddressId: selectedAddressObj._id,
          }
          : {
            shippingAddressSnapshot: checkoutAddress,
            billingAddressSnapshot: checkoutAddress,
          }),

        paymentMethod: resolvedPaymentMethod,

        useWallet: appliedWalletAmount > 0,
        walletAmount: appliedWalletAmount,

        items: orderItems,
        source: "website",

        subtotal: Number(subtotal || 0),
        discount: Number(discount || 0),

        razorpayExtraDiscount: Number(
          resolvedPaymentMethod === "razorpay"
            ? razorpayExtraDiscount || 0
            : 0,
        ),

        payable: Number(payable || 0),

        coupon: coupon
          ? {
            code: coupon.code,
            discount: Number(discount || 0),
          }
          : null,

        attribution,
      });

      if (!usingSavedAddress) {
        saveAddressInBackground(finalCustomer);
      }

      const mongoOrderId =
        order?._id ||
        order?.id ||
        order?.orderId ||
        order?.data?._id ||
        order?.order?._id;

      if (!mongoOrderId) {
        throw new Error(
          "Order created but Mongo order ID was not returned."
        );
      }

      /*
       * Razorpay:
       * 1. Mongo order has already been created with paymentMethod=razorpay.
       * 2. Store creates Razorpay order using mongoOrderId.
       * 3. Cart is cleared only after payment verification succeeds.
       */
      if (resolvedPaymentMethod === "razorpay") {
        toast.loading("Opening Razorpay checkout...", {
          id: toastId,
        });

        await payWithRazorpay({
          mongoOrderId: String(mongoOrderId),

          onSuccess: async () => {
            try {
              await finishSuccessfulOrder({
                order,
                revenue: payable,
                toastId,
                paymentMethod: "razorpay",
              });
            } finally {
              placingOrderRef.current = false;
            }
          },

          onFailure: (paymentError) => {
            placingOrderRef.current = false;

            console.error(
              "❌ Razorpay payment failed:",
              paymentError
            );

            toast.error(
              paymentError?.message ||
              "Payment was not completed. Your cart is still safe.",
              { id: toastId }
            );
          },
        });

        return;
      }

      await finishSuccessfulOrder({
        order,
        revenue: payable,
        toastId,
        paymentMethod: resolvedPaymentMethod,
      });

      placingOrderRef.current = false;
    } catch (error) {
      placingOrderRef.current = false;

      console.error("❌ PLACE ORDER FAILED:", {
        message: error?.message,
        code: error?.code,
        status: error?.status,
        data: error?.data,
        error,
      });

      const message =
        error?.data?.message ||
        error?.response?.data?.message ||
        error?.message ||
        "We couldn't process your order at this time. Please try again.";

      toast.error(message, {
        id: toastId,
        duration: 5000,
      });
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <section className="min-h-screen w-full bg-[#f6f4ef] text-black">
      <div className="relative w-full px-3 py-3 sm:px-5 sm:py-6 lg:px-8">
        <div className="mx-auto mb-3 w-full max-w-3xl border border-neutral-200 bg-white p-3.5 shadow-[0_18px_50px_rgba(30,25,18,0.05)] sm:mb-4 sm:p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-black/38">
                OATCLUB Checkout
              </p>
              <h1 className="mt-1.5 text-xl font-black uppercase leading-none tracking-normal text-black sm:text-2xl">
                Finish The Fit
              </h1>
              <p className="mt-2 max-w-xl text-[10px] font-bold uppercase leading-4 tracking-[0.08em] text-black/45">
                Quick Details, Secure Payment, Fresh Pieces On The Way.
              </p>
            </div>

            <Chip>
              <Lock className="h-3.5 w-3.5" /> Protected
            </Chip>
          </div>

          <div className="mt-3 grid grid-cols-3 border-t border-neutral-200 pt-3">
            <HeaderPromise
              icon={<ShieldCheck className="h-3.5 w-3.5" />}
              title="Secure"
              text="Private Checkout Flow"
            />
            <HeaderPromise
              icon={<PackageCheck className="h-3.5 w-3.5" />}
              title="Packed With Care"
              text="Quality Checked Before Dispatch"
            />
            <HeaderPromise
              icon={<Lock className="h-3.5 w-3.5" />}
              title="Easy Support"
              text="Order Help When You Need It"
            />
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-3xl flex-col gap-2.5 sm:gap-3">
          {/* Step 1: Email + Address */}
          <AddressSelection
            user={user}
            customer={activeCustomer}
            addresses={addresses}
            addressesLoading={addressesLoading}
            selectedAddressId={selectedAddressId}
            setSelectedAddressId={setSelectedAddressId}
            showAddress={showAddress}
            setShowAddress={setShowAddress}
            showAddressForm={showAddressForm}
            setShowAddressForm={setShowAddressForm}
            addressForm={addressForm}
            updateAddressField={updateAddressField}
            pinLoading={pinLoading}
          />

          {/* Step 2: Summary */}
          <OrderSummary
            items={items}
            subtotal={subtotal}
            coupon={coupon}
            discount={discount}
            razorpayExtraDiscount={razorpayExtraDiscount}
            useWallet={useWallet}
            setUseWallet={setUseWallet}
            walletAmount={walletAmount}
            setWalletAmount={setWalletAmount}
            walletBalance={walletBalance}
            payable={payable} showSummary={showSummary}
            setShowSummary={setShowSummary}
            email={addressForm.email}
            phone={addressForm.phone}
            customerId={activeCustomer?._id || null} cartItems={couponCartItems}
          />



          {/* Step 3: Payment */}
          <PaymentOptions
            showPayment={showPayment}
            setShowPayment={setShowPayment}
            selectedPayment={selectedPayment}
            setSelectedPayment={setSelectedPayment}
            payable={payable}
            subtotal={subtotal}
            razorpayExtraDiscount={razorpayExtraDiscount}
            coupon={coupon}
            discount={discount}
            useWallet={useWallet}
            setUseWallet={setUseWallet}
            walletAmount={walletAmount}
            setWalletAmount={setWalletAmount}
            walletBalance={walletBalance}
            placing={placing}
            razorpayLoading={razorpayLoading}
            validate={validateCheckout}
            onPlaceOrder={handlePlaceOrder}
            selectedAddressObj={selectedAddressObj}
            user={user}
            customer={activeCustomer}
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
