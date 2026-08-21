import Link from "next/link";

export default function NotFound() {

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(45% 35% at 50% 50%, color-mix(in oklab, var(--cat-red) 14%, transparent), transparent 70%)",
        }}
      />

      <h1 className="text-5xl font-bold tracking-tight text-fd-foreground sm:text-6xl motion-safe:animate-[fadeUp_0.4s_ease_forwards] motion-safe:[animation-delay:60ms] motion-safe:opacity-0">
        404
      </h1>
      <p className="mt-3 text-fd-muted-foreground motion-safe:animate-[fadeUp_0.4s_ease_forwards] motion-safe:[animation-delay:120ms] motion-safe:opacity-0">
        This page could not be found.
      </p>

      <Link
        href="/docs"
        className="mt-8 rounded-md bg-fd-primary px-5 py-2.5 text-sm font-medium text-fd-primary-foreground transition-transform hover:scale-[1.03] active:scale-[0.98] motion-safe:animate-[fadeUp_0.4s_ease_forwards] motion-safe:[animation-delay:240ms] motion-safe:opacity-0"
      >
        Return to docs →
      </Link>
    </div>
  );
}
