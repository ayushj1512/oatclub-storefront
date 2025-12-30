"use client";

import Link from "next/link";

import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <main className="w-full bg-white text-gray-900">
      <section className="px-4 md:px-10 py-12 md:py-16 max-w-7xl mx-auto">

        {/* Header */}
        <header className="mb-12 space-y-3">
          <p className="text-xs font-medium tracking-[0.25em] uppercase text-gray-500">
            Miray Fashions
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Privacy Policy
          </h1>
          <p className="max-w-2xl text-gray-600">
            How we collect, use, share, and protect your information.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">

          {/* CONTENT */}
          <article className="space-y-10">

            {/* Intro */}
            <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
              <p className="text-gray-700">
                Miray Fashions (“we”, “us”, “our”) operates the Miray Fashions
                website and app. This Privacy Policy explains how we collect,
                use, disclose, and safeguard your information when you browse,
                place an order, create an account, or contact support.
              </p>
              <p className="mt-3 text-xs text-gray-500">
                This policy is a standard e-commerce privacy template and may be
                updated based on integrations (payments, analytics, messaging,
                etc.).
              </p>
            </section>

            {/* Sections */}
            {[
              {
                title: "1. Information We Collect",
                body: (
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Personal details:</strong> name, email, phone, billing & shipping address.</li>
                    <li><strong>Order details:</strong> products, order ID, payments, delivery & return data.</li>
                    <li><strong>Support data:</strong> messages, images, ticket history.</li>
                    <li><strong>Device & usage data:</strong> IP address, browser, pages visited.</li>
                    <li><strong>Cookies:</strong> preferences, login, analytics.</li>
                  </ul>
                ),
              },
              {
                title: "2. How We Use Your Information",
                body: (
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Process orders, payments, shipping & delivery.</li>
                    <li>Send order updates and service communications.</li>
                    <li>Provide customer support and resolve issues.</li>
                    <li>Improve products, UX, and performance.</li>
                    <li>Prevent fraud and secure our platform.</li>
                    <li>Send marketing (only where legally allowed).</li>
                  </ul>
                ),
              },
              {
                title: "3. How We Share Your Information",
                body: (
                  <>
                    <ul className="list-disc pl-5 space-y-2">
                      <li><strong>Courier partners</strong> for delivery & tracking.</li>
                      <li><strong>Payment providers</strong> for secure transactions.</li>
                      <li><strong>Service partners</strong> (hosting, analytics, communication).</li>
                      <li><strong>Legal authorities</strong> when required by law.</li>
                    </ul>
                    <p className="mt-3">
                      We do <strong>not</strong> sell your personal information.
                    </p>
                  </>
                ),
              },
              {
                title: "4. Cookies & Tracking",
                body: (
                  <p>
                    Cookies help keep you logged in, remember preferences, and
                    analyze usage. Disabling cookies may affect site
                    functionality.
                  </p>
                ),
              },
              {
                title: "5. Data Security",
                body: (
                  <p>
                    We use reasonable safeguards to protect your data, but no
                    system is completely secure. Please keep your credentials
                    confidential.
                  </p>
                ),
              },
              {
                title: "6. Data Retention",
                body: (
                  <p>
                    Data is retained only as required for services, compliance,
                    dispute resolution, and legal obligations.
                  </p>
                ),
              },
              {
                title: "7. Your Rights",
                body: (
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Review or update account information.</li>
                    <li>Opt out of marketing communications.</li>
                    <li>Request access or deletion (subject to law).</li>
                  </ul>
                ),
              },
              {
                title: "8. Children’s Privacy",
                body: (
                  <p>
                    Our services are not intended for children under the
                    applicable age limit. We do not knowingly collect such data.
                  </p>
                ),
              },
              {
                title: "9. Third-Party Links",
                body: (
                  <p>
                    External links are governed by their own privacy policies.
                    We are not responsible for third-party practices.
                  </p>
                ),
              },
              {
                title: "10. Policy Updates",
                body: (
                  <p>
                    We may update this policy periodically. Changes apply once
                    posted on this page.
                  </p>
                ),
              },
            ].map((sec) => (
              <section key={sec.title} className="space-y-3">
                <h2 className="text-xl md:text-2xl font-bold">
                  {sec.title}
                </h2>
                <div className="text-gray-700">{sec.body}</div>
              </section>
            ))}

            {/* Contact */}
            <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
              <h2 className="text-xl font-bold mb-2">Contact Us</h2>
              <p className="text-gray-700">
                If you have questions about this Privacy Policy, please contact
                our support team.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/support"
                  className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
                >
                  Go to Support
                </Link>
                <Link
                  href="/terms-and-conditions"
                  className="rounded-full border border-gray-300 px-5 py-2 text-sm font-semibold hover:bg-black/5"
                >
                  Terms &amp; Conditions
                </Link>
              </div>
            </section>

            <p className="text-xs text-gray-500">
              Continued use of our services implies acceptance of this policy.
            </p>
          </article>

          {/* SIDEBAR */}
          <aside className="space-y-6 lg:sticky lg:top-28 h-fit">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
              <h3 className="font-bold mb-4">Quick Links</h3>
              <nav className="flex flex-col gap-3 text-sm">
                {[
                  ["/support", "Support"],
                  ["/faq", "FAQs"],
                  ["/shipping-policy", "Shipping Policy"],
                  ["/exchange-and-return", "Exchange & Return"],
                  ["/terms-and-conditions", "Terms & Conditions"],
                ].map(([href, label]) => (
                  <Link
                    key={href}
                    href={href}
                    className="font-medium underline underline-offset-4 hover:opacity-70"
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="rounded-2xl border border-gray-200 p-6">
              <h3 className="font-bold mb-2">Good to Know</h3>
              <p className="text-sm text-gray-700">
                We never sell personal data. Information is shared only with
                trusted partners to fulfill orders and support requests.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

