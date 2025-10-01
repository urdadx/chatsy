import { RetrainingBannerProvider } from "@/components/retraining-banner";
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

const isDevelopment = import.meta.env.VITE_NODE_ENV === "development";

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
        title: "Padyna - AI agents for your business",
        description:
          "Magical customer experiences for your business. Create a custom AI agent for your business in minutes.",
        keywords:
          "AI, bot, link in bio, custom bot, padyna, customer support, chatbot",
        image: "https://padyna.com/og.png",
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

    scripts: isDevelopment
      ? []
      : [
        {
          src: "https://analytics.padyna.com/script.js",
          "data-website-id": "920f52b8-678e-4f8c-9317-0407d2376480",
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
        <RetrainingBannerProvider>
          <div className="">
            <TooltipProvider>
              <Outlet />
            </TooltipProvider>
          </div>
          <Toaster richColors theme="light" />
        </RetrainingBannerProvider>
        <Scripts />
        {isDevelopment && <ReactQueryDevtools position="left" initialIsOpen={false} />}
      </body>
    </html>
  );
}
