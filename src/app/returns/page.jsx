"use client";

import Link from "next/link";

export default function ExchangeAndReturnPage() {
  return (
    <main className="bg-white text-gray-900">
      <section className="max-w-7xl mx-auto px-4 md:px-10 py-12 md:py-16">

        {/* Header */}
        <header className="mb-12 space-y-3">
       <p className="text-xs font-medium tracking-[0.25em] uppercase text-gray-500">
  Miray Fashions
</p>

          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Exchange & Return Policy
          </h1>
          <p className="max-w-2xl text-gray-600">
            Understand our size exchange, return timelines, applicable fees,
            and how to raise a request.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">

          {/* MAIN CONTENT */}
          <article className="space-y-10">

            {/* Highlights */}
            <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
              <h2 className="font-bold mb-3">Quick Highlights</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li><strong>7-day window</strong> from delivery for exchange & return</li>
                <li><strong>Size exchange only</strong> (subject to availability)</li>
                <li><strong>No-questions-asked return</strong> within 7 days</li>
                <li><strong>Exchange fee:</strong> INR 99 (once per order)</li>
                <li><strong>Second exchange:</strong> INR 250</li>
                <li><strong>Damaged / wrong item:</strong> ticket within 24 hours</li>
              </ul>
            </section>

            {/* Exchange */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold">Size Exchange</h2>
              <p className="text-gray-700">
                You may request a <strong>size exchange within 7 days</strong> of
                delivery. Products must be unused, with tags and original
                packaging intact. Trial is allowed if condition is preserved.
              </p>
              <p className="text-gray-700">
                A <strong>nominal fee of INR 99</strong> applies to cover logistics
                and handling. Charged once per order even if delivered in parts.
              </p>
            </section>

            <hr className="border-gray-200" />

            {/* Return */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold">Returns (7-Day Window)</h2>
              <p className="text-gray-700">
                Returns can be raised within <strong>7 days of delivery</strong>.
                Reverse pickup will be arranged where serviceable.
              </p>

              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>Unused products with tags & original packaging</li>
                <li>Entire set/combos must be returned together</li>
                <li>Pickup subject to courier serviceability</li>
              </ul>

              <p className="text-gray-700">
                Refunds are processed after quality inspection to the original
                payment method or store credit (as applicable).
              </p>
            </section>

            <hr className="border-gray-200" />

            {/* Terms */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold">Important Conditions</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>Only items mentioned in the request will be picked up</li>
                <li>Mismatched products may lead to pickup cancellation</li>
                <li>Proper images with tags are mandatory while raising requests</li>
                <li>Reverse pickup depends on pincode serviceability</li>
              </ul>
            </section>

            <hr className="border-gray-200" />

            {/* Special cases */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold">Special Cases</h2>
              <p className="text-gray-700">
                <strong>Second exchange</strong> (if requested) will be charged
                <strong> INR 250</strong>.
              </p>
              <p className="text-gray-700">
                For <strong>damaged, defective, or wrong items</strong>, raise a
                ticket within <strong>24 hours</strong> of delivery.
              </p>
              <p className="text-gray-700">
                Reverse pickup usually occurs within <strong>2–3 working days</strong>.
                Non-serviceable pincodes may require self-shipping (reimbursed up
                to INR 250).
              </p>
            </section>

            {/* Support */}
            <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6 space-y-4">
              <h2 className="font-bold">Need Help?</h2>
              <p className="text-gray-700">
                Please raise a ticket from your Miray Fashion account. Our team
                aims to resolve concerns within <strong>48 hours</strong>.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
                >
                  Contact Support
                </Link>
                <Link
                  href="/profile"
                  className="rounded-full border border-gray-300 px-5 py-2 text-sm font-semibold"
                >
                  My Account
                </Link>
              </div>
            </section>

            <p className="text-xs text-gray-500">
              Miray Fashion reserves the right to amend this policy at any time.
              All requests are subject to inspection and approval.
            </p>
          </article>

          {/* SIDEBAR */}
          <aside className="space-y-6">

            <div className="rounded-2xl border border-gray-200 p-6">
              <h3 className="font-bold mb-3">Key Timelines</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li><strong>Exchange / Return:</strong> 7 days</li>
                <li><strong>Damage ticket:</strong> 24 hours</li>
                <li><strong>Pickup attempts:</strong> Up to 3</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
              <h3 className="font-bold mb-3">Fees</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li><strong>Exchange:</strong> INR 99</li>
                <li><strong>Second exchange:</strong> INR 250</li>
                <li><strong>Courier reimbursement:</strong> Up to INR 250</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-gray-200 p-6">
              <h3 className="font-bold mb-2">Raise a Request</h3>
              <p className="text-sm text-gray-700 mb-3">
                Submit exchange, return, or ticket requests from your account.
              </p>
              <Link
                href="/profile"
                className="block text-center rounded-full bg-black px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                Go to My Account
              </Link>
            </div>

          </aside>
        </div>
      </section>
    </main>
  );
}
