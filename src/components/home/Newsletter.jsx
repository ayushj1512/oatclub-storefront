"use client";

import { useState } from "react";
import { Mail } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    // TODO: Connect to backend newsletter API (e.g., Mailchimp / custom endpoint)
    setSubmitted(true);
    setEmail("");
  };

  return (
    <section className="w-full bg-gray-50 flex flex-col items-center py-16 px-6 md:px-12 text-center">
      <div className="max-w-3xl w-full flex flex-col items-center">
        <Mail className="w-10 h-10 text-pink-500 mb-4" />
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3">
          Stay Updated with Miray Fashions
        </h2>
        <p className="text-gray-600 mb-8 text-sm md:text-base">
          Be the first to know about our new collections, exclusive offers, and
          style stories straight to your inbox.
        </p>

        {!submitted ? (
          <form
            onSubmit={handleSubmit}
            className="w-full flex flex-col sm:flex-row items-center gap-3 sm:gap-0 bg-white shadow-md rounded-full overflow-hidden max-w-xl"
          >
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-5 py-3 text-sm text-gray-700 focus:outline-none"
              required
            />
            <button
              type="submit"
              className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 text-sm font-medium transition rounded-full sm:rounded-none sm:rounded-r-full"
            >
              Subscribe
            </button>
          </form>
        ) : (
          <p className="text-green-600 font-medium mt-4">
            🎉 Thank you for subscribing!
          </p>
        )}
      </div>
    </section>
  );
}
