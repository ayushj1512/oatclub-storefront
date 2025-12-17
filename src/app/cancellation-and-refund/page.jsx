import Link from "next/link";

/* =======================
   SEO CONFIG
======================= */
export const metadata = {
  title: "Cancellation & Refund Policy | Miray Fashion",
  description:
    "Read Miray Fashion’s Cancellation & Refund Policy. Enjoy instant order cancellation with no questions asked and a 7-day refund policy for eligible orders.",
  alternates: {
    canonical: "https://www.mirayfashions.in/cancellation-and-refund",
  },
};

export default function CancellationAndRefundPage() {
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
              Cancellation & Refund Policy
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              We believe shopping should feel safe and stress-free. Here’s how cancellations and refunds work at Miray Fashion.
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
                  At Miray Fashion, your satisfaction matters. If you change your mind or face any issue,
                  we’re here to help with a simple and transparent cancellation and refund process.
                </p>
              </div>

              {/* TOC */}
              <div className="rounded-2xl border border-gray-200 p-5 md:p-6">
                <h2 className="text-lg font-bold mb-3">Table of Contents</h2>
                <ul className="list-disc pl-5 space-y-2 text-sm text-[#800020] font-semibold">
                  <li><a href="#cancellation" className="hover:opacity-80">Order Cancellation</a></li>
                  <li><a href="#refund-policy" className="hover:opacity-80">7-Day Refund Policy</a></li>
                  <li><a href="#refund-request" className="hover:opacity-80">How to Request a Refund</a></li>
                  <li><a href="#processing-time" className="hover:opacity-80">Refund Processing Time</a></li>
                  <li><a href="#exceptions" className="hover:opacity-80">Exceptions & Non-Refundable Items</a></li>
                  <li><a href="#support" className="hover:opacity-80">Support & Contact</a></li>
                </ul>
              </div>

              <hr className="border-gray-200" />

              {/* 1 */}
              <div id="cancellation" className="space-y-3 scroll-mt-28">
                <h2 className="text-xl md:text-2xl font-extrabold">
                  1. Order Cancellation
                </h2>
                <p className="text-sm md:text-base text-gray-700">
                  You may cancel your order <strong>instantly and without any questions</strong>
                  as long as it has not been shipped.
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-gray-700">
                  <li>Unshipped orders can be cancelled directly from your account or via Support.</li>
                  <li>Once an order is shipped, cancellation may not be possible. You may instead request a return after delivery.</li>
                </ul>
              </div>

              <hr className="border-gray-200" />

              {/* 2 */}
              <div id="refund-policy" className="space-y-3 scroll-mt-28">
                <h2 className="text-xl md:text-2xl font-extrabold">
                  2. 7-Day Refund Policy
                </h2>
                <p className="text-sm md:text-base text-gray-700">
                  We offer a <strong>7-day refund policy</strong> starting from the date your order is delivered.
                  If something doesn’t feel right, you can request a refund within this period.
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-gray-700">
                  <li>Refund requests must be raised within 7 calendar days of delivery.</li>
                  <li>Products should be unused, unwashed, and returned with original tags and packaging.</li>
                  <li>Items that are damaged or altered after delivery may not be eligible.</li>
                </ul>
              </div>

              <hr className="border-gray-200" />

              {/* 3 */}
              <div id="refund-request" className="space-y-3 scroll-mt-28">
                <h2 className="text-xl md:text-2xl font-extrabold">
                  3. How to Request a Refund
                </h2>
                <ul className="list-decimal pl-5 space-y-2 text-sm md:text-base text-gray-700">
                  <li>Visit your Orders page and select the item you wish to return.</li>
                  <li>Submit a refund request with the required details.</li>
                  <li>Our team will review and guide you through the next steps.</li>
                </ul>
              </div>

              <hr className="border-gray-200" />

              {/* 4 */}
              <div id="processing-time" className="space-y-3 scroll-mt-28">
                <h2 className="text-xl md:text-2xl font-extrabold">
                  4. Refund Processing Time
                </h2>
                <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-gray-700">
                  <li>Approved refunds are processed within <strong>5–7 business days</strong>.</li>
                  <li>Refunds are credited to the original payment method.</li>
                  <li>Bank processing times may vary beyond our control.</li>
                </ul>
              </div>

              <hr className="border-gray-200" />

              {/* 5 */}
              <div id="exceptions" className="space-y-3 scroll-mt-28">
                <h2 className="text-xl md:text-2xl font-extrabold">
                  5. Exceptions & Non-Refundable Items
                </h2>
                <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-gray-700">
                  <li>Items marked as “Final Sale”.</li>
                  <li>Customized or personalized products.</li>
                  <li>Products showing signs of wear or misuse.</li>
                </ul>
              </div>

              <hr className="border-gray-200" />

              {/* 6 */}
              <div id="support" className="space-y-3 scroll-mt-28">
                <h2 className="text-xl md:text-2xl font-extrabold">
                  6. Support & Contact
                </h2>
                <p className="text-sm md:text-base text-gray-700">
                  We’re always happy to help. If you have any questions or need assistance,
                  please reach out to our support team.
                </p>
                <Link
                  href="/support"
                  className="inline-flex items-center justify-center rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition"
                >
                  Go to Support
                </Link>
              </div>

              <p className="text-xs text-gray-500">
                This policy applies to all orders placed on Miray Fashion. The most recent version published on this page will always apply.
              </p>
            </div>

            {/* SIDEBAR */}
            <aside className="space-y-4 lg:sticky lg:top-24 h-fit">
              <div className="rounded-2xl border border-gray-200 p-5 bg-gray-50">
                <h3 className="text-base font-bold mb-2">Quick Links</h3>
                <div className="flex flex-col gap-2 text-sm">
                  <Link href="/terms-and-conditions" className="text-[#800020] font-semibold hover:opacity-80">Terms & Conditions</Link>
                  <Link href="/privacy-policy" className="text-[#800020] font-semibold hover:opacity-80">Privacy Policy</Link>
                  <Link href="/faq" className="text-[#800020] font-semibold hover:opacity-80">FAQs</Link>
                  <Link href="/support" className="text-[#800020] font-semibold hover:opacity-80">Support</Link>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 p-5">
                <h3 className="text-base font-bold mb-2">Important</h3>
                <p className="text-sm text-gray-700">
                  By placing an order on Miray Fashion, you agree to this Cancellation & Refund Policy.
                </p>
              </div>
            </aside>

          </div>
        </div>
      </section>
    </main>
  );
}
