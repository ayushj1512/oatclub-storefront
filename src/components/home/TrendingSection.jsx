  "use client";

  import { useEffect, useState } from "react";
  import ProductCard from "@/components/common/ProductCard";
  import { motion } from "framer-motion";

  export default function TrendingSection() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    /** SAFE FETCH - CLIENT ONLY */
    useEffect(() => {
      let isMounted = true;

      const fetchTrending = async () => {
        try {
          const res = await fetch("/api/wc/products");
          const data = await res.json();

          if (!Array.isArray(data)) return;

          if (isMounted) {
            const mapped = data.map((p) => ({
              id: p.id,
              name: p.name || "",
              price: Number(p.price || 0),
              originalPrice: p.regular_price ? Number(p.regular_price) : null,
              images: p.images || [],
              image: p.images?.[0]?.src || "/placeholder.png",
              slug: p.slug || p.id,
              on_sale: p.on_sale,
              categories: p.categories || [],
              tags: p.tags || [],
            }));

            setProducts(mapped);
          }
        } catch (err) {
          console.error("Trending Fetch Error:", err);
        } finally {
          if (isMounted) setLoading(false);
        }
      };

      fetchTrending();

      return () => {
        isMounted = false;
      };
    }, []);

    /** --------------------------------------------------
     *  SAFE SHIMMER (MATCHES EXACT LAYOUT OF REAL CARDS)
     * --------------------------------------------------*/
    if (loading) {
      return (
        <section className="py-10 px-4 bg-white">
  <h2 className="text-xl md:text-2xl font-semibold text-white bg-black py-2 px-6 rounded-full mx-auto mb-6 w-fit tracking-wide">
    Trending Now
  </h2>

          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={`shimmer-${i}`}
                className="min-w-[160px] sm:min-w-[200px] md:min-w-[240px]"
              >
                <ProductCard loading={true} />
              </div>
            ))}
          </div>
        </section>
      );
    }

    /** If no products, hide section */
    if (!products.length) return null;

    /** ---------------------------
     *   ACTUAL SECTION (SAFE)
     * ---------------------------*/
    return (
      <motion.section
        className="py-10 px-4 bg-white"
        initial={false}         // 🚀 hydration-safe
        animate={{ opacity: 1 }} // no y-shift (prevents mismatch)
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-xl font-semibold mb-4">Trending Now</h2>

        <div
          className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2"
        >
          {products.map((p) => (
            <div
              key={p.id}
              className="snap-start min-w-[160px] sm:min-w-[200px] md:min-w-[240px]"
            >
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </motion.section>
    );
  }
