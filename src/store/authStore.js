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

/* =====================================================================
   ⚡ UNIFIED AUTH STORE – + REALTIME PROFILE UPDATE
===================================================================== */
export const useAuthStore = create((set, get) => ({
  user: null, // Firebase user
  customer: null, // MongoDB customer
  token: null,
  loading: true,
  isAuthenticated: false,
activeCartId: null,
activeCartType: "cart", // cart | abandoned
  modalDismissed: false,
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
  syncCustomer: async (firebaseUser) => {
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

    // 🔐 Always refresh token to avoid 401s
    const token = await firebaseUser.getIdToken(true);

    const payload = {
      firebaseUID: firebaseUser.uid,
      name: firebaseUser.displayName || "",
      email: firebaseUser.email || "",
      phone: firebaseUser.phoneNumber || "",
      profileImage: firebaseUser.photoURL || "",
    };

    const res = await fetch(`${BACKEND}/api/customers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    // ❌ Backend / auth failure
    if (!res.ok) {
      const text = await res.text();
      console.error("❌ Customer API error:", res.status, text);
      return null;
    }

    const data = await res.json();

    // ❌ Invalid shape protection
    if (!data || !data.customer || !data.customer._id) {
      console.error("❌ Invalid customer response:", data);
      return null;
    }

    const customer = data.customer;

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

  // ✅ Restore session from cookie (Guest + Auth)
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
        });
      }
    } catch (e) {
      console.warn("⚠️ Invalid auth cookie");
    }
  }

  // ✅ Continue Firebase listener
  onAuthStateChanged(auth, async (firebaseUser) => {
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

      // Normal logout cleanup
      set({
        user: null,
        customer: null,
        token: null,
        activeCartId: null,
        activeCartType: "cart",
        isAuthenticated: false,
        loading: false,
      });

      Cookies.remove(COOKIE_KEY);
      return;
    }

    // ✅ Normal auth flow stays same
    const userData = {
      uid: firebaseUser.uid,
      name: firebaseUser.displayName || "",
      email: firebaseUser.email || "",
      photoURL: firebaseUser.photoURL || "",
    };

    const syncResult = await get().syncCustomer(firebaseUser);

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

createGuestCustomer: async ({ name = "", email = "", phone = "", password = "" } = {}) => {
  try {
    email = String(email || "").trim().toLowerCase();
    password = String(password || "").trim();
    phone = String(phone || "").trim();

    if (!email || !password || password.length < 4) {
      toast.error("Email + Password required");
      return null;
    }

    set({ loading: true });

    let firebaseUser = null;

    // ✅ STEP 1: Firebase create OR login
    try {
      const signupRes = await createUserWithEmailAndPassword(auth, email, password);
      firebaseUser = signupRes.user;
    } catch (err) {
      // ✅ Already exists → login
      if (err?.code === "auth/email-already-in-use") {
        const loginRes = await signInWithEmailAndPassword(auth, email, password);
        firebaseUser = loginRes.user;
      } else {
        console.error("❌ Firebase signup/login failed:", err);
        toast.error(err?.message || "Firebase error");
        set({ loading: false });
        return null;
      }
    }

    if (!firebaseUser) {
      toast.error("Firebase user missing");
      set({ loading: false });
      return null;
    }

    // ✅ STEP 2: Sync backend customer
    const syncResult = await get().syncCustomer(firebaseUser);

    if (!syncResult?.customer?._id) {
      toast.error("Customer sync failed (backend)");
      set({ loading: false });
      return null;
    }

    const { customer, token, activeCartId, activeCartType } = syncResult;

    const userData = {
      uid: firebaseUser.uid,
      name: firebaseUser.displayName || name || email.split("@")[0],
      email: firebaseUser.email || email,
      photoURL: firebaseUser.photoURL || "/profile/user-avatar.jpg",
    };

    // ✅ update store
    set({
      user: userData,
      customer,
      token,
      activeCartId,
      activeCartType,
      isAuthenticated: true,
      loading: false,
    });

    // ✅ persist cookie
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

    toast.success("Account created ✅");
    return customer;
  } catch (err) {
    console.error("❌ createGuestCustomer exception:", err);
    toast.error("Guest creation failed");
    set({ loading: false });
    return null;
  }
},








  /* ---------------------------------------------
     LOGOUT FLOW
  --------------------------------------------- */
  showLogoutConfirm: false,
  requestLogout: () => set({ showLogoutConfirm: true }),
  cancelLogout: () => set({ showLogoutConfirm: false }),

 confirmLogout: async () => {
  await signOut(auth);

  set({
    user: null,
    customer: null,
    token: null,
    activeCartId: null,
    activeCartType: "cart",
    isAuthenticated: false, 
    showLogoutConfirm: false,
  });

  Cookies.remove(COOKIE_KEY);
},
}));
