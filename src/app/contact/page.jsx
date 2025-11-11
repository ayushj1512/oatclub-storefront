"use client";

import { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    // TODO: connect this to your backend API later (e.g. /api/contact)
    setSubmitted(true);
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <main className="flex flex-col w-full bg-gray-50 min-h-screen">
      {/* 🏞 Hero Section */}
      <section className="w-full h-[40vh] bg-pink-100 flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl md:text-5xl font-semibold text-gray-900 mb-3">
          Get in Touch
        </h1>
        <p className="text-gray-700 text-sm md:text-base max-w-2xl">
          We’d love to hear from you! Reach out for any queries, feedback, or
          collaborations.
        </p>
      </section>

      {/* 💬 Contact Section */}
      <section className="w-full flex flex-col md:flex-row items-start justify-center gap-10 py-16 px-6 md:px-16">
        {/* 🧾 Contact Form */}
        <div className="flex-1 bg-white shadow-md rounded-2xl p-8">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6">
            Send Us a Message
          </h2>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-pink-400 outline-none"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-pink-400 outline-none"
                required
              />
              <textarea
                name="message"
                rows="5"
                placeholder="Your Message"
                value={formData.message}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-pink-400 outline-none resize-none"
                required
              ></textarea>

              <button
                type="submit"
                className="bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium py-2.5 px-6 rounded-full transition"
              >
                Send Message
              </button>
            </form>
          ) : (
            <p className="text-green-600 font-medium">
              🎉 Thank you for reaching out! We’ll get back to you soon.
            </p>
          )}
        </div>

        {/* 📍 Contact Info */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex items-start gap-4">
            <div className="bg-pink-100 p-3 rounded-full">
              <Mail className="text-pink-600 w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Email</h3>
              <p className="text-gray-600 text-sm">support@mirayfashions.com</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-pink-100 p-3 rounded-full">
              <Phone className="text-pink-600 w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Phone</h3>
              <p className="text-gray-600 text-sm">+91 98765 43210</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-pink-100 p-3 rounded-full">
              <MapPin className="text-pink-600 w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Address</h3>
              <p className="text-gray-600 text-sm">
                Miray Fashions HQ,<br />
                Connaught Place, New Delhi, India
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 🗺 Google Map */}
      <section className="w-full h-[300px] md:h-[400px]">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3504.004035049021!2d77.21672191508025!3d28.63287868241765!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd33cc4a7e5d%3A0x6b9b2ad198f5045d!2sConnaught%20Place%2C%20New%20Delhi!5e0!3m2!1sen!2sin!4v1698499999999!5m2!1sen!2sin"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </section>
    </main>
  );
}
