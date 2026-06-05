import { InfoBlock, InfoCallout, InfoPageLayout, InfoTable } from "@/components/info/InfoPageLayout";

export const metadata = {
  title: "Terms & Conditions | OATCLUB",
  description: "OATCLUB website and shopping terms.",
};

export default function TermsAndConditionsPage() {
  return (
    <InfoPageLayout
      activePath="/terms-and-conditions"
      title="Terms & Conditions"
      intro="By shopping at OATCLUB, you agree to these terms. We know no one loves this page, so we kept it real."
      aside={
        <InfoCallout
          label="QUESTIONS?"
          title="NO DRAMA SUPPORT"
          body="For the full legal version or any questions, reach us at hey@oatclub.in."
          action={{ href: "mailto:hey@oatclub.in", label: "EMAIL OATCLUB" }}
        />
      }
    >
      <InfoTable
        rows={[
          ["Site Use", "No illegal, harmful, shady, or abusive activity"],
          ["Pricing", "Prices and stock can change"],
          ["Content", "Photos, copy, and branding belong to OATCLUB"],
          ["Updates", "Terms may be updated when needed"],
        ]}
      />

      <InfoBlock title="Using The Site">
        <p>
          Do not do anything illegal, harmful, or shady on our site. This includes copying our
          content, attempting to hack us, or impersonating OATCLUB. Come on, be normal.
        </p>
      </InfoBlock>

      <InfoBlock title="Pricing & Availability">
        <p>
          Prices and stock can change. If an item is out of stock after you have ordered, we will
          let you know and offer a refund or alternative.
        </p>
      </InfoBlock>

      <InfoBlock title="Our Content">
        <p>
          All photos, copy, and branding belong to OATCLUB. Do not use them without asking us
          first.
        </p>
      </InfoBlock>

      <InfoBlock title="Policy Updates">
        <p>
          We reserve the right to update these terms when needed. We will let you know if anything
          major changes.
        </p>
      </InfoBlock>
    </InfoPageLayout>
  );
}
