"use client";

import { useState } from "react";

const DEFAULT_HTML = `
<section style="max-width:980px;margin:0 auto;padding:60px 20px;font-family:Inter,Arial,sans-serif;color:#111;background:#fff;">

  <div style="text-align:center;margin-bottom:50px;">
    <div style="display:inline-block;padding:8px 18px;border:1px solid #ddd;border-radius:999px;font-size:12px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;">
      Support
    </div>

    <h1 style="font-size:52px;line-height:1.05;margin:24px 0 18px;font-weight:800;">
      Frequently Asked Questions
    </h1>

    <p style="max-width:640px;margin:0 auto;font-size:18px;line-height:1.8;color:#666;">
      Everything you need to know about ordering, shipping, returns,
      payments and your OATCLUB experience.
    </p>
  </div>

  <div style="display:grid;gap:18px;">

    <details open style="border:1px solid #e5e5e5;border-radius:16px;padding:22px;background:#fff;">
      <summary style="cursor:pointer;font-size:20px;font-weight:700;">
        How long does shipping take?
      </summary>

      <p style="margin-top:18px;line-height:1.9;color:#555;">
        Most orders are dispatched within 24–48 business hours.
        Delivery generally takes 3–7 business days depending on your location.
      </p>
    </details>

    <details style="border:1px solid #e5e5e5;border-radius:16px;padding:22px;background:#fff;">
      <summary style="cursor:pointer;font-size:20px;font-weight:700;">
        Can I exchange my order?
      </summary>

      <p style="margin-top:18px;line-height:1.9;color:#555;">
        Yes. Eligible products can be exchanged according to our Exchange Policy.
        Simply initiate an exchange request from your account or contact support.
      </p>
    </details>

    <details style="border:1px solid #e5e5e5;border-radius:16px;padding:22px;background:#fff;">
      <summary style="cursor:pointer;font-size:20px;font-weight:700;">
        Do you offer Cash on Delivery?
      </summary>

      <p style="margin-top:18px;line-height:1.9;color:#555;">
        Yes, Cash on Delivery is available on selected pin codes.
        Availability is automatically shown during checkout.
      </p>
    </details>

    <details style="border:1px solid #e5e5e5;border-radius:16px;padding:22px;background:#fff;">
      <summary style="cursor:pointer;font-size:20px;font-weight:700;">
        How do I track my order?
      </summary>

      <p style="margin-top:18px;line-height:1.9;color:#555;">
        Once your order is shipped you'll receive tracking information through
        email and WhatsApp along with your tracking link.
      </p>
    </details>

    <details style="border:1px solid #e5e5e5;border-radius:16px;padding:22px;background:#fff;">
      <summary style="cursor:pointer;font-size:20px;font-weight:700;">
        What payment methods are accepted?
      </summary>

      <p style="margin-top:18px;line-height:1.9;color:#555;">
        We accept UPI, Credit Cards, Debit Cards, Net Banking,
        Wallets and Cash on Delivery wherever available.
      </p>
    </details>

    <details style="border:1px solid #e5e5e5;border-radius:16px;padding:22px;background:#fff;">
      <summary style="cursor:pointer;font-size:20px;font-weight:700;">
        Can I cancel my order?
      </summary>

      <p style="margin-top:18px;line-height:1.9;color:#555;">
        Orders can be cancelled before dispatch.
        Once shipped, cancellation may not be possible.
      </p>
    </details>

    <details style="border:1px solid #e5e5e5;border-radius:16px;padding:22px;background:#fff;">
      <summary style="cursor:pointer;font-size:20px;font-weight:700;">
        How do I choose the correct size?
      </summary>

      <p style="margin-top:18px;line-height:1.9;color:#555;">
        Every product includes a detailed Size Guide.
        You can also use our Size Recommendation tool for a better fit.
      </p>
    </details>

    <details style="border:1px solid #e5e5e5;border-radius:16px;padding:22px;background:#fff;">
      <summary style="cursor:pointer;font-size:20px;font-weight:700;">
        Are your products original?
      </summary>

      <p style="margin-top:18px;line-height:1.9;color:#555;">
        Absolutely. Every OATCLUB product is quality checked before dispatch
        to ensure premium craftsmanship and finish.
      </p>
    </details>

  </div>

  <div style="margin-top:70px;padding:40px;background:#111;color:#fff;border-radius:24px;text-align:center;">

    <h2 style="font-size:36px;margin:0 0 16px;">
      Still need help?
    </h2>

    <p style="max-width:620px;margin:0 auto 28px;line-height:1.8;color:#ddd;">
      Our support team is always happy to help with sizing,
      orders, returns or any other questions.
    </p>

    <a
      href="#"
      style="
      display:inline-block;
      padding:16px 34px;
      background:#fff;
      color:#111;
      text-decoration:none;
      border-radius:999px;
      font-weight:700;
      ">
      Contact Support
    </a>

  </div>

</section>
`;

export default function TestCMSPage() {
  const [title, setTitle] = useState("About Us");
  const [html, setHtml] = useState(DEFAULT_HTML);

  const handleSave = () => {
    console.log({
      title,
      html,
    });

    alert("Later this will save into MongoDB.");
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "420px 1fr",
        height: "100vh",
      }}
    >
      {/* Left Panel */}
      <div
        style={{
          borderRight: "1px solid #ddd",
          padding: 20,
          overflow: "auto",
        }}
      >
        <h2>CMS Editor</h2>

        <div style={{ marginTop: 20 }}>
          <label>Page Title</label>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: "100%",
              marginTop: 8,
              padding: 12,
              border: "1px solid #ccc",
              borderRadius: 8,
            }}
          />
        </div>

        <div style={{ marginTop: 20 }}>
          <label>HTML</label>

          <textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            style={{
              width: "100%",
              height: "70vh",
              marginTop: 8,
              padding: 14,
              fontFamily: "monospace",
              fontSize: 14,
              border: "1px solid #ccc",
              borderRadius: 8,
              resize: "vertical",
            }}
          />
        </div>

        <button
          onClick={handleSave}
          style={{
            marginTop: 20,
            width: "100%",
            padding: 14,
            background: "#000",
            color: "#fff",
            border: 0,
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 16,
          }}
        >
          Save
        </button>
      </div>

      {/* Right Panel */}
      <div
        style={{
          overflow: "auto",
          background: "#fafafa",
        }}
      >
        <div
          style={{
            padding: 30,
            borderBottom: "1px solid #eee",
            background: "#fff",
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 34,
            }}
          >
            {title}
          </h1>
        </div>

        <div
          style={{
            padding: 40,
            background: "#fff",
            minHeight: "100%",
          }}
          dangerouslySetInnerHTML={{
            __html: html,
          }}
        />
      </div>
    </div>
  );
}