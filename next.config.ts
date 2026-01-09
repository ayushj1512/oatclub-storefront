import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

 images: {
    remotePatterns: [
      // Pinterest
      { protocol: "https", hostname: "i.pinimg.com", pathname: "/**" },

      // Google login avatars
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/**" },

      // Unsplash
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },

      // Cloudinary
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },

      // ⭐ Your WordPress site (OLD + NEW)
      { protocol: "https", hostname: "mirayfashions.com", pathname: "/**" },
      { protocol: "https", hostname: "mirayfashions.in", pathname: "/**" },

      // ⭐ WordPress / Gravatar CDN
      { protocol: "https", hostname: "secure.gravatar.com", pathname: "/**" },

      // ✅ wp.com CDN (use explicit hostnames instead of wildcard)
      { protocol: "https", hostname: "i0.wp.com", pathname: "/**" },
      { protocol: "https", hostname: "i1.wp.com", pathname: "/**" },
      { protocol: "https", hostname: "i2.wp.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
