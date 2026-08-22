"use client";

import { gitConfig } from "@/lib/shared";
import Link from "next/link";
import { useEffect, useState, Dispatch, SetStateAction } from "react";

type ServiceCheck = {
  key: ServiceKey;
  name: string;
  desc: string;
  label: string;
  color: string;
  endpoint: string;
};

type UncheckableService = Omit<ServiceCheck, "endpoint">;

const SERVICE_CHECKS: Array<ServiceCheck> = [
  { key: "forgejo", label: "forgejo.service", name: "Git", desc: "Forgejo", color: "var(--cat-peach)", endpoint: "https://git.jelius.dev/api/healthz" },
  { key: "immich", label: "immich.service", name: "Photos", desc: "Immich", color: "var(--cat-green)", endpoint: "https://photos.jelius.dev/api/server/ping" },
  { key: "jellyfin", label: "jellyfin.service", name: "TV", desc: "Jellyfin", color: "var(--cat-mauve)", endpoint: "https://tv.jelius.dev/health" },
  { key: "vaultwarden", label: "vaultwarden.service", name: "Vault", desc: "Bitwarden", color: "var(--cat-yellow)", endpoint: "https://bitwarden.jelius.dev/alive" },
  { key: "edge-cdn", label: "edge-cdn.service", name: "CDN", desc: "Edge network", color: "var(--cat-teal)", endpoint: "https://cdn.jelius.dev/healthz" },
  { key: "portfolio", label: "portfolio.service", name: "Portfolio", desc: "Home page", color: "var(--cat-lavender)", endpoint: "https://jelius.dev/api/healthz" },
  { key: "qbittorrent", label: "qbittorrent.service", name: "qBittorrent", desc: "Seedbox", color: "var(--cat-blue)", endpoint: "https://torrent.jelius.dev" },
  { key: "zaimu", label: "zaimu.service", name: "Zaimu", desc: "Finance", color: "var(--cat-rosewater)", endpoint: "https://zaimu.jelius.dev" },
];

// INFO: web doesn't support raw TCP connection
const UNCHECKABLE_SERVICES: Array<UncheckableService> = [
  { key: "email", label: "email.service", name: "EMail", desc: "IMAP / SMTP", color: "var(--cat-rosewater)" },
]

const CHECK_TIMEOUT_MS = 4000;

async function checkService(entry: typeof SERVICE_CHECKS[number], signal: AbortSignal) {
  try {
    const res = await fetch(entry.endpoint, { signal, cache: "no-store" });
    if (!res.ok) return "fail";
    try {
      const data = await res.json();
      if (typeof data?.ok === "boolean") return data.ok ? "ok" : "fail";
    } catch {
      /* non-JSON 2xx body, treat reachability as OK */
    }
    return "ok";
  } catch {
    return "fail"; // network error, non-2xx thrown, or abort/timeout
  }
}

type OperationalStatus =
  | "degraded"
  | "loading"
  | "operational"

type ServiceKey =
  | "email"
  | "qbittorrent"
  | "forgejo"
  | "immich"
  | "jellyfin"
  | "dovecot"
  | "vaultwarden"
  | "edge-cdn"
  | "portfolio"
  | "zaimu";

type ServiceStatus = "pending" | "ok" | "fail";

type ServiceResults = Partial<Record<ServiceKey, ServiceStatus>>;

function BootLog({ onStatusChange }: { onStatusChange: Dispatch<SetStateAction<OperationalStatus>> }) {
  const [visible, setVisible] = useState(0);
  const [results, setResults] = useState<ServiceResults>({});

  // staggered reveal of each line, unchanged
  useEffect(() => {
    if (visible >= SERVICE_CHECKS.length) return;
    const t = setTimeout(() => setVisible((v) => v + 1), 260);
    return () => clearTimeout(t);
  }, [visible]);

  // fire all health checks once, in parallel, each bounded by a timeout
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);

    Promise.all(
      SERVICE_CHECKS.map(async (entry) => {
        const status = entry.endpoint
          ? await checkService(entry, controller.signal)
          : "skip";
        return [entry.key, status] as const;
      })
    ).then((entries) => {
      setResults(Object.fromEntries(entries) as ServiceResults);
    });

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  // bubble an aggregate status up to whatever owns the state
  useEffect(() => {
    const settled = SERVICE_CHECKS.every((e) => results[e.key] !== undefined);
    if (!settled) {
      onStatusChange("loading");
      return;
    }
    const hasFailure = SERVICE_CHECKS.some((e) => results[e.key] === "fail");
    onStatusChange?.(hasFailure ? "degraded" : "operational");
  }, [results, onStatusChange]);

  return (
    <div className="w-full rounded-lg border border-fd-border bg-fd-card/60 backdrop-blur-sm shadow-2xl shadow-black/40 overflow-hidden">
      <div className="flex items-center gap-1.5 border-b border-fd-border px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-(--cat-red)" />
        <span className="size-2.5 rounded-full bg-(--cat-yellow)" />
        <span className="size-2.5 rounded-full bg-(--cat-green)" />
        <span className="ml-2 font-mono text-xs text-fd-muted-foreground">
          boot.log
        </span>
      </div>
      <div className="px-4 py-4 font-mono text-[13px] leading-relaxed">
        {SERVICE_CHECKS.slice(0, visible).map((entry) => {
          const status = results[entry.key] ?? "pending";
          const { tag, tagColor } =
            status === "ok"
              ? { tag: "OK", tagColor: entry.color }
              : status === "fail"
                ? { tag: "FAIL", tagColor: "var(--cat-red)" }
                : { tag: "...", tagColor: "var(--cat-overlay0)" };

          return (
            <div
              key={entry.key}
              className="flex gap-2 motion-safe:animate-[fadeUp_0.35s_ease_forwards]"
            >
              <span className="shrink-0 tabular-nums" style={{ color: tagColor }}>
                [{tag}]
              </span>
              <span className="text-fd-muted-foreground">
                Status {entry.label}
              </span>
            </div>
          );
        })}
        <div className="flex items-center gap-1.5 pt-1 text-fd-foreground">
          <span className="text-[--cat-mauve]">jelius@infra</span>
          <span className="text-fd-muted-foreground">:~$</span>
          {visible >= SERVICE_CHECKS.length && (
            <span className="inline-block h-3.5 w-7.75 translate-y-px bg-[--cat-mauve] motion-safe:animate-[blink_1s_step-end_infinite]" />
          )}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [systemStatus, setSystemStatus] = useState<OperationalStatus>("loading");

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      {/* ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(50% 40% at 20% 15%, color-mix(in oklab, var(--cat-mauve) 18%, transparent), transparent 70%), radial-gradient(45% 35% at 85% 30%, color-mix(in oklab, var(--cat-blue) 14%, transparent), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-14 px-6 py-24 lg:flex-row lg:items-center lg:gap-20 lg:py-32">
        {/* left: thesis */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-fd-border bg-fd-card px-3 py-1 font-mono text-xs text-fd-muted-foreground motion-safe:animate-[fadeUp_0.5s_ease_forwards]">
            <span className="size-1.5 rounded-full bg-(--cat-green) motion-safe:animate-[pulseDot_2s_ease-in-out_infinite]" />
            {systemStatus === "loading"
              ? "checking systems…"
              : systemStatus === "operational"
                ? "all systems operational"
                : "some systems are degraded"}
          </span>

          <h1 className="text-4xl font-bold tracking-tight text-fd-foreground sm:text-5xl motion-safe:animate-[fadeUp_0.5s_ease_forwards] motion-safe:[animation-delay:80ms] motion-safe:opacity-0">
            jelius<span className="text-fd-muted-foreground">/</span>infra
          </h1>

          <p className="mt-4 text-fd-muted-foreground motion-safe:animate-[fadeUp_0.5s_ease_forwards] motion-safe:[animation-delay:160ms] motion-safe:opacity-0">
            One machine, run like a fleet. Docs for every self-hosted
            service running under this roof — how it"s wired, how it
            fails, and how to bring it back.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 motion-safe:animate-[fadeUp_0.5s_ease_forwards] motion-safe:[animation-delay:240ms] motion-safe:opacity-0 lg:justify-start">
            <Link
              href="/docs"
              className="rounded-md bg-fd-primary px-5 py-2.5 text-sm font-medium text-fd-primary-foreground transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              Explore the docs →
            </Link>

            <a
              href={`${gitConfig.domain}/${gitConfig.user}/${gitConfig.repo}`}
              target="_blank"
              rel="noreferrer noopener"
              className="rounded-md border border-fd-border px-5 py-2.5 text-sm font-medium text-fd-foreground transition-colors hover:bg-fd-accent"
            >
              View source
            </a>
          </div>
        </div>

        {/* right: signature element */}
        <div className="w-full motion-safe:animate-[fadeUp_0.6s_ease_forwards] motion-safe:[animation-delay:120ms] motion-safe:opacity-0">
          <BootLog onStatusChange={setSystemStatus} />
        </div>
      </div>

      {/* service strip */}
      <div className="border-t border-fd-border/60 bg-fd-card/30 py-10">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-3 px-6 sm:grid-cols-4">
          {SERVICE_CHECKS.concat(UNCHECKABLE_SERVICES as any as ServiceCheck).map((s, i) => (
            <div
              key={s.name}
              className="group flex flex-col gap-1 rounded-lg border border-fd-border bg-fd-card px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg motion-safe:animate-[fadeUp_0.4s_ease_forwards] motion-safe:opacity-0"
              style={{
                animationDelay: `${i * 60}ms`,
                boxShadow: "none",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow = `0 8px 24px -8px ${s.color}`)
              }
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
            >
              <div className="flex items-center gap-2">
                <span
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span className="font-mono text-sm font-medium text-fd-foreground">
                  {s.name}
                </span>
              </div>
              <span className="text-xs text-fd-muted-foreground">
                {s.desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
