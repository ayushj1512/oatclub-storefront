"use client";

export default function ProductDetailSection({
  title = "Product Details",
  content = "",
}) {
  if (!content) return null;

  return (
    <section className="border-t border-neutral-200 py-4">
      <div className="mb-3">
        <p className="text-[9px] font-black uppercase tracking-[0.22em] text-black/38">
          Information
        </p>

        <h3 className="mt-1 text-[12px] font-black uppercase tracking-[0.12em] text-black">
          {title}
        </h3>
      </div>

      <div
        className="prose prose-sm max-w-none text-xs font-bold uppercase leading-6 tracking-[0.06em] text-black/58 prose-p:my-0 prose-p:text-black/58 prose-p:leading-6 prose-li:text-black/58 prose-li:leading-6 prose-strong:text-black prose-headings:text-black prose-a:text-black"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </section>
  );
}
