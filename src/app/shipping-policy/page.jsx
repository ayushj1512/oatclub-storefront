import { InfoBlock, InfoCallout, InfoPageLayout, InfoTable } from "@/components/info/InfoPageLayout";

export const metadata = {
  title: "Shipping Policy | OATCLUB",
  description: "OATCLUB shipping timelines, tracking, and delivery coverage across India.",
};

export default function ShippingPolicyPage() {
  return (
    <InfoPageLayout
      activePath="/shipping-policy"
      title="Shipping Policy"
      intro="We ship with care, keep you updated, and would rather take one extra day than rush a piece that is not right."
      aside={
        <InfoCallout
          label="ORDER HELP"
          title="TRACKING COMES BY EMAIL"
          body="Once your order ships, the tracking link lands straight in your inbox."
          action={{ href: "/support", label: "CONTACT SUPPORT" }}
        />
      }
    >
      <InfoBlock title="How Long Does Shipping Take?">
        <p>
          We aim to ship your order within 7 days of placing it. Real talk though, we would rather
          take an extra day to make sure your order is perfect than rush something out that is not
          right.
        </p>
        <p>
          We are a small team doing big things. If there is a delay, you will always hear from us
          first.
        </p>
      </InfoBlock>

      <InfoTable
        rows={[
          ["Dispatch Goal", "Within 7 days of order placement"],
          ["Tracking", "Shared by email once shipped"],
          ["Coverage", "Across India"],
          ["Support", "hey@oatclub.in"],
        ]}
      />

      <InfoBlock title="Will I Get A Tracking Link?">
        <p>
          Yep. Once your order ships, we will drop a tracking link straight to your inbox. Stalk it
          as much as you want, we do not judge.
        </p>
      </InfoBlock>

      <InfoBlock title="Do You Ship Everywhere?">
        <p>
          Yep, we ship everywhere across India. If you are in India, you are in the club.
        </p>
      </InfoBlock>
    </InfoPageLayout>
  );
}
