import { SolarChartBoldDuotone } from "@/assets/icons/bar-duotone";
import { SolarBoltBoldDuotone } from "@/assets/icons/bolt-duotone";
import { SolarBookBoldDuotone } from "@/assets/icons/book-duotone";
import { SolarChatRoundUnreadBoldDuotone } from "@/assets/icons/chat-doutone";
import { SolarChecklistMinimalisticBoldDuotone } from "@/assets/icons/checklist-duotone";
import { SolarSledgehammerBoldDuotone } from "@/assets/icons/hammer-duotone";
import { SolarHomeAngleBoldDuotone } from "@/assets/icons/home-duotone";
import { SolarSettingsBoldDuotone } from "@/assets/icons/settings-duotone";
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
import { Outlet } from "@tanstack/react-router";
import type * as React from "react";
import { NavMain } from "./nav-main";
import { Navbar } from "./navbar";
import { UsageBanner } from "./usage-banner";
import { UserDropdown } from "./user-dropdown";
import { ChatbotSwitcher } from "./workspace/chatbot-switcher";

const data = {
  navMain: [
    {
      title: "Overview",
      url: "/admin/overview",
      icon: SolarHomeAngleBoldDuotone,
    },
    {
      title: "Knowledge Base",
      url: "/admin/knowledge-base",
      icon: SolarBookBoldDuotone,
    },
    {
      title: "Playground",
      url: "/admin/playground",
      icon: SolarSledgehammerBoldDuotone,
    },

    {
      title: "Actions",
      url: "/admin/actions",
      icon: SolarBoltBoldDuotone,
    },

    {
      title: "Analytics",
      url: "/admin/analytics",
      icon: SolarChartBoldDuotone,
    },
    {
      title: "Chat History",
      url: "/admin/chat-history",
      icon: SolarChatRoundUnreadBoldDuotone,
    },
    {
      title: "Activity",
      url: "/admin/activity",
      icon: SolarChecklistMinimalisticBoldDuotone,
    },
    {
      title: "Settings",
      url: "/admin/settings",
      icon: SolarSettingsBoldDuotone,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();

  const user = session?.user;

  return (
    <SidebarProvider>
      <Sidebar variant="floating" className="z-0 bg-slate-25 " collapsible="offcanvas" {...props}>
        <SidebarHeader className="pb-2">
          {/* <div className="flex gap-2 items-center pb-2">
            <Logo />
            <div className="hidden lg:flex">
              <h1 className="text-xl font-bold instrument-serif-regular-italic">
                Padyna
              </h1>
            </div>
          </div> */}
          <ChatbotSwitcher />
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={data.navMain} />
        </SidebarContent>
        <SidebarFooter>
          <UsageBanner />
          <UserDropdown user={user} />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="bg-white">
        <Navbar />
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
