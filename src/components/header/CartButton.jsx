"use client";

import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { trackMeta } from "@/lib/meta/track";
import { pushEcomEvent } from "@/components/tracking/gtm";
import { mapItem } from "@/components/tracking/ga4Mapper";

/* =========================================================
   HELPERS
========================================================= */

const ga4CartItem = (item) =>
  mapItem(
    {
      _id: item?.productId || item?.id || item?._id,
      id: item?.productId || item?.id || item?._id,
      name: item?.name,
      title: item?.name,
      price: Number(item?.price ?? 0) || 0,
      category: item?.productSnapshot?.category || "",
      variant: item?.selectedSize || "",
      sku:
        item?.variant?.sku ||
        item?.productSnapshot?.sku ||
        "",
    },
    Number(item?.quantity || 1),
  );

const getImageSrc = (item) =>
  [
    item?.image,
    item?.thumbnail,
    item?.productSnapshot?.thumbnail,
    item?.variant?.image,
    item?.images?.[0]?.src,
    item?.images?.[0],
    item?.productSnapshot?.images?.[0],
  ].find(
    (value) =>
      typeof value === "string" && value.trim(),
  ) || null;

const getCartSummary = (cartItems = []) => {
  const contents = cartItems
    .map((item) => {
      const id =
        item?.productId || item?.id || item?._id;

      if (!id) return null;

      return {
        id: String(id),
        quantity: Number(item?.quantity || 1),
        item_price: Number(item?.price || 0),
      };
    })
    .filter(Boolean);

  const value = contents.reduce(
    (total, item) =>
      total + item.item_price * item.quantity,
    0,
  );

  const quantity = contents.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return {
    contents,
    value,
    quantity,
  };
};

/* =========================================================
   COMPONENT
========================================================= */

export default function CartButton() {
  const router = useRouter();
  const dropdownRef = useRef(null);

  const items = useCartStore((state) => state.items) || [];
  const totalCount = useCartStore(
    (state) => state.totalCount,
  );

  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const lastViewCartRef = useRef({
    key: "",
    at: 0,
  });

  /* =========================================================
     COMPUTED VALUES
  ========================================================= */

  const cartCount = useMemo(() => {
    if (typeof totalCount === "function") {
      return totalCount();
    }

    return items.reduce(
      (total, item) =>
        total + (Number(item?.quantity) || 0),
      0,
    );
  }, [items, totalCount]);

  const cartValue = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total +
          Number(item?.price || 0) *
          Number(item?.quantity || 1),
        0,
      ),
    [items],
  );

  /* =========================================================
     DEVICE DETECTION
  ========================================================= */

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(pointer: coarse)",
    );

    const updateDevice = () => {
      setIsMobile(mediaQuery.matches);
    };

    updateDevice();

    mediaQuery.addEventListener?.(
      "change",
      updateDevice,
    );

    return () => {
      mediaQuery.removeEventListener?.(
        "change",
        updateDevice,
      );
    };
  }, []);

  /* =========================================================
     VIEW CART TRACKING
  ========================================================= */

  const fireViewCart = useCallback(async () => {
    const cartItems =
      useCartStore.getState().items || [];

    if (!cartItems.length) return;

    const { contents, value, quantity } =
      getCartSummary(cartItems);

    if (!contents.length) return;

    const key = `${contents
      .map((item) => item.id)
      .join("_")}_${value}`;

    const now = Date.now();

    if (
      lastViewCartRef.current.key === key &&
      now - lastViewCartRef.current.at < 2000
    ) {
      return;
    }

    lastViewCartRef.current = {
      key,
      at: now,
    };

    try {
      pushEcomEvent("view_cart", {
        currency: "INR",
        value,
        items: cartItems
          .slice(0, 50)
          .map(ga4CartItem),
      });
    } catch (error) {
      console.warn(
        "GA4 view_cart failed",
        error,
      );
    }

    try {
      await trackMeta("ViewCart", {
        currency: "INR",
        value,
        content_type: "product",
        content_ids: contents.map(
          (item) => item.id,
        ),
        contents,
        num_items: quantity,
      });
    } catch (error) {
      console.warn(
        "Meta ViewCart failed",
        error,
      );
    }
  }, []);

  /* =========================================================
     CHECKOUT TRACKING
  ========================================================= */

  const fireBeginCheckout =
    useCallback(async () => {
      const cartItems =
        useCartStore.getState().items || [];

      if (!cartItems.length) return;

      const { contents, value, quantity } =
        getCartSummary(cartItems);

      if (!contents.length) return;

      try {
        pushEcomEvent("begin_checkout", {
          currency: "INR",
          value,
          items: cartItems
            .slice(0, 50)
            .map(ga4CartItem),
        });
      } catch (error) {
        console.warn(
          "GA4 begin_checkout failed",
          error,
        );
      }

      try {
        await trackMeta("InitiateCheckout", {
          currency: "INR",
          value,
          content_type: "product",
          content_ids: contents.map(
            (item) => item.id,
          ),
          contents,
          num_items: quantity,
        });
      } catch (error) {
        console.warn(
          "Meta InitiateCheckout failed",
          error,
        );
      }
    }, []);

  /* =========================================================
     UI EFFECTS
  ========================================================= */

  useEffect(() => {
    if (!cartCount) return;

    setPulse(true);

    const timeout = setTimeout(() => {
      setPulse(false);
    }, 450);

    return () => clearTimeout(timeout);
  }, [cartCount]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
    };
  }, []);

  /* =========================================================
     ACTIONS
  ========================================================= */

  const goToCart = () => {
    setOpen(false);
    router.push("/cart");
  };

  const goToCheckout = async () => {
    if (!items.length) return;

    setOpen(false);

    await fireBeginCheckout();

    router.push("/checkout");
  };

  const handleCartClick = () => {
    if (isMobile) {
      goToCart();
      return;
    }

    setOpen((current) => !current);

    if (!open) {
      fireViewCart();
    }
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div
      ref={dropdownRef}
      className="relative"
    >
      {/* Cart icon */}
      <button
        type="button"
        onClick={handleCartClick}
        className="relative p-1"
        aria-label={`Cart with ${cartCount} items`}
        title="Cart"
      >
        <ShoppingBag
          className={`h-6 w-6 transition-all duration-300 hover:text-black ${pulse
              ? "scale-[1.15] text-black"
              : "text-gray-700"
            }`}
        />

        {!!cartCount && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center bg-black px-1 text-[9px] font-black text-white">
            {cartCount > 99 ? "99+" : cartCount}
          </span>
        )}
      </button>

      {/* Desktop cart dropdown */}
      {open && !isMobile && (
        <div className="absolute right-0 z-50 mt-3 w-80 border border-black/10 bg-white p-4 shadow-[0_24px_80px_-38px_rgba(0,0,0,0.28)]">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[11px] font-black uppercase tracking-[0.16em] text-black">
              Cart Items
            </h3>

            {!!items.length && (
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-black/50">
                {cartCount}{" "}
                {cartCount === 1
                  ? "Item"
                  : "Items"}
              </span>
            )}
          </div>

          {!items.length ? (
            <div className="py-5 text-center">
              <ShoppingBag className="mx-auto mb-2 h-6 w-6 text-black/25" />

              <p className="text-xs font-bold uppercase tracking-[0.08em] text-black/50">
                Your cart is empty
              </p>
            </div>
          ) : (
            <>
              <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
                {items.map((item, index) => {
                  const src = getImageSrc(item);
                  const quantity =
                    Number(item?.quantity) || 1;
                  const price =
                    Number(item?.price) || 0;

                  return (
                    <div
                      key={
                        item?.__key ||
                        item?.lineId ||
                        `${item?.productId}-${item?.selectedSize}-${index}`
                      }
                      className="flex items-center gap-3 border-b border-gray-100 pb-3"
                    >
                      {src ? (
                        <Image
                          src={src}
                          alt={
                            item?.name ||
                            "OATCLUB product"
                          }
                          width={56}
                          height={64}
                          className="h-16 w-14 shrink-0 bg-gray-100 object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-14 shrink-0 items-center justify-center bg-gray-100 px-1 text-center text-[9px] font-bold uppercase text-gray-400">
                          No image
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {item?.name || "Product"}
                        </p>

                        {!!item?.selectedSize && (
                          <p className="mt-0.5 text-[11px] font-medium uppercase text-gray-500">
                            Size:{" "}
                            {item.selectedSize}
                          </p>
                        )}

                        <div className="mt-1 flex items-center justify-between gap-2">
                          <p className="text-xs text-gray-500">
                            Qty: {quantity} × ₹
                            {price.toLocaleString(
                              "en-IN",
                            )}
                          </p>

                          <p className="text-xs font-bold text-black">
                            ₹
                            {(
                              price * quantity
                            ).toLocaleString(
                              "en-IN",
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-3">
                <span className="text-xs font-black uppercase tracking-[0.12em] text-black">
                  Subtotal
                </span>

                <span className="text-base font-black text-black">
                  ₹
                  {cartValue.toLocaleString(
                    "en-IN",
                  )}
                </span>
              </div>

              <p className="mt-1 text-[10px] font-medium text-black/45">
                Shipping and discounts calculated at
                checkout.
              </p>
            </>
          )}

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={goToCart}
              className="w-full border border-black bg-white px-3 py-2.5 text-[11px] font-black uppercase tracking-[0.12em] text-black transition hover:bg-black/5 active:scale-[0.98]"
            >
              Go to cart
            </button>

            <button
              type="button"
              onClick={goToCheckout}
              disabled={!items.length}
              className="w-full bg-black px-3 py-2.5 text-[11px] font-black uppercase tracking-[0.12em] text-white transition hover:bg-black/85 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-black/30"
            >
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}