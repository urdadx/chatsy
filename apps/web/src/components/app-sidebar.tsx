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
  AudioWaveform,
  ChartNoAxesColumnIncreasing,
  Command,
  Flame,
  GalleryVerticalEnd,
  Magnet,
  MessageCircle,
  PaletteIcon,
  Settings2,
  Zap,
} from "lucide-react";
import type * as React from "react";
import { ChatPreview } from "./chat-preview";
import { Logo } from "./logo-image";
import { NavMain } from "./nav-main";
import { Navbar } from "./navbar";
import { UpgradeBanner } from "./upgrade-banner";
import { UserDropdown } from "./user-dropdown";

const data = {
  user: {
    name: "urdadx",
    email: "urdadx@gmail.com",
    avatar: "https://avatars.githubusercontent.com/u/70736338?v=4",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Playground",
      url: "/admin/playground",
      icon: Flame,
    },
    {
      title: "Actions",
      url: "/admin/actions",
      icon: Zap,
    },
    {
      title: "Branding",
      url: "/admin/branding",
      icon: PaletteIcon,
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
      title: "Leads",
      url: "/admin/leads",
      icon: Magnet,
    },

    {
      title: "Settings",
      url: "/admin/settings",
      icon: Settings2,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="offcanvas" {...props}>
        <SidebarHeader>
          <div className="flex gap-2 items-center pb-4">
            <Logo />
            <div className="hidden lg:flex">
              <h1 className="text-xl font-bold instrument-serif-regular-italic">
                maikus
              </h1>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={data.navMain} />
        </SidebarContent>
        <SidebarFooter>
          <UpgradeBanner />
          <UserDropdown user={data.user} />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <Navbar />
        <Outlet />
        <ChatPreview />
      </SidebarInset>
    </SidebarProvider>
  );
}
