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
        title: "Padyna",
      },
      ...seo({
        title: "Padyna - Automate your customer support",
        description: "Create a custom AI agent for your data",
        keywords:
          "AI, bot, link in bio, custom bot, padyna, customer support, chatbot",
        image: "https://padyna.app/og-image.png",
      }),
    ],
    links: [
      {
        rel: "preload",
        href: appCss,
        as: "style",
      },
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
      <body suppressHydrationWarning>
        <div className="">
          <TooltipProvider>
            <Outlet />
          </TooltipProvider>
        </div>
        <Toaster richColors theme="light" />

        <Scripts />
        {/* <ReactQueryDevtools
          buttonPosition="bottom-left"
          position="left"
          initialIsOpen={false}
        /> */}
      </body>
    </html>
  );
}
