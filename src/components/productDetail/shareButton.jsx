"use client";

import { Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ShareButton({ product }) {
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `https://mirayfashions.com/products/${product.id}`;

  const message = `✨ Discover "${product.name}" from Miray Fashions – where luxury meets elegance. 
Shop now and embrace timeless beauty 👗💖  
${shareUrl}`;

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: message,
          url: shareUrl,
        });
        toast.success("Shared successfully 💫");
      } else {
        await navigator.clipboard.writeText(message);
        setCopied(true);
        toast.success("Link copied to clipboard 📋");
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      toast.error("Could not share the product 😔");
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 bg-gray-100 hover:bg-pink-100 text-gray-800 font-medium px-4 py-2 rounded-full transition shadow-sm"
    >
      <Share2 className="w-4 h-4 text-pink-600" />
      {copied ? "Copied!" : "Share"}
    </button>
  );
}
