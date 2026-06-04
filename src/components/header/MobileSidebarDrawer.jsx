"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { X, ShoppingBag, User, Home, LayoutGrid, Heart, Info, Mail, ChevronDown, ChevronUp, Instagram, Facebook, MessageCircle, Layers } from "lucide-react";

import { useCategoryStore } from "@/store/categoryStore";
import { useCollectionStore } from "@/store/collectionStore";
import { SOCIAL_LINKS } from "@/data/socials";

const LOGO_URL =
  "https://res.cloudinary.com/dpsvrt4sd/image/upload/v1780338447/qavpt44lsxsy3wrvuwi8.png";
const toSentence = (s) => String(s ?? "").trim().toLowerCase().replace(/\b\w/g, (m) => m.toUpperCase());

export default function MobileSidebarDrawer({ open, onClose }) {
  const scrollYRef = useRef(0);
  const prevBodyStyleRef = useRef({});

  useEffect(() => {
    if (!open) return;
    const body = document.body;
    scrollYRef.current = window.scrollY || 0;
    prevBodyStyleRef.current = { overflow: body.style.overflow, position: body.style.position, top: body.style.top, width: body.style.width };
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollYRef.current}px`;
    body.style.width = "100%";
    return () => { Object.assign(body.style, prevBodyStyleRef.current); window.scrollTo(0, scrollYRef.current); };
  }, [open]);

  const { categories, fetchCategories } = useCategoryStore();
  const collections = useCollectionStore((s) => s.items);
  const fetchCollections = useCollectionStore((s) => s.fetchAll);

  const [catOpen, setCatOpen] = useState(false);
  const [colOpen, setColOpen] = useState(false);

  useEffect(() => { if (open && !categories?.length) fetchCategories({ active: true }); }, [open, categories?.length, fetchCategories]);
  useEffect(() => { if (open && !collections?.length) fetchCollections({ force: true }); }, [open, collections?.length, fetchCollections]);

  const categoryTree = useMemo(() => {
    const list = Array.isArray(categories) ? categories : [];
    const map = new Map();
    const roots = [];
    list.forEach((c) => { if (!c?.isActive) return; map.set(c._id, { ...c, children: [] }); });
    map.forEach((c) => { const parentId = c.parent && typeof c.parent === "object" ? c.parent._id : c.parent; if (!parentId) roots.push(c); else map.get(parentId)?.children.push(c); });
    return roots.sort((a, b) => String(a?.name || "").localeCompare(String(b?.name || "")));
  }, [categories]);

  const collectionList = useMemo(() => {
    const list = Array.isArray(collections) ? collections : [];
    return list.filter((c) => c?.isActive !== false).map((c) => ({ _id: c?._id || c?.slug, name: toSentence(c?.name || c?.slug || "Collection"), slug: String(c?.slug || "").trim() })).filter((c) => c.slug);
  }, [collections]);

  const navItems = useMemo(() => ([
    { name: "Wishlist", href: "/wishlist", icon: Heart },
    { name: "Cart", href: "/cart", icon: ShoppingBag },
    { name: "About", href: "/about", icon: Info },
    { name: "Contact", href: "/contact", icon: Mail },
  ]), []);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[999998]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside className="fixed inset-0 z-[999999] bg-white flex flex-col" initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", stiffness: 260, damping: 30 }}>
            <div className="px-7 py-6 flex items-center justify-between border-b border-zinc-200">
              <Link href="/" onClick={onClose} className="flex items-center"><Image src={LOGO_URL} alt="OATCLUB" width={120} height={40} priority className="object-contain" /></Link>
              <button onClick={onClose} className="p-2.5 text-black transition hover:text-black/55" aria-label="Close menu"><X size={24} /></button>
            </div>

            <nav className="flex-1 overflow-y-auto">
              <Link href="/" onClick={onClose} className="menu-item border-b border-zinc-200"><Home size={20} />Home</Link>

                  <button onClick={() => setCatOpen((p) => !p)} className="menu-item w-full justify-between border-b border-zinc-200">
                <span className="flex items-center gap-4"><LayoutGrid size={20} />Categories</span>
                {catOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              <AnimatePresence>
                {catOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="pl-10 border-b border-zinc-200">
                    {categoryTree.map((cat) => (
                      <div key={cat._id}>
                        <Link href={`/category/${cat.slug}`} onClick={onClose} className="submenu-item">{toSentence(cat.name)}</Link>
                        {cat.children?.map((child) => (
                          <Link key={child._id} href={`/category/${child.slug}`} onClick={onClose} className="submenu-item ml-4 text-zinc-500">{toSentence(child.name)}</Link>
                        ))}
                      </div>
                    ))}
                    {!categoryTree.length && <div className="px-4 py-3 text-sm text-zinc-500">No categories found.</div>}
                  </motion.div>
                )}
              </AnimatePresence>

              <button onClick={() => setColOpen((p) => !p)} className="menu-item w-full justify-between border-b border-zinc-200">
                <span className="flex items-center gap-4"><Layers size={20} />Collections</span>
                {colOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              <AnimatePresence>
                {colOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="pl-10 border-b border-zinc-200">
                    {collectionList.map((c) => (
                      <Link key={c._id} href={`/collection/${c.slug}`} onClick={onClose} className="submenu-item">{c.name}</Link>
                    ))}
                    {!collectionList.length && <div className="px-4 py-3 text-sm text-zinc-500">No collections found.</div>}
                  </motion.div>
                )}
              </AnimatePresence>

          

              {navItems.map((item) => {
                const Icon = item.icon;
                return <Link key={item.name} href={item.href} onClick={onClose} className="menu-item border-b border-zinc-200"><Icon size={20} />{item.name}</Link>;
              })}
            </nav>

            <div className="px-7 py-6 border-t border-zinc-200 space-y-5">
              <Link href="/profile" onClick={onClose} className="flex items-center gap-4 border border-black/10 px-5 py-4 transition hover:border-black">
                <span className="flex h-9 w-9 items-center justify-center text-black"><User size={20} /></span>
                <div><div className="text-xs font-black uppercase tracking-[0.16em] text-zinc-900">MY ACCOUNT</div><div className="mt-1 text-[11px] font-bold uppercase tracking-[0.08em] text-zinc-500">ORDERS / PROFILE / SETTINGS</div></div>
              </Link>

              <div className="flex items-center justify-center gap-5 text-zinc-500">
                <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:text-zinc-900 transition"><Instagram size={20} /></a>
                <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="hover:text-zinc-900 transition"><Facebook size={20} /></a>
                <a href={SOCIAL_LINKS.whatsapp.link} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="hover:text-zinc-900 transition"><MessageCircle size={20} /></a>
                <a href={SOCIAL_LINKS.email} aria-label="Email" className="hover:text-zinc-900 transition"><Mail size={20} /></a>
              </div>
            </div>
          </motion.aside>

          <style jsx global>{`
            .menu-item { display:flex; align-items:center; gap:16px; padding:18px 18px; font-size:13px; font-weight:900; letter-spacing:.14em; text-transform:uppercase; color:#18181b; transition:background .2s ease, color .2s ease; }
            .menu-item:hover { background:#f4f4f5; }
            .submenu-item { display:block; padding:13px 18px; font-size:12px; font-weight:800; letter-spacing:.1em; text-transform:uppercase; color:#18181b; transition:background .2s ease; }
            .submenu-item:hover { background:#f4f4f5; }
          `}</style>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

