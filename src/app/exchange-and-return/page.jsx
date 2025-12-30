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
  <main className="w-full bg-white text-black">
    <section className="w-full px-4 md:px-10 py-16">
      <div className="mx-auto ">

        {/* ================= HERO HEADER ================= */}
        <div className="relative mb-16 overflow-hidden rounded-[32px] border border-black/10 bg-white p-8 md:p-12">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold tracking-[0.35em] uppercase text-black/60">
              Miray Fashion · Policy
            </p>

            <h1 className="mt-4 text-3xl md:text-5xl font-extrabold tracking-tight">
              Exchange & Return
            </h1>

            <p className="mt-4 text-base md:text-lg leading-relaxed text-black/70">
              We want you to love what you wear. If something isn’t right,
              our exchange and return process is simple, fair, and customer-first.
            </p>

            <p className="mt-3 text-xs text-black/50">
              Last updated · 17 December 2025
            </p>
          </div>

          {/* subtle premium accent */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-black/5 blur-3xl" />
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_340px]">

          {/* ================= MAIN CONTENT ================= */}
          <div className="space-y-10">

            {/* Intro */}
            <div className="rounded-3xl border border-black/10 bg-white p-6 md:p-8 shadow-sm">
              <p className="text-base leading-relaxed text-black/75">
                At Miray Fashion, your satisfaction comes first. If you wish to exchange
                or return a product, please review the policy below for a smooth,
                transparent, and hassle-free experience.
              </p>
            </div>

            {/* ================= SECTIONS ================= */}
            {[
              {
                no: "01",
                title: "7-Day Exchange & Return Policy",
                content: (
                  <p>
                    We offer a <strong>7-day exchange and return window</strong> from the date
                    of delivery. Requests made within this period are accepted
                    <strong> without questions</strong>.
                  </p>
                ),
              },
              {
                no: "02",
                title: "Eligibility Conditions",
                content: (
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Product must be unused, unwashed, and unworn.</li>
                    <li>All original tags and packaging must be intact.</li>
                    <li>Item must be returned in original condition.</li>
                  </ul>
                ),
              },
              {
                no: "03",
                title: "How to Request an Exchange or Return",
                content: (
                  <ul className="list-decimal pl-5 space-y-2">
                    <li>Go to your Orders section.</li>
                    <li>Select the item and choose exchange or return.</li>
                    <li>Submit the request and follow instructions.</li>
                  </ul>
                ),
              },
              {
                no: "04",
                title: "Exchanges",
                content: (
                  <p>
                    Exchanges depend on product availability. If the requested item
                    is unavailable, we may offer a refund or suitable alternative.
                  </p>
                ),
              },
              {
                no: "05",
                title: "Returns & Refunds",
                content: (
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Refunds are processed within <strong>5–7 business days</strong>.</li>
                    <li>Refunds are issued to the original payment method.</li>
                    <li>Bank processing times may vary.</li>
                  </ul>
                ),
              },
              {
                no: "06",
                title: "Non-Eligible Items",
                content: (
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Final Sale items.</li>
                    <li>Customized or personalized products.</li>
                    <li>Items showing signs of use or damage.</li>
                  </ul>
                ),
              },
            ].map((s) => (
              <div
                key={s.no}
                className="rounded-3xl border border-black/10 bg-white p-6 md:p-8 shadow-sm"
              >
                <div className="mb-4 flex items-center gap-4">
                  <span className="text-sm font-semibold text-black/40">
                    {s.no}
                  </span>
                  <h2 className="text-xl md:text-2xl font-extrabold">
                    {s.title}
                  </h2>
                </div>

                <div className="text-sm md:text-base leading-relaxed text-black/75 space-y-3">
                  {s.content}
                </div>
              </div>
            ))}

            {/* ================= SUPPORT CTA ================= */}
            <div className="rounded-3xl bg-black p-8 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h3 className="text-xl font-extrabold">
                  Need help with an exchange or return?
                </h3>
                <p className="mt-2 text-sm text-white/70">
                  Our support team is here to help you every step of the way.
                </p>
              </div>

              <Link
                href="/support"
                className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-black hover:opacity-90 transition"
              >
                Contact Support
              </Link>
            </div>

            <p className="text-xs text-black/50">
              This policy applies to all purchases made on Miray Fashion.
              The latest version published on this page will always apply.
            </p>
          </div>

          {/* ================= SIDEBAR ================= */}
          <aside className="lg:sticky lg:top-24 h-fit space-y-4">
            <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-xs font-bold tracking-widest uppercase text-black/50">
                Quick Links
              </h3>
              <div className="flex flex-col gap-3 text-sm">
                <Link href="/terms-and-conditions" className="hover:underline">
                  Terms & Conditions
                </Link>
                <Link href="/privacy-policy" className="hover:underline">
                  Privacy Policy
                </Link>
                <Link href="/cancellation-and-refund" className="hover:underline">
                  Cancellation & Refund
                </Link>
                <Link href="/shipping-policy" className="hover:underline">
                  Shipping Policy
                </Link>
                <Link href="/faq" className="hover:underline">
                  FAQs
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
              <h3 className="mb-2 text-sm font-bold">Important</h3>
              <p className="text-sm text-black/70">
                By placing an order with Miray Fashion, you agree to this
                Exchange & Return Policy.
              </p>
            </div>
          </aside>

        </div>
      </div>
    </section>
  </main>
);

}
