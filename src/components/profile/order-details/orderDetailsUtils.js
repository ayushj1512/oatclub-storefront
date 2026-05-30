import {
  Package,
  Truck,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  X,
} from "lucide-react";

export const DAY_MS = 24 * 60 * 60 * 1000;

export const STATUS_BADGE = {
  processing: "bg-yellow-50 text-yellow-700",
  packed: "bg-indigo-50 text-indigo-700",
  picked: "bg-blue-50 text-blue-700",
  shipped: "bg-blue-50 text-blue-700",
  out_for_delivery: "bg-purple-50 text-purple-700",
  delivered: "bg-green-50 text-green-700",
  return_requested: "bg-orange-50 text-orange-700",
  exchange_requested: "bg-orange-50 text-orange-700",
  returned: "bg-gray-100 text-gray-700",
  rto: "bg-black/5 text-black",
  cancelled: "bg-red-50 text-red-700",
  failed: "bg-red-50 text-red-700",
};

export const STATUS_ICON = {
  processing: Package,
  packed: Package,
  picked: Truck,
  shipped: Truck,
  out_for_delivery: Truck,
  delivered: CheckCircle2,
  return_requested: RotateCcw,
  exchange_requested: RotateCcw,
  returned: RotateCcw,
  rto: AlertTriangle,
  cancelled: X,
  failed: AlertTriangle,
};

export const CANCEL_ALLOWED = [
  "processing",
  "packed",
];

export const RMA_ALLOWED = [
  "delivered",
];

export const money = (value) => {
  const num = Number(value);

  if (!Number.isFinite(num)) return "0";

  return num.toLocaleString("en-IN");
};

export const safe = (value) =>
  value == null ? "" : String(value);

export const s = (value) =>
  safe(value).trim();

export function prettyStatus(value) {
  const v = String(value || "").toLowerCase();

  if (!v) return "Pending";

  return v
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}

export function formatDateIST(date) {
  if (!date) return "";

  try {
    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "short",
        day: "2-digit",
      }
    );
  } catch {
    return "";
  }
}

export function formatDateTimeIST(date) {
  if (!date) return "";

  try {
    return new Date(date).toLocaleString(
      "en-IN",
      {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  } catch {
    return "";
  }
}

export const toDate = (value) => {
  if (!value) return null;

  const date =
    value instanceof Date
      ? value
      : new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : date;
};

export function getDeliveredAtFromOrder(
  order
) {
  return (
    toDate(
      order?.trackingDetails?.deliveredAt
    ) ||
    toDate(
      order?.shipment?.deliveredAt
    ) ||
    toDate(
      order?.shipment?.shiprocket
        ?.deliveredAt
    ) ||
    toDate(
      order?.shipment?.shiprocket
        ?.delivered_date
    ) ||
    toDate(
      order?.statusTimestamps
        ?.deliveredAt
    ) ||
    toDate(order?.deliveredAt) ||
    null
  );
}

export function computeRmaWindow(
  deliveredAt,
  nowMs,
  windowDays = 7
) {
  const delivered =
    toDate(deliveredAt);

  if (!delivered) {
    return {
      isDelivered: false,
      isAllowed: false,
      daysLeft: 0,
      expiresAt: null,
    };
  }

  const expiresAt = new Date(
    delivered.getTime() +
      windowDays * DAY_MS
  );

  const diffMs =
    expiresAt.getTime() - nowMs;

  const daysLeft =
    diffMs > 0
      ? Math.ceil(diffMs / DAY_MS)
      : 0;

  return {
    isDelivered: true,
    isAllowed: daysLeft > 0,
    daysLeft,
    expiresAt,
  };
}

export function getOrderLabel(order) {
  if (!order) return "#";

  return order.orderNumber
    ? `#${order.orderNumber}`
    : `#${String(order._id).slice(-6)}`;
}

export function getCustomerName(order) {
  return (
    order?.shippingAddressSnapshot
      ?.fullName ||
    order?.customerId?.name ||
    "Customer"
  );
}

export function getFullAddress(
  address = {}
) {
  return [
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.country,
    address.pincode,
  ]
    .filter(Boolean)
    .join(", ");
}