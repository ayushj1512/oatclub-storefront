export async function wcGet(endpoint) {
  const base = process.env.NEXT_PUBLIC_WC_URL?.replace(/\/$/, "");
  const key = process.env.NEXT_PUBLIC_WC_KEY;
  const secret = process.env.NEXT_PUBLIC_WC_SECRET;

  console.log("🌍 WC Base URL:", base);
  console.log("🔑 WC Key:", key);
  console.log("🛡 WC Secret:", secret);
  console.log("➡️ Endpoint:", endpoint);

  const url = `${base}/wp-json/wc/v3/${endpoint}&consumer_key=${key}&consumer_secret=${secret}`;

  console.log("📡 Final Request URL:", url);

  const res = await fetch(url);

  console.log("📥 Response Status:", res.status);

  if (!res.ok) {
    const text = await res.text();
    console.error("❌ WooCommerce API ERROR:", res.status, text);
    throw new Error("WooCommerce API Error " + res.status);
  }

  const json = await res.json();
  console.log("✅ Parsed JSON:", json);

  return json;
}
