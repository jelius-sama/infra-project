"use client";

import { buttonVariants } from "fumadocs-ui/components/ui/button";
import { cn } from "@/lib/cn";
import { ForgejoIcon } from "@/components/forgejo-icon";

export function ViewOnGit({ githubUrl }: { githubUrl: string }) {
  return (
    <a
      href={githubUrl}
      target="_blank"
      rel="noreferrer noopener"
      className={
        cn(
          buttonVariants({ color: "secondary", size: "sm" }),
          "gap-1.5 text-fd-muted-foreground",
        )
      }
    >
      <ForgejoIcon className="size-3.5" />
      View on Git
    </a>
  );
}
