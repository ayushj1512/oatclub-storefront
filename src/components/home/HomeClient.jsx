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
import OurMission from "@/components/home/OurMission";
import Newsletter from "@/components/home/Newsletter";
import RecentlyViewed from "@/components/home/RecentlyViewed";
import TrendingSection from "@/components/home/TrendingSection";
import OnFireSection from "@/components/home/OnFireSection";

// ⭐ IMPORT YOUR NEW HOT CATEGORIES SECTION
import HotCategories from "@/components/home/HotCategories";

export default function HomeClient() {
  const { structuredData } = generateSEO({
    type: "website",
    title: "Miray Fashions",
    description:
      "Discover timeless elegance in Indian fashion — sarees, kurtis, and luxury styles designed for every occasion.",
    url: "https://mirayfashions.com/",
    image: "https://mirayfashions.com/og-image.jpg",
  });

  return (
    <>
      {structuredData && (
        <Script
          id="home-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      )}

      <main className="flex flex-col w-full overflow-x-hidden bg-white text-gray-900">

        {/* CATEGORY ROW */}
        <div className="pt-8">
          <CategoryRow />
        </div>

        {/* ⭐ NEW HOT CATEGORIES SECTION */}
        <HotCategories />

        {/* HERO */}
        <HeroSection />

        {/* STYLE BY OCCASION */}
        <StyleByOccasion />

        {/* BANNER */}
        <Banner />

        {/* TRENDING SECTION */}
        <TrendingSection />

        {/* 🔥 ON FIRE SECTION */}
        <OnFireSection
          title="🔥 On Fire Picks"
          products={[]} // replace with real products
          loading={false}
        />

        {/* VIDEOS */}
        <VideoRow />

        {/* BLOGS */}
        <BlogSection />

        {/* RECENTLY VIEWED */}
        <RecentlyViewed />

        {/* INFO STRIP */}
        <InfoStrip />

        {/* OUR MISSION */}
        <OurMission />

        {/* NEWSLETTER */}
        <Newsletter />

      </main>
    </>
  );
}
