// app/profile/support/[ticket-id]/page.jsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertCircle,
  Clock,
  ExternalLink,
  Image as ImageIcon,
  LifeBuoy,
  Loader2,
  Mail,
  Phone,
  RefreshCcw,
  Ticket,
  Hash,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "";
const API_BASE = `${BACKEND}/api/support`;

const safe = (v) => String(v ?? "").trim();
const upper = (v) => safe(v).toUpperCase();
const fmtDate = (d) => (d ? new Date(d).toLocaleString("en-IN") : "-");

function pillClass(status) {
  const s = upper(status);
  const base = "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset";
  if (s === "OPEN") return `${base} bg-[#800020]/10 text-[#800020] ring-[#800020]/20`;
  if (s === "IN_PROGRESS") return `${base} bg-black/5 text-black ring-black/10`;
  if (s === "RESOLVED") return `${base} bg-emerald-50 text-emerald-700 ring-emerald-200`;
  if (s === "CLOSED") return `${base} bg-black/5 text-black/70 ring-black/10`;
  return `${base} bg-black/5 text-black/70 ring-black/10`;
}

function AttachmentGrid({ attachments }) {
  const list = Array.isArray(attachments) ? attachments : [];
  if (!list.length) {
    return <p className="text-sm text-black/60">No attachments.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {list.map((a, idx) => {
        const url = a?.url || "";
        const filename = safe(a?.filename) || `Attachment ${idx + 1}`;
        const mime = safe(a?.mimeType);
        return (
          <a
            key={`${url}-${idx}`}
            href={url || "#"}
            target="_blank"
            rel="noreferrer"
            className={`group rounded-xl border border-black/10 bg-white p-3 hover:bg-black/[0.03] transition ${
              url ? "" : "pointer-events-none opacity-60"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-black line-clamp-1">{filename}</p>
                <p className="mt-1 text-[11px] text-black/55 line-clamp-1">
                  {mime || "file"} {a?.size ? `• ${Math.round(Number(a.size) / 1024)} KB` : ""}
                </p>
              </div>
              <div className="shrink-0 inline-flex items-center gap-1 text-[#800020] text-xs font-semibold">
                <ImageIcon className="h-4 w-4" />
                <ExternalLink className="h-4 w-4 opacity-80" />
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
}

export default function ProfileSupportTicketDetailPage() {
  const { "ticket-id": ticketParam } = useParams();
  const ticketId = useMemo(() => safe(ticketParam), [ticketParam]);
  const router = useRouter();

  const { user, isAuthenticated, loading } = useAuthStore();
  const userEmail = useMemo(() => safe(user?.email).toLowerCase(), [user?.email]);

  const [data, setData] = useState(null);
  const [loadingTicket, setLoadingTicket] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const inflight = useRef(null);

  const canLoad = useMemo(
    () => !!ticketId && isAuthenticated && !loading && !!userEmail,
    [ticketId, isAuthenticated, loading, userEmail]
  );

  const fetchTicket = async ({ silent = false } = {}) => {
    if (!canLoad) return;

    if (!silent) setLoadingTicket(true);
    setRefreshing(!!silent);
    setError("");

    try {
      if (inflight.current) inflight.current.abort();
      const ctrl = new AbortController();
      inflight.current = ctrl;

      // fetch exact ticket by id
      const res = await fetch(`${API_BASE}/tickets/${encodeURIComponent(ticketId)}`, {
        method: "GET",
        cache: "no-store",
        signal: ctrl.signal,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.success === false) throw new Error(json?.message || `Failed (${res.status})`);

      const t = json?.ticket || null;
      if (!t) throw new Error("Ticket not found.");

      // IMPORTANT: customer-only access guard (frontend-side)
      // If you want *real* security, also enforce this on backend with auth middleware.
      const ticketEmail = safe(t?.email).toLowerCase();
      if (ticketEmail && ticketEmail !== userEmail) {
        throw new Error("You don’t have access to this ticket.");
      }

      setData(t);
    } catch (e) {
      if (e?.name === "AbortError") return;
      setData(null);
      setError(e?.message || "Failed to load ticket");
    } finally {
      if (!silent) setLoadingTicket(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!canLoad) return;
    fetchTicket({ silent: false });
    return () => {
      if (inflight.current) inflight.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canLoad, ticketId]);

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
          <p className="text-black font-semibold">Please log in to view this ticket.</p>
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
      <div className="w-full max-w-4xl mx-auto space-y-5">
        {/* Header */}
        <div className="bg-white border border-black/10 shadow-lg rounded-2xl p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <div className="text-[11px] font-semibold tracking-widest uppercase text-[#800020]">
                Profile • Support • Ticket
              </div>
              <h1 className="mt-1 text-2xl font-extrabold text-black flex items-center gap-2">
                <LifeBuoy className="h-5 w-5 text-[#800020]" />
                Ticket Details
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-black/70">
                <span className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white px-2.5 py-1">
                  <Hash className="h-3.5 w-3.5" />
                  <span className="font-semibold text-black">{ticketId || "-"}</span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white px-2.5 py-1">
                  <Mail className="h-3.5 w-3.5" />
                  {safe(user?.email) || "-"}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/profile/support"
                className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold border border-black/15 bg-white hover:bg-black/5 transition rounded-xl"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Link>

              <button
                type="button"
                onClick={() => fetchTicket({ silent: true })}
                disabled={!canLoad}
                className={`inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl transition ${
                  canLoad ? "bg-black text-white hover:opacity-90" : "bg-black/10 text-black/40 cursor-not-allowed"
                }`}
              >
                {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                Refresh
              </button>
            </div>
          </div>

          {error ? (
            <div className="mt-4 p-3 rounded-xl border border-red-200 bg-red-50 text-sm text-red-700 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              {error}
            </div>
          ) : null}
        </div>

        {/* Body */}
        <div className="bg-white border border-black/10 shadow-lg rounded-2xl overflow-hidden">
          {loadingTicket ? (
            <div className="p-6 text-sm text-black/70 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading ticket…
            </div>
          ) : !data ? (
            <div className="p-6 text-sm text-black/70">
              Ticket not available.{" "}
              <button onClick={() => router.push("/profile/support")} className="underline text-[#800020]">
                Go back
              </button>
              .
            </div>
          ) : (
            <>
              <div className="px-5 py-4 border-b border-black/10">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-[#800020] flex items-center gap-1">
                      <Ticket className="h-3.5 w-3.5" />
                      {safe(data.ticketId)}
                    </p>
                    <h2 className="mt-1 text-lg md:text-xl font-extrabold text-black">
                      {safe(data.subject) || "(No subject)"}
                    </h2>
                    <p className="mt-1 text-sm text-black/70">{safe(data.issueType) || "-"}</p>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-black/60">
                      <span className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white px-2.5 py-1">
                        <Clock className="h-3.5 w-3.5" /> Created: {fmtDate(data.createdAt)}
                      </span>
                      <span className={pillClass(data.status)}>{upper(data.status).replaceAll("_", " ")}</span>

                      {safe(data.orderId) ? (
                        <span className="inline-flex items-center rounded-full border border-black/10 bg-white px-2.5 py-1">
                          Order: <span className="ml-1 font-semibold text-black">{safe(data.orderId)}</span>
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-black/10 bg-white p-4 w-full md:w-[260px]">
                    <p className="text-xs font-semibold text-black/70">Customer</p>
                    <p className="mt-1 text-sm font-bold text-black">{safe(data.name) || "—"}</p>

                    <div className="mt-2 space-y-1">
                      <a
                        href={safe(data.email) ? `mailto:${safe(data.email)}` : "#"}
                        className={`inline-flex items-center gap-2 text-xs font-semibold ${
                          safe(data.email) ? "text-[#800020] hover:opacity-80" : "text-black/35 pointer-events-none"
                        }`}
                      >
                        <Mail className="h-4 w-4" />
                        {safe(data.email) || "—"}
                      </a>

                      {safe(data.phone) ? (
                        <a
                          href={`tel:${safe(data.phone)}`}
                          className="inline-flex items-center gap-2 text-xs font-semibold text-[#800020] hover:opacity-80"
                        >
                          <Phone className="h-4 w-4" />
                          {safe(data.phone)}
                        </a>
                      ) : null}
                    </div>

                    <div className="mt-3 text-[11px] text-black/60">
                      Updated: <span className="font-semibold text-black">{fmtDate(data.updatedAt)}</span>
                      <br />
                      Resolved: <span className="font-semibold text-black">{fmtDate(data.resolvedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="p-5 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
                <div className="rounded-2xl border border-black/10 bg-white p-4">
                  <p className="text-xs font-semibold text-black/70">Your message</p>
                  <p className="mt-2 text-sm text-black whitespace-pre-wrap">{safe(data.message) || "—"}</p>
                </div>

                <div className="space-y-4">
                  {/* Attachments */}
                  <div className="rounded-2xl border border-black/10 bg-white p-4">
                    <p className="text-xs font-semibold text-black/70 flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-[#800020]" />
                      Attachments
                      <span className="ml-auto text-[11px] text-black/50">
                        {Array.isArray(data.attachments) ? data.attachments.length : 0}
                      </span>
                    </p>
                    <div className="mt-3">
                      <AttachmentGrid attachments={data.attachments} />
                    </div>
                  </div>

                  {/* Note to user */}
                  <div className="rounded-2xl border border-[#800020]/20 bg-[#800020]/5 p-4">
                    <p className="text-xs font-semibold text-[#800020]">Heads up</p>
                    <p className="mt-1 text-sm text-black/70">
                      If you need to add more info (images/details), create a new ticket and mention this Ticket ID:
                      <span className="ml-1 font-semibold text-black">{safe(data.ticketId)}</span>.
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-5 py-4 border-t border-black/10 bg-white flex flex-wrap items-center justify-between gap-2">
                <Link
                  href="/profile/support"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border border-black/15 bg-white hover:bg-black/5 transition"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to tickets
                </Link>

                <Link
                  href={`/support/track/${encodeURIComponent(safe(data.ticketId))}`}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-[#800020] text-white hover:opacity-90 transition"
                >
                  Open tracking page <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
