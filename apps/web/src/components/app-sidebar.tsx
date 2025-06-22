import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useSession } from "@/lib/auth-client";
import { getUser } from "@/lib/auth-utils";
import { Outlet } from "@tanstack/react-router";
import {
  ChartNoAxesColumnIncreasing,
  Flame,
  LayoutDashboard,
  MessageCircle,
  PaletteIcon,
  Users,
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
      icon: Users,
    },

    {
      title: "Integrations",
      url: "/admin/integrations",
      icon: LayoutDashboard,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();

  const user = session?.user;
  console.log(user?.name, user?.email, user?.image);
  return (
    <SidebarProvider>
      <Sidebar collapsible="offcanvas" {...props}>
        <SidebarHeader>
          <div className="flex gap-2 items-center pb-4">
            <Logo />
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
          <UserDropdown user={user} />
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
