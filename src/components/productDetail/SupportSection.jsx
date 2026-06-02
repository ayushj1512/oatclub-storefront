"use client";

import { useMemo } from "react";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";

const WHATSAPP_NUMBER_DISPLAY = "+91 72176 49990";
const WHATSAPP_NUMBER_WA = "917217649990";

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

export default function SupportSection({
  product,
  selectedSize,
  requireSize = false,
}) {
  const safeName = product?.name || "-";
  const safeId = product?.productId || product?.id || "-";
  const safePrice = money(product?.price);

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
      "Hi OATCLUB Team,",
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

  const whatsappUrl = useMemo(() => {
    const base = `https://wa.me/${WHATSAPP_NUMBER_WA}`;
    return whatsappText
      ? `${base}?text=${encodeURIComponent(whatsappText)}`
      : base;
  }, [whatsappText]);

  const openWhatsApp = () => {
    if (requireSize && !selectedSize) {
      return toast.error("Please select a size first");
    }

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="border-t border-black/10 pt-6">
      <div className="mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/40">
          Support
        </p>

        <h3 className="mt-1 text-[15px] font-semibold text-black md:text-base">
          Need Help?
        </h3>
      </div>

      <div className="space-y-4">
        <p className="max-w-xl text-sm leading-6 text-black/65">
          Have a question about sizing, fabric, delivery, or your order?
          Connect directly with our team on WhatsApp.
        </p>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm font-medium text-black underline underline-offset-4"
        >
          {WHATSAPP_NUMBER_DISPLAY}
        </a>

        <button
          type="button"
          onClick={openWhatsApp}
          className="inline-flex h-11 items-center justify-center gap-2 bg-black px-5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98]"
        >
          <MessageCircle size={16} />
          Chat on WhatsApp
        </button>
      </div>
    </section>
  );
}