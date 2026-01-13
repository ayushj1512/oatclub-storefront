"use client";
import { trackMeta } from "@/lib/meta/track";
import { create } from "zustand";
import Cookies from "js-cookie";
import { auth, googleProvider } from "@/lib/firebase";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import toast from "react-hot-toast";
import { useCartStore } from "@/store/cartStore";
import { useAddressStore } from "@/store/addressStore"
const COOKIE_KEY = "user_auth";
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;
// ✅ Returns true = skip event, false = fire event
const shouldSkipAuthMetaEvent  = (get, set, key, windowMs = 4000) => {
  const now = Date.now();
  const { _lastAuthEvent, _lastAuthEventAt } = get();

  if (_lastAuthEvent === key && now - _lastAuthEventAt < windowMs) {
    return true; // ✅ skip duplicate
  }

  set({ _lastAuthEvent: key, _lastAuthEventAt: now });
  return false; // ✅ allow tracking
};

const initialAuthState = {
  user: null,
  customer: null,
  token: null,
  loading: true,
  isAuthenticated: false,
  activeCartId: null,
  activeCartType: "cart",
  modalDismissed: false,
  _lastSyncedUid: null,
  showLogoutConfirm: false,
  _authUnsubscribe: null,
  _lastAuthEvent: null,
  _lastAuthEventAt: 0,
  _guestCreatePromise: null,
};


/* =====================================================================
   ⚡ UNIFIED AUTH STORE – + REALTIME PROFILE UPDATE
===================================================================== */
export const useAuthStore = create((set, get) => ({
  reset: () => set(initialAuthState),

  user: null, // Firebase user
  customer: null, // MongoDB customer
  token: null,
  loading: true,
  isAuthenticated: false,
activeCartId: null,
activeCartType: "cart", // cart | abandoned
  modalDismissed: false,
  _lastSyncedUid: null,

  setModalDismissed: () => set({ modalDismissed: true }),

  /* ---------------------------------------------
     SET CUSTOMER STATE
  --------------------------------------------- */
  setCustomerState: (customer) => {
  const activeCartId = customer?.cart?.activeCartId || null;
  const activeCartType = customer?.cart?.activeCartType || "cart";

  set({
    customer,
    activeCartId,
    activeCartType,
    isAuthenticated: true,
  });

  const { user, token } = get();

  // ✅ Persist cookie for BOTH logged-in + guest
  Cookies.set(
    COOKIE_KEY,
    JSON.stringify({
      user: user || null,
      customer,
      token: token || null,
      activeCartId,
      activeCartType,
      isGuest: !user,
    }),
    { expires: 7 }
  );
},




/* ---------------------------------------------
   🛒 SET ACTIVE CART (cart / abandoned)
--------------------------------------------- */
setActiveCart: (cartId, type = "cart") => {
  const customer = get().customer;
  if (!customer?._id) return;

  const updatedCustomer = {
    ...customer,
    cart: {
      ...customer.cart,
      activeCartId: cartId,
      activeCartType: type,
      lastCartActivityAt: new Date().toISOString(),
    },
  };

  set({
    customer: updatedCustomer,
    activeCartId: cartId,
    activeCartType: type,
  });

  const { user, token } = get();

  Cookies.set(
    COOKIE_KEY,
    JSON.stringify({
      user,
      customer: updatedCustomer,
      token,
      activeCartId: cartId,
      activeCartType: type,
    }),
    { expires: 7 }
  );
},



  /* ---------------------------------------------
     FETCH CUSTOMER BY FIREBASE UID
  --------------------------------------------- */
  fetchCustomerByUID: async (firebaseUID) => {
  try {
    const res = await fetch(`${BACKEND}/api/customers/by-firebase/${firebaseUID}`);
    const data = await res.json();

    if (!res.ok || !data?._id) {
      console.log("⚠️ No customer found for UID:", firebaseUID);
      return null;
    }

    get().setCustomerState(data);
    return data;
  } catch (err) {
    console.error("❌ fetchCustomerByUID error:", err);
    return null;
  }
},


  /* ---------------------------------------------
     SYNC FIREBASE USER → BACKEND (UPSERT)
  --------------------------------------------- */
 syncCustomer: async (firebaseUser, overrides = {}) => {
  try {
    if (!firebaseUser) {
      console.warn("⚠️ syncCustomer called without firebaseUser");
      return null;
    }

    const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!BACKEND) {
      console.error("❌ NEXT_PUBLIC_BACKEND_URL missing");
      return null;
    }

    // 🔐 Always refresh token
    const token = await firebaseUser.getIdToken(true);

    // ✅ Clean overrides properly
    const clean = (v) => String(v || "").trim();

    const overrideName = clean(overrides?.name);
    const overrideEmail = clean(overrides?.email).toLowerCase();
    const overridePhone = clean(overrides?.phone);
    const overrideImage = clean(overrides?.profileImage);

    const payload = {
      firebaseUID: firebaseUser.uid,

      // ✅ Override priority (but only if not empty)
      name: overrideName || clean(firebaseUser.displayName),
      email: overrideEmail || clean(firebaseUser.email).toLowerCase(),
      phone: overridePhone || clean(firebaseUser.phoneNumber),
      profileImage: overrideImage || clean(firebaseUser.photoURL),
    };

    console.log("📦 syncCustomer payload =>", payload);

    // ⚠️ warn if still blank
    if (!payload.name) console.warn("⚠️ syncCustomer: name is empty");
    if (!payload.phone) console.warn("⚠️ syncCustomer: phone is empty");

    const res = await fetch(`${BACKEND}/api/customers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("❌ Customer API error:", res.status, text);
      return null;
    }

    const data = await res.json();

    console.log("📩 syncCustomer response =>", data);

    if (!data?.customer?._id) {
      console.error("❌ Invalid customer response:", data);
      return null;
    }

    const customer = data.customer;

    // ✅ Warn if backend still returns blank name/phone
    if (!customer?.name) console.warn("⚠️ Backend returned blank name");
    if (!customer?.phone) console.warn("⚠️ Backend returned blank phone");

    return {
      customer,
      token,
      activeCartId: customer?.cart?.activeCartId || null,
      activeCartType: customer?.cart?.activeCartType || "cart",
    };
  } catch (error) {
    console.error("❌ syncCustomer exception:", error);
    return null;
  }
},






  /* ---------------------------------------------
     🔥 NEW: UPDATE CUSTOMER PROFILE (Realtime Sync)
  --------------------------------------------- */
 updateCustomerProfile: async (updates) => {
  const existingCustomer = get().customer;
  if (!existingCustomer?._id) {
    console.error("❌ No customer loaded");
    return null;
  }

  try {
    // 🔄 send updates to backend
    const res = await fetch(
      `${BACKEND}/api/customers/${existingCustomer._id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      }
    );

    const data = await res.json();

    if (!res.ok || !data?.customer) {
      console.error("❌ Update Customer Error:", data?.message);
      return null;
    }

    const updatedCustomer = data.customer;

    // 🧠 update Zustand store (keep cart state in sync)
    set({
      customer: updatedCustomer,
      activeCartId: updatedCustomer?.cart?.activeCartId || null,
      activeCartType: updatedCustomer?.cart?.activeCartType || "cart",
    });

    const { user, token } = get();

    // 🍪 update cookie safely
    Cookies.set(
      COOKIE_KEY,
      JSON.stringify({
        user,
        customer: updatedCustomer,
        token,
        activeCartId: updatedCustomer?.cart?.activeCartId || null,
        activeCartType: updatedCustomer?.cart?.activeCartType || "cart",
      }),
      { expires: 7 }
    );

    return updatedCustomer;
  } catch (err) {
    console.error("❌ updateCustomerProfile exception:", err);
    return null;
  }
},


  /* ---------------------------------------------
     FIREBASE SESSION LISTENER
  --------------------------------------------- */
initialize: () => {
  if (typeof window === "undefined") return;

  /* ======================================================
     ✅ 0) Prevent attaching multiple firebase listeners
  ====================================================== */
  if (get()._authUnsubscribe) {
    console.log("⚠️ Auth listener already attached, skipping...");
    return;
  }

  /* ======================================================
     ✅ 1) Restore session from cookie (Guest + Auth)
  ====================================================== */
  const cached = Cookies.get(COOKIE_KEY);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);

      if (parsed?.customer?._id) {
        set({
          user: parsed.user || null,
          customer: parsed.customer,
          token: parsed.token || null,
          activeCartId: parsed.activeCartId || null,
          activeCartType: parsed.activeCartType || "cart",
          isAuthenticated: true,
          loading: false,

          // ✅ avoid immediate re-sync
          _lastSyncedUid: parsed?.user?.uid || null,
        });

        console.log("✅ Restored auth session from cookie");
      }
    } catch (e) {
      console.warn("⚠️ Invalid auth cookie");
    }
  }

  /* ======================================================
     ✅ 2) Firebase Listener
  ====================================================== */
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    // ✅ If no firebaseUser
    if (!firebaseUser) {
      // ✅ If guest exists, DON'T wipe it
      const cookie = Cookies.get(COOKIE_KEY);
      if (cookie) {
        try {
          const parsed = JSON.parse(cookie);
          if (parsed?.isGuest && parsed?.customer?._id) {
            set({ loading: false });
            return;
          }
        } catch {}
      }

      // ✅ Normal logout cleanup
      set({
        user: null,
        customer: null,
        token: null,
        activeCartId: null,
        activeCartType: "cart",
        isAuthenticated: false,
        loading: false,
        _lastSyncedUid: null,
      });

      Cookies.remove(COOKIE_KEY);
      return;
    }

    /* ======================================================
       ✅ 3) Prevent duplicate syncCustomer calls
    ====================================================== */
    const uid = firebaseUser.uid;
    const lastUid = get()._lastSyncedUid;

    if (lastUid === uid && get().customer?._id) {
      console.log("✅ Skipping duplicate syncCustomer for UID:", uid);

      set({
        user: {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || "",
          email: firebaseUser.email || "",
          photoURL: firebaseUser.photoURL || "",
        },
        loading: false,
      });

      return;
    }

    // ✅ mark synced uid
    set({ _lastSyncedUid: uid });

    /* ======================================================
       ✅ 4) Normal auth flow
    ====================================================== */
    const userData = {
      uid: firebaseUser.uid,
      name: firebaseUser.displayName || "",
      email: firebaseUser.email || "",
      photoURL: firebaseUser.photoURL || "",
    };

    /* ======================================================
       ✅ 5) Guest Overrides (name + phone) from localStorage
    ====================================================== */
    let overrides = {};
    try {
      const pending = localStorage.getItem("pending_guest_profile");
      if (pending) {
        overrides = JSON.parse(pending);
        localStorage.removeItem("pending_guest_profile");
        console.log("✅ Using overrides from pending_guest_profile:", overrides);
      }
    } catch (e) {
      console.warn("⚠️ Failed to parse pending_guest_profile");
    }

    console.log("🔄 syncCustomer running for UID:", uid);

    const syncResult = await get().syncCustomer(firebaseUser, overrides);

    if (!syncResult) {
      set({
        user: userData,
        customer: null,
        token: null,
        activeCartId: null,
        activeCartType: "cart",
        isAuthenticated: false,
        loading: false,
      });
      return;
    }

    const { customer, token, activeCartId, activeCartType } = syncResult;

    set({
      user: userData,
      customer,
      token,
      activeCartId,
      activeCartType,
      isAuthenticated: true,
      loading: false,
    });

    Cookies.set(
      COOKIE_KEY,
      JSON.stringify({
        user: userData,
        customer,
        token,
        activeCartId,
        activeCartType,
        isGuest: false,
      }),
      { expires: 7 }
    );
  });

  // ✅ store unsubscribe so it won't attach again
  set({ _authUnsubscribe: unsubscribe });
},






  /* ---------------------------------------------
     GOOGLE LOGIN
/* ---------------------------------------------
   GOOGLE LOGIN
--------------------------------------------- */
/* ---------------------------------------------
   GOOGLE LOGIN
--------------------------------------------- */
loginWithGoogle: async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;

    if (!firebaseUser) {
      console.error("❌ Google login failed: no Firebase user");
      return null;
    }

    // 🔄 Sync customer with backend (CRASH-SAFE)
    const syncResult = await get().syncCustomer(firebaseUser);
    if (!syncResult) {
      console.error("❌ Customer sync failed (Google login)");
      return null;
    }

    const { customer, token } = syncResult;

    const userData = {
      uid: firebaseUser.uid,
      name: firebaseUser.displayName || "",
      email: firebaseUser.email || "",
      photoURL: firebaseUser.photoURL || "",
    };

    // ✅ Update Zustand store
    set({
      user: userData,
      customer,
      token,
      isAuthenticated: true,
      activeCartId: customer?.cart?.activeCartId || null,
      activeCartType: customer?.cart?.activeCartType || "cart",
    });

    // 🍪 Persist session
    Cookies.set(
      COOKIE_KEY,
      JSON.stringify({
        user: userData,
        customer,
        token,
        activeCartId: customer?.cart?.activeCartId || null,
        activeCartType: customer?.cart?.activeCartType || "cart",
      }),
      { expires: 7 }
    );

    /* ---------------------------------------------
       🧾 META (PIXEL + CAPI): Login (Google)
       ✅ Fire ONLY on successful login (with dedupe guard)
    --------------------------------------------- */
    try {
      const key = `login_google_${firebaseUser.uid}`;
      const shouldSkip = shouldSkipAuthMetaEvent(get, set, key, 4000);

      if (!shouldSkip) {
        await trackMeta(
          "Login",
          {
            content_name: "Google Login",
            status: "success",
          },
          {
            em: firebaseUser.email || undefined,
            ph: customer?.phone || firebaseUser.phoneNumber || undefined,
            external_id: firebaseUser.uid || undefined,
          }
        );
      }
    } catch (e) {
      console.warn("🧾 Meta Login (Google) failed", e);
    }

    return { user: userData, customer };
  } catch (err) {
    console.error("❌ loginWithGoogle exception:", err);
    return null;
  }
},



/* ---------------------------------------------
   EMAIL LOGIN
--------------------------------------------- */
/* ---------------------------------------------
   EMAIL LOGIN
--------------------------------------------- */
loginWithEmail: async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = result.user;

    if (!firebaseUser) {
      console.error("❌ Email login failed: no Firebase user");
      return null;
    }

    // 🔄 Sync customer with backend (CRASH-SAFE)
    const syncResult = await get().syncCustomer(firebaseUser);
    if (!syncResult) {
      console.error("❌ Customer sync failed (Email login)");
      return null;
    }

    const { customer, token } = syncResult;

    const userData = {
      uid: firebaseUser.uid,
      name: firebaseUser.displayName || email.split("@")[0],
      email: firebaseUser.email || email,
      photoURL: firebaseUser.photoURL || "/profile/user-avatar.jpg",
    };

    // ✅ Update Zustand store
    set({
      user: userData,
      customer,
      token,
      isAuthenticated: true,
      activeCartId: customer?.cart?.activeCartId || null,
      activeCartType: customer?.cart?.activeCartType || "cart",
    });

    // 🍪 Persist session
    Cookies.set(
      COOKIE_KEY,
      JSON.stringify({
        user: userData,
        customer,
        token,
        activeCartId: customer?.cart?.activeCartId || null,
        activeCartType: customer?.cart?.activeCartType || "cart",
      }),
      { expires: 7 }
    );

    /* ---------------------------------------------
       🧾 META (PIXEL + CAPI): Login (Email)
       ✅ Fire ONLY on successful login (with dedupe guard)
    --------------------------------------------- */
    try {
      const key = `login_email_${firebaseUser.uid}`;
      const shouldSkip = shouldSkipAuthMetaEvent(get, set, key, 4000);

      if (!shouldSkip) {
        await trackMeta(
          "Login",
          {
            content_name: "Email Login",
            status: "success",
          },
          {
            em: firebaseUser.email || email || undefined,
            ph: customer?.phone || firebaseUser.phoneNumber || undefined,
            external_id: firebaseUser.uid || undefined,
          }
        );
      }
    } catch (e) {
      console.warn("🧾 Meta Login (Email) failed", e);
    }

    return { user: userData, customer };
  } catch (err) {
    console.error("❌ loginWithEmail exception:", err);
    return null;
  }
},




/* ---------------------------------------------
   REGISTER WITH EMAIL
--------------------------------------------- */
registerWithEmail: async (email, password, name) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = result.user;

    if (!firebaseUser) {
      console.error("❌ Registration failed: no Firebase user");
      return null;
    }

    // 👤 Update Firebase profile
    await updateProfile(firebaseUser, {
      displayName: name,
      photoURL: "/profile/user-avatar.jpg",
    });

    // 🔄 Sync customer with backend (CRASH-SAFE)
    const syncResult = await get().syncCustomer(firebaseUser);
    if (!syncResult) {
      console.error("❌ Customer sync failed (Register)");
      return null;
    }

    const { customer, token } = syncResult;

    const userData = {
      uid: firebaseUser.uid,
      name,
      email: firebaseUser.email || email,
      photoURL: "/profile/user-avatar.jpg",
    };

    // ✅ Update Zustand store
    set({
      user: userData,
      customer,
      token,
      isAuthenticated: true,
      activeCartId: customer?.cart?.activeCartId || null,
      activeCartType: customer?.cart?.activeCartType || "cart",
    });

    // 🍪 Persist session
    Cookies.set(
      COOKIE_KEY,
      JSON.stringify({
        user: userData,
        customer,
        token,
        activeCartId: customer?.cart?.activeCartId || null,
        activeCartType: customer?.cart?.activeCartType || "cart",
      }),
      { expires: 7 }
    );

    /* ---------------------------------------------
       🧾 META (PIXEL + CAPI): CompleteRegistration
       ✅ Fire ONLY on successful registration (with dedupe guard)
    --------------------------------------------- */
    try {
      const key = `register_email_${firebaseUser.uid}`;
      const shouldSkip = shouldSkipAuthMetaEvent(get, set, key, 6000);

      if (!shouldSkip) {
        await trackMeta(
          "CompleteRegistration",
          {
            content_name: "Email Signup",
            status: "success",
          },
          {
            em: firebaseUser.email || email || undefined,
            ph: customer?.phone || firebaseUser.phoneNumber || undefined,
            external_id: firebaseUser.uid || undefined,
          }
        );
      }
    } catch (e) {
      console.warn("🧾 Meta CompleteRegistration failed", e);
    }

    return { user: userData, customer };
  } catch (err) {
    console.error("❌ registerWithEmail exception:", err);
    return null;
  }
},


// Guest checkout

// authStore.js (inside useAuthStore)
createGuestCustomer: async ({ name = "", email = "", phone = "", password = "" } = {}) => {
  // ✅ 1) If already in progress, return same promise (blocks 2nd call)
  console.log("🚨 createGuestCustomer CALLED", { email, at: Date.now() }, new Error("trace").stack);

  const inflight = get()._guestCreatePromise;
  if (inflight) return inflight;
console.log("🔥 Firebase SIGNUP attempt", { email });

  const run = (async () => {
    try {
      name = String(name || "").trim();
      email = String(email || "").trim().toLowerCase();
      phone = String(phone || "").trim();
      password = String(password || "").trim();

      if (!email || !password || password.length < 4) throw new Error("Email + Password required");
      if (!name || !phone) throw new Error("Name + Phone required");

      set({ loading: true });

      // ✅ 2) If firebase already logged-in with same email, DON'T signup again
      let firebaseUser = auth.currentUser;
      if (firebaseUser?.email?.toLowerCase() !== email) firebaseUser = null;

      // ✅ 3) Create/Login only if needed
      if (!firebaseUser) {
        try {
          const signupRes = await createUserWithEmailAndPassword(auth, email, password);
          firebaseUser = signupRes.user;
        } catch (err) {
          if (err?.code === "auth/email-already-in-use") {
            const loginRes = await signInWithEmailAndPassword(auth, email, password);
            firebaseUser = loginRes.user;
          } else {
            throw err;
          }
        }
      }

      if (!firebaseUser) throw new Error("Firebase user missing");

      // ✅ 4) Update profile
      try {
        await updateProfile(firebaseUser, {
          displayName: name,
          photoURL: firebaseUser.photoURL || "/profile/user-avatar.jpg",
        });
      } catch {}

      // ✅ 5) Sync backend NOW (so address save won't race)
      set({ _lastSyncedUid: firebaseUser.uid });

      const syncResult = await get().syncCustomer(firebaseUser, { name, phone, email });
      if (!syncResult) throw new Error("Customer sync failed");

      const { customer, token, activeCartId, activeCartType } = syncResult;

      const userData = {
        uid: firebaseUser.uid,
        name,
        email: firebaseUser.email || email,
        photoURL: firebaseUser.photoURL || "/profile/user-avatar.jpg",
      };

      set({
        user: userData,
        customer,
        token,
        activeCartId,
        activeCartType,
        isAuthenticated: true,
        loading: false,
      });

      Cookies.set(
        COOKIE_KEY,
        JSON.stringify({
          user: userData,
          customer,
          token,
          activeCartId,
          activeCartType,
          isGuest: false,
        }),
        { expires: 7 }
      );

      return { user: userData, customer };
    } finally {
      // ✅ release lock
      set({ _guestCreatePromise: null, loading: false });
    }
  })();

  // ✅ store promise lock
  set({ _guestCreatePromise: run });
  return run;
},













  /* ---------------------------------------------
     LOGOUT FLOW
  --------------------------------------------- */
  showLogoutConfirm: false,
  requestLogout: () => set({ showLogoutConfirm: true }),
  cancelLogout: () => set({ showLogoutConfirm: false }),

confirmLogout: async () => {
  try {
    // ✅ Firebase Signout
    await signOut(auth);
  } catch (e) {
    console.warn("⚠️ Firebase signOut failed:", e);
  }

  try {
    /* ----------------------------------------
       ✅ 1) Clear CART + BUY NOW Cookies (Safe)
    ----------------------------------------- */

    // ✅ remove exact cookie (if single key)
    Cookies.remove("cart_products");
    Cookies.remove("buy_now_item");

    // ✅ remove any cart_products_* (if user-specific keys exist)
    Object.keys(Cookies.get() || {}).forEach((k) => {
      if (k.startsWith("cart_products")) Cookies.remove(k);
      if (k.startsWith("buy_now_item")) Cookies.remove(k);
    });

    /* ----------------------------------------
       ✅ 2) Reset Zustand Stores
    ----------------------------------------- */

    // ✅ reset cart store properly (items + cookies + hydrated flag etc)
    try {
      const cart = useCartStore.getState();
      if (cart?.resetCartOnLogout) {
        await cart.resetCartOnLogout();
      } else {
        // fallback if resetCartOnLogout not implemented
        useCartStore.setState({ items: [], buyNowItem: null, hasHydrated: false });
      }
    } catch (e) {
      console.warn("⚠️ Cart reset on logout failed:", e);
    }

    // ✅ Abandoned cart store clear
    try {
      const abandoned = useAbandonedCartStore.getState();
      abandoned?.clear?.();
    } catch (e) {
      console.warn("⚠️ AbandonedCart clear failed:", e);
    }

    // ✅ Coupon store clear
    try {
      const coupon = useCouponStore.getState();
      if (coupon?.isApplied?.()) {
        await coupon.clearPersistedCoupon();
      } else {
        coupon?.clearPersistedCoupon?.();
      }
    } catch (e) {
      console.warn("⚠️ Coupon clear failed:", e);
    }

    // ✅ Address store clear (🔥 NEW)
    try {
      const addr = useAddressStore.getState();
      addr?.resetAddressOnLogout?.();

      // fallback if reset function not present
      if (!addr?.resetAddressOnLogout) {
        useAddressStore.setState({
          addresses: [],
          loading: false,
          error: null,
          pinLoading: false,
          pinCache: {},
          _pinReqId: 0,
          _lastEventKey: null,
          _lastEventAt: 0,
        });
      }
    } catch (e) {
      console.warn("⚠️ Address reset failed on logout:", e);
    }

    /* ----------------------------------------
       ✅ 3) Clear Storages (Optional but OK)
    ----------------------------------------- */

    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn("⚠️ Storage clear failed:", e);
    }

    /* ----------------------------------------
       ✅ 4) Reset AUTH Store
    ----------------------------------------- */
    set(initialAuthState);

    /* ----------------------------------------
       ✅ 5) Hard Redirect
    ----------------------------------------- */
    window.location.href = "/";
  } catch (e) {
    console.error("❌ Logout cleanup failed:", e);
  }
},



}));
