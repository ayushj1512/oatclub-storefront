// src/app/new-arrivals/layout.jsx
import { buildPageMetadata } from "@/lib/seo/pagesMeta";

export const metadata = buildPageMetadata("new-arrivals");

export default function NewArrivalsLayout({ children }) {
  return children;
}
