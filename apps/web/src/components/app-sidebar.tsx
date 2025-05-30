import {
  AudioWaveform,
  ChartNoAxesColumnIncreasing,
  Command,
  Flame,
  GalleryVerticalEnd,
  Magnet,
  PaletteIcon,
  Settings2,
  Zap,
} from "lucide-react";
import type * as React from "react";

import LOGO from "@/assets/violet-icon.png";
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
import { useLocation } from "@tanstack/react-router";
import { ChatPreview } from "./chat-preview";
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
  const location = useLocation({
    select: (location) => location.pathname,
  });

  const isBrandingPage = location.startsWith("/admin/branding");
  const isPlaygroundPage = location.startsWith("/admin/playground");

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <div className="flex gap-2 items-center pb-4">
            <img src={LOGO} alt="logo" className="w-[40px] h-[40px]" />{" "}
            <div className="hidden lg:flex">
              <h1 className="text-xl font-bold instrument-serif-regular-italic">
                Chatsy
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
        <div className="flex flex-row h-full">
          <Outlet />
          <ChatPreview />
          {/* {(isPlaygroundPage || isBrandingPage) && <ChatPreview />} */}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
