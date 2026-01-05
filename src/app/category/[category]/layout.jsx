// src/app/category/[category]/layout.jsx

export async function generateMetadata({ params }) {
  // ✅ Unwrap params (params may be a Promise in newer Next.js versions)
  const { category } = await params;

  const name = decodeURIComponent(category || "").replace(/-/g, " ").trim();
  const formattedName = capitalize(name);

  const title = `${formattedName} | Miray Fashions`;
  const description = `Shop ${formattedName} online at Miray Fashions. Discover the latest designs, premium quality fabrics, and trending styles.`;

  const url = `https://mirayfashions.com/category/${category}`;

  return {
    title,
    description,

    alternates: {
      canonical: url,
    },

    openGraph: {
      title,
      description,
      url,
      siteName: "Miray Fashions",
      type: "website",
      locale: "en_IN",
      images: [
        {
          url: "https://mirayfashions.com/og-category.jpg",
          width: 1200,
          height: 630,
          alt: `${formattedName} – Miray Fashions`,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://mirayfashions.com/og-category.jpg"],
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  };
}

function capitalize(str = "") {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function CategoryLayout({ children }) {
  return children;
}
