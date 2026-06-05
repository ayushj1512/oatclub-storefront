"use client";

import Link from "next/link";
import { InfoCallout, InfoPageLayout, InfoTable } from "@/components/info/InfoPageLayout";

const FAQS = [
  [
    "How do I know what size to order?",
    "Check the size guide on each product page. When in doubt, size up. Our fits are designed with a relaxed silhouette anyway.",
  ],
  [
    "Do the colours look the same IRL?",
    "We shoot in natural light and do not over-edit. What you see is pretty much what you get, though screens can vary slightly.",
  ],
  [
    "Can I change my order after placing it?",
    "Hit us up ASAP at hey@oatclub.in. If it has not packed yet, we will sort it. Once it is out the door, it gets trickier.",
  ],
  [
    "Is the fabric sustainable?",
    "We are constantly working on this. We prioritise quality natural fabrics and responsible sourcing wherever possible.",
  ],
  [
    "How do I start a return or exchange?",
    "Email us at hey@oatclub.in with your order number and reason, or raise a request from your account where available.",
  ],
];

export default function FAQPage() {
  return (
    <InfoPageLayout
      activePath="/faq"
      title="FAQs"
      intro="Quick answers for sizing, colours, order edits, returns and the usual pre-checkout questions."
      aside={
        <>
          <InfoCallout
            label="FASTEST ROUTE"
            title="CHECK YOUR ACCOUNT FIRST"
            body="Order actions and status updates are easiest from your OATCLUB profile."
            action={{ href: "/profile", label: "GO TO PROFILE" }}
          />
          <InfoCallout
            label="STILL STUCK?"
            title="WE ARE ACTUALLY HERE"
            body="Send your order number and a short note. We reply within 24-48 weekday hours."
            action={{ href: "mailto:hey@oatclub.in", label: "EMAIL US" }}
          />
        </>
      }
    >
      <InfoTable
        rows={[
          ["Size Help", "Use the product size guide"],
          ["Order Change", "Email ASAP before packing"],
          ["Return Window", "7 days from delivery"],
          ["Support Email", "hey@oatclub.in"],
        ]}
      />

      <div className="space-y-2">
        {FAQS.map(([question, answer], index) => (
          <details key={question} className="group border border-black/10 bg-white">
            <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-4">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-black/35">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-sm font-black uppercase leading-5 tracking-[0.04em]">
                {question}
              </span>
              <span className="ml-auto text-lg leading-none group-open:hidden">+</span>
              <span className="ml-auto hidden text-lg leading-none group-open:block">-</span>
            </summary>
            <div className="border-t border-black/10 px-4 py-4 text-sm font-medium leading-7 text-black/65">
              {answer}
            </div>
          </details>
        ))}
      </div>

      <div className="border border-black bg-black p-4 text-white">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/50">
          NEED POLICY DETAILS?
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/exchange-and-return" className="border border-white/25 px-3 py-2 text-[9px] font-black uppercase tracking-[0.16em]">
            Exchange & Return
          </Link>
          <Link href="/shipping-policy" className="border border-white/25 px-3 py-2 text-[9px] font-black uppercase tracking-[0.16em]">
            Shipping
          </Link>
        </div>
      </div>
    </InfoPageLayout>
  );
}
