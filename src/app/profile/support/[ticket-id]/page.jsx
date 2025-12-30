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
  const base =
    "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset";

  switch (s) {
    case "OPEN":
      return `${base} bg-black/5 text-black ring-black/15`;

    case "IN_PROGRESS":
      return `${base} bg-black text-white ring-black`;

    case "RESOLVED":
      return `${base} bg-white text-black ring-black`;

    case "CLOSED":
      return `${base} bg-black/10 text-black/70 ring-black/10`;

    default:
      return `${base} bg-black/5 text-black/70 ring-black/10`;
  }
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
            <div className="shrink-0 inline-flex items-center gap-1 text-black/70 text-xs font-semibold">
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
  <main className="min-h-screen bg-white px-4 py-8">
    <div className="mx-auto max-w-4xl space-y-5">

      {/* Header */}
      <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

          <div>
            <p className="text-[11px] font-medium tracking-widest uppercase text-gray-500">
              Profile • Support • Ticket
            </p>

            <h1 className="mt-1 flex items-center gap-2 text-2xl font-extrabold">
              <LifeBuoy className="h-5 w-5 text-black" />
              Ticket Details
            </h1>

            <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-black/70">
              <span className="badge">
                <Hash className="h-3.5 w-3.5" />
                <strong>{ticketId || "-"}</strong>
              </span>
              <span className="badge">
                <Mail className="h-3.5 w-3.5" />
                {safe(user?.email) || "-"}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Link href="/profile/support" className="btn-outline">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>

            <button
              onClick={() => fetchTicket({ silent: true })}
              disabled={!canLoad}
              className={`btn-primary ${
                !canLoad && "opacity-40 cursor-not-allowed"
              }`}
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4" />
              )}
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 mt-0.5" />
            {error}
          </div>
        )}
      </section>

      {/* Body */}
      <section className="rounded-2xl border border-black/10 bg-white shadow-sm overflow-hidden">
        {loadingTicket ? (
          <div className="p-6 flex items-center gap-2 text-sm text-black/70">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading ticket…
          </div>
        ) : !data ? (
          <div className="p-6 text-sm text-black/70">
            Ticket not available.{" "}
            <button
              onClick={() => router.push("/profile/support")}
              className="underline font-medium"
            >
              Go back
            </button>
          </div>
        ) : (
          <>
            {/* Meta */}
            <div className="border-b border-black/10 px-5 py-4">
              <div className="flex flex-col gap-4 md:flex-row md:justify-between">
                <div>
                  <p className="text-[11px] font-semibold flex items-center gap-1">
                    <Ticket className="h-3.5 w-3.5" />
                    {safe(data.ticketId)}
                  </p>

                  <h2 className="mt-1 text-xl font-extrabold">
                    {safe(data.subject) || "(No subject)"}
                  </h2>

                  <p className="mt-1 text-sm text-black/70">
                    {safe(data.issueType)}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-black/60">
                    <span className="badge">
                      <Clock className="h-3.5 w-3.5" />
                      {fmtDate(data.createdAt)}
                    </span>
                    <span className={pillClass(data.status)}>
                      {upper(data.status).replaceAll("_", " ")}
                    </span>
                    {data.orderId && (
                      <span className="badge">
                        Order: <strong>{data.orderId}</strong>
                      </span>
                    )}
                  </div>
                </div>

                {/* Customer */}
                <div className="w-full md:w-[260px] rounded-2xl border border-black/10 p-4">
                  <p className="text-xs font-semibold text-black/60">
                    Customer
                  </p>
                  <p className="mt-1 text-sm font-bold">
                    {safe(data.name)}
                  </p>

                  <div className="mt-2 space-y-1 text-xs font-semibold">
                    {data.email && (
                      <a href={`mailto:${data.email}`} className="flex gap-2">
                        <Mail className="h-4 w-4" />
                        {data.email}
                      </a>
                    )}
                    {data.phone && (
                      <a href={`tel:${data.phone}`} className="flex gap-2">
                        <Phone className="h-4 w-4" />
                        {data.phone}
                      </a>
                    )}
                  </div>

                  <p className="mt-3 text-[11px] text-black/60">
                    Updated: <strong>{fmtDate(data.updatedAt)}</strong>
                    <br />
                    Resolved: <strong>{fmtDate(data.resolvedAt)}</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="grid gap-4 p-5 lg:grid-cols-[1fr_360px]">
              <div className="rounded-2xl border border-black/10 p-4">
                <p className="text-xs font-semibold text-black/60">
                  Your message
                </p>
                <p className="mt-2 text-sm whitespace-pre-wrap">
                  {safe(data.message)}
                </p>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-black/10 p-4">
                  <p className="flex items-center gap-2 text-xs font-semibold text-black/60">
                    <ImageIcon className="h-4 w-4" />
                    Attachments
                    <span className="ml-auto text-[11px]">
                      {data.attachments?.length || 0}
                    </span>
                  </p>
                  <AttachmentGrid attachments={data.attachments} />
                </div>

                <div className="rounded-2xl border border-black/10 bg-gray-50 p-4">
                  <p className="text-xs font-semibold">Note</p>
                  <p className="mt-1 text-sm text-black/70">
                    To add more details, create a new ticket and reference ID:
                    <strong className="ml-1">{data.ticketId}</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-wrap justify-between gap-2 border-t border-black/10 bg-white px-5 py-4">
              <Link href="/profile/support" className="btn-outline">
                <ArrowLeft className="h-4 w-4" /> Back to tickets
              </Link>

              <Link
                href={`/support/track/${encodeURIComponent(data.ticketId)}`}
                className="btn-primary"
              >
                Open tracking <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </>
        )}
      </section>
    </div>

    {/* utility styles */}
    <style jsx>{`
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 999px;
        padding: 4px 10px;
        background: #fff;
      }
      .btn-primary {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 14px;
        border-radius: 12px;
        background: #000;
        color: #fff;
        font-size: 12px;
        font-weight: 600;
      }
      .btn-outline {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 14px;
        border-radius: 12px;
        border: 1px solid rgba(0, 0, 0, 0.15);
        background: #fff;
        font-size: 12px;
        font-weight: 600;
      }
    `}</style>
  </main>
);

}
