"use client";

import {
  WashingMachine,
  Droplets,
  Circle,
  Thermometer,
  Shirt,
} from "lucide-react";

const getIcon = (text = "") => {
  const value = text.toLowerCase();

  if (value.includes("wash")) {
    return <WashingMachine className="h-4 w-4 shrink-0" />;
  }

  if (value.includes("bleach")) {
    return <Droplets className="h-4 w-4 shrink-0" />;
  }

  if (value.includes("tumble")) {
    return <Circle className="h-4 w-4 shrink-0" />;
  }

  if (value.includes("iron")) {
    return <Thermometer className="h-4 w-4 shrink-0" />;
  }

  if (value.includes("dry")) {
    return <Shirt className="h-4 w-4 shrink-0" />;
  }

  return <Circle className="h-4 w-4 shrink-0" />;
};

export default function WashcareSection({
  title = "Washing Instructions",
  items = [],
}) {
  return (
    <section className="border-t border-black/10 py-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-black">
        {title}
      </h3>

      {items.length ? (
        <ul className="space-y-2.5">
          {items.map((text, index) => (
            <li
              key={`${text}-${index}`}
              className="flex items-center gap-3 text-sm text-black/75"
            >
              {getIcon(text)}
              <span>{text}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-black/50">
          Care instructions will be updated soon.
        </p>
      )}
    </section>
  );
}