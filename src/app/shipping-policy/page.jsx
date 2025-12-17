import Link from "next/link";

/* =======================
   SEO CONFIG
======================= */
export const metadata = {
  title: "Shipping Policy | Miray Fashion",
  description:
    "Learn about Miray Fashion’s shipping policy, delivery timelines, order processing, and important shipping information for a smooth shopping experience.",
  alternates: {
    canonical: "https://www.mirayfashions.in/shipping-policy",
  },
};

export default function ShippingPolicyPage() {
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
              Shipping Policy
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              We aim to deliver your order safely and on time. Please read our shipping policy below for complete details.
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
                  At Miray Fashion, we work with trusted delivery partners to ensure your order reaches you in the best condition and within the expected timeframe.
                </p>
              </div>

              {/* 1 */}
              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold">
                  1. Order Processing Time
                </h2>
                <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-gray-700">
                  <li>Orders are usually processed within <strong>1–2 business days</strong> after confirmation.</li>
                  <li>Orders placed on weekends or public holidays are processed on the next working day.</li>
                  <li>You will receive a confirmation once your order is shipped.</li>
                </ul>
              </div>

              <hr className="border-gray-200" />

              {/* 2 */}
              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold">
                  2. Delivery Timelines
                </h2>
                <p className="text-sm md:text-base text-gray-700">
                  Estimated delivery times may vary depending on your location:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-gray-700">
                  <li><strong>Metro cities:</strong> 3–5 business days</li>
                  <li><strong>Non-metro & regional areas:</strong> 5–7 business days</li>
                  <li>Remote locations may take slightly longer due to courier limitations.</li>
                </ul>
              </div>

              <hr className="border-gray-200" />

              {/* 3 */}
              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold">
                  3. Shipping Charges
                </h2>
                <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-gray-700">
                  <li>Shipping charges (if applicable) are displayed at checkout before payment.</li>
                  <li>We may offer free shipping on select orders, promotions, or minimum order values.</li>
                </ul>
              </div>

              <hr className="border-gray-200" />

              {/* 4 */}
              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold">
                  4. Order Tracking
                </h2>
                <p className="text-sm md:text-base text-gray-700">
                  Once your order is shipped, you will receive tracking details via email or SMS to monitor the delivery status.
                </p>
              </div>

              <hr className="border-gray-200" />

              {/* 5 */}
              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold">
                  5. Delays & Exceptions
                </h2>
                <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-gray-700">
                  <li>Delivery timelines are estimates and may be affected by weather, courier issues, or unforeseen circumstances.</li>
                  <li>Miray Fashion is not liable for delays caused by external factors beyond our control.</li>
                </ul>
              </div>

              <hr className="border-gray-200" />

              {/* 6 */}
              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold">
                  6. Incorrect Address or Failed Delivery
                </h2>
                <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-gray-700">
                  <li>Please ensure your shipping address and contact details are accurate at checkout.</li>
                  <li>Failed deliveries due to incorrect information may result in additional shipping charges.</li>
                </ul>
              </div>

              <hr className="border-gray-200" />

              {/* 7 */}
              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold">
                  7. Need Help?
                </h2>
                <p className="text-sm md:text-base text-gray-700">
                  If you have questions regarding shipping, delivery status, or your order, our support team will be happy to assist you.
                </p>
                <Link
                  href="/support"
                  className="inline-flex items-center justify-center rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition"
                >
                  Go to Support
                </Link>
              </div>

              <p className="text-xs text-gray-500">
                This shipping policy applies to all orders placed on Miray Fashion. Updates, if any, will be reflected on this page.
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
                  <Link href="/faq" className="text-[#800020] font-semibold hover:opacity-80">
                    FAQs
                  </Link>
                  <Link href="/support" className="text-[#800020] font-semibold hover:opacity-80">
                    Support
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 p-5">
                <h3 className="text-base font-bold mb-2">Important</h3>
                <p className="text-sm text-gray-700">
                  By placing an order with Miray Fashion, you agree to this Shipping Policy.
                </p>
              </div>
            </aside>

          </div>
        </div>
      </section>
    </main>
  );
}
