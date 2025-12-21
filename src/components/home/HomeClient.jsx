"use client";

import Script from "next/script";
import { generateSEO } from "@/utils/seoConfig";

// ⭐ NORMAL IMPORTS (safe – no SSR issues)
import HeroSection from "@/components/home/HeroSection";
import CategoryRow from "@/components/home/CategoryRow";
import StyleByOccasion from "@/components/home/StyleByOccasion";
import VideoRow from "@/components/home/VideoRow";
import Banner from "@/components/home/Banner";
import BlogSection from "@/components/home/BlogSection";
import InfoStrip from "@/components/home/InfoStrip";
import Newsletter from "@/components/home/Newsletter";
import RecentlyViewed from "@/components/home/RecentlyViewed";
import TrendingSection from "@/components/home/TrendingSection";
import BestSellerSection from "@/components/home/BestSellerSection"
// ⭐ IMPORT YOUR NEW HOT CATEGORIES SECTION
import HotCategories from "@/components/home/HotCategories";

// ✅ IMPORT WINTER FEATURE SECTION (the one we created)
import WinterFeatureSection from "@/components/home/WinterFeatureSection";

export default function HomeClient() {
  const { structuredData } = generateSEO({
    type: "website",
    title: "Miray Fashions",
    description: "Discover timeless elegance in Indian fashion — sarees, kurtis, and luxury styles designed for every occasion.",
    url: "https://mirayfashions.com/",
    image: "https://mirayfashions.com/og-image.jpg",
  });

  return (
    <>
      {structuredData && <Script id="home-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />}

      <main className="flex flex-col w-full overflow-x-hidden bg-white text-gray-900">
        {/* ⭐ NEW HOT CATEGORIES SECTION */}
        {/* <div><HotCategories /></div> */}
        <div className="pt-4"><CategoryRow /></div>

        {/* HERO */}
        <HeroSection />

        {/* STYLE BY OCCASION */}
        <StyleByOccasion />

        {/* BANNER */}
        {/* <Banner /> */}

        {/* CATEGORY ROW */}

        {/* TRENDING SECTION */}
        <TrendingSection />

           {/* ✅ WINTER FEATURE SECTION (banner left + 2-row horizontal products, mobile stacked) */}
        <div className=""><WinterFeatureSection /></div>

        <BestSellerSection />

        {/* VIDEOS */}
        <VideoRow />

        {/* BLOGS */}
        <BlogSection />

        {/* RECENTLY VIEWED */}
        <RecentlyViewed />

        {/* INFO STRIP */}
        <InfoStrip />

        {/* NEWSLETTER */}
        <Newsletter />
      </main>
    </>
  );
}
