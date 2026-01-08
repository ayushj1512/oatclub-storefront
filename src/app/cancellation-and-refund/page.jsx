import Link from "next/link";

/* =======================
   SEO CONFIG
======================= */
export const metadata = {
  title: "Cancellation & Refund Policy | Miray Fashion",
  description:
    "Read Miray Fashion’s Cancellation & Refund Policy. Enjoy instant order cancellation with no questions asked and a 7-day refund policy for eligible orders.",
  alternates: {
    canonical: "https://www.mirayfashions.com/cancellation-and-refund",
  },
};

export default function CancellationAndRefundPage() {
return (
  <main className="w-full bg-[#f4f4f5] text-gray-900">
    <section className="w-full px-4 md:px-10 py-16">
      <div className="mx-auto ">

        {/* ================= HERO HEADER ================= */}
        <div className="relative mb-16 overflow-hidden rounded-4xl border border-gray-200 bg-white p-8 md:p-12">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold tracking-[0.35em] uppercase text-gray-500">
              Miray Fashion · Policy
            </p>

            <h1 className="mt-4 text-3xl md:text-5xl font-extrabold tracking-tight">
              Cancellation & Refund
            </h1>

            <p className="mt-4 text-base md:text-lg text-gray-600 leading-relaxed">
              Simple, transparent, and customer-first.  
              Everything you need to know about cancellations and refunds at Miray.
            </p>

            <p className="mt-3 text-xs text-gray-400">
              Last updated · 17 December 2025
            </p>
          </div>

          {/* subtle background accent */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-gray-100 blur-3xl" />
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_340px]">

          {/* ================= MAIN CONTENT ================= */}
          <div className="space-y-10">

            {/* Intro Card */}
            <div className="rounded-3xl bg-white p-6 md:p-8 shadow-sm border border-gray-200">
              <p className="text-base text-gray-700 leading-relaxed">
                At Miray Fashion, your satisfaction matters. If something doesn’t feel right,
                we offer a clear and stress-free cancellation and refund process —
                designed to respect your time and trust.
              </p>
            </div>

            {/* ================= POLICY SECTIONS ================= */}
            {[
              {
                id: "cancellation",
                title: "Order Cancellation",
                number: "01",
                content: (
                  <>
                    <p>
                      Cancel your order <strong>instantly</strong> as long as it hasn’t been shipped.
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Unshipped orders can be cancelled from your account or via Support.</li>
                      <li>Once shipped, cancellation isn’t possible — you may request a return after delivery.</li>
                    </ul>
                  </>
                ),
              },
              {
                id: "refund-policy",
                title: "7-Day Refund Policy",
                number: "02",
                content: (
                  <>
                    <p>
                      Refunds can be requested within <strong>7 days of delivery</strong>.
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Products must be unused and returned with original tags.</li>
                      <li>Altered or damaged items may not be eligible.</li>
                    </ul>
                  </>
                ),
              },
              {
                id: "refund-request",
                title: "How to Request a Refund",
                number: "03",
                content: (
                  <ul className="list-decimal pl-5 space-y-2">
                    <li>Open your Orders page.</li>
                    <li>Select the product and submit a refund request.</li>
                    <li>Our team will guide you further.</li>
                  </ul>
                ),
              },
              {
                id: "processing-time",
                title: "Refund Processing Time",
                number: "04",
                content: (
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Refunds are processed within <strong>5–7 business days</strong>.</li>
                    <li>Credited to the original payment method.</li>
                  </ul>
                ),
              },
              {
                id: "exceptions",
                title: "Exceptions",
                number: "05",
                content: (
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Final Sale items.</li>
                    <li>Customized or personalized products.</li>
                    <li>Used or damaged items.</li>
                  </ul>
                ),
              },
            ].map(({ id, title, number, content }) => (
              <div
                key={id}
                id={id}
                className="scroll-mt-28 rounded-3xl bg-white p-6 md:p-8 border border-gray-200 shadow-sm"
              >
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-sm font-semibold text-gray-400">
                    {number}
                  </span>
                  <h2 className="text-xl md:text-2xl font-extrabold">
                    {title}
                  </h2>
                </div>

                <div className="space-y-3 text-sm md:text-base text-gray-700 leading-relaxed">
                  {content}
                </div>
              </div>
            ))}

            {/* ================= SUPPORT CTA ================= */}
            <div
              id="support"
              className="rounded-3xl bg-black p-8 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-6"
            >
              <div>
                <h3 className="text-xl font-extrabold">
                  Need help or clarification?
                </h3>
                <p className="mt-2 text-sm text-gray-300">
                  Our support team is always ready to assist you.
                </p>
              </div>

              <Link
                href="/support"
                className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-black hover:opacity-90 transition"
              >
                Contact Support
              </Link>
            </div>

            <p className="text-xs text-gray-500">
              This policy applies to all orders placed on Miray Fashion.
            </p>
          </div>

          {/* ================= SIDEBAR ================= */}
          <aside className="lg:sticky lg:top-24 space-y-4 h-fit">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-bold tracking-wide uppercase text-gray-500">
                Quick Links
              </h3>
              <div className="flex flex-col gap-3 text-sm">
                <Link href="/terms-and-conditions" className="hover:text-black">Terms & Conditions</Link>
                <Link href="/privacy-policy" className="hover:text-black">Privacy Policy</Link>
                <Link href="/faq" className="hover:text-black">FAQs</Link>
                <Link href="/support" className="hover:text-black">Support</Link>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </section>
  </main>
);


}
