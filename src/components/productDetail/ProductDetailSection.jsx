"use client";

export default function ProductDetailSection({
  title = "Product Details",
  content = "",
}) {
  if (!content) return null;

  return (
    <section className="border-t border-black/10 pt-6">
      <div className="mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/40">
          Information
        </p>

        <h3 className="mt-1 text-[15px] font-semibold text-black md:text-base">
          {title}
        </h3>
      </div>

      <div
        className="
          prose prose-sm max-w-none
          prose-p:text-black/70
          prose-p:leading-7
          prose-li:text-black/70
          prose-li:leading-7
          prose-strong:text-black
          prose-headings:text-black
          prose-a:text-black
        "
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </section>
  );
}