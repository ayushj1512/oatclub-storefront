// src/store/resetAllStores.js

import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAbandonedCartStore } from "@/store/abandonedCartStore";
import { useAddressStore } from "@/store/addressStore";
import { useOrderStore } from "@/store/orderStore";
import { useProductStore } from "@/store/productStore";
import { useCategoryStore } from "@/store/categoryStore";
import { useCouponStore } from "@/store/couponStore";
import { useNotificationStore } from "@/store/notificationStore";
import { useSearchStore } from "@/store/searchStore";
import { useTrackingStore } from "@/store/trackingStore";
import { useRazorpayStore } from "@/store/razorpayStore";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";
import { useReelStore } from "@/store/reelStore";
import { useSizeChartStore } from "@/store/sizeChartStore";
import { useHomepageSettingsStore } from "@/store/homepageSettingsStore";
import { useBlogStore } from "@/store/blogStore";
import { useAnalyticsStore } from "@/store/analyticsStore";
import { useClarityStore } from "@/store/clarityStore";

import { useSupportTicketStore } from "@/store/useSupportTicketStore";
import { useRmaStore } from "@/store/useRmaStore";

/**
 * ✅ Reset ALL Zustand stores
 * - Each store should expose reset() method
 * - This function safely calls reset() where available
 */
export const resetAllStores = () => {
  try {
    const stores = [
      useAuthStore,
      useCartStore,
      useWishlistStore,
      useAbandonedCartStore,
      useAddressStore,
      useOrderStore,
      useProductStore,
      useCategoryStore,
      useCouponStore,
      useNotificationStore,
      useSearchStore,
      useTrackingStore,
      useRazorpayStore,
      useRecentlyViewedStore,
      useReelStore,
      useSizeChartStore,
      useHomepageSettingsStore,
      useBlogStore,
      useAnalyticsStore,
      useClarityStore,
      useSupportTicketStore,
      useRmaStore,
    ];

    stores.forEach((store) => {
      const s = store?.getState?.();
      if (s?.reset) s.reset();
    });

    console.log("✅ resetAllStores: all stores reset");
  } catch (e) {
    console.warn("⚠️ resetAllStores failed:", e);
  }
};
