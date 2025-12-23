"use client";

import Script from "next/script";
import { generateSEO } from "@/utils/seoConfig";

import LazySection from "@/components/common/LazySection";

// ⭐ SAFE ABOVE-THE-FOLD IMPORTS
import HeroSection from "@/components/home/HeroSection";
import CategoryRow from "@/components/home/CategoryRow";
import StyleByOccasion from "@/components/home/StyleByOccasion";

// ⭐ HEAVY / BELOW-THE-FOLD
import TrendingSection from "@/components/home/TrendingSection";
import WinterFeatureSection from "@/components/home/WinterFeatureSection";
import BestSellerSection from "@/components/home/BestSellerSection";
import VideoRow from "@/components/home/VideoRow";
import BlogSection from "@/components/home/BlogSection";
import RecentlyViewed from "@/components/home/RecentlyViewed";
import InfoStrip from "@/components/home/InfoStrip";
import Newsletter from "@/components/home/Newsletter";

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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}

      <main className="flex flex-col w-full overflow-x-hidden bg-white text-gray-900">
        {/* ABOVE THE FOLD — LOAD IMMEDIATELY */}
        <div className="pt-4">
          <CategoryRow />
        </div>

        <HeroSection />
        <StyleByOccasion />

        {/* BELOW THE FOLD — LAZY LOAD */}
        <LazySection>
          <TrendingSection />
        </LazySection>

        <LazySection>
          <WinterFeatureSection />
        </LazySection>

        <LazySection>
          <BestSellerSection />
        </LazySection>

        <LazySection>
          <VideoRow />
        </LazySection>

        <LazySection>
          <BlogSection />
        </LazySection>

        <LazySection>
          <RecentlyViewed />
        </LazySection>

        <LazySection>
          <InfoStrip />
        </LazySection>

        <LazySection>
          <Newsletter />
        </LazySection>
      </main>
    </>
  );
}
