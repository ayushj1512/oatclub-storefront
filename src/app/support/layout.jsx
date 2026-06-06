import { buildSeoMetadata } from "@/lib/seo/seoMeta";

export const metadata = buildSeoMetadata({
  title: "OATCLUB Support | Orders, Returns, Shipping & Sizing",
  description:
    "Get OATCLUB support for women clothing orders, sizing, shipping, exchange, returns, refunds and premium fashion product help.",
  path: "/support",
  image: "/og-default.jpg",
  keywords: ["OATCLUB support", "OATCLUB orders", "OATCLUB returns", "women fashion online india"],
});

export default function SupportLayout({ children }) {
  return children;
}
