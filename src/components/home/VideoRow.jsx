/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { useRef } from "react";

const videos = [
  {
    title: "New Arrivals",
    src: "/videos/new-arrivals.mp4",
  },
  {
    title: "Street Style",
    src: "/videos/street-style.mp4",
  },
  {
    title: "Summer Vibes",
    src: "/videos/summer-vibes.mp4",
  },
  {
    title: "Luxury Edit",
    src: "/videos/luxury-edit.mp4",
  },
  {
    title: "Behind The Scenes",
    src: "/videos/bts.mp4",
  },
];

export default function VideoRow() {
  const handleMouseEnter = (videoRef) => {
    videoRef.current && videoRef.current.play();
  };

  const handleMouseLeave = (videoRef) => {
    videoRef.current && videoRef.current.pause();
  };

  return (
    <section className="w-full flex flex-col bg-white py-10">
      <h2 className="text-2xl font-semibold text-gray-900 px-8 mb-6">
        Fashion in Motion
      </h2>

      <div className="flex flex-row gap-6 px-8 overflow-x-auto no-scrollbar">
        {videos.map((vid, index) => {
          const videoRef = useRef(null);

          return (
            <div
              key={index}
              className="flex-shrink-0 w-[280px] h-[360px] md:w-[340px] md:h-[420px] rounded-3xl overflow-hidden cursor-pointer relative hover:scale-[1.03] transition-transform duration-300"
              onMouseEnter={() => handleMouseEnter(videoRef)}
              onMouseLeave={() => handleMouseLeave(videoRef)}
            >
              <video
                ref={videoRef}
                src={vid.src}
                muted
                loop
                preload="metadata"
                className="w-full h-full object-cover"
              ></video>

              <div className="absolute bottom-4 left-0 right-0 text-center text-white font-semibold text-lg drop-shadow-md">
                {vid.title}
              </div>
              <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity"></div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
