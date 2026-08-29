"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Upload, Loader2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

import { useMediaStore } from "@/store/useMediaStore";

const s = (v) => String(v ?? "").trim();

const IMAGE_FIELDS = [
  { key: "front", title: "Front" },
  { key: "back", title: "Back" },
  { key: "tag", title: "Tag" },
];

const REASONS = [
  { value: "wrong_size", label: "Wrong size / Fit issue" },
  { value: "wrong_item", label: "Wrong item received" },
  { value: "damaged", label: "Damaged product" },
  { value: "defective", label: "Defective product" },
  { value: "quality_issue", label: "Quality issue" },
  { value: "changed_mind", label: "Changed my mind" },
  { value: "other", label: "Other" },
];

const getUploadedList = (data) => {
  const value =
    data?.items ||
    data?.media ||
    data?.uploads ||
    data?.uploaded ||
    data?.files ||
    data?.results ||
    data?.data?.items ||
    data?.data?.media ||
    data?.data?.uploads ||
    data?.data;

  if (Array.isArray(value)) return value;
  return value && typeof value === "object" ? [value] : [];
};

const normalizeMedia = (media, evidenceType) => ({
  url: s(
    media?.url ||
      media?.secure_url ||
      media?.secureUrl ||
      media?.src
  ),
  publicId: s(
    media?.publicId ||
      media?.public_id ||
      media?.cloudinaryPublicId
  ),
  resourceType: s(
    media?.resourceType ||
      media?.resource_type ||
      "image"
  ),
  evidenceType,
});

export default function ReturnFileModal({
  open,
  onClose,
  item,
  itemName = "Item",
  onSubmitReturn,
  loading = false,
}) {
  const { uploadMedia, uploading } = useMediaStore();

  const [reason, setReason] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [files, setFiles] = useState({
    front: null,
    back: null,
    tag: null,
  });

  useEffect(() => {
    if (!open) return;

    setReason("");
    setCustomerNote("");
    setFiles({
      front: null,
      back: null,
      tag: null,
    });
  }, [open, item?.lineId]);

  const previews = useMemo(
    () => ({
      front: files.front ? URL.createObjectURL(files.front) : "",
      back: files.back ? URL.createObjectURL(files.back) : "",
      tag: files.tag ? URL.createObjectURL(files.tag) : "",
    }),
    [files]
  );

  useEffect(() => {
    return () => {
      Object.values(previews).forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [previews]);

  const imageCount = Object.values(files).filter(Boolean).length;
  const allImagesSelected = imageCount === 3;

  const busy = loading || uploading;

  const canSubmit =
    !!s(reason) &&
    !!s(customerNote) &&
    allImagesSelected &&
    !busy;

  if (!open) return null;

  const handleFile = (key, file) => {
    if (!file) return;

    if (!file.type?.startsWith("image/")) {
      return toast.error("Only images are allowed.");
    }

    if (file.size > 10 * 1024 * 1024) {
      return toast.error("Image must be under 10 MB.");
    }

    setFiles((prev) => ({
      ...prev,
      [key]: file,
    }));
  };

  const handleSubmit = async () => {
    if (!item?.lineId) {
      return toast.error("Item not found.");
    }

    if (!s(reason)) {
      return toast.error("Select return reason.");
    }

    if (!s(customerNote)) {
      return toast.error("Please add some details about the issue.");
    }

    if (!allImagesSelected) {
      return toast.error("Front, back and tag images are required.");
    }

    try {
      const result = await uploadMedia({
        files: [files.front, files.back, files.tag],
        folder: "oatclub/rma",
      });

      if (!result) throw new Error("Image upload failed.");

      const uploaded = getUploadedList(result);

      if (uploaded.length < 3) {
        throw new Error("Could not upload all 3 images.");
      }

      const media = [
        normalizeMedia(uploaded[0], "front"),
        normalizeMedia(uploaded[1], "back"),
        normalizeMedia(uploaded[2], "tag"),
      ];

      if (media.some((x) => !x.url)) {
        throw new Error("Invalid media response.");
      }

      await onSubmitReturn?.({
        item,
        reason: s(reason),
        customerNote: s(customerNote),
        media,
      });

      onClose?.();
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to submit return.");
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-end justify-center bg-black/50 sm:items-center sm:p-5">
      <div className="relative max-h-[88vh] w-full overflow-y-auto rounded-t-3xl bg-white p-4 shadow-2xl sm:max-w-lg sm:rounded-3xl sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-gray-900 sm:text-lg">
              Return Request
            </h3>

            <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">
              {itemName}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-full bg-gray-100 p-2"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-semibold text-gray-700">
            Return reason
          </label>

          <select
            value={reason}
            disabled={busy}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-xl bg-gray-100 px-3 py-2.5 text-sm outline-none"
          >
            <option value="" disabled>
              Select return reason
            </option>

            {REASONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3">
          <label className="mb-1.5 block text-xs font-semibold text-gray-700">
            Tell us more
          </label>

          <textarea
            value={customerNote}
            disabled={busy}
            onChange={(e) => setCustomerNote(e.target.value)}
            placeholder="Please describe the issue in a little more detail..."
            rows={3}
            maxLength={500}
            className="w-full resize-none rounded-xl bg-gray-100 px-3 py-3 text-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-black/10"
          />

          <div className="mt-1 text-right text-[10px] text-gray-400">
            {customerNote.length}/500
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              QC Images
            </p>

            <p className="text-[10px] text-gray-500">
              Front, back & tag required
            </p>
          </div>

          <span
            className={`text - xs font - bold ${
  allImagesSelected
    ? "text-green-600"
    : "text-gray-400"
} `}
          >
            {imageCount}/3
          </span>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {IMAGE_FIELDS.map(({ key, title }) => {
            const file = files[key];
            const preview = previews[key];

            return (
              <div key={key}>
                <div className="mb-1 flex items-center justify-center gap-1">
                  <span className="text-[11px] font-semibold">
                    {title}
                  </span>

                  {file && (
                    <CheckCircle2
                      size={12}
                      className="text-green-600"
                    />
                  )}
                </div>

                {preview ? (
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
                    <img
                      src={preview}
                      alt={title}
                      className="h-full w-full object-cover"
                    />

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        setFiles((prev) => ({
                          ...prev,
                          [key]: null,
                        }))
                      }
                      className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white"
                    >
                      <X size={11} />
                    </button>

                    <label className="absolute inset-x-1 bottom-1 cursor-pointer rounded-lg bg-white/95 py-1 text-center text-[9px] font-semibold">
                      Replace

                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={busy}
                        onChange={(e) =>
                          handleFile(key, e.target.files?.[0])
                        }
                      />
                    </label>
                  </div>
                ) : (
                  <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50">
                    <Upload size={17} />

                    <span className="mt-1 text-[10px] font-medium">
                      Upload
                    </span>

                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={busy}
                      onChange={(e) =>
                        handleFile(key, e.target.files?.[0])
                      }
                    />
                  </label>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-3 text-center text-[10px] text-gray-400">
          Clear images only • Maximum 10 MB each
        </p>

        <button
          type="button"
          disabled={!canSubmit}
          onClick={handleSubmit}
          className={`mt - 4 flex w - full items - center justify - center gap - 2 rounded - xl py - 3 text - sm font - semibold ${
  canSubmit
    ? "bg-black text-white"
    : "cursor-not-allowed bg-gray-100 text-gray-400"
} `}
        >
          {busy ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              {uploading ? "Uploading..." : "Submitting..."}
            </>
          ) : (
            "Submit Return"
          )}
        </button>
      </div>
    </div>
  );
}
