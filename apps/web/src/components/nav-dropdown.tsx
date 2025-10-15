import { ChevronRight, type LucideIcon } from "lucide-react";
import type React from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Link } from "@tanstack/react-router";

export function NavDropdown({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon | ((props: React.SVGProps<SVGSVGElement>) => React.ReactElement);
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  return (
    <>
      {items.map((item) => (
        <Collapsible
          key={item.title}
          asChild
          defaultOpen={false}
          className="group/collapsible"
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                tooltip={item.title}
                className="hover:bg-purple-50 dark:hover:bg-purple-900/20"
              >
                {item.icon && <item.icon className="!size-4 text-muted-foreground" />}
                <span>{item.title}</span>
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {item.items?.map((subItem) => (
                  <SidebarMenuSubItem key={subItem.title}>
                    <SidebarMenuSubButton asChild>
                      <Link to={subItem.url}>
                        {({ isActive }: any) => (
                          <span
                            className={
                              isActive
                                ? "text-purple-600 dark:text-purple-400 font-medium"
                                : ""
                            }
                            data-active={isActive}
                          >
                            {subItem.title}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      ))}
    </>
  );
}