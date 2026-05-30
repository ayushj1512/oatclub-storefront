"use client";

import {
  MessageSquareText,
  Save,
} from "lucide-react";

export default function OrderRemarkCard({
  remarkDraft,
  setRemarkDraft,
  savingRemark,
  onSave,
}) {
  return (
    <div className="rounded-[1.7rem] bg-white p-4 shadow-sm ring-1 ring-black/[0.04] sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-black/35">
            Note
          </p>

          <h2 className="mt-1 text-lg font-black text-gray-950">
            Order Remark
          </h2>
        </div>

        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-black text-white">
          <MessageSquareText size={17} />
        </span>
      </div>

      <textarea
        value={remarkDraft}
        onChange={(e) => setRemarkDraft(e.target.value)}
        placeholder="Add internal remark for this order…"
        rows={4}
        className="w-full resize-none rounded-3xl border border-black/[0.06] bg-gray-50 p-4 text-sm text-gray-900 outline-none transition focus:border-black/20 focus:bg-white"
      />

      <button
        onClick={onSave}
        disabled={savingRemark}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-black px-4 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
      >
        <Save size={15} />
        {savingRemark ? "Saving..." : "Save Remark"}
      </button>
    </div>
  );
}