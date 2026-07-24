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

    Cookies.set(
      COOKIE_KEY,
      JSON.stringify({
        user: user || null,
        customer,
        token: token || null,
        authProvider: authProvider || null,
        activeCartId,
        activeCartType,
        isGuest: !user && !isAuthenticated,
      }),
      {
        expires: 7,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
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

    const { user, token, authProvider, isAuthenticated } = get();

    Cookies.set(
      COOKIE_KEY,
      JSON.stringify({
        user,
        customer: updatedCustomer,
        token,
        authProvider: authProvider || null,
        activeCartId: cartId,
        activeCartType: type,
        isGuest: !user && !isAuthenticated,
      }),
      {
        expires: 7,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
    );
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
          headers: { "Content-Type": "application/json" },
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

      // ✅ supports both response shapes
      const updatedCustomer = data?.customer || data?.data || data;

      if (!updatedCustomer?._id) {
        console.error("❌ Updated customer missing in response:", data);
        return null;
      }

      set({
        customer: updatedCustomer,
        activeCartId: updatedCustomer?.cart?.activeCartId || null,
        activeCartType: updatedCustomer?.cart?.activeCartType || "cart",
      });

      const { user, token } = get();

      Cookies.set(
        COOKIE_KEY,
        JSON.stringify({
          user,
          customer: updatedCustomer,
          token,
          activeCartId: updatedCustomer?.cart?.activeCartId || null,
          activeCartType: updatedCustomer?.cart?.activeCartType || "cart",
          isGuest: !user,
        }),
        { expires: 7 },
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
          const isBackendOtpSession =
            parsed?.authProvider === "email_otp" && Boolean(parsed?.token);

          const isFirebaseSession =
            parsed?.authProvider === "google" ||
            Boolean(
              parsed?.user?.uid &&
              !String(parsed.user.uid).startsWith("customer_"),
            );

          const isGuestSession = parsed?.isGuest === true;

          set({
            user:
              parsed.user ||
              (isGuestSession
                ? {
                    uid: `customer_${parsed.customer._id}`,
                    name:
                      parsed.customer?.name ||
                      parsed.customer?.email?.split("@")?.[0] ||
                      "OATCLUB Customer",

                    email: parsed.customer?.email || "",

                    photoURL:
                      parsed.customer?.profileImage ||
                      "/profile/user-avatar.jpg",

                    authProvider: "guest_checkout",
                  }
                : null),
            customer: parsed.customer,
            token: parsed.token || null,

            authProvider:
              parsed.authProvider ||
              (isFirebaseSession
                ? "google"
                : isBackendOtpSession
                  ? "email_otp"
                  : isGuestSession
                    ? "guest_checkout"
                    : null),

            activeCartId: parsed.activeCartId || null,

            activeCartType: parsed.activeCartType || "cart",

            isAuthenticated:
              isBackendOtpSession || isFirebaseSession || isGuestSession,
            loading: false,

            _lastSyncedUid: isFirebaseSession
              ? parsed?.user?.uid || null
              : null,
          });

          console.log(
            isBackendOtpSession
              ? "✅ Restored email OTP session"
              : isGuestSession
                ? "✅ Restored guest session"
                : "✅ Restored Firebase session",
          );
        }
      } catch (error) {
        console.warn("⚠️ Invalid auth cookie");
        Cookies.remove(COOKIE_KEY);
      }
    }

    /* ======================================================
     ✅ 2) Firebase Listener
  ====================================================== */
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // ✅ If no firebaseUser
      if (!firebaseUser) {
        const cookie = Cookies.get(COOKIE_KEY);

        if (cookie) {
          try {
            const parsed = JSON.parse(cookie);

            const isBackendOtpSession =
              parsed?.authProvider === "email_otp" &&
              Boolean(parsed?.token) &&
              Boolean(parsed?.customer?._id);

            const isGuestSession =
              parsed?.isGuest === true && Boolean(parsed?.customer?._id);

            if (isBackendOtpSession || isGuestSession) {
              const restoredUser =
                parsed.user ||
                (isGuestSession
                  ? {
                      uid: `customer_${parsed.customer._id}`,
                      name:
                        parsed.customer?.name ||
                        parsed.customer?.email?.split("@")?.[0] ||
                        "OATCLUB Customer",

                      email: parsed.customer?.email || "",

                      photoURL:
                        parsed.customer?.profileImage ||
                        "/profile/user-avatar.jpg",

                      authProvider: "guest_checkout",
                    }
                  : null);

              set({
                user: restoredUser,
                customer: parsed.customer,
                token: parsed.token || null,

                authProvider: isBackendOtpSession
                  ? "email_otp"
                  : "guest_checkout",

                activeCartId: parsed.activeCartId || null,

                activeCartType: parsed.activeCartType || "cart",

                isAuthenticated: true,

                loading: false,
                _lastSyncedUid: null,
              });

              return;
            }
          } catch {
            Cookies.remove(COOKIE_KEY);
          }
        }

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
        authProvider: "google",
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
          console.log(
            "✅ Using overrides from pending_guest_profile:",
            overrides,
          );
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
        authProvider: "google",
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
          authProvider: "google",
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
    });

    // ✅ store unsubscribe so it won't attach again
    set({ _authUnsubscribe: unsubscribe });
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
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      if (!firebaseUser) {
        throw new Error("Google login failed");
      }

      const syncResult = await get().syncCustomer(firebaseUser);

      if (!syncResult) {
        throw new Error("Customer sync failed");
      }

      const { customer, token } = syncResult;

      const userData = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || customer?.name || "",
        email: firebaseUser.email || customer?.email || "",
        photoURL:
          firebaseUser.photoURL ||
          customer?.profileImage ||
          "/profile/user-avatar.jpg",
        authProvider: "google",
      };

      const activeCartId = customer?.cart?.activeCartId || null;

      const activeCartType = customer?.cart?.activeCartType || "cart";

      set({
        user: userData,
        customer,
        token,
        authProvider: "google",
        isAuthenticated: true,
        activeCartId,
        activeCartType,
        loading: false,
        _lastSyncedUid: firebaseUser.uid,
      });

      Cookies.set(
        COOKIE_KEY,
        JSON.stringify({
          user: userData,
          customer,
          token,
          authProvider: "google",
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
            buildMetaCustomerData({
              customer,
              firebaseUser,
            }),
          );
        }
      } catch (error) {
        console.warn("🧾 Meta Login (Google) failed", error);
      }

      return {
        user: userData,
        customer,
        token,
      };
    } catch (error) {
      console.error("❌ loginWithGoogle exception:", error);

      throw error;
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
        { expires: 7 },
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
          activeCartId: customer?.cart?.activeCartId || null,
          activeCartType: customer?.cart?.activeCartType || "cart",
        }),
        { expires: 7 },
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
    const inflight = get()._guestCreatePromise;

    if (inflight) return inflight;

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
         * Guest checkout:
         * Do not create Firebase account.
         * Directly create/upsert Mongo customer.
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

          const data = await response.json();

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

          set({
            user: guestUser,
            customer,
            token: null,
            authProvider: "guest_checkout",

            activeCartId: customer?.cart?.activeCartId || null,

            activeCartType: customer?.cart?.activeCartType || "cart",

            isAuthenticated: true,
            loading: false,
          });

          Cookies.set(
            COOKIE_KEY,
            JSON.stringify({
              user: guestUser,
              customer,
              token: null,

              authProvider: "guest_checkout",

              activeCartId: customer?.cart?.activeCartId || null,

              activeCartType: customer?.cart?.activeCartType || "cart",

              isGuest: true,
            }),
            {
              expires: 7,
              sameSite: "lax",
              secure: process.env.NODE_ENV === "production",
            },
          );

          return {
            user: guestUser,
            customer,
            token: null,
          };
        }

        /*
         * Logged-in Firebase fallback
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

          get().setCustomerState(syncResult.customer);

          return syncResult;
        }

        /*
         * Actual email-password registration only
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
      // ✅ Accept payload shapes:
      // 1) { bank: { accountHolderName, accountNumber, ifscCode } }
      // 2) { upi: { upiId } }
      // 3) { payoutDetails: { bank: {...}, upi: {...} } }  (if UI sends this)
      const bankIn = payload?.bank || payload?.payoutDetails?.bank || {};
      const upiIn = payload?.upi || payload?.payoutDetails?.upi || {};

      const accountHolderName = bankIn?.accountHolderName
        ? String(bankIn.accountHolderName).trim()
        : "";
      const accountNumber = bankIn?.accountNumber
        ? String(bankIn.accountNumber).trim()
        : "";
      const ifscCode = bankIn?.ifscCode
        ? String(bankIn.ifscCode).trim().toUpperCase()
        : "";

      const upiId = upiIn?.upiId
        ? String(upiIn.upiId).trim().toLowerCase()
        : "";

      const hasAnyBank = !!(accountHolderName || accountNumber || ifscCode);
      const hasUpi = !!upiId;

      // ✅ must provide at least one method
      if (!hasAnyBank && !hasUpi) {
        toast.error("Provide either UPI ID or Bank details");
        return null;
      }

      // ✅ if using bank method → enforce required fields (matches backend)
      if (hasAnyBank && (!accountHolderName || !accountNumber || !ifscCode)) {
        toast.error("Bank details need Name, Account No. & IFSC");
        return null;
      }

      // ✅ build request body in backend-expected format
      const body = {};
      if (hasAnyBank)
        body.bank = { accountHolderName, accountNumber, ifscCode };
      if (hasUpi) body.upi = { upiId };

      const res = await fetch(
        `${BACKEND}/api/customers/${existingCustomer._id}/payout-details`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );

      // parse safely
      const raw = await res.text();
      let data = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {
        data = null;
      }

      if (!res.ok) {
        const msg = data?.message || `Payout update failed (${res.status})`;
        console.error("❌ updateCustomerPayoutDetails error:", msg, data);
        toast.error(msg);
        return null;
      }

      // backend returns { payoutDetails, customer } in your controller
      const updatedCustomer = data?.customer || null;
      if (!updatedCustomer?._id) {
        console.error("❌ payout update: customer missing in response", data);
        toast.error("Payout updated, but customer not returned");
        return null;
      }

      // ✅ update Zustand store
      set({
        customer: updatedCustomer,
        activeCartId: updatedCustomer?.cart?.activeCartId || null,
        activeCartType: updatedCustomer?.cart?.activeCartType || "cart",
      });

      // ✅ update cookie
      const { user, token } = get();
      Cookies.set(
        COOKIE_KEY,
        JSON.stringify({
          user,
          customer: updatedCustomer,
          token,
          activeCartId: updatedCustomer?.cart?.activeCartId || null,
          activeCartType: updatedCustomer?.cart?.activeCartType || "cart",
          isGuest: !user,
        }),
        { expires: 7 },
      );

      toast.success("Payout details saved");
      return updatedCustomer?.payoutDetails || updatedCustomer;
    } catch (err) {
      console.error("❌ updateCustomerPayoutDetails exception:", err);
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
      // Stop guest/Firebase session restore immediately
      Cookies.remove(COOKIE_KEY);

      set({
        ...initialAuthState,
        loading: false,
        showLogoutConfirm: false,
      });

      try {
        await signOut(auth);
      } catch (error) {
        console.warn("Firebase signOut failed:", error);
      }

      // Clear cart cookies
      Cookies.remove("cart_products");
      Cookies.remove("buy_now_item");

      Object.keys(Cookies.get() || {}).forEach((key) => {
        if (key.startsWith("cart_products") || key.startsWith("buy_now_item")) {
          Cookies.remove(key);
        }
      });

      // Reset cart
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

      // Reset addresses
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
        localStorage.clear();
        sessionStorage.clear();
      } catch (error) {
        console.warn("Storage cleanup failed:", error);
      }

      Cookies.remove(COOKIE_KEY);

      set({
        ...initialAuthState,
        loading: false,
        showLogoutConfirm: false,
      });

      window.location.replace("/");
    } catch (error) {
      console.error("Logout cleanup failed:", error);

      Cookies.remove(COOKIE_KEY);

      set({
        ...initialAuthState,
        loading: false,
        showLogoutConfirm: false,
      });

      window.location.replace("/");
    }
  },
}));
