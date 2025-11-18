"use client";

import { useState } from "react";
import { Mail, ArrowRight, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setEmail("");
  };

  return (
    <section className="w-full bg-white py-14 px-6 md:px-10 flex justify-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        viewport={{ once: true }}
        className="max-w-xl w-full text-center flex flex-col items-center"
      >
        {/* Clean Minimal Icon */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="mb-3"
        >
          <Mail className="w-10 h-10 text-[#800020]" />
        </motion.div>

        {/* Simple Heading */}
        <h2 className="text-xl md:text-2xl font-semibold text-black mb-2 tracking-tight">
          Stay Updated
        </h2>

        {/* Subtle Subtitle */}
        <p className="text-gray-600 text-sm leading-relaxed mb-6">
          Get new arrivals and exclusive offers directly to your inbox.
        </p>

        {/* Form / Success */}
        {!submitted ? (
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="w-full flex bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
          >
            {/* Input */}
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 text-sm text-gray-800 outline-none placeholder-gray-400"
              required
            />

            {/* Button */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 bg-[#800020] text-white flex items-center justify-center gap-2 text-sm font-medium hover:bg-[#990028] transition-colors"
            >
              Subscribe
              <motion.div
                initial={{ x: -4 }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.25 }}
              >
                <ArrowRight className="w-4 h-4" />
              </motion.div>
            </motion.button>
          </motion.form>
        ) : (
          // SUCCESS STATE
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 mt-4 text-[#800020] bg-white border border-gray-200 px-4 py-3 rounded-xl shadow-sm"
          >
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">You're subscribed!</span>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
