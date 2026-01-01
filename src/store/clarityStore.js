const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

export const clarityInit = () => {
  if (typeof window === "undefined") return;
  if (!CLARITY_ID) return;

  // prevent multiple init
  if (window.__clarityInitialized) return;
  window.__clarityInitialized = true;

  (function (c, l, a, r, i, t, y) {
    c[a] =
      c[a] ||
      function () {
        (c[a].q = c[a].q || []).push(arguments);
      };
    t = l.createElement(r);
    t.async = 1;
    t.src = "https://www.clarity.ms/tag/" + i;
    y = l.getElementsByTagName(r)[0];
    y.parentNode.insertBefore(t, y);
  })(window, document, "clarity", "script", CLARITY_ID);
};

export const clarityTrack = (eventName, payload = {}) => {
  if (typeof window === "undefined") return;
  if (!window.clarity) return;
  window.clarity("event", eventName, payload);
};

export const clarityIdentify = (userId) => {
  if (typeof window === "undefined") return;
  if (!window.clarity) return;
  window.clarity("identify", userId);
};

export const claritySetTag = (key, value) => {
  if (typeof window === "undefined") return;
  if (!window.clarity) return;
  window.clarity("set", key, value);
};
