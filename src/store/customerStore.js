import { create } from "zustand";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const cleanError = (err) =>
  err?.response?.data?.message || err?.message || "Something went wrong";

const useCustomerStore = create((set, get) => ({
  loading: false,
  saving: false,
  error: null,

  customer: null,
  customers: [],
  selectedCustomer: null,

  payoutDetails: null,

  creditSummary: null,
  creditLogs: [],
  allCreditLogs: [],

  pagination: {
    total: 0,
    page: 1,
    pages: 1,
    limit: 20,
  },

  clearError: () => set({ error: null }),

  clearCustomer: () =>
    set({
      customer: null,
      customers: [],
      selectedCustomer: null,
      payoutDetails: null,
      creditSummary: null,
      creditLogs: [],
    }),

  setCustomer: (customer) =>
    set({
      customer,
      selectedCustomer: customer,
      payoutDetails: customer?.payoutDetails || null,
      creditSummary: customer?.credits || null,
    }),

  fetchCustomerById: async (customerId) => {
    set({ loading: true, error: null });

    try {
      const { data } = await axios.get(`${API}/api/customers/${customerId}`, {
        withCredentials: true,
      });

      set({
        customer: data || null,
        selectedCustomer: data || null,
        payoutDetails: data?.payoutDetails || null,
        creditSummary: data?.credits || null,
        loading: false,
      });

      return data;
    } catch (err) {
      const message = cleanError(err);
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  searchCustomers: async ({ email = "", phone = "", customerId = "" } = {}) => {
    set({ loading: true, error: null });

    try {
      const params = {};
      if (email) params.email = email;
      if (phone) params.phone = phone;
      if (customerId) params.customerId = customerId;

      const { data } = await axios.get(`${API}/api/customers/search`, {
        params,
        withCredentials: true,
      });

      const items = data?.items || (data?.customer ? [data.customer] : []);

      set({
        customers: items,
        selectedCustomer: items?.[0] || null,
        customer: items?.[0] || null,
        payoutDetails: items?.[0]?.payoutDetails || null,
        creditSummary: items?.[0]?.credits || null,
        loading: false,
      });

      return data;
    } catch (err) {
      const message = cleanError(err);
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  searchCustomerByEmail: async (email) => get().searchCustomers({ email }),
  searchCustomerByPhone: async (phone) => get().searchCustomers({ phone }),
  searchCustomerByCustomerId: async (customerId) =>
    get().searchCustomers({ customerId }),

  selectCustomer: (customer) =>
    set({
      selectedCustomer: customer,
      customer,
      payoutDetails: customer?.payoutDetails || null,
      creditSummary: customer?.credits || null,
    }),

  checkCustomerExists: async ({ email, phone }) => {
    set({ loading: true, error: null });

    try {
      const { data } = await axios.get(`${API}/api/customers/exists`, {
        params: { email, phone },
        withCredentials: true,
      });

      if (data?.exists) {
        set({
          customer: data.customer,
          selectedCustomer: data.customer,
          payoutDetails: data?.customer?.payoutDetails || null,
          creditSummary: data?.customer?.credits || null,
        });
      }

      set({ loading: false });
      return data;
    } catch (err) {
      const message = cleanError(err);
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  savePayoutDetails: async (customerId, payload) => {
    set({ saving: true, error: null });

    try {
      const { data } = await axios.patch(
        `${API}/api/customers/${customerId}/payout-details`,
        payload,
        { withCredentials: true }
      );

      set({
        customer: data?.customer || null,
        selectedCustomer: data?.customer || null,
        payoutDetails: data?.payoutDetails || null,
        saving: false,
      });

      return data;
    } catch (err) {
      const message = cleanError(err);
      set({ error: message, saving: false });
      throw new Error(message);
    }
  },

  fetchCustomerCreditSummary: async (customerId) => {
    if (!customerId) return null;

    set({ loading: true, error: null });

    try {
      const { data } = await axios.get(
        `${API}/api/customers/${customerId}/credits/summary`,
        { withCredentials: true }
      );

      set({
        creditSummary: data?.credits || null,
        loading: false,
      });

      return data;
    } catch (err) {
      const message = cleanError(err);
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  addCustomerCredit: async (customerId, payload) => {
    set({ saving: true, error: null });

    try {
      const { data } = await axios.post(
        `${API}/api/customers/${customerId}/credits/add`,
        payload,
        { withCredentials: true }
      );

      set({
        customer: data?.customer || get().customer,
        selectedCustomer: data?.customer || get().selectedCustomer,
        creditSummary: data?.credits || data?.customer?.credits || null,
        saving: false,
      });

      return data;
    } catch (err) {
      const message = cleanError(err);
      set({ error: message, saving: false });
      throw new Error(message);
    }
  },

  debitCustomerCredit: async (customerId, payload) => {
    set({ saving: true, error: null });

    try {
      const { data } = await axios.post(
        `${API}/api/customers/${customerId}/credits/debit`,
        payload,
        { withCredentials: true }
      );

      set({
        customer: data?.customer || get().customer,
        selectedCustomer: data?.customer || get().selectedCustomer,
        creditSummary: data?.credits || data?.customer?.credits || null,
        saving: false,
      });

      return data;
    } catch (err) {
      const message = cleanError(err);
      set({ error: message, saving: false });
      throw new Error(message);
    }
  },

  fetchCustomerCreditLogs: async (customerId, params = {}) => {
    set({ loading: true, error: null });

    try {
      const { data } = await axios.get(
        `${API}/api/customers/${customerId}/credits/logs`,
        {
          params,
          withCredentials: true,
        }
      );

      set({
        creditLogs: data?.items || [],
        creditSummary: data?.summary || null,
        pagination: {
          total: data?.total || 0,
          page: data?.page || 1,
          pages: data?.pages || 1,
          limit: data?.limit || 20,
        },
        loading: false,
      });

      return data;
    } catch (err) {
      const message = cleanError(err);
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  fetchAllCustomerCreditLogs: async (params = {}) => {
    set({ loading: true, error: null });

    try {
      const { data } = await axios.get(`${API}/api/customers/credits/logs`, {
        params,
        withCredentials: true,
      });

      set({
        allCreditLogs: data?.items || [],
        pagination: {
          total: data?.total || 0,
          page: data?.page || 1,
          pages: data?.pages || 1,
          limit: data?.limit || 20,
        },
        loading: false,
      });

      return data;
    } catch (err) {
      const message = cleanError(err);
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  hasPayoutDetails: () => {
    const payout = get().payoutDetails;

    const hasBank =
      payout?.bank?.accountHolderName &&
      payout?.bank?.accountNumber &&
      payout?.bank?.ifscCode;

    const hasUpi = payout?.upi?.upiId;

    return !!(hasBank || hasUpi);
  },

  getCreditBalance: () =>
    Number(get().creditSummary?.balance || get().customer?.credits?.balance || 0),
}));

export default useCustomerStore;