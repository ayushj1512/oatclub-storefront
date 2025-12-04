// app/profile/support/page.jsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LifeBuoy,
  RefreshCcw,
  Search,
  ArrowLeft,
  ExternalLink,
  AlertCircle,
  Loader2,
  Clock,
  Image as ImageIcon,
  Ticket,
  ChevronDown,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "";
const API_BASE = `${BACKEND}/api/support`;

const safe = (v) => String(v ?? "").trim();
const upper = (v) => safe(v).toUpperCase();
const fmtDate = (d) => (d ? new Date(d).toLocaleString("en-IN") : "-");

function qs(params) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    const val = safe(v);
    if (!val) return;
    sp.set(k, val);
  });
  return sp.toString();
}

function pillClass(status) {
  const s = upper(status);
  const base = "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset";
  if (s === "OPEN") return `${base} bg-[#800020]/10 text-[#800020] ring-[#800020]/20`;
  if (s === "IN_PROGRESS") return `${base} bg-black/5 text-black ring-black/10`;
  if (s === "RESOLVED") return `${base} bg-emerald-50 text-emerald-700 ring-emerald-200`;
  if (s === "CLOSED") return `${base} bg-black/5 text-black/70 ring-black/10`;
  return `${base} bg-black/5 text-black/70 ring-black/10`;
}

function matchText(t, q) {
  const needle = safe(q).toLowerCase();
  if (!needle) return true;
  const hay = [t?.ticketId, t?.subject, t?.issueType, t?.orderId, t?.message, t?.status]
    .map((x) => safe(x).toLowerCase())
    .join(" • ");
  return hay.includes(needle);
}

export default function ProfileSupportPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuthStore();

  const email = useMemo(() => safe(user?.email).toLowerCase(), [user?.email]);

  const [serverLoading, setServerLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [tickets, setTickets] = useState([]);

  // UI
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("newest"); // newest | oldest

  // Pagination (client-side)
  const pageSize = 12;
  const [page, setPage] = useState(1);

  const inflight = useRef(null);

  const canLoad = useMemo(() => !!email && isAuthenticated && !loading, [email, isAuthenticated, loading]);

  const fetchTickets = async ({ silent = false } = {}) => {
    if (!canLoad) return;

    if (!silent) setServerLoading(true);
    setRefreshing(!!silent);
    setError("");

    try {
      if (inflight.current) inflight.current.abort();
      const ctrl = new AbortController();
      inflight.current = ctrl;

      // Grab enough for client-side search/sort
      const url = `${API_BASE}/tickets/by-email?${qs({ email, page: 1, limit: 200 })}`;
      const res = await fetch(url, { method: "GET", cache: "no-store", signal: ctrl.signal });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.success === false) throw new Error(data?.message || `Failed (${res.status})`);

      const list = Array.isArray(data?.tickets) ? data.tickets : [];
      setTickets(list);
      setPage(1);
    } catch (e) {
      if (e?.name === "AbortError") return;
      setTickets([]);
      setError(e?.message || "Failed to load tickets");
    } finally {
      if (!silent) setServerLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!canLoad) return;
    fetchTickets({ silent: false });
    return () => {
      if (inflight.current) inflight.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canLoad]);

  const filteredSorted = useMemo(() => {
    let list = Array.isArray(tickets) ? [...tickets] : [];
    if (q) list = list.filter((t) => matchText(t, q));

    list.sort((a, b) => {
      const da = new Date(a?.createdAt || 0).getTime();
      const db = new Date(b?.createdAt || 0).getTime();
      return sort === "oldest" ? da - db : db - da;
    });

    return list;
  }, [tickets, q, sort]);

  const pages = useMemo(() => Math.max(1, Math.ceil(filteredSorted.length / pageSize)), [filteredSorted.length]);
  const pageItems = useMemo(() => filteredSorted.slice((page - 1) * pageSize, page * pageSize), [filteredSorted, page]);

  useEffect(() => {
    setPage(1);
  }, [q, sort]);

  const goToTicket = (id) => {
    const tid = safe(id);
    if (!tid) return;
    router.push(`/profile/support/${encodeURIComponent(tid)}`); // ✅ navigate to your new detail page
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-black">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading…
      </div>
    );
  }

  if (!isAuthenticated || !user?.uid) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="bg-white border border-black/10 shadow-lg p-6 w-full max-w-md rounded-2xl">
          <p className="text-black font-semibold">Please log in to view your support tickets.</p>
          <Link
            href="/auth/login"
            className="mt-4 inline-flex items-center justify-center bg-black text-white px-4 py-2 text-sm rounded-xl"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen w-full bg-white px-4 py-8">
      <div className="w-full max-w-5xl mx-auto space-y-5">
        {/* Header */}
        <div className="bg-white border border-black/10 shadow-lg rounded-2xl p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <div className="text-[11px] font-semibold tracking-widest uppercase text-[#800020]">Profile • Support</div>
              <h1 className="mt-1 text-2xl font-extrabold text-black flex items-center gap-2">
                <LifeBuoy className="h-5 w-5 text-[#800020]" /> Support Tickets
              </h1>
              <p className="mt-2 text-sm text-black/70">
                Showing tickets for <span className="font-semibold text-black">{safe(user?.email)}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/profile"
                className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold border border-black/15 bg-white hover:bg-black/5 transition rounded-xl"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Link>

              <button
                type="button"
                onClick={() => fetchTickets({ silent: true })}
                disabled={!canLoad}
                className={`inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl transition ${
                  canLoad ? "bg-black text-white hover:opacity-90" : "bg-black/10 text-black/40 cursor-not-allowed"
                }`}
              >
                {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                Refresh
              </button>

              {/* keep your existing new-ticket link if that’s correct in your app */}
              <Link
                href="/support"
                className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold border border-[#800020]/30 bg-white hover:bg-[#800020]/5 transition rounded-xl text-[#800020]"
              >
                New Ticket <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Search + Sort */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_220px] gap-3">
            <div>
              <label className="text-[11px] font-semibold text-black/70">Search</label>
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-black/15 bg-white px-3 py-2">
                <Search className="h-4 w-4 text-black/40" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by ticket ID, subject, orderId, message…"
                  className="w-full bg-transparent text-sm outline-none text-black placeholder:text-black/35"
                />
              </div>
              <p className="mt-1 text-[11px] text-black/50">
                Partial search works (ex: <span className="font-semibold">MF-</span>,{" "}
                <span className="font-semibold">refund</span>).
              </p>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-black/70">Sort by date</label>
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-black/15 bg-white px-3 py-2">
                <ChevronDown className="h-4 w-4 text-black/40" />
                <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full bg-transparent text-sm outline-none text-black">
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setQ("");
                    setSort("newest");
                  }}
                  className="text-[11px] font-semibold text-[#800020] hover:underline"
                >
                  Clear
                </button>
                <span className="text-[11px] text-black/50">•</span>
                <span className="text-[11px] text-black/60">
                  {filteredSorted.length} result{filteredSorted.length === 1 ? "" : "s"}
                </span>
              </div>
            </div>
          </div>

          {error ? (
            <div className="mt-4 p-3 rounded-xl border border-red-200 bg-red-50 text-sm text-red-700 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              {error}
            </div>
          ) : null}
        </div>

        {/* List */}
        <div className="bg-white border border-black/10 shadow-lg rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-black/10 flex items-center justify-between">
            <p className="font-semibold text-black flex items-center gap-2">
              <Ticket className="h-4 w-4 text-[#800020]" /> Tickets
            </p>
            <p className="text-xs text-black/60">
              Page <span className="font-semibold text-black">{page}</span> /{" "}
              <span className="font-semibold text-black">{pages}</span>
            </p>
          </div>

          {serverLoading ? (
            <div className="p-6 text-sm text-black/70 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : pageItems.length === 0 ? (
            <div className="p-6 text-sm text-black/70">{q ? "No tickets match your search." : "No tickets yet."}</div>
          ) : (
            <div className="divide-y divide-black/5">
              {pageItems.map((t) => {
                const id = safe(t.ticketId);
                const atCount = Array.isArray(t.attachments) ? t.attachments.length : 0;

                return (
                  <button
                    key={id || `${safe(t.createdAt)}-${safe(t.subject)}`}
                    type="button"
                    onClick={() => goToTicket(id)}
                    className="w-full text-left px-5 py-4 hover:bg-black/[0.03] transition focus:outline-none"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-[#800020]">{id || "—"}</p>
                        <p className="mt-1 text-sm font-bold text-black line-clamp-1">{safe(t.subject) || "(No subject)"}</p>
                        <p className="mt-1 text-xs text-black/65 line-clamp-1">{safe(t.issueType) || "-"}</p>

                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-black/60">
                          <span className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white px-2.5 py-1">
                            <Clock className="h-3.5 w-3.5" /> {fmtDate(t.createdAt)}
                          </span>

                          {safe(t.orderId) ? (
                            <span className="inline-flex items-center rounded-full border border-black/10 bg-white px-2.5 py-1">
                              Order: <span className="ml-1 font-semibold text-black">{safe(t.orderId)}</span>
                            </span>
                          ) : null}

                          {atCount ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white px-2.5 py-1">
                              <ImageIcon className="h-3.5 w-3.5" /> {atCount}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className={pillClass(t.status)}>{upper(t.status).replaceAll("_", " ")}</span>

                        {/* Secondary action: track page (optional) */}
                        <Link
                          href={id ? `/support/track/${encodeURIComponent(id)}` : "#"}
                          onClick={(e) => e.stopPropagation()} // ✅ don't hijack the row navigation
                          className={`inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl transition ${
                            id ? "bg-white border border-black/15 hover:bg-black/5 text-black" : "bg-black/10 text-black/40 pointer-events-none"
                          }`}
                        >
                          Track <ExternalLink className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          <div className="px-5 py-4 border-t border-black/10 bg-white flex items-center justify-between">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition ${
                page <= 1
                  ? "bg-black/5 text-black/30 cursor-not-allowed"
                  : "bg-white border border-black/15 hover:bg-black/5 text-black"
              }`}
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page >= pages}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition ${
                page >= pages
                  ? "bg-black/5 text-black/30 cursor-not-allowed"
                  : "bg-white border border-black/15 hover:bg-black/5 text-black"
              }`}
            >
              Next
            </button>
          </div>
        </div>

        <p className="text-[11px] text-black/50 px-1">
          Tip: You can also track tickets from{" "}
          <Link href="/support/track" className="underline text-[#800020]">
            Support Tracking
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
