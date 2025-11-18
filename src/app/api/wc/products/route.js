import { NextResponse } from "next/server";

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_WC_URL;

    if (!baseUrl) {
      return NextResponse.json(
        { error: "Missing NEXT_PUBLIC_WC_URL" },
        { status: 500 }
      );
    }

    const url =
      `${baseUrl}/wp-json/wc/v3/products` +
      `?orderby=popularity&per_page=12`;

    // WooCommerce Basic Auth (recommended for server-side)
    const auth = Buffer.from(
      `${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`
    ).toString("base64");

    const res = await fetch(url, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text(); // catch HTML errors
      console.error("Woo API ERROR HTML:", text);

      return NextResponse.json(
        { error: "WooCommerce API Error", status: res.status },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    console.error("Server API Error:", e);
    return NextResponse.json({ error: "Failed", message: e.message }, { status: 500 });
  }
}
