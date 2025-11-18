"use client";

import { motion } from "framer-motion";

export default function OurMission() {
  return (
    <section className="w-full bg-[#f7f2f4] py-14 px-6 md:px-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto flex flex-col items-center text-center space-y-4"
      >
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl md:text-4xl font-semibold text-[#2b0004]"
        >
          Our Mission
        </motion.h2>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="w-16 h-[3px] bg-[#2b0004] rounded-full origin-left"
        />

        {/* Text */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-[#3d0f16] text-base leading-relaxed text-justify"
        >
          At <span className="font-semibold text-[#2b0004]">Miray Fashions</span>, 
          our mission is to redefine modern luxury by making premium, elegant, 
          and high-quality fashion accessible to everyone. We believe in creating 
          timeless pieces that elevate confidence and celebrate individuality.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-[#50212a] text-sm md:text-base leading-relaxed text-justify"
        >
          Every design is rooted in craftsmanship, authenticity, and attention to 
          detail. From ethically sourced fabrics to skilled artisans across India, 
          our journey is dedicated to delivering fashion that feels as good as it 
          looks — refined, thoughtful, and truly ours.
        </motion.p>

        {/* Soft fade decorative line */}
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          whileInView={{ opacity: 1, width: "55%" }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="h-[1px] bg-[#d6b8be] mx-auto rounded-full mt-6"
        />
      </motion.div>
    </section>
  );
}
  