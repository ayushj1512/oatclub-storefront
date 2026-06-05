import { InfoBlock, InfoCallout, InfoPageLayout, InfoTable } from "@/components/info/InfoPageLayout";

export const metadata = {
  title: "Privacy Policy | OATCLUB",
  description: "How OATCLUB collects, uses, and protects customer information.",
};

export default function PrivacyPolicyPage() {
  return (
    <InfoPageLayout
      activePath="/privacy-policy"
      title="Privacy Policy"
      intro="Short version: we only collect what we need, we do not sell your data, and we treat your info like it is our own."
      aside={
        <InfoCallout
          label="DATA QUESTIONS"
          title="ASK US DIRECTLY"
          body="Your trust matters. For privacy questions, email hey@oatclub.in."
          action={{ href: "mailto:hey@oatclub.in", label: "EMAIL US" }}
        />
      }
    >
      <InfoTable
        rows={[
          ["We Collect", "Name, email, address, payment/order details"],
          ["We Share", "Only with payment, delivery, and store services"],
          ["We Never Do", "Sell data to third-party marketers"],
          ["Contact", "hey@oatclub.in"],
        ]}
      />

      <InfoBlock title="What Do We Collect?">
        <p>
          Basic stuff: your name, email, address, and payment info to process your order. That is
          it. We are not building a weird profile on you.
        </p>
      </InfoBlock>

      <InfoBlock title="Do You Share It?">
        <p>
          Only with the services that help us run OATCLUB, like our payment provider and delivery
          partner. Never to third-party marketers. Never sold. Not now, not ever.
        </p>
      </InfoBlock>

      <InfoBlock title="Cookies">
        <p>
          We use a few cookies to keep the site running smoothly and understand how people use it.
          Nothing creepy. You can opt out anytime through your browser settings.
        </p>
      </InfoBlock>
    </InfoPageLayout>
  );
}
