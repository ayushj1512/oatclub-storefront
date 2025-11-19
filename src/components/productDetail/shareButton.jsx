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
      {/* ICON ONLY BURGUNDY BUTTON */}
      <button
        onClick={() => {
          handleNativeShare();
          setOpen(true);
        }}
        className="p-2 rounded-full shadow-sm transition"
        style={{ backgroundColor: "#800020" }}
      >
        <Share2
          className={`w-4 h-4 text-white transition ${
            copied ? "scale-110" : ""
          }`}
        />
      </button>

      {/* SHARE MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-slideUp relative">
            
            {/* CLOSE */}
            <button
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100"
              onClick={() => setOpen(false)}
            >
              <X size={20} />
            </button>

            {/* PRODUCT PREVIEW */}
            <div className="flex gap-4 mb-4">
              <div className="w-20 h-20 relative rounded-xl overflow-hidden border">
                <Image
                  src={product.images?.[0] || "/placeholder.png"}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                <p className="text-sm text-gray-500">Share this product</p>
              </div>
            </div>

            {/* SHARE OPTIONS */}
            <div className="grid grid-cols-3 gap-4 text-center">

              <a
                href={`https://wa.me/?text=${encodeURIComponent(message)}`}
                target="_blank"
                className="flex flex-col items-center gap-1 hover:opacity-80"
              >
                <MessageCircle size={28} className="text-green-600" />
                <span className="text-xs">WhatsApp</span>
              </a>

              <a
                href="https://www.instagram.com/direct/inbox/"
                target="_blank"
                className="flex flex-col items-center gap-1 hover:opacity-80"
              >
                <Instagram size={28} className="text-pink-600" />
                <span className="text-xs">Instagram</span>
              </a>

              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                  shareUrl
                )}`}
                target="_blank"
                className="flex flex-col items-center gap-1 hover:opacity-80"
              >
                <Facebook size={28} className="text-blue-600" />
                <span className="text-xs">Facebook</span>
              </a>

              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  message
                )}`}
                target="_blank"
                className="flex flex-col items-center gap-1 hover:opacity-80"
              >
                <Twitter size={28} className="text-sky-500" />
                <span className="text-xs">Twitter</span>
              </a>

              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(
                  shareUrl
                )}&text=${encodeURIComponent(message)}`}
                target="_blank"
                className="flex flex-col items-center gap-1 hover:opacity-80"
              >
                <Send size={28} className="text-blue-500" />
                <span className="text-xs">Telegram</span>
              </a>

              <button
                onClick={handleCopy}
                className="flex flex-col items-center gap-1 hover:opacity-80"
              >
                <Copy size={28} className="text-gray-700" />
                <span className="text-xs">Copy</span>
              </button>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
