"use client";

const str = (value) => (value == null ? "" : String(value).trim());

const hasPositiveDimension = (dimensions = {}) =>
  ["length", "width", "height"].some((key) => Number(dimensions?.[key] || 0) > 0);

const formatDimensions = (dimensions = {}) => {
  if (!hasPositiveDimension(dimensions)) return "";
  const unit = str(dimensions.unit) || "CM";
  return ["length", "width", "height"]
    .map((key) => Number(dimensions[key] || 0))
    .filter((value) => value > 0)
    .join(" X ")
    .concat(` ${unit}`.toUpperCase());
};

const specValue = (specs = [], key = "") => {
  const needle = key.toLowerCase();
  return str(specs.find((item) => str(item?.key).toLowerCase() === needle)?.value);
};

function Section({ eyebrow, title, children }) {
  return (
    <section className="border-t border-neutral-200 py-3.5">
      <div className="mb-2.5">
        <p className="text-[8.5px] font-extrabold uppercase tracking-[0.2em] text-black/38">
          {eyebrow}
        </p>
        <h3 className="mt-1 text-[11px] font-extrabold uppercase tracking-[0.1em] text-black">
          {title}
        </h3>
      </div>
      {children}
    </section>
  );
}

function TextBlock({ children }) {
  if (!children) return null;
  return (
    <p className="text-[11px] font-semibold uppercase leading-5 tracking-[0.05em] text-black/58">
      {children}
    </p>
  );
}

function KeyValueTable({ items = [] }) {
  const clean = items.filter((item) => str(item.label) && str(item.value));
  if (!clean.length) return null;

  return (
    <div className="overflow-hidden border border-neutral-200">
      {clean.map((item) => (
        <div
          key={`${item.label}-${item.value}`}
          className="grid grid-cols-[42%_58%] border-b border-neutral-200 last:border-b-0"
        >
          <div className="border-r border-neutral-200 bg-neutral-50 px-3 py-2 text-[8.5px] font-extrabold uppercase tracking-[0.14em] text-black/45">
            {item.label}
          </div>
          <div className="px-3 py-2 text-[9.5px] font-bold uppercase leading-5 tracking-[0.07em] text-black/72">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProductInformationSuite({ product }) {
  const raw = product?.raw || product || {};
  const specs = Array.isArray(raw.specifications) ? raw.specifications : [];
  const features = Array.isArray(raw.keyFeatures) ? raw.keyFeatures.filter(Boolean) : [];
  const fabrics = Array.isArray(raw.fabrics) ? raw.fabrics : [];
  const tags = Array.isArray(raw.tags) ? raw.tags.filter(Boolean).slice(0, 12) : [];

  const care = specValue(specs, "Care Instructions");
  const dimensions = formatDimensions(raw.dimensions);
  const weight = Number(raw.weight || product?.weight || 0) > 0 ? `${raw.weight || product?.weight} KG` : "";
  const productMeta = [
    { label: "Color", value: specValue(specs, "Color") || raw.colors?.[0] },
    { label: "Fabric", value: specValue(specs, "Fabric") },
    { label: "Fit", value: specValue(specs, "Fit") },
    { label: "Occasion", value: specValue(specs, "Occasion") },
    { label: "Pattern", value: specValue(specs, "Pattern") },
    { label: "Season", value: specValue(specs, "Season") },
    { label: "Stretch", value: specValue(specs, "Stretch") },
    { label: "Transparency", value: specValue(specs, "Transparency") },
    { label: "Origin", value: specValue(specs, "Country Of Origin") },
    { label: "Weight", value: weight },
    { label: "Dimensions", value: dimensions },
    { label: "Product Code", value: raw.productCode || product?.productCode },
  ];

  const hasStory = raw.howToStyle || raw.fabricDetails || raw.shortDescription;
  const hasAny =
    hasStory ||
    features.length ||
    specs.length ||
    fabrics.length ||
    care ||
    tags.length;

  if (!hasAny) return null;

  return (
    <div className="space-y-0">
      {hasStory ? (
        <Section eyebrow="STYLE INTENT" title="HOW THIS PIECE WORKS">
          <div className="space-y-3">
            <TextBlock>{raw.howToStyle}</TextBlock>
            <TextBlock>{raw.fabricDetails}</TextBlock>
          </div>
        </Section>
      ) : null}

      {features.length ? (
        <Section eyebrow="DETAILS" title="KEY FEATURES">
          <div className="flex flex-wrap gap-2">
            {features.map((feature) => (
              <span
                key={feature}
                className="bg-neutral-100 px-2.5 py-1.5 text-[8.5px] font-extrabold uppercase tracking-[0.11em] text-black/58"
              >
                {feature}
              </span>
            ))}
          </div>
        </Section>
      ) : null}

      {productMeta.some((item) => str(item.value)) ? (
        <Section eyebrow="PRODUCT DATA" title="SPECIFICATIONS">
          <KeyValueTable items={productMeta} />
        </Section>
      ) : null}

      {fabrics.length ? (
        <Section eyebrow="MATERIAL" title="FABRIC BREAKDOWN">
          <KeyValueTable
            items={fabrics.map((fabric, index) => ({
              label: fabric.role || `Fabric ${index + 1}`,
              value: [fabric.fabricName, fabric.fabricColor].filter(Boolean).join(" / "),
            }))}
          />
        </Section>
      ) : null}

      {care || tags.length ? (
        <Section eyebrow="CARE & TAGS" title="MORE TO KNOW">
          {care ? <TextBlock>{care}</TextBlock> : null}
          {tags.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-neutral-100 px-2.5 py-1.5 text-[8.5px] font-extrabold uppercase tracking-[0.12em] text-black/50"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </Section>
      ) : null}
    </div>
  );
}
