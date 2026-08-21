import { Inter } from "next/font/google";
import { Provider } from "@/components/provider";
import "@/app/global.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "jelius.dev — Docs",
  description: "Documentation on my personal infrastructure setup, configurations, and deployments",
  icons: {
    icon: "https://cdn.jelius.dev/compressed/jelius.webp",
    apple: "https://cdn.jelius.dev/compressed/jelius.webp",
    shortcut: "https://cdn.jelius.dev/compressed/jelius.webp",
  },
};

const inter = Inter({
  subsets: ["latin"],
});

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
