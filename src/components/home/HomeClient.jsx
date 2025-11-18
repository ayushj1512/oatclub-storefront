"use client";

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
import { generateSEO } from "@/utils/seoConfig";
import TrendingSection from "@/components/home/TrendingSection";

import Script from "next/script";

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

        <div className="pt-8">    <CategoryRow /></div>
        <HeroSection />

        <StyleByOccasion />
        <Banner />
        <TrendingSection />
        <VideoRow />

        <BlogSection />
        <RecentlyViewed />
        <InfoStrip />
        <OurMission />
        <Newsletter />
      </main>
    </>
  );
}
