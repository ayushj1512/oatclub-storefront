"use client";

function PaymentCard({ label, value, icon, sub, selected, setSelected }) {
  const active = selected === value;
  const isRazorpay = value === "razorpay";

  return (
    <button
      type="button"
      onClick={() => setSelected(value)}
      aria-pressed={active}
      className={`w-full rounded-2xl px-4 py-4 text-left shadow-[0_12px_28px_rgba(0,0,0,0.07)] transition active:scale-[0.99] ${active ? "bg-white" : "bg-white/60 hover:bg-white/80"}`}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          <span className="grid place-items-center size-10 rounded-2xl bg-black/5 text-gray-800 shrink-0">
            {icon}
          </span>

          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900">
              {label}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {sub}
            </div>

            {isRazorpay && (
              <div className="mt-1 flex items-center gap-1 text-[10px] text-gray-400">
                <span>Powered by Razorpay</span>
              </div>
            )}
          </div>
        </div>

        {/* Right radio */}
        <span
          className={`size-5 rounded-full border-2 transition shrink-0 ${active ? "border-black bg-black" : "border-black/20"}`}
        />
      </div>
    </button>
  );
}

export default PaymentCard;

