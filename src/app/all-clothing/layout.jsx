// src/app/all-clothing/layout.jsx
import { buildPageMetadata } from "@/lib/seo/pagesMeta";

export const metadata = buildPageMetadata("all-clothing");

export default function AllClothingLayout({ children }) {
  return children;
}
