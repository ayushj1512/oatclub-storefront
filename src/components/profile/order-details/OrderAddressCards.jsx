"use client";

import {
  MapPin,
  User,
  Phone,
  Mail,
} from "lucide-react";

import { getFullAddress } from "./orderDetailsUtils";

export default function OrderAddressCards({
  order,
}) {
  const address =
    order?.shippingAddressSnapshot || {};

  const fullAddress =
    getFullAddress(address);

  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/[0.04]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/35">
            Delivery Address
          </p>

          <h2 className="mt-0.5 text-base font-black text-gray-950">
            Shipping Details
          </h2>
        </div>

        <span className="grid h-9 w-9 place-items-center rounded-2xl bg-black text-white">
          <MapPin size={15} />
        </span>
      </div>

      <div className="mt-3 space-y-3">
        <div className="flex items-start gap-2">
          <User
            size={14}
            className="mt-0.5 shrink-0 text-gray-400"
          />

          <div>
            <p className="text-sm font-black text-gray-950">
              {address?.fullName || "-"}
            </p>

            <p className="mt-1 text-xs leading-relaxed text-gray-600">
              {fullAddress || "-"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 rounded-2xl bg-gray-50 px-3 py-2">
            <Phone
              size={13}
              className="text-gray-400"
            />

            <span className="truncate text-xs font-bold text-gray-700">
              {address?.phone || "-"}
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-gray-50 px-3 py-2">
            <Mail
              size={13}
              className="text-gray-400"
            />

            <span className="truncate text-xs font-bold text-gray-700">
              {address?.email || "-"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}