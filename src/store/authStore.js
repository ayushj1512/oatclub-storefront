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
import { useAddressStore } from "@/store/addressStore";
const COOKIE_KEY = "user_auth";
const AUTH_STORAGE_KEY = "oatclub_auth_session";

const saveAuthSession = (session = {}) => {
  if (typeof window === "undefined") return;

  try {
    const safeSession = {
      user: session?.user || null,
      customer: session?.customer || null,
      token: session?.token || null,
      authProvider: session?.authProvider || null,
      purpose: session?.purpose || null,
      activeCartId: session?.activeCartId || null,
      activeCartType: session?.activeCartType || "cart",
      isGuest: session?.isGuest === true,
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(safeSession));

    /*
     * Cookie should remain very small.
     * Full customer object must not go into cookie.
     */
    Cookies.set(
      COOKIE_KEY,
      JSON.stringify({
        customerId: safeSession?.customer?._id || null,
        authProvider: safeSession.authProvider,
        hasToken: Boolean(safeSession.token),
        isGuest: safeSession.isGuest,
      }),
      {
        expires: 7,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
    );

    console.log("✅ Auth session saved:", safeSession.authProvider);
  } catch (error) {
    console.error("❌ Failed to save auth session:", error);
  }
};

const getAuthSession = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);

    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored);

    if (!parsed?.customer?._id) {
      return null;
    }

    return parsed;
  } catch (error) {
    console.warn("⚠️ Invalid stored auth session:", error);

    localStorage.removeItem(AUTH_STORAGE_KEY);
    Cookies.remove(COOKIE_KEY);

    return null;
  }
};

const clearAuthSession = () => {
  if (typeof window === "undefined") return;

  localStorage.removeItem(AUTH_STORAGE_KEY);
  Cookies.remove(COOKIE_KEY);
};

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;
const buildCustomerId = (firebaseUser) => {
  const uid = String(firebaseUser?.uid || "").trim();
  return uid ? `firebase_${uid}` : "";
};
const cleanMetaValue = (value) => {
  const result = String(value ?? "").trim();
  return result || undefined;
};

const splitName = (name = "") => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);

  return {
    fn: parts[0] || undefined,
    ln: parts.slice(1).join(" ") || undefined,
  };
};

const normalizeGender = (gender) => {
  const value = String(gender || "")
    .trim()
    .toLowerCase();

  if (["male", "m"].includes(value)) return "m";
  if (["female", "f"].includes(value)) return "f";

  return undefined;
};

const normalizeDob = (value) => {
  if (!value) return undefined;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}${month}${day}`;
};

const buildMetaCustomerData = ({
  customer,
  firebaseUser,
  fallbackEmail,
  fallbackName,
} = {}) => {
  const name =
    customer?.name || firebaseUser?.displayName || fallbackName || "";

  const { fn, ln } = splitName(name);

  return {
    em: cleanMetaValue(customer?.email || firebaseUser?.email || fallbackEmail),

    ph: cleanMetaValue(customer?.phone || firebaseUser?.phoneNumber),

    fn,
    ln,

    ge: normalizeGender(customer?.gender),
    db: normalizeDob(customer?.dateOfBirth),

    ct: cleanMetaValue(customer?.city),
    st: cleanMetaValue(customer?.state),

    zp: cleanMetaValue(
      customer?.postcode || customer?.pincode || customer?.zip,
    ),

    country: cleanMetaValue(customer?.countryCode || customer?.country || "IN"),

    external_id: cleanMetaValue(
      customer?._id || customer?.customerId || firebaseUser?.uid,
    ),
  };
};

// ✅ Returns true = skip event, false = fire event
const shouldSkipAuthMetaEvent = (get, set, key, windowMs = 4000) => {
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
  authProvider: null,

  loading: true,
  isAuthenticated: false,

  activeCartId: null,
  activeCartType: "cart",

  modalDismissed: false,
  showLogoutConfirm: false,

  _lastSyncedUid: null,
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
  authProvider: null,

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

    const { user, token, authProvider, isAuthenticated } = get();

    set({
      customer,
      activeCartId,
      activeCartType,
      isAuthenticated: isAuthenticated || Boolean(token),
    });

    saveAuthSession({
      user: user || null,
      customer,
      token: token || null,
      authProvider: authProvider || null,
      activeCartId,
      activeCartType,
      isGuest: authProvider === "guest_checkout",
    });
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

    const { user, token, authProvider, isAuthenticated } = get();

    saveAuthSession({
      user,
      customer: updatedCustomer,
      token,
      authProvider: authProvider || null,
      activeCartId: cartId,
      activeCartType: type,
      isGuest: authProvider === "guest_checkout",
    });
  },

  /* ---------------------------------------------
     FETCH CUSTOMER BY FIREBASE UID
  --------------------------------------------- */
  fetchCustomerByUID: async (firebaseUID) => {
    try {
      const res = await fetch(
        `${BACKEND}/api/customers/by-firebase/${firebaseUID}`,
      );
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

      if (!BACKEND) {
        console.error("❌ NEXT_PUBLIC_BACKEND_URL missing");
        return null;
      }

      const customerId = buildCustomerId(firebaseUser);
      if (!customerId) {
        console.error("❌ Firebase UID missing for customer sync");
        return null;
      }

      // 🔐 Always refresh token
      const token = await firebaseUser.getIdToken(true);

      const clean = (v) => String(v ?? "").trim();

      const overrideName = clean(overrides?.name);
      const overrideEmail = clean(overrides?.email).toLowerCase();
      const overridePhone = clean(overrides?.phone);
      const overrideImage = clean(overrides?.profileImage);

      // ✅ Build payload but avoid sending empty strings
      const payload = {
        customerId,
        firebaseUID: firebaseUser.uid,
        firebaseUid: firebaseUser.uid,
        uid: firebaseUser.uid,
        ...(overrideName || clean(firebaseUser.displayName)
          ? { name: overrideName || clean(firebaseUser.displayName) }
          : {}),
        ...(overrideEmail || clean(firebaseUser.email)
          ? {
              email: (overrideEmail || clean(firebaseUser.email)).toLowerCase(),
            }
          : {}),
        ...(overridePhone || clean(firebaseUser.phoneNumber)
          ? { phone: overridePhone || clean(firebaseUser.phoneNumber) }
          : {}),
        ...(overrideImage || clean(firebaseUser.photoURL)
          ? { profileImage: overrideImage || clean(firebaseUser.photoURL) }
          : {}),
      };

      console.log("📦 syncCustomer payload =>", payload);

      const res = await fetch(`${BACKEND}/api/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      // ✅ Always read as text first (most important change)
      const rawText = await res.text();

      if (!res.ok) {
        console.error("❌ Customer API error:", res.status, rawText);
        return null;
      }

      // ✅ Parse JSON safely
      let data;
      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch (e) {
        console.error("❌ Backend did not return JSON:", rawText);
        return null;
      }

      console.log("📩 syncCustomer response =>", data);

      if (!data?.customer?._id) {
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

    if (!BACKEND) {
      console.error("❌ NEXT_PUBLIC_BACKEND_URL missing");
      return null;
    }

    try {
      const cleanBody = {
        name: String(updates?.name || "").trim(),
        phone: String(updates?.phone || "").trim(),
        gender: updates?.gender || "unknown",
        country: String(updates?.country || "India").trim(),
        state: String(updates?.state || "").trim(),
        city: String(updates?.city || "").trim(),
        dateOfBirth: updates?.dateOfBirth || null,
      };

      const res = await fetch(
        `${BACKEND}/api/customers/${existingCustomer._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(cleanBody),
        },
      );

      const raw = await res.text();

      let data = null;

      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {
        console.error("❌ Backend returned non-json:", raw);
        return null;
      }

      if (!res.ok) {
        console.error("❌ Update Customer Error:", data);
        return null;
      }

      const updatedCustomer = data?.customer || data?.data || data;

      if (!updatedCustomer?._id) {
        console.error("❌ Updated customer missing:", data);
        return null;
      }

      const activeCartId = updatedCustomer?.cart?.activeCartId || null;

      const activeCartType = updatedCustomer?.cart?.activeCartType || "cart";

      set({
        customer: updatedCustomer,
        activeCartId,
        activeCartType,
      });

      const { user, token, authProvider } = get();

      saveAuthSession({
        user,
        customer: updatedCustomer,
        token,
        authProvider,
        activeCartId,
        activeCartType,
        isGuest: authProvider === "guest_checkout",
      });

      return updatedCustomer;
    } catch (error) {
      console.error("❌ updateCustomerProfile exception:", error);

      return null;
    }
  },

  /* ---------------------------------------------
     FIREBASE SESSION LISTENER
  --------------------------------------------- */
  initialize: () => {
    if (typeof window === "undefined") return;

    if (get()._authUnsubscribe) {
      console.log("⚠️ Auth listener already attached");
      return;
    }

    /*
     * Restore localStorage session immediately.
     * This supports:
     * - Email OTP
     * - Google
     * - Guest checkout
     */
    const storedSession = getAuthSession();

    if (storedSession?.customer?._id) {
      const isEmailOtpSession =
        storedSession.authProvider === "email_otp" &&
        Boolean(storedSession.token);

      const isGoogleSession = storedSession.authProvider === "google";

      const isGuestSession =
        storedSession.authProvider === "guest_checkout" ||
        storedSession.isGuest === true;

      if (isEmailOtpSession || isGoogleSession || isGuestSession) {
        set({
          user: storedSession.user || null,

          customer: storedSession.customer,

          token: storedSession.token || null,

          authProvider: storedSession.authProvider || null,

          activeCartId:
            storedSession.activeCartId ||
            storedSession.customer?.cart?.activeCartId ||
            null,

          activeCartType:
            storedSession.activeCartType ||
            storedSession.customer?.cart?.activeCartType ||
            "cart",

          isAuthenticated: true,
          loading: false,

          _lastSyncedUid: isGoogleSession
            ? storedSession.user?.uid || null
            : null,
        });

        console.log("✅ Restored auth session:", storedSession.authProvider);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      /*
       * Firebase may return null for email OTP
       * because OTP login is backend-based.
       */
      if (!firebaseUser) {
        const savedSession = getAuthSession();

        const isEmailOtpSession =
          savedSession?.authProvider === "email_otp" &&
          Boolean(savedSession?.token) &&
          Boolean(savedSession?.customer?._id);

        const isGuestSession =
          (savedSession?.authProvider === "guest_checkout" ||
            savedSession?.isGuest === true) &&
          Boolean(savedSession?.customer?._id);

        if (isEmailOtpSession || isGuestSession) {
          set({
            user: savedSession.user || {
              uid: `customer_${savedSession.customer._id}`,
              name:
                savedSession.customer?.name ||
                savedSession.customer?.email?.split("@")?.[0] ||
                "OATCLUB Customer",
              email: savedSession.customer?.email || "",
              photoURL:
                savedSession.customer?.profileImage ||
                "/profile/user-avatar.jpg",
              authProvider: savedSession.authProvider,
            },

            customer: savedSession.customer,

            token: savedSession.token || null,

            authProvider: savedSession.authProvider,

            activeCartId:
              savedSession.activeCartId ||
              savedSession.customer?.cart?.activeCartId ||
              null,

            activeCartType:
              savedSession.activeCartType ||
              savedSession.customer?.cart?.activeCartType ||
              "cart",

            isAuthenticated: true,
            loading: false,
            _lastSyncedUid: null,
          });

          return;
        }

        /*
         * No Firebase user and no backend OTP
         * or guest session.
         */
        clearAuthSession();

        set({
          user: null,
          customer: null,
          token: null,
          authProvider: null,
          activeCartId: null,
          activeCartType: "cart",
          isAuthenticated: false,
          loading: false,
          _lastSyncedUid: null,
        });

        return;
      }

      const uid = firebaseUser.uid;
      const lastUid = get()._lastSyncedUid;

      /*
       * If Google session is already restored
       * from localStorage, avoid duplicate API sync.
       */
      if (lastUid === uid && get().customer?._id && get().token) {
        set({
          user: {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || get().customer?.name || "",
            email: firebaseUser.email || get().customer?.email || "",
            photoURL:
              firebaseUser.photoURL ||
              get().customer?.profileImage ||
              "/profile/user-avatar.jpg",
            authProvider: "google",
          },
          authProvider: "google",
          isAuthenticated: true,
          loading: false,
        });

        return;
      }

      set({
        _lastSyncedUid: uid,
        loading: true,
      });

      const userData = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || "",
        email: firebaseUser.email || "",
        photoURL: firebaseUser.photoURL || "/profile/user-avatar.jpg",
        authProvider: "google",
      };

      let overrides = {};

      try {
        const pending = localStorage.getItem("pending_guest_profile");

        if (pending) {
          overrides = JSON.parse(pending);

          localStorage.removeItem("pending_guest_profile");
        }
      } catch (error) {
        console.warn("⚠️ Invalid pending guest profile", error);
      }

      const syncResult = await get().syncCustomer(firebaseUser, overrides);

      if (!syncResult?.customer?._id || !syncResult?.token) {
        console.error("❌ Google customer sync failed");

        clearAuthSession();

        set({
          user: null,
          customer: null,
          token: null,
          authProvider: null,
          activeCartId: null,
          activeCartType: "cart",
          isAuthenticated: false,
          loading: false,
          _lastSyncedUid: null,
        });

        try {
          await signOut(auth);
        } catch (error) {
          console.warn("⚠️ Firebase cleanup failed:", error);
        }

        return;
      }

      const { customer, token, activeCartId, activeCartType } = syncResult;

      const finalUserData = {
        ...userData,
        name: firebaseUser.displayName || customer?.name || "",
        email: firebaseUser.email || customer?.email || "",
        photoURL:
          firebaseUser.photoURL ||
          customer?.profileImage ||
          "/profile/user-avatar.jpg",
      };

      set({
        user: finalUserData,
        customer,
        token,
        authProvider: "google",
        activeCartId,
        activeCartType,
        isAuthenticated: true,
        loading: false,
        _lastSyncedUid: firebaseUser.uid,
      });

      saveAuthSession({
        user: finalUserData,
        customer,
        token,
        authProvider: "google",
        activeCartId,
        activeCartType,
        isGuest: false,
      });

      try {
        const eventKey = `login_google_${firebaseUser.uid}`;

        const shouldSkip = shouldSkipAuthMetaEvent(get, set, eventKey, 4000);

        if (!shouldSkip) {
          await trackMeta(
            "Login",
            {
              content_name: "Google Login",
              status: "success",
            },
            buildMetaCustomerData({
              customer,
              firebaseUser,
            }),
          );
        }
      } catch (error) {
        console.warn("🧾 Google login tracking failed", error);
      }
    });

    set({
      _authUnsubscribe: unsubscribe,
    });
  },

  /* ---------------------------------------------
   BACKEND EMAIL OTP LOGIN
--------------------------------------------- */
  loginWithBackendOtp: ({ token, customer, purpose = "login" }) => {
    if (!token) {
      throw new Error("Authentication token is missing");
    }

    if (!customer?._id) {
      throw new Error("Customer data is missing");
    }

    const userData = {
      uid: `customer_${customer._id}`,
      name:
        customer?.name || customer?.email?.split("@")?.[0] || "OATCLUB Member",
      email: customer?.email || "",
      photoURL: customer?.profileImage || "/profile/user-avatar.jpg",
      authProvider: "email_otp",
    };

    const activeCartId = customer?.cart?.activeCartId || null;

    const activeCartType = customer?.cart?.activeCartType || "cart";

    set({
      user: userData,
      customer,
      token,
      authProvider: "email_otp",

      activeCartId,
      activeCartType,

      isAuthenticated: true,
      loading: false,

      // OTP login is not a Firebase session
      _lastSyncedUid: null,
    });

    saveAuthSession({
      user: userData,
      customer,
      token,
      authProvider: "email_otp",
      purpose,
      activeCartId,
      activeCartType,
      isGuest: false,
    });
    try {
      const eventName = purpose === "signup" ? "CompleteRegistration" : "Login";

      const eventKey =
        purpose === "signup"
          ? `register_otp_${customer._id}`
          : `login_otp_${customer._id}`;

      const shouldSkip = shouldSkipAuthMetaEvent(get, set, eventKey, 5000);

      if (!shouldSkip) {
        trackMeta(
          eventName,
          {
            content_name:
              purpose === "signup" ? "Email OTP Signup" : "Email OTP Login",
            status: "success",
          },
          buildMetaCustomerData({
            customer,
            fallbackEmail: customer.email,
            fallbackName: customer.name,
          }),
        ).catch((error) => {
          console.warn("🧾 Meta OTP auth tracking failed", error);
        });
      }
    } catch (error) {
      console.warn("🧾 OTP auth tracking failed", error);
    }

    return {
      user: userData,
      customer,
      token,
    };
  },
  /* ---------------------------------------------
   GOOGLE LOGIN
--------------------------------------------- */

  loginWithGoogle: async () => {
    try {
      set({ loading: true });

      const result = await signInWithPopup(auth, googleProvider);

      const firebaseUser = result?.user;

      if (!firebaseUser?.uid) {
        throw new Error("Google sign-in failed");
      }

      /*
       * Customer sync yahan mat karo.
       *
       * Firebase onAuthStateChanged listener automatically:
       * - backend customer sync karega
       * - token store karega
       * - cookie create karega
       * - isAuthenticated true karega
       */
      return {
        firebaseUser,
        pending: true,
      };
    } catch (error) {
      console.error("❌ loginWithGoogle exception:", {
        code: error?.code,
        message: error?.message,
      });

      set({ loading: false });

      if (error?.code === "auth/popup-closed-by-user") {
        throw new Error("Google sign-in cancelled");
      }

      if (error?.code === "auth/popup-blocked") {
        throw new Error("Please allow popups and try again");
      }

      if (error?.code === "auth/cancelled-popup-request") {
        throw new Error("Google sign-in is already in progress");
      }

      if (error?.code === "auth/unauthorized-domain") {
        throw new Error("This website domain is not authorized in Firebase");
      }

      if (error?.code === "auth/network-request-failed") {
        throw new Error("Network error. Please check your internet connection");
      }

      throw new Error(error?.message || "Unable to continue with Google");
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
          authProvider: "email_otp",
          purpose,
          activeCartId,
          activeCartType,
          isGuest: false,
        }),
        {
          expires: 7,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        },
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
              em: customer?.email || firebaseUser.email || undefined,
              ph: customer?.phone || firebaseUser.phoneNumber || undefined,

              fn:
                customer?.firstName ||
                customer?.name?.trim()?.split(/\s+/)?.[0] ||
                firebaseUser.displayName?.trim()?.split(/\s+/)?.[0] ||
                undefined,

              ln:
                customer?.lastName ||
                customer?.name?.trim()?.split(/\s+/)?.slice(1).join(" ") ||
                firebaseUser.displayName
                  ?.trim()
                  ?.split(/\s+/)
                  ?.slice(1)
                  .join(" ") ||
                undefined,

              ct: customer?.city || undefined,
              st: customer?.state || undefined,

              zp:
                customer?.postcode ||
                customer?.pincode ||
                customer?.zip ||
                undefined,

              country: customer?.countryCode || customer?.country || "IN",

              ge:
                customer?.gender === "female"
                  ? "f"
                  : customer?.gender === "male"
                    ? "m"
                    : undefined,

              db: customer?.dateOfBirth
                ? String(customer.dateOfBirth).slice(0, 10).replaceAll("-", "")
                : undefined,

              external_id:
                customer?._id ||
                customer?.customerId ||
                firebaseUser.uid ||
                undefined,
            },
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
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
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
          authProvider: "email_otp",
          purpose,
          activeCartId,
          activeCartType,
          isGuest: false,
        }),
        {
          expires: 7,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        },
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
              em: customer?.email || firebaseUser.email || undefined,
              ph: customer?.phone || firebaseUser.phoneNumber || undefined,

              fn:
                customer?.firstName ||
                customer?.name?.trim()?.split(/\s+/)?.[0] ||
                firebaseUser.displayName?.trim()?.split(/\s+/)?.[0] ||
                undefined,

              ln:
                customer?.lastName ||
                customer?.name?.trim()?.split(/\s+/)?.slice(1).join(" ") ||
                firebaseUser.displayName
                  ?.trim()
                  ?.split(/\s+/)
                  ?.slice(1)
                  .join(" ") ||
                undefined,

              ct: customer?.city || undefined,
              st: customer?.state || undefined,

              zp:
                customer?.postcode ||
                customer?.pincode ||
                customer?.zip ||
                undefined,

              country: customer?.countryCode || customer?.country || "IN",

              ge:
                customer?.gender === "female"
                  ? "f"
                  : customer?.gender === "male"
                    ? "m"
                    : undefined,

              db: customer?.dateOfBirth
                ? String(customer.dateOfBirth).slice(0, 10).replaceAll("-", "")
                : undefined,

              external_id:
                customer?._id ||
                customer?.customerId ||
                firebaseUser.uid ||
                undefined,
            },
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
  createGuestCustomer: async ({
    name = "",
    email = "",
    phone = "",
    password = "",
    mode = "checkout",
    firebaseUID = null,
  } = {}) => {
    const existingPromise = get()._guestCreatePromise;

    if (existingPromise) {
      return existingPromise;
    }

    const run = (async () => {
      try {
        const cleanName = String(name).trim();

        const cleanEmail = String(email).trim().toLowerCase();

        const cleanPhone = String(phone).replace(/\D/g, "").slice(-10);

        if (!cleanName) {
          throw new Error("Name is required");
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
          throw new Error("Valid email is required");
        }

        if (!/^\d{10}$/.test(cleanPhone)) {
          throw new Error("Valid phone number is required");
        }

        set({ loading: true });

        /*
         * Guest checkout customer.
         */
        if (mode === "checkout") {
          const response = await fetch(`${BACKEND}/api/customers/guest`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: cleanName,
              email: cleanEmail,
              phone: cleanPhone,
              mode: "checkout",
            }),
          });

          const raw = await response.text();

          let data = null;

          try {
            data = raw ? JSON.parse(raw) : null;
          } catch {
            data = null;
          }

          if (!response.ok) {
            throw new Error(data?.message || "Could not create customer");
          }

          const customer = data?.customer || data?.data || data;

          if (!customer?._id) {
            throw new Error("Invalid customer response");
          }

          const guestUser = {
            uid: `customer_${customer._id}`,
            name:
              customer?.name ||
              customer?.email?.split("@")?.[0] ||
              "OATCLUB Customer",
            email: customer?.email || cleanEmail,
            photoURL: customer?.profileImage || "/profile/user-avatar.jpg",
            authProvider: "guest_checkout",
          };

          const activeCartId = customer?.cart?.activeCartId || null;

          const activeCartType = customer?.cart?.activeCartType || "cart";

          set({
            user: guestUser,
            customer,
            token: null,
            authProvider: "guest_checkout",
            activeCartId,
            activeCartType,
            isAuthenticated: true,
            loading: false,
          });

          saveAuthSession({
            user: guestUser,
            customer,
            token: null,
            authProvider: "guest_checkout",
            activeCartId,
            activeCartType,
            isGuest: true,
          });

          return {
            user: guestUser,
            customer,
            token: null,
          };
        }

        /*
         * Already logged-in Firebase user.
         */
        if (firebaseUID) {
          const firebaseUser = auth.currentUser;

          if (!firebaseUser) {
            throw new Error("Firebase session missing");
          }

          const syncResult = await get().syncCustomer(firebaseUser, {
            name: cleanName,
            email: cleanEmail,
            phone: cleanPhone,
          });

          if (!syncResult?.customer?._id) {
            throw new Error("Customer sync failed");
          }

          const customer = syncResult.customer;

          const currentState = get();

          saveAuthSession({
            user: currentState.user,
            customer,
            token: syncResult.token || currentState.token,
            authProvider: currentState.authProvider || "google",
            activeCartId: customer?.cart?.activeCartId || null,
            activeCartType: customer?.cart?.activeCartType || "cart",
            isGuest: false,
          });

          get().setCustomerState(customer);

          return syncResult;
        }

        /*
         * Email-password Firebase registration.
         */
        const cleanPassword = String(password).trim();

        if (cleanPassword.length < 6) {
          throw new Error("Password must be at least 6 characters");
        }

        const signupResult = await createUserWithEmailAndPassword(
          auth,
          cleanEmail,
          cleanPassword,
        );

        const firebaseUser = signupResult.user;

        await updateProfile(firebaseUser, {
          displayName: cleanName,
        });

        const syncResult = await get().syncCustomer(firebaseUser, {
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
        });

        if (!syncResult?.customer?._id) {
          throw new Error("Customer sync failed");
        }

        return syncResult;
      } finally {
        set({
          _guestCreatePromise: null,
          loading: false,
        });
      }
    })();

    set({
      _guestCreatePromise: run,
    });

    return run;
  },

  /* ---------------------------------------------
   ✅ NEW: UPDATE PAYOUT / BANKING DETAILS
   PATCH /api/customers/:id/payout-details
--------------------------------------------- */
  updateCustomerPayoutDetails: async (payload = {}) => {
    const existingCustomer = get().customer;

    if (!existingCustomer?._id) {
      console.error("❌ No customer loaded");
      return null;
    }

    if (!BACKEND) {
      console.error("❌ NEXT_PUBLIC_BACKEND_URL missing");
      return null;
    }

    try {
      const bankInput = payload?.bank || payload?.payoutDetails?.bank || {};

      const upiInput = payload?.upi || payload?.payoutDetails?.upi || {};

      const accountHolderName = String(
        bankInput?.accountHolderName || "",
      ).trim();

      const accountNumber = String(bankInput?.accountNumber || "").trim();

      const ifscCode = String(bankInput?.ifscCode || "")
        .trim()
        .toUpperCase();

      const upiId = String(upiInput?.upiId || "")
        .trim()
        .toLowerCase();

      const hasAnyBankDetail = Boolean(
        accountHolderName || accountNumber || ifscCode,
      );

      const hasUpi = Boolean(upiId);

      if (!hasAnyBankDetail && !hasUpi) {
        toast.error("Provide either UPI ID or Bank details");
        return null;
      }

      if (
        hasAnyBankDetail &&
        (!accountHolderName || !accountNumber || !ifscCode)
      ) {
        toast.error("Bank details need Name, Account No. & IFSC");
        return null;
      }

      const body = {};

      if (hasAnyBankDetail) {
        body.bank = {
          accountHolderName,
          accountNumber,
          ifscCode,
        };
      }

      if (hasUpi) {
        body.upi = {
          upiId,
        };
      }

      const response = await fetch(
        `${BACKEND}/api/customers/${existingCustomer._id}/payout-details`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        },
      );

      const raw = await response.text();

      let data = null;

      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {
        data = null;
      }

      if (!response.ok) {
        const message =
          data?.message || `Payout update failed (${response.status})`;

        console.error("❌ Payout update error:", message);

        toast.error(message);
        return null;
      }

      const updatedCustomer = data?.customer || data?.data?.customer || null;

      if (!updatedCustomer?._id) {
        toast.error("Customer was not returned");
        return null;
      }

      const activeCartId = updatedCustomer?.cart?.activeCartId || null;

      const activeCartType = updatedCustomer?.cart?.activeCartType || "cart";

      set({
        customer: updatedCustomer,
        activeCartId,
        activeCartType,
      });

      const { user, token, authProvider } = get();

      saveAuthSession({
        user,
        customer: updatedCustomer,
        token,
        authProvider,
        activeCartId,
        activeCartType,
        isGuest: authProvider === "guest_checkout",
      });

      toast.success("Payout details saved");

      return updatedCustomer?.payoutDetails || updatedCustomer;
    } catch (error) {
      console.error("❌ Payout update exception:", error);

      toast.error("Server error while saving payout details");

      return null;
    }
  },

  hasPayoutDetails: () => {
    const c = get().customer;

    const bank =
      c?.payoutDetails?.bank || c?.bankDetails?.bank || c?.bankDetails; // supports both schemas
    const upi = c?.payoutDetails?.upi || c?.bankDetails?.upi;

    const hasBank = !!(
      bank?.accountHolderName &&
      bank?.accountNumber &&
      bank?.ifscCode
    );

    const hasUpi = !!upi?.upiId;

    return hasBank || hasUpi;
  },

  /* ---------------------------------------------
     LOGOUT FLOW
  --------------------------------------------- */
  showLogoutConfirm: false,
  requestLogout: () => set({ showLogoutConfirm: true }),
  cancelLogout: () => set({ showLogoutConfirm: false }),

  confirmLogout: async () => {
    try {
      clearAuthSession();

      set({
        ...initialAuthState,
        loading: false,
        showLogoutConfirm: false,
        _authUnsubscribe: get()._authUnsubscribe,
      });

      try {
        await signOut(auth);
      } catch (error) {
        console.warn("Firebase signOut failed:", error);
      }

      Cookies.remove("cart_products");

      Cookies.remove("buy_now_item");

      Object.keys(Cookies.get() || {}).forEach((key) => {
        if (key.startsWith("cart_products") || key.startsWith("buy_now_item")) {
          Cookies.remove(key);
        }
      });

      try {
        const cart = useCartStore.getState();

        if (cart?.resetCartOnLogout) {
          await cart.resetCartOnLogout();
        } else {
          useCartStore.setState({
            items: [],
            buyNowItem: null,
            hasHydrated: false,
          });
        }
      } catch (error) {
        console.warn("Cart reset failed:", error);
      }

      try {
        const addressStore = useAddressStore.getState();

        if (addressStore?.resetAddressOnLogout) {
          addressStore.resetAddressOnLogout();
        } else {
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
      } catch (error) {
        console.warn("Address reset failed:", error);
      }

      try {
        localStorage.removeItem(AUTH_STORAGE_KEY);

        localStorage.removeItem("pending_guest_profile");

        sessionStorage.clear();
      } catch (error) {
        console.warn("Storage cleanup failed:", error);
      }

      clearAuthSession();

      set({
        ...initialAuthState,
        loading: false,
        showLogoutConfirm: false,
      });

      window.location.replace("/");
    } catch (error) {
      console.error("Logout cleanup failed:", error);

      clearAuthSession();

      set({
        ...initialAuthState,
        loading: false,
        showLogoutConfirm: false,
      });

      window.location.replace("/");
    }
  },
}));
