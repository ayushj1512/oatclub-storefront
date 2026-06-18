"use client";

import Image from "next/image";
import {
  Heart,
  Share2,
  ShoppingCart,
  Truck,
  RotateCcw,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";

const BROWN_THEMES = [
  { name: "Mocha", color: "#3B241B" },
  { name: "Espresso", color: "#2A1711" },
  { name: "Chocolate", color: "#4A2C20" },
  { name: "Cocoa", color: "#5A3526" },
  { name: "Walnut", color: "#6B422E" },
  { name: "Coffee", color: "#7B4B34" },
  { name: "Caramel", color: "#8B5A3C" },
  { name: "Toffee", color: "#9C6A46" },
  { name: "Hazelnut", color: "#A6764D" },
  { name: "Latte", color: "#B38A5C" },
  { name: "Camel", color: "#C19A6B" },
  { name: "Sand", color: "#D2B48C" },
  { name: "Taupe", color: "#8B7355" },
  { name: "Vintage Brown", color: "#6F4E37" },
  { name: "Dark Roast", color: "#3C2218" },
];

const product = {
  title: "Double Layer Cowl Neck Tank Top",
  productCode: "00023",
  shortDescription:
    "A chic, deep burgundy top from Oatclub featuring a dramatic, low-sweeping cowl neckline layered over a structured, built-in sweetheart bustier with central ruched bow detailing and a subtle front cut-out",
  howToStyle:
    "For a 90s vintage look, pair the top high-waisted straight-leg jeans, an oversized leather blazer, and square-toe boots. To transition into an edgy night-out aesthetic, tuck it into high-waisted faux-leather pants paired with stilettos and a metallic clutch.",
  fabricDetails:
    "Fit: True to size, slim fit with moderate stretch.\n\nMaterial: Premium Polyester/Spandex blend.\n\nCare: Machine wash cold on a gentle cycle inside out, or hand wash; line dry to preserve fabric elasticity and structure.",
  price: 899,
  compareAtPrice: 1299,
  category: "TOPS",
  color: "Burgandy",
  fabric: "Premium Polyester/Spandex blend",
  neckline: "Sweathaert",
  length: "Regular",
  sizes: ["XS", "S", "M", "L", "XL"],
  images: [
    "https://res.cloudinary.com/dpsvrt4sd/image/upload/v1781632219/dflebse7uoflurrb2akf.jpg",
    "https://res.cloudinary.com/dpsvrt4sd/image/upload/v1781632217/anbb38ybhucci9h8bhoc.jpg",
    "https://res.cloudinary.com/dpsvrt4sd/image/upload/v1781632218/ilstw0tzagvvapeo44dd.jpg",
  ],
};

const money = (n) => Number(n || 0).toLocaleString("en-IN");

const normalizeHex = (value) => {
  const clean = String(value || "").trim();
  const withHash = clean.startsWith("#") ? clean : `#${clean}`;
  return withHash.toUpperCase();
};

const isValidHex = (value) => /^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(value);

function InfoBlock({ title, children }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="border-t border-[var(--theme)]/15 py-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--theme)]"
      >
        {title}
        <span className="text-lg">{open ? "-" : "+"}</span>
      </button>

      {open && (
        <div className="mt-3 whitespace-pre-line text-sm leading-6 text-[var(--theme)]/65">
          {children}
        </div>
      )}
    </div>
  );
}

export default function TestProductPage() {
  const [theme, setTheme] = useState(BROWN_THEMES[0]);
  const [customHex, setCustomHex] = useState(BROWN_THEMES[0].color);
  const [hexError, setHexError] = useState("");
  const [activeImage, setActiveImage] = useState(product.images[0]);
  const [selectedSize, setSelectedSize] = useState("");

  const off = useMemo(
    () =>
      Math.round(
        ((product.compareAtPrice - product.price) / product.compareAtPrice) *
          100
      ),
    []
  );

  const applyCustomTheme = () => {
    const nextHex = normalizeHex(customHex);

    if (!isValidHex(nextHex)) {
      setHexError("Enter valid hex, example #3B241B");
      return;
    }

    setHexError("");
    setTheme({
      name: "Custom Brown",
      color: nextHex,
    });
    setCustomHex(nextHex);
  };

  const handleDropdownTheme = (value) => {
    const next = BROWN_THEMES.find((item) => item.color === value);
    if (!next) return;

    setTheme(next);
    setCustomHex(next.color);
    setHexError("");
  };

  return (
    <main
      style={{ "--theme": theme.color }}
      className="min-h-screen bg-white pb-20 text-[var(--theme)]"
    >
      <div className="sticky top-0 z-50 border-b border-[var(--theme)]/10 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1800px] flex-col gap-3 px-4 py-3 xl:flex-row xl:items-center xl:justify-between xl:px-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--theme)]/45">
              Oatclub Theme Preview
            </p>
            <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-[var(--theme)]">
              {theme.name} / {theme.color}
            </h2>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span
              className="hidden h-8 w-8 border border-[var(--theme)]/15 sm:block"
              style={{ backgroundColor: theme.color }}
            />

            <select
              value={
                BROWN_THEMES.some((item) => item.color === theme.color)
                  ? theme.color
                  : ""
              }
              onChange={(e) => handleDropdownTheme(e.target.value)}
              className="h-10 min-w-[180px] border border-[var(--theme)]/20 bg-white px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--theme)] outline-none focus:border-[var(--theme)]"
            >
              <option value="" disabled>
                Custom — {theme.color}
              </option>

              {BROWN_THEMES.map((item) => (
                <option key={item.color} value={item.color}>
                  {item.name} — {item.color}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <input
                value={customHex}
                onChange={(e) => {
                  setCustomHex(e.target.value);
                  setHexError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") applyCustomTheme();
                }}
                placeholder="#3B241B"
                className="h-10 w-[140px] border border-[var(--theme)]/20 bg-white px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--theme)] outline-none placeholder:text-[var(--theme)]/35 focus:border-[var(--theme)]"
              />

              <button
                type="button"
                onClick={applyCustomTheme}
                className="h-10 border border-[var(--theme)] bg-[var(--theme)] px-4 text-[10px] font-black uppercase tracking-[0.14em] text-white transition hover:bg-white hover:text-[var(--theme)]"
              >
                Apply
              </button>
            </div>

            {hexError ? (
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-red-600">
                {hexError}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <section className="w-full px-0 py-0 xl:px-8 xl:py-5">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[55fr_45fr] xl:gap-1">
          <div className="bg-white">
            <div className="relative aspect-[3/4] w-full bg-[#f8f5f2] xl:aspect-[4/5]">
              <Image
                src={activeImage}
                alt={product.title}
                fill
                priority
                className="object-cover"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 p-3 xl:p-0 xl:pt-3">
              {product.images.map((img) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setActiveImage(img)}
                  className={`relative aspect-[3/4] overflow-hidden border ${
                    activeImage === img
                      ? "border-[var(--theme)]"
                      : "border-[var(--theme)]/10"
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          <aside className="bg-white px-4 md:px-6 xl:sticky xl:top-24 xl:max-h-[calc(100vh-96px)] xl:overflow-y-auto xl:px-8 xl:py-5">
            <div className="space-y-4">
              <div className="flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-[0.2em] text-[var(--theme)]/40">
                Home <span>/</span> {product.category}
              </div>

              <div className="border-b border-[var(--theme)]/15 pb-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-[var(--theme)] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-white">
                      {product.category}
                    </span>

                    <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--theme)]/50">
                      SKU{" "}
                      <span className="font-semibold text-[var(--theme)]">
                        {product.productCode}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="grid h-9 w-9 place-items-center hover:text-[var(--theme)]/60">
                      <Heart size={18} />
                    </button>
                    <button className="grid h-9 w-9 place-items-center hover:text-[var(--theme)]/60">
                      <Share2 size={18} />
                    </button>
                  </div>
                </div>

                <h1 className="text-[20px] font-extrabold uppercase leading-[1.08] md:text-[24px] xl:text-[30px]">
                  {product.title}
                </h1>

                <p className="mt-3 text-sm leading-6 text-[var(--theme)]/60">
                  {product.shortDescription}
                </p>
              </div>

              <div className="border-b border-[var(--theme)]/15 pb-4">
                <div className="flex flex-wrap items-end gap-3">
                  <span className="text-[26px] font-extrabold leading-none">
                    RS. {money(product.price)}
                  </span>

                  <span className="text-base font-medium text-[var(--theme)]/35 line-through">
                    RS. {money(product.compareAtPrice)}
                  </span>

                  <span className="bg-[var(--theme)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-white">
                    {off}% OFF
                  </span>
                </div>

                <p className="mt-2 text-xs font-medium uppercase text-[var(--theme)]/45">
                  Inclusive of all taxes
                </p>
              </div>

              <div className="border-b border-[var(--theme)]/15 pb-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-[0.08em]">
                      Select Size
                    </h3>
                    <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-[var(--theme)]/45">
                      Choose your preferred fit
                    </p>
                  </div>

                  <button className="text-[10px] font-extrabold uppercase tracking-[0.08em] underline underline-offset-4">
                    Size Guide
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`h-10 min-w-11 border border-[var(--theme)] px-3.5 text-xs font-semibold transition ${
                        selectedSize === size
                          ? "bg-[var(--theme)] text-white"
                          : "bg-white text-[var(--theme)] hover:bg-[var(--theme)] hover:text-white"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                <p className="mt-3 text-[10px] font-medium uppercase leading-4 tracking-[0.08em] text-[var(--theme)]/55">
                  We will dispatch within 7 days as this piece is specially
                  curated for you only.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button className="inline-flex h-11 items-center justify-center gap-2 bg-[var(--theme)] px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:bg-white hover:text-[var(--theme)] hover:ring-1 hover:ring-[var(--theme)]">
                  <ShoppingCart size={18} />
                  Add To Bag
                </button>

                <button className="inline-flex h-11 items-center justify-center gap-2 border border-[var(--theme)] bg-white px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-[var(--theme)] transition hover:bg-[var(--theme)] hover:text-white">
                  <Zap size={18} />
                  Buy Now
                </button>
              </div>

              <div className="grid grid-cols-3 border-y border-[var(--theme)]/15 bg-white">
                {[
                  [ShieldCheck, "Quality Checked"],
                  [Truck, "Made For You"],
                  [RotateCcw, "Easy Exchange"],
                ].map(([Icon, title]) => (
                  <div
                    key={title}
                    className="flex flex-col items-center justify-center px-2 py-4 text-center"
                  >
                    <Icon className="mb-2 h-4 w-4" />
                    <p className="text-[9px] font-bold uppercase tracking-[0.08em]">
                      {title}
                    </p>
                  </div>
                ))}
              </div>

              <InfoBlock title="Product Details">
                {product.shortDescription}
              </InfoBlock>

              <InfoBlock title="How To Style">{product.howToStyle}</InfoBlock>

              <InfoBlock title="Fabric Details">
                {product.fabricDetails}
              </InfoBlock>

              <InfoBlock title="Specifications">
                Colour: {product.color}
                {"\n"}Fabric: {product.fabric}
                {"\n"}Neckline: {product.neckline}
                {"\n"}Length: {product.length}
              </InfoBlock>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}