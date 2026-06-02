"use client";

export default function WashcareSection({
  title = "Care Notes",
  items = [],
}) {
  return (
    <section className="border-t border-black/10 py-6">
      <div className="mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/40">
          Care Guide
        </p>

        <h3 className="mt-1 text-[15px] font-semibold text-black md:text-base">
          {title}
        </h3>
      </div>

      {items.length ? (
        <ul className="space-y-3">
          {items.map((text, index) => (
            <li key={`${text}-${index}`} className="flex items-start gap-3">
              <span className="mt-[9px] h-1.5 w-1.5 shrink-0 bg-black" />
              <p className="text-sm leading-6 text-black/65">{text}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm leading-6 text-black/50">
          Care instructions will be updated soon.
        </p>
      )}
    </section>
  );
}