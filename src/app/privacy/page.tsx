import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Privacy Policy — Hooma CRM",
  description: "Privacy Policy for Hooma CRM — learn how we collect, use, and protect your data.",
}

export default function PrivacyPage() {
  return (
    <main className="min-h-dvh bg-background">
      {/* Header */}
      <header className="border-b border-border/40">
        <div className="max-w-3xl mx-auto px-5 py-6 flex items-center justify-between">
          <Link href="/" className="text-xl font-extrabold tracking-tight text-foreground">
            hooma
          </Link>
          <Link
            href="/auth/login"
            className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Content */}
      <article className="max-w-3xl mx-auto px-5 py-12 pb-24">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-muted-foreground mb-10">
          Last updated: March 9, 2026
        </p>

        <div className="space-y-8 text-[15px] leading-relaxed text-foreground/90">
          {/* 1 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Introduction</h2>
            <p>
              HOOMA (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates Hooma CRM (the &quot;Service&quot;). This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you use our Service. We are committed to protecting your privacy and handling your data responsibly.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. Information We Collect</h2>

            <h3 className="text-[15px] font-semibold text-foreground mt-4 mb-2">2.1 Information You Provide</h3>
            <ul className="list-disc pl-6 space-y-1.5">
              <li><strong>Account Information:</strong> Name, email address, and password when you create an account.</li>
              <li><strong>Business Information:</strong> Salon name, address, phone number, and business details.</li>
              <li><strong>Client Data:</strong> Names, contact information, pet details, appointment history, and notes about your clients that you enter into the Service.</li>
              <li><strong>Staff Data:</strong> Staff names, roles, schedules, and contact information.</li>
              <li><strong>Communication Data:</strong> Messages and information you provide when contacting our support team.</li>
            </ul>

            <h3 className="text-[15px] font-semibold text-foreground mt-4 mb-2">2.2 Information Collected Automatically</h3>
            <ul className="list-disc pl-6 space-y-1.5">
              <li><strong>Usage Data:</strong> Pages visited, features used, actions taken, time and date of visits.</li>
              <li><strong>Device Data:</strong> Browser type, operating system, device type, and screen resolution.</li>
              <li><strong>Log Data:</strong> IP address, access times, and referring URLs.</li>
              <li><strong>Cookies &amp; Similar Technologies:</strong> We use essential cookies for authentication and session management. See Section 7 for details.</li>
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. How We Use Your Information</h2>
            <p className="mb-3">We use your information to:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Provide, operate, and maintain the Service.</li>
              <li>Process and manage your bookings, clients, and staff schedules.</li>
              <li>Authenticate your identity and secure your account.</li>
              <li>Send you service-related notifications (e.g., appointment reminders, account alerts).</li>
              <li>Respond to your support inquiries and requests.</li>
              <li>Analyze usage patterns to improve and optimize the Service.</li>
              <li>Detect, prevent, and address technical issues and security threats.</li>
              <li>Comply with legal obligations.</li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Data Sharing &amp; Disclosure</h2>
            <p className="mb-3">
              We do <strong>not</strong> sell your personal data. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li><strong>Service Providers:</strong> Trusted third-party services that help us operate the Service (e.g., cloud hosting via Google Firebase, analytics via Vercel). These providers are contractually obligated to protect your data.</li>
              <li><strong>Legal Requirements:</strong> When required by law, subpoena, court order, or governmental regulation.</li>
              <li><strong>Safety &amp; Protection:</strong> To protect the rights, safety, or property of HOOMA, our users, or the public.</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets, your data may be transferred. We will notify you before your data becomes subject to a different privacy policy.</li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Data Storage &amp; Security</h2>
            <p className="mb-3">
              Your data is stored on secure servers provided by Google Firebase (Google Cloud Platform). We implement industry-standard security measures including:
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Encryption of data in transit (TLS/SSL) and at rest.</li>
              <li>Secure authentication with Firebase Authentication.</li>
              <li>Regular security reviews and monitoring.</li>
              <li>Access controls limiting who within our organization can access your data.</li>
            </ul>
            <p className="mt-3">
              While we take reasonable precautions to protect your data, no method of transmission or storage is 100% secure. We cannot guarantee absolute security.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Data Retention</h2>
            <p>
              We retain your personal data for as long as your account is active or as needed to provide the Service. If you delete your account, we will delete or anonymize your personal data within 30 days, except where we are required to retain it for legal, accounting, or reporting purposes. Client and booking data you entered will be permanently deleted upon account termination unless you export it beforehand.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Cookies &amp; Tracking Technologies</h2>
            <p className="mb-3">We use the following types of cookies:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li><strong>Essential Cookies:</strong> Required for authentication, session management, and core functionality. These cannot be disabled.</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how the Service is used (via Vercel Analytics). These are anonymized and do not track you across other websites.</li>
            </ul>
            <p className="mt-3">
              We do not use advertising or cross-site tracking cookies. You can manage cookies through your browser settings, but disabling essential cookies may affect the functionality of the Service.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. Your Rights</h2>
            <p className="mb-3">Depending on your location, you may have the following rights:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data.</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data.</li>
              <li><strong>Data Portability:</strong> Request your data in a structured, machine-readable format.</li>
              <li><strong>Objection:</strong> Object to certain processing of your personal data.</li>
              <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances.</li>
              <li><strong>Withdraw Consent:</strong> Where processing is based on consent, you may withdraw it at any time.</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, please contact us at{" "}
              <a
                href="mailto:support@hellohooma.app"
                className="text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
              >
                support@hellohooma.app
              </a>
              . We will respond within 30 days.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">9. Children&apos;s Privacy</h2>
            <p>
              The Service is not intended for use by individuals under the age of 18. We do not knowingly collect personal data from children. If we learn that we have collected data from a child under 18, we will take steps to delete it promptly.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">10. International Data Transfers</h2>
            <p>
              Your data may be processed and stored in countries outside your country of residence, including the United States (where Google Cloud servers may be located). We ensure that appropriate safeguards are in place, such as Standard Contractual Clauses or equivalent measures, to protect your data in accordance with this Privacy Policy.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">11. Third-Party Services</h2>
            <p className="mb-3">The Service integrates with the following third-party services:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li><strong>Google Firebase:</strong> Authentication, database, and hosting.</li>
              <li><strong>Vercel:</strong> Hosting and analytics.</li>
              <li><strong>Google Sign-In / Apple Sign-In:</strong> Optional social authentication.</li>
            </ul>
            <p className="mt-3">
              Each of these services has its own privacy policy. We encourage you to review them. We are not responsible for the privacy practices of third-party services.
            </p>
          </section>

          {/* 12 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">12. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy on this page and updating the &quot;Last updated&quot; date. For significant changes, we may also send you an email notification. Your continued use of the Service after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* 13 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">13. Contact Us</h2>
            <p>
              If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:
            </p>
            <div className="mt-3 p-4 rounded-xl bg-muted/50 border border-border/40 text-[14px] space-y-1">
              <p><strong>HOOMA</strong></p>
              <p>
                Email:{" "}
                <a
                  href="mailto:support@hellohooma.app"
                  className="text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
                >
                  support@hellohooma.app
                </a>
              </p>
            </div>
          </section>
        </div>
      </article>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="max-w-3xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-muted-foreground">
            &copy; {new Date().getFullYear()} Hooma. All rights reserved.
          </p>
          <nav className="flex items-center gap-6 text-[13px] text-muted-foreground">
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
          </nav>
        </div>
      </footer>
    </main>
  )
}
