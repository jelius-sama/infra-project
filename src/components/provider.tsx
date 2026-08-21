"use client";
import SearchDialog from "@/components/search";
import { RootProvider } from "fumadocs-ui/provider/next";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";

export function Provider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return <RootProvider search={{ SearchDialog }}>{children}</RootProvider>;
}
