"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import {
  ChevronDown,
  ChevronUp,
  Heart,
  Instagram,
  Mail,
  MessageCircle,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { useCategoryStore } from "@/store/categoryStore";
import { useCollectionStore } from "@/store/collectionStore";
import { SOCIAL_LINKS } from "@/data/socials";

const LOGO_URL =
  "https://res.cloudinary.com/dpsvrt4sd/image/upload/v1780338447/qavpt44lsxsy3wrvuwi8.png";

const toSentence = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (match) => match.toUpperCase());

function SectionToggle({ title, open, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between border-b border-neutral-200 py-4 text-left"
    >
      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-black">
        {title}
      </span>
      {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
    </button>
  );
}

function LinkRow({ href, children, onClose }) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className="block border-b border-neutral-100 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-black/65"
    >
      {children}
    </Link>
  );
}

export default function MobileSidebarDrawer({ open, onClose }) {
  const scrollYRef = useRef(0);
  const prevBodyStyleRef = useRef({});
  const [catOpen, setCatOpen] = useState(true);
  const [colOpen, setColOpen] = useState(false);

  const { categories, fetchCategories } = useCategoryStore();
  const collections = useCollectionStore((state) => state.items);
  const fetchCollections = useCollectionStore((state) => state.fetchAll);

  useEffect(() => {
    if (!open) return;
    const body = document.body;
    scrollYRef.current = window.scrollY || 0;
    prevBodyStyleRef.current = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    };
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollYRef.current}px`;
    body.style.width = "100%";

    return () => {
      Object.assign(body.style, prevBodyStyleRef.current);
      window.scrollTo(0, scrollYRef.current);
    };
  }, [open]);

  useEffect(() => {
    if (open && !categories?.length) fetchCategories({ active: true });
  }, [open, categories?.length, fetchCategories]);

  useEffect(() => {
    if (open && !collections?.length) fetchCollections({ force: true });
  }, [open, collections?.length, fetchCollections]);

  const categoryList = useMemo(() => {
    const list = Array.isArray(categories) ? categories : [];
    return list
      .filter((category) => category?.isActive && !category?.parent)
      .map((category) => ({
        id: category?._id || category?.slug,
        name: toSentence(category?.name || category?.slug || "Category"),
        slug: String(category?.slug || "").trim(),
      }))
      .filter((category) => category.slug)
      .slice(0, 10);
  }, [categories]);

  const collectionList = useMemo(() => {
    const list = Array.isArray(collections) ? collections : [];
    return list
      .filter((collection) => collection?.isActive !== false)
      .map((collection) => ({
        id: collection?._id || collection?.slug,
        name: toSentence(collection?.name || collection?.slug || "Collection"),
        slug: String(collection?.slug || "").trim(),
      }))
      .filter((collection) => collection.slug)
      .slice(0, 10);
  }, [collections]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            className="fixed inset-0 z-[999998] bg-black/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed inset-y-0 left-0 z-[999999] flex w-[88vw] max-w-[390px] flex-col bg-white text-black shadow-[30px_0_80px_rgba(0,0,0,0.18)]"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 34 }}
          >
            <header className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
              <Link href="/" onClick={onClose} className="relative h-9 w-32">
                <Image src={LOGO_URL} alt="OATCLUB" fill priority className="object-contain" sizes="128px" />
              </Link>
              <button type="button" onClick={onClose} className="text-black" aria-label="CLOSE MENU">
                <X size={22} />
              </button>
            </header>

            <div className="no-scrollbar flex-1 overflow-y-auto px-5 py-4">
              <div className="grid grid-cols-2 gap-2">
                {[
                  ["/search", Search, "SEARCH"],
                  ["/wishlist", Heart, "WISHLIST"],
                  ["/cart", ShoppingBag, "CART"],
                  ["/profile", User, "PROFILE"],
                ].map(([href, Icon, label]) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={onClose}
                    className="flex items-center gap-2 border border-neutral-200 px-3 py-3 text-[10px] font-black uppercase tracking-[0.16em]"
                  >
                    <Icon size={15} />
                    {label}
                  </Link>
                ))}
              </div>

              <div className="mt-5">
                <SectionToggle title="Shop Categories" open={catOpen} onClick={() => setCatOpen((value) => !value)} />
                <AnimatePresence initial={false}>
                  {catOpen ? (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                      {categoryList.map((category) => (
                        <LinkRow key={category.id} href={`/category/${category.slug}`} onClose={onClose}>
                          {category.name}
                        </LinkRow>
                      ))}
                      {!categoryList.length ? (
                        <p className="py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-black/45">
                          NO CATEGORIES FOUND
                        </p>
                      ) : null}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              <div className="mt-2">
                <SectionToggle title="Collections" open={colOpen} onClick={() => setColOpen((value) => !value)} />
                <AnimatePresence initial={false}>
                  {colOpen ? (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                      {collectionList.map((collection) => (
                        <LinkRow key={collection.id} href={`/collection/${collection.slug}`} onClose={onClose}>
                          {collection.name}
                        </LinkRow>
                      ))}
                      {!collectionList.length ? (
                        <p className="py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-black/45">
                          NO COLLECTIONS FOUND
                        </p>
                      ) : null}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              <div className="mt-5 grid gap-0 border-y border-neutral-200">
                <LinkRow href="/new-arrivals" onClose={onClose}>NEW ARRIVALS</LinkRow>
                <LinkRow href="/bestseller" onClose={onClose}>BESTSELLERS</LinkRow>
                <LinkRow href="/blog" onClose={onClose}>STYLE JOURNAL</LinkRow>
                <LinkRow href="/contact" onClose={onClose}>CONTACT</LinkRow>
              </div>
            </div>

            <footer className="border-t border-neutral-200 px-5 py-4">
              <p className="text-center text-[10px] font-black uppercase tracking-[0.22em] text-black/45">
                OWN ALL TRENDS
              </p>
              <div className="mt-4 flex items-center justify-center gap-5 text-black/55">
                <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noreferrer" aria-label="INSTAGRAM">
                  <Instagram size={18} />
                </a>
                <a href={SOCIAL_LINKS.whatsapp.link} target="_blank" rel="noreferrer" aria-label="WHATSAPP">
                  <MessageCircle size={18} />
                </a>
                <a href={SOCIAL_LINKS.email} aria-label="EMAIL">
                  <Mail size={18} />
                </a>
              </div>
            </footer>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
