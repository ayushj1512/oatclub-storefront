export const pushToDataLayer = (data) => {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(data);
};

// Optional: clear ecommerce object to avoid stale data
export const pushEcomEvent = (event, ecommerce) => {
  pushToDataLayer({ ecommerce: null }); // ✅ recommended by Google
  pushToDataLayer({ event, ecommerce });
};
