import { InfoBlock, InfoCallout, InfoPageLayout, InfoTable } from "@/components/info/InfoPageLayout";
import { buildSeoMetadata } from "@/lib/seo/seoMeta";

export const metadata = buildSeoMetadata({
  title: "Exchange & Return Policy | OATCLUB India",
  description:
    "Read the OATCLUB India 7-day exchange and return policy for eligible women fashion, western wear and clothing orders.",
  path: "/exchange-and-return",
  image: "/og-default.jpg",
  keywords: ["OATCLUB exchange", "OATCLUB return policy", "women clothing online india"],
});

export default function ExchangeAndReturnPage() {
  return (
    <InfoPageLayout
      activePath="/exchange-and-return"
      title="Exchange & Return"
      intro="A clean 7-day window for unworn, unwashed pieces with tags intact. Simple, clear, and handled with care."
      aside={
        <InfoCallout
          label="RETURN WINDOW"
          title="7 DAYS FROM DELIVERY"
          body="Keep tags, packaging and the product condition intact before raising a request."
          action={{ href: "/support", label: "START SUPPORT" }}
        />
      }
    >
      <InfoTable
        rows={[
          ["Window", "7 days from delivery"],
          ["Condition", "Unworn, unwashed, tags intact"],
          ["Sale Items", "Final sale unless faulty"],
          ["Contact", "hey@oatclub.in"],
        ]}
      />

      <InfoBlock title="Can I Return My Order?">
        <p>
          You have 7 days from delivery to raise a return or exchange. The item should be unworn,
          unwashed, and have all tags intact.
        </p>
      </InfoBlock>

      <InfoBlock title="How Do I Start A Return?">
        <p>
          Email us at hey@oatclub.in with your order number and reason. We will guide you through
          the rest. It is not complicated, promise.
        </p>
        <p>
          We do not do returns on sale items or custom pieces. Final sale means final sale.
        </p>
      </InfoBlock>

      <InfoBlock title="What About Exchanges?">
        <p>
          Wrong size? Different colour? We will swap it out subject to availability. Reach out and
          we will make it work where possible.
        </p>
      </InfoBlock>
    </InfoPageLayout>
  );
}
