"use client";

import Link from "next/link";

const NAV_ITEMS = [
  { label: "INDEPENDENCE DAY SALE", href: "#", sale: true },
  { label: "ALL CLOTHING", href: "#" },
  { label: "NEW ARRIVALS", href: "#" },
  { label: "BESTSELLER", href: "#" },
  { label: "DRESSES", href: "#" },
  { label: "TOPS", href: "#" },
];

function Nav({ renderSale }) {
  return (
    <div className="overflow-x-auto border-y border-black/10 bg-white">
      <nav className="flex min-w-max items-center justify-center gap-8 px-8 py-4 lg:gap-10">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="shrink-0 whitespace-nowrap text-[11px] font-black uppercase tracking-[0.16em]"
          >
            {item.sale ? (
              renderSale()
            ) : (
              <span className="text-black/60 transition hover:text-black">
                {item.label}
              </span>
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
}

function Section({ number, title, description, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-black/10 bg-white">
      <div className="border-b border-black/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-[11px] font-bold text-white">
            {number}
          </span>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-tight">
              {title}
            </h2>

            <p className="mt-0.5 text-xs text-black/45">
              {description}
            </p>
          </div>
        </div>
      </div>

      {children}
    </section>
  );
}

export default function TestPage() {
  return (
    <main className="min-h-screen bg-[#f5f5f5] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}

        <div className="mb-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-black/40">
            OATCLUB / NAV EXPERIMENT
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] md:text-5xl">
            INDEPENDENCE DAY
          </h1>

          <p className="mt-2 max-w-xl text-sm text-black/50">
            6 navbar treatments. Compare them on the same white header and pick
            the cleanest one.
          </p>
        </div>

        <div className="space-y-6">
          {/* 01 */}

          <Section
            number="01"
            title="Classic Tiranga Gradient"
            description="Simple saffron → white → green text."
          >
            <Nav
              renderSale={() => (
                <span
                  className="
                    bg-gradient-to-r
                    from-[#FF671F]
                    via-[#cfcfcf]
                    to-[#046A38]
                    bg-clip-text
                    text-transparent
                  "
                >
                  INDEPENDENCE DAY SALE
                </span>
              )}
            />
          </Section>

          {/* 02 */}

          <Section
            number="02"
            title="Sharp Tiranga"
            description="Hard colour transitions instead of a soft gradient."
          >
            <Nav
              renderSale={() => (
                <span
                  className="
                    bg-[linear-gradient(90deg,#FF671F_0%,#FF671F_32%,#b8b8b8_45%,#b8b8b8_55%,#046A38_68%,#046A38_100%)]
                    bg-clip-text
                    text-transparent
                  "
                >
                  INDEPENDENCE DAY SALE
                </span>
              )}
            />
          </Section>

          {/* 03 */}

          <Section
            number="03"
            title="Tiranga Underline"
            description="Black text with a subtle tricolour line underneath."
          >
            <Nav
              renderSale={() => (
                <span className="relative pb-1 text-black">
                  INDEPENDENCE DAY SALE

                  <span
                    className="
                      absolute
                      bottom-0
                      left-0
                      h-[2px]
                      w-full
                      bg-gradient-to-r
                      from-[#FF671F]
                      via-[#d5d5d5]
                      to-[#046A38]
                    "
                  />
                </span>
              )}
            />
          </Section>

          {/* 04 */}

          <Section
            number="04"
            title="Tiranga Pill"
            description="More promotional and immediately noticeable."
          >
            <Nav
              renderSale={() => (
                <span
                  className="
                    relative
                    inline-flex
                    items-center
                    rounded-full
                    bg-gradient-to-r
                    from-[#FF671F]
                    via-white
                    to-[#046A38]
                    p-[1.5px]
                  "
                >
                  <span className="rounded-full bg-white px-3 py-1.5 text-black">
                    INDEPENDENCE DAY SALE
                  </span>
                </span>
              )}
            />
          </Section>

          {/* 05 */}

          <Section
            number="05"
            title="Split Tiranga"
            description="Each part gets its own Independence Day colour."
          >
            <Nav
              renderSale={() => (
                <span className="inline-flex items-center gap-[4px]">
                  <span className="text-[#FF671F]">INDEPENDENCE</span>

                  <span className="text-black/45">DAY</span>

                  <span className="text-[#046A38]">SALE</span>
                </span>
              )}
            />
          </Section>

          {/* 06 */}

          <Section
            number="06"
            title="Premium Highlight"
            description="Gradient text with a subtle promotional background."
          >
            <Nav
              renderSale={() => (
                <span
                  className="
                    inline-flex
                    rounded-md
                    bg-gradient-to-r
                    from-orange-50
                    via-white
                    to-green-50
                    px-3
                    py-1.5
                    ring-1
                    ring-black/[0.06]
                  "
                >
                  <span
                    className="
                      bg-gradient-to-r
                      from-[#FF671F]
                      via-[#a8a8a8]
                      to-[#046A38]
                      bg-clip-text
                      text-transparent
                    "
                  >
                    INDEPENDENCE DAY SALE
                  </span>
                </span>
              )}
            />
          </Section>
        </div>

        <div className="mt-10 rounded-2xl bg-black p-6 text-white">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">
            QUICK PICK
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {[
              "01 Gradient",
              "02 Sharp",
              "03 Underline",
              "04 Pill",
              "05 Split",
              "06 Premium",
            ].map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-bold"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
