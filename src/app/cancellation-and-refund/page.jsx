import {
  InfoBlock,
  InfoCallout,
  InfoPageLayout,
  InfoTable,
} from "@/components/info/InfoPageLayout";

import { buildSeoMetadata } from "@/lib/seo/seoMeta";

export const metadata = buildSeoMetadata({
  title: "Cancellation, Exchange & Refund Policy | OATCLUB India",
  description:
    "Read OATCLUB India's cancellation, 7-day exchange, return and wallet refund policy.",
  path: "/cancellation-and-refund",
  image: "/og-default.jpg",
  keywords: [
    "OATCLUB refund",
    "OATCLUB cancellation",
    "OATCLUB exchange",
    "OATCLUB return policy",
    "OATCLUB India",
  ],
});

export default function CancellationAndRefundPage() {
  return (
    <InfoPageLayout
      activePath="/cancellation-and-refund"
      title="Cancellation & Refund"
      intro="Cancel eligible orders within 12 hours or request an exchange or return within 7 days of delivery."
      aside={
        <InfoCallout
          label="IMPORTANT"
          title="7-DAY EASY RETURN"
          body="Approved refunds are credited to your OATCLUB wallet after the returned product is received and verified."
          action={{ href: "/support", label: "CONTACT SUPPORT" }}
        />
      }
    >
      <InfoTable
        rows={[
          ["Cancellation", "Within 12 hours of order placement"],
          ["Return & Exchange", "Within 7 days of delivery"],
          ["Return Shipping Fee", "₹100 deducted from approved return refunds"],
          ["Refund Processing", "Within 3–4 business days after verification"],
          ["Refund Method", "OATCLUB account wallet"],
        ]}
      />

      <InfoBlock title="Order Cancellation">
        <p>
          Orders can be cancelled within 12 hours of placement. Once packing or
          processing has started, cancellation may not be possible.
        </p>
      </InfoBlock>

      <InfoBlock title="7-Day Easy Exchange & Return">
        <p>
          At OATCLUB, we want you to shop with confidence. If you are not
          completely satisfied with your purchase, you can request an exchange
          or return within 7 days from the date of delivery.
        </p>
        <ul>
          <li>
            Reverse pick-up is available for eligible returns and exchanges.
          </li>
          <li>
            A ₹100 return shipping fee will be deducted from your approved
            return refund.
          </li>
          <li>
            You may exchange your product for any other available product on
            our website.
          </li>
          <li>
            Any applicable price difference for an exchange will be adjusted
            accordingly.
          </li>
        </ul>
      </InfoBlock>

      <InfoBlock title="How Returns & Exchanges Work">
        <p>
          Once you raise a return or exchange request, our team will arrange a
          reverse pick-up for the eligible product.
        </p>
        <p>
          After the product is received, it will undergo a basic quality check.
          Once approved, your refund will be initiated within 3–4 business
          days.
        </p>
        <p>
          For exchanges, the replacement product will be processed after the
          returned product is received and successfully verified.
        </p>
      </InfoBlock>

      <InfoBlock title="Refund to OATCLUB Wallet">
        <p>
          Your approved refund will be credited to your OATCLUB account wallet
          within 3–4 business days after the returned product is received and
          verified.
        </p>
        <p>
          The wallet balance can be redeemed towards future orders placed on
          the OATCLUB website.
        </p>
      </InfoBlock>

      <InfoBlock title="Return & Exchange Conditions">
        <ul>
          <li>The product must be unused and unworn.</li>
          <li>The product must be returned in its original condition.</li>
          <li>All original tags, packaging and accessories must be intact.</li>
          <li>
            Products that are damaged, altered, washed or used may not be
            eligible.
          </li>
          <li>
            The request must be raised within 7 days from the date of delivery.
          </li>
        </ul>
      </InfoBlock>

      <InfoBlock title="Important">
        <p>
          A ₹100 return shipping fee will be deducted from the refund amount
          for approved returns.
        </p>
        <p>
          For any questions regarding cancellation, return or exchange, please
          contact our customer support team.
        </p>
      </InfoBlock>
    </InfoPageLayout>
  );
}
