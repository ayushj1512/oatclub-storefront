import { InfoBlock, InfoCallout, InfoPageLayout, InfoTable } from "@/components/info/InfoPageLayout";
import { buildSeoMetadata } from "@/lib/seo/seoMeta";

export const metadata = buildSeoMetadata({
  title: "Cancellation & Refund Policy | OATCLUB India",
  description:
    "Read OATCLUB India cancellation and refund timelines for women fashion, western wear and online clothing orders.",
  path: "/cancellation-and-refund",
  image: "/og-default.jpg",
  keywords: ["OATCLUB refund", "OATCLUB cancellation", "OATCLUB India"],
});

export default function CancellationAndRefundPage() {
  return (
    <InfoPageLayout
      activePath="/cancellation-and-refund"
      title="Cancellation & Refund"
      intro="Cancel early, return clean, and we will process eligible refunds back to the original payment method."
      aside={
        <InfoCallout
          label="IMPORTANT"
          title="CANCEL WITHIN 12 HOURS"
          body="After packing starts, cancellation may not be possible."
          action={{ href: "/support", label: "CONTACT SUPPORT" }}
        />
      }
    >
      <InfoTable
        rows={[
          ["Cancellation", "Within 12 hours of order placement"],
          ["Refund Processing", "5-7 business days after inspection"],
          ["Refund Method", "Original payment method"],
          ["Shipping Charges", "Non-refundable unless our mistake"],
        ]}
      />

      <InfoBlock title="Can I Cancel My Order?">
        <p>
          Orders can be cancelled within 12 hours of placing them. After that, we have probably
          already started packing it, which means we cannot stop the process.
        </p>
      </InfoBlock>

      <InfoBlock title="How Long Do Refunds Take?">
        <p>
          Once we receive and inspect the return, refunds are processed within 5-7 business days.
          The amount goes back to your original payment method. Banks do their own thing after
          that, so give it a bit.
        </p>
        <p>
          Shipping charges are non-refundable unless the return is due to our mistake, like a wrong
          item or defect.
        </p>
      </InfoBlock>
    </InfoPageLayout>
  );
}
