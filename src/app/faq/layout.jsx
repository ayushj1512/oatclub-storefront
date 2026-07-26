import { buildSeoMetadata } from "@/lib/seo/seoMeta";
import { FAQ_SCHEMA } from "@/data/faqData";

export const metadata = buildSeoMetadata({
  title: "OATCLUB FAQs | Size, Shipping, Returns & Fashion Help",
  description:
    "Find answers about OATCLUB sizing, shipping, COD, payments, tracking, exchanges, returns, refunds and women's fashion orders in India.",
  path: "/faq",
  image: "/og-default.jpg",
  keywords: [
    "OATCLUB FAQs",
    "OATCLUB size guide",
    "OATCLUB shipping",
    "OATCLUB returns",
    "women clothing online India",
    "OATCLUB support",
  ],
});

export default function FaqLayout({ children }) {
  const jsonLd = JSON.stringify(FAQ_SCHEMA).replace(/</g, "\\u003c");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      {children}
    </>
  );
}
