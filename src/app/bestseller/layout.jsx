// src/app/bestseller/layout.jsx
import { buildPageMetadata } from "@/lib/seo/pagesMeta";

export const metadata = buildPageMetadata("bestsellers");

export default function BestsellerLayout({ children }) {
  return children;
}