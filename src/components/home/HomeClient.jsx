"use client";

import Script from "next/script";
import Image from "next/image";
import { generateSEO } from "@/utils/seoConfig";

// ⭐ ABOVE THE FOLD
import HeroSection from "@/components/home/HeroSection";
import CategoryRow from "@/components/home/CategoryRow";
// import StyleByOccasion from "@/components/home/StyleByOccasion";

// ⭐ BELOW THE FOLD (NORMAL RENDER)
import TrendingSection from "@/components/home/TrendingSection";
import WinterFeatureSection from "@/components/home/WinterFeatureSection";
import TopSectionFeatured from "@/components/home/TopSection"; // ✅ NEW
import BestSellerSection from "@/components/home/BestSellerSection";
import VideoRow from "@/components/home/VideoRow";
import BlogSection from "@/components/home/BlogSection";
import RecentlyViewed from "@/components/home/RecentlyViewed";
import InfoStrip from "@/components/home/InfoStrip";
import Newsletter from "@/components/home/Newsletter";
import LeopardFeatureCollection from "@/components/home/LeopardFeatureCollection";
import PolkadotFeatureCollection from "@/components/home/PolkadotFeatureCollection";

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

      <main className="flex flex-col w-full min-h-screen overflow-x-hidden bg-white text-gray-900">
        {/* ABOVE THE FOLD */}
        <div className="pt-4">
          <CategoryRow />
        </div>

        <HeroSection />
        {/* <StyleByOccasion /> */}

             <BestSellerSection />


              <PolkadotFeatureCollection />

           <LeopardFeatureCollection />

        {/* BELOW THE FOLD — NORMAL SECTIONS */}
        {/* <TrendingSection /> */}

    {/* ✅ NEW TOP SECTION (Featured Category) */}
        {/* <TopSectionFeatured /> */}

        


        {/* <WinterFeatureSection /> */}

    

        {/* Best Seller comes after Top Section */}
   
        {/* <VideoRow /> */}
        <BlogSection />
        <RecentlyViewed />
        <InfoStrip />
        
        <Newsletter />
           {/* ✅ MobiKwik Banner (after Trending) - responsive (phone vs md+) */}
      
      </main>
    </>
  );
}
