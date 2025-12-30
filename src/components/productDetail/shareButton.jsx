"use client";

import {
  Share2,
  X,
  Copy,
  Instagram,
  Facebook,
  Twitter,
  Send,
  MessageCircle,
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";

export default function ShareButton({ product }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `https://mirayfashions.com/products/${product.id}`;

  const message = `✨ Discover "${product.name}" at Miray Fashions.
Shop now and embrace elegance 👗💖

${shareUrl}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    toast.success("Link copied 📋");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: message,
          url: shareUrl,
        });
      } catch (err) {}
    } else {
      handleCopy();
      setOpen(true);
    }
  };

return (
  <>
    {/* ================= ICON BUTTON ================= */}
    <button
      onClick={() => {
        handleNativeShare();
        setOpen(true);
      }}
      className="inline-flex items-center justify-center rounded-full bg-black p-2 shadow-sm
                 transition hover:opacity-90 active:scale-[0.96]"
      aria-label="Share"
    >
      <Share2
        className={`h-4 w-4 text-white transition ${
          copied ? "scale-110" : ""
        }`}
      />
    </button>

    {/* ================= SHARE MODAL ================= */}
    {open && (
      <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center
                      bg-black/50 backdrop-blur-sm p-4">

        <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl
                        animate-slideUp">

          {/* Close */}
          <button
            onClick={() => setOpen(false)}
            className="absolute right-3 top-3 rounded-full p-1
                       text-black/60 hover:bg-black/5 transition"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          {/* ================= PRODUCT PREVIEW ================= */}
          <div className="mb-5 flex gap-4">
            <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-black/10">
              <Image
                src={product.images?.[0] || "/placeholder.png"}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="min-w-0">
              <h3 className="text-base font-semibold truncate">
                {product.name}
              </h3>
              <p className="mt-1 text-sm text-black/60">
                Share this product
              </p>
            </div>
          </div>

          {/* ================= SHARE OPTIONS ================= */}
          <div className="grid grid-cols-3 gap-4 text-center">

            {[
              {
                label: "WhatsApp",
                href: `https://wa.me/?text=${encodeURIComponent(message)}`,
                icon: <MessageCircle size={26} />,
              },
              {
                label: "Instagram",
                href: "https://www.instagram.com/direct/inbox/",
                icon: <Instagram size={26} />,
              },
              {
                label: "Facebook",
                href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                  shareUrl
                )}`,
                icon: <Facebook size={26} />,
              },
              {
                label: "Twitter",
                href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  message
                )}`,
                icon: <Twitter size={26} />,
              },
              {
                label: "Telegram",
                href: `https://t.me/share/url?url=${encodeURIComponent(
                  shareUrl
                )}&text=${encodeURIComponent(message)}`,
                icon: <Send size={26} />,
              },
            ].map((o) => (
              <a
                key={o.label}
                href={o.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 rounded-xl p-2
                           hover:bg-black/5 transition"
              >
                <span className="text-black">{o.icon}</span>
                <span className="text-xs text-black/70">
                  {o.label}
                </span>
              </a>
            ))}

            {/* Copy */}
            <button
              onClick={handleCopy}
              className="flex flex-col items-center gap-1 rounded-xl p-2
                         hover:bg-black/5 transition"
            >
              <Copy size={26} className="text-black" />
              <span className="text-xs text-black/70">
                {copied ? "Copied" : "Copy"}
              </span>
            </button>

          </div>
        </div>
      </div>
    )}
  </>
);

}
