import type { Metadata } from "next"
import {
  LegalShell,
  LegalSection,
  LegalList,
  LegalEmail,
} from "@/components/legal-shell"

export const metadata: Metadata = {
  title: "Privacy Policy — Hooma CRM",
  description:
    "Privacy Policy for Hooma CRM — learn how we collect, use, and protect your data.",
}

export default function PrivacyPage() {
  return (
    <LegalShell
      title="Privacy Policy"
      lastUpdated="March 9, 2026"
      footerLinks={[
        { href: "/terms", label: "Terms of Service" },
        { href: "/", label: "Home" },
      ]}
    >
      <LegalSection heading="1. Introduction">
        <p>
          Hooma Ltd (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates
          Hooma CRM (the &quot;Service&quot;). This Privacy Policy explains how
          we collect, use, disclose, and protect your personal information when
          you use our Service. We are committed to protecting your privacy and
          handling your data responsibly.
        </p>
      </LegalSection>

      <LegalSection heading="2. Information We Collect">
        <h3 className="text-[15px] font-semibold" style={{ color: "#0A0A1A" }}>
          2.1 Information You Provide
        </h3>
        <LegalList>
          <li>
            <strong>Account Information:</strong> Name, email address, and
            password when you create an account.
          </li>
          <li>
            <strong>Business Information:</strong> Salon name, address, phone
            number, and business details.
          </li>
          <li>
            <strong>Client Data:</strong> Names, contact information, pet
            details, appointment history, and notes about your clients that you
            enter into the Service.
          </li>
          <li>
            <strong>Staff Data:</strong> Staff names, roles, schedules, and
            contact information.
          </li>
          <li>
            <strong>Communication Data:</strong> Messages and information you
            provide when contacting our support team.
          </li>
        </LegalList>

        <h3
          className="text-[15px] font-semibold pt-2"
          style={{ color: "#0A0A1A" }}
        >
          2.2 Information Collected Automatically
        </h3>
        <LegalList>
          <li>
            <strong>Usage Data:</strong> Pages visited, features used, actions
            taken, time and date of visits.
          </li>
          <li>
            <strong>Device Data:</strong> Browser type, operating system, device
            type, and screen resolution.
          </li>
          <li>
            <strong>Log Data:</strong> IP address, access times, and referring
            URLs.
          </li>
          <li>
            <strong>Cookies &amp; Similar Technologies:</strong> We use essential
            cookies for authentication and session management. See Section 7
            for details.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection heading="3. How We Use Your Information">
        <p>We use your information to:</p>
        <LegalList>
          <li>Provide, operate, and maintain the Service.</li>
          <li>Process and manage your bookings, clients, and staff schedules.</li>
          <li>Authenticate your identity and secure your account.</li>
          <li>
            Send you service-related notifications (e.g., appointment reminders,
            account alerts).
          </li>
          <li>Respond to your support inquiries and requests.</li>
          <li>Analyze usage patterns to improve and optimize the Service.</li>
          <li>
            Detect, prevent, and address technical issues and security threats.
          </li>
          <li>Comply with legal obligations.</li>
        </LegalList>
      </LegalSection>

      <LegalSection heading="4. Data Sharing & Disclosure">
        <p>
          We do <strong>not</strong> sell your personal data. We may share your
          information only in the following circumstances:
        </p>
        <LegalList>
          <li>
            <strong>Service Providers:</strong> Trusted third-party services
            that help us operate the Service (e.g., cloud hosting via Google
            Firebase, analytics via Vercel). These providers are contractually
            obligated to protect your data.
          </li>
          <li>
            <strong>Legal Requirements:</strong> When required by law, subpoena,
            court order, or governmental regulation.
          </li>
          <li>
            <strong>Safety &amp; Protection:</strong> To protect the rights,
            safety, or property of Hooma Ltd, our users, or the public.
          </li>
          <li>
            <strong>Business Transfers:</strong> In connection with a merger,
            acquisition, or sale of assets, your data may be transferred. We
            will notify you before your data becomes subject to a different
            privacy policy.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection heading="5. Data Storage & Security">
        <p>
          Your data is stored on secure servers provided by Google Firebase
          (Google Cloud Platform). We implement industry-standard security
          measures including:
        </p>
        <LegalList>
          <li>Encryption of data in transit (TLS/SSL) and at rest.</li>
          <li>Secure authentication with Firebase Authentication.</li>
          <li>Regular security reviews and monitoring.</li>
          <li>
            Access controls limiting who within our organization can access
            your data.
          </li>
        </LegalList>
        <p>
          While we take reasonable precautions to protect your data, no method
          of transmission or storage is 100% secure. We cannot guarantee
          absolute security.
        </p>
      </LegalSection>

      <LegalSection heading="6. Data Retention">
        <p>
          We retain your personal data for as long as your account is active or
          as needed to provide the Service. If you delete your account, we will
          delete or anonymize your personal data within 30 days, except where
          we are required to retain it for legal, accounting, or reporting
          purposes. Client and booking data you entered will be permanently
          deleted upon account termination unless you export it beforehand.
        </p>
      </LegalSection>

      <LegalSection heading="7. Cookies & Tracking Technologies">
        <p>We use the following types of cookies:</p>
        <LegalList>
          <li>
            <strong>Essential Cookies:</strong> Required for authentication,
            session management, and core functionality. These cannot be
            disabled.
          </li>
          <li>
            <strong>Analytics Cookies:</strong> Help us understand how the
            Service is used (via Vercel Analytics). These are anonymized and do
            not track you across other websites.
          </li>
        </LegalList>
        <p>
          We do not use advertising or cross-site tracking cookies. You can
          manage cookies through your browser settings, but disabling essential
          cookies may affect the functionality of the Service.
        </p>
      </LegalSection>

      <LegalSection heading="8. Your Rights">
        <p>
          Depending on your location, you may have the following rights:
        </p>
        <LegalList>
          <li>
            <strong>Access:</strong> Request a copy of the personal data we
            hold about you.
          </li>
          <li>
            <strong>Correction:</strong> Request correction of inaccurate or
            incomplete data.
          </li>
          <li>
            <strong>Deletion:</strong> Request deletion of your personal data.
          </li>
          <li>
            <strong>Data Portability:</strong> Request your data in a
            structured, machine-readable format.
          </li>
          <li>
            <strong>Objection:</strong> Object to certain processing of your
            personal data.
          </li>
          <li>
            <strong>Restriction:</strong> Request restriction of processing in
            certain circumstances.
          </li>
          <li>
            <strong>Withdraw Consent:</strong> Where processing is based on
            consent, you may withdraw it at any time.
          </li>
        </LegalList>
        <p>
          To exercise any of these rights, please contact us at{" "}
          <LegalEmail email="support@hellohooma.app" />. We will respond within
          30 days.
        </p>
      </LegalSection>

      <LegalSection heading="9. Children's Privacy">
        <p>
          The Service is not intended for use by individuals under the age of
          18. We do not knowingly collect personal data from children. If we
          learn that we have collected data from a child under 18, we will take
          steps to delete it promptly.
        </p>
      </LegalSection>

      <LegalSection heading="10. International Data Transfers">
        <p>
          Your data may be processed and stored in countries outside your
          country of residence, including the United States (where Google Cloud
          servers may be located). We ensure that appropriate safeguards are in
          place, such as Standard Contractual Clauses or equivalent measures,
          to protect your data in accordance with this Privacy Policy.
        </p>
      </LegalSection>

      <LegalSection heading="11. Third-Party Services">
        <p>The Service integrates with the following third-party services:</p>
        <LegalList>
          <li>
            <strong>Google Firebase:</strong> Authentication, database, and
            hosting.
          </li>
          <li>
            <strong>Vercel:</strong> Hosting and analytics.
          </li>
          <li>
            <strong>Google Sign-In / Apple Sign-In:</strong> Optional social
            authentication.
          </li>
        </LegalList>
        <p>
          Each of these services has its own privacy policy. We encourage you
          to review them. We are not responsible for the privacy practices of
          third-party services.
        </p>
      </LegalSection>

      <LegalSection heading="12. Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. We will notify
          you of material changes by posting the updated policy on this page
          and updating the &quot;Last updated&quot; date. For significant
          changes, we may also send you an email notification. Your continued
          use of the Service after changes constitutes acceptance of the
          updated policy.
        </p>
      </LegalSection>

      <LegalSection heading="13. Contact Us">
        <p>
          If you have any questions or concerns about this Privacy Policy or
          our data practices, please contact us at:
        </p>
        <div
          className="mt-3 p-4 text-[14px] space-y-1"
          style={{
            background: "#F9FAFB",
            border: "1px solid #F3F4F6",
            borderRadius: 12,
            color: "#374151",
          }}
        >
          <p>
            <strong>Hooma Ltd</strong>
          </p>
          <p>
            Email: <LegalEmail email="support@hellohooma.app" />
          </p>
        </div>
      </LegalSection>
    </LegalShell>
  )
}
