"use client";

import { useState } from "react";

export default function ProductDetailSection({
  title = "Product Details",
  content = "",
}) {
  const [open, setOpen] = useState(true);

  if (!content) return null;

  return (
    <section className="border-t border-neutral-200 py-2.5">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 text-left"
        aria-expanded={open}
      >
        <span className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-black">
          {title}
        </span>
        <span className="text-base font-light leading-none text-black">{open ? "-" : "+"}</span>
      </button>

      {open ? (
        <div
          className="prose prose-sm mt-2 max-w-none text-[10.5px] font-semibold uppercase leading-5 tracking-[0.04em] text-black/58 prose-p:my-0 prose-p:text-black/58 prose-p:leading-5 prose-li:text-black/58 prose-li:leading-5 prose-strong:text-black prose-headings:text-black prose-a:text-black"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : null}
    </section>
  );
}
