import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Outlet } from "@tanstack/react-router";
import {
  Book,
  ChartNoAxesColumnIncreasing,
  Flame,
  Hammer,
  MessageCircle,
  Settings,
  Zap,
} from "lucide-react";
import type * as React from "react";
import { NavMain } from "./nav-main";
import { Navbar } from "./navbar";
import { UsageBanner } from "./usage-banner";
import { WorkspaceSwitcher } from "./workspace/workspace-switcher";

const data = {
  navMain: [
    {
      title: "Overview",
      url: "/admin/overview",
      icon: Flame,
    },
    {
      title: "Knowlege Base",
      url: "/admin/knowledge-base",
      icon: Book,
    },
    {
      title: "Playground",
      url: "/admin/playground",
      icon: Hammer,
    },

    {
      title: "Actions",
      url: "/admin/actions",
      icon: Zap,
    },

    {
      title: "Analytics",
      url: "/admin/analytics",
      icon: ChartNoAxesColumnIncreasing,
    },
    {
      title: "Chat History",
      url: "/admin/chat-history",
      icon: MessageCircle,
    },
    {
      title: "Settings",
      url: "/admin/settings",
      icon: Settings,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="offcanvas" {...props}>
        <SidebarHeader className="pb-2">
          {/* <div className="flex gap-2 items-center pb-2">
            <Logo />
            <div className="hidden lg:flex">
              <h1 className="text-xl font-bold instrument-serif-regular-italic">
                Padyna
              </h1>
            </div>
          </div> */}
          <WorkspaceSwitcher />
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={data.navMain} />
        </SidebarContent>
        <SidebarFooter>
          <UsageBanner />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <Navbar />
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
