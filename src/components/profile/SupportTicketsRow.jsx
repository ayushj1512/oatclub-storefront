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

  if (s === "OPEN")
    return `${base} bg-black text-white ring-black`;

  if (s === "IN_PROGRESS")
    return `${base} bg-black/5 text-black ring-black/20`;

  if (s === "RESOLVED")
    return `${base} bg-white text-black ring-black`;

  if (s === "CLOSED")
    return `${base} bg-black/5 text-black/60 ring-black/10`;

  return `${base} bg-black/5 text-black/60 ring-black/10`;
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
  <div className="bg-white border border-black/10 rounded-2xl overflow-hidden">

  {/* ================= HEADER ================= */}
  <div className="px-5 py-4 border-b border-black/10 flex flex-wrap gap-3 items-center justify-between">
    
    {/* Left: Title + Email */}
    <div className="min-w-0">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <LifeBuoy className="h-4 w-4" />
        Support
        {!!tickets?.length && (
          <span className="ml-1 px-2 py-0.5 text-[10px] rounded-full bg-black/5">
            {tickets.length}
          </span>
        )}
      </h3>

      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-black/60 truncate">
        <Mail className="h-3.5 w-3.5" />
        {canLoad ? normalizedEmail : "Email not available"}
      </p>
    </div>

    {/* Right: Actions */}
    <div className="flex items-center gap-2">
      <button
        onClick={() => fetchTickets({ silent: true })}
        disabled={!canLoad}
        className={cx(
          "inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold border rounded-xl transition",
          canLoad
            ? "bg-black text-white hover:opacity-90"
            : "bg-black/5 text-black/40 cursor-not-allowed"
        )}
      >
        {refreshing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
        Refresh
      </button>

      <Link
        href={newTicketHref}
        className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold
                   border border-black/10 rounded-xl hover:bg-black/5 transition"
      >
        <PlusCircle className="h-4 w-4" /> New
      </Link>
    </div>
  </div>

  {/* ================= BODY ================= */}
  <div className="px-5 py-4">

    {/* Error */}
    {error && (
      <div className="mb-3 p-3 text-xs border border-black/10 bg-black/5 flex gap-2 rounded-xl">
        <AlertCircle className="h-4 w-4" /> {error}
      </div>
    )}

    {/* Loading */}
    {loading && (
      <div className="flex items-center gap-2 text-sm text-black/60">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading tickets…
      </div>
    )}

    {/* Empty */}
    {!loading && tickets.length === 0 && (
      <p className="text-sm text-black/60">No tickets yet.</p>
    )}

    {/* Ticket List */}
    {!loading && tickets.length > 0 && (
      <div className="space-y-2">
        {visibleTickets.map((t) => {
          const id = safe(t.ticketId);
          const at = t.attachments?.length || 0;

          return (
            <button
              key={id}
              onClick={() => goTicket(id)}
              className="w-full border border-black/10 rounded-xl
                         hover:bg-black/5 transition text-left"
            >
              <div className="px-3 py-2.5 flex gap-3 justify-between">
                
                {/* Info */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold truncate">
                      #{id || "—"}
                    </span>
                    <span className={pillClass(t.status)}>
                      {upper(t.status).replaceAll("_", " ")}
                    </span>
                  </div>

                  <p className="mt-1 text-sm font-medium truncate">
                    {safe(t.subject) || "(No subject)"}
                  </p>

                  <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-black/60">
                    <span className="px-2 py-0.5 border border-black/10 rounded-full flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {fmtDate(t.createdAt)}
                    </span>

                    {safe(t.issueType) && (
                      <span className="px-2 py-0.5 border border-black/10 rounded-full">
                        {safe(t.issueType)}
                      </span>
                    )}

                    {!!at && (
                      <span className="px-2 py-0.5 border border-black/10 rounded-full flex items-center gap-1">
                        <ImageIcon className="h-3.5 w-3.5" /> {at}
                      </span>
                    )}
                  </div>
                </div>

                <ChevronRight className="h-4 w-4 text-black/30 mt-1" />
              </div>
            </button>
          );
        })}

        {/* Footer controls */}
        <div className="pt-2 flex items-center justify-between text-[11px] text-black/60">
          <span>
            Showing <b className="text-black">{Math.min(visible, tickets.length)}</b> of{" "}
            <b className="text-black">{tickets.length}</b>
          </span>

          {hasMore ? (
            <button
              onClick={() => setVisible((v) => Math.min(tickets.length, v + step))}
              className="text-xs font-semibold hover:underline"
            >
              Load more
            </button>
          ) : (
            <button
              onClick={() => setVisible(initialLimit)}
              className="text-xs font-semibold hover:underline"
            >
              Show less
            </button>
          )}
        </div>
      </div>
    )}
  </div>
</div>

);

}
