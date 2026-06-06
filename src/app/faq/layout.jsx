import { buildSeoMetadata } from "@/lib/seo/seoMeta";

export const metadata = buildSeoMetadata({
  title: "OATCLUB FAQs | Size, Shipping, Returns & Women Fashion Help",
  description:
    "Find OATCLUB FAQs for sizing, women fashion orders, colors, shipping, exchanges, returns and online clothing support in India.",
  path: "/faq",
  image: "/og-default.jpg",
  keywords: ["OATCLUB FAQs", "OATCLUB size guide", "women clothing online india", "OATCLUB support"],
});

export default function FaqLayout({ children }) {
  return children;
}
