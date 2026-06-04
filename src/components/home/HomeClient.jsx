"use client";

import Script from "next/script";
import { generateSEO } from "@/utils/seoConfig";

// ⭐ MODAL
import InstagramDownModal from "@/components/common/InstagramDownModal";

// ⭐ ABOVE THE FOLD
import HeroSection from "@/components/home/HeroSection";
import CategoryRow from "@/components/home/CategoryRow";

// ⭐ BELOW THE FOLD
import TrendingSection from "@/components/home/TrendingSection";
import WinterFeatureSection from "@/components/home/WinterFeatureSection";
import TopSectionFeatured from "@/components/home/TopSection";
import BestSellerSection from "@/components/home/BestSellerSection";
import RecommendationFeatureRow from "@/components/home/RecommendationFeatureRow";
import VideoRow from "@/components/home/VideoRow";
import BlogSection from "@/components/home/BlogSection";
import RecentlyViewed from "@/components/home/RecentlyViewed";
import InfoStrip from "@/components/home/InfoStrip";
import Newsletter from "@/components/home/Newsletter";
import LeopardFeatureCollection from "@/components/home/LeopardFeatureCollection";
import PolkadotFeatureCollection from "@/components/home/PolkadotFeatureCollection";
import StyleByOccasion from "@/components/home/StyleByOccasion";
import NewArrivalsFeatureRow from "@/components/home/NewArrivalsFeatureRow";
import ReturnExchangeHelp from "@/components/home/ReturnExchangeHelp";
import ShopByCategoryRow from "@/components/home/ShopByCategoryRow";

function HomeBrandStrip() {
  const items = ["NEW DROPS WEEKLY", "CONTAINED PRODUCT IMAGERY", "CLEAN OATCLUB EDITS"];

  return (
    <section className="grid border-y border-neutral-200 bg-[#fafafa] text-black md:grid-cols-3">
      {items.map((item) => (
        <div
          key={item}
          className="border-b border-neutral-200 px-3 py-4 text-center md:border-b-0 md:border-r md:px-8"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-black/55">
            {item}
          </p>
        </div>
      ))}
    </section>
  );
}

export default function HomeClient() {
  const { structuredData } = generateSEO({
    type: "website",
    title: "OATCLUB",
    description:
      "Discover timeless elegance in Indian fashion — sarees, kurtis, and luxury styles designed for every occasion.",
    url: "https://oatclub.in/",
    image: "https://oatclub.in/og-image.jpg",
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

      {/* <InstagramDownModal /> */}

      <main className="flex min-h-screen w-full flex-col overflow-x-hidden bg-white text-gray-900">
        {/* ABOVE THE FOLD */}
        {/* <div className="pt-4">
          <CategoryRow />
        </div> */}

        <HeroSection />
        <HomeBrandStrip />
        <ShopByCategoryRow />

        <BestSellerSection />
        <NewArrivalsFeatureRow title="NEW ARRIVALS" limit={12} />
        <StyleByOccasion />

        {/* <LeopardFeatureCollection />
        <PolkadotFeatureCollection /> */}

        {/* Recommendation row */}
        <RecommendationFeatureRow limit={12} seedCount={6} />
        <VideoRow />

        {/* BELOW THE FOLD */}
        {/* <TrendingSection /> */}
        {/* <TopSectionFeatured /> */}
        {/* <WinterFeatureSection /> */}

        <BlogSection />
        <RecentlyViewed />
        <InfoStrip />
        <ReturnExchangeHelp />
        {/* <Newsletter /> */}
      </main>
    </>
  );
}
