export const metadata = {
  title: "Terms & Conditions | Miray Fashions",
  description:
    "Read Miray Fashions' Terms & Conditions to understand our policies on purchases, returns, privacy, and customer commitments.",
};

export default function TermsPage() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-16 text-gray-800 leading-relaxed">
      <h1 className="text-3xl md:text-4xl font-semibold mb-6 text-center text-gray-900">
        Terms & Conditions
      </h1>

      <p className="text-gray-600 mb-8 text-center">
        Welcome to Miray Fashions. By accessing or purchasing from our website, you agree to the following terms and conditions.
      </p>

      <div className="space-y-8">
        {/* Section 1 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">1. General Information</h2>
          <p>
            Miray Fashions (“we”, “us”, “our”) operates{" "}
            <a
              href="https://mirayfashions.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-600 underline"
            >
              mirayfashions.com
            </a>
            . By using our site or making a purchase, you acknowledge that you have read and agree to be bound by these Terms & Conditions.
          </p>
        </section>

        {/* Section 2 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">2. Product & Service Availability</h2>
          <p>
            All products displayed on our website are subject to availability. We reserve the right to modify or discontinue any item at any time without prior notice. Prices and availability are subject to change.
          </p>
        </section>

        {/* Section 3 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">3. Orders & Payments</h2>
          <p>
            Once an order is placed, you will receive an order confirmation via email. We reserve the right to cancel or refuse any order at our discretion. Payments are processed securely through our authorized payment gateways.
          </p>
        </section>

        {/* Section 4 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">4. Shipping & Delivery</h2>
          <p>
            Delivery timelines vary based on product availability and location. Miray Fashions is not responsible for delays caused by logistics providers or unforeseen circumstances beyond our control.
          </p>
        </section>

        {/* Section 5 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">5. Returns & Refunds</h2>
          <p>
            Please refer to our{" "}
            <a href="/returns" className="text-pink-600 underline">
              Returns Policy
            </a>{" "}
            for detailed information. Refunds, where applicable, will be processed within 7–10 business days after approval.
          </p>
        </section>

        {/* Section 6 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">6. Intellectual Property</h2>
          <p>
            All content, including images, logos, and text, is the intellectual property of Miray Fashions. Reproduction or redistribution of any materials without written consent is strictly prohibited.
          </p>
        </section>

        {/* Section 7 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">7. Limitation of Liability</h2>
          <p>
            Miray Fashions shall not be liable for any indirect, incidental, or consequential damages resulting from the use of our services or products.
          </p>
        </section>

        {/* Section 8 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">8. Privacy Policy</h2>
          <p>
            We are committed to protecting your privacy. Please read our{" "}
            <a href="/privacy" className="text-pink-600 underline">
              Privacy Policy
            </a>{" "}
            to learn more about how your data is collected and used.
          </p>
        </section>

        {/* Section 9 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">9. Changes to Terms</h2>
          <p>
            Miray Fashions reserves the right to update or modify these terms at any time without prior notice. Continued use of our website implies acceptance of the revised terms.
          </p>
        </section>

        {/* Section 10 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">10. Contact Us</h2>
          <p>
            For any questions regarding these Terms & Conditions, please contact us at{" "}
            <a href="mailto:support@mirayfashions.com" className="text-pink-600 underline">
              support@mirayfashions.com
            </a>
            .
          </p>
        </section>
      </div>
    </section>
  );
}
