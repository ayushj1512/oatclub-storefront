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

export const useAuthStore = create((set, get) => ({
  user: null,
  customer: null,
  token: null,
  loading: true,
  isAuthenticated: false,

  /* -------------------------------------------------------------------
     🌙 MODAL STATE (Fix for your modal not closing)
  ------------------------------------------------------------------- */
  modalDismissed: false,

  setModalDismissed: () => {
    set({ modalDismissed: true });
  },

  /* -------------------------------------------------------------------
     🔁 Sync Firebase User → Backend MongoDB Customer
  ------------------------------------------------------------------- */
  syncCustomer: async (firebaseUser) => {
    if (!firebaseUser) return null;

    const token = await firebaseUser.getIdToken();

    const payload = {
      firebaseUID: firebaseUser.uid,
      name: firebaseUser.displayName || "",
      email: firebaseUser.email || "",
      phone: firebaseUser.phoneNumber || "",
      profileImage: firebaseUser.photoURL || "",
    };

    const res = await fetch(`${BACKEND}/api/customers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return { customer: data.customer, token };
  },

  /* -------------------------------------------------------------------
     🔄 Firebase Auth Session Listener
  ------------------------------------------------------------------- */
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

      set({
        user: userData,
        customer,
        token,
        isAuthenticated: true,
        loading: false,
      });

      Cookies.set(
        COOKIE_KEY,
        JSON.stringify({ user: userData, customer, token }),
        { expires: 7 }
      );
    });
  },

  /* -------------------------------------------------------------------
     🔐 Google Login
  ------------------------------------------------------------------- */
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

  /* -------------------------------------------------------------------
     📧 Email Login
  ------------------------------------------------------------------- */
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

  /* -------------------------------------------------------------------
     🆕 Register via Email
  ------------------------------------------------------------------- */
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

  /* -------------------------------------------------------------------
     🚪 Logout with Confirmation Modal
  ------------------------------------------------------------------- */
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
