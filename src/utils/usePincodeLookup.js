// src/utils/usePincodeLookup.js
"use client";

import { useEffect, useRef, useState } from "react";

/**
 * ✅ India Post Pincode Lookup (debounced + race-safe)
 * Rules (as per your requirement):
 * - Only fetch when pin is exactly 6 digits
 * - If no data available: DON'T show error (error stays "")
 * - Loader while fetching
 * - Returns: { city, district, state, postOfficeName, pincode }
 */
export function usePincodeLookup(pincode) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(""); // keep empty unless you *really* want to show something
  const lastReq = useRef(0);
  const cacheRef = useRef({}); // in-memory cache per session

  useEffect(() => {
    const pin = String(pincode || "").replace(/\D/g, "").slice(0, 6);

    // reset per pin change (no error UI)
    setError("");
    setData(null);

    // only when 6 digits
    if (!/^\d{6}$/.test(pin)) {
      setLoading(false);
      return;
    }

    // ✅ cache hit
    if (cacheRef.current[pin]) {
      setData(cacheRef.current[pin]);
      setLoading(false);
      return;
    }

    // request id to ignore stale responses
    const reqId = Date.now();
    lastReq.current = reqId;

    const timer = setTimeout(async () => {
      try {
        setLoading(true);

        const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`, {
          cache: "no-store",
        });

        const json = await res.json().catch(() => null);

        // ignore old response (user typed fast)
        if (lastReq.current !== reqId) return;

        const first = Array.isArray(json) ? json[0] : null;
        const po = first?.PostOffice?.[0];

        // ✅ if not found: just stop loading, keep data null, no error
        if (!first || first.Status !== "Success" || !po) {
          setData(null);
          return;
        }

        // NOTE: India Post fields vary; use District for city-like value
        const mapped = {
          pincode: pin,
          city: po?.District || po?.Block || po?.Name || "",
          district: po?.District || "",
          state: po?.State || "",
          postOfficeName: po?.Name || "",
        };

        cacheRef.current[pin] = mapped; // cache it
        setData(mapped);
      } catch (e) {
        // ✅ no error UI (silent fail)
        if (lastReq.current !== reqId) return;
        setData(null);
      } finally {
        if (lastReq.current === reqId) setLoading(false);
      }
    }, 350); // ✅ small debounce (fast feel)

    return () => clearTimeout(timer);
  }, [pincode]);

  return { loading, data, error }; // error will remain ""
}
