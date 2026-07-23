// src/app/[category]/[product_name]/[id]/page.jsx
"use client";

import { use, useEffect, useMemo, useState, useCallback } from "react";
import { Heart, RotateCcw, Share2, ShieldCheck, ShoppingCart, Truck, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";
import { useProductStore } from "@/store/productStore";
import { notify } from "@/lib/notify";
import SizeGuideModal from "../../../../../components/productDetail/SizeGuideModal";
import ProductGallery from "@/components/productDetail/ProductGallery";
import ProductSpotlight from "@/components/productDetail/ProductSpotlight";
import RelatedProducts from "@/components/productDetail/relatedProducts";
import WashcareSection from "@/components/productDetail/WashcareSection";
import ProductDetailSection from "@/components/productDetail/ProductDetailSection";
import ColorSelector from "@/components/productDetail/ColorSelector";
import ShippingHighlights from "@/components/productDetail/ShippingHighlights";
import CrossSellProducts from "@/components/productDetail/CrossSellProducts";
import LepordCollectionAnnouncement from "@/components/productDetail/LepordCollectionAnnouncement";
import ProductInformationSuite from "@/components/productDetail/ProductInformationSuite";
import ReviewSection from "@/components/productDetail/ReviewSection";
import useGtmStore from "@/store/gtmStore";
import ProductNotFound from "@/components/productDetail/ProductNotFound";
import { useMarketingCampaignStore } from "@/store/marketing-campaignStore";
import CouponPriceSlideshow from "@/components/productDetail/CouponPriceSlideshow";
import SizeRecommendationModal from "@/components/productDetail/SizeRecommendationModal";
import DispatchTimeline from "@/components/productDetail/DispatchTimeline";

const money = (n) => {
  const num = Number(n);
  if (!Number.isFinite(num)) return "0";
  return num.toLocaleString("en-IN");
};

function TrustStrip({ product }) {
  const raw = product?.raw || product || {};
  const inStock = Boolean(raw.isInStock ?? product?.isInStock);

  const items = [
    [
      ShieldCheck,
      "Quality Checked",
      "Finish and fabric reviewed before dispatch.",
    ],
    [
      Truck,
      inStock ? "Fast Dispatch" : "Made For You",
      inStock
        ? "Ready pieces move quickly from our studio."
        : "Dispatch timeline adjusts for limited stock pieces.",
    ],
    [
      RotateCcw,
      "Easy Exchange",
      "Simple account-led support for size or fit concerns.",
    ],
  ];

  return (
    <section className="border-y border-neutral-200 bg-white">
      <div className="grid grid-cols-3">
        {items.map(([Icon, title, desc]) => (
          <div
            key={title}
            className="flex flex-col items-center justify-center px-2 py-4 text-center md:flex-row md:items-start md:justify-start md:gap-3 md:px-4 md:text-left"
          >
            <Icon className="mb-2 h-4 w-4 shrink-0 text-emerald-600 md:mb-0 md:mt-0.5" />

            <div>
              <div className="flex items-center justify-center gap-1 md:justify-start">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-neutral-900 md:text-[10px]">
                  {title}
                </p>
              </div>

              <p className="mt-1 hidden text-[11px] leading-4 text-neutral-500 md:block">
                {desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Accordion({ title, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-black/10 py-3">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between text-left text-sm font-bold uppercase tracking-[0.12em] text-black"
        aria-expanded={open}
      >
        {title}
        <span className="text-lg leading-none">{open ? "-" : "+"}</span>
      </button>
      {open ? <div className="mt-3">{children}</div> : null}
    </div>
  );
}

function SizeGuideSection() {
  return (
    <Accordion title="Size Guide">
      <div className="text-gray-700 text-sm leading-relaxed space-y-4">
        <p className="font-medium text-black">How to Measure</p>
        <ul className="space-y-1">
          <li>
            • <strong>Bust:</strong> Measure around the fullest part of your chest.
          </li>
          <li>
            • <strong>Waist:</strong> Measure around the narrowest part of your waist.
          </li>
          <li>
            • <strong>Hips:</strong> Measure around the widest part of your hips.
          </li>
          <li>
            • <strong>Length:</strong> Measure from shoulder to hem.
          </li>
        </ul>

        <div className="pt-3">
          <p className="font-medium text-black mb-2">Size Chart (General)</p>
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-2">Size</th>
                <th className="py-2">Bust</th>
                <th className="py-2">Waist</th>
                <th className="py-2">Hips</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2">XS</td>
                <td>30-32&quot;</td>
                <td>24-26&quot;</td>
                <td>32-34&quot;</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">S</td>
                <td>32-34&quot;</td>
                <td>26-28&quot;</td>
                <td>34-36&quot;</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">M</td>
                <td>34-36&quot;</td>
                <td>28-30&quot;</td>
                <td>36-38&quot;</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">L</td>
                <td>36-38&quot;</td>
                <td>30-32&quot;</td>
                <td>38-40&quot;</td>
              </tr>
              <tr>
                <td className="py-2">XL</td>
                <td>38-40&quot;</td>
                <td>32-34&quot;</td>
                <td>40-42&quot;</td>
              </tr>
            </tbody>

          </table>
        </div>
      </div>
    </Accordion>
  );
}
const str = (v) => (v == null ? "" : String(v));
const SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"];

const getSizeFromSku = (sku) => {
  const parts = str(sku).toUpperCase().split("-").filter(Boolean);
  for (let i = parts.length - 1; i >= 0; i--) {
    if (SIZE_ORDER.includes(parts[i])) return parts[i];
  }
  return "";
};

const getColorFromSku = () => "";




/* -------- variant helpers ---------- */


const getAttrValue = (attrs, key) => {
  const k = str(key).trim().toLowerCase();
  const arr = Array.isArray(attrs) ? attrs : [];

  const found = arr.find((a) => {
    const ak = str(a?.key || a?.name || a?.slug).trim().toLowerCase();
    return ak === k;
  });

  return found?.value != null ? str(found.value) : "";
};


const deriveSizesFromBackend = (normalized) => {
  if (!normalized) return [];
  const raw = normalized.raw || normalized;

  // 1) Try product attributes if available
  const attrs = Array.isArray(raw?.attributes) ? raw.attributes : [];
  const sizeAttr = attrs.find(
    (a) =>
      str(a?.key).toLowerCase() === "size" ||
      str(a?.attribute?.slug).toLowerCase() === "size"
  );

  if (Array.isArray(sizeAttr?.values) && sizeAttr.values.length) {
    return sizeAttr.values
      .map((s) => str(s).trim().toUpperCase())
      .filter(Boolean);
  }

  // 2) ✅ Correct fallback: derive sizes from variant attributes first, then SKU
  const vars = Array.isArray(raw?.variants) ? raw.variants : [];

  const sizes = vars
    .map((v) => {
      const fromAttr = str(getAttrValue(v?.attributes, "size")).trim().toUpperCase();
      return fromAttr || getSizeFromSku(v?.sku);
    })
    .filter(Boolean);

  // unique + sorted
  const uniq = Array.from(new Set(sizes));
  uniq.sort((a, b) => {
    const ia = SIZE_ORDER.indexOf(a);
    const ib = SIZE_ORDER.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b);
  });

  return uniq;
};


const deriveColorsFromBackend = (normalized) => {
  if (!normalized) return [];

  const raw = normalized.raw || normalized;

  // 1) product-level color attributes (if backend sends)
  const attrs = Array.isArray(raw?.attributes) ? raw.attributes : [];
  const colorAttr = attrs.find((a) => {
    const key = str(a?.key || a?.slug || a?.attribute?.slug).trim().toLowerCase();
    return key === "color";
  });

  if (Array.isArray(colorAttr?.values) && colorAttr.values.length) {
    return colorAttr.values
      .map((c) => (typeof c === "string" ? c : c?.value || c?.label || ""))
      .map((c) => str(c).trim().toLowerCase())
      .filter(Boolean);
  }

  // 2) ✅ variant-level color from attributes ONLY (do NOT guess from SKU)
  const vars = Array.isArray(raw?.variants) ? raw.variants : [];
  const colors = vars
    .map((v) => str(getAttrValue(v?.attributes, "color")).trim().toLowerCase())
    .filter(Boolean);

  return Array.from(new Set(colors));
};


const hasColorForSize = (normalized, size) => {
  const raw = normalized?.raw || normalized;
  const vars = Array.isArray(raw?.variants) ? raw.variants : [];
  const wantedSize = str(size).trim().toUpperCase();

  return vars.some((v) => {
    const s =
      str(getAttrValue(v?.attributes, "size")).trim().toUpperCase() ||
      getSizeFromSku(v?.sku);

    if (wantedSize && s !== wantedSize) return false;

    const c = str(getAttrValue(v?.attributes, "color")).trim();
    return Boolean(c); // ✅ only real color attribute
  });
};




const getColorsForSize = (normalized, size) => {
  const raw = normalized?.raw || normalized;
  const vars = Array.isArray(raw?.variants) ? raw.variants : [];
  const wantedSize = str(size).trim().toUpperCase();

  const colors = vars
    .filter((v) => {
      const s =
        str(getAttrValue(v?.attributes, "size")).trim().toUpperCase() ||
        getSizeFromSku(v?.sku);

      return wantedSize ? s === wantedSize : true;
    })
    // ✅ Only from attributes; no SKU guessing
    .map((v) => str(getAttrValue(v?.attributes, "color")).trim().toLowerCase())
    .filter(Boolean);

  return Array.from(new Set(colors));
};




const deriveImageList = (normalized) => {
  const images = Array.isArray(normalized?.images) ? normalized.images : [];
  const thumb = normalized?.thumbnail || normalized?.image || images?.[0] || "";
  const merged = [thumb, ...images].filter(Boolean).map(String);
  return Array.from(new Set(merged));
};

const getSpecValue = (product, key) => {
  const raw = product?.raw || product || {};
  const specs = Array.isArray(raw?.specifications) ? raw.specifications : [];
  const found = specs.find(
    (item) => str(item?.key).trim().toLowerCase() === str(key).trim().toLowerCase()
  );
  return str(found?.value);
};

const getCareInstructions = (product) => {
  const backendCare = getSpecValue(product, "Care Instructions");
  if (backendCare) {
    return backendCare
      .split(/[,|]/)
      .map((item) => item.trim().toUpperCase())
      .filter(Boolean);
  }

  return [
    "MACHINE WASH COLD WITH LIKE COLORS",
    "DO NOT BLEACH",
    "TUMBLE DRY LOW OR HANG DRY",
    "COOL IRON IF NEEDED",
    "DO NOT DRY CLEAN",
  ];
};

const findVariantIdByAttributes = (normalized, picked = {}) => {
  const raw = normalized?.raw || normalized;
  const vars = Array.isArray(raw?.variants) ? raw.variants : [];

  const wantedSize = str(picked.size).trim().toUpperCase();
  const wantedColor = str(picked.color).trim().toLowerCase();

  if (!wantedSize && !wantedColor) return null;

  // ✅ check if this size actually has color variants
  const colorNeeded = wantedSize ? hasColorForSize(normalized, wantedSize) : false;

  // ✅ if color needed but not selected, stop
  if (colorNeeded && !wantedColor) return null;

  const match = vars.find((v) => {
    const size =
      str(getAttrValue(v?.attributes, "size")).trim().toUpperCase() ||
      getSizeFromSku(v?.sku);

    const color =
      str(getAttrValue(v?.attributes, "color")).trim().toLowerCase() ||
      getColorFromSku(v?.sku);

    if (wantedSize && size !== wantedSize) return false;

    // ✅ match color only if needed
    if (colorNeeded && wantedColor && color !== wantedColor) return false;

    return true;
  });

  return match?._id || match?.id || null;
};







// ✅ cart key matches your cart store: `${pid}__${vid}`
const cartKeyFor = (productId, variantId) => `${str(productId)}__${str(variantId || "")}`;

export default function ProductPage({ params }) {
  const router = useRouter();

  // ✅ Next 16: params is Promise -> unwrap with React.use()
  const unwrapped = use(params);
  const category = unwrapped?.category;
  const id = unwrapped?.id;

  const cartInitialize = useCartStore((s) => s.initialize);
  const cartItems = useCartStore((s) => s.items);
  const addToCart = useCartStore((s) => s.addToCart);
  const setBuyNow = useCartStore((s) => s.setBuyNow);

  const wishlistStore = useWishlistStore();
  const { addToWishlist, removeFromWishlist, isInWishlist, initialize: initWishlist } = wishlistStore;

  const recentlyViewedStore = useRecentlyViewedStore();

  const fetchProductDetails = useProductStore((s) => s.fetchProductDetails);
  const fetchProductDetailsByCode = useProductStore(
    (s) => s.fetchProductDetailsByCode
  );
  const storeLoading = useProductStore((s) => s.isLoading);

  const [normalized, setNormalized] = useState(null);
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [sizeRecommendationOpen, setSizeRecommendationOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);

  const viewItem = useGtmStore((s) => s.viewItem);

  const trackProductView = useMarketingCampaignStore((s) => s.trackProductView);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.history.scrollRestoration = "manual";
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [id]);

  useEffect(() => {
    cartInitialize?.();
    initWishlist?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!id) return;
      setLoading(true);

      try {
        let p = null;

        // ✅ auto-detect: Mongo ObjectId vs productCode
        if (/^[a-f\d]{24}$/i.test(id)) {
          p = await fetchProductDetails(id);
        } else {
          p = await fetchProductDetailsByCode(id);
        }

        if (!mounted || !p) return;

        setNormalized(p);

        const sizes = deriveSizesFromBackend(p);
        const colors = deriveColorsFromBackend(p);
        const images = deriveImageList(p);

        const mapped = {
          id: p.productId,
          productId: p.productId,
          productCode: p.productCode,
          name: p.name,
          slug: p.slug,
          price: Number(p.price || 0),
          regularPrice: Number(p.compareAtPrice ?? p.price ?? 0),
          onSale:
            Number(p.compareAtPrice ?? 0) > Number(p.price ?? 0),
          images,
          productSpotlight: Array.isArray(p?.raw?.productSpotlight)
            ? p.raw.productSpotlight
            : Array.isArray(p?.productSpotlight)
              ? p.productSpotlight
              : [],
          description: p.raw?.description || p.description || "",
          shortDescription: p.raw?.shortDescription || "",
          sizes,
          colors,
          isInStock: Boolean(p.isInStock ?? true),
          stock: Number(p.stock ?? 0),
          productType: p.productType,
          raw: p.raw || p,
        };

        setProduct(mapped);

        // ✅ reset default selection
        let nextSize = null;
        let nextColor = null;

        // auto-select size if single
        if (sizes.length === 1) nextSize = sizes[0];

        // auto-select color only if needed and single
        if (nextSize) {
          const needsColor = hasColorForSize(p, nextSize);
          if (needsColor && colors.length === 1) nextColor = colors[0];
        }

        setSelectedSize(nextSize);
        setSelectedColor(nextColor);

        // ✅ resolve variantId
        let vid = null;

        if (nextSize) {
          const needsColor = hasColorForSize(p, nextSize);

          if (needsColor) {
            vid = nextColor
              ? findVariantIdByAttributes(p, {
                size: nextSize,
                color: nextColor,
              })
              : null;
          } else {
            vid = findVariantIdByAttributes(p, { size: nextSize });
          }
        }

        setSelectedVariantId(vid);
      } catch (e) {
        console.error("[ProductPage] load failed", e);
        notify.error(e?.message || "Failed to load product");

        if (mounted) {
          setProduct(null);
          setNormalized(null);
          setSelectedSize(null);
          setSelectedColor(null);
          setSelectedVariantId(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [id, fetchProductDetails, fetchProductDetailsByCode]);


  useEffect(() => {
    if (!product) return;
    recentlyViewedStore.addProduct?.(product);
  }, [product, recentlyViewedStore]);

  useEffect(() => {
    if (!product?.productId) return;

    const productCategory =
      product?.raw?.categories?.[0]?.name || category || "";

    viewItem({
      ...product,
      category: productCategory,
    });

    trackProductView({
      productId: product.productId,
      productName: product.name,
      cartValue: Number(product.price || 0),
      pageUrl:
        typeof window !== "undefined" ? window.location.href : "",
    });
  }, [
    product?.productId,
    product?.name,
    product?.price,
    product?.raw?.categories,
    viewItem,
    category,
    trackProductView,
  ]);

  const requireColor = useMemo(() => {
    if (!normalized) return false;
    if (!selectedSize) return false; // ✅ size choose nahi -> color kabhi force mat karo
    return hasColorForSize(normalized, selectedSize);
  }, [normalized, selectedSize]);



  const requireSize = (product?.sizes?.length || 0) > 0;
  const wishlisted = isInWishlist?.(product?.productId || product?.id);

  // ✅ Determine which cart entry corresponds to current selection
  const selectedCartKey = useMemo(() => {
    if (!product?.productId) return "";
    const vid = product?.productType === "variable" || requireSize ? selectedVariantId : null;
    return cartKeyFor(product.productId, vid);
  }, [product?.productId, product?.productType, requireSize, selectedVariantId]);

  // ✅ If it's already in cart => show "Added + View Cart" and KEEP it
  const selectionInCart = useMemo(() => {
    if (!selectedCartKey) return false;
    const arr = Array.isArray(cartItems) ? cartItems : [];
    return arr.some((it) => {
      const k = it?.__key ? String(it.__key) : cartKeyFor(it?.productId, it?.variantId);
      return k === selectedCartKey;
    });
  }, [cartItems, selectedCartKey]);

  const handleSizeSelect = useCallback(
    (size) => {
      const nextSize = str(size).trim().toUpperCase();

      setSelectedSize(nextSize);

      const needsColor = normalized
        ? hasColorForSize(normalized, nextSize)
        : false;

      if (!needsColor) {
        setSelectedColor(null);

        const variantId = normalized
          ? findVariantIdByAttributes(normalized, {
            size: nextSize,
          })
          : null;

        setSelectedVariantId(variantId);
        return;
      }

      const validColors = normalized
        ? getColorsForSize(normalized, nextSize)
        : [];

      const currentColor = str(selectedColor).trim().toLowerCase();
      const isCurrentColorValid =
        currentColor && validColors.includes(currentColor);

      if (!isCurrentColorValid) {
        setSelectedColor(null);
        setSelectedVariantId(null);
        return;
      }

      const variantId = findVariantIdByAttributes(normalized, {
        size: nextSize,
        color: currentColor,
      });

      setSelectedVariantId(variantId);
    },
    [normalized, selectedColor]
  );

  const handleAddToCart = useCallback(() => {

    if (!normalized || !product) return;

    if (requireSize && !selectedSize) return notify.error("PLEASE SELECT A SIZE");
    if (requireColor && !selectedColor) return notify.error("PLEASE SELECT A COLOR");

    if (product.productType === "variable" && !selectedVariantId) {
      return notify.error(requireColor ? "PLEASE SELECT SIZE & COLOR" : "PLEASE SELECT A SIZE");
    }
    const finalColor = requireColor ? selectedColor : null;
    addToCart({
      product: normalized,
      qty: 1,
      selectedSize,
      selectedColor: finalColor,  // ✅ yahi important
      variantId: product.productType === "variable" || requireSize ? selectedVariantId : null,
    });
  }, [
    addToCart,
    normalized,
    product,
    requireSize,
    requireColor,
    selectedSize,
    selectedColor,
    selectedVariantId,
  ]);



  const handleViewCart = () => router.push("/cart");

  // ✅ Your request: Buy Now button should become "View Cart"
  const handleBuyNowOrViewCart = async () => {
    // ✅ If already in cart -> go cart
    if (selectionInCart) {
      router.push("/cart");
      return;
    }

    if (!normalized || !product) return;

    if (requireSize && !selectedSize) {
      notify.error("PLEASE SELECT A SIZE");
      return;
    }

    if (requireColor && !selectedColor) {
      notify.error("PLEASE SELECT A COLOR");
      return;
    }

    if ((product.productType === "variable" || requireSize || requireColor) && !selectedVariantId) {
      notify.error(requireColor ? "PLEASE SELECT SIZE & COLOR" : "PLEASE SELECT A SIZE");
      return;
    }
    const finalColor = requireColor ? selectedColor : null;
    // ✅ BUY NOW SHOULD NOT TOUCH CART
    setBuyNow({
      product: normalized,
      qty: 1,
      selectedSize,
      selectedColor: finalColor,  // ✅ yahi important
      variantId:
        product.productType === "variable" || requireSize || requireColor
          ? selectedVariantId
          : null,
    });

    router.push("/checkout?mode=buy-now");
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    const pid = product.productId || product.id;
    const inWL = isInWishlist?.(pid);

    if (inWL) {
      removeFromWishlist(pid);
      notify.wishlistRemoved(product);
    } else {
      addToWishlist(product);
      notify.wishlistAdded(product);
    }
  };

  const shareMessage = useMemo(() => {
    if (!product) return "";
    const link = typeof window !== "undefined" ? window.location.href : "";
    return `${product.name}\nRS. ${money(product.price)}${selectedSize ? ` / SIZE: ${selectedSize}` : ""
      }${selectedColor ? ` / COLOR: ${selectedColor}` : ""}\n${link}`;

  }, [product, selectedSize, selectedColor]);

  const handleShare = async () => {
    if (!product) return;
    const url = (typeof window !== "undefined" && window.location.href) || "";

    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, text: shareMessage, url });
        notify.info("THANKS FOR SHARING");
      } else {
        await navigator.clipboard.writeText(shareMessage);
        notify.copied("SHARE TEXT COPIED");
      }
    } catch { }
  };

  if (loading || storeLoading) {
    return (
      <div className="w-full bg-white text-black">
        <div className="w-full px-0 py-0 xl:px-8 xl:py-5">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[55fr_45fr] xl:items-start xl:gap-1">
            <section className="min-w-0">
              <div className="min-h-[133vw] w-full bg-white xl:min-h-0">
                <ProductGallery images={[]} />
              </div>
            </section>
            <aside className="min-w-0 bg-white px-4 pt-4 md:px-6 xl:px-8 xl:py-5">
              <div className="space-y-4">
                <div className="h-3 w-40 animate-pulse bg-neutral-100" />
                <div className="h-8 w-4/5 animate-pulse bg-neutral-100" />
                <div className="h-7 w-44 animate-pulse bg-neutral-100" />
                <div className="grid grid-cols-5 gap-2">
                  {[0, 1, 2, 3, 4].map((item) => (
                    <div key={item} className="h-10 animate-pulse border border-neutral-100 bg-neutral-50" />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-11 animate-pulse bg-neutral-100" />
                  <div className="h-11 animate-pulse bg-neutral-100" />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    );
  }

  if (!product || product?.raw?.isActive === false) {
    return <ProductNotFound />;
  }

  return (
    <div className="w-full bg-white pb-20 text-black xl:pb-0">
      <div className="w-full px-0 py-0 xl:px-8 xl:py-5">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[55fr_45fr] xl:items-start xl:gap-1">
          {/* LEFT IMAGE */}
          <section className="min-w-0">
            <div className="min-h-[133vw] w-full bg-white xl:min-h-0">
              <ProductGallery images={product.images || []} />
            </div>
          </section>

          {/* RIGHT DETAILS */}
          <aside className="min-w-0 bg-white px-4 md:px-6 xl:sticky xl:top-24 xl:max-h-[calc(100vh-96px)] xl:overflow-y-auto xl:px-8 xl:py-5">
            <div className="space-y-3">
              {/* Breadcrumb */}
              <div className="flex flex-wrap items-center gap-1 text-[9px] font-extrabold uppercase tracking-[0.2em] text-black/40">
                <Link href="/" className="transition hover:text-black">
                  Home
                </Link>
                <span>/</span>
                <Link
                  href={`/category/${category}`}
                  className="transition hover:text-black"
                >
                  {product?.raw?.categories?.[0]?.name
                    ? decodeURIComponent(product.raw.categories[0].name)
                      .replace(/-/g, " ")
                      .trim()
                    : decodeURIComponent(category || "")
                      .replace(/-/g, " ")
                      .trim()}
                </Link>
              </div>

              {/* Title */}
              <div className="space-y-2 border-b border-black/10 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    {product?.raw?.categories?.[0]?.name ? (
                      <span className="bg-black px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-white">
                        {String(product.raw.categories[0].name).toUpperCase()}
                      </span>
                    ) : null}

                    {product?.productCode ? (
                      <span className="text-[10px] uppercase tracking-[0.18em] text-black/50">
                        SKU{" "}
                        <span className="font-semibold text-black">
                          {product.productCode}
                        </span>
                      </span>
                    ) : null}
                  </div>

                  <div className="ml-auto flex shrink-0 items-center gap-2">
                    <button
                      onClick={handleToggleWishlist}
                      className="grid h-9 w-9 place-items-center bg-transparent text-black transition hover:text-black/55 active:scale-95"
                      aria-label={
                        wishlisted ? "Remove from wishlist" : "Add to wishlist"
                      }
                      title={wishlisted ? "Wishlisted" : "Add to wishlist"}
                    >
                      <Heart
                        size={18}
                        className={wishlisted ? "fill-current" : ""}
                      />
                    </button>

                    <button
                      onClick={handleShare}
                      className="grid h-9 w-9 place-items-center bg-transparent text-black transition hover:text-black/55 active:scale-95"
                      aria-label="Share"
                      title="Share"
                    >
                      <Share2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h1 className="text-[18px] font-extrabold uppercase leading-[1.08] text-black md:text-[22px] xl:text-[26px]">
                      {product.name}
                    </h1>
                  </div>


                </div>
              </div>

              <LepordCollectionAnnouncement
                collections={product?.raw?.collections || []}
              />

              {/* Price */}
              <div className="border-b border-black/10 pb-3">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div className="flex flex-wrap items-end gap-3">
                    <span className="text-[22px] font-extrabold leading-none text-black md:text-[27px]">
                      RS. {money(product.price)}
                    </span>

                    {product.regularPrice > product.price ? (
                      <>
                        <span className="pb-1 text-base font-medium text-black/35 line-through">
                          RS. {money(product.regularPrice)}
                        </span>

                        <span className="mb-1 bg-black px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-white">
                          {Math.round(
                            ((product.regularPrice - product.price) /
                              product.regularPrice) *
                            100
                          )}
                          % OFF
                        </span>
                      </>
                    ) : null}
                  </div>

                  <p className="text-xs font-medium text-black/45">
                    INCLUSIVE OF ALL TAXES
                  </p>
                </div>
              </div>

              <CouponPriceSlideshow product={product} />

              {/* Size Selector */}
              {(product.sizes || []).length > 0 && (
                <div className="border-b border-black/10 pb-4">
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xs font-extrabold uppercase tracking-[0.08em] text-black">
                        SELECT SIZE
                      </h3>

                      <button
                        type="button"
                        onClick={() => setSizeRecommendationOpen(true)}
                        className="mt-1 text-left text-[10px] font-bold uppercase tracking-[0.06em] text-black/45 underline decoration-black/25 underline-offset-4 transition hover:text-black"
                      >
                        Not sure about size? Find your fit
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSizeGuideOpen(true)}
                      className="shrink-0 text-[10px] font-extrabold uppercase tracking-[0.08em] text-black underline underline-offset-4 transition hover:text-black/60"
                    >
                      SIZE GUIDE
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      const sizeOrder = [
                        "XXS",
                        "XS",
                        "S",
                        "M",
                        "L",
                        "XL",
                        "XXL",
                        "3XL",
                        "4XL",
                        "5XL",
                      ];

                      const sortedSizes = [...(product.sizes || [])]
                        .map((x) => str(x).trim().toUpperCase())
                        .filter(Boolean)
                        .sort((a, b) => {
                          const ia = sizeOrder.indexOf(a);
                          const ib = sizeOrder.indexOf(b);
                          if (ia !== -1 && ib !== -1) return ia - ib;
                          if (ia !== -1) return -1;
                          if (ib !== -1) return 1;
                          return a.localeCompare(b);
                        });

                      return sortedSizes.map((s) => {
                        const active = selectedSize === s;

                        return (
                          <button
                            key={s}
                            onClick={() => handleSizeSelect(s)}
                            className={`h-10 min-w-11 border border-black px-3.5 text-xs font-semibold transition active:scale-95 ${active
                              ? "bg-black text-white"
                              : "bg-white text-black hover:bg-black hover:text-white"
                              }`}
                          >
                            {s}
                          </button>
                        );
                      });
                    })()}
                  </div>

                  <DispatchTimeline
                    isDispatchReady={Boolean(product?.raw?.isDispatchReady)}
                  />

                </div>
              )}

              {/* Color Selector */}
              {requireColor && (
                <div className="border-b border-black/10 pb-4">
                  <ColorSelector
                    colors={product.colors}
                    selectedColor={selectedColor}
                    onSelect={(c) => {
                      setSelectedColor(c);

                      const vid = normalized
                        ? findVariantIdByAttributes(normalized, {
                          size: selectedSize,
                          color: c,
                        })
                        : null;

                      setSelectedVariantId(vid);
                    }}
                  />
                </div>
              )}

              <CrossSellProducts
                category={category}
                items={product?.raw?.crossSellProducts || []}
              />

              {/* CTA */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {!selectionInCart ? (
                  <button
                    onClick={handleAddToCart}
                    className="inline-flex h-11 items-center justify-center gap-2 bg-black px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:bg-white hover:text-black hover:ring-1 hover:ring-black active:scale-[0.99]"
                  >
                    <ShoppingCart size={18} />
                    ADD TO BAG
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="inline-flex h-11 cursor-default items-center justify-center gap-2 bg-black px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white"
                  >
                    <ShoppingCart size={18} />
                    ADDED TO BAG
                  </button>
                )}

                <button
                  onClick={handleBuyNowOrViewCart}
                  className="inline-flex h-11 items-center justify-center gap-2 border border-black bg-white px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-black transition hover:bg-black hover:text-white active:scale-[0.99]"
                >
                  {selectionInCart ? (
                    <>
                      <ShoppingCart size={18} />
                      VIEW CART
                    </>
                  ) : (
                    <>
                      <Zap size={18} />
                      BUY NOW
                    </>
                  )}
                </button>
              </div>

              <TrustStrip product={product} />

              {/* Details */}
              <div className="space-y-1 pt-2">
                <ProductDetailSection
                  title="PRODUCT DETAILS"
                  content={product.description}
                />

                <ProductInformationSuite product={product} />

                <WashcareSection
                  title="WASHCARE & INSTRUCTIONS"
                  items={getCareInstructions(product)}
                />

                <ShippingHighlights />


              </div>
            </div>
          </aside>
        </div>

        <ProductSpotlight
          media={
            product?.productSpotlight ||
            product?.raw?.productSpotlight ||
            []
          }
        />

        <SizeGuideModal
          open={sizeGuideOpen}
          onClose={() => setSizeGuideOpen(false)}
          categoryId={product?.raw?.categories?.[0]?._id}
        />

        <SizeRecommendationModal
          open={sizeRecommendationOpen}
          onClose={() => setSizeRecommendationOpen(false)}
          availableSizes={product?.sizes || []}
          onSelectSize={handleSizeSelect}
        />

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white p-3 shadow-[0_-12px_30px_rgba(0,0,0,0.08)] xl:hidden">
          <div className="grid grid-cols-[1fr_1.1fr] gap-2">
            <button
              type="button"
              onClick={selectionInCart ? handleViewCart : handleAddToCart}
              className="h-11 border border-black bg-white text-[11px] font-bold uppercase tracking-[0.12em] text-black"
            >
              {selectionInCart ? "VIEW CART" : "ADD"}
            </button>
            <button
              type="button"
              onClick={handleBuyNowOrViewCart}
              className="h-11 bg-black text-[11px] font-bold uppercase tracking-[0.12em] text-white"
            >
              {selectionInCart ? "CHECKOUT" : "BUY NOW"}
            </button>
          </div>
        </div>

        <div className="mt-12 border-t border-black/10 pt-10">
          <ReviewSection productCode={product?.productCode} />
          <RelatedProducts
            currentProduct={normalized?.raw || normalized || product?.raw || product}
          />
        </div>

      </div>
    </div>
  );



}
