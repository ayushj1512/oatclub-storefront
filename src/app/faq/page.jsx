"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  InfoCallout,
  InfoPageLayout,
  InfoTable,
} from "@/components/info/InfoPageLayout";
import { FAQ_SECTIONS } from "@/data/faqData";

export default function FAQPage() {
  const [query, setQuery] = useState("");

  const sections = useMemo(() => {
    const value = query.trim().toLowerCase();

    if (!value) return FAQ_SECTIONS;

    return FAQ_SECTIONS.map((section) => ({
      ...section,
      items: section.items.filter(({ question, answer }) =>
        `${question} ${answer}`.toLowerCase().includes(value)
      ),
    })).filter((section) => section.items.length);
  }, [query]);

  let faqNumber = 0;

  return (
    <InfoPageLayout
      activePath="/faq"
      title="FAQs"
      intro="Quick answers for sizing, delivery, payments, orders, returns and everything OATCLUB."
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
            body="Send your order number and a short note. We reply within 24–48 weekday hours."
            action={{ href: "mailto:hey@oatclub.in", label: "EMAIL US" }}
          />
        </>
      }
    >
      <InfoTable
        rows={[
          ["Shipping", "Free on eligible prepaid orders"],
          ["Delivery", "Usually 3–5 working days"],
          ["Return Window", "7 days from delivery"],
          ["Support Email", "hey@oatclub.in"],
        ]}
      />

      <div className="border border-black/10 bg-white p-3 md:p-4">
        <label
          htmlFor="faq-search"
          className="mb-2 block text-[9px] font-black uppercase tracking-[0.18em] text-black/45"
        >
          Search FAQs
        </label>
        <input
          id="faq-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Try: return, COD, size, delivery..."
          className="h-11 w-full border border-black/15 bg-white px-3 text-sm font-medium outline-none transition focus:border-black"
        />
      </div>

      <div className="space-y-7">
        {sections.map((section) => (
          <section key={section.title}>
            <div className="mb-2 flex items-center gap-3">
              <h2 className="text-[11px] font-black uppercase tracking-[0.16em] md:text-xs">
                {section.title}
              </h2>
              <span className="h-px flex-1 bg-black/10" />
              <span className="text-[9px] font-black text-black/35">
                {section.items.length}
              </span>
            </div>

            <div className="space-y-2">
              {section.items.map(({ question, answer }) => {
                faqNumber += 1;

                return (
                  <details
                    key={question}
                    className="group border border-black/10 bg-white"
                  >
                    <summary className="flex cursor-pointer list-none items-start gap-2.5 px-3 py-3 md:items-center md:gap-3 md:px-4 md:py-4">
                      <span className="pt-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-black/35 md:pt-0 md:text-[10px] md:tracking-[0.18em]">
                        {String(faqNumber).padStart(2, "0")}
                      </span>

                      <span className="min-w-0 flex-1 text-[12px] font-black uppercase leading-5 tracking-[0.035em] md:text-sm md:tracking-[0.04em]">
                        {question}
                      </span>

                      <span className="ml-auto shrink-0 text-base leading-none group-open:hidden md:text-lg">
                        +
                      </span>
                      <span className="ml-auto hidden shrink-0 text-base leading-none group-open:block md:text-lg">
                        −
                      </span>
                    </summary>

                    <div className="border-t border-black/10 px-3 py-3 text-[13px] font-medium leading-6 text-black/65 md:px-4 md:py-4 md:text-sm md:leading-7">
                      {answer}
                    </div>
                  </details>
                );
              })}
            </div>
          </section>
        ))}

        {!sections.length && (
          <div className="border border-black/10 bg-white p-6 text-center">
            <p className="text-sm font-black uppercase tracking-[0.08em]">
              No matching FAQ found
            </p>
            <p className="mt-2 text-sm font-medium text-black/55">
              Email hey@oatclub.in and we will help.
            </p>
          </div>
        )}
      </div>

      <div className="border border-black bg-black p-3.5 text-white md:p-4">
        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/50 md:text-[10px] md:tracking-[0.22em]">
          NEED POLICY DETAILS?
        </p>

        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Link
            href="/exchange-and-return"
            className="flex h-9 items-center justify-center border border-white/25 px-3 text-[8.5px] font-black uppercase tracking-[0.14em] md:text-[9px] md:tracking-[0.16em]"
          >
            Exchange & Return
          </Link>

          <Link
            href="/shipping-policy"
            className="flex h-9 items-center justify-center border border-white/25 px-3 text-[8.5px] font-black uppercase tracking-[0.14em] md:text-[9px] md:tracking-[0.16em]"
          >
            Shipping
          </Link>
        </div>
      </div>
    </InfoPageLayout>
  );
}
