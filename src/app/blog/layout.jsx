// src/app/blog/layout.jsx

import { buildSeoMetadata } from "@/lib/seo/seoMeta";

export const metadata = buildSeoMetadata({
  title: "OATCLUB Journal | Women Fashion, Outfit Ideas & Style Edits",
  description:
    "Read The OATCLUB Journal for women fashion trends, western wear styling, co ord set edits, party wear ideas, casual outfits and modern wardrobe inspiration.",
  path: "/blog",
  image: "/og-blog.jpg",
  imageAlt: "The OATCLUB Journal",
  keywords: [
    "women fashion trends India",
    "western wear styling",
    "outfit ideas for women",
    "co ord set styling",
    "party wear ideas for women",
    "casual outfit ideas women",
  ],
});

export default function BlogLayout({ children }) {
  return children;
}
