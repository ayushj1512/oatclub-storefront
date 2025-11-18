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

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  loading: true,
  isAuthenticated: false,

  // -----------------------------------
  // 🔄 INITIALIZE — Load Firebase Session
  // -----------------------------------
  initialize: () => {
    if (typeof window === "undefined") return;

    onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
        });
        Cookies.remove(COOKIE_KEY);
        return;
      }

      const token = await firebaseUser.getIdToken();

      const userData = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || "",
        email: firebaseUser.email || "",
        photoURL: firebaseUser.photoURL || "/profile/user-avatar.jpg",
        phone: firebaseUser.phoneNumber || "",
      };

      set({
        user: userData,
        token,
        isAuthenticated: true,
        loading: false,
      });

      Cookies.set(
        COOKIE_KEY,
        JSON.stringify({ user: userData, token }),
        { expires: 7 }
      );
    });
  },

  // -----------------------------
  // 🔐 GOOGLE LOGIN
  // -----------------------------
  loginWithGoogle: async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    const token = await user.getIdToken();

    const userData = {
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
    };

    set({ user: userData, token, isAuthenticated: true });

    Cookies.set(
      COOKIE_KEY,
      JSON.stringify({ user: userData, token }),
      { expires: 7 }
    );

    return userData;
  },

  // -----------------------------
  // 📧 EMAIL LOGIN
  // -----------------------------
  loginWithEmail: async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;

    const token = await user.getIdToken();

    const userData = {
      uid: user.uid,
      name: user.displayName || email.split("@")[0],
      email: user.email,
      photoURL: user.photoURL || "/profile/user-avatar.jpg",
    };

    set({ user: userData, token, isAuthenticated: true });

    Cookies.set(
      COOKIE_KEY,
      JSON.stringify({ user: userData, token }),
      { expires: 7 }
    );

    return userData;
  },

  // -----------------------------
  // 🆕 REGISTER WITH EMAIL
  // -----------------------------
  registerWithEmail: async (email, password, name) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;

    await updateProfile(user, {
      displayName: name,
      photoURL: "/profile/user-avatar.jpg",
    });

    const token = await user.getIdToken();

    const userData = {
      uid: user.uid,
      name,
      email: user.email,
      photoURL: "/profile/user-avatar.jpg",
    };

    set({ user: userData, token, isAuthenticated: true });

    Cookies.set(
      COOKIE_KEY,
      JSON.stringify({ user: userData, token }),
      { expires: 7 }
    );

    return userData;
  },

  // -----------------------------
  // 🚪 LOGOUT
  // -----------------------------
  logout: async () => {
    await signOut(auth);
    set({ user: null, token: null, isAuthenticated: false });
    Cookies.remove(COOKIE_KEY);
  },
}));
