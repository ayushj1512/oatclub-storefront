import Link from "next/link";

/* =======================
   SEO CONFIG
======================= */
export const metadata = {
  title: "Exchange & Return Policy | Miray Fashion",
  description:
    "Read Miray Fashion’s Exchange & Return Policy. Enjoy a simple 7-day exchange and return policy with no questions asked on unused products.",
  alternates: {
    canonical: "https://www.mirayfashions.in/exchange-and-return",
  },
};

export default function ExchangeAndReturnPage() {
  return (
    <main className="w-full bg-white text-gray-900">
      <section className="w-full px-4 md:px-10 py-10 md:py-14">
        <div className="w-full">

          {/* Header */}
          <div className="flex flex-col gap-2 mb-8">
            <p className="text-xs font-semibold text-[#800020] tracking-widest uppercase">
              Miray Fashion
            </p>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
              Exchange & Return Policy
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              We want you to love what you wear. If something isn’t right, we’re here to make it easy.
            </p>
            <p className="text-xs text-gray-500">
              Last updated: 17 December 2025
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_330px] gap-8">

            {/* MAIN CONTENT */}
            <div className="space-y-6">

              {/* Intro */}
              <div className="rounded-2xl border border-gray-200 p-5 md:p-6 bg-gray-50">
                <p className="text-sm md:text-base text-gray-700">
                  At Miray Fashion, your satisfaction comes first. If you wish to exchange or return a product,
                  please review the policy below for a smooth and hassle-free experience.
                </p>
              </div>

              {/* 1 */}
              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold">
                  1. 7-Day Exchange & Return Policy
                </h2>
                <p className="text-sm md:text-base text-gray-700">
                  We offer a <strong>7-day exchange and return policy</strong> from the date of delivery.
                  You may request an exchange or return within this period — <strong>no questions asked</strong>.
                </p>
              </div>

              <hr className="border-gray-200" />

              {/* 2 */}
              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold">
                  2. Eligibility Conditions
                </h2>
                <p className="text-sm md:text-base text-gray-700">
                  To be eligible for an exchange or return:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-gray-700">
                  <li>The product must be unused, unwashed, and unworn.</li>
                  <li>All original tags, labels, and packaging must be intact.</li>
                  <li>The product should be in the same condition as received.</li>
                </ul>
              </div>

              <hr className="border-gray-200" />

              {/* 3 */}
              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold">
                  3. How to Request an Exchange or Return
                </h2>
                <ul className="list-decimal pl-5 space-y-2 text-sm md:text-base text-gray-700">
                  <li>Visit your Orders section and select the item you wish to exchange or return.</li>
                  <li>Choose the exchange or return option and submit your request.</li>
                  <li>Our team will guide you through the next steps.</li>
                </ul>
              </div>

              <hr className="border-gray-200" />

              {/* 4 */}
              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold">
                  4. Exchanges
                </h2>
                <p className="text-sm md:text-base text-gray-700">
                  Exchanges are subject to product availability. If the requested replacement is unavailable,
                  we may offer a refund or alternative options.
                </p>
              </div>

              <hr className="border-gray-200" />

              {/* 5 */}
              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold">
                  5. Returns & Refunds
                </h2>
                <p className="text-sm md:text-base text-gray-700">
                  Once your return is approved and the product is received and inspected:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-gray-700">
                  <li>Refunds are processed within <strong>5–7 business days</strong>.</li>
                  <li>Refunds are issued to the original payment method.</li>
                  <li>Bank processing times may vary.</li>
                </ul>
              </div>

              <hr className="border-gray-200" />

              {/* 6 */}
              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold">
                  6. Non-Eligible Items
                </h2>
                <p className="text-sm md:text-base text-gray-700">
                  The following items may not be eligible for exchange or return:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-gray-700">
                  <li>Items marked as “Final Sale”.</li>
                  <li>Customized or personalized products.</li>
                  <li>Products showing signs of use or damage.</li>
                </ul>
              </div>

              <hr className="border-gray-200" />

              {/* 7 */}
              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold">
                  7. Need Assistance?
                </h2>
                <p className="text-sm md:text-base text-gray-700">
                  If you need help with an exchange or return, our support team will be happy to assist you.
                </p>
                <Link
                  href="/support"
                  className="inline-flex items-center justify-center rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition"
                >
                  Go to Support
                </Link>
              </div>

              <p className="text-xs text-gray-500">
                This policy applies to all purchases made on Miray Fashion. The most recent version published on this page will always apply.
              </p>
            </div>

            {/* SIDEBAR */}
            <aside className="space-y-4 lg:sticky lg:top-24 h-fit">
              <div className="rounded-2xl border border-gray-200 p-5 bg-gray-50">
                <h3 className="text-base font-bold mb-2">Quick Links</h3>
                <div className="flex flex-col gap-2 text-sm">
                  <Link href="/terms-and-conditions" className="text-[#800020] font-semibold hover:opacity-80">
                    Terms & Conditions
                  </Link>
                  <Link href="/privacy-policy" className="text-[#800020] font-semibold hover:opacity-80">
                    Privacy Policy
                  </Link>
                  <Link href="/cancellation-and-refund" className="text-[#800020] font-semibold hover:opacity-80">
                    Cancellation & Refund
                  </Link>
                  <Link href="/shipping-policy" className="text-[#800020] font-semibold hover:opacity-80">
                    Shipping Policy
                  </Link>
                  <Link href="/faq" className="text-[#800020] font-semibold hover:opacity-80">
                    FAQs
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 p-5">
                <h3 className="text-base font-bold mb-2">Important</h3>
                <p className="text-sm text-gray-700">
                  By placing an order with Miray Fashion, you agree to this Exchange & Return Policy.
                </p>
              </div>
            </aside>

          </div>
        </div>
      </section>
    </main>
  );
}
