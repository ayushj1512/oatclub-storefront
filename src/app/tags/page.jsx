"use client";

import { useEffect, useMemo } from "react";
import { Download, Printer } from "lucide-react";

const LOGO_URL =
  "https://res.cloudinary.com/dpsvrt4sd/image/upload/v1780338447/qavpt44lsxsy3wrvuwi8.png";

const SIZES = ["XS", "S", "M", "L", "XL"];

const PRICES = [
  "₹1,499",
  "₹1,799",
  "₹1,999",
  "₹2,299",
  "₹2,499",
  "₹2,799",
  "₹2,999",
  "₹3,499",
];

const CONCEPTS = [
  {
    id: 1,
    name: "Editorial Frame",
    variant: "editorial-frame",
    sku: "OC-AURA-1081-XS",
  },
  {
    id: 2,
    name: "Soft Arch",
    variant: "soft-arch",
    sku: "OC-ARC-1082-S",
  },
  {
    id: 3,
    name: "Monogram Circle",
    variant: "monogram-circle",
    sku: "OC-RING-1083-M",
  },
  {
    id: 4,
    name: "Modern Split",
    variant: "modern-split",
    sku: "OC-MONO-1084-L",
  },
  {
    id: 5,
    name: "Luxury Black",
    variant: "luxury-black",
    sku: "OC-NOIR-1085-XL",
  },
  {
    id: 6,
    name: "Minimal Lines",
    variant: "minimal-lines",
    sku: "OC-LUXE-1086-XS",
  },
  {
    id: 7,
    name: "Dotted Studio",
    variant: "dotted-studio",
    sku: "OC-DOT-1087-S",
  },
  {
    id: 8,
    name: "Gallery Border",
    variant: "gallery-border",
    sku: "OC-LINE-1088-M",
  },
  {
    id: 9,
    name: "Diagonal Form",
    variant: "diagonal-form",
    sku: "OC-FORM-1089-L",
  },
  {
    id: 10,
    name: "Capsule Frame",
    variant: "capsule-frame",
    sku: "OC-ICON-1090-XL",
  },
  {
    id: 11,
    name: "Studio Grid",
    variant: "studio-grid",
    sku: "OC-STUDIO-1091-XS",
  },
  {
    id: 12,
    name: "Double Border",
    variant: "double-border",
    sku: "OC-CORE-1092-S",
  },
  {
    id: 13,
    name: "Statement Type",
    variant: "statement-type",
    sku: "OC-PREMIUM-1093-M",
  },
  {
    id: 14,
    name: "Club Edition",
    variant: "club-edition",
    sku: "OC-CLUB-1094-L",
  },
  {
    id: 15,
    name: "Orbital",
    variant: "orbital",
    sku: "OC-NOVA-1095-XL",
  },
  {
    id: 16,
    name: "Rare Edition",
    variant: "rare-edition",
    sku: "OC-RARE-1096-XS",
  },
  {
    id: 17,
    name: "Bold Side",
    variant: "bold-side",
    sku: "OC-BOLD-1097-S",
  },
  {
    id: 18,
    name: "Museum Label",
    variant: "museum-label",
    sku: "OC-MUSE-1098-M",
  },
  {
    id: 19,
    name: "Contour",
    variant: "contour",
    sku: "OC-MOOD-1099-L",
  },
  {
    id: 20,
    name: "Fashion Edit",
    variant: "fashion-edit",
    sku: "OC-EDIT-1100-XL",
  },
];

const getBarcodeValue = (concept) =>
  `OATCLUB${String(1000 + concept.id).padStart(4, "0")}`;

function DecorativeLayer({ variant }) {
  return (
    <div
      aria-hidden="true"
      className={`tag-decoration decoration-${variant}`}
    >
      <span className="shape shape-one" />
      <span className="shape shape-two" />
      <span className="shape shape-three" />
      <span className="background-word">OATCLUB</span>
    </div>
  );
}

function ProductTag({ concept, index }) {
  const size = SIZES[index % SIZES.length];
  const price = PRICES[index % PRICES.length];

  return (
    <article className="concept-card">
      <div className="concept-header">
        <div>
          <span className="concept-number">
            {String(concept.id).padStart(2, "0")}
          </span>

          <p className="concept-name">{concept.name}</p>
        </div>

        <span className="concept-status">Concept</span>
      </div>

      <div className={`product-tag tag-${concept.variant}`}>
        <DecorativeLayer variant={concept.variant} />

        <div className="tag-content">
          <div className="tag-hole" />

          <div className="tag-brand">
            <img
              src={LOGO_URL}
              alt="OATCLUB"
              className="tag-logo"
              loading="lazy"
            />
          </div>

          <div className="exchange-copy">
            <strong>Easy Exchange</strong>
            <span>www.oatclub.com/exchange</span>
          </div>

          <div className="barcode-area">
            <svg
              className="barcode"
              data-barcode={getBarcodeValue(concept)}
              aria-label={`Barcode for ${concept.sku}`}
            />
          </div>

          <div className="product-code">{concept.sku}</div>

          <div className="product-details">
            <div className="detail-row">
              <span>Size</span>
              <strong>{size}</strong>
            </div>

            <div className="detail-row">
              <span>Net Quantity</span>
              <strong>1 N</strong>
            </div>

            <div className="detail-row price-row">
              <span>MRP</span>
              <strong>{price}</strong>
            </div>
          </div>

          <div className="inclusive-copy">
            Inclusive of all applicable taxes
          </div>

          <footer className="tag-footer">
            <strong>Manufactured &amp; Marketed by OATCLUB</strong>
            <span>Made in India</span>
            <span>support@oatclub.com</span>
          </footer>
        </div>
      </div>
    </article>
  );
}

export default function TagsPage() {
  const concepts = useMemo(() => CONCEPTS, []);

  useEffect(() => {
    let cancelled = false;

    const renderBarcodes = async () => {
      try {
        const module = await import("jsbarcode");
        const JsBarcode = module.default;

        if (cancelled) return;

        document.querySelectorAll("[data-barcode]").forEach((element) => {
          const value = element.getAttribute("data-barcode");

          if (!value) return;

          JsBarcode(element, value, {
            format: "CODE128",
            displayValue: false,
            height: 52,
            width: 1.45,
            margin: 0,
            background: "transparent",
            lineColor: "currentColor",
          });
        });
      } catch (error) {
        console.error("Unable to render tag barcodes:", error);
      }
    };

    renderBarcodes();

    return () => {
      cancelled = true;
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    window.print();
  };

  return (
    <main className="tags-page">
      <section className="page-header">
        <div className="header-copy">
          <span className="eyebrow">OATCLUB · Own All Trends</span>

          <h1>Premium Hang Tag Concepts</h1>

          <p>
            Twenty refined black-and-white tag directions prepared for
            stakeholder review and final production selection.
          </p>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={handlePrint}
          >
            <Printer size={17} strokeWidth={1.8} />
            Print concepts
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={handleDownload}
          >
            <Download size={17} strokeWidth={1.8} />
            Save as PDF
          </button>
        </div>
      </section>

      <section className="review-strip">
        <div>
          <strong>20</strong>
          <span>Concepts</span>
        </div>

        <div>
          <strong>4</strong>
          <span>Columns</span>
        </div>

        <div>
          <strong>B&amp;W</strong>
          <span>Premium Direction</span>
        </div>

        <div>
          <strong>Print</strong>
          <span>Ready Preview</span>
        </div>
      </section>

      <section className="concept-grid">
        {concepts.map((concept, index) => (
          <ProductTag
            key={concept.id}
            concept={concept}
            index={index}
          />
        ))}
      </section>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap");

        :root {
          --page-bg: #f4f4f2;
          --card-bg: #ffffff;
          --text: #111111;
          --muted: #737373;
          --soft: #ededeb;
          --border: #dededb;
        }

        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: var(--page-bg);
          color: var(--text);
          font-family: "Poppins", sans-serif;
        }

        button,
        input,
        textarea,
        select {
          font-family: inherit;
        }

        .tags-page {
          width: 100%;
          min-height: 100vh;
          padding: 38px 30px 70px;
        }

        .page-header {
          width: min(1400px, 100%);
          margin: 0 auto 22px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 32px;
          padding: 32px;
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 24px;
        }

        .header-copy {
          max-width: 760px;
        }

        .eyebrow {
          display: block;
          margin-bottom: 10px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.17em;
          text-transform: uppercase;
          color: #737373;
        }

        .page-header h1 {
          margin: 0;
          font-size: clamp(30px, 4vw, 52px);
          line-height: 1.05;
          letter-spacing: -0.045em;
          font-weight: 700;
        }

        .page-header p {
          max-width: 650px;
          margin: 15px 0 0;
          color: #686868;
          font-size: 14px;
          line-height: 1.75;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .header-actions button {
          min-height: 46px;
          padding: 0 17px;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          border: 1px solid #111111;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition:
            transform 180ms ease,
            background 180ms ease,
            color 180ms ease;
        }

        .header-actions button:hover {
          transform: translateY(-2px);
        }

        .secondary-button {
          background: #ffffff;
          color: #111111;
        }

        .secondary-button:hover {
          background: #f5f5f5;
        }

        .primary-button {
          background: #111111;
          color: #ffffff;
        }

        .primary-button:hover {
          background: #282828;
        }

        .review-strip {
          width: min(1400px, 100%);
          margin: 0 auto 22px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          overflow: hidden;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 18px;
          background: #ffffff;
        }

        .review-strip > div {
          min-height: 82px;
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          border-right: 1px solid #e8e8e6;
        }

        .review-strip > div:last-child {
          border-right: 0;
        }

        .review-strip strong {
          font-size: 18px;
          line-height: 1;
        }

        .review-strip span {
          margin-top: 8px;
          font-size: 10px;
          font-weight: 600;
          color: #818181;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .concept-grid {
          width: min(1400px, 100%);
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 22px;
          align-items: start;
        }

        .concept-card {
          min-width: 0;
          padding: 13px;
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 20px;
          transition:
            transform 220ms ease,
            box-shadow 220ms ease;
        }

        .concept-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.08);
        }

        .concept-header {
          min-height: 51px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .concept-header > div {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .concept-number {
          width: 29px;
          height: 29px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #ffffff;
          background: #111111;
          border-radius: 50%;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.04em;
        }

        .concept-name {
          margin: 0;
          overflow: hidden;
          color: #202020;
          font-size: 11px;
          font-weight: 600;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .concept-status {
          flex-shrink: 0;
          padding: 5px 8px;
          border: 1px solid #e2e2e2;
          border-radius: 999px;
          color: #858585;
          font-size: 8px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .product-tag {
          width: 100%;
          aspect-ratio: 300 / 470;
          position: relative;
          overflow: hidden;
          color: #111111;
          background: #ffffff;
          border: 1px solid #d8d8d5;
          border-radius: 17px;
          isolation: isolate;
        }

        .tag-content {
          height: 100%;
          position: relative;
          z-index: 5;
          padding: 5.5% 8% 5%;
          display: flex;
          flex-direction: column;
          align-items: stretch;
        }

        .tag-decoration {
          position: absolute;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .shape,
        .background-word {
          position: absolute;
          display: block;
        }

        .background-word {
          display: none;
          color: rgba(0, 0, 0, 0.035);
          font-size: clamp(34px, 3.2vw, 52px);
          font-weight: 800;
          letter-spacing: -0.06em;
          white-space: nowrap;
        }

        .tag-hole {
          width: 11px;
          height: 11px;
          margin: 0 auto 5%;
          flex-shrink: 0;
          border: 2px solid #bdbdbd;
          border-radius: 50%;
          background: transparent;
          box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.5);
        }

        .tag-brand {
          height: 11%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tag-logo {
          display: block;
          width: 51%;
          max-height: 100%;
          object-fit: contain;
        }

        .exchange-copy {
          margin-top: 4%;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .exchange-copy strong {
          font-size: clamp(7px, 0.68vw, 10px);
          font-weight: 700;
          letter-spacing: 0.02em;
        }

        .exchange-copy span {
          margin-top: 2px;
          color: #777777;
          font-size: clamp(6px, 0.58vw, 8px);
          line-height: 1.4;
        }

        .barcode-area {
          height: 16%;
          margin-top: 6%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .barcode {
          width: 100%;
          height: 100%;
          color: inherit;
        }

        .product-code {
          margin-top: 5%;
          overflow-wrap: anywhere;
          text-align: center;
          font-size: clamp(9px, 1vw, 14px);
          font-weight: 800;
          letter-spacing: 0.045em;
          line-height: 1.25;
        }

        .product-details {
          margin-top: 5%;
          padding: 4% 0;
          border-top: 1px solid rgba(0, 0, 0, 0.16);
          border-bottom: 1px solid rgba(0, 0, 0, 0.16);
        }

        .detail-row {
          min-height: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          font-size: clamp(7px, 0.68vw, 10px);
        }

        .detail-row span {
          color: #777777;
        }

        .detail-row strong {
          font-weight: 700;
        }

        .price-row strong {
          font-size: clamp(9px, 0.85vw, 12px);
        }

        .inclusive-copy {
          margin-top: 2.5%;
          text-align: center;
          color: #858585;
          font-size: clamp(5px, 0.52vw, 7.5px);
          line-height: 1.4;
        }

        .tag-footer {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          color: #707070;
          font-size: clamp(5px, 0.51vw, 7.4px);
          line-height: 1.55;
        }

        .tag-footer strong {
          color: inherit;
          font-size: inherit;
          font-weight: 600;
        }

        /* 01 — Editorial Frame */

        .decoration-editorial-frame {
          inset: 4.5%;
          border: 1px solid rgba(0, 0, 0, 0.75);
          border-radius: 12px;
        }

        .decoration-editorial-frame::before,
        .decoration-editorial-frame::after {
          content: "";
          position: absolute;
          left: 10%;
          right: 10%;
          height: 1px;
          background: rgba(0, 0, 0, 0.22);
        }

        .decoration-editorial-frame::before {
          top: 23%;
        }

        .decoration-editorial-frame::after {
          bottom: 21%;
        }

        /* 02 — Soft Arch */

        .tag-soft-arch {
          border-radius: 48% 48% 17px 17px;
        }

        .decoration-soft-arch {
          inset: 4.5%;
          border: 1px solid rgba(0, 0, 0, 0.6);
          border-radius: 48% 48% 12px 12px;
        }

        /* 03 — Monogram Circle */

        .decoration-monogram-circle .shape-one {
          width: 78%;
          aspect-ratio: 1;
          top: 18%;
          left: 11%;
          border: 18px solid rgba(0, 0, 0, 0.035);
          border-radius: 50%;
        }

        .decoration-monogram-circle .background-word {
          display: block;
          top: 33%;
          left: 50%;
          transform: translateX(-50%);
          font-size: clamp(40px, 4.5vw, 70px);
        }

        /* 04 — Modern Split */

        .decoration-modern-split {
          background:
            linear-gradient(
              135deg,
              transparent 0 48%,
              rgba(0, 0, 0, 0.035) 48% 100%
            );
        }

        .decoration-modern-split::after {
          content: "";
          position: absolute;
          top: 7%;
          bottom: 7%;
          left: 50%;
          width: 1px;
          background: rgba(0, 0, 0, 0.08);
          transform: rotate(8deg);
        }

        /* 05 — Luxury Black */

        .tag-luxury-black {
          color: #ffffff;
          background: #0d0d0d;
          border-color: #0d0d0d;
        }

        .tag-luxury-black .tag-logo {
          filter: brightness(0) invert(1);
        }

        .tag-luxury-black .tag-hole {
          border-color: rgba(255, 255, 255, 0.65);
        }

        .tag-luxury-black .exchange-copy span,
        .tag-luxury-black .detail-row span,
        .tag-luxury-black .inclusive-copy,
        .tag-luxury-black .tag-footer {
          color: rgba(255, 255, 255, 0.62);
        }

        .tag-luxury-black .product-details {
          border-color: rgba(255, 255, 255, 0.22);
        }

        .decoration-luxury-black {
          inset: 4.5%;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
        }

        /* 06 — Minimal Lines */

        .decoration-minimal-lines {
          background: repeating-linear-gradient(
            90deg,
            rgba(0, 0, 0, 0.035) 0,
            rgba(0, 0, 0, 0.035) 1px,
            transparent 1px,
            transparent 16px
          );
        }

        .decoration-minimal-lines::before {
          content: "";
          position: absolute;
          inset: 4%;
          background: #ffffff;
          border-radius: 12px;
        }

        /* 07 — Dotted Studio */

        .decoration-dotted-studio {
          background-image: radial-gradient(
            rgba(0, 0, 0, 0.14) 0.8px,
            transparent 0.8px
          );
          background-size: 12px 12px;
          mask-image: linear-gradient(
            to bottom,
            #000 0 18%,
            transparent 31% 70%,
            #000 85%
          );
        }

        /* 08 — Gallery Border */

        .decoration-gallery-border {
          inset: 4%;
          border: 1px solid #111111;
        }

        .decoration-gallery-border::after {
          content: "";
          position: absolute;
          inset: 4%;
          border: 1px solid rgba(0, 0, 0, 0.13);
        }

        /* 09 — Diagonal Form */

        .decoration-diagonal-form::before {
          content: "";
          position: absolute;
          width: 145%;
          height: 18%;
          left: -22%;
          bottom: 18%;
          background: rgba(0, 0, 0, 0.04);
          transform: rotate(-10deg);
        }

        .decoration-diagonal-form::after {
          content: "";
          position: absolute;
          width: 70%;
          height: 1px;
          right: -8%;
          top: 20%;
          background: rgba(0, 0, 0, 0.35);
          transform: rotate(-10deg);
        }

        /* 10 — Capsule Frame */

        .decoration-capsule-frame {
          inset: 4.5%;
          border: 1px solid rgba(0, 0, 0, 0.68);
          border-radius: 999px;
        }

        /* 11 — Studio Grid */

        .decoration-studio-grid {
          background-image:
            linear-gradient(rgba(0, 0, 0, 0.035) 1px, transparent 1px),
            linear-gradient(
              90deg,
              rgba(0, 0, 0, 0.035) 1px,
              transparent 1px
            );
          background-size: 20px 20px;
        }

        .decoration-studio-grid::after {
          content: "";
          position: absolute;
          inset: 5%;
          background: rgba(255, 255, 255, 0.89);
          border-radius: 11px;
        }

        /* 12 — Double Border */

        .decoration-double-border {
          inset: 3.5%;
          border: 1px solid #111111;
          border-radius: 11px;
        }

        .decoration-double-border::after {
          content: "";
          position: absolute;
          inset: 3.5%;
          border: 1px dashed rgba(0, 0, 0, 0.32);
          border-radius: 8px;
        }

        /* 13 — Statement Type */

        .decoration-statement-type .background-word {
          display: block;
          top: 37%;
          left: 50%;
          transform: translateX(-50%) rotate(-90deg);
          font-size: clamp(52px, 5.5vw, 86px);
          color: rgba(0, 0, 0, 0.035);
        }

        /* 14 — Club Edition */

        .tag-club-edition::before {
          content: "";
          position: absolute;
          z-index: 1;
          top: 0;
          left: 0;
          right: 0;
          height: 15%;
          background: #111111;
        }

        .tag-club-edition .tag-hole {
          border-color: rgba(255, 255, 255, 0.9);
        }

        .tag-club-edition .tag-brand {
          margin-top: 1%;
        }

        .decoration-club-edition::after {
          content: "CLUB EDITION";
          position: absolute;
          right: -14%;
          bottom: 25%;
          color: rgba(0, 0, 0, 0.045);
          font-size: clamp(24px, 2.7vw, 42px);
          font-weight: 800;
          letter-spacing: -0.04em;
          transform: rotate(90deg);
        }

        /* 15 — Orbital */

        .decoration-orbital .shape-one,
        .decoration-orbital .shape-two {
          left: 50%;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          transform: translateX(-50%);
        }

        .decoration-orbital .shape-one {
          width: 74%;
          aspect-ratio: 1;
          top: 16%;
        }

        .decoration-orbital .shape-two {
          width: 55%;
          aspect-ratio: 1;
          top: 25%;
        }

        /* 16 — Rare Edition */

        .decoration-rare-edition {
          background:
            radial-gradient(
              circle at 13% 12%,
              rgba(0, 0, 0, 0.05) 0 10%,
              transparent 10.5%
            ),
            radial-gradient(
              circle at 90% 88%,
              rgba(0, 0, 0, 0.05) 0 15%,
              transparent 15.5%
            );
        }

        .decoration-rare-edition::after {
          content: "RARE";
          position: absolute;
          left: 50%;
          top: 38%;
          color: rgba(0, 0, 0, 0.04);
          font-size: clamp(54px, 6vw, 94px);
          font-weight: 800;
          transform: translateX(-50%);
        }

        /* 17 — Bold Side */

        .tag-bold-side::before,
        .tag-bold-side::after {
          content: "";
          position: absolute;
          z-index: 1;
          top: 0;
          bottom: 0;
          width: 6%;
          background: #111111;
        }

        .tag-bold-side::before {
          left: 0;
        }

        .tag-bold-side::after {
          right: 0;
        }

        .tag-bold-side .tag-content {
          padding-left: 11%;
          padding-right: 11%;
        }

        /* 18 — Museum Label */

        .decoration-museum-label::before,
        .decoration-museum-label::after {
          content: "";
          position: absolute;
          left: 7%;
          right: 7%;
          height: 1px;
          background: rgba(0, 0, 0, 0.7);
        }

        .decoration-museum-label::before {
          top: 25%;
        }

        .decoration-museum-label::after {
          bottom: 24%;
        }

        .decoration-museum-label .shape-one {
          inset: 3.5%;
          border-top: 2px solid #111111;
          border-bottom: 2px solid #111111;
        }

        /* 19 — Contour */

        .decoration-contour .shape-one {
          width: 72%;
          height: 58%;
          right: -29%;
          bottom: -15%;
          border: 18px solid rgba(0, 0, 0, 0.04);
          border-radius: 50%;
        }

        .decoration-contour .shape-two {
          width: 45%;
          aspect-ratio: 1;
          left: -23%;
          top: 20%;
          border: 1px solid rgba(0, 0, 0, 0.14);
          border-radius: 50%;
        }

        /* 20 — Fashion Edit */

        .tag-fashion-edit {
          background:
            linear-gradient(
              180deg,
              #ffffff 0 48%,
              rgba(0, 0, 0, 0.018) 48% 100%
            );
        }

        .decoration-fashion-edit {
          inset: 4%;
          border: 1px solid rgba(0, 0, 0, 0.7);
          border-radius: 48% 48% 11px 11px;
        }

        .decoration-fashion-edit::after {
          content: "THE EDIT";
          position: absolute;
          left: 50%;
          bottom: 6%;
          color: rgba(0, 0, 0, 0.055);
          font-size: clamp(20px, 2.2vw, 34px);
          font-weight: 800;
          letter-spacing: 0.05em;
          white-space: nowrap;
          transform: translateX(-50%);
        }

        @media (max-width: 1180px) {
          .concept-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .detail-row {
            font-size: 9px;
          }

          .exchange-copy strong {
            font-size: 9px;
          }

          .exchange-copy span {
            font-size: 7px;
          }

          .tag-footer {
            font-size: 6.5px;
          }
        }

        @media (max-width: 900px) {
          .tags-page {
            padding: 24px 18px 50px;
          }

          .page-header {
            align-items: flex-start;
            flex-direction: column;
            padding: 25px;
          }

          .header-actions {
            width: 100%;
          }

          .header-actions button {
            flex: 1;
          }

          .concept-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
          }

          .review-strip {
            grid-template-columns: repeat(2, 1fr);
          }

          .review-strip > div:nth-child(2) {
            border-right: 0;
          }

          .review-strip > div:nth-child(-n + 2) {
            border-bottom: 1px solid #e8e8e6;
          }

          .product-code {
            font-size: 12px;
          }

          .detail-row {
            font-size: 9px;
          }

          .exchange-copy strong {
            font-size: 9px;
          }

          .exchange-copy span {
            font-size: 7px;
          }

          .inclusive-copy {
            font-size: 6.5px;
          }

          .tag-footer {
            font-size: 6.5px;
          }
        }

        @media (max-width: 560px) {
          .tags-page {
            padding: 14px 12px 40px;
          }

          .page-header {
            margin-bottom: 14px;
            padding: 21px 18px;
            border-radius: 18px;
          }

          .page-header h1 {
            font-size: 31px;
          }

          .page-header p {
            font-size: 12px;
            line-height: 1.65;
          }

          .header-actions {
            flex-direction: column;
          }

          .header-actions button {
            width: 100%;
          }

          .review-strip {
            margin-bottom: 14px;
            border-radius: 15px;
          }

          .review-strip > div {
            min-height: 70px;
            padding: 13px 14px;
          }

          .review-strip strong {
            font-size: 15px;
          }

          .review-strip span {
            font-size: 8px;
          }

          .concept-grid {
            grid-template-columns: 1fr;
            gap: 15px;
          }

          .concept-card {
            width: min(100%, 390px);
            margin-inline: auto;
            padding: 12px;
            border-radius: 18px;
          }

          .concept-header {
            min-height: 44px;
            margin-bottom: 9px;
          }

          .product-code {
            font-size: 15px;
          }

          .detail-row {
            min-height: 22px;
            font-size: 10px;
          }

          .price-row strong {
            font-size: 12px;
          }

          .exchange-copy strong {
            font-size: 10px;
          }

          .exchange-copy span {
            font-size: 8px;
          }

          .inclusive-copy {
            font-size: 7.5px;
          }

          .tag-footer {
            font-size: 7.5px;
          }
        }

        @media print {
          @page {
            size: A4 landscape;
            margin: 8mm;
          }

          body {
            background: #ffffff;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          .tags-page {
            padding: 0;
          }

          .page-header,
          .review-strip {
            display: none;
          }

          .concept-grid {
            width: 100%;
            grid-template-columns: repeat(4, 1fr);
            gap: 5mm;
          }

          .concept-card {
            padding: 2.5mm;
            border-radius: 3mm;
            break-inside: avoid;
            page-break-inside: avoid;
            box-shadow: none;
          }

          .concept-card:hover {
            transform: none;
            box-shadow: none;
          }

          .concept-header {
            min-height: 8mm;
            margin-bottom: 2mm;
          }

          .product-tag {
            border-radius: 3mm;
          }
        }
      `}</style>
    </main>
  );
}