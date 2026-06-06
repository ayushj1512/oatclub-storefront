"use client";

function PaymentCard({ label, value, icon, sub, selected, setSelected }) {
  const active = selected === value;
  const isRazorpay = value === "razorpay";

  return (
    <button
      type="button"
      onClick={() => setSelected(value)}
      aria-pressed={active}
      className={`w-full border px-4 py-4 text-left transition ${
        active ? "border-black bg-white" : "border-neutral-200 bg-neutral-50 hover:border-black hover:bg-white"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center border border-neutral-200 bg-white text-black">
            {icon}
          </span>

          <div className="min-w-0">
            <div className="text-xs font-black uppercase tracking-[0.08em] text-black">
              {label}
            </div>
            <div className="mt-0.5 truncate text-[10px] font-bold uppercase tracking-[0.06em] text-black/45">
              {sub}
            </div>

            {isRazorpay && (
              <div className="mt-1 flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.1em] text-black/35">
                <span>Powered By Razorpay</span>
              </div>
            )}
          </div>
        </div>

        <span
          className={`size-4 shrink-0 border transition ${
            active ? "border-black bg-black" : "border-black/20"
          }`}
        />
      </div>
    </button>
  );
}

export default PaymentCard;
