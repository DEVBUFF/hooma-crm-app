import type { Metadata } from "next"
import {
  LegalShell,
  LegalSection,
  LegalList,
  LegalLink,
  LegalEmail,
} from "@/components/legal-shell"

export const metadata: Metadata = {
  title: "Terms of Service — Hooma CRM",
  description: "Terms of Service for Hooma CRM — the free CRM for grooming salons.",
}

export default function TermsPage() {
  return (
    <LegalShell
      title="Terms of Service"
      lastUpdated="March 9, 2026"
      footerLinks={[
        { href: "/privacy", label: "Privacy Policy" },
        { href: "/", label: "Home" },
      ]}
    >
      <LegalSection heading="1. Acceptance of Terms">
        <p>
          By accessing or using Hooma CRM (the &quot;Service&quot;), operated by
          Hooma Ltd (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), you agree
          to be bound by these Terms of Service (&quot;Terms&quot;). If you do
          not agree with any part of these Terms, you may not use the Service.
        </p>
      </LegalSection>

      <LegalSection heading="2. Description of Service">
        <p>
          Hooma CRM is a cloud-based customer relationship management platform
          designed for grooming salons and pet care businesses. The Service
          provides tools for appointment scheduling, client management, staff
          coordination, and business analytics. We offer the Service on a free
          tier with optional paid plans in the future.
        </p>
      </LegalSection>

      <LegalSection heading="3. Account Registration">
        <p>
          To use the Service, you must create an account by providing accurate
          and complete information. You are responsible for:
        </p>
        <LegalList>
          <li>Maintaining the confidentiality of your account credentials.</li>
          <li>All activities that occur under your account.</li>
          <li>
            Notifying us immediately of any unauthorized use of your account.
          </li>
        </LegalList>
        <p>
          You must be at least 18 years old or the age of legal majority in
          your jurisdiction to create an account.
        </p>
      </LegalSection>

      <LegalSection heading="4. Acceptable Use">
        <p>You agree not to:</p>
        <LegalList>
          <li>
            Use the Service for any unlawful purpose or in violation of any
            applicable laws.
          </li>
          <li>
            Attempt to gain unauthorized access to any part of the Service or
            its related systems.
          </li>
          <li>
            Interfere with or disrupt the integrity or performance of the
            Service.
          </li>
          <li>Upload or transmit viruses, malware, or any harmful code.</li>
          <li>Use the Service to send unsolicited messages (spam).</li>
          <li>
            Reproduce, duplicate, sell, or resell any part of the Service
            without our express written permission.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection heading="5. Your Data">
        <p>
          You retain all rights to the data you submit to the Service
          (&quot;Your Data&quot;). By using the Service, you grant us a limited
          license to store, process, and display Your Data solely for the
          purpose of providing and improving the Service. We will not sell Your
          Data to third parties. Please refer to our{" "}
          <LegalLink href="/privacy">Privacy Policy</LegalLink> for details on
          how we handle your information.
        </p>
      </LegalSection>

      <LegalSection heading="6. Intellectual Property">
        <p>
          The Service and its original content, features, and functionality are
          owned by Hooma Ltd and are protected by international copyright,
          trademark, and other intellectual property laws. Our trademarks and
          trade dress may not be used in connection with any product or service
          without our prior written consent.
        </p>
      </LegalSection>

      <LegalSection heading="7. Service Availability">
        <p>
          We strive to keep the Service available 24/7, but we do not guarantee
          uninterrupted access. The Service may be temporarily unavailable due
          to maintenance, updates, or factors beyond our control. We reserve
          the right to modify, suspend, or discontinue the Service (or any part
          of it) at any time, with or without notice.
        </p>
      </LegalSection>

      <LegalSection heading="8. Limitation of Liability">
        <p>
          To the maximum extent permitted by law, Hooma Ltd shall not be liable for
          any indirect, incidental, special, consequential, or punitive damages,
          including but not limited to loss of profits, data, or business
          opportunities, arising out of or in connection with your use of the
          Service. Our total liability for any claim arising from or relating
          to the Service shall not exceed the amount you paid us in the 12
          months prior to the claim, or $100, whichever is greater.
        </p>
      </LegalSection>

      <LegalSection heading="9. Disclaimer of Warranties">
        <p>
          The Service is provided &quot;as is&quot; and &quot;as available&quot;
          without any warranties of any kind, either express or implied,
          including but not limited to implied warranties of merchantability,
          fitness for a particular purpose, and non-infringement. We do not
          warrant that the Service will be error-free, secure, or uninterrupted.
        </p>
      </LegalSection>

      <LegalSection heading="10. Termination">
        <p>
          We may terminate or suspend your account and access to the Service at
          our sole discretion, without prior notice, for conduct that we
          believe violates these Terms or is harmful to other users, us, or
          third parties. Upon termination, your right to use the Service will
          immediately cease. You may request a copy of Your Data within 30 days
          of account termination.
        </p>
      </LegalSection>

      <LegalSection heading="11. Changes to Terms">
        <p>
          We reserve the right to update or modify these Terms at any time. We
          will notify you of material changes by posting the updated Terms on
          this page and updating the &quot;Last updated&quot; date. Your
          continued use of the Service after any changes constitutes acceptance
          of the new Terms.
        </p>
      </LegalSection>

      <LegalSection heading="12. Governing Law">
        <p>
          These Terms shall be governed by and construed in accordance with the
          laws of the jurisdiction in which Hooma Ltd is established, without
          regard to conflict of law principles. Any disputes arising from these
          Terms shall be resolved in the competent courts of that jurisdiction.
        </p>
      </LegalSection>

      <LegalSection heading="13. Contact Us">
        <p>
          If you have any questions about these Terms, please contact us at{" "}
          <LegalEmail email="support@hellohooma.app" />.
        </p>
      </LegalSection>
    </LegalShell>
  )
}
