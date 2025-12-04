"use client";

import Link from "next/link";

const FAQS = [
  {
    q: "What is Miray Fashion’s Exchange policy? How does it work?",
    a: "Miray Fashion’s 7 days Size Exchange policy gives you the option to exchange items purchased from the website/app for size only within 7 days of receipt of the item. Please ensure the product is unused and preserved in its original condition with tags and packaging intact. You may try the product, but please take measures to keep it in original condition. All exchanges are subject to stock availability.",
  },
  {
    q: "Is there any exchange fee?",
    a: "Yes. For all size exchanges, a nominal exchange fee of INR 99 will be charged and included in the replacement order invoice. This fee helps cover processing and handling costs. The exchange fee is charged only once even if the original order is split and delivered separately.",
  },
  {
    q: "Do you offer returns and refunds?",
    a: "Yes. Miray Fashion offers a 7-day open window for returns from the date of delivery. Returns are no-questions-asked within 7 days, provided the product is unused, in original condition, and has all tags and packaging intact. Refunds are processed after the returned product passes an inspection/verification process.",
  },
  {
    q: "What are the conditions for Exchange/Return?",
    a: "All products must be unused and in original condition with tags and packaging intact. Shoes must be returned in the original shoebox. For set/combo orders, exchange/return must be initiated for the entire set/combo and not individual items. Only the items mentioned in the request will be picked up.",
  },
  {
    q: "When will the Exchange/Return option show in my account?",
    a: "Please allow up to 24 hours post-delivery for the Exchange/Return option to be updated beside your order in your Miray Fashion account.",
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
    a: "Please notify us within 24 hours of delivery by raising a TICKET from your Miray Fashion account. After inspection, we will replace the product(s) with the correct one.",
  },
  {
    q: "When will my pickup for size exchange/return take place?",
    a: "Reverse pickup is typically done in 2–3 working days by our courier partner, subject to service availability in your PINCODE. If reverse pickup is not available in your pincode, you may courier the product(s) to us and we will reimburse courier charges up to INR 250 as applicable.",
  },
  {
    q: "Why did the pickup of my order fail?",
    a: "We make three attempts to pick up the order. If it is not picked up on the third attempt, the pickup request is marked as failed. Please raise a TICKET from your Miray Fashion account, and we will reinitiate the pickup.",
  },
  {
    q: "How do I contact support for an issue?",
    a: "For any issue, please raise a TICKET from your Miray Fashion account. We aim to provide a solution within 48 hours of raising the ticket. You can also reach us via the Contact page.",
  },
];

export default function FAQPage() {
  return (
    <main className="w-full bg-white text-gray-900">
      <section className="w-full px-4 md:px-10 py-10 md:py-14">
        <div className="w-full">
          <div className="flex flex-col gap-2 mb-8">
            <p className="text-xs font-semibold text-[#800020] tracking-widest uppercase">Miray Fashion</p>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">FAQs</h1>
            <p className="text-sm md:text-base text-gray-600">Everything you need to know about exchange, return, pickup, and support.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_330px] gap-8">
            <div className="space-y-4">
              {FAQS.map((f, i) => (
                <details key={i} className="group rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
                  <summary className="cursor-pointer list-none flex items-start justify-between gap-4">
                    <span className="text-sm md:text-base font-semibold text-gray-900">{f.q}</span>
                    <span className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-900 group-open:bg-[#800020] group-open:text-white transition">
                      <span className="block group-open:hidden">+</span>
                      <span className="hidden group-open:block">−</span>
                    </span>
                  </summary>
                  <div className="mt-3 text-sm md:text-base text-gray-700 leading-relaxed">{f.a}</div>
                </details>
              ))}
            </div>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-gray-200 p-5 bg-gray-50">
                <h3 className="text-base font-bold mb-2">Quick Actions</h3>
                <div className="flex flex-col gap-3">
                  <Link href="/profile" className="inline-flex items-center justify-center rounded-full bg-black px-5 py-2 text-sm font-semibold text-white hover:opacity-90 transition">
                    Go to My Account
                  </Link>
                  <Link href="/exchange-and-return" className="inline-flex items-center justify-center rounded-full border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-900 hover:bg-white transition">
                    Read Policy Page
                  </Link>
                  <Link href="/contact" className="inline-flex items-center justify-center rounded-full bg-[#800020] px-5 py-2 text-sm font-semibold text-white hover:opacity-90 transition">
                    Contact Support
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 p-5">
                <h3 className="text-base font-bold mb-2">Timelines</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li><span className="font-semibold">Exchange window:</span> 7 days from delivery</li>
                  <li><span className="font-semibold">Return window:</span> 7 days from delivery</li>
                  <li><span className="font-semibold">Ticket (damage/wrong):</span> within 24 hours</li>
                  <li><span className="font-semibold">Pickup:</span> 2–3 working days (service availability dependent)</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-gray-200 p-5 bg-gray-50">
                <h3 className="text-base font-bold mb-2">Fees</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li><span className="font-semibold">Size exchange fee:</span> INR 99</li>
                  <li><span className="font-semibold">Second exchange fee:</span> INR 250</li>
                  <li><span className="font-semibold">Courier reimbursement:</span> up to INR 250 (if reverse pickup not available)</li>
                </ul>
              </div>
            </aside>
          </div>

          <p className="text-xs text-gray-500 mt-8">
            Miray Fashion reserves the right to amend these terms and conditions at any time. Exchange/return requests are subject to inspection and approval.
          </p>
        </div>
      </section>
    </main>
  );
}
