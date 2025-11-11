"use client";

import { Mail, Phone, MessageSquare, Package, RefreshCw, Truck, User, CreditCard } from "lucide-react";
import { useState } from "react";

export default function SupportPage() {
  const [openFAQ, setOpenFAQ] = useState(null);

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const faqs = [
    {
      question: "How can I track my order?",
      answer:
        "Once your order is shipped, you'll receive an email with a tracking link. You can also check your order status in your account under 'My Orders'.",
    },
    {
      question: "What is your return policy?",
      answer:
        "You can request a return within 7 days of delivery for unused items with original tags. Refunds are processed after quality checks.",
    },
    {
      question: "Do you offer cash on delivery (COD)?",
      answer:
        "Yes, we offer COD on select pin codes. You can check availability at checkout.",
    },
    {
      question: "How do I contact support?",
      answer:
        "You can reach us at support@mirayfashions.com or call us at +91 98765 43210 (Mon–Sat, 10 AM–6 PM).",
    },
  ];

  return (
    <main className="flex flex-col w-full bg-gray-50 min-h-screen">
      {/* 🏞 Hero Section */}
      <section className="w-full h-[40vh] bg-pink-100 flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl md:text-5xl font-semibold text-gray-900 mb-3">
          We&apos;re Here to Help
        </h1>
        <p className="text-gray-700 text-sm md:text-base max-w-2xl">
          Find quick answers to your questions or get in touch with our support team.
        </p>
      </section>

      {/* 🧭 Help Topics */}
      <section className="w-full py-16 px-6 md:px-16 bg-white">
        <h2 className="text-2xl md:text-3xl font-semibold text-center text-gray-900 mb-10">
          Popular Help Topics
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
          {[
            { icon: Package, title: "Orders" },
            { icon: Truck, title: "Shipping" },
            { icon: RefreshCw, title: "Returns" },
            { icon: CreditCard, title: "Payments" },
            { icon: User, title: "Account" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center bg-gray-50 rounded-2xl p-6 hover:shadow-md transition-all"
            >
              <item.icon className="w-8 h-8 text-pink-500 mb-3" />
              <h3 className="text-gray-900 font-medium">{item.title}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* 💬 Contact Support */}
      <section className="w-full flex flex-col items-center justify-center py-16 px-6 md:px-16 bg-gray-50">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-8">
          Need More Help?
        </h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-gray-700">
          <div className="flex items-center gap-3">
            <Mail className="text-pink-500 w-5 h-5" />
            <p>support@mirayfashions.com</p>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="text-pink-500 w-5 h-5" />
            <p>+91 98765 43210</p>
          </div>
          <div className="flex items-center gap-3">
            <MessageSquare className="text-pink-500 w-5 h-5" />
            <p>Live Chat (10 AM – 6 PM)</p>
          </div>
        </div>
      </section>

      {/* ❓ FAQ Section */}
      <section className="w-full py-16 px-6 md:px-20 bg-white">
        <h2 className="text-2xl md:text-3xl font-semibold text-center text-gray-900 mb-10">
          Frequently Asked Questions
        </h2>

        <div className="max-w-3xl mx-auto flex flex-col divide-y divide-gray-200">
          {faqs.map((faq, index) => (
            <div key={index} className="py-4">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center text-left"
              >
                <h3 className="text-gray-900 font-medium">{faq.question}</h3>
                <span className="text-pink-500 font-bold">
                  {openFAQ === index ? "−" : "+"}
                </span>
              </button>
              {openFAQ === index && (
                <p className="text-gray-600 text-sm mt-2">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
