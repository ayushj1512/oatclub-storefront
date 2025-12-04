"use client";

import Link from "next/link";

export default function TermsAndConditionsPage() {
  return (
    <main className="w-full bg-white text-gray-900">
      <section className="w-full px-4 md:px-10 py-10 md:py-14">
        <div className="w-full">
          <div className="flex flex-col gap-2 mb-8">
            <p className="text-xs font-semibold text-[#800020] tracking-widest uppercase">Miray Fashion</p>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">Terms &amp; Conditions</h1>
            <p className="text-sm md:text-base text-gray-600">These terms govern your use of Miray Fashion’s website/app, purchases, and services.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_330px] gap-8">
            {/* CONTENT */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-gray-200 p-5 md:p-6 bg-gray-50">
                <p className="text-sm md:text-base text-gray-700">
                  By accessing or using Miray Fashion’s website/app, placing an order, or using our services, you agree to the Terms &amp; Conditions below.
                  If you do not agree, please do not use our services.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold">1. About Miray Fashion</h2>
                <p className="text-sm md:text-base text-gray-700">
                  “Miray Fashion”, “we”, “us”, and “our” refer to Miray Fashion and its website/app and services. “You” refers to the customer/user visiting or shopping with us.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold">2. Eligibility &amp; Account</h2>
                <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-gray-700">
                  <li>You must provide accurate, complete, and updated information while creating an account or placing an order.</li>
                  <li>You are responsible for maintaining confidentiality of your account credentials and for all activities under your account.</li>
                  <li>We reserve the right to suspend/terminate accounts that misuse platform features or violate these terms.</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold">3. Product Information</h2>
                <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-gray-700">
                  <li>We try our best to display product images, colors, and details accurately. However, actual colors may vary due to screen settings and lighting.</li>
                  <li>Product descriptions, pricing, availability, and offers may change without prior notice.</li>
                  <li>Some products may have natural variations in color/texture as part of the fabric/finishing process.</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold">4. Pricing, Payments &amp; Orders</h2>
                <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-gray-700">
                  <li>All prices are shown in INR unless mentioned otherwise.</li>
                  <li>Prices and promotions are subject to change. The price charged will be the price shown at the time of successful order placement.</li>
                  <li>We may cancel an order in case of suspected fraud, incorrect pricing, stock issues, or failed payment verification.</li>
                  <li>In such cases, any applicable refund will be processed as per the payment mode and policy.</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold">5. Shipping &amp; Delivery</h2>
                <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-gray-700">
                  <li>Delivery timelines shown are estimates and may vary depending on location, courier operations, and external factors.</li>
                  <li>We are not liable for delays caused by courier partners, natural events, government restrictions, or unforeseen circumstances.</li>
                  <li>Please ensure your address and contact details are accurate to avoid delivery failures.</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold">6. Exchanges &amp; Returns</h2>
                <p className="text-sm md:text-base text-gray-700">
                  Our Exchange &amp; Return rules are defined in our policy page. Please read it carefully before placing an order.
                </p>
                <div className="flex flex-wrap gap-3 mt-2">
                  <Link href="/exchange-and-return" className="inline-flex items-center justify-center rounded-full bg-[#800020] px-5 py-2 text-sm font-semibold text-white hover:opacity-90 transition">
                    Exchange &amp; Return Policy
                  </Link>
                  <Link href="/faq" className="inline-flex items-center justify-center rounded-full border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-900 hover:bg-white transition">
                    View FAQs
                  </Link>
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold">7. User Conduct</h2>
                <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-gray-700">
                  <li>You agree not to misuse the website/app, attempt unauthorized access, or disrupt services.</li>
                  <li>You must not upload viruses, malicious code, or content that violates any law or third-party rights.</li>
                  <li>We may restrict or disable access if misuse is detected.</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold">8. Intellectual Property</h2>
                <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-gray-700">
                  <li>All content on the website/app (logos, images, product content, design, text, and visuals) is owned by or licensed to Miray Fashion.</li>
                  <li>You may not copy, reproduce, distribute, or use any content without written permission.</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold">9. Third-Party Services</h2>
                <p className="text-sm md:text-base text-gray-700">
                  We may use third-party services for payments, shipping, analytics, and communications. Their terms and policies may apply in addition to ours.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold">10. Limitation of Liability</h2>
                <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-gray-700">
                  <li>To the maximum extent permitted by law, Miray Fashion shall not be liable for indirect, incidental, or consequential damages.</li>
                  <li>Our total liability for any claim shall not exceed the amount paid by you for the specific order giving rise to the claim.</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold">11. Privacy</h2>
                <p className="text-sm md:text-base text-gray-700">
                  Your usage of our website/app is also governed by our Privacy Policy. Please review it to understand how we collect and use data.
                </p>
                <div className="mt-2">
                  <Link href="/privacy-policy" className="inline-flex items-center justify-center rounded-full border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-900 hover:bg-white transition">
                    Privacy Policy
                  </Link>
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold">12. Changes to Terms</h2>
                <p className="text-sm md:text-base text-gray-700">
                  Miray Fashion reserves the right to amend these Terms &amp; Conditions at any time. Updated terms will be posted on this page and will apply from the date of posting.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 p-5 md:p-6 bg-gray-50">
                <h2 className="text-lg md:text-xl font-bold mb-2">Need Help?</h2>
                <p className="text-sm md:text-base text-gray-700">
                  For questions about these Terms, orders, or support, please contact us via the Support page.
                </p>
                <div className="mt-4">
                  <Link href="/support" className="inline-flex items-center justify-center rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition">
                    Go to Support
                  </Link>
                </div>
              </div>

              <p className="text-xs text-gray-500">
                Note: This page is for general information and platform rules. Specific policy details (like exchanges/returns timelines and fees) are defined in the relevant policy pages.
              </p>
            </div>

            {/* SIDEBAR */}
            <aside className="space-y-4">
              <div className="rounded-2xl border border-gray-200 p-5 bg-gray-50">
                <h3 className="text-base font-bold mb-2">Quick Links</h3>
                <div className="flex flex-col gap-2 text-sm">
                  <Link href="/support" className="text-[#800020] font-semibold hover:opacity-80 transition">Support</Link>
                  <Link href="/faq" className="text-[#800020] font-semibold hover:opacity-80 transition">FAQs</Link>
                  <Link href="/exchange-and-return" className="text-[#800020] font-semibold hover:opacity-80 transition">Exchange &amp; Return</Link>
                  <Link href="/privacy-policy" className="text-[#800020] font-semibold hover:opacity-80 transition">Privacy Policy</Link>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 p-5">
                <h3 className="text-base font-bold mb-2">Important</h3>
                <p className="text-sm text-gray-700">By using this website/app or placing an order, you agree to these Terms &amp; Conditions.</p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
