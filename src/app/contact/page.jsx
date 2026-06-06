import { Instagram, Mail } from "lucide-react";
import { InfoBlock, InfoCallout, InfoPageLayout, InfoTable } from "@/components/info/InfoPageLayout";
import { buildSeoMetadata } from "@/lib/seo/seoMeta";

export const metadata = buildSeoMetadata({
  title: "Contact OATCLUB India | Order & Style Support",
  description:
    "Contact OATCLUB India for women fashion orders, sizing help, shipping, exchange, returns, refunds and premium clothing support.",
  path: "/contact",
  image: "/og-default.jpg",
  keywords: ["OATCLUB India", "OATCLUB clothing", "women fashion support", "OATCLUB contact"],
});

export default function ContactPage() {
  return (
    <InfoPageLayout
      activePath="/contact"
      title="Contact Us"
      intro="Got a question, a complaint, or just want to say hi? We are actually here."
      aside={
        <InfoCallout
          label="BEST ROUTE"
          title="EMAIL WITH ORDER DETAILS"
          body="Add your order number and a clear note so we can help faster."
          action={{ href: "mailto:hey@oatclub.in", label: "EMAIL US" }}
        />
      }
    >
      <InfoTable
        rows={[
          ["Email", "hey@oatclub.in"],
          ["Reply Time", "24-48 weekday hours"],
          ["Instagram", "DM us for quick stuff"],
          ["For Issues", "Tell us what went wrong"],
        ]}
      />

      <InfoBlock title="Email">
        <p>
          Drop us a line at hey@oatclub.in. We reply within 24-48 hours on weekdays. We are human,
          not a bot. Be nice to us and we will be nice back.
        </p>
        <a
          href="mailto:hey@oatclub.in"
          className="inline-flex h-10 items-center gap-2 bg-black px-4 text-[9px] font-black uppercase tracking-[0.18em] text-white"
        >
          <Mail className="h-4 w-4" />
          EMAIL OATCLUB
        </a>
      </InfoBlock>

      <InfoBlock title="DMs">
        <p>
          Slide into our Instagram DMs for quick stuff. We check it daily. Tag us in your fits too,
          we love that.
        </p>
        <a
          href="https://www.instagram.com/oatclub.in"
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-10 items-center gap-2 border border-black px-4 text-[9px] font-black uppercase tracking-[0.18em] text-black"
        >
          <Instagram className="h-4 w-4" />
          INSTAGRAM
        </a>
      </InfoBlock>

      <InfoBlock title="If Something Is Wrong">
        <p>
          Tell us. We will do our best to make it right. That is not just a policy, it is just how
          we are.
        </p>
      </InfoBlock>
    </InfoPageLayout>
  );
}
