import { create } from "zustand";
import { devtools } from "zustand/middleware";
import axios from "axios";

/* ================================
   CONFIG
================================ */
const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const API_URL = `${API_BASE}/api/influencer-program`;

/* ================================
   HELPERS
================================ */
const emptyPlatform = () => ({
  url: "",
  followers: 0,
  avgViews: 0,
  engagementRate: 0,
});

export const getDefaultInfluencerForm = () => ({
  fullName: "",
  email: "",
  mobile: "",
  city: "",
  state: "",
  collaborationType: "barter",
  status: "new",
  source: "",
  niche: "",
  notes: "",
  socials: {
    instagram: emptyPlatform(),
    facebook: emptyPlatform(),
    snapchat: emptyPlatform(),
    youtube: emptyPlatform(),
    other: emptyPlatform(),
  },
});

const cleanNum = (v, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

const cleanStr = (v) => String(v ?? "").trim();

const normalizePayload = (f = {}) => ({
  fullName: cleanStr(f.fullName),
  email: cleanStr(f.email).toLowerCase(),
  mobile: cleanStr(f.mobile),
  city: cleanStr(f.city),
  state: cleanStr(f.state),
  collaborationType: cleanStr(f.collaborationType || "barter"),
  status: cleanStr(f.status || "new"),
  source: cleanStr(f.source),
  niche: cleanStr(f.niche),
  notes: cleanStr(f.notes),
  socials: {
    instagram: {
      url: cleanStr(f.socials?.instagram?.url),
      followers: cleanNum(f.socials?.instagram?.followers),
      avgViews: cleanNum(f.socials?.instagram?.avgViews),
      engagementRate: cleanNum(f.socials?.instagram?.engagementRate),
    },
    facebook: {
      url: cleanStr(f.socials?.facebook?.url),
      followers: cleanNum(f.socials?.facebook?.followers),
      avgViews: cleanNum(f.socials?.facebook?.avgViews),
      engagementRate: cleanNum(f.socials?.facebook?.engagementRate),
    },
    snapchat: {
      url: cleanStr(f.socials?.snapchat?.url),
      followers: cleanNum(f.socials?.snapchat?.followers),
      avgViews: cleanNum(f.socials?.snapchat?.avgViews),
      engagementRate: cleanNum(f.socials?.snapchat?.engagementRate),
    },
    youtube: {
      url: cleanStr(f.socials?.youtube?.url),
      followers: cleanNum(f.socials?.youtube?.followers),
      avgViews: cleanNum(f.socials?.youtube?.avgViews),
      engagementRate: cleanNum(f.socials?.youtube?.engagementRate),
    },
    other: {
      url: cleanStr(f.socials?.other?.url),
      followers: cleanNum(f.socials?.other?.followers),
      avgViews: cleanNum(f.socials?.other?.avgViews),
      engagementRate: cleanNum(f.socials?.other?.engagementRate),
    },
  },
});

const getError = (e, fallback) =>
  e?.response?.data?.message || e?.message || fallback;

/* ================================
   STORE
================================ */
const useInfluencerProgramStore = create(
  devtools((set, get) => ({
    /* STATE */
    form: getDefaultInfluencerForm(),
    influencer: null,
    submittedInfluencer: null,

    isSubmitting: false,
    isFetching: false,
    error: null,
    success: "",

    /* ============================
       FORM HANDLERS
    ============================ */
    setForm: (form) => set({ form }),

    updateField: (key, value) =>
      set((s) => ({
        form: { ...s.form, [key]: value },
      })),

    updateSocial: (platform, key, value) =>
      set((s) => ({
        form: {
          ...s.form,
          socials: {
            ...s.form.socials,
            [platform]: {
              ...s.form.socials[platform],
              [key]:
                ["followers", "avgViews", "engagementRate"].includes(key)
                  ? value === ""
                    ? ""
                    : cleanNum(value)
                  : value,
            },
          },
        },
      })),

    resetForm: () =>
      set({
        form: getDefaultInfluencerForm(),
        error: null,
        success: "",
      }),

    clearMessages: () =>
      set({
        error: null,
        success: "",
      }),

    /* ============================
       SUBMIT FORM
    ============================ */
    submitForm: async (customForm) => {
      try {
        set({ isSubmitting: true, error: null, success: "" });

        const payload = normalizePayload(customForm || get().form);

        const { data } = await axios.post(API_URL, payload);

        set({
          isSubmitting: false,
          submittedInfluencer: data?.influencer || null,
          influencer: data?.influencer || null,
          success: data?.message || "Submitted successfully",
          form: getDefaultInfluencerForm(),
        });

        return { ok: true, data };
      } catch (e) {
        const msg = getError(e, "Submit failed");

        set({
          isSubmitting: false,
          error: msg,
        });

        return { ok: false, message: msg };
      }
    },

    /* ============================
       FETCH BY CODE
    ============================ */
    fetchByCode: async (code) => {
      try {
        const clean = String(code || "").replace(/\D/g, "");

        if (!clean) {
          const msg = "Enter valid code";
          set({ error: msg, influencer: null });
          return { ok: false, message: msg };
        }

        set({ isFetching: true, error: null });

        const { data } = await axios.get(`${API_URL}/code/${clean}`);

        set({
          isFetching: false,
          influencer: data?.influencer || null,
        });

        return { ok: true, data };
      } catch (e) {
        const msg = getError(e, "Fetch failed");

        set({
          isFetching: false,
          error: msg,
          influencer: null,
        });

        return { ok: false, message: msg };
      }
    },
  }))
);

export default useInfluencerProgramStore;