import Link from "next/link";
import {
  ArrowRight,
  Check,
  Coffee,
  Repeat,
  Shirt,
  Sparkles,
} from "lucide-react";
import { buildSeoMetadata } from "@/lib/seo/seoMeta";

export const metadata = buildSeoMetadata({
  title: "About OATCLUB India | Clothes You Wear On Repeat",
  description:
    "OATCLUB creates wear-driven women’s fashion designed for real life — outfits you reach for again and again.",
  path: "/about",
  image: "/og-default.jpg",
  keywords: [
    "OATCLUB India",
    "OATCLUB fashion",
    "women fashion India",
    "everyday western wear",
    "wear-driven fashion",
  ],
});

const principles = [
  "Fit before hype",
  "Fabric before noise",
  "Details before discounts",
  "Repeat wear before trends",
];

const moments = [
  "Busy mornings",
  "Coffee runs",
  "Workdays",
  "College lectures",
  "Dinner plans",
  "Weekend errands",
  "Vacations",
  "Last-minute plans",
];

const differenceCards = [
  {
    icon: Shirt,
    title: "Designed for your actual life",
    text: "Not for a party you might attend or a vacation you have not booked. For the days you really live.",
  },
  {
    icon: Repeat,
    title: "The repeat test",
    text: "Every piece must answer yes to one question: will you reach for it again next week, next month, and next year?",
  },
  {
    icon: Sparkles,
    title: "Fewer pieces, more thought",
    text: "We spend more time perfecting fewer styles instead of releasing hundreds of pieces you forget tomorrow.",
  },
];

export default function AboutPage() {
  return (
    <main className="bg-white text-black">
      <section className="border-b border-black/10 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-16 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:py-24">
          <div>
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-black/10 px-3.5 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-black" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-black/55 sm:text-[11px] sm:font-bold">
                OATCLUB · OWN ALL TRENDS
              </p>
            </div>

            <h1 className="max-w-5xl text-[2.45rem] font-semibold leading-[0.98] tracking-[-0.055em] sm:text-7xl sm:font-black sm:leading-[0.9] lg:text-8xl">
              Clothes made for the days you actually live.
            </h1>

            <p className="mt-5 max-w-2xl text-[15px] leading-7 text-black/65 sm:mt-7 sm:text-lg sm:leading-8">
              Oatclub was created for the everyday question —{" "}
              <span className="font-medium text-black">
                “What should I wear today?”
              </span>{" "}
              We design pieces that make that answer easier, sharper, and worth
              repeating.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row">
              <Link
                href="/new-arrivals"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-black/80 sm:px-7 sm:py-3.5 sm:font-bold"
              >
                Shop New Edits <ArrowRight size={14} />
              </Link>

              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-full border border-black/15 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-black transition hover:border-black hover:bg-black hover:text-white sm:px-7 sm:py-3.5 sm:font-bold"
              >
                Explore Pieces
              </Link>
            </div>
          </div>

          <div className="lg:pl-8">
            <div className="rounded-[1.75rem] border border-black/10 bg-white p-2.5 shadow-[0_18px_55px_rgba(0,0,0,0.07)] sm:rounded-[2.2rem] sm:p-3">
              <div className="rounded-[1.35rem] bg-black px-5 py-6 text-white sm:rounded-[1.7rem] sm:px-8 sm:py-10">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/45 sm:text-[11px] sm:font-bold">
                  The Oatclub Rule
                </p>

                <h2 className="mt-4 text-3xl font-semibold leading-[1] tracking-[-0.045em] sm:mt-6 sm:text-5xl sm:font-black sm:leading-[0.95]">
                  Will you reach for it again?
                </h2>

                <p className="mt-4 text-sm leading-7 text-white/65 sm:mt-5">
                  Next week. Next month. Next year. If the answer is not yes, it
                  does not belong in our collection.
                </p>

                <div className="mt-6 space-y-2.5 sm:mt-9 sm:space-y-3">
                  {principles.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-2.5 text-[13px] font-medium text-white/85 sm:px-4 sm:py-3 sm:text-sm"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-black sm:h-6 sm:w-6">
                        <Check size={12} />
                      </span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2.5 sm:mt-4 sm:gap-3">
              {["20%", "80%", "1"].map((item, index) => (
                <div
                  key={item}
                  className="rounded-2xl border border-black/10 bg-white p-3 text-center shadow-sm sm:p-4"
                >
                  <p className="text-xl font-semibold tracking-[-0.05em] sm:text-2xl sm:font-black">
                    {item}
                  </p>
                  <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-black/45 sm:text-[10px] sm:font-bold">
                    {index === 0
                      ? "Wardrobe worn"
                      : index === 1
                        ? "Often ignored"
                        : "Simple test"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-black/45 sm:text-xs sm:font-bold">
            Why Oatclub?
          </p>

          <h2 className="mt-4 text-3xl font-semibold leading-[1.05] tracking-[-0.045em] sm:mt-5 sm:text-6xl sm:font-black sm:leading-[1]">
            Because the best purchase is not the one that costs the least.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-black/65 sm:mt-6 sm:text-base sm:leading-8">
            It is the one you cannot stop wearing.
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:mt-12 sm:gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[1.5rem] border border-black/10 bg-white p-5 shadow-sm sm:rounded-[2rem] sm:p-8">
            <p className="text-4xl font-semibold tracking-[-0.07em] sm:text-7xl sm:font-black">
              20/80
            </p>
            <p className="mt-4 text-sm leading-7 text-black/65 sm:mt-5">
              Most of us wear the same 20% of our wardrobe 80% of the time. The
              rest? Bought on impulse, worn once, forgotten forever.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-black bg-black p-5 text-white shadow-sm sm:rounded-[2rem] sm:p-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/45 sm:text-xs sm:font-bold">
              What we solve
            </p>
            <p className="mt-4 text-lg font-medium leading-8 tracking-[-0.025em] text-white sm:mt-5 sm:text-2xl sm:font-semibold sm:leading-9">
              We design pieces that do not sit in your wardrobe waiting for the
              right occasion. They become the outfits you reach for without
              overthinking.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 sm:pb-20 lg:px-8">
        <div className="overflow-hidden rounded-[1.75rem] border border-black/10 bg-black text-white shadow-[0_24px_80px_rgba(0,0,0,0.14)] sm:rounded-[2.5rem]">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
            <div className="border-b border-white/10 p-6 sm:p-10 lg:border-b-0 lg:border-r">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/40 sm:text-xs sm:font-bold">
                Why this name?
              </p>

              <h2 className="mt-5 text-3xl font-semibold leading-[1] tracking-[-0.045em] sm:mt-6 sm:text-6xl sm:font-black sm:leading-[0.95]">
                Reliable. Comforting. Always a good idea.
              </h2>
            </div>

            <div className="space-y-4 p-6 text-sm leading-7 text-white/68 sm:space-y-5 sm:p-10 sm:text-base sm:leading-8">
              <p>
                Nobody craves oats because they are exciting. They choose them
                because they are reliable, comforting, and always a good idea.
                The same way your favorite clothes should be.
              </p>

              <p>
                We are not chasing micro-trends, viral moments, or outfits that
                only look good in photos. We are creating the pieces that
                survive the closet clean-out.
              </p>

              <p className="rounded-2xl border border-white/15 bg-white/[0.06] p-4 font-medium text-white sm:rounded-3xl sm:p-5">
                The ones you wear so often your friends start saying, “That
                dress again?”
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-black/10 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:mb-10 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-black/45 sm:text-xs sm:font-bold">
                Made for real life
              </p>
              <h2 className="mt-4 max-w-2xl text-3xl font-semibold leading-[1.05] tracking-[-0.045em] sm:text-5xl sm:font-black sm:leading-[1]">
                Coffee runs, workdays, dinner plans — and everything between.
              </h2>
            </div>

            <p className="max-w-sm text-sm leading-7 text-black/60">
              Not clothes for your fantasy life. Clothes for the life already
              happening.
            </p>
          </div>

          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-3 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0">
            {moments.map((item, index) => (
              <div
                key={item}
                className="min-w-[155px] rounded-[1.35rem] border border-black/10 bg-white p-4 shadow-sm transition hover:border-black sm:min-w-0 sm:rounded-[1.75rem] sm:p-5"
              >
                <div className="mb-8 flex items-center justify-between sm:mb-10">
                  <Coffee className="h-4 w-4 text-black/45 sm:h-5 sm:w-5" />
                  <span className="text-[11px] font-semibold text-black/25 sm:text-xs sm:font-bold">
                    0{index + 1}
                  </span>
                </div>

                <p className="text-base font-semibold tracking-[-0.035em] sm:text-lg sm:font-black">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-3 sm:gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-[1.75rem] border border-black/10 bg-white p-6 shadow-sm sm:rounded-[2.2rem] sm:p-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-black/45 sm:text-xs sm:font-bold">
              And the club?
            </p>

            <h2 className="mt-4 text-3xl font-semibold leading-[1] tracking-[-0.045em] sm:mt-5 sm:text-6xl sm:font-black sm:leading-[0.95]">
              For girls who buy for their real life.
            </h2>
          </div>

          <div className="rounded-[1.75rem] border border-black bg-black p-6 text-white shadow-sm sm:rounded-[2.2rem] sm:p-10">
            <div className="space-y-4 text-sm leading-7 text-white/70 sm:space-y-5 sm:text-base sm:leading-8">
              <p>
                Oatclub is for girls who have stopped buying clothes for their
                fantasy life and started buying for their real one.
              </p>

              <p>
                Girls who know that repeating outfits is not boring — it is the
                whole point.
              </p>

              <p className="font-medium text-white">
                For the outfits that become part of your routine, your memories,
                and your personality.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-black/10 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-black/45 sm:text-xs sm:font-bold">
              What makes it different?
            </p>

            <h2 className="mt-4 text-3xl font-semibold leading-[1.05] tracking-[-0.045em] sm:mt-5 sm:text-6xl sm:font-black sm:leading-[1]">
              Most brands sell who you could be. We design for who you already
              are.
            </h2>
          </div>

          <div className="mt-8 grid gap-3 sm:mt-12 sm:gap-4 md:grid-cols-3">
            {differenceCards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.title}
                  className="rounded-[1.5rem] border border-black/10 bg-white p-5 shadow-sm transition hover:border-black sm:rounded-[2rem] sm:p-7"
                >
                  <div className="mb-8 flex h-10 w-10 items-center justify-center rounded-full bg-black text-white sm:mb-10 sm:h-12 sm:w-12">
                    <Icon size={18} />
                  </div>

                  <h3 className="text-xl font-semibold leading-tight tracking-[-0.04em] sm:text-2xl sm:font-black">
                    {card.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-black/62 sm:mt-4">
                    {card.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
        <div className="rounded-[1.75rem] bg-black px-5 py-10 text-center text-white shadow-[0_24px_80px_rgba(0,0,0,0.16)] sm:rounded-[2.5rem] sm:px-10 sm:py-16">
          <div className="mx-auto max-w-4xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/45 sm:text-xs sm:font-bold">
              Oatclub is wear-driven
            </p>

            <h2 className="mt-4 text-3xl font-semibold leading-[1] tracking-[-0.045em] sm:mt-5 sm:text-7xl sm:font-black sm:leading-[0.95]">
              We are not here to fill your wardrobe.
              <span className="block">
                We are here to become your favorite part of it.
              </span>
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/65 sm:mt-7 sm:text-base sm:leading-8">
              Because the best clothes are not the ones that get the most
              attention. They are the ones that get the most wear.
            </p>

            <Link
              href="/new-arrivals"
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-white/85 sm:mt-9 sm:px-7 sm:py-3.5 sm:font-black"
            >
              Shop pieces you will repeat <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}