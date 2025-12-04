"use client";

import { useMemo, useState } from "react";
import { Plus, Minus, MessageCircle, Copy, Check } from "lucide-react";
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
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex justify-between items-center w-full text-left"
        aria-expanded={open}
      >
        <span className="text-base md:text-lg font-semibold text-black">{title}</span>
        {open ? (
          <Minus className="h-5 w-5 text-black" />
        ) : (
          <Plus className="h-5 w-5 text-black" />
        )}
      </button>

      <div
        className={`transition-all overflow-hidden duration-300 ${
          open ? "max-h-[900px] mt-3" : "max-h-0"
        }`}
      >
        {open ? children : null}
      </div>
    </div>
  );
}

export default function SupportSection({
  product,
  selectedSize,
  brand = { black: "#111111", burgundy: "#800020" },
  requireSize = false,
  defaultOpen = false,
}) {
  const [copied, setCopied] = useState(false);

  const safeName = product?.name || "-";
  const safeId = product?.id || "-";
  const safePrice = money(product?.price);

  const supportHint = useMemo(() => {
    if (!product) return "Need help choosing the right size or have questions about this product?";
    if (requireSize && !selectedSize) return "Tip: Select a size first so we can assist you faster.";
    return "Need help? Share product details with our WhatsApp support—fast replies during working hours.";
  }, [product, requireSize, selectedSize]);

  const whatsappText = useMemo(() => {
    if (!product) return "";

    const desc = stripHtml(product.shortDescription || product.description).slice(0, 260);
    const link =
      (typeof window !== "undefined" && window.location.href) || product.permalink || "";

    return [
      "Hi Miray Team ",
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

  const onCopy = async () => {
    console.log("[SupportSection] copy message", { productId: product?.id, selectedSize });

    if (!whatsappText) {
      toast.error("Product details not ready yet.");
      return;
    }

    try {
      await navigator.clipboard.writeText(whatsappText);
      toast.success("Message copied ✅");
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      console.log("[SupportSection] clipboard blocked", e);
      toast("Copy blocked by browser");
    }
  };

  const onOpenWhatsApp = () => {
    console.log("[SupportSection] open whatsapp", {
      productId: product?.id,
      selectedSize,
      requireSize,
    });

    if (requireSize && !selectedSize) {
      toast.error("Please select a size first");
      return;
    }

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Accordion title="Support" defaultOpen={defaultOpen}>
      <div className="text-gray-700 text-sm leading-relaxed space-y-3">
        {/* ✅ Added text (your request) */}
        <div className="p-3 bg-gray-50 border border-gray-200">
          <p className="text-black font-medium">Need help?</p>
          <p className="text-gray-600 mt-1">{supportHint}</p>
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="text-gray-700">
            WhatsApp Support:{" "}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline text-black"
              onClick={() =>
                console.log("[SupportSection] number link click", { productId: product?.id, selectedSize })
              }
            >
              {WHATSAPP_NUMBER_DISPLAY}
            </a>
          </div>

          <div className="text-xs text-gray-500">
            Reply time may vary
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onOpenWhatsApp}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition active:scale-[0.99]"
            style={{ backgroundColor: brand.black || "#111111" }}
          >
            <MessageCircle size={16} />
            Open WhatsApp
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-white text-black border border-gray-200 hover:bg-gray-50 transition active:scale-[0.99]"
            onClick={onCopy}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copied" : "Copy message"}
          </button>
        </div>

        {/* Optional: show preview (nice UX, can remove if you want) */}
        <details className="border border-gray-200 bg-white p-3">
          <summary className="cursor-pointer text-sm font-medium text-black">
            Preview message
          </summary>
          <pre className="mt-3 whitespace-pre-wrap text-xs text-gray-700">
            {whatsappText || "Loading product details..."}
          </pre>
        </details>

        <div className="text-xs text-gray-500">
          Tip: Include your preferred size & delivery city for faster help.
        </div>
      </div>
    </Accordion>
  );
}
