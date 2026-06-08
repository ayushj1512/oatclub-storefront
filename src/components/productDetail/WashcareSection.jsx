"use client";

import { useState } from "react";
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
  const [open, setOpen] = useState(true);

  return (
    <section className="bg-white py-2">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 text-left"
        aria-expanded={open}
      >
        <h3 className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-black">
          {title}
        </h3>
        <span className="text-base font-light leading-none text-black">{open ? "-" : "+"}</span>
      </button>

      {open ? (
        items.length ? (
          <ul className="mt-2 grid gap-2">
            {items.map((text, index) => (
              <li
                key={`${text}-${index}`}
                className="flex items-center gap-3 text-[9.5px] font-semibold uppercase leading-5 tracking-[0.07em] text-black/58"
              >
                {getIcon(text)}
                <span>{text}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-[11px] text-black/50">
            Care instructions will be updated soon.
          </p>
        )
      ) : null}
    </section>
  );
}
