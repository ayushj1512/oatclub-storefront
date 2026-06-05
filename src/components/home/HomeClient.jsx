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
import StyleOfTheWeek from "@/components/home/StyleOfTheWeek";
import CategoryMosaic from "@/components/home/CategoryMosaic";

function HomeBrandStrip() {
  const items = [
    { title: "NEW DROPS WEEKLY", text: "Fresh edits without the scroll fatigue." },
    { title: "CONTAINED IMAGERY", text: "Product visuals stay clean and inspectable." },
    { title: "CURATED OATCLUB FLOW", text: "Sharper pieces, simpler discovery." },
  ];

  return (
    <section className="bg-[#fafafa] px-3 py-3 text-black md:px-8">
      <div className="no-scrollbar flex gap-2 overflow-x-auto md:grid md:grid-cols-3 md:gap-0 md:overflow-visible md:border-y md:border-neutral-200">
        {items.map((item) => (
        <div
          key={item.title}
          className="min-w-[76vw] border border-neutral-200 bg-white px-4 py-3 md:min-w-0 md:border-y-0 md:border-l-0 md:border-r md:bg-transparent md:px-6 md:py-4"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-black">
            {item.title}
          </p>
          <p className="mt-1 text-[10px] font-bold uppercase leading-4 tracking-[0.08em] text-black/45">
            {item.text}
          </p>
        </div>
        ))}
      </div>
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
        <CategoryMosaic />
        <ShopByCategoryRow />

        <BestSellerSection />
        <StyleOfTheWeek />
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
