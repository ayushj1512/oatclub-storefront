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

export default function SupportSection({ product, selectedSize, brand = { black: "#111111", burgundy: "#800020" }, requireSize = false, defaultOpen = false }) {
  const safeName = product?.name || "-";
  const safeId = product?.productId || product?.id || "-";
  const safePrice = money(product?.price);

  const whatsappText = useMemo(() => {
    if (!product) return "";
    const desc = stripHtml(product.shortDescription || product.description).slice(0, 260);
    const link = (typeof window !== "undefined" && window.location.href) || product.permalink || "";
    return [
      "Hi Miray Team,",
      "",
      "I need help with this product:",
      `• Name: ${safeName}`,
      `• Product ID: ${safeId}`,
      `• Price: ₹${safePrice}`,
      requireSize ? `• Size: ${selectedSize || "Not selected"}` : null,
      desc ? `• Details: ${desc}${desc.length >= 260 ? "..." : ""}` : null,
      link ? `• Link: ${link}` : null,
    ]
      .filter(Boolean)
      .join("\n");
  }, [product, safeName, safeId, safePrice, selectedSize, requireSize]);

  const whatsappUrl = useMemo(() => {
    if (!product) return `https://wa.me/${WHATSAPP_NUMBER_WA}`;
    return `https://wa.me/${WHATSAPP_NUMBER_WA}?text=${encodeURIComponent(whatsappText)}`;
  }, [product, whatsappText]);

  const onOpenWhatsApp = () => {
    if (requireSize && !selectedSize) return toast.error("Please select a size first");
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Accordion title="Support" defaultOpen={defaultOpen}>
      <div className="space-y-3 text-sm text-gray-700">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <p className="text-black font-medium">Need help?</p>
            <p className="text-gray-600 mt-1">Chat with us on WhatsApp for quick support.</p>
          </div>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold underline text-black">
            {WHATSAPP_NUMBER_DISPLAY}
          </a>
        </div>

        <button type="button" onClick={onOpenWhatsApp} className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-semibold text-white transition active:scale-[0.99]" style={{ backgroundColor: brand.black || "#111111" }}>
          <MessageCircle size={16} />
          Chat with us on WhatsApp
        </button>
      </div>
    </Accordion>
  );
}
