"use client";

import Script from "next/script";
import { generateSEO } from "@/utils/seoConfig";

import LazySection from "@/components/common/LazySection";

// ⭐ ABOVE THE FOLD (DO NOT LAZY)
import HeroSection from "@/components/home/HeroSection";
import CategoryRow from "@/components/home/CategoryRow";
import StyleByOccasion from "@/components/home/StyleByOccasion";

// ⭐ BELOW THE FOLD (LAZY LOAD)
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

      {/* 🔥 min-h-screen IS CRITICAL FOR MOBILE SCROLL */}
      <main className="flex flex-col w-full min-h-screen overflow-x-hidden bg-white text-gray-900">
        {/* ABOVE THE FOLD */}
        <div className="pt-4">
          <CategoryRow />
        </div>

        <HeroSection />
        <StyleByOccasion />

        {/* ⬇️ BELOW THE FOLD — LAZY (SCROLL SAFE) */}

        <LazySection minHeight={600}>
          <TrendingSection />
        </LazySection>

        <LazySection minHeight={550}>
          <WinterFeatureSection />
        </LazySection>

        <LazySection minHeight={700}>
          <BestSellerSection />
        </LazySection>

        <LazySection minHeight={500}>
          <VideoRow />
        </LazySection>

        <LazySection minHeight={600}>
          <BlogSection />
        </LazySection>

        <LazySection minHeight={350}>
          <RecentlyViewed />
        </LazySection>

        <LazySection minHeight={220}>
          <InfoStrip />
        </LazySection>

        <LazySection minHeight={320}>
          <Newsletter />
        </LazySection>
      </main>
    </>
  );
}
