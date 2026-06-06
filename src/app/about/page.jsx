import { InfoBlock, InfoCallout, InfoPageLayout, InfoTable } from "@/components/info/InfoPageLayout";
import { buildSeoMetadata } from "@/lib/seo/seoMeta";

export const metadata = buildSeoMetadata({
  title: "About OATCLUB India | Own All Trends",
  description:
    "Learn about OATCLUB India, a premium women fashion brand for modern western wear, minimal everyday outfits, statement pieces and trend-led clothing.",
  path: "/about",
  image: "/og-default.jpg",
  keywords: ["OATCLUB India", "OATCLUB fashion", "premium women fashion india", "minimal fashion women"],
});

export default function AboutPage() {
  return (
    <InfoPageLayout
      activePath="/about"
      eyebrow="OATCLUB"
      title="About Us"
      intro="Clean, minimal streetwear that looks good, feels good, and is built for real life."
      aside={
        <InfoCallout
          label="THE IDEA"
          title="NO HYPE. JUST GOOD STUFF."
          body="Thought-through pieces, made with care, for people who actually wear them."
          action={{ href: "/new-arrivals", label: "SHOP NEW EDITS" }}
        />
      }
    >
      <InfoBlock title="Why OATCLUB Started">
        <p>
          OATCLUB started because we were tired of choosing between clothes that looked good and
          clothes that felt good. Spoiler: you should not have to.
        </p>
      </InfoBlock>

      <InfoBlock title="What We Make">
        <p>
          We make clean, minimal streetwear that is built for real life, not just a photoshoot.
          Every piece is thought through, not just thrown together.
        </p>
      </InfoBlock>

      <InfoTable
        rows={[
          ["Mood", "Clean, minimal, wearable"],
          ["Focus", "Fit, fabric, details"],
          ["Approach", "No hype, no chaos"],
          ["Made For", "People who actually wear it"],
        ]}
      />

      <InfoBlock title="How We Work">
        <p>
          No hype. No drops that sell out in 2 seconds. Just good stuff, made with care, for people
          who actually wear it.
        </p>
        <p>
          We are a small crew with a big obsession for quality. Every stitch, every fit, every
          detail matters to us. Welcome to the club.
        </p>
      </InfoBlock>
    </InfoPageLayout>
  );
}
