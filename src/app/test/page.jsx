// src/app/test/page.jsx
"use client";

/**
 * ✅ Full test page for pincode auto-fill
 * - Uses hook at: src/utils/usePincodeLookup.js
 * - Auto-fills City/District/State when pincode is 6 digits
 * - If no data -> user can enter manually
 * - Shows Post Office list + lets user pick one
 */

import { useEffect, useMemo, useState } from "react";
import { usePincodeLookup } from "@/utils/usePincodeLookup";

export default function TestPincodePage() {
  const [pincode, setPincode] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");

  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [stateName, setStateName] = useState("");

  // Hook result
  const { loading, data, error } = usePincodeLookup(pincode);

  // When hook returns data -> autofill
  useEffect(() => {
    if (data?.state || data?.district || data?.city) {
      setCity(data.city || "");
      setDistrict(data.district || "");
      setStateName(data.state || "");
    }
  }, [data]);

  // If pincode is not valid length -> clear error UI only (not user inputs)
  const pinValid = useMemo(() => /^\d{6}$/.test(String(pincode)), [pincode]);

  // Post offices list (if your hook returns list)
  const postOffices = data?.postOffices || [];
  const canSelectPO = Array.isArray(postOffices) && postOffices.length > 1;

  const onSelectPO = (idx) => {
    const po = postOffices[idx];
    if (!po) return;
    // Choose best mapping for your form:
    setCity(po.Block || po.Name || "");
    setDistrict(po.District || "");
    setStateName(po.State || "");
  };

  const filledByApi = !!(data?.state || data?.district || data?.city);

  return (
    <div className="min-h-[85vh] bg-[#F6F6F8] p-6">
      <div className="mx-auto max-w-3xl rounded-2xl border border-black/10 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.08)] overflow-hidden">
        <div className="px-6 py-5 border-b border-black/5">
          <h1 className="text-xl font-semibold text-gray-900">Pincode Auto-fill Test</h1>
          <p className="mt-1 text-sm text-gray-600">
            Type a 6-digit pincode. If data exists, City/District/State will autofill. Otherwise enter manually.
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* PINCODE */}
          <Field
            label="Pincode"
            hint="Only numbers, 6 digits"
            value={pincode}
            onChange={(v) => setPincode(v.replace(/\D/g, "").slice(0, 6))}
            placeholder="e.g. 110001"
            right={
              loading ? (
                <span className="text-xs text-gray-500">Fetching…</span>
              ) : pinValid ? (
                filledByApi ? (
                  <Badge text="Auto-filled" tone="good" />
                ) : (
                  <Badge text="Manual" tone="warn" />
                )
              ) : (
                <span className="text-xs text-gray-400">—</span>
              )
            }
          />

          {/* API feedback */}
          {pinValid && (
            <div className="rounded-xl border border-black/10 bg-black/[0.02] px-4 py-3">
              {loading ? (
                <p className="text-sm text-gray-600">Looking up pincode…</p>
              ) : error ? (
                <p className="text-sm text-red-700">
                  {error} <span className="text-red-600">(enter manually)</span>
                </p>
              ) : filledByApi ? (
                <p className="text-sm text-green-700">
                  Found location data. You can still edit fields if needed.
                </p>
              ) : (
                <p className="text-sm text-gray-600">No lookup data yet.</p>
              )}
            </div>
          )}

          {/* ADDRESS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Address Line 1" value={line1} onChange={setLine1} placeholder="House no, Street" />
            <Field label="Address Line 2" value={line2} onChange={setLine2} placeholder="Landmark (optional)" />
          </div>

          {/* AUTOFILL FIELDS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field
              label="City / Area"
              value={city}
              onChange={setCity}
              placeholder="City / Area"
              hint={filledByApi ? "Auto-filled (editable)" : "Manual"}
            />
            <Field
              label="District"
              value={district}
              onChange={setDistrict}
              placeholder="District"
              hint={filledByApi ? "Auto-filled (editable)" : "Manual"}
            />
            <Field
              label="State"
              value={stateName}
              onChange={setStateName}
              placeholder="State"
              hint={filledByApi ? "Auto-filled (editable)" : "Manual"}
            />
          </div>

          {/* Post office chooser (optional) */}
          {pinValid && canSelectPO && !loading && !error ? (
            <div className="rounded-2xl border border-black/10 bg-white p-4">
              <div className="text-sm font-semibold text-gray-900">Pick a Post Office (optional)</div>
              <p className="mt-1 text-xs text-gray-600">
                Some pincodes map to multiple post offices. Selecting one can refine the city/area.
              </p>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {postOffices.map((po, idx) => (
                  <button
                    key={`${po?.Name || "PO"}-${idx}`}
                    onClick={() => onSelectPO(idx)}
                    className="text-left rounded-xl border border-black/10 bg-black/[0.02] hover:bg-black/[0.04] transition px-3 py-2"
                    type="button"
                  >
                    <div className="text-sm font-semibold text-gray-900 truncate">{po?.Name || "Post Office"}</div>
                    <div className="text-xs text-gray-600 truncate">
                      {[
                        po?.Block || "",
                        po?.District || "",
                        po?.State || "",
                        po?.Country || "India",
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* Preview */}
          <div className="rounded-2xl border border-black/10 bg-white p-4">
            <div className="text-sm font-semibold text-gray-900">Preview JSON</div>
            <pre className="mt-3 text-xs bg-black/[0.03] border border-black/10 rounded-xl p-3 overflow-auto">
{JSON.stringify(
  {
    pincode,
    line1,
    line2,
    city,
    district,
    state: stateName,
    lookupData: data,
    lookupError: error,
    lookupLoading: loading,
  },
  null,
  2
)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, value, onChange, placeholder, right }) {
  return (
    <div className="space-y-1">
      <div className="flex items-end justify-between gap-2">
        <div>
          <div className="text-sm font-semibold text-gray-900">{label}</div>
          {hint ? <div className="text-[11px] text-gray-500">{hint}</div> : null}
        </div>
        {right ? <div className="pb-1">{right}</div> : null}
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-black/10"
      />
    </div>
  );
}

function Badge({ text, tone = "good" }) {
  const cls =
    tone === "good"
      ? "bg-green-50 text-green-700 border-green-200"
      : "bg-amber-50 text-amber-700 border-amber-200";
  return <span className={`text-[11px] font-semibold px-2 py-1 rounded-lg border ${cls}`}>{text}</span>;
}
