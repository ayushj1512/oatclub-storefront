"use client";

import { useMemo, useState } from "react";
import { Plus, Minus, MessageCircle } from "lucide-react";
import { toast } from "sonner";

const WHATSAPP_NUMBER_DISPLAY = "+91 7303491206";
const WHATSAPP_NUMBER_WA = "917303491206";

function stripHtml(html) {
  if (!html) return "";
  return String(html)
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<\/?[^>]+(>|$)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function money(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return "0";
  return num.toLocaleString("en-IN");
}

function Accordion({ title, children, defaultOpen = false, borderTop = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`${borderTop ? "border-t border-gray-200" : ""} py-3`}>
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex justify-between items-center w-full text-left" aria-expanded={open}>
        <span className="text-base md:text-lg font-semibold text-black">{title}</span>
        {open ? <Minus className="h-5 w-5 text-black" /> : <Plus className="h-5 w-5 text-black" />}
      </button>
      <div className={`transition-all overflow-hidden duration-300 ${open ? "max-h-[900px] mt-3" : "max-h-0"}`}>{open ? children : null}</div>
    </div>
  );
}

export default function SupportSection({
  product,
  selectedSize,
  requireSize = false,
  defaultOpen = false,
}) {
  const safeName = product?.name || "-";
  const safeId = product?.productId || product?.id || "-";
  const safePrice = money(product?.price);

  // Build WhatsApp message (short & clear)
  const whatsappText = useMemo(() => {
    if (!product) return "";

    const desc = stripHtml(
      product.shortDescription || product.description || ""
    ).slice(0, 240);

    const link =
      (typeof window !== "undefined" && window.location.href) ||
      product.permalink ||
      "";

    return [
      "Hi Miray Team,",
      "",
      "I need help with this product:",
      `• Name: ${safeName}`,
      `• Product ID: ${safeId}`,
      `• Price: ₹${safePrice}`,
      requireSize ? `• Size: ${selectedSize || "Not selected"}` : null,
      desc ? `• Details: ${desc}${desc.length >= 240 ? "..." : ""}` : null,
      link ? `• Link: ${link}` : null,
    ]
      .filter(Boolean)
      .join("\n");
  }, [product, safeName, safeId, safePrice, selectedSize, requireSize]);

  // WhatsApp URL
  const whatsappUrl = useMemo(() => {
    const base = `https://wa.me/${WHATSAPP_NUMBER_WA}`;
    return whatsappText ? `${base}?text=${encodeURIComponent(whatsappText)}` : base;
  }, [whatsappText]);

  // CTA handler
  const openWhatsApp = () => {
    if (requireSize && !selectedSize) {
      return toast.error("Please select a size first");
    }
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Accordion title="Support" defaultOpen={defaultOpen}>
      <div className="space-y-4 text-sm text-black/70">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-black">Need help?</p>
            <p className="mt-1">
              Chat with our support team on WhatsApp for quick assistance.
            </p>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold underline text-black"
          >
            {WHATSAPP_NUMBER_DISPLAY}
          </a>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={openWhatsApp}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white
                     transition hover:opacity-90 active:scale-[0.98]"
        >
          <MessageCircle size={16} />
          Chat on WhatsApp
        </button>
      </div>
    </Accordion>
  );
}

