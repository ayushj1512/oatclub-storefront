"use client";

import { useMemo } from "react";
import { Play } from "lucide-react";

const normalizeMedia = (items = []) =>
  Array.from(
    new Set(
      (Array.isArray(items) ? items : [])
        .map((item) =>
          typeof item === "string"
            ? item.trim()
            : String(item?.url || "").trim(),
        )
        .filter(Boolean),
    ),
  );

const isVideoUrl = (url = "") =>
  /\.(mp4|webm|mov|m4v|ogg)(\?.*)?$/i.test(url) ||
  String(url).includes("/video/upload/");

function SpotlightCard({ src, index }) {
  const isVideo = isVideoUrl(src);

  return (
    <article className="group relative aspect-[9/16] w-full overflow-hidden bg-neutral-100">
      {isVideo ? (
        <video
          src={src}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
        />
      ) : (
        <img
          src={src}
          alt={`OATCLUB community spotlight ${index + 1}`}
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.02]"
        />
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent px-4 pb-4 pt-20">
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/75">
          OATCLUB Community
        </p>

        <p className="mt-1 text-sm font-extrabold uppercase tracking-[0.06em] text-white">
          Styled by you
        </p>
      </div>

      {isVideo ? (
        <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/65 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur">
          <Play className="h-3 w-3 fill-current" />
          Video
        </span>
      ) : null}
    </article>
  );
}

export default function ProductSpotlight({
  media = [],
  title = "Seen on the OATCLUB community",
  subtitle = "Real looks. Real styling. Your next outfit inspiration.",
}) {
  const items = useMemo(() => normalizeMedia(media), [media]);

  if (!items.length) return null;

  return (
    <section className="border-t border-black/10 bg-white py-10 md:py-14">
      <div className="mb-6 px-4 text-center md:mb-8 md:px-8">
        <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-black/45">
          Product Spotlight
        </p>

        <h2 className="mt-2 text-xl font-extrabold uppercase leading-tight tracking-[-0.02em] text-black md:text-3xl">
          {title}
        </h2>

        <p className="mx-auto mt-2 max-w-xl text-xs leading-5 text-black/55 md:text-sm">
          {subtitle}
        </p>
      </div>

      <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-8 xl:grid-cols-4">
        {items.map((src, index) => (
          <div
            key={`${src}-${index}`}
            className="w-[68vw] max-w-[300px] shrink-0 snap-center md:w-auto md:max-w-none"
          >
            <SpotlightCard
              src={src}
              index={index}
            />
          </div>
        ))}
      </div>
    </section>
  );
}