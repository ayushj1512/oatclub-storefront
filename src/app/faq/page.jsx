"use client";

import Link from "next/link";

const FAQS = [
  {
    q: "What is OATCLUB’s Exchange policy? How does it work?",
    a: "OATCLUB’s 7 days Size Exchange policy gives you the option to exchange items purchased from the website/app for size only within 7 days of receipt of the item. Please ensure the product is unused and preserved in its original condition with tags and packaging intact. You may try the product, but please take measures to keep it in original condition. All exchanges are subject to stock availability.",
  },
  {
    q: "Is there any exchange fee?",
    a: "Yes. For all size exchanges, a nominal exchange fee of INR 99 will be charged and included in the replacement order invoice. This fee helps cover processing and handling costs. The exchange fee is charged only once even if the original order is split and delivered separately.",
  },
  {
    q: "Do you offer returns and refunds?",
    a: "Yes. OATCLUB offers a 7-day open window for returns from the date of delivery. Returns are no-questions-asked within 7 days, provided the product is unused, in original condition, and has all tags and packaging intact. Refunds are processed after the returned product passes an inspection/verification process.",
  },
  {
    q: "What are the conditions for Exchange/Return?",
    a: "All products must be unused and in original condition with tags and packaging intact. Shoes must be returned in the original shoebox. For set/combo orders, exchange/return must be initiated for the entire set/combo and not individual items. Only the items mentioned in the request will be picked up.",
  },
  {
    q: "When will the Exchange/Return option show in my account?",
    a: "Please allow up to 24 hours post-delivery for the Exchange/Return option to be updated beside your order in your OATCLUB account.",
  },
  {
    q: "Will the courier pick up any product I give them?",
    a: "No. Our courier partner will pick up only the product(s) mentioned at the time of submitting the exchange/return request. If the item handed over doesn’t match the request, pickup may be cancelled by the courier executive.",
  },
  {
    q: "Do I need to upload images while raising an exchange/return?",
    a: "Yes. Proper images of the product(s) with tags should be uploaded while initiating the exchange/return request. Invalid images can lead to rejection of the request.",
  },
  {
    q: "Can I exchange/return a set or combo partially?",
    a: "No. Any exchange/return request for a set/combo must be carried out for the entire set/combo. Individual items from a set/combo cannot be exchanged/returned separately.",
  },
  {
    q: "How do I raise a second size exchange request?",
    a: "We do not have a second size exchange policy by default. However, if you still want to initiate a second exchange, an exchange fee of INR 250 will be applicable.",
  },
  {
    q: "What should I do if I receive a damaged/defective/incomplete/wrong order?",
    a: "Please notify us within 24 hours of delivery by raising a TICKET from your OATCLUB account. After inspection, we will replace the product(s) with the correct one.",
  },
  {
    q: "When will my pickup for size exchange/return take place?",
    a: "Reverse pickup is typically done in 2–3 working days by our courier partner, subject to service availability in your PINCODE. If reverse pickup is not available in your pincode, you may courier the product(s) to us and we will reimburse courier charges up to INR 250 as applicable.",
  },
  {
    q: "Why did the pickup of my order fail?",
    a: "We make three attempts to pick up the order. If it is not picked up on the third attempt, the pickup request is marked as failed. Please raise a TICKET from your OATCLUB account, and we will reinitiate the pickup.",
  },
  {
    q: "How do I contact support for an issue?",
    a: "For any issue, please raise a TICKET from your OATCLUB account. We aim to provide a solution within 48 hours of raising the ticket. You can also reach us via the Contact page.",
  },
];

export default function FAQPage() {
return (
  <main className="w-full bg-white text-black">
    <section className="w-full px-4 md:px-10 py-16">
      <div className="mx-auto max-w-7xl">

        {/* ================= HEADER ================= */}
        <div className="mb-14 max-w-3xl">
          <p className="text-[11px] font-semibold tracking-[0.35em] uppercase text-black/60">
            OATCLUB · Help
          </p>

          <h1 className="mt-4 text-3xl md:text-5xl font-extrabold tracking-tight">
            Frequently Asked Questions
          </h1>

          <p className="mt-4 text-base md:text-lg leading-relaxed text-black/70">
            Clear answers about exchanges, returns, pickups, and customer support —
            designed to save you time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12">

          {/* ================= FAQ LIST ================= */}
          <div className="space-y-4">
            {FAQS.map((f, i) => (
              <details
                key={i}
                className="group rounded-3xl border border-black/10 bg-white p-6 md:p-7 transition hover:border-black/20"
              >
                <summary className="flex cursor-pointer list-none items-start gap-4">
                  <span className="text-sm md:text-base font-semibold leading-snug">
                    {f.q}
                  </span>

                  <span className="ml-auto inline-flex h-9 w-9 flex-none items-center justify-center rounded-full border border-black/10 text-black/70 transition group-open:bg-black group-open:text-white">
                    <span className="block group-open:hidden">+</span>
                    <span className="hidden group-open:block">−</span>
                  </span>
                </summary>

                <div className="mt-4 text-sm md:text-base leading-relaxed text-black/70">
                  {f.a}
                </div>
              </details>
            ))}
          </div>

          {/* ================= SIDEBAR ================= */}
          <aside className="space-y-6 lg:sticky lg:top-24 h-fit">

            {/* Quick Actions */}
            <div className="rounded-3xl border border-black/10 bg-white p-6">
              <h3 className="mb-4 text-xs font-bold tracking-widest uppercase text-black/50">
                Quick Actions
              </h3>

              <div className="flex flex-col gap-3">
                <Link
                  href="/profile"
                  className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition"
                >
                  Go to My Account
                </Link>

                <Link
                  href="/exchange-and-return"
                  className="inline-flex items-center justify-center rounded-full border border-black px-6 py-3 text-sm font-semibold hover:bg-black hover:text-white transition"
                >
                  Exchange & Return Policy
                </Link>

                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-full border border-black/20 px-6 py-3 text-sm font-semibold hover:border-black transition"
                >
                  Contact Support
                </Link>
              </div>
            </div>

            {/* Timelines */}
            <div className="rounded-3xl border border-black/10 bg-white p-6">
              <h3 className="mb-4 text-xs font-bold tracking-widest uppercase text-black/50">
                Timelines
              </h3>

              <ul className="space-y-3 text-sm text-black/75">
                <li>
                  <span className="font-semibold">Exchange window:</span> 7 days from delivery
                </li>
                <li>
                  <span className="font-semibold">Return window:</span> 7 days from delivery
                </li>
                <li>
                  <span className="font-semibold">Damage / wrong item:</span> within 24 hours
                </li>
                <li>
                  <span className="font-semibold">Pickup:</span> 2–3 working days
                </li>
              </ul>
            </div>

            {/* Fees */}
            <div className="rounded-3xl border border-black/10 bg-white p-6">
              <h3 className="mb-4 text-xs font-bold tracking-widest uppercase text-black/50">
                Fees
              </h3>

              <ul className="space-y-3 text-sm text-black/75">
                <li>
                  <span className="font-semibold">Size exchange:</span> ₹99
                </li>
                <li>
                  <span className="font-semibold">Second exchange:</span> ₹250
                </li>
                <li>
                  <span className="font-semibold">Courier reimbursement:</span> up to ₹250
                </li>
              </ul>
            </div>

          </aside>
        </div>

        {/* ================= FOOTER NOTE ================= */}
        <p className="mt-14 max-w-4xl text-xs leading-relaxed text-black/50">
          OATCLUB reserves the right to update these FAQs at any time.
          Exchange and return requests are subject to inspection and approval.
        </p>

      </div>
    </section>
  </main>
);

}

