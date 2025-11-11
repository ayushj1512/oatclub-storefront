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

export default function HomePage() {
  return (
    <main className="flex flex-col w-full overflow-x-hidden">
      {/* 🏠 Hero Section */}
      <HeroSection />

      {/* 🛍 Category Row */}
      <CategoryRow />

      {/* ✨ Style by Occasion */}
      <StyleByOccasion />

      {/* 🎥 Video Row */}
      <VideoRow />

      {/* 🏷 Banner */}
      <Banner />

      {/* 💬 Blog Section */}
      <BlogSection />

      {/* 🚚 Info Strip */}
      <InfoStrip />

      {/* ❤️ Our Mission */}
      <OurMission />

      {/* 💌 Newsletter */}
      <Newsletter />
    </main>
  );
}
