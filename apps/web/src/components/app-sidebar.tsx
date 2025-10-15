import { SolarChartBoldDuotone } from "@/assets/icons/bar-duotone";
import { SolarBoltBoldDuotone } from "@/assets/icons/bolt-duotone";
import { SolarBookBoldDuotone } from "@/assets/icons/book-duotone";
import { SolarChatRoundUnreadBoldDuotone } from "@/assets/icons/chat-doutone";
import { SolarSledgehammerBoldDuotone } from "@/assets/icons/hammer-duotone";
import { SolarHomeAngleBoldDuotone } from "@/assets/icons/home-duotone";
import { SolarSettingsBoldDuotone } from "@/assets/icons/settings-duotone";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useSession } from "@/lib/auth-client";
import { Link, Outlet } from "@tanstack/react-router";
import type * as React from "react";
import { NavDropdown } from "./nav-dropdown";
import { Navbar } from "./navbar";
import { UsageBanner } from "./usage-banner";
import { UserDropdown } from "./user-dropdown";
import { ChatbotSwitcher } from "./workspace/chatbot-switcher";

const data = {

  actions: [
    {
      title: " Actions",
      url: "#",
      icon: SolarBoltBoldDuotone,
      items: [
        {
          title: "Agent actions",
          url: "/admin/actions",
        },
        {
          title: "Integrations",
          url: "/admin/integrations",
        },
      ],
    },
  ],
  activity: [
    {
      title: "Activity",
      url: "#",
      icon: SolarChatRoundUnreadBoldDuotone,
      items: [
        {
          title: "Chat Logs",
          url: "/admin/chat-history",
        },
        {
          title: "Leads",
          url: "/admin/activity",
        },
      ],
    },
  ],

};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();

  const user = session?.user;

  return (
    <SidebarProvider>
      <Sidebar variant="floating" className="z-0 bg-slate-25 smooth-div " collapsible="offcanvas" {...props}>
        <SidebarHeader className="pb-2">
          <ChatbotSwitcher />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="pb-0 mb-0 group-data-[collapsible=icon]:hidden">
            <SidebarMenu className="space-y-2">
              <SidebarMenuItem>
                <Link to="/admin/overview">
                  {({ isActive }: any) => {
                    return (
                      <SidebarMenuButton
                        className={
                          isActive
                            ? "!bg-purple-50 dark:!bg-purple-900/30 hover:!bg-purple-100 dark:hover:!bg-purple-900/40"
                            : "hover:bg-purple-50 dark:hover:bg-purple-900/20"
                        }
                        isActive={isActive}
                      >
                        <SolarHomeAngleBoldDuotone
                          color="currentColor"
                          className={`!size-4 ${isActive
                            ? "text-purple-600 dark:text-purple-400"
                            : "text-muted-foreground"
                            }`}
                        />
                        <span>Overview</span>
                      </SidebarMenuButton>
                    );
                  }}
                </Link>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <Link to="/admin/knowledge-base">
                  {({ isActive }: any) => {
                    return (
                      <SidebarMenuButton
                        className={
                          isActive
                            ? "!bg-purple-50 dark:!bg-purple-900/30 hover:!bg-purple-100 dark:hover:!bg-purple-900/40"
                            : "hover:bg-purple-50 dark:hover:bg-purple-900/20"
                        }
                        isActive={isActive}
                      >
                        <SolarBookBoldDuotone
                          color="currentColor"
                          className={`!size-4 ${isActive
                            ? "text-purple-600 dark:text-purple-400"
                            : "text-muted-foreground"
                            }`}
                        />
                        <span>Knowledge Base</span>
                      </SidebarMenuButton>
                    );
                  }}
                </Link>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <Link to="/admin/playground">
                  {({ isActive }: any) => {
                    return (
                      <SidebarMenuButton
                        className={
                          isActive
                            ? "!bg-purple-50 dark:!bg-purple-900/30 hover:!bg-purple-100 dark:hover:!bg-purple-900/40"
                            : "hover:bg-purple-50 dark:hover:bg-purple-900/20"
                        }
                        isActive={isActive}
                      >
                        <SolarSledgehammerBoldDuotone
                          color="currentColor"
                          className={`!size-4 ${isActive
                            ? "text-purple-600 dark:text-purple-400"
                            : "text-muted-foreground"
                            }`}
                        />
                        <span>Playground</span>
                      </SidebarMenuButton>
                    );
                  }}
                </Link>
              </SidebarMenuItem>

              <NavDropdown items={data.actions} />

              <SidebarMenuItem>
                <Link to="/admin/analytics">
                  {({ isActive }: any) => {
                    return (
                      <SidebarMenuButton
                        className={
                          isActive
                            ? "!bg-purple-50 dark:!bg-purple-900/30 hover:!bg-purple-100 dark:hover:!bg-purple-900/40"
                            : "hover:bg-purple-50 dark:hover:bg-purple-900/20"
                        }
                        isActive={isActive}
                      >
                        <SolarChartBoldDuotone
                          color="currentColor"
                          className={`!size-4 ${isActive
                            ? "text-purple-600 dark:text-purple-400"
                            : "text-muted-foreground"
                            }`}
                        />
                        <span>Analytics</span>
                      </SidebarMenuButton>
                    );
                  }}
                </Link>
              </SidebarMenuItem>

              <NavDropdown items={data.activity} />

              <SidebarMenuItem>
                <Link to="/admin/settings">
                  {({ isActive }: any) => {
                    return (
                      <SidebarMenuButton
                        className={
                          isActive
                            ? "!bg-purple-50 dark:!bg-purple-900/30 hover:!bg-purple-100 dark:hover:!bg-purple-900/40"
                            : "hover:bg-purple-50 dark:hover:bg-purple-900/20"
                        }
                        isActive={isActive}
                      >
                        <SolarSettingsBoldDuotone
                          color="currentColor"
                          className={`!size-4 ${isActive
                            ? "text-purple-600 dark:text-purple-400"
                            : "text-muted-foreground"
                            }`}
                        />
                        <span>Settings</span>
                      </SidebarMenuButton>
                    );
                  }}
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
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
