import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { appName, gitConfig } from "@/lib/shared";
import { ForgejoIcon } from "@/components/forgejo-icon";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      // JSX supported
      title: appName,
    },
    links: [
      {
        type: "icon",
        text: "Forgejo",
        icon: <ForgejoIcon />,
        url: `${gitConfig.domain}/${gitConfig.user}/${gitConfig.repo}`,
      },
    ],
  };
}
