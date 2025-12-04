// src/components/profile/SupportTicketsRow.jsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LifeBuoy,
  RefreshCcw,
  PlusCircle,
  AlertCircle,
  Clock,
  Mail,
  Ticket,
  Image as ImageIcon,
  ChevronRight,
  Loader2,
} from "lucide-react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "";
const API_BASE = `${BACKEND}/api/support`;

const safe = (v) => String(v ?? "").trim();
const upper = (v) => safe(v).toUpperCase();
const fmtDate = (d) => (d ? new Date(d).toLocaleString("en-IN") : "-");

function cx(...cls) {
  return cls.filter(Boolean).join(" ");
}

function pillClass(status) {
  const s = upper(status);
  const base =
    "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset";
  // Theme: black / white / #800020
  if (s === "OPEN") return `${base} bg-[#800020]/10 text-[#800020] ring-[#800020]/20`;
  if (s === "IN_PROGRESS") return `${base} bg-black/5 text-black ring-black/10`;
  if (s === "RESOLVED") return `${base} bg-emerald-50 text-emerald-700 ring-emerald-200`;
  if (s === "CLOSED") return `${base} bg-black/5 text-black/70 ring-black/10`;
  return `${base} bg-black/5 text-black/70 ring-black/10`;
}

/**
 * SupportTicketsRow (compact + load more + row navigation + View All)
 *
 * Requires backend:
 * GET /api/support/tickets/by-email?email=...&page=1&limit=50
 *
 * Navigates to:
 * - Ticket details page: /profile/support/[ticket-id]
 * - View all page:       /profile/support
 * - New ticket page:     /support/new (keep/change if your route differs)
 */
export default function SupportTicketsRow({
  email,
  initialLimit = 3,
  step = 3,
  maxFetch = 50,
  viewAllHref = "/profile/support",
  newTicketHref = "/support/new",
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [tickets, setTickets] = useState([]);
  const [visible, setVisible] = useState(Math.max(1, Number(initialLimit) || 3));

  const inflight = useRef(null);

  const normalizedEmail = useMemo(() => safe(email).toLowerCase(), [email]);
  const canLoad = !!normalizedEmail;

  const hasMore = useMemo(() => visible < (tickets?.length || 0), [visible, tickets]);
  const visibleTickets = useMemo(() => tickets.slice(0, visible), [tickets, visible]);

  const fetchTickets = async ({ silent = false } = {}) => {
    if (!canLoad) return;

    if (!silent) setLoading(true);
    setRefreshing(!!silent);
    setError("");

    try {
      if (inflight.current) inflight.current.abort();
      const ctrl = new AbortController();
      inflight.current = ctrl;

      const limit = Math.min(Math.max(1, Number(maxFetch) || 50), 50);
      const url = `${API_BASE}/tickets/by-email?email=${encodeURIComponent(normalizedEmail)}&page=1&limit=${limit}`;

      const res = await fetch(url, { method: "GET", cache: "no-store", signal: ctrl.signal });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.success === false) throw new Error(data?.message || `Failed (${res.status})`);

      const list = Array.isArray(data?.tickets) ? data.tickets : [];
      setTickets(list);

      // keep user's current visible count but clamp to list length; never lower below initialLimit
      setVisible((v) => {
        const min = Math.max(1, Number(initialLimit) || 3);
        const want = Math.max(v, min);
        return list.length ? Math.min(want, list.length) : want;
      });
    } catch (e) {
      if (e?.name === "AbortError") return;
      setTickets([]);
      setError(e?.message || "Failed to load support tickets");
    } finally {
      if (!silent) setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setVisible(Math.max(1, Number(initialLimit) || 3));
  }, [initialLimit]);

  useEffect(() => {
    if (!canLoad) return;
    fetchTickets({ silent: false });
    return () => {
      if (inflight.current) inflight.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedEmail]);

  const goTicket = (ticketId) => {
    const id = safe(ticketId);
    if (!id) return;
    router.push(`/profile/support/${encodeURIComponent(id)}`);
  };

  return (
    <div className="bg-white border border-black/10 shadow-lg">
      {/* Header (compact) */}
      <div className="px-5 py-4 border-b border-black/10 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-black flex items-center gap-2">
            <LifeBuoy className="h-4 w-4 text-[#800020]" />
            Support
            {tickets?.length ? (
              <span className="ml-1 text-[11px] font-semibold text-black/70 bg-black/5 px-2 py-0.5 rounded-full">
                {tickets.length}
              </span>
            ) : null}
          </h3>

          <p className="text-[11px] text-black/60 mt-0.5 flex items-center gap-1 truncate">
            <Mail className="h-3.5 w-3.5 shrink-0 text-black/50" />
            <span className="truncate">{canLoad ? normalizedEmail : "Email not available"}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => fetchTickets({ silent: true })}
            disabled={!canLoad}
            className={cx(
              "inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold border transition",
              canLoad ? "bg-black text-white hover:opacity-90" : "bg-black/5 text-black/40 cursor-not-allowed border-black/10"
            )}
            title="Refresh"
          >
            {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            Refresh
          </button>

          <Link
            href={newTicketHref}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold border border-black/10 bg-white hover:bg-black/[0.03] transition"
            title="Create new ticket"
          >
            <PlusCircle className="h-4 w-4 text-[#800020]" />
            New
          </Link>

          {/* ✅ View All option */}
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold border border-[#800020]/25 bg-white hover:bg-[#800020]/5 transition text-[#800020]"
            title="View all tickets"
          >
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        {error ? (
          <div className="mb-3 p-3 border border-red-200 bg-red-50 text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5" />
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="text-sm text-black/60 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading tickets...
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-sm text-black/60">No tickets yet.</div>
        ) : (
          <div className="space-y-2">
            {visibleTickets.map((t) => {
              const id = safe(t.ticketId);
              const atCount = Array.isArray(t.attachments) ? t.attachments.length : 0;

              return (
                // ✅ Navigate to /profile/support/[ticket-id] on click
                <button
                  key={id || `${safe(t.email)}-${safe(t.createdAt)}`}
                  type="button"
                  onClick={() => goTicket(id)}
                  className="w-full text-left border border-black/10 hover:bg-black/[0.03] transition focus:outline-none"
                >
                  <div className="px-3 py-2.5 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[11px] font-semibold text-[#800020] flex items-center gap-1 min-w-0">
                          <Ticket className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{id || "—"}</span>
                        </p>
                        <span className={pillClass(t.status)}>{upper(t.status).replaceAll("_", " ")}</span>
                      </div>

                      <p className="mt-1 text-sm font-medium text-black line-clamp-1">
                        {safe(t.subject) || "(No subject)"}
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-black/60">
                        <span className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white px-2 py-0.5">
                          <Clock className="h-3.5 w-3.5" />
                          {fmtDate(t.createdAt)}
                        </span>

                        {safe(t.issueType) ? (
                          <span className="inline-flex items-center rounded-full border border-black/10 bg-white px-2 py-0.5">
                            {safe(t.issueType)}
                          </span>
                        ) : null}

                        {atCount ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white px-2 py-0.5">
                            <ImageIcon className="h-3.5 w-3.5" />
                            {atCount}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <ChevronRight className="h-4 w-4 text-black/30 mt-1 shrink-0" />
                  </div>
                </button>
              );
            })}

            {/* Load more */}
            <div className="pt-1 flex items-center justify-between gap-3">
              <p className="text-[11px] text-black/50">
                Showing <span className="font-semibold text-black">{Math.min(visible, tickets.length)}</span> of{" "}
                <span className="font-semibold text-black">{tickets.length}</span>
              </p>

              {hasMore ? (
                <button
                  type="button"
                  onClick={() => setVisible((v) => Math.min(tickets.length, v + Math.max(1, Number(step) || 3)))}
                  className="inline-flex items-center gap-2 text-xs font-semibold border border-black/10 bg-white hover:bg-black/[0.03] transition px-3 py-2"
                >
                  Load more <ChevronRight className="h-4 w-4" />
                </button>
              ) : tickets.length > Math.max(1, Number(initialLimit) || 3) ? (
                <button
                  type="button"
                  onClick={() => setVisible(Math.max(1, Number(initialLimit) || 3))}
                  className="inline-flex items-center gap-2 text-xs font-semibold border border-black/10 bg-white hover:bg-black/[0.03] transition px-3 py-2"
                >
                  Show less
                </button>
              ) : null}
            </div>

            {/* ✅ View all link at bottom too (nice on mobile) */}
            <div className="pt-2">
              <Link
                href={viewAllHref}
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#800020] hover:underline"
              >
                View all tickets <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
