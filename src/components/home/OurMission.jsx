"use client";

import { motion } from "framer-motion";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 25 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay },
  viewport: { once: true },
});

export default function OurMission() {
  return (
    <section className="w-full bg-[#f7f2f4] py-20 px-6 md:px-12 flex justify-center">
      <motion.div
        {...fadeUp(0)}
        className="w-full flex flex-col items-center text-center gap-6"
      >
        {/* Heading */}
        <motion.h2
          {...fadeUp(0.1)}
          className="text-3xl md:text-5xl font-bold tracking-tight text-[#2b0004]"
        >
          Our Mission
        </motion.h2>

        {/* Accent Line */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          viewport={{ once: true }}
          className="w-20 h-[3px] bg-[#2b0004] rounded-full origin-left"
        />

        {/* Description Wrapper */}
        <div className="flex flex-col gap-4 items-center text-center 
                        w-full md:w-[70%] lg:w-[60%] xl:w-[50%]">

          {/* Paragraph 1 */}
          <motion.p
            {...fadeUp(0.2)}
            className="text-[#3d0f16] text-base md:text-lg leading-relaxed"
          >
            At{" "}
            <span className="font-semibold text-[#2b0004]">
              OATCLUB
            </span>
            , our mission is to redefine modern luxury by making premium,
            elegant, and high-quality fashion accessible to everyone. We believe
            in creating timeless pieces that elevate confidence and celebrate
            individuality.
          </motion.p>

          {/* Paragraph 2 */}
          <motion.p
            {...fadeUp(0.25)}
            className="text-[#50212a] text-sm md:text-base leading-relaxed"
          >
            Every design is rooted in craftsmanship, authenticity, and attention
            to detail. From ethically sourced fabrics to skilled artisans across
            India, our journey is committed to delivering fashion that feels as
            good as it looks—refined, thoughtful, and truly ours.
          </motion.p>
        </div>

        {/* Soft Fade Line */}
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          whileInView={{ opacity: 1, width: "50%" }}
          transition={{ duration: 0.7, delay: 0.3 }}
          viewport={{ once: true }}
          className="h-[1px] bg-[#d6b8be] rounded-full mt-8"
        />
      </motion.div>
    </section>
  );
}

