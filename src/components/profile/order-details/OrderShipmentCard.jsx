"use client";

import { Truck, ExternalLink, Copy } from "lucide-react";
import { prettyStatus, formatDateIST } from "./orderDetailsUtils";

const clean = (value) => String(value || "").trim();

const hasUsefulShipment = (data = {}) =>
  !!(clean(data?.awb) || clean(data?.trackingUrl) || clean(data?.courierName));

export default function OrderShipmentCard({ order }) {
  const shipment = order?.shipment || {};
  const tracking = order?.trackingDetails || {};
  const eshipz = shipment?.eshipz || {};
  const shiprocket = shipment?.shiprocket || {};

  const sources = [
    {
      provider: clean(tracking?.provider),
      data: tracking,
    },
    {
      provider: "eshipz",
      data: eshipz,
    },
    {
      provider: "shiprocket",
      data: shiprocket,
    },
    {
      provider: clean(shipment?.provider),
      data: shipment,
    },
  ];

  const selected =
    sources.find(
      (src) =>
        clean(src.data?.awb) &&
        clean(src.data?.trackingUrl) &&
        clean(src.data?.courierName)
    ) ||
    sources.find((src) => clean(src.data?.awb) && clean(src.data?.trackingUrl)) ||
    sources.find((src) => clean(src.data?.awb)) ||
    sources.find((src) => hasUsefulShipment(src.data)) ||
    null;

  const active = selected?.data || {};

  const provider =
    clean(selected?.provider) ||
    clean(shipment?.provider) ||
    clean(tracking?.provider) ||
    "-";

  const awb = clean(active?.awb);
  const courierName = clean(active?.courierName);
  const trackingUrl = clean(active?.trackingUrl);

  const status =
    clean(active?.status) ||
    clean(active?.rawStatus) ||
    clean(shipment?.status) ||
    "-";

  const expectedDelivery =
    active?.expectedDelivery ||
    eshipz?.expectedDelivery ||
    shipment?.expectedDelivery ||
    null;

  const copyAwb = async () => {
    if (!awb) return;

    try {
      await navigator.clipboard.writeText(awb);
    } catch {}
  };

  return (
    <div className="rounded-3xl bg-white p-3 shadow-sm ring-1 ring-black/[0.04]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-black text-white">
            <Truck size={15} />
          </span>

          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/35">
              Shipping
            </p>
            <h2 className="truncate text-sm font-black text-gray-950">
              {prettyStatus(provider)}
            </h2>
          </div>
        </div>

        {trackingUrl ? (
          <a
            href={trackingUrl}
            target="_blank"
            rel="noreferrer"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-black text-white"
            title="Track shipment"
          >
            <ExternalLink size={15} />
          </a>
        ) : null}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Info label="Courier" value={courierName || "-"} />
        <Info label="Status" value={prettyStatus(status)} />

        <div className="rounded-2xl bg-gray-50 px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-black/35">
            AWB
          </p>

          <div className="mt-0.5 flex items-center gap-1.5">
            <p className="min-w-0 flex-1 truncate text-xs font-black text-gray-950">
              {awb || "-"}
            </p>

            {awb ? (
              <button
                type="button"
                onClick={copyAwb}
                className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white text-gray-500 transition hover:text-black"
                title="Copy AWB"
              >
                <Copy size={11} />
              </button>
            ) : null}
          </div>
        </div>

        <Info
          label="EDD"
          value={expectedDelivery ? formatDateIST(expectedDelivery) : "-"}
        />
      </div>

      {!trackingUrl ? (
        <p className="mt-2 text-[11px] font-medium text-gray-400">
          Tracking link will appear once courier is assigned.
        </p>
      ) : null}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl bg-gray-50 px-3 py-2">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-black/35">
        {label}
      </p>
      <p className="mt-0.5 truncate text-xs font-black text-gray-950">
        {value}
      </p>
    </div>
  );
}