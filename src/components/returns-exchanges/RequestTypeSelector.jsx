"use client";

import { ArrowLeft, ArrowRight, RefreshCcw, RotateCcw } from "lucide-react";

const options = [
  {
    value: "exchange",
    title: "Size Exchange",
    desc: "Choose this if you want a different size for selected products.",
    icon: RefreshCcw,
  },
  {
    value: "return",
    title: "Return",
    desc: "Choose this if you want to return selected products.",
    icon: RotateCcw,
  },
];

export default function RequestTypeSelector({ value, onChange, onBack, onContinue }) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100 sm:p-6">
      <h2 className="text-xl font-semibold">What would you like to do?</h2>
      <p className="mt-1 text-sm text-gray-500">Select return or size exchange.</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {options.map((item) => {
          const Icon = item.icon;
          const active = value === item.value;

          return (
            <button
              key={item.value}
              onClick={() => onChange(item.value)}
              className={`rounded-3xl p-5 text-left ring-1 transition ${
                active
                  ? "bg-gray-950 text-white ring-gray-950"
                  : "bg-gray-50 text-gray-900 ring-gray-100 hover:bg-white"
              }`}
            >
              <Icon className="h-5 w-5" />
              <h3 className="mt-4 text-base font-semibold">{item.title}</h3>
              <p className={`mt-1 text-sm ${active ? "text-gray-300" : "text-gray-500"}`}>
                {item.desc}
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button onClick={onBack} className="h-11 rounded-2xl bg-gray-100 px-4 text-sm font-medium">
          <span className="inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </span>
        </button>

        <button onClick={onContinue} className="h-11 rounded-2xl bg-gray-950 px-4 text-sm font-medium text-white">
          <span className="inline-flex items-center gap-2">
            Continue <ArrowRight className="h-4 w-4" />
          </span>
        </button>
      </div>
    </section>
  );
}