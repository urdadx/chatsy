import { Toaster } from "@/components/ui/sonner";

import { seo } from "@/lib/seo";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import appCss from "../index.css?url";

export type RouterAppContext = {
  queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RouterAppContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Chatsy",
      },
      ...seo({
        title: "Chatsy - An AI agent for content creators",
        description: "Create a custom AI agent for your link in bio",
        keywords: "AI, bot, link in bio, custom bot, chatsy",
        image: "https://chatsy.app/og-image.png",
      }),
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),

  component: RootDocument,
});

function RootDocument() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="grid h-svh grid-rows-[auto_1fr]">
          <TooltipProvider>
            <Outlet />
          </TooltipProvider>
        </div>
        <Toaster richColors />
        {/* <ReactQueryDevtools position="left" initialIsOpen={false} /> */}
        <Scripts />
      </body>
    </html>
  );
}
