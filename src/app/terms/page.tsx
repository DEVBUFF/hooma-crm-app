import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Terms of Service — Hooma CRM",
  description: "Terms of Service for Hooma CRM — the free CRM for grooming salons.",
}

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p className="text-sm text-muted-foreground mb-10">
          Last updated: March 9, 2026
        </p>

        <div className="space-y-8 text-[15px] leading-relaxed text-foreground/90">
          {/* 1 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Hooma CRM (the &quot;Service&quot;), operated by HOOMA (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree with any part of these Terms, you may not use the Service.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. Description of Service</h2>
            <p>
              Hooma CRM is a cloud-based customer relationship management platform designed for grooming salons and pet care businesses. The Service provides tools for appointment scheduling, client management, staff coordination, and business analytics. We offer the Service on a free tier with optional paid plans in the future.
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. Account Registration</h2>
            <p className="mb-3">
              To use the Service, you must create an account by providing accurate and complete information. You are responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Maintaining the confidentiality of your account credentials.</li>
              <li>All activities that occur under your account.</li>
              <li>Notifying us immediately of any unauthorized use of your account.</li>
            </ul>
            <p className="mt-3">
              You must be at least 18 years old or the age of legal majority in your jurisdiction to create an account.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Acceptable Use</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Use the Service for any unlawful purpose or in violation of any applicable laws.</li>
              <li>Attempt to gain unauthorized access to any part of the Service or its related systems.</li>
              <li>Interfere with or disrupt the integrity or performance of the Service.</li>
              <li>Upload or transmit viruses, malware, or any harmful code.</li>
              <li>Use the Service to send unsolicited messages (spam).</li>
              <li>Reproduce, duplicate, sell, or resell any part of the Service without our express written permission.</li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Your Data</h2>
            <p>
              You retain all rights to the data you submit to the Service (&quot;Your Data&quot;). By using the Service, you grant us a limited license to store, process, and display Your Data solely for the purpose of providing and improving the Service. We will not sell Your Data to third parties. Please refer to our{" "}
              <Link href="/privacy" className="text-primary underline underline-offset-2 hover:opacity-80 transition-opacity">
                Privacy Policy
              </Link>{" "}
              for details on how we handle your information.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are owned by HOOMA and are protected by international copyright, trademark, and other intellectual property laws. Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Service Availability</h2>
            <p>
              We strive to keep the Service available 24/7, but we do not guarantee uninterrupted access. The Service may be temporarily unavailable due to maintenance, updates, or factors beyond our control. We reserve the right to modify, suspend, or discontinue the Service (or any part of it) at any time, with or without notice.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, HOOMA shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or business opportunities, arising out of or in connection with your use of the Service. Our total liability for any claim arising from or relating to the Service shall not exceed the amount you paid us in the 12 months prior to the claim, or $100, whichever is greater.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">9. Disclaimer of Warranties</h2>
            <p>
              The Service is provided &quot;as is&quot; and &quot;as available&quot; without any warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the Service will be error-free, secure, or uninterrupted.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">10. Termination</h2>
            <p>
              We may terminate or suspend your account and access to the Service at our sole discretion, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties. Upon termination, your right to use the Service will immediately cease. You may request a copy of Your Data within 30 days of account termination.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">11. Changes to Terms</h2>
            <p>
              We reserve the right to update or modify these Terms at any time. We will notify you of material changes by posting the updated Terms on this page and updating the &quot;Last updated&quot; date. Your continued use of the Service after any changes constitutes acceptance of the new Terms.
            </p>
          </section>

          {/* 12 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">12. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which HOOMA is established, without regard to conflict of law principles. Any disputes arising from these Terms shall be resolved in the competent courts of that jurisdiction.
            </p>
          </section>

          {/* 13 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">13. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at{" "}
              <a
                href="mailto:support@hellohooma.app"
                className="text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
              >
                support@hellohooma.app
              </a>
              .
            </p>
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
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
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
