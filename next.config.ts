import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  images: {
    remotePatterns: [
      // Pinterest
      { protocol: "https", hostname: "i.pinimg.com", pathname: "/**" },

      // Google login avatars
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },

      // Amazon Media CDN
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
        pathname: "/**",
      },

      // Unsplash
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },

      // Cloudinary
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },

      // Miray domains
      { protocol: "https", hostname: "mirayfashions.com", pathname: "/**" },
      { protocol: "https", hostname: "mirayfashions.in", pathname: "/**" },

      // WordPress / Gravatar CDN
      { protocol: "https", hostname: "secure.gravatar.com", pathname: "/**" },

      // wp.com CDN
      { protocol: "https", hostname: "i0.wp.com", pathname: "/**" },
      { protocol: "https", hostname: "i1.wp.com", pathname: "/**" },
      { protocol: "https", hostname: "i2.wp.com", pathname: "/**" },

      // External product image sources
      { protocol: "https", hostname: "img.kwcdn.com", pathname: "/**" },
      { protocol: "https", hostname: "img.ltwebstatic.com", pathname: "/**" },
      { protocol: "https", hostname: "img1.shopcider.com", pathname: "/**" },
      { protocol: "https", hostname: "us.princesspolly.com", pathname: "/**" },

      // StreetStyleStore + Cloudfront
      {
        protocol: "https",
        hostname: "d1flfk77wl2xk4.cloudfront.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.streetstylestore.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.streetstylestore.com",
        pathname: "/**",
      },

      // Nefs Finds Shopify CDN
      {
        protocol: "https",
        hostname: "nefsfinds.com",
        pathname: "/**",
      },
    ],
  },

  async redirects() {
    return [
      {
        source: "/category/all-clothing",
        destination: "/all-clothing",
        permanent: true,
      },
      {
        source: "/category/new-arrivals",
        destination: "/new-arrivals",
        permanent: true,
      },
      {
        source: "/category/best-sellers",
        destination: "/bestseller",
        permanent: true,
      },
      {
        source: "/category/party-wear",
        destination: "/collection/party-protocol",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;