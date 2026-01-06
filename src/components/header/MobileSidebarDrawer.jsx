"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import {
  X,
  ShoppingBag,
  User,
  Home,
  LayoutGrid,
  Heart,
  Info,
  Mail,
  ChevronDown,
  ChevronUp,
  Instagram,
  Facebook,
  MessageCircle,
} from "lucide-react";

import { useCategoryStore } from "@/store/categoryStore";
import { SOCIAL_LINKS } from "@/data/socials";

export default function MobileSidebarDrawer({ open, onClose }) {
  /* ---------- body scroll lock ---------- */
  const scrollYRef = useRef(0);
  const prevBodyStyleRef = useRef({});

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

  /* ---------- categories ---------- */
  const { categories, fetchCategories } = useCategoryStore();
  const [catOpen, setCatOpen] = useState(false);

  useEffect(() => {
    if (open && !categories.length) fetchCategories({ active: true });
  }, [open, categories.length, fetchCategories]);

  const categoryTree = useMemo(() => {
    const map = new Map();
    const roots = [];

    categories.forEach((c) => {
      if (!c.isActive) return;
      map.set(c._id, { ...c, children: [] });
    });

    map.forEach((c) => {
      const parentId =
        c.parent && typeof c.parent === "object" ? c.parent._id : c.parent;
      if (!parentId) roots.push(c);
      else map.get(parentId)?.children.push(c);
    });

    return roots.sort((a, b) => a.name.localeCompare(b.name));
  }, [categories]);

  const navItems = [
    { name: "Wishlist", href: "/wishlist", icon: Heart },
    { name: "Cart", href: "/cart", icon: ShoppingBag },
    { name: "About", href: "/about", icon: Info },
    { name: "Contact", href: "/contact", icon: Mail },
  ];

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* BACKDROP */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[999998]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* MENU */}
          <motion.aside
            className="fixed inset-0 z-[999999] bg-white flex flex-col"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
          >
            {/* HEADER */}
            <div className="px-7 py-6 flex items-center justify-between border-b border-zinc-200">
              <Link href="/" onClick={onClose} className="flex items-center">
                <Image
                  src="https://res.cloudinary.com/djtva6hec/image/upload/v1764916639/miray/media/k0yvgu5m0ij1husm3ugh.png"
                  alt="Miray Fashion"
                  width={120}
                  height={40}
                  priority
                  className="object-contain"
                />
              </Link>

              <button
                onClick={onClose}
                className="p-2.5 rounded-full hover:bg-zinc-100 transition"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>

            {/* NAV */}
            <nav className="flex-1 overflow-y-auto">
              <Link
                href="/"
                onClick={onClose}
                className="menu-item border-b border-zinc-200"
              >
                <Home size={20} />
                Home
              </Link>

              {/* CATEGORIES */}
              <button
                onClick={() => setCatOpen((p) => !p)}
                className="menu-item w-full justify-between border-b border-zinc-200"
              >
                <span className="flex items-center gap-4">
                  <LayoutGrid size={20} />
                  Categories
                </span>
                {catOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>

              <AnimatePresence>
                {catOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="pl-10 border-b border-zinc-200"
                  >
                    {categoryTree.map((cat) => (
                      <div key={cat._id}>
                        <Link
                          href={`/category/${cat.slug}`}
                          onClick={onClose}
                          className="submenu-item"
                        >
                          {cat.name}
                        </Link>

                        {cat.children?.map((child) => (
                          <Link
                            key={child._id}
                            href={`/category/${child.slug}`}
                            onClick={onClose}
                            className="submenu-item ml-4 text-zinc-500"
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* OTHER LINKS */}
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className="menu-item border-b border-zinc-200"
                  >
                    <Icon size={20} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* BOTTOM SECTION */}
            <div className="px-7 py-6 border-t border-zinc-200 space-y-5">
              {/* ACCOUNT */}
              <Link
                href="/profile"
                onClick={onClose}
                className="flex items-center gap-5 rounded-xl bg-zinc-50 px-5 py-5 hover:bg-zinc-100 transition"
              >
                <span className="w-11 h-11 rounded-xl bg-black/10 text-black flex items-center justify-center">
                  <User size={20} />
                </span>
                <div>
                  <div className="text-base font-semibold text-zinc-900">
                    My Account
                  </div>
                  <div className="text-sm text-zinc-500">
                    Orders • Profile • Settings
                  </div>
                </div>
              </Link>

              {/* ✅ SOCIALS */}
              <div className="flex items-center justify-center gap-5 text-zinc-500">
                <a
                  href={SOCIAL_LINKS.instagram}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="hover:text-zinc-900 transition"
                >
                  <Instagram size={20} />
                </a>

                <a
                  href={SOCIAL_LINKS.facebook}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="hover:text-zinc-900 transition"
                >
                  <Facebook size={20} />
                </a>

                <a
                  href={SOCIAL_LINKS.whatsapp.link}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="WhatsApp"
                  className="hover:text-zinc-900 transition"
                >
                  <MessageCircle size={20} />
                </a>

                <a
                  href={SOCIAL_LINKS.email}
                  aria-label="Email"
                  className="hover:text-zinc-900 transition"
                >
                  <Mail size={20} />
                </a>
              </div>
            </div>
          </motion.aside>

          {/* STYLES */}
          <style jsx global>{`
            .menu-item {
              display: flex;
              align-items: center;
              gap: 16px;
              padding: 20px 18px;
              font-size: 16px;
              font-weight: 500;
              color: #18181b;
              transition: background 0.2s ease;
            }
            .menu-item:hover {
              background: #f4f4f5;
            }
            .submenu-item {
              display: block;
              padding: 14px 18px;
              font-size: 15px;
              border-radius: 12px;
              color: #18181b;
              transition: background 0.2s ease;
            }
            .submenu-item:hover {
              background: #f4f4f5;
            }
          `}</style>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
