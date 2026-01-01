# Microsoft Clarity Integration (Next.js) — MIRAY Setup

This repo/project uses **Microsoft Clarity** for session recordings, heatmaps, and lightweight event tracking.

✅ **Status:** Clarity is successfully loaded — `window.clarity` is available in the browser.

---

## Why we built a "Clarity Store"

Instead of copy‑pasting Clarity script or init logic in many files, we created a **central store + provider** so:

- Clarity script loads **only once**
- You can call tracking functions from **any component**
- Code stays clean, reusable, and fast
- Future extensions (route tracking, event queueing, tags) become easy

---

## Project Structure

```
src/
  store/
    clarityStore.js
  components/
    clarity/
      ClarityProvider.js
  app/
    layout.client.tsx
```

---

## Setup

### 1) Add Clarity Project ID

Create or open `.env.local` and add:

```env
NEXT_PUBLIC_CLARITY_ID=uunb2fpjuz
```

> Replace with your actual Clarity Project ID for other environments.

### 2) Restart Next.js

After updating `.env.local`:

```bash
npm run dev
```

---

## How it works

### ✅ `ClarityProvider`
Loads Clarity once using `useEffect()` and ensures it runs only on the client.

It is mounted globally inside `src/app/layout.client.tsx`.

### ✅ `clarityStore.js`
Exports reusable functions you can call anywhere:
- `clarityInit()` → loads Clarity script once
- `clarityTrack(eventName, payload)` → custom events
- `clarityIdentify(userId)` → identifies user sessions
- `claritySetTag(key, value)` → adds tags for filtering

---

## Usage Examples

### Track an event
```js
import { clarityTrack } from "@/store/clarityStore";

clarityTrack("buy_clicked", { product: "hoodie", price: 799 });
```

### Identify a user (after login)
```js
import { clarityIdentify } from "@/store/clarityStore";

clarityIdentify(user.id);
```

### Add tags
```js
import { claritySetTag } from "@/store/clarityStore";

claritySetTag("plan", "premium");
claritySetTag("source", "instagram");
```

---

## Quick Test

Open browser console and run:

```js
window.clarity
```

✅ If it returns a function, Clarity is loaded.

Trigger a test event:

```js
window.clarity("event", "test_event", { page: "home" });
```

Check Clarity dashboard after ~1–2 mins.

---

# Future Plan (Roadmap)

Here is the planned next phase to make Clarity usage even smoother and more powerful:

## ✅ Phase 1: Route / Page View Tracking
**Goal:** Automatically record route changes in Next.js App Router so each navigation is tracked without manual calls.

- Hook into `usePathname()` and fire `clarityTrack("page_view", {...})`
- Capture `referrer` and `utm` parameters
- Ensure works with `Suspense` + client layouts

## ✅ Phase 2: Event Queueing (No Event Loss)
**Goal:** If an event is fired before Clarity script is fully loaded, store it temporarily and replay later.

- Maintain internal event queue array
- Flush queue when `window.clarity` becomes available
- Prevent duplicate flushes

## ✅ Phase 3: User Context Auto‑Tagging
**Goal:** Automatically attach useful tags (for filters) after auth initializes.

Example tags:
- `role`
- `plan`
- `city`
- `logged_in`
- `utm_source`, `utm_campaign`

## ✅ Phase 4: Standard Event Catalog
**Goal:** Make a central list of event names so the team uses consistent tracking across the app.

Example:
- `signup_opened`
- `signup_success`
- `add_to_cart`
- `checkout_started`
- `order_success`
- `search_used`

## ✅ Phase 5: Dashboard Playbook + QA Checklist
**Goal:** Provide team-ready documentation so non-devs can verify tracking.

- "How to verify events"
- "How to filter by tags"
- "What sessions to check"
- "How to share recordings"

---

## Notes / Best Practices

- Keep Clarity ID in `.env.local` (no hardcoding)
- Mount provider only once globally
- Use store helpers instead of direct `window.clarity` calls
- Track only meaningful events (avoid noisy logs)

---

✅ If you want, we can also add:
- Consent mode for privacy
- Track rage clicks / dead clicks analysis
- Integrate with GTM events (bridge)

---

**Owner:** Ayush Juneja  
**Project:** MIRAY FASHIONS (Next.js)

