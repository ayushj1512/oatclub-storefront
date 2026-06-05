"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { InfoCallout, InfoPageLayout, InfoTable } from "@/components/info/InfoPageLayout";
import useSupportTicketStore from "@/store/useSupportTicketStore";

const SUPPORT_EMAIL = "hey@oatclub.in";

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
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const { createTicket, submitting, error: storeError } = useSupportTicketStore();

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

  const onChange = (event) =>
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit || submitting) return;

    setSubmitted(false);
    setErrorMsg("");
    setTicketId("");

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, value]) => fd.append(key, value));
      files.forEach((file) => fd.append("files", file));

      const id = await createTicket(fd);
      setTicketId(id);
      setSubmitted(true);
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
      setErrorMsg(err?.message || "SOMETHING WENT WRONG. PLEASE TRY AGAIN.");
    }
  };

  return (
    <InfoPageLayout
      activePath="/support"
      title="Support"
      intro="Need help with an order, delivery, exchange, return, payment, or product issue? Raise a ticket with the useful details."
      aside={
        <>
          <InfoCallout
            label="DIRECT EMAIL"
            title="WE REPLY WITHIN 24-48 HOURS"
            body="For fastest help, include your order number and clear photos if needed."
            action={{ href: `mailto:${SUPPORT_EMAIL}`, label: "EMAIL SUPPORT" }}
          />
          <InfoCallout
            label="SELF SERVE"
            title="MOST ANSWERS ARE IN FAQS"
            body="Sizing, returns, shipping and refunds are explained in simple terms."
            action={{ href: "/faq", label: "READ FAQS" }}
          />
        </>
      }
    >
      <InfoTable
        rows={[
          ["Support Email", SUPPORT_EMAIL],
          ["Reply Time", "24-48 weekday hours"],
          ["Best Detail", "Order number + issue summary"],
          ["Images", "Upload up to 5 if useful"],
        ]}
      />

      <section className="border border-black/10 bg-white p-3 md:p-5">
        <div className="mb-3 flex items-start justify-between gap-4 border-b border-black/10 pb-3 md:mb-4 md:pb-4">
          <div>
            <p className="text-[8.5px] font-black uppercase tracking-[0.2em] text-black/40 md:text-[9px] md:tracking-[0.24em]">
              TICKET FORM
            </p>
            <h2 className="mt-1 text-base font-black uppercase md:text-lg">RAISE A TICKET</h2>
          </div>
          <Link
            href="/faq"
            className="hidden text-[9px] font-black uppercase tracking-[0.18em] underline underline-offset-4 md:block"
          >
            FAQS
          </Link>
        </div>

        {submitted ? (
          <div className="mb-3 border border-black/10 bg-[#fbfbfb] p-3 text-[10px] font-bold uppercase leading-5 tracking-[0.05em] md:mb-4 md:text-xs md:tracking-[0.06em]">
            {ticketId ? (
              <p>
                TICKET SUBMITTED: <span className="font-black text-black">{ticketId}</span>
              </p>
            ) : (
              <p className="text-red-600">{errorMsg || storeError}</p>
            )}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-2.5 md:grid-cols-2 md:gap-3">
          <Field name="name" label="FULL NAME *" value={form.name} onChange={onChange} />
          <Field name="email" label="EMAIL *" type="email" value={form.email} onChange={onChange} />
          <Field name="phone" label="PHONE" value={form.phone} onChange={onChange} />
          <Field name="orderId" label="ORDER ID" value={form.orderId} onChange={onChange} />

          <label className="block">
            <span className="text-[8.5px] font-black uppercase tracking-[0.16em] text-black/45 md:text-[9px] md:tracking-[0.18em]">
              ISSUE TYPE
            </span>
            <select
              name="issueType"
              value={form.issueType}
              onChange={onChange}
              className="mt-1 h-10 w-full border border-black/10 bg-white px-3 text-[10px] font-bold uppercase tracking-[0.08em] outline-none focus:border-black md:h-11 md:text-[11px] md:tracking-[0.1em]"
            >
              <option>Order Issue</option>
              <option>Delivery / Shipment</option>
              <option>Exchange / Return</option>
              <option>Payment / Refund</option>
              <option>Product / Quality</option>
              <option>Other</option>
            </select>
          </label>

          <Field name="subject" label="SUBJECT *" value={form.subject} onChange={onChange} />

          <label className="block md:col-span-2">
            <span className="text-[8.5px] font-black uppercase tracking-[0.16em] text-black/45 md:text-[9px] md:tracking-[0.18em]">
              MESSAGE *
            </span>
            <textarea
              name="message"
              value={form.message}
              onChange={onChange}
              rows={4}
              placeholder="DESCRIBE THE ISSUE CLEARLY"
              className="mt-1 w-full resize-y border border-black/10 bg-white px-3 py-2.5 text-[11px] font-bold uppercase leading-5 tracking-[0.06em] outline-none placeholder:text-black/30 focus:border-black md:py-3 md:text-xs md:tracking-[0.08em]"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-[8.5px] font-black uppercase tracking-[0.16em] text-black/45 md:text-[9px] md:tracking-[0.18em]">
              UPLOAD IMAGES
            </span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(event) => setFiles(Array.from(event.target.files || []).slice(0, 5))}
              className="mt-1 w-full min-w-0 border border-black/10 bg-white px-2 py-2 text-[9px] font-bold uppercase tracking-[0.05em] file:mr-2 file:border-0 file:bg-black file:px-2.5 file:py-2 file:text-[8px] file:font-black file:uppercase file:tracking-[0.1em] file:text-white md:px-3 md:text-[10px] md:tracking-[0.08em] md:file:mr-3 md:file:px-3 md:file:text-[9px] md:file:tracking-[0.14em]"
            />
          </label>

          <div className="flex flex-col gap-3 border-t border-black/10 pt-3 md:col-span-2 md:flex-row md:items-center md:justify-between md:pt-4">
            <p className="text-[9.5px] font-bold uppercase leading-4 tracking-[0.06em] text-black/45 md:text-[10px] md:leading-5 md:tracking-[0.08em]">
              Please make sure the information is accurate before submitting.
            </p>
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="flex h-10 w-full items-center justify-center gap-2 bg-black px-5 text-[9.5px] font-black uppercase tracking-[0.18em] text-white disabled:bg-neutral-300 md:h-11 md:w-auto md:text-[10px] md:tracking-[0.2em]"
            >
              {submitting ? "SUBMITTING" : "SUBMIT TICKET"}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </form>
      </section>

      <a
        href={`mailto:${SUPPORT_EMAIL}`}
        className="flex h-10 items-center justify-center gap-2 border border-black text-[9.5px] font-black uppercase tracking-[0.16em] text-black md:h-11 md:text-[10px] md:tracking-[0.18em]"
      >
        <Mail className="h-4 w-4" />
        EMAIL OATCLUB DIRECTLY
      </a>
    </InfoPageLayout>
  );
}

function Field({ name, label, value, onChange, type = "text" }) {
  return (
    <label className="block">
      <span className="text-[8.5px] font-black uppercase tracking-[0.16em] text-black/45 md:text-[9px] md:tracking-[0.18em]">
        {label}
      </span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className="mt-1 h-10 w-full border border-black/10 bg-white px-3 text-[10px] font-bold uppercase tracking-[0.08em] outline-none placeholder:text-black/30 focus:border-black md:h-11 md:text-[11px] md:tracking-[0.1em]"
      />
    </label>
  );
}
