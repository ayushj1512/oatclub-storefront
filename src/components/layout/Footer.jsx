"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Facebook,
  Instagram,
  Mail,
  MessageCircle,
  ChevronDown,
} from "lucide-react";
import { SOCIAL_LINKS } from "@/data/socials";

const logo =
  "https://res.cloudinary.com/dpsvrt4sd/image/upload/v1781123546/odb5ckquouajjzfbxin0.webp";

const quickLinks = [
  ["Home", "/"],
  ["Shop", "/all-clothing"],
  ["Affiliate Program", "/affiliate"],
  ["About", "/about"],
  ["Contact", "/contact"],
];

const supportLinks = [
  ["Support", "/support"],
  ["FAQs", "/faq"],
  ["Shipping Policy", "/shipping-policy"],
  ["Exchange & Return", "/exchange-and-return"],
  ["Cancellation & Refund", "/cancellation-and-refund"],
  ["Privacy Policy", "/privacy-policy"],
  ["Terms & Conditions", "/terms-and-conditions"],
];

function Links({ items }) {
  return (
    <nav className="flex flex-col gap-2.5 text-sm text-white/50">
      {items.map(([label, href]) => (
        <Link key={href} href={href} className="transition hover:text-white">
          {label}
        </Link>
      ))}
    </nav>
  );
}

function Socials() {
  const icons = [
    [Instagram, SOCIAL_LINKS.instagram, "Instagram"],
    [Facebook, SOCIAL_LINKS.facebook, "Facebook"],
    [MessageCircle, SOCIAL_LINKS.whatsapp.link, "WhatsApp"],
    [Mail, SOCIAL_LINKS.email, "Email"],
  ];

  return (
    <div className="flex justify-center gap-2.5 md:justify-start">
      {icons.map(([Icon, href, label]) => (
        <a
          key={label}
          href={href}
          target={label === "Email" ? undefined : "_blank"}
          rel={label === "Email" ? undefined : "noreferrer"}
          aria-label={label}
          className="grid size-10 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-white/55 transition hover:bg-white hover:text-black"
        >
          <Icon className="h-4 w-4" />
        </a>
      ))}
    </div>
  );
}

function MobileGroup({ title, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-white/10">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-4 text-sm font-medium text-white"
      >
        {title}
        <ChevronDown
          className={`h-4 w-4 text-white/50 transition ${open ? "rotate-180" : ""
            }`}
        />
      </button>

      {open && <div className="pb-4">{children}</div>}
    </div>
  );
}

export default function Footer() {
  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <footer className="w-full bg-black text-white">
      <div className="px-4 py-10 md:px-16 md:py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_0.8fr_1fr_1fr] md:gap-12">
          <div className="text-center md:text-left">
            <div className="flex justify-center md:justify-start">
              <Image
                src={logo}
                alt="Oatclub"
                width={170}
                height={58}
                priority
                className="object-contain"
              />
            </div>

            <h2 className="mx-auto mt-5 max-w-sm text-2xl font-semibold leading-none tracking-tight md:mx-0 md:mt-6 md:text-4xl">
              Own All Trends.
            </h2>

            <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-white/50 md:mx-0">
              Fresh fashion edits, curated styles and everyday statement pieces
              designed for the modern wardrobe.
            </p>
          </div>

          <div className="hidden md:block">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-white/35">
              Quick Links
            </h3>
            <Links items={quickLinks} />
          </div>

          <div className="hidden md:block">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-white/35">
              Support
            </h3>
            <Links items={supportLinks} />
          </div>

          <div className="hidden md:block">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-white/35">
              Follow Us
            </h3>
            <Socials />

            <p className="mt-5 text-sm leading-relaxed text-white/45">
              Tag us on Instagram{" "}
              <span className="text-white">@oatclub.in</span>
            </p>
          </div>
        </div>

        <div className="mt-8 md:hidden">
          <MobileGroup title="Quick Links">
            <Links items={quickLinks} />
          </MobileGroup>

          <MobileGroup title="Support">
            <Links items={supportLinks} />
          </MobileGroup>

          <MobileGroup title="Follow Us">
            <Socials />
            <p className="mt-4 text-center text-sm text-white/45">
              Tag us on Instagram <span className="text-white">@oatclub.in</span>
            </p>
          </MobileGroup>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-white/40">
        © {year} Oatclub. All rights reserved.
      </div>
    </footer>
  );
}
