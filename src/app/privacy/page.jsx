"use client";

import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <main className="w-full bg-white text-gray-900">
      <section className="w-full px-4 md:px-10 py-10 md:py-14">
        <div className="w-full">
          <div className="flex flex-col gap-2 mb-8">
            <p className="text-xs font-semibold text-[#800020] tracking-widest uppercase">Miray Fashions</p>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
            <p className="text-sm md:text-base text-gray-600">How we collect, use, share, and protect your information.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_330px] gap-8">
            {/* CONTENT */}
            <div className="space-y-8">
              <div className="rounded-2xl border border-gray-200 p-5 md:p-6 bg-gray-50">
                <p className="text-sm md:text-base text-gray-700">
                  Miray Fashions (“we”, “us”, “our”) operates https://mirayfashions.com/ and the Miray Fashions App. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website/app, create an account, place an order, or contact support. By using our services, you agree to the practices described below.
                </p>
                <p className="text-xs text-gray-500 mt-3">
                  Note: This page is a standard privacy policy template tailored for an e-commerce store. You can adjust sections depending on your exact backend integrations (payments, analytics, WhatsApp, etc.).
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold">1. Information We Collect</h2>
                <p className="text-sm md:text-base text-gray-700">We may collect the following types of information:</p>
                <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-gray-700">
                  <li><span className="font-semibold">Personal details:</span> name, email, phone number, billing/shipping address.</li>
                  <li><span className="font-semibold">Order details:</span> products purchased, order ID, payment mode, delivery status, and exchange/return tickets.</li>
                  <li><span className="font-semibold">Customer support data:</span> messages, uploaded images (if any), and ticket history.</li>
                  <li><span className="font-semibold">Device & usage data:</span> IP address, browser type, device identifiers, pages visited, and actions taken on our website/app.</li>
                  <li><span className="font-semibold">Cookies & similar technologies:</span> used to improve your experience, remember preferences, and help with analytics.</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold">2. How We Use Your Information</h2>
                <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-gray-700">
                  <li>To process orders, payments, shipping, and delivery.</li>
                  <li>To communicate order updates, tracking notifications, and service messages.</li>
                  <li>To provide customer support, respond to inquiries, and resolve tickets.</li>
                  <li>To improve our products, UX, and website/app performance.</li>
                  <li>To prevent fraud, enforce our Terms &amp; Conditions, and keep our platform secure.</li>
                  <li>To send marketing communications (only where permitted by law and/or with your consent). You may opt out anytime.</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold">3. How We Share Your Information</h2>
                <p className="text-sm md:text-base text-gray-700">We may share necessary information with:</p>
                <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-gray-700">
                  <li><span className="font-semibold">Courier & logistics partners:</span> for order delivery, reverse pickup, and tracking updates.</li>
                  <li><span className="font-semibold">Payment providers:</span> to process payments securely (we do not store full card details on our servers).</li>
                  <li><span className="font-semibold">Service providers:</span> who help run our website/app (hosting, analytics, customer support tools, communication tools).</li>
                  <li><span className="font-semibold">Legal & regulatory authorities:</span> if required by law or to protect our rights and users.</li>
                </ul>
                <p className="text-sm md:text-base text-gray-700">We do not sell your personal information to third parties.</p>
              </div>

              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold">4. Cookies &amp; Tracking Technologies</h2>
                <p className="text-sm md:text-base text-gray-700">
                  We use cookies and similar technologies to keep you logged in, remember your preferences, maintain cart/wishlist functionality, and understand how users interact with our website/app.
                  You can control cookies through your browser settings, but 일부 features may not function correctly if cookies are disabled.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold">5. Data Security</h2>
                <p className="text-sm md:text-base text-gray-700">
                  We follow reasonable security practices to protect your information from unauthorized access, misuse, loss, or alteration. However, no method of transmission over the internet is 100% secure. We encourage you to use a strong password and keep your login credentials confidential.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold">6. Data Retention</h2>
                <p className="text-sm md:text-base text-gray-700">
                  We retain your information only as long as needed to provide services, comply with legal obligations, resolve disputes, and enforce policies. Order and transaction records may be retained for accounting and compliance purposes.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold">7. Your Rights &amp; Choices</h2>
                <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-gray-700">
                  <li>You may review, update, or correct your account information in your profile/account section.</li>
                  <li>You may opt out of marketing communications (where applicable) by using the unsubscribe option or contacting us.</li>
                  <li>You may request access to or deletion of certain personal data, subject to legal and operational requirements.</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold">8. Children’s Privacy</h2>
                <p className="text-sm md:text-base text-gray-700">
                  Our website/app is not intended for children under 13 (or the applicable age of majority in your region). We do not knowingly collect personal data from children.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold">9. Third-Party Links</h2>
                <p className="text-sm md:text-base text-gray-700">
                  Our website/app may contain links to third-party websites or services. We are not responsible for their privacy practices. Please review their policies before providing any information.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-extrabold">10. Changes to This Privacy Policy</h2>
                <p className="text-sm md:text-base text-gray-700">
                  We may update this Privacy Policy from time to time. Updates will be posted on this page and will apply from the date of posting.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 p-5 md:p-6 bg-gray-50">
                <h2 className="text-lg md:text-xl font-bold mb-2">Contact Us</h2>
                <p className="text-sm md:text-base text-gray-700">
                  If you have questions about this Privacy Policy or how your information is handled, please contact our support team.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href="/support" className="inline-flex items-center justify-center rounded-full bg-[#800020] px-5 py-2 text-sm font-semibold text-white hover:opacity-90 transition">
                    Go to Support
                  </Link>
                  <Link href="/terms-and-conditions" className="inline-flex items-center justify-center rounded-full border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-900 hover:bg-white transition">
                    Terms &amp; Conditions
                  </Link>
                </div>
              </div>

              <p className="text-xs text-gray-500">
                Miray Fashions reserves the right to amend this Privacy Policy at any time. Your continued use of the site/app after changes are posted constitutes acceptance of those changes.
              </p>
            </div>

            {/* SIDEBAR */}
            <aside className="space-y-4">
              <div className="rounded-2xl border border-gray-200 p-5 bg-gray-50">
                <h3 className="text-base font-bold mb-2">Quick Links</h3>
                <div className="flex flex-col gap-2 text-sm">
                  <Link href="/support" className="text-[#800020] font-semibold hover:opacity-80 transition">Support</Link>
                  <Link href="/faq" className="text-[#800020] font-semibold hover:opacity-80 transition">FAQs</Link>
                  <Link href="/shipping-policy" className="text-[#800020] font-semibold hover:opacity-80 transition">Shipping Policy</Link>
                  <Link href="/exchange-and-return" className="text-[#800020] font-semibold hover:opacity-80 transition">Exchange &amp; Return</Link>
                  <Link href="/terms-and-conditions" className="text-[#800020] font-semibold hover:opacity-80 transition">Terms &amp; Conditions</Link>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 p-5">
                <h3 className="text-base font-bold mb-2">Good to Know</h3>
                <p className="text-sm text-gray-700">We do not sell your personal information. We only share it with trusted partners to deliver your orders and provide support.</p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
