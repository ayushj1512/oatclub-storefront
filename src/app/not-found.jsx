// src/app/not-found.jsx
"use client";

import "./style/not-found.css";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Search, RefreshCcw } from "lucide-react";

export default function NotFound() {
  return (
    <main className="nf-wrap">
      <motion.div aria-hidden className="nf-blob nf-blob-1" initial={{ opacity: 0.25, scale: 0.9 }} animate={{ opacity: [0.2, 0.45, 0.28], scale: [0.95, 1.06, 1] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div aria-hidden className="nf-blob nf-blob-2" initial={{ opacity: 0.18, scale: 0.9 }} animate={{ opacity: [0.15, 0.35, 0.2], scale: [0.98, 1.08, 1] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }} />
      <section className="nf-card">
        <div className="nf-top"><span className="nf-dot" /><span className="nf-topText">404</span><span className="nf-sep">•</span><span className="nf-topText">Page Not Found</span></div>
        <div className="nf-grid">
          <div className="nf-ghostWrap">
            <motion.div className="nf-ghostRing" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
              <motion.div className="nf-ghost" initial={{ y: -8 }} animate={{ y: [-8, 10, -8] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}>
                <svg viewBox="0 0 180 180" className="nf-ghostSvg" aria-label="Cute ghost">
                  <path d="M90 20 C62 20 42 40 42 68 V130 C42 140 50 146 59 141 C66 137 70 137 76 141 C82 146 98 146 104 141 C110 137 114 137 121 141 C130 146 138 140 138 130 V68 C138 40 118 20 90 20Z" fill="url(#nfG)" stroke="rgba(0,0,0,0.10)" strokeWidth="3" />
                  <path d="M42 128 C52 140 64 140 74 128 C84 116 96 116 106 128 C116 140 128 140 138 128 V130 C138 140 130 146 121 141 C114 137 110 137 104 141 C98 146 82 146 76 141 C70 137 66 137 59 141 C50 146 42 140 42 130Z" fill="rgba(255,255,255,0.85)" />
                  <rect x="64" y="78" width="13" height="18" rx="6.5" fill="#0B0B0F" />
                  <g className="nf-wink">
                    <path d="M103 87 Q109 83 115 87" fill="none" stroke="#0B0B0F" strokeWidth="5" strokeLinecap="round" />
                    <path d="M118 75 l3 6 l6 3 l-6 3 l-3 6 l-3-6 l-6-3 l6-3z" fill="rgba(128,0,32,0.28)" className="nf-twinkle" />
                  </g>
                  <circle cx="58" cy="104" r="7" fill="rgba(128,0,32,0.18)" />
                  <circle cx="122" cy="104" r="7" fill="rgba(128,0,32,0.18)" />
                  <path d="M76 116 Q90 130 104 116" fill="none" stroke="#0B0B0F" strokeWidth="5" strokeLinecap="round" className="nf-smile" />
                  <path d="M112 118 Q116 120 112 122" fill="none" stroke="rgba(11,11,15,0.6)" strokeWidth="3" strokeLinecap="round" />
                  <defs><linearGradient id="nfG" x1="40" y1="20" x2="140" y2="160"><stop stopColor="white" /><stop offset="1" stopColor="rgba(255,255,255,0.92)" /></linearGradient></defs>
                </svg>
              </motion.div>
              <motion.div aria-hidden className="nf-shadow" initial={{ opacity: 0.12, scale: 1 }} animate={{ opacity: [0.1, 0.18, 0.1], scale: [0.92, 1.08, 0.92] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }} />
            </motion.div>
          </div>
          <div className="nf-copy">
            <motion.h1 className="nf-title" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>This page slipped away.</motion.h1>
            <motion.p className="nf-sub" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.7 }}>The link might be wrong, or the page has been moved. No stress — let’s get you back to shopping.</motion.p>
            <div className="nf-actions">
              <Link href="/" className="nf-btn nf-btnPrimary"><ArrowLeft size={16} /><span>Go Home</span></Link>
              <Link href="/products" className="nf-btn nf-btnGhost"><Search size={16} /><span>Browse Products</span></Link>
            </div>
            <button type="button" className="nf-reload" onClick={() => window.location.reload()} aria-label="Reload page"><RefreshCcw size={16} />Try reloading</button>
            <div className="nf-divider" />
          </div>
        </div>
      </section>
      <p className="nf-foot">Tip: Check the URL spelling or use the menu to navigate.</p>
    </main>
  );
}
