"use client";

import Link from "next/link";

export default function TermsAndConditionsPage() {
  return (
    <main className="w-full bg-white text-gray-900">
      <section className="w-full px-4 md:px-10 py-10 md:py-14">
        <div className="w-full max-w-[1200px] mx-auto">
          {/* HEADER */}
          <div className="flex flex-col gap-2 mb-10">
            <p className="text-xs font-semibold tracking-widest uppercase text-gray-500">
              Miray Fashions
            </p>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-black">
              Terms &amp; Conditions
            </h1>
            <p className="text-sm md:text-base text-gray-600 max-w-2xl">
              These terms govern your access to and use of Miray Fashions’ website,
              products, and services.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
            {/* CONTENT */}
            <div className="space-y-8">
              {/* INTRO */}
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
                <p className="text-sm md:text-base text-gray-700">
                  By accessing or using Miray Fashions’ website or services, you
                  agree to be bound by the Terms &amp; Conditions outlined below.
                  If you do not agree, please refrain from using our platform.
                </p>
              </div>

              {/* SECTIONS */}
              {[
                {
                  title: "1. About Miray Fashions",
                  content:
                    "“Miray Fashions”, “we”, “us”, and “our” refer to Miray Fashions and its services. “You” refers to any user, visitor, or customer accessing or purchasing from our platform.",
                },
                {
                  title: "2. Eligibility & Account",
                  list: [
                    "You must provide accurate and complete information while creating an account or placing an order.",
                    "You are responsible for maintaining the confidentiality of your account credentials.",
                    "We reserve the right to suspend or terminate accounts that violate these terms.",
                  ],
                },
                {
                  title: "3. Product Information",
                  list: [
                    "We strive to display product details accurately; however, colors may vary due to screen settings.",
                    "Product pricing, availability, and descriptions may change without notice.",
                    "Some products may have natural variations inherent to the fabric or craftsmanship.",
                  ],
                },
                {
                  title: "4. Pricing, Payments & Orders",
                  list: [
                    "All prices are displayed in INR unless stated otherwise.",
                    "The price charged is the one displayed at the time of order confirmation.",
                    "Orders may be cancelled due to stock issues, pricing errors, or payment verification failures.",
                    "Any eligible refunds will be processed as per the applicable policy.",
                  ],
                },
                {
                  title: "5. Shipping & Delivery",
                  list: [
                    "Delivery timelines are estimates and may vary due to external factors.",
                    "We are not responsible for delays caused by courier partners or unforeseen circumstances.",
                    "Please ensure accurate address and contact details during checkout.",
                  ],
                },
              ].map((section) => (
                <div key={section.title} className="space-y-3">
                  <h2 className="text-xl md:text-2xl font-extrabold text-black">
                    {section.title}
                  </h2>

                  {section.content && (
                    <p className="text-sm md:text-base text-gray-700">
                      {section.content}
                    </p>
                  )}

                  {section.list && (
                    <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-gray-700">
                      {section.list.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

              {/* RETURNS */}
              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold text-black">
                  6. Exchanges &amp; Returns
                </h2>
                <p className="text-sm md:text-base text-gray-700">
                  Our exchange and return rules are detailed in the relevant
                  policy page. Please review it carefully before placing an
                  order.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/exchange-and-return" className="inline-flex items-center justify-center rounded-full bg-black px-5 py-2 text-sm font-semibold text-white hover:bg-black/90 transition">
                    Exchange &amp; Return Policy
                  </Link>
                  <Link href="/faq" className="inline-flex items-center justify-center rounded-full border border-gray-300 px-5 py-2 text-sm font-semibold text-black hover:bg-gray-100 transition">
                    View FAQs
                  </Link>
                </div>
              </div>

              {/* PRIVACY */}
              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold text-black">
                  11. Privacy
                </h2>
                <p className="text-sm md:text-base text-gray-700">
                  Your use of our platform is governed by our Privacy Policy,
                  which explains how we collect and use your data.
                </p>
                <Link href="/privacy-policy" className="inline-flex items-center justify-center rounded-full border border-gray-300 px-5 py-2 text-sm font-semibold text-black hover:bg-gray-100 transition">
                  Privacy Policy
                </Link>
              </div>

              {/* SUPPORT */}
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
                <h2 className="text-lg md:text-xl font-bold mb-2 text-black">
                  Need Help?
                </h2>
                <p className="text-sm md:text-base text-gray-700">
                  If you have any questions regarding these Terms &amp;
                  Conditions, please reach out to our support team.
                </p>
                <div className="mt-4">
                  <Link href="/support" className="inline-flex items-center justify-center rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white hover:bg-black/90 transition">
                    Go to Support
                  </Link>
                </div>
              </div>

              <p className="text-xs text-gray-500">
                Note: This page provides general terms. Specific policies such as
                exchanges, returns, or shipping timelines are detailed on their
                respective pages.
              </p>
            </div>

            {/* SIDEBAR */}
            <aside className="space-y-4">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <h3 className="text-base font-bold mb-3 text-black">
                  Quick Links
                </h3>
                <div className="flex flex-col gap-2 text-sm">
                  <Link href="/support" className="font-medium text-black hover:underline">
                    Support
                  </Link>
                  <Link href="/faq" className="font-medium text-black hover:underline">
                    FAQs
                  </Link>
                  <Link href="/exchange-and-return" className="font-medium text-black hover:underline">
                    Exchange &amp; Return
                  </Link>
                  <Link href="/privacy-policy" className="font-medium text-black hover:underline">
                    Privacy Policy
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 p-5">
                <h3 className="text-base font-bold mb-2 text-black">
                  Important
                </h3>
                <p className="text-sm text-gray-700">
                  By using this platform or placing an order, you agree to these
                  Terms &amp; Conditions.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
