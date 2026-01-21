"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import Logo from "@/components/common/Logo";
import { useCacheClear } from "@/hooks/use-cache-clear";

export default function Footer() {
  const { clear_cache, is_clearing } = useCacheClear();

  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="mb-4">
              <Logo size="lg" href="/" />
            </div>
            <p className="text-muted-foreground text-sm max-w-md font-inter">
              Stay informed with news from popular newspapers, summarized in
              just 60 words. Quick, accurate, and reliable news summaries for
              busy readers.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-4 font-inter">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground font-inter">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-primary transition-colors"
                >
                  About
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-4 font-inter">
              Account
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground font-inter">
              <li>
                <Link
                  href="/auth/login"
                  className="hover:text-primary transition-colors"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href="/settings"
                  className="hover:text-primary transition-colors"
                >
                  Settings
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-primary transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <button
                  onClick={clear_cache}
                  disabled={is_clearing}
                  className="hover:text-primary transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <Trash2 className="size-3" />
                  {is_clearing ? "Clearing..." : "Clear Cache"}
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground font-inter">
          <p>&copy; 2026 Briefly60. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
