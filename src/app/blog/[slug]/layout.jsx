// src/app/blog/[slug]/layout.jsx

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

    const title = `${blog.title} | The Miray Journal`;
    const description =
      blog.excerpt ||
      blog.content?.slice(0, 160) ||
      "Read the latest fashion stories from The Miray Journal.";

    const image =
      blog.image ||
      "https://mirayfashions.com/og-blog.jpg";

    const url = `https://mirayfashions.com/blog/${slug}`;

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
    title: "The Miray Journal | Miray Fashions",
    description:
      "Fashion trends, styling inspiration & modern aesthetics from Miray Fashions.",
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function BlogDetailLayout({ children }) {
  return children;
}
