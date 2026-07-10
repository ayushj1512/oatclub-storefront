"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import {
  ChevronDown,
  ChevronRight,
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
      aria-expanded={open}
      className="flex w-full items-center justify-between border-b border-black/10 py-4 text-left"
    >
      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-black">
        {title}
      </span>

      {open ? (
        <ChevronUp size={16} strokeWidth={1.8} />
      ) : (
        <ChevronDown size={16} strokeWidth={1.8} />
      )}
    </button>
  );
}

function DrawerLink({ href, children, onClose }) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className="group flex items-center justify-between border-b border-black/[0.07] py-3.5"
    >
      <span className="truncate text-[11px] font-bold uppercase tracking-[0.15em] text-black/60 transition group-hover:text-black">
        {children}
      </span>

      <ChevronRight
        size={14}
        className="shrink-0 text-black/20 transition duration-200 group-hover:translate-x-1 group-hover:text-black"
      />
    </Link>
  );
}

function QuickLink({ href, icon: Icon, label, onClose }) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className="group flex items-center justify-between border border-black/10 px-4 py-4 transition hover:border-black"
    >
      <span className="flex items-center gap-3">
        <Icon
          size={17}
          strokeWidth={1.8}
          className="text-black/55 transition group-hover:text-black"
        />

        <span className="text-[10px] font-black uppercase tracking-[0.16em] text-black">
          {label}
        </span>
      </span>

      <ChevronRight
        size={14}
        className="text-black/25 transition group-hover:translate-x-1 group-hover:text-black"
      />
    </Link>
  );
}

export default function DesktopSidebarDrawer({ open, onClose }) {
  const scrollYRef = useRef(0);
  const previousBodyStyleRef = useRef({});

  const [mounted, setMounted] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(true);
  const [collectionOpen, setCollectionOpen] = useState(true);

  const categories = useCategoryStore((state) => state.categories);
  const categoryLoading = useCategoryStore((state) => state.loading);
  const categoryError = useCategoryStore((state) => state.error);
  const fetchCategories = useCategoryStore(
    (state) => state.fetchCategories
  );
  const clearCategoryError = useCategoryStore(
    (state) => state.clearError
  );

  const collections = useCollectionStore((state) => state.items);
  const collectionLoading = useCollectionStore(
    (state) => state.loading
  );
  const collectionError = useCollectionStore((state) => state.error);
  const fetchCollections = useCollectionStore(
    (state) => state.fetchAll
  );
  const clearCollectionError = useCollectionStore(
    (state) => state.clearError
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const body = document.body;

    scrollYRef.current = window.scrollY || 0;

    previousBodyStyleRef.current = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
    };

    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollYRef.current}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";

    return () => {
      const previous = previousBodyStyleRef.current;

      body.style.overflow = previous.overflow || "";
      body.style.position = previous.position || "";
      body.style.top = previous.top || "";
      body.style.left = previous.left || "";
      body.style.right = previous.right || "";
      body.style.width = previous.width || "";

      window.scrollTo({
        top: scrollYRef.current,
        behavior: "instant",
      });
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;

    if (!categories?.length) {
      clearCategoryError?.();
      fetchCategories?.({
        active: true,
        parent: "null",
      });
    }
  }, [
    open,
    categories?.length,
    clearCategoryError,
    fetchCategories,
  ]);

  useEffect(() => {
    if (!open) return;

    if (!collections?.length) {
      clearCollectionError?.();
      fetchCollections?.({
        force: true,
      });
    }
  }, [
    open,
    collections?.length,
    clearCollectionError,
    fetchCollections,
  ]);

  const categoryList = useMemo(() => {
    const list = Array.isArray(categories) ? categories : [];

    return list
      .filter(
        (category) =>
          category?.isActive !== false && !category?.parent
      )
      .map((category) => ({
        id:
          category?._id ||
          category?.slug ||
          category?.name,
        name: toSentence(
          category?.name ||
            category?.slug ||
            "Category"
        ),
        slug: String(category?.slug || "").trim(),
      }))
      .filter((category) => category.slug)
      .slice(0, 16);
  }, [categories]);

  const collectionList = useMemo(() => {
    const list = Array.isArray(collections) ? collections : [];

    return list
      .filter(
        (collection) => collection?.isActive !== false
      )
      .map((collection) => ({
        id:
          collection?._id ||
          collection?.slug ||
          collection?.name,
        name: toSentence(
          collection?.name ||
            collection?.slug ||
            "Collection"
        ),
        slug: String(collection?.slug || "").trim(),
      }))
      .filter((collection) => collection.slug)
      .slice(0, 16);
  }, [collections]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-[999998] hidden cursor-default bg-black/45 backdrop-blur-[2px] md:block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Desktop navigation menu"
            className="fixed inset-y-0 left-0 z-[999999] hidden w-[460px] max-w-[88vw] flex-col bg-white text-black shadow-[30px_0_100px_rgba(0,0,0,0.2)] md:flex"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{
              type: "spring",
              stiffness: 310,
              damping: 34,
              mass: 0.9,
            }}
          >
            <header className="flex items-center justify-between border-b border-black/10 px-7 py-5">
              <Link
                href="/"
                onClick={onClose}
                className="relative h-12 w-40"
              >
                <Image
                  src={LOGO_URL}
                  alt="OATCLUB"
                  fill
                  priority
                  className="object-contain object-left"
                  sizes="160px"
                />
              </Link>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="flex h-10 w-10 items-center justify-center border border-black/10 text-black transition hover:border-black hover:bg-black hover:text-white"
              >
                <X size={20} />
              </button>
            </header>

            <div className="no-scrollbar flex-1 overflow-y-auto px-7 py-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-black/35">
                  OATCLUB Menu
                </p>

                <h2 className="mt-2 text-[28px] font-black uppercase leading-[1.05] tracking-[-0.04em] text-black">
                  Explore
                  <br />
                  The Edit
                </h2>
              </div>

              <div className="mt-7 grid grid-cols-2 gap-2">
                <QuickLink
                  href="/search"
                  icon={Search}
                  label="Search"
                  onClose={onClose}
                />

                <QuickLink
                  href="/wishlist"
                  icon={Heart}
                  label="Wishlist"
                  onClose={onClose}
                />

                <QuickLink
                  href="/cart"
                  icon={ShoppingBag}
                  label="Cart"
                  onClose={onClose}
                />

                <QuickLink
                  href="/profile"
                  icon={User}
                  label="Profile"
                  onClose={onClose}
                />
              </div>

              {!collectionLoading &&
  !collectionError &&
  collectionList.length > 0 && (
    <div className="mt-7">
      <SectionToggle
        title="Shop Collections"
        open={collectionOpen}
        onClick={() =>
          setCollectionOpen((value) => !value)
        }
      />

      <AnimatePresence initial={false}>
        {collectionOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-x-6">
              {collectionList.map((collection) => (
                <DrawerLink
                  key={collection.id}
                  href={`/collection/${collection.slug}`}
                  onClose={onClose}
                >
                  {collection.name}
                </DrawerLink>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )}

             
              <div className="mt-2">
                <SectionToggle
                  title="Shop Categories"
                  open={categoryOpen}
                  onClick={() =>
                    setCategoryOpen((value) => !value)
                  }
                />

                <AnimatePresence initial={false}>
                  {categoryOpen ? (
                    <motion.div
                      initial={{
                        height: 0,
                        opacity: 0,
                      }}
                      animate={{
                        height: "auto",
                        opacity: 1,
                      }}
                      exit={{
                        height: 0,
                        opacity: 0,
                      }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden"
                    >
                      {categoryLoading ? (
                        <p className="py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-black/40">
                          Loading categories...
                        </p>
                      ) : categoryError ? (
                        <p className="py-4 text-sm text-black/50">
                          {categoryError}
                        </p>
                      ) : categoryList.length ? (
                        <div className="grid grid-cols-2 gap-x-6">
                          {categoryList.map((category) => (
                            <DrawerLink
                              key={category.id}
                              href={`/category/${category.slug}`}
                              onClose={onClose}
                            >
                              {category.name}
                            </DrawerLink>
                          ))}
                        </div>
                      ) : (
                        <p className="py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-black/40">
                          No categories found
                        </p>
                      )}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              <div className="mt-7 border-t border-black/10">
                <DrawerLink
                  href="/new-arrivals"
                  onClose={onClose}
                >
                  New Arrivals
                </DrawerLink>

                <DrawerLink
                  href="/bestseller"
                  onClose={onClose}
                >
                  Bestsellers
                </DrawerLink>

                <DrawerLink href="/blog" onClose={onClose}>
                  Style Journal
                </DrawerLink>

                <DrawerLink
                  href="/contact"
                  onClose={onClose}
                >
                  Contact
                </DrawerLink>
              </div>
            </div>

            <footer className="border-t border-black/10 px-7 py-5">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-black/40">
                  Own All Trends
                </p>

                <div className="flex items-center gap-4 text-black/55">
                  <a
                    href={SOCIAL_LINKS.instagram}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram"
                    className="transition hover:text-black"
                  >
                    <Instagram size={18} />
                  </a>

                  <a
                    href={SOCIAL_LINKS.whatsapp.link}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="WhatsApp"
                    className="transition hover:text-black"
                  >
                    <MessageCircle size={18} />
                  </a>

                  <a
                    href={SOCIAL_LINKS.email}
                    aria-label="Email"
                    className="transition hover:text-black"
                  >
                    <Mail size={18} />
                  </a>
                </div>
              </div>
            </footer>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}