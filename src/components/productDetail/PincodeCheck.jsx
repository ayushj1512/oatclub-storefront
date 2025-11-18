"use client";

import { useState } from "react";
import { MapPin, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function PincodeCheck() {
  const [pincode, setPincode] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!pincode || pincode.length !== 6) {
      toast.error("Please enter a valid 6-digit pincode");
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      // Simulate API call — later replace with Shiprocket or your backend
      await new Promise((r) => setTimeout(r, 1000));

      const available = ["110001", "400001", "560001", "122001"]; // mock available pincodes
      if (available.includes(pincode)) {
        setStatus("available");
        toast.success("Delivery available ✅");
      } else {
        setStatus("unavailable");
        toast.error("Sorry, delivery not available at this location ❌");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-2xl p-4 flex flex-col gap-3 bg-white shadow-sm">
      <div className="flex items-center gap-2">
        <MapPin className="text-pink-600 w-5 h-5" />
        <p className="font-medium text-gray-800">Check Delivery Availability</p>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          maxLength="6"
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
          placeholder="Enter Pincode"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 outline-none"
        />
        <button
          onClick={handleCheck}
          disabled={loading}
          className={`px-5 py-2 rounded-lg font-semibold text-white transition ${
            loading ? "bg-gray-400" : "bg-pink-600 hover:bg-pink-700"
          }`}
        >
          {loading ? "Checking..." : "Check"}
        </button>
      </div>

      {status && (
        <div className="flex items-center gap-2 text-sm mt-2">
          {status === "available" ? (
            <>
              <CheckCircle className="text-green-500 w-5 h-5" />
              <span className="text-green-600 font-medium">
                Delivery available to your area!
              </span>
            </>
          ) : (
            <>
              <XCircle className="text-red-500 w-5 h-5" />
              <span className="text-red-600 font-medium">
                Delivery not available for this pincode.
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
