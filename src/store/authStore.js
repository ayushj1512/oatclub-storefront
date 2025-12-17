"use client";

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

const COOKIE_KEY = "user_auth";
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

/* =====================================================================
   ⚡ UNIFIED AUTH STORE – + REALTIME PROFILE UPDATE
===================================================================== */
export const useAuthStore = create((set, get) => ({
  user: null, // Firebase user
  customer: null, // MongoDB customer
  token: null,
  loading: true,
  isAuthenticated: false,

  modalDismissed: false,
  setModalDismissed: () => set({ modalDismissed: true }),

  /* ---------------------------------------------
     SET CUSTOMER STATE
  --------------------------------------------- */
  setCustomerState: (customer) => {
    set({ customer, isAuthenticated: true });

    const { user, token } = get();
    if (user && token) {
      Cookies.set(
        COOKIE_KEY,
        JSON.stringify({ user, customer, token }),
        { expires: 7 }
      );
    }
  },

  /* ---------------------------------------------
     FETCH CUSTOMER BY FIREBASE UID
  --------------------------------------------- */
  fetchCustomerByUID: async (firebaseUID) => {
    try {
      const res = await fetch(`${BACKEND}/api/customers?search=${firebaseUID}`);
      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        console.log("⚠️ No customer found for UID:", firebaseUID);
        return null;
      }

      const customer = data[0];
      get().setCustomerState(customer);
      return customer;
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
    if (!firebaseUser) return null;

    const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!BACKEND) {
      console.error("❌ NEXT_PUBLIC_BACKEND_URL missing");
      return null;
    }

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

    if (!res.ok) {
      const text = await res.text();
      console.error("❌ Customer API error:", text);
      return null;
    }

    const data = await res.json();

    if (!data?.customer) {
      console.error("❌ Invalid customer response:", data);
      return null;
    }

    return {
      customer: data.customer,
      token,
    };
  } catch (error) {
    console.error("❌ syncCustomer error:", error);
    return null;
  }
},


  /* ---------------------------------------------
     🔥 NEW: UPDATE CUSTOMER PROFILE (Realtime Sync)
  --------------------------------------------- */
  updateCustomerProfile: async (updates) => {
    const customer = get().customer;
    if (!customer?._id) {
      console.error("❌ No customer loaded");
      return null;
    }

    // send updates to backend
    const res = await fetch(`${BACKEND}/api/customers/${customer._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("❌ Update Customer Error:", data.message);
      return null;
    }

    // update Zustand store
    set({ customer: data.customer });

    const { user, token } = get();

    // update cookie
    Cookies.set(
      COOKIE_KEY,
      JSON.stringify({
        user,
        customer: data.customer,
        token,
      }),
      { expires: 7 }
    );

    return data.customer;
  },

  /* ---------------------------------------------
     FIREBASE SESSION LISTENER
  --------------------------------------------- */
  initialize: () => {
    if (typeof window === "undefined") return;

    onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        set({
          user: null,
          customer: null,
          token: null,
          isAuthenticated: false,
          loading: false,
        });
        Cookies.remove(COOKIE_KEY);
        return;
      }

      const { customer, token } = await get().syncCustomer(firebaseUser);

      const userData = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName,
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL,
      };

      set({ user: userData, customer, token, isAuthenticated: true, loading: false });

      Cookies.set(
        COOKIE_KEY,
        JSON.stringify({ user: userData, customer, token }),
        { expires: 7 }
      );
    });
  },

  /* ---------------------------------------------
     GOOGLE LOGIN
  --------------------------------------------- */
  loginWithGoogle: async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;

    const { customer, token } = await get().syncCustomer(firebaseUser);

    const userData = {
      uid: firebaseUser.uid,
      name: firebaseUser.displayName,
      email: firebaseUser.email,
      photoURL: firebaseUser.photoURL,
    };

    set({ user: userData, customer, token, isAuthenticated: true });

    Cookies.set(
      COOKIE_KEY,
      JSON.stringify({ user: userData, customer, token }),
      { expires: 7 }
    );

    return { user: userData, customer };
  },

  /* ---------------------------------------------
     EMAIL LOGIN
  --------------------------------------------- */
  loginWithEmail: async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = result.user;

    const { customer, token } = await get().syncCustomer(firebaseUser);

    const userData = {
      uid: firebaseUser.uid,
      name: firebaseUser.displayName || email.split("@")[0],
      email: firebaseUser.email,
      photoURL: firebaseUser.photoURL || "/profile/user-avatar.jpg",
    };

    set({ user: userData, customer, token, isAuthenticated: true });

    Cookies.set(
      COOKIE_KEY,
      JSON.stringify({ user: userData, customer, token }),
      { expires: 7 }
    );

    return { user: userData, customer };
  },

  /* ---------------------------------------------
     REGISTER WITH EMAIL
  --------------------------------------------- */
  registerWithEmail: async (email, password, name) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = result.user;

    await updateProfile(firebaseUser, {
      displayName: name,
      photoURL: "/profile/user-avatar.jpg",
    });

    const { customer, token } = await get().syncCustomer(firebaseUser);

    const userData = {
      uid: firebaseUser.uid,
      name,
      email: firebaseUser.email,
      photoURL: "/profile/user-avatar.jpg",
    };

    set({ user: userData, customer, token, isAuthenticated: true });

    Cookies.set(
      COOKIE_KEY,
      JSON.stringify({ user: userData, customer, token }),
      { expires: 7 }
    );

    return { user: userData, customer };
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
      isAuthenticated: false,
      showLogoutConfirm: false,
    });

    Cookies.remove(COOKIE_KEY);
  },
}));
