import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="text-center">
        {/* 404 Number with gradient */}
        <h1 className="mb-4 text-[120px] font-black-ops-one leading-none text-primary sm:text-[180px]">
          404
        </h1>

        {/* Main Message */}
        <h2 className="mb-3 text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
          Page Not Found
        </h2>

        {/* Description */}
        <p className="mb-8 max-w-md text-base text-muted-foreground sm:text-lg">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Back to Home
          </Link>

          <Link
            href="/preferences"
            className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-6 py-3 font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Browse News
          </Link>
        </div>
      </div>
    </div>
  );
}
