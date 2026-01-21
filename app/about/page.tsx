import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us - Briefly60",
  description:
    "Learn more about Briefly60 - Your trusted source for concise, accurate news summaries.",
};

export default function AboutPage() {
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
            About Briefly60
          </h1>
          <p className="text-xl text-muted-foreground">
            Stay informed in 60 seconds or less
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Our Mission
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              In today&apos;s fast-paced world, staying informed shouldn&apos;t
              take hours of your day. Briefly60 is dedicated to delivering the
              most important news stories in concise, easy-to-digest summaries.
              We believe that everyone deserves access to quality journalism
              without sacrificing their precious time.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              What We Do
            </h2>
            <div className="space-y-6">
              <div className="p-6 bg-muted/50 rounded-lg">
                <h3 className="text-xl font-medium text-foreground mb-3">
                  📰 Curated News Summaries
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  We carefully select and summarize news from trusted sources
                  across various categories including politics, technology,
                  business, sports, entertainment, and more. Each summary is
                  crafted to give you the essential information in just 60
                  seconds.
                </p>
              </div>

              <div className="p-6 bg-muted/50 rounded-lg">
                <h3 className="text-xl font-medium text-foreground mb-3">
                  🎯 Personalized Experience
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Customize your news feed based on your interests. Bookmark
                  articles to read later, track your reading history, and
                  discover content tailored to your preferences. Our platform
                  learns what matters most to you.
                </p>
              </div>

              <div className="p-6 bg-muted/50 rounded-lg">
                <h3 className="text-xl font-medium text-foreground mb-3">
                  🧠 Interactive Learning
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Test your knowledge with our interactive quizzes after reading
                  articles. Track your progress, see your quiz history, and
                  enhance your understanding of current events while staying
                  engaged.
                </p>
              </div>

              <div className="p-6 bg-muted/50 rounded-lg">
                <h3 className="text-xl font-medium text-foreground mb-3">
                  📱 Multi-Platform Access
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Access Briefly60 from any device - desktop, tablet, or mobile.
                  Our responsive design ensures a seamless reading experience
                  wherever you are. Even read offline with our progressive web
                  app capabilities.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Why Choose Briefly60?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  ⚡ Save Time
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Get the news that matters in 60 seconds or less. No more
                  scrolling through lengthy articles or multiple sources.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  ✅ Quality Content
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  We source news from reputable outlets and ensure accuracy in
                  every summary we publish.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  🎨 Clean Interface
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Enjoy a distraction-free reading experience with our elegant,
                  minimalist design.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  🔒 Privacy First
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Your data privacy is our priority. We&apos;re committed to
                  protecting your information.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  🌍 Diverse Coverage
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Access news from around the world covering topics that matter
                  to you.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  💡 Stay Informed
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Never miss important updates with our comprehensive yet
                  concise coverage.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Our Values
            </h2>
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <h3 className="text-lg font-medium text-foreground mb-1">
                  Accuracy
                </h3>
                <p className="text-muted-foreground">
                  We prioritize factual reporting and verify information from
                  trusted sources.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="text-lg font-medium text-foreground mb-1">
                  Clarity
                </h3>
                <p className="text-muted-foreground">
                  Complex stories made simple without losing essential context
                  or nuance.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="text-lg font-medium text-foreground mb-1">
                  Impartiality
                </h3>
                <p className="text-muted-foreground">
                  We present news objectively, allowing you to form your own
                  informed opinions.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="text-lg font-medium text-foreground mb-1">
                  Accessibility
                </h3>
                <p className="text-muted-foreground">
                  Quality journalism should be available to everyone, regardless
                  of time constraints.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Join Our Community
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Briefly60 is more than just a news platform - it&apos;s a
              community of informed readers who value their time and want to
              stay connected with the world around them. Join thousands of users
              who trust Briefly60 for their daily news.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                Get Started Free
              </Link>
              <Link
                href="/subscription"
                className="inline-flex items-center justify-center px-6 py-3 bg-muted text-foreground font-medium rounded-lg hover:bg-muted/80 transition-colors"
              >
                View Premium Plans
              </Link>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Contact Us
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Have questions, suggestions, or feedback? We&apos;d love to hear
              from you!
            </p>
            <div className="p-6 bg-muted/50 rounded-lg space-y-3">
              <p className="text-muted-foreground">
                <strong className="text-foreground">General Inquiries:</strong>{" "}
                hello@briefly60.com
              </p>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Support:</strong>{" "}
                support@briefly60.com
              </p>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Business:</strong>{" "}
                business@briefly60.com
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
              href="/terms"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
