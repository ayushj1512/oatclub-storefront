"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const banners = [
  {
    image:
      "https://i.pinimg.com/736x/c2/0a/c8/c20ac8b359320c3d5464cee4854e4490.jpg",
    link: "/categories/festive",
  },
  {
    image:
      "https://i.pinimg.com/1200x/9b/fa/87/9bfa87506a8d76e4381125b835318114.jpg",
    link: "/categories/winter",
  },
];

export default function Banner() {
  return (
    <section className="w-full flex flex-col md:flex-row gap-0 p-0 m-0">
      {banners.map((banner, index) => (
        <motion.a
          key={index}
          href={banner.link}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: index * 0.2 }}
          className="flex-1 cursor-pointer"
        >
          <Image
            src={banner.image}
            alt="banner"
            width={1000}
            height={1400}
            className="w-full h-auto object-cover object-center"
            priority
          />
        </motion.a>
      ))}
    </section>
  );
}
