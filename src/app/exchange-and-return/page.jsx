import {
  InfoBlock,
  InfoCallout,
  InfoPageLayout,
  InfoTable,
} from "@/components/info/InfoPageLayout";
import { buildSeoMetadata } from "@/lib/seo/seoMeta";

export const metadata = buildSeoMetadata({
  title: "Exchange & Return Policy | OATCLUB India",
  description:
    "Read the OATCLUB India return and exchange policy, including reverse pick-up, courier charges, pick-up attempts and product exchanges.",
  path: "/exchange-and-return",
  image: "/og-default.jpg",
  keywords: [
    "OATCLUB exchange",
    "OATCLUB return policy",
    "OATCLUB reverse pickup",
    "women clothing online india",
  ],
});

export default function ExchangeAndReturnPage() {
  return (
    <InfoPageLayout
      activePath="/exchange-and-return"
      title="Exchange & Return"
      intro="Returns and exchanges made simple — with reverse pick-up, flexible exchanges, and clear next steps."
      aside={
        <InfoCallout
          label="RETURN PICK-UP"
          title="WE'LL COME TO YOU"
          body="Schedule your return and our courier partner will collect the item from your address."
          action={{ href: "/support", label: "START SUPPORT" }}
        />
      }
    >
      <InfoTable
        rows={[
          ["Reverse Pick-up", "Available"],
          ["Return Shipping Fee", "₹100 deducted from refund"],
          ["Pick-up Attempts", "2 attempts"],
          ["Exchange", "Any other available product"],
        ]}
      />

      <InfoBlock title="How Returns & Exchanges Work">
        <p>
          Once you schedule a return, we'll come to you. We offer a reverse
          pick-up service so you don't have to worry about logistics.
        </p>
        <p>
          A nominal fee of ₹100 is deducted from your refund to cover the
          courier cost. This helps us keep our prices fair for everyone instead
          of building return shipping costs into every order.
        </p>
      </InfoBlock>

      <InfoBlock title="Two Pick-Up Attempts">
        <p>
          Our courier partner will try to collect the item twice. Please keep
          the item packed and ready for handover during the scheduled pick-up.
        </p>
        <p>
          If both attempts are missed, we'll ask you to self-ship the item to
          our warehouse and share the tracking details with us within 2–3 days.
          This helps ensure your return gets processed without unnecessary
          delays.
        </p>
      </InfoBlock>

      <InfoBlock title="Exchanges With Other Products">
        <p>
          You can exchange your item for any other product you like, subject to
          availability.
        </p>
        <p>
          If your requested item is out of stock, we'll issue the eligible
          value as store credit or a gift card, giving you the flexibility to
          use it whenever you're ready.
        </p>
      </InfoBlock>
    </InfoPageLayout>
  );
}
