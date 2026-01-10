// src/app/[category]/[product_name]/[id]/page.jsx
"use client";

import { use, useEffect, useMemo, useState, useCallback } from "react";
import { ShoppingCart, Heart, Zap, Share2, Plus, Minus } from "lucide-react";
import { useRouter } from "next/navigation";

import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";
import { useProductStore } from "@/store/productStore";
import { notify } from "@/lib/notify";
import SizeGuideModal from "../../../../../components/productDetail/SizeGuideModal";
import ProductGallery from "@/components/productDetail/ProductGallery";
import RelatedProducts from "@/components/productDetail/relatedProducts";
import WashcareSection from "@/components/productDetail/WashcareSection";
import ProductDetailSection from "@/components/productDetail/ProductDetailSection";
import ReviewSection from "@/components/productDetail/ReviewSection";
import SupportSection from "@/components/productDetail/SupportSection";
import RecentlyViewedProducts from "@/components/productDetail/RecentlyViewedProducts"
import ColorSelector from "@/components/productDetail/ColorSelector";
import UniversalLuxuryLoader from "@/components/common/UniversalLuxuryLoader";

const BRAND = {  black: "#111111" };

const money = (n) => {
  const num = Number(n);
  if (!Number.isFinite(num)) return "0";
  return num.toLocaleString("en-IN");
};

/* -------- accordion ---------- */
function Accordion({ title, children, defaultOpen = false, borderTop = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`${borderTop ? "border-t border-gray-200" : ""} py-3`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex justify-between items-center w-full text-left"
        aria-expanded={open}
      >
        <span className="text-base md:text-lg font-semibold text-black">{title}</span>
        {open ? <Minus className="h-5 w-5 text-black" /> : <Plus className="h-5 w-5 text-black" />}
      </button>

      <div className={`transition-all overflow-hidden duration-300 ${open ? "max-h-[900px] mt-3" : "max-h-0"}`}>
        {open ? children : null}
      </div>
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

const SIZE_ORDER = ["XXS","XS","S","M","L","XL","XXL","3XL","4XL","5XL"];

const getSizeFromSku = (sku) => {
  const parts = str(sku).toUpperCase().split("-").filter(Boolean);
  for (let i = parts.length - 1; i >= 0; i--) {
    if (SIZE_ORDER.includes(parts[i])) return parts[i];
  }
  return "";
};

const getColorFromSku = (sku) => {
  const parts = str(sku).toLowerCase().split("-").filter(Boolean);
  if (parts.length < 2) return "";

  // usually color is 2nd last token
  const candidate = parts[parts.length - 2];

  // avoid returning size accidentally
  if (SIZE_ORDER.includes(candidate.toUpperCase())) return "";

  return candidate;
};



/* -------- variant helpers ---------- */
const str = (v) => (v == null ? "" : String(v));

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
    return sizeAttr.values.map((s) => str(s).trim().toUpperCase()).filter(Boolean);
  }

  // 2) Fallback: derive sizes from SKU inside variants
  const vars = Array.isArray(raw?.variants)
    ? raw.variants
    : Array.isArray(normalized?.variants)
      ? normalized.variants
      : [];

  const sizes = vars
    .map((v) => {
      const sku = String(v?.sku || "").toUpperCase();
      // ✅ Example: ...-XS-1EL0  => XS
      const parts = sku.split("-");
      return parts.length >= 2 ? parts[parts.length - 2] : null;
    })
    .filter(Boolean);

  return Array.from(new Set(sizes));
};

const deriveColorsFromBackend = (normalized) => {
  if (!normalized) return [];

  const raw = normalized.raw || normalized;
  const attrs = Array.isArray(raw?.attributes) ? raw.attributes : [];

  const colorAttr = attrs.find(
    (a) =>
      str(a?.key).toLowerCase() === "color" ||
      str(a?.attribute?.slug).toLowerCase() === "color" ||
      str(a?.slug).toLowerCase() === "color"
  );

  if (Array.isArray(colorAttr?.values) && colorAttr.values.length) {
    return colorAttr.values
      .map((c) => {
        // ✅ supports both: "black" OR {label,value}
        if (typeof c === "string") return c;
        return c?.value || c?.label || "";
      })
      .map((c) => str(c).trim().toLowerCase())
      .filter(Boolean);
  }

  // fallback: derive from variants
  const vars = Array.isArray(raw?.variants) ? raw.variants : [];
  const colors = vars
    .map((v) => getAttrValue(v?.attributes, "Color"))
    .map((c) => str(c).trim().toLowerCase())
    .filter(Boolean);

  return Array.from(new Set(colors));
};

const hasColorForSize = (normalized, size) => {
  const raw = normalized?.raw || normalized;
  const vars = Array.isArray(raw?.variants) ? raw.variants : [];
  const wantedSize = str(size).trim().toUpperCase();

  const variantsForSize = vars.filter((v) => {
    const s =
      str(getAttrValue(v?.attributes, "Size")).trim().toUpperCase() ||
      getSizeFromSku(v?.sku);

    return wantedSize ? s === wantedSize : true;
  });

  return variantsForSize.some((v) => {
    const c =
      str(getAttrValue(v?.attributes, "Color")).trim().toLowerCase() ||
      getColorFromSku(v?.sku);

    return Boolean(c);
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
    .map((v) => {
      return (
        str(getAttrValue(v?.attributes, "color")).trim().toLowerCase() ||
        getColorFromSku(v?.sku)
      );
    })
    .filter(Boolean);

  return Array.from(new Set(colors));
};



const deriveImageList = (normalized) => {
  const images = Array.isArray(normalized?.images) ? normalized.images : [];
  const thumb = normalized?.thumbnail || normalized?.image || images?.[0] || "";
  const merged = [thumb, ...images].filter(Boolean).map(String);
  return Array.from(new Set(merged));
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
  const storeLoading = useProductStore((s) => s.isLoading);

  const [normalized, setNormalized] = useState(null);
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [loading, setLoading] = useState(true);
const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
const [selectedColor, setSelectedColor] = useState(null);

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
    const p = await fetchProductDetails(id);
    if (!mounted) return;

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
      onSale: Number(p.compareAtPrice ?? 0) > Number(p.price ?? 0),
      images,
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

    // ✅ auto-select size if single
    if (sizes.length === 1) nextSize = sizes[0];

    // ✅ auto-select color ONLY if size exists AND that size actually needs color AND color list single
    if (nextSize) {
      const needsColor = hasColorForSize(p, nextSize);
      if (needsColor && colors.length === 1) nextColor = colors[0];
    }

    setSelectedSize(nextSize);
    setSelectedColor(nextColor);

    // ✅ auto resolve variantId properly
    let vid = null;

    if (nextSize) {
      const needsColor = hasColorForSize(p, nextSize);

      // size requires color
      if (needsColor) {
        if (nextColor) {
          vid = findVariantIdByAttributes(p, { size: nextSize, color: nextColor });
        } else {
          // needs color but none selected yet
          vid = null;
        }
      } else {
        // size does NOT require color
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
  }, [id, fetchProductDetails]);

  useEffect(() => {
    if (!product) return;
    recentlyViewedStore.addProduct?.(product);
  }, [product, recentlyViewedStore]);
const requireColor = useMemo(() => {
  if (!normalized) return false;
  if (selectedSize) return hasColorForSize(normalized, selectedSize);
  return (product?.colors?.length || 0) > 0;
}, [normalized, selectedSize, product]);


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

  const handleAddToCart = useCallback(() => {
      console.log("🛒 [ADD TO CART CLICK]");
  console.log("productType:", product?.productType);
  console.log("requireSize:", requireSize, "requireColor:", requireColor);
  console.log("selectedSize:", selectedSize);
  console.log("selectedColor:", selectedColor);
  console.log("selectedVariantId:", selectedVariantId);

  console.log("normalized.raw?.variants len:", normalized?.raw?.variants?.length);
  console.log("normalized?.variants len:", normalized?.variants?.length);
    if (!normalized || !product) return;

if (requireSize && !selectedSize) return notify.error("Please select a size");
if (requireColor && !selectedColor) return notify.error("Please select a color");

if (product.productType === "variable" && !selectedVariantId) {
  return notify.error(requireColor ? "Please select size & color" : "Please select a size");
}


addToCart({
  product: normalized,
  qty: 1,
  selectedSize,
  selectedColor,
  variantId: product.productType === "variable" || requireSize ? selectedVariantId : null,
});


    // cartStore also calls notify.cartAdded, but this is OK to keep minimal feedback:
    // If you see double toasts, remove this line.
    // notify.cartAdded({ name: product.name, selectedSize });

    // no timer state: buttons stay because selectionInCart is derived from store
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
    notify.error("Please select a size");
    return;
  }

  if (requireColor && !selectedColor) {
    notify.error("Please select a color");
    return;
  }

  if ((product.productType === "variable" || requireSize || requireColor) && !selectedVariantId) {
    notify.error(requireColor ? "Please select size & color" : "Please select a size");
    return;
  }

  // ✅ BUY NOW SHOULD NOT TOUCH CART
  setBuyNow({
    product: normalized,
    qty: 1,
    selectedSize,
    selectedColor,
    variantId:
      product.productType === "variable" || requireSize || requireColor
        ? selectedVariantId
        : null,
  });

  await new Promise((r) => setTimeout(r, 150));
  router.push("/checkout");
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
    return `✨ ${product.name}\n₹${money(product.price)}${
  selectedSize ? ` • Size: ${selectedSize}` : ""
}${selectedColor ? ` • Color: ${selectedColor}` : ""}\n${link}`;

  }, [product, selectedSize, selectedColor]);

  const handleShare = async () => {
    if (!product) return;
    const url = (typeof window !== "undefined" && window.location.href) || "";

    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, text: shareMessage, url });
        notify.info("Thanks for sharing!");
      } else {
        await navigator.clipboard.writeText(shareMessage);
        notify.copied("Share text copied ✅");
      }
    } catch {}
  };

  if (loading || storeLoading) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <UniversalLuxuryLoader />
    </div>
  );
}

 if (!product) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <p className="text-xs tracking-[0.4em] uppercase text-black/60">
        Product not found
      </p>
    </div>
  );
}

  return (
    <div className="w-full px-4 md:px-12 py-6 md:py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* LEFT */}
        <div className="w-full md:max-w-[420px] mx-auto">
          <ProductGallery images={product.images || []} />
        </div>

        {/* RIGHT */}
        <aside className="space-y-4 w-full">
          {/* Breadcrumb */}
          {/* Breadcrumb */}
<div className="text-xs md:text-sm text-gray-500">
  <a href="/" className="hover:underline">
    Home
  </a>{" "}
  /{" "}
  <a
    href={`/category/${category}`}
    className="hover:underline capitalize"
  >
    {product?.raw?.categories?.[0]?.name
      ? decodeURIComponent(product.raw.categories[0].name)
          .replace(/-/g, " ")
          .trim()
      : decodeURIComponent(category || "")
          .replace(/-/g, " ")
          .trim()}
  </a>{" "}
  / <span className="text-gray-900">{product.name}</span>
</div>

          <h1 className="text-2xl md:text-3xl font-semibold text-black leading-tight">{product.name}</h1>

          {/* PRICE + icons */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-2xl md:text-3xl font-semibold text-black">₹{money(product.price)}</span>
              {product.regularPrice > product.price ? (
                <span className="line-through text-base text-gray-500">₹{money(product.regularPrice)}</span>
              ) : null}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleWishlist}
                className="p-1 rounded-full hover:bg-black/5 active:scale-95 transition"
                aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                title={wishlisted ? "Wishlisted" : "Add to wishlist"}
              >
<Heart size={20} className={wishlisted ? "fill-current text-black" : "text-black/70"} />
              </button>

              <button
                onClick={handleShare}
                className="p-1 rounded-full hover:bg-black/5 active:scale-95 transition"
                aria-label="Share"
                title="Share"
              >
                <Share2 size={20} className="text-gray-900" />
              </button>
            </div>
          </div>

 {/* SIZE SELECTOR */}
{(product.sizes || []).length > 0 && (
  <div className="space-y-1.5 pt-1">
    {/* Title + Size Guide link */}
    <div className="flex items-center justify-between">
      <h3 className="text-xs font-medium text-black">Select Size</h3>

      <button
        type="button"
        onClick={() => setSizeGuideOpen(true)}
        className="text-xs font-semibold underline text-black/70 hover:text-black"
      >
        Size Guide
      </button>
    </div>

    {/* ✅ Sorted Size Buttons */}
    <div className="flex flex-wrap gap-2">
      {(() => {
        // ✅ predefined order
        const sizeOrder = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"];

        const sortedSizes = [...(product.sizes || [])]
          .map((x) => str(x).trim().toUpperCase())
          .filter(Boolean)
          .sort((a, b) => {
            const ia = sizeOrder.indexOf(a);
            const ib = sizeOrder.indexOf(b);

            // If both exist in order list
            if (ia !== -1 && ib !== -1) return ia - ib;

            // If only one exists, it comes first
            if (ia !== -1) return -1;
            if (ib !== -1) return 1;

            // Otherwise fallback alphabetical
            return a.localeCompare(b);
          });

        return sortedSizes.map((s) => {
          const active = selectedSize === s;

          return (
            <button
              key={s}
             onClick={() => {
  setSelectedSize(s);

  const needsColor = normalized ? hasColorForSize(normalized, s) : false;

  // ✅ Size doesn't need color => reset color + resolve variant by size only
  if (!needsColor) {
    setSelectedColor(null);

    const vid = normalized
      ? findVariantIdByAttributes(normalized, { size: s })
      : null;

    setSelectedVariantId(vid);
    return;
  }

  // ✅ Size needs color => check if existing selectedColor is valid for this size
  const validColors = normalized ? getColorsForSize(normalized, s) : [];
  const current = str(selectedColor).trim().toLowerCase();
  const stillValid = current && validColors.includes(current);

  // ❌ current color is not valid for this size -> reset and wait for user to select
  if (!stillValid) {
    setSelectedColor(null);
    setSelectedVariantId(null);
    return;
  }

  // ✅ current color is valid -> resolve variant
  const vid = normalized
    ? findVariantIdByAttributes(normalized, { size: s, color: selectedColor })
    : null;

  setSelectedVariantId(vid);
}}


              className={`px-3 py-1.5 text-sm font-medium rounded-md border transition ${
                active
                  ? "bg-black text-white border-black"
                  : "bg-white text-black border-black/20 hover:bg-black/5"
              }`}
            >
              {s}
            </button>
          );
        });
      })()}
    </div>
  </div>
)}

{/* COLOR SELECTOR */}
{requireColor && (
  <ColorSelector
    colors={product.colors}
    selectedColor={selectedColor}
    onSelect={(c) => {
      setSelectedColor(c);

      const vid = normalized
        ? findVariantIdByAttributes(normalized, { size: selectedSize, color: c })
        : null;

      setSelectedVariantId(vid);
    }}
  />
)}





          {/* CTA row */}
          <div className="flex gap-2 flex-wrap pt-2">
            {!selectionInCart ? (
              <button
                onClick={handleAddToCart}
                className="inline-flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white transition active:scale-[0.99]"
                style={{ backgroundColor: BRAND.black }}
              >
                <ShoppingCart size={18} />
                Add to Cart
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white/95 bg-black/90 cursor-default"
              >
                <ShoppingCart size={18} />
                Added to Cart
              </button>
            )}

            {/* ✅ Buy Now becomes View Cart when already in cart */}
         <button
  onClick={handleBuyNowOrViewCart}
  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.99]"
>
  {selectionInCart ? (
    <>
      <ShoppingCart size={18} />
      View Cart
    </>
  ) : (
    <>
      <Zap size={18} />
      Buy Now
    </>
  )}
</button>

          </div>

          {/* DETAILS */}
          <ProductDetailSection title="Product Details" content={product.description} />

          <WashcareSection
            title="Washcare & Instructions"
            items={[
              "Machine wash cold with like colors",
              "Do not bleach",
              "Tumble dry low or hang dry",
              "Cool iron if needed",
              "Do not dry clean",
            ]}
          />

          <SupportSection product={product} selectedSize={selectedSize} requireSize={requireSize} brand={BRAND} />

          <ReviewSection />
        </aside>
      </div>

 {/* ✅ Size Guide Modal */}
      <SizeGuideModal
        open={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        categoryId={product?.raw?.categories?.[0]?._id}
      />

      <div className="mt-2">
        <RelatedProducts productId={product.productId} />
      </div>

       <RecentlyViewedProducts />

      
    </div>
  );
}
