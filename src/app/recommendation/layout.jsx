// src/app/recommendation/layout.jsx

const SITE_URL = "https://oatclub.in";
const BRAND_NAME = "OATCLUB";
const FALLBACK_IMAGE = `${SITE_URL}/og-default.jpg`;

export async function generateMetadata() {
  try {
    const title = "Recommended For You | OATCLUB";

    const description =
      "Explore personalized product recommendations based on your recently viewed essentials at OATCLUB.";

    const url = `${SITE_URL}/recommendation`;
    const image = FALLBACK_IMAGE;

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
        siteName: BRAND_NAME,
        type: "website",
        locale: "en_IN",
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: "Recommended For You | OATCLUB",
          },
        ],
      },

      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [image],
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
  } catch {
    return fallbackMetadata();
  }
}

function fallbackMetadata() {
  const title = "Recommended For You | OATCLUB";

  const description =
    "Explore personalized product recommendations at OATCLUB.";

  const url = `${SITE_URL}/recommendation`;

  return {
    title,
    description,

    alternates: {
      canonical: url,
    },

    robots: {
      index: true,
      follow: true,
    },

    openGraph: {
      title,
      description,
      url,
      siteName: BRAND_NAME,
      type: "website",
      locale: "en_IN",
      images: [
        {
          url: FALLBACK_IMAGE,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [FALLBACK_IMAGE],
    },
  };
}

export default function RecommendationLayout({ children }) {
  return children;
}