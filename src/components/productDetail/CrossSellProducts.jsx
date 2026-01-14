"use client";

import Link from "next/link";

const money = (n) => {
  const num = Number(n);
  if (!Number.isFinite(num)) return "0";
  return num.toLocaleString("en-IN");
};

export default function CrossSellProducts({ items = [], category = "" }) {
  const list = Array.isArray(items)
    ? items.filter((p) => p?.isActive !== false)
    : [];

  if (!list.length) return null;

  const cat = category || "all-clothing";

  return (
    <section className="mt-3 md:mt-3">
      <div className="flex items-center justify-between gap-3">
      
      </div>

      {/* ✅ bigger horizontal scroll chips */}
  <div className="mt-4 flex gap-3 overflow-x-auto pb-3 no-scrollbar">
  {list.map((p) => {
    const href = `/category/${encodeURIComponent(cat)}/${encodeURIComponent(
      p?.slug || ""
    )}/${encodeURIComponent(p?._id || "")}`;

    return (
      <Link
        key={p?._id}
        href={href}
        className="shrink-0 group flex items-center gap-3 rounded-xl border border-black/15 bg-white px-4 py-2.5 hover:border-black/35 hover:bg-black/[0.03] transition"
        title={p?.title}
      >
        {/* thumbnail (bigger) */}
        <span className="h-11 w-11 rounded-lg overflow-hidden bg-black/5 border border-black/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={p?.thumbnail || ""}
            alt={p?.title || "Variant"}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </span>

        {/* text */}
        <span className="flex flex-col pr-1">
          <span className="text-sm md:text-base font-medium text-black line-clamp-1 max-w-[220px]">
            {p?.title}
          </span>

          <span className="text-sm text-black/70">
            ₹{money(p?.price)}
            {Number(p?.compareAtPrice || 0) > Number(p?.price || 0) ? (
              <span className="ml-2 line-through text-black/40">
                ₹{money(p?.compareAtPrice)}
              </span>
            ) : null}
          </span>
        </span>
      </Link>
    );
  })}
</div>



    </section>
  );
}
