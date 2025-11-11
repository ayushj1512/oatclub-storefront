"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function ProductDetailPage() {
  const { id } = useParams();

  const product = {
    id,
    name: "Elegant Festive Saree",
    price: "₹2,499",
    description:
      "A luxurious handcrafted saree made with soft silk and traditional zari work.",
    image: "/products/saree.jpg",
    sizes: ["S", "M", "L", "XL"],
  };

  return (
    <section className="flex flex-col md:flex-row gap-10 p-8 md:p-16">
      <div className="relative w-full md:w-1/2 h-[400px] md:h-[600px]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover rounded-3xl"
        />
      </div>

      <div className="flex flex-col gap-5 md:w-1/2">
        <h1 className="text-3xl font-semibold">{product.name}</h1>
        <p className="text-2xl text-pink-600 font-bold">{product.price}</p>
        <p className="text-gray-600">{product.description}</p>

        <div>
          <h3 className="text-sm font-semibold mb-2">Select Size:</h3>
          <div className="flex gap-3">
            {product.sizes.map((size) => (
              <button
                key={size}
                className="border border-gray-300 rounded-lg px-4 py-2 hover:bg-pink-500 hover:text-white transition"
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <button className="bg-pink-600 text-white px-6 py-3 rounded-full mt-6 hover:bg-pink-700 transition">
          Add to Cart
        </button>

        <Link href="/wishlist" className="text-sm text-pink-600 mt-3 underline">
          Add to Wishlist
        </Link>
      </div>
    </section>
  );
}
