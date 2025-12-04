"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

const SUPPORT_EMAIL = "support@mirayfashions.com";
const SUPPORT_PHONE_DISPLAY = "(+91) 7303491206";
const SUPPORT_PHONE_TEL = "+917303491206";
const SUPPORT_WHATSAPP = "+917303491206";
const SUPPORT_WHATSAPP_LINK = `https://wa.me/${SUPPORT_WHATSAPP.replace(/\D/g, "")}`;
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function SupportPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", orderId: "", subject: "", issueType: "Order Issue", message: "" });
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const canSubmit = useMemo(() => !!form.name.trim() && !!form.email.trim() && !!form.subject.trim() && !!form.message.trim(), [form]);
  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const onFileChange = (e) => setFiles(Array.from(e.target.files || []).slice(0, 5));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setSubmitted(false);
    setTicketId("");
    setErrorMsg("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      files.forEach((f) => fd.append("files", f)); // backend: upload.array("files", 5)
      const res = await fetch(`${BACKEND}/api/support/tickets`, { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) throw new Error(data?.message || "Failed to submit ticket.");
      setTicketId(String(data.ticketId || ""));
      setSubmitted(true);
      setForm({ name: "", email: "", phone: "", orderId: "", subject: "", issueType: "Order Issue", message: "" });
      setFiles([]);
    } catch (err) {
      setSubmitted(true);
      setErrorMsg(err?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="w-full bg-white text-gray-900">
      <section className="w-full px-4 md:px-10 py-10 md:py-14">
        <div className="w-full">
          <div className="flex flex-col gap-2 mb-8">
            <p className="text-xs font-semibold text-[#800020] tracking-widest uppercase">Miray Fashion</p>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">Support</h1>
            <p className="text-sm md:text-base text-gray-600">Need help with an order, delivery, exchange/return, or product? Reach us below or raise a support ticket.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
            <div className="rounded-2xl border border-gray-200 p-5 md:p-6">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-lg md:text-xl font-bold">Raise a Ticket</h2>
                  <p className="text-sm text-gray-600 mt-1">Submit the form and you’ll get a Ticket ID for tracking.</p>
                </div>
                <Link href="/faq" className="hidden md:inline-flex text-sm font-semibold text-[#800020] hover:opacity-80 transition">View FAQs →</Link>
              </div>

              {submitted && (
                <div className="mb-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
                  {ticketId ? (
                    <>
                      <p className="text-sm text-gray-800 font-semibold">Ticket submitted!</p>
                      <p className="text-sm text-gray-700 mt-1">Your Ticket ID: <span className="font-bold text-[#800020]">{ticketId}</span></p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-gray-800 font-semibold">Couldn’t submit ticket</p>
                      <p className="text-sm text-gray-700 mt-1">{errorMsg || "Please try again or contact support directly."}</p>
                    </>
                  )}
                </div>
              )}

              <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-1">
                  <label className="text-xs font-semibold text-gray-700">Full Name *</label>
                  <input name="name" value={form.name} onChange={onChange} placeholder="Your name" className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#800020]/30 focus:border-[#800020]" />
                </div>

                <div className="md:col-span-1">
                  <label className="text-xs font-semibold text-gray-700">Email *</label>
                  <input name="email" type="email" value={form.email} onChange={onChange} placeholder="you@example.com" className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#800020]/30 focus:border-[#800020]" />
                </div>

                <div className="md:col-span-1">
                  <label className="text-xs font-semibold text-gray-700">Phone (optional)</label>
                  <input name="phone" value={form.phone} onChange={onChange} placeholder="10-digit number" className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#800020]/30 focus:border-[#800020]" />
                </div>

                <div className="md:col-span-1">
                  <label className="text-xs font-semibold text-gray-700">Order ID (optional)</label>
                  <input name="orderId" value={form.orderId} onChange={onChange} placeholder="e.g. MF12345" className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#800020]/30 focus:border-[#800020]" />
                </div>

                <div className="md:col-span-1">
                  <label className="text-xs font-semibold text-gray-700">Issue Type</label>
                  <select name="issueType" value={form.issueType} onChange={onChange} className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#800020]/30 focus:border-[#800020] bg-white">
                    <option>Order Issue</option>
                    <option>Delivery / Shipment</option>
                    <option>Exchange / Return</option>
                    <option>Payment / Refund</option>
                    <option>Product / Quality</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="md:col-span-1">
                  <label className="text-xs font-semibold text-gray-700">Subject *</label>
                  <input name="subject" value={form.subject} onChange={onChange} placeholder="Short summary" className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#800020]/30 focus:border-[#800020]" />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-gray-700">Message *</label>
                  <textarea name="message" value={form.message} onChange={onChange} rows={5} placeholder="Tell us what happened and we’ll help you out…" className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#800020]/30 focus:border-[#800020] resize-y" />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-gray-700">Upload images (optional)</label>
                  <div className="mt-1 flex flex-col gap-2">
                    <input type="file" multiple accept="image/*" onChange={onFileChange} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm bg-white file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-gray-800 hover:file:bg-gray-200" />
                    <p className="text-xs text-gray-500">Up to 5 images.</p>
                    {!!files.length && <p className="text-xs text-gray-700">Selected: <span className="font-semibold">{files.map((f) => f.name).join(", ")}</span></p>}
                  </div>
                </div>

                <div className="md:col-span-2 flex flex-col md:flex-row gap-3 md:items-center md:justify-between mt-2">
                  <p className="text-xs text-gray-500">By submitting, you confirm the information provided is correct.</p>
                  <button type="submit" disabled={!canSubmit || submitting} className={`inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold text-white transition ${!canSubmit || submitting ? "bg-gray-300 cursor-not-allowed" : "bg-[#800020] hover:opacity-90"}`}>{submitting ? "Submitting..." : "Submit Ticket"}</button>
                </div>
              </form>
            </div>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-gray-200 p-5 md:p-6 bg-gray-50">
                <h3 className="text-base font-bold mb-2">Contact</h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-start justify-between gap-3"><span className="font-semibold">Email</span><a href={`mailto:${SUPPORT_EMAIL}`} className="text-[#800020] font-semibold hover:opacity-80 transition">{SUPPORT_EMAIL}</a></div>
                  <div className="flex items-start justify-between gap-3"><span className="font-semibold">Phone</span><a href={`tel:${SUPPORT_PHONE_TEL}`} className="text-[#800020] font-semibold hover:opacity-80 transition">{SUPPORT_PHONE_DISPLAY}</a></div>
                  <div className="flex items-start justify-between gap-3"><span className="font-semibold">WhatsApp</span><a href={SUPPORT_WHATSAPP_LINK} target="_blank" rel="noreferrer" className="text-[#800020] font-semibold hover:opacity-80 transition">{SUPPORT_PHONE_DISPLAY}</a></div>
                </div>
                <div className="mt-4 flex flex-col gap-3">
                  <a href={`mailto:${SUPPORT_EMAIL}`} className="inline-flex items-center justify-center rounded-full bg-black px-5 py-2 text-sm font-semibold text-white hover:opacity-90 transition">Email Support</a>
                  <a href={SUPPORT_WHATSAPP_LINK} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-full bg-[#800020] px-5 py-2 text-sm font-semibold text-white hover:opacity-90 transition">WhatsApp Support</a>
                  <a href={`tel:${SUPPORT_PHONE_TEL}`} className="inline-flex items-center justify-center rounded-full border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-900 hover:bg-white transition">Call Now</a>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 p-5 md:p-6">
                <h3 className="text-base font-bold mb-2">Track / Reference a Ticket</h3>
                <p className="text-sm text-gray-700">You’ll receive a Ticket ID after submission. Use it for tracking and faster support.</p>
                <div className="mt-3 flex flex-col gap-2">
                  <div className="rounded-xl border border-gray-300 px-4 py-3 text-xs text-gray-600 bg-gray-50"><span className="font-semibold text-gray-900">API:</span> GET <span className="font-semibold">/api/support/tickets/:ticketId</span> and GET <span className="font-semibold">/api/support/tickets/by-email?email=...</span></div>
                  <Link href="/faq" className="inline-flex items-center justify-center rounded-full bg-[#800020] px-5 py-2 text-sm font-semibold text-white hover:opacity-90 transition">Read FAQs</Link>
                  <Link href="/exchange-and-return" className="inline-flex items-center justify-center rounded-full border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-900 hover:bg-white transition">Exchange &amp; Return Policy</Link>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 p-5 md:p-6 bg-gray-50">
                <h3 className="text-base font-bold mb-2">Tips for Faster Resolution</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                  <li>Share your <span className="font-semibold">Order ID</span> (if available).</li>
                  <li>Upload clear images of the issue (tags visible if needed).</li>
                  <li>Mention exact product name/variant (size/color).</li>
                  <li>For damaged/wrong items, raise a ticket within <span className="font-semibold">24 hours</span> of delivery.</li>
                </ul>
              </div>
            </aside>
          </div>

          <p className="text-xs text-gray-500 mt-8">Miray Fashion support team will respond as soon as possible. For urgent issues, call or WhatsApp us directly.</p>
        </div>
      </section>
    </main>
  );
}
