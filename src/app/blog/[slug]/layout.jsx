// src/app/blog/[slug]/layout.jsx

import { SEO_KEYWORDS, uniqueKeywords } from "@/lib/seo/seoMeta";

const SITE_URL = "https://oatclub.in";
const FALLBACK_IMAGE = `${SITE_URL}/og-blog.jpg`;

export async function generateMetadata({ params }) {
  const { slug } = params;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/blogs/${slug}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      return fallbackMetadata();
    }

    const blog = await res.json();

    const title = `${blog.title} | The OATCLUB Journal`;

    const description =
      blog.excerpt ||
      blog.content?.slice(0, 160) ||
      "Read the latest style stories from The OATCLUB Journal.";

    const image = blog.image || FALLBACK_IMAGE;

    const url = `${SITE_URL}/blog/${slug}`;

    return {
      title,
      description,
      keywords: uniqueKeywords(SEO_KEYWORDS, [
        blog.title,
        "women fashion blog India",
        "OATCLUB Journal",
        "western wear styling",
        "modern women clothing",
      ]),

      alternates: {
        canonical: url,
      },

      openGraph: {
        title,
        description,
        url,
        siteName: "OATCLUB",
        type: "article",
        locale: "en_IN",
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: blog.title,
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
        index: blog.isPublished !== false,
        follow: true,
        googleBot: {
          index: blog.isPublished !== false,
          follow: true,
        },
      },
    };
  } catch {
    return fallbackMetadata();
  }
}

function fallbackMetadata() {
  return {
    title: "The OATCLUB Journal | OATCLUB",
    description:
      "Style guides, everyday essentials, culture stories, and modern lifestyle inspiration from OATCLUB.",
    alternates: {
      canonical: `${SITE_URL}/blog`,
    },
    openGraph: {
      title: "The OATCLUB Journal | OATCLUB",
      description:
        "Style guides, everyday essentials, culture stories, and modern lifestyle inspiration from OATCLUB.",
      url: `${SITE_URL}/blog`,
      siteName: "OATCLUB",
      type: "website",
      locale: "en_IN",
      images: [
        {
          url: FALLBACK_IMAGE,
          width: 1200,
          height: 630,
          alt: "The OATCLUB Journal",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "The OATCLUB Journal | OATCLUB",
      description:
        "Read style guides, culture stories, and everyday inspiration from OATCLUB.",
      images: [FALLBACK_IMAGE],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function BlogDetailLayout({ children }) {
  return children;
}
