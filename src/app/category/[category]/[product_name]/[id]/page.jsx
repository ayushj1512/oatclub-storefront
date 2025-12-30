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

import ProductGallery from "@/components/productDetail/ProductGallery";
import RelatedProducts from "@/components/productDetail/relatedProducts";
import WashcareSection from "@/components/productDetail/WashcareSection";
import ProductDetailSection from "@/components/productDetail/ProductDetailSection";
import ReviewSection from "@/components/productDetail/ReviewSection";
import SupportSection from "@/components/productDetail/SupportSection";
import RecentlyViewedProducts from "@/components/productDetail/RecentlyViewedProducts"

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

/* -------- variant helpers ---------- */
const str = (v) => (v == null ? "" : String(v));

const getAttrValue = (attrs, key) => {
  const k = str(key).toLowerCase();
  const arr = Array.isArray(attrs) ? attrs : [];
  return arr.find((a) => str(a?.key).toLowerCase() === k)?.value || "";
};

const deriveSizesFromBackend = (normalized) => {
  if (!normalized) return [];

  const raw = normalized.raw || normalized;

  const attrs = Array.isArray(raw?.attributes) ? raw.attributes : [];
  const sizeAttr = attrs.find(
    (a) => str(a?.key).toLowerCase() === "size" || str(a?.attribute?.slug).toLowerCase() === "size"
  );
  if (Array.isArray(sizeAttr?.values) && sizeAttr.values.length) {
    return sizeAttr.values.map((s) => str(s).trim()).filter(Boolean);
  }

  const vars = Array.isArray(raw?.variants)
    ? raw.variants
    : Array.isArray(normalized?.variants)
      ? normalized.variants
      : [];
  const fromVariants = vars.map((v) => getAttrValue(v?.attributes, "size")).filter(Boolean);
  return Array.from(new Set(fromVariants));
};

const deriveImageList = (normalized) => {
  const images = Array.isArray(normalized?.images) ? normalized.images : [];
  const thumb = normalized?.thumbnail || normalized?.image || images?.[0] || "";
  const merged = [thumb, ...images].filter(Boolean).map(String);
  return Array.from(new Set(merged));
};

const findVariantIdBySize = (normalized, size) => {
  const raw = normalized?.raw || normalized;
  const vars = Array.isArray(raw?.variants)
    ? raw.variants
    : Array.isArray(normalized?.variants)
      ? normalized.variants
      : [];
  const wanted = str(size).toLowerCase();
  const v = vars.find((x) => getAttrValue(x?.attributes, "size").toLowerCase() === wanted);
  return v?._id ? str(v._id) : null;
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
          isInStock: Boolean(p.isInStock ?? true),
          stock: Number(p.stock ?? 0),
          productType: p.productType,
          raw: p.raw || p,
        };

        setProduct(mapped);

        // auto-select only size if single size
        if (sizes.length === 1) {
          const s0 = sizes[0];
          setSelectedSize(s0);
          setSelectedVariantId(findVariantIdBySize(p, s0));
        } else {
          setSelectedSize(null);
          setSelectedVariantId(null);
        }
      } catch (e) {
        console.error("[ProductPage] load failed", e);
        notify.error(e?.message || "Failed to load product");
        if (mounted) {
          setProduct(null);
          setNormalized(null);
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
    if (!normalized || !product) return;

    if (requireSize && !selectedSize) return notify.error("Please select a size");
    if ((product.productType === "variable" || requireSize) && !selectedVariantId) {
      return notify.error("Please select a size");
    }

    addToCart({
      product: normalized,
      qty: 1,
      selectedSize,
      variantId: product.productType === "variable" || requireSize ? selectedVariantId : null,
    });

    // cartStore also calls notify.cartAdded, but this is OK to keep minimal feedback:
    // If you see double toasts, remove this line.
    // notify.cartAdded({ name: product.name, selectedSize });

    // no timer state: buttons stay because selectionInCart is derived from store
  }, [addToCart, normalized, product, requireSize, selectedSize, selectedVariantId]);

  const handleViewCart = () => router.push("/cart");

  // ✅ Your request: Buy Now button should become "View Cart"
  const handleBuyNowOrViewCart = () => {
    if (selectionInCart) {
      router.push("/cart");
      return;
    }
    handleAddToCart();
    window.setTimeout(() => {
      window.location.href = "/checkout";
    }, 50);
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
    const link = (typeof window !== "undefined" && window.location.href) || "";
    return `✨ ${product.name}\n₹${money(product.price)}${selectedSize ? ` • Size: ${selectedSize}` : ""}\n${link}`;
  }, [product, selectedSize]);

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

  if (loading || storeLoading) return <div className="p-10 text-center text-gray-500 text-sm">Loading...</div>;
  if (!product) return <div className="p-10 text-center text-gray-500 text-sm">Product not found</div>;

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
          <div className="text-xs md:text-sm text-gray-500">
            <a href="/" className="hover:underline">
              Home
            </a>{" "}
            /{" "}
            <a href={`/${category}`} className="hover:underline capitalize">
              {category}
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
    <h3 className="text-xs font-medium text-black">Select Size</h3>

    <div className="flex flex-wrap gap-2">
      {product.sizes.map((s) => {
        const active = selectedSize === s;

        return (
          <button
            key={s}
            onClick={() => {
              setSelectedSize(s);
              const vid = normalized ? findVariantIdBySize(normalized, s) : null;
              setSelectedVariantId(vid);
            }}
            className={`px-3 py-1.5 text-sm font-medium rounded-md border transition ${
              active
                ? "bg-black text-white border-black"
                : "bg-white text-black border-black/20 hover:bg-black/5"
            }`}
          >
            {str(s).toUpperCase()}
          </button>
        );
      })}
    </div>
  </div>
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
          <SizeGuideSection />

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

      <div className="mt-2">
        <RelatedProducts productId={product.productId} />
      </div>

       <RecentlyViewedProducts />

      
    </div>
  );
}
