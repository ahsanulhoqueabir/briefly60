import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions - Briefly60",
  description: "Read the terms and conditions for using Briefly60 service.",
};

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Terms & Conditions
          </h1>
          <p className="text-muted-foreground">
            Last updated: January 21, 2026
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Agreement to Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using Briefly60, you accept and agree to be bound
              by the terms and provisions of this agreement. If you do not agree
              to these terms, please do not use our service. These terms apply
              to all visitors, users, and others who access or use the service.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Use of Service
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium text-foreground mb-2">
                  Eligibility
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  You must be at least 13 years old to use Briefly60. By using
                  this service, you represent and warrant that you meet this age
                  requirement and have the legal capacity to enter into these
                  terms.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-medium text-foreground mb-2">
                  Account Registration
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-2">
                  To access certain features, you must register for an account.
                  You agree to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your password</li>
                  <li>
                    Accept responsibility for all activities under your account
                  </li>
                  <li>Notify us immediately of any unauthorized access</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-medium text-foreground mb-2">
                  Acceptable Use
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-2">
                  You agree not to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Use the service for any illegal purpose</li>
                  <li>
                    Attempt to gain unauthorized access to any part of the
                    service
                  </li>
                  <li>Interfere with or disrupt the service or servers</li>
                  <li>Share your account credentials with others</li>
                  <li>
                    Use automated systems to access the service without
                    permission
                  </li>
                  <li>
                    Reproduce, distribute, or copy any content without
                    authorization
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Subscriptions and Payments
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium text-foreground mb-2">
                  Subscription Plans
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Briefly60 offers both free and premium subscription plans.
                  Premium features are available through monthly or yearly
                  subscriptions. By subscribing, you agree to pay the fees
                  associated with your chosen plan.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-medium text-foreground mb-2">
                  Billing and Renewal
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Subscriptions automatically renew at the end of each billing
                  period unless you cancel before the renewal date. You will be
                  charged using your selected payment method. We reserve the
                  right to change subscription fees with reasonable notice.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-medium text-foreground mb-2">
                  Refund Policy
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Refunds are provided at our discretion and subject to our
                  refund policy. Generally, subscription fees are non-refundable
                  except as required by law or as explicitly stated in our
                  refund policy.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-medium text-foreground mb-2">
                  Cancellation
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  You may cancel your subscription at any time through your
                  account settings. Upon cancellation, you will continue to have
                  access to premium features until the end of your current
                  billing period.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Intellectual Property
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium text-foreground mb-2">
                  Content Ownership
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  All content on Briefly60, including text, graphics, logos,
                  images, and software, is the property of Briefly60 or its
                  content suppliers and is protected by intellectual property
                  laws. You may not use, copy, or distribute any content without
                  our express written permission.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-medium text-foreground mb-2">
                  User Content
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Any content you submit, such as comments or feedback, remains
                  your property. However, by submitting content, you grant us a
                  worldwide, non-exclusive, royalty-free license to use,
                  reproduce, and display such content in connection with the
                  service.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Content and Services
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Briefly60 curates and provides summaries of news articles from
              various sources. We strive for accuracy but do not guarantee the
              completeness or reliability of any content. The service is
              provided &quot;as is&quot; without warranties of any kind.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                We may modify or discontinue any part of the service at any time
              </li>
              <li>We do not guarantee uninterrupted or error-free service</li>
              <li>
                Content availability may vary based on your subscription level
              </li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Disclaimer of Warranties
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              THE SERVICE IS PROVIDED ON AN &#34;AS IS&ldquo; AND &ldquo;AS
              AVAILABLE&quot; BASIS. BRIEFLY60 MAKES NO WARRANTIES, EXPRESSED OR
              IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
              PARTICULAR PURPOSE, OR NON-INFRINGEMENT. WE DO NOT WARRANT THAT
              THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Limitation of Liability
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, BRIEFLY60 SHALL NOT BE
              LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
              PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER
              INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, OR
              OTHER INTANGIBLE LOSSES.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Indemnification
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to indemnify and hold harmless Briefly60 and its
              affiliates, officers, agents, and employees from any claim or
              demand, including reasonable attorneys&apos; fees, made by any
              third party due to or arising out of your breach of these terms or
              your violation of any law or the rights of a third party.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Termination
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We may terminate or suspend your account and access to the service
              immediately, without prior notice or liability, for any reason,
              including breach of these terms. Upon termination, your right to
              use the service will immediately cease. All provisions of the
              terms which by their nature should survive termination shall
              survive.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Governing Law
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              These terms shall be governed by and construed in accordance with
              the laws of the jurisdiction in which Briefly60 operates, without
              regard to its conflict of law provisions. Any disputes arising
              from these terms or your use of the service shall be resolved in
              the courts of that jurisdiction.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Changes to Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify or replace these terms at any time.
              If a revision is material, we will provide at least 30 days&lsquo;
              notice prior to any new terms taking effect. What constitutes a
              material change will be determined at our sole discretion. By
              continuing to access or use our service after revisions become
              effective, you agree to be bound by the revised terms.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Contact Information
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these terms, please contact us:
            </p>
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-muted-foreground">
                <strong className="text-foreground">Email:</strong>{" "}
                support@briefly60.com
              </p>
            </div>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-wrap gap-6 text-sm">
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/about"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              About Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
