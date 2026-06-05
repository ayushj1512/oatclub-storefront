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
            <summary className="flex cursor-pointer list-none items-start gap-2.5 px-3 py-3 md:items-center md:gap-3 md:px-4 md:py-4">
              <span className="pt-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-black/35 md:pt-0 md:text-[10px] md:tracking-[0.18em]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1 text-[12px] font-black uppercase leading-5 tracking-[0.035em] md:text-sm md:tracking-[0.04em]">
                {question}
              </span>
              <span className="ml-auto shrink-0 text-base leading-none group-open:hidden md:text-lg">+</span>
              <span className="ml-auto hidden shrink-0 text-base leading-none group-open:block md:text-lg">-</span>
            </summary>
            <div className="border-t border-black/10 px-3 py-3 text-[13px] font-medium leading-6 text-black/65 md:px-4 md:py-4 md:text-sm md:leading-7">
              {answer}
            </div>
          </details>
        ))}
      </div>

      <div className="border border-black bg-black p-3.5 text-white md:p-4">
        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/50 md:text-[10px] md:tracking-[0.22em]">
          NEED POLICY DETAILS?
        </p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Link href="/exchange-and-return" className="flex h-9 items-center justify-center border border-white/25 px-3 text-[8.5px] font-black uppercase tracking-[0.14em] md:text-[9px] md:tracking-[0.16em]">
            Exchange & Return
          </Link>
          <Link href="/shipping-policy" className="flex h-9 items-center justify-center border border-white/25 px-3 text-[8.5px] font-black uppercase tracking-[0.14em] md:text-[9px] md:tracking-[0.16em]">
            Shipping
          </Link>
        </div>
      </div>
    </InfoPageLayout>
  );
}
