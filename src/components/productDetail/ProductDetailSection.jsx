"use client";

export default function ProductDetailSection({
  title = "Product Details",
  content = "",
}) {
  if (!content) return null;

  return (
    <section className="border-t border-neutral-200 py-3.5">
      <div className="mb-2.5">
        <p className="text-[8.5px] font-extrabold uppercase tracking-[0.2em] text-black/38">
          Information
        </p>

        <h3 className="mt-1 text-[11px] font-extrabold uppercase tracking-[0.1em] text-black">
          {title}
        </h3>
      </div>

      <div
        className="prose prose-sm max-w-none text-[11px] font-semibold uppercase leading-5 tracking-[0.05em] text-black/58 prose-p:my-0 prose-p:text-black/58 prose-p:leading-5 prose-li:text-black/58 prose-li:leading-5 prose-strong:text-black prose-headings:text-black prose-a:text-black"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </section>
  );
}
