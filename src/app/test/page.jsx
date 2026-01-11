"use client";

import { toast } from "sonner";

export default function TestPage() {
  return (
    <div className="min-h-screen bg-white p-6">
      <h1 className="text-xl font-bold">/test</h1>
      <p className="mt-2 text-sm text-black/70">
        Sonner toast test page
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          className="rounded-md bg-black px-4 py-2 text-white text-sm"
          onClick={() => toast.success("Success toast ✅")}
        >
          Success Toast
        </button>

        <button
          className="rounded-md bg-blue-600 px-4 py-2 text-white text-sm"
          onClick={() => toast("Normal toast 👋")}
        >
          Normal Toast
        </button>

        <button
          className="rounded-md bg-red-600 px-4 py-2 text-white text-sm"
          onClick={() => toast.error("Error toast ❌")}
        >
          Error Toast
        </button>

        <button
          className="rounded-md bg-emerald-600 px-4 py-2 text-white text-sm"
          onClick={() =>
            toast("Toast with description", {
              description: "Ye description smaller font me dikhni chahiye.",
              action: {
                label: "Undo",
                onClick: () => toast("Undo clicked"),
              },
            })
          }
        >
          With Description + Action
        </button>
      </div>
    </div>
  );
}
