import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageHeader } from "@/components/ui/PageHeader";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Privacy Policy",
  description: "Privacy information for the Gaoshuo Steel Wire Rope website and inquiry interface.",
  path: "/privacy-policy"
});

export default function PrivacyPolicyPage() {
  return (
    <>
      <div className="container"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]} /></div>
      <PageHeader eyebrow="Website information" title="Privacy Policy" description="How information entered into this website is handled during the current staging phase." />
      <section className="section">
        <div className="container prose">
          <h2>Current inquiry status</h2>
          <p>The online inquiry interface is currently a user-interface preview. It does not transmit form information to email, a database, a CRM or another external service.</p>
          <h2>Technical operation</h2>
          <p>The website may process standard technical request data required to deliver pages and static assets. No analytics or advertising integration is configured by this rebuild.</p>
          <h2>Future updates</h2>
          <p>This policy should be updated before an official inquiry delivery channel, analytics service or additional data-processing integration is enabled.</p>
        </div>
      </section>
    </>
  );
}
