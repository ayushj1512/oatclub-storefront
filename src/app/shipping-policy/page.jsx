import Link from "next/link";

/* =======================
   SEO CONFIG
======================= */
export const metadata = {
  title: "Shipping Policy | Miray Fashion",
  description:
    "Learn about Miray Fashion’s shipping policy, delivery timelines, order processing, and important shipping information for a smooth shopping experience.",
  alternates: {
    canonical: "https://www.mirayfashions.com/shipping-policy",
  },
};

export default function ShippingPolicyPage() {
  return (
    <main className="w-full bg-white text-gray-900">
      <section className="px-4 md:px-10 py-12 md:py-16 max-w-7xl mx-auto">

        {/* Header */}
        <header className="mb-12 space-y-3">
       <p className="text-xs font-medium tracking-[0.25em] uppercase text-gray-500">
  Miray Fashions
</p>


          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Shipping Policy
          </h1>

          <p className="text-gray-600 max-w-2xl">
            We aim to deliver your order safely and on time. Please review the
            details below to understand our shipping process.
          </p>

          <p className="text-xs text-gray-400">
            Last updated: 17 December 2025
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">

          {/* MAIN CONTENT */}
          <article className="space-y-10">

            {/* Intro */}
            <p className="text-base text-gray-700 max-w-3xl">
              At Miray Fashion, we partner with reliable logistics providers to
              ensure your order reaches you in excellent condition and within
              the expected delivery window.
            </p>

            {/* 1 */}
            <section className="space-y-3">
              <h2 className="text-xl md:text-2xl font-bold">
                1. Order Processing Time
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>
                  Orders are processed within <strong>1–2 business days</strong>{" "}
                  after confirmation.
                </li>
                <li>
                  Orders placed on weekends or public holidays are processed on
                  the next working day.
                </li>
                <li>
                  You will receive a shipping confirmation once your order is
                  dispatched.
                </li>
              </ul>
            </section>

            <hr className="border-gray-200" />

            {/* 2 */}
            <section className="space-y-3">
              <h2 className="text-xl md:text-2xl font-bold">
                2. Delivery Timelines
              </h2>
              <p className="text-gray-700">
                Estimated delivery timelines vary by location:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>
                  <strong>Metro cities:</strong> 3–5 business days
                </li>
                <li>
                  <strong>Non-metro & regional areas:</strong> 5–7 business days
                </li>
                <li>
                  Remote locations may require additional time due to courier
                  constraints.
                </li>
              </ul>
            </section>

            <hr className="border-gray-200" />

            {/* 3 */}
            <section className="space-y-3">
              <h2 className="text-xl md:text-2xl font-bold">
                3. Shipping Charges
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>
                  Applicable shipping charges are displayed during checkout
                  before payment.
                </li>
                <li>
                  Free shipping may be offered during select promotions or on
                  qualifying orders.
                </li>
              </ul>
            </section>

            <hr className="border-gray-200" />

            {/* 4 */}
            <section className="space-y-3">
              <h2 className="text-xl md:text-2xl font-bold">
                4. Order Tracking
              </h2>
              <p className="text-gray-700">
                Once shipped, tracking details will be shared via email or SMS
                so you can monitor your delivery status.
              </p>
            </section>

            <hr className="border-gray-200" />

            {/* 5 */}
            <section className="space-y-3">
              <h2 className="text-xl md:text-2xl font-bold">
                5. Delays & Exceptions
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>
                  Delivery timelines are estimates and may be impacted by
                  weather, logistics issues, or unforeseen circumstances.
                </li>
                <li>
                  Miray Fashion is not responsible for delays beyond our control.
                </li>
              </ul>
            </section>

            <hr className="border-gray-200" />

            {/* 6 */}
            <section className="space-y-3">
              <h2 className="text-xl md:text-2xl font-bold">
                6. Incorrect Address or Failed Delivery
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>
                  Ensure your shipping address and contact details are accurate
                  at checkout.
                </li>
                <li>
                  Failed deliveries due to incorrect information may result in
                  additional shipping charges.
                </li>
              </ul>
            </section>

            <hr className="border-gray-200" />

            {/* 7 */}
            <section className="space-y-4">
              <h2 className="text-xl md:text-2xl font-bold">
                7. Need Help?
              </h2>
              <p className="text-gray-700 max-w-2xl">
                If you have questions regarding shipping, delivery status, or
                your order, our support team will be happy to assist you.
              </p>

              <Link
                href="/support"
                className="inline-flex items-center justify-center rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition"
              >
                Contact Support
              </Link>
            </section>

            <p className="text-xs text-gray-500">
              This shipping policy applies to all orders placed on Miray Fashion.
              Any updates will be reflected on this page.
            </p>
          </article>

          {/* SIDEBAR */}
          <aside className="space-y-6 lg:sticky lg:top-28 h-fit">

            <div className="rounded-2xl border border-gray-200 p-6 bg-gray-50">
              <h3 className="font-bold mb-4">Quick Links</h3>

              <nav className="flex flex-col gap-3 text-sm">
                {[
                  ["/terms-and-conditions", "Terms & Conditions"],
                  ["/privacy-policy", "Privacy Policy"],
                  ["/cancellation-and-refund", "Cancellation & Refund"],
                  ["/faq", "FAQs"],
                  ["/support", "Support"],
                ].map(([href, label]) => (
                  <Link
                    key={href}
                    href={href}
                    className="font-medium text-gray-900 underline underline-offset-4 hover:opacity-70 transition"
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="rounded-2xl border border-gray-200 p-6">
              <h3 className="font-bold mb-2">Important</h3>
              <p className="text-sm text-gray-700">
                By placing an order with Miray Fashion, you agree to this
                Shipping Policy.
              </p>
            </div>

          </aside>
        </div>
      </section>
    </main>
  );
}
