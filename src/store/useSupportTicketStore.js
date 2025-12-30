import { create } from "zustand";

/* ===================== CONFIG ===================== */

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "";

/* ===================== STORE ===================== */

const useSupportTicketStore = create((set) => ({
  /* ---------- FLAGS ---------- */
  loading: false,
  submitting: false,
  error: "",

  /* ---------- DATA ---------- */
  tickets: [],
  ticket: null,
  total: 0,
  page: 1,
  limit: 10,

  /* =================================================
     CREATE TICKET (multipart/form-data)
     POST /api/support/tickets
  ================================================= */
  createTicket: async (formData) => {
    try {
      set({ submitting: true, error: "" });

      const res = await fetch(`${API_BASE}/api/support/tickets`, {
        method: "POST",
        body: formData, // browser sets multipart boundary
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to create ticket");
      }

      set({ submitting: false });

      return data.ticketId;
    } catch (err) {
      set({
        submitting: false,
        error: err.message || "Ticket creation failed",
      });
      throw err;
    }
  },

  /* =================================================
     GET SINGLE TICKET
     GET /api/support/tickets/:ticketId
  ================================================= */
  fetchTicketById: async (ticketId) => {
    try {
      set({ loading: true, error: "" });

      const res = await fetch(
        `${API_BASE}/api/support/tickets/${encodeURIComponent(ticketId)}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to fetch ticket");
      }

      set({
        ticket: data.ticket,
        loading: false,
      });
    } catch (err) {
      set({
        loading: false,
        error: err.message || "Error fetching ticket",
      });
    }
  },

  /* =================================================
     GET TICKETS BY EMAIL (customer dashboard)
     GET /api/support/tickets/by-email
  ================================================= */
  fetchTicketsByEmail: async (email, page = 1) => {
    try {
      set({ loading: true, error: "" });

      const res = await fetch(
        `${API_BASE}/api/support/tickets/by-email?email=${encodeURIComponent(
          email
        )}&page=${page}&limit=10`
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to fetch tickets");
      }

      set({
        tickets: data.tickets || [],
        total: data.total || 0,
        page: data.page || page,
        limit: data.limit || 10,
        loading: false,
      });
    } catch (err) {
      set({
        loading: false,
        error: err.message || "Error fetching tickets",
      });
    }
  },

  /* ---------------- RESET STORE ---------------- */
  reset: () =>
    set({
      loading: false,
      submitting: false,
      error: "",
      tickets: [],
      ticket: null,
      total: 0,
      page: 1,
      limit: 10,
    }),
}));

export default useSupportTicketStore;
