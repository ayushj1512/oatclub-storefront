// src/app/recommendation/layout.jsx

export async function generateMetadata() {
  try {
    const title = "Recommended For You | Miray Fashions";
    const description =
      "Explore personalized product recommendations based on your recently viewed items at Miray Fashions.";

    const url = "https://mirayfashions.com/recommendation";
    const image = "https://mirayfashions.com/og-default.jpg";

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
            url: image,
            width: 1200,
            height: 630,
            alt: "Recommended For You | Miray Fashions",
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
  const title = "Recommended For You | Miray Fashions";
  const description =
    "Explore personalized product recommendations at Miray Fashions.";

  const url = "https://mirayfashions.com/recommendation";

  return title && description
    ? {
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
          siteName: "Miray Fashions",
          type: "website",
          images: [
            {
              url: "https://mirayfashions.com/og-default.jpg",
              width: 1200,
              height: 630,
              alt: title,
            },
          ],
        },
      }
    : {
        title: "Miray Fashions",
        robots: { index: true, follow: true },
      };
}

export default function RecommendationLayout({ children }) {
  return children;
}
