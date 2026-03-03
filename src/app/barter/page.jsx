// app/barter/page.jsx
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ProductGrid from "@/components/common/ProductGrid";
import FilterSortBar from "@/components/category/FilterSortBar";
import { useProductStore } from "@/store/productStore";

const SORT_OPTIONS = [
    { label: "Newest (Default)", value: "newest" },
    { label: "Price: Low → High", value: "priceLowHigh" },
    { label: "Price: High → Low", value: "priceHighLow" },
];

const BARTER_CODES = [
  "00019","00022","00028","00031","00032","00034","00040","00046","00048","00049","00050",
  "00195","00206",
  "00210","00211","00217","00218","00219","00220","00221","00223","00224","00225","00226","00227","00229",
  "00234","00237","00239","00243","00245","00246","00247","00248","00249",
  "00256","00257","00259","00260","00263","00264","00266","00268","00270","00271",
  "00274","00275","00276","00277","00278","00279","00280","00282","00285","00288",
  "00292","00293","00297",
  "00300","00301","00302","00305","00306",
  "00310","00312","00313","00315","00316","00317","00319",
  "00321","00323","00324","00325","00327","00328","00329","00330","00331","00332","00333",
  "00335","00336","00339","00342","00343","00345","00347","00349","00350","00351","00356","00358",
  "00366","00370","00377","00396","00399",
  "00418","00419","00422","00424","00431","00434","00438","00444","00446","00447","00451","00452","00459","00461","00462","00476"
];

const uniq = (arr = []) =>
    Array.from(new Set(arr.map((x) => String(x).trim()).filter(Boolean)));

const toNum = (v, fb = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fb;
};

const getPrice = (p) => toNum(p?.price, 0);

const getTimeValue = (p) => {
    const raw = p?.raw ?? {};
    const t =
        raw?.createdAt ||
        raw?.updatedAt ||
        p?.dateCreated ||
        raw?.created_at ||
        raw?.updated_at ||
        raw?.dateCreated ||
        raw?.publishAt;

    const ms = new Date(t).getTime();
    return Number.isFinite(ms) ? ms : 0;
};

export default function BarterPage() {
    const pageTitle = "Creator Barter Closet";

    const isLoading = useProductStore((st) => st.isLoading);
    const error = useProductStore((st) => st.error);
    const clearError = useProductStore((st) => st.clearError);
    const fetchProductsByCodes = useProductStore((st) => st.fetchProductsByCodes);

    const [sort, setSort] = useState("newest");
    const [displayProducts, setDisplayProducts] = useState([]);
    const [isInitialFetching, setIsInitialFetching] = useState(false);

    const lastFetchRef = useRef("");

    const fetchBarterProducts = useCallback(async () => {
        const codes = uniq(BARTER_CODES);
        const key = `barter_${codes.join(",")}`;

        if (lastFetchRef.current === key) return;
        lastFetchRef.current = key;

        clearError?.();
        setIsInitialFetching(true);

        try {
            // ✅ Added isActive: true filter here
            const list = await fetchProductsByCodes(codes, {
                method: "POST",
                mergeIntoAllProducts: true,
                isActive: true,
            });

            // extra safety filter (in case backend ignores flag)
            const activeOnly = (Array.isArray(list) ? list : []).filter(
                (p) => p?.raw?.isActive !== false
            );

            setDisplayProducts(activeOnly);
        } catch {
            setDisplayProducts([]);
        } finally {
            setIsInitialFetching(false);
        }
    }, [fetchProductsByCodes, clearError]);

    useEffect(() => {
        fetchBarterProducts();
    }, [fetchBarterProducts]);

    const retry = useCallback(() => {
        lastFetchRef.current = "";
        fetchBarterProducts();
    }, [fetchBarterProducts]);

    const showInitialLoading =
        (isLoading || isInitialFetching) && (displayProducts?.length || 0) === 0;

    const list = useMemo(() => {
        let arr = Array.isArray(displayProducts) ? [...displayProducts] : [];

        if (sort === "priceLowHigh") arr.sort((a, b) => getPrice(a) - getPrice(b));
        else if (sort === "priceHighLow")
            arr.sort((a, b) => getPrice(b) - getPrice(a));
        else arr.sort((a, b) => getTimeValue(b) - getTimeValue(a));

        return arr;
    }, [displayProducts, sort]);

    return (
        <div className="min-h-screen bg-zinc-50">
            <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-5 sm:py-8">
                {/* Compact Mobile Hero */}
                <div className="mb-4 sm:mb-6 rounded-3xl border border-zinc-200 bg-white p-4 sm:p-6 shadow-sm">
                    <div className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-[11px] sm:text-xs font-semibold text-zinc-700">
                        ✨ Welcome, Creator
                    </div>

                    <h1 className="mt-2 text-[22px] leading-tight sm:text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900">
                        {pageTitle}
                    </h1>

                    <p className="mt-2 text-[13px] sm:text-sm text-zinc-600 max-w-2xl">
                        Pick your favorites, style them your way, and unleash your creativity.
                    </p>
                </div>

                <FilterSortBar
                    category="Barter Picks"
                    showInitialLoading={showInitialLoading}
                    sort={sort}
                    setSort={setSort}
                    sortOptions={SORT_OPTIONS}
                    hideFilterButton={true}
                />

                {!showInitialLoading && error && (
                    <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                        <div className="font-semibold">Something went wrong</div>
                        <div className="text-sm mt-1">{error}</div>
                        <button
                            onClick={retry}
                            className="mt-3 w-full sm:w-auto rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white"
                        >
                            Retry
                        </button>
                    </div>
                )}

                <div className="mt-5 sm:mt-6">
                    <ProductGrid products={list} loading={showInitialLoading} />
                </div>
            </div>
        </div>
    );
}