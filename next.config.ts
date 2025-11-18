import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  images: {
    remotePatterns: [
      // Pinterest
      { protocol: "https", hostname: "i.pinimg.com" },

      // Google login avatars
      { protocol: "https", hostname: "lh3.googleusercontent.com" },

      // Unsplash
      { protocol: "https", hostname: "images.unsplash.com" },

      // Cloudinary
      { protocol: "https", hostname: "res.cloudinary.com" },

      // ⭐ Your WordPress site
      { protocol: "https", hostname: "mirayfashions.com" },

      // ⭐ WordPress / Jetpack CDN (Optional but recommended)
      { protocol: "https", hostname: "secure.gravatar.com" },
      { protocol: "https", hostname: "*.wp.com" }, // for images served via wp.com CDN
    ],
  },
};

export default nextConfig;
