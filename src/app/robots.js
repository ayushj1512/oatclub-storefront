export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/checkout",
          "/profile",
          "/profile/",
          "/cart",
          "/test",
          "/api/",
        ],
      },
    ],
    sitemap: "https://oatclub.in/sitemap.xml",
    host: "https://oatclub.in",
  };
}
