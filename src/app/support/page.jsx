  "use client";

  import { useMemo, useState } from "react";
  import Link from "next/link";
  import useSupportTicketStore from "@/store/useSupportTicketStore";

  const SUPPORT_EMAIL = "support@oatclub.in";
  const SUPPORT_PHONE_DISPLAY = "(+91) 7303491206";
  const SUPPORT_PHONE_TEL = "+917303491206";
  const SUPPORT_WHATSAPP = "+917303491206";
  const SUPPORT_WHATSAPP_LINK = `https://wa.me/${SUPPORT_WHATSAPP.replace(/\D/g, "")}`;

  export default function SupportPage() {
    const [form, setForm] = useState({
      name: "",
      email: "",
      phone: "",
      orderId: "",
      subject: "",
      issueType: "Order Issue",
      message: "",
    });

  const [files, setFiles] = useState([]);
  const {
    createTicket,
    submitting,
    error: storeError,
  } = useSupportTicketStore();
    const [submitted, setSubmitted] = useState(false);
    const [ticketId, setTicketId] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const canSubmit = useMemo(
      () =>
        Boolean(
          form.name.trim() &&
            form.email.trim() &&
            form.subject.trim() &&
            form.message.trim()
        ),
      [form]
    );

  const onChange = (e) =>
      setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onFileChange = (e) =>
      setFiles(Array.from(e.target.files || []).slice(0, 5));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    setSubmitted(false);
    setErrorMsg("");
    setTicketId("");

    try {
      const fd = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        fd.append(key, value);
      });

      files.forEach((file) => {
        fd.append("files", file);
      });

      const id = await createTicket(fd);

      setTicketId(id);
      setSubmitted(true);

      // reset form
      setForm({
        name: "",
        email: "",
        phone: "",
        orderId: "",
        subject: "",
        issueType: "Order Issue",
        message: "",
      });
      setFiles([]);
    } catch (err) {
      setSubmitted(true);
      setErrorMsg(err?.message || "Something went wrong. Please try again.");
    }
  };


    return (
      <main className="w-full bg-white text-gray-900">
        <section className="px-4 md:px-10 py-12 md:py-16 mx-auto">

          {/* Header */}
          <header className="mb-10 space-y-2">
            <p className="text-xs font-medium tracking-[0.25em] uppercase text-gray-500">
              OATCLUB
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Support
            </h1>
            <p className="text-gray-600 max-w-2xl">
              Need help with an order, delivery, exchange, or product?
              Submit a ticket or reach us directly.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">

            {/* Ticket Form */}
            <section className="rounded-2xl border border-gray-200 p-6 md:p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">Raise a Ticket</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    You’ll receive a Ticket ID for tracking.
                  </p>
                </div>
                <Link
                  href="/faq"
                  className="hidden md:inline text-sm font-medium text-gray-900 underline underline-offset-4"
                >
                  FAQs
                </Link>
              </div>

              {submitted && (
                <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
                  {ticketId ? (
                    <>
                      <p className="font-semibold text-sm">Ticket submitted</p>
                      <p className="text-sm text-gray-700 mt-1">
                        Ticket ID:{" "}
                        <span className="font-bold text-black">{ticketId}</span>
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-sm">Submission failed</p>
                      <p className="text-sm text-gray-600 mt-1">{errorMsg || storeError}
  </p>
                    </>
                  )}
                </div>
              )}

              <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {[
                  ["name", "Full Name *", "Your name"],
                  ["email", "Email *", "you@example.com"],
                  ["phone", "Phone (optional)", "10-digit number"],
                  ["orderId", "Order ID (optional)", "MF12345"],
                ].map(([name, label, placeholder]) => (
                  <div key={name}>
                    <label className="text-xs font-semibold text-gray-700">
                      {label}
                    </label>
                    <input
                      name={name}
  value={form[name]}
                      onChange={onChange}
                      placeholder={placeholder}
                      className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black/10 focus:border-black"
                    />
                  </div>
                ))}

                <div>
                  <label className="text-xs font-semibold text-gray-700">
                    Issue Type
                  </label>
                  <select
                    name="issueType"
                    value={form.issueType}
                    onChange={onChange}
                    className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-black/10"
                  >
                    <option>Order Issue</option>
                    <option>Delivery / Shipment</option>
                    <option>Exchange / Return</option>
                    <option>Payment / Refund</option>
                    <option>Product / Quality</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700">
                    Subject *
                  </label>
                  <input
                    name="subject"
                    value={form.subject}
                    onChange={onChange}
                    placeholder="Short summary"
                    className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-black/10"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-gray-700">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={onChange}
                    rows={5}
                    placeholder="Describe the issue clearly…"
                    className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm resize-y focus:ring-2 focus:ring-black/10"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-gray-700">
                    Upload images (optional)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={onFileChange}
                    className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm bg-white file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-semibold"
                  />
                </div>

                <div className="md:col-span-2 flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">
                    Please ensure the information is accurate.
                  </p>
                  <button
                    type="submit"
                    disabled={!canSubmit || submitting}
                    className={`rounded-full px-6 py-2.5 text-sm font-semibold transition
                      ${
                        !canSubmit || submitting
                          ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                          : "bg-black text-white hover:opacity-90"
                      }`}
                  >
                    {submitting ? "Submitting…" : "Submit Ticket"}
                  </button>
                </div>
              </form>
            </section>

            {/* Contact Sidebar */}
            <aside className="space-y-6">

              <div className="rounded-2xl border border-gray-200 p-6 bg-gray-50">
                <h3 className="font-bold mb-4">Contact</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Email</span>
                    <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold">
                      {SUPPORT_EMAIL}
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span>Phone</span>
                    <a href={`tel:${SUPPORT_PHONE_TEL}`} className="font-semibold">
                      {SUPPORT_PHONE_DISPLAY}
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span>WhatsApp</span>
                    <a href={SUPPORT_WHATSAPP_LINK} className="font-semibold">
                      {SUPPORT_PHONE_DISPLAY}
                    </a>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="block text-center rounded-full bg-black text-white py-2 text-sm font-semibold"
                  >
                    Email Support
                  </a>
                  <a
                    href={SUPPORT_WHATSAPP_LINK}
                    className="block text-center rounded-full border border-gray-300 py-2 text-sm font-semibold"
                  >
                    WhatsApp Support
                  </a>
                </div>
              </div>

            </aside>
          </div>
        </section>
      </main>
    );
  }

