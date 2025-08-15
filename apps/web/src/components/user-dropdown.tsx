import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useChatbot } from "@/hooks/use-chatbot";
import { signOut } from "@/lib/auth-client";
import { Link, useNavigate } from "@tanstack/react-router";
import { CreditCard, LogOut, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useMediaQuery } from "usehooks-ts";

export function UserDropdown({ user }: any) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleLogout = async () => {
    setOpen(false);
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate({
            to: "/login",
          });
        },
        onError: () => {
          toast.error("Failed to log out. Please try again.");
        },
      },
    });
  };

  const { data: chatbot } = useChatbot();

  const triggerButton = (
    <SidebarMenuButton
      size="lg"
      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
    >
      <Avatar className="h-10 w-10 rounded-full border-2 border-primary">
        <AvatarImage src={user?.image} alt={chatbot?.name || user?.username} />
        <AvatarFallback>
          <User className="h-5 w-5 text-gray-600" />
        </AvatarFallback>
      </Avatar>
    </SidebarMenuButton>
  );

  const menuContent = (
    <>
      <div className="flex flex-col items-start p-4 border-b">
        <span className="text-xs text-muted-foreground">Logged in as</span>
        <div className="flex items-center gap-2 mt-3">
          <Avatar className="h-10 w-10 sm:h-6 sm:w-6 rounded-full border">
            <AvatarImage src={user?.image} alt={user?.username} />
            <AvatarFallback>
              <User className="h-4 w-4 sm:h-3 sm:w-3 text-gray-600" />
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{user?.email}</span>
        </div>
      </div>

      <div className="p-2">
        <Link
          to="/admin/settings"
          search={{ tab: "billing" }}
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 w-full p-2 rounded hover:bg-gray-100 transition-colors"
        >
          <CreditCard className="h-4 w-4" />
          Billing
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 w-full p-2 rounded hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-4 w-4 text-red-500" />
          <span className="text-red-500">Log out</span>
        </button>
      </div>
    </>
  );

  if (isDesktop) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>{triggerButton}</DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side="bottom"
              align="end"
              sideOffset={4}
            >
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link
                    to="/admin/settings"
                    className="flex flex-col items-start"
                  >
                    <span className="text-xs text-muted-foreground">
                      Logged in as
                    </span>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-10 w-10 sm:h-6 sm:w-6 rounded-full border">
                        <AvatarImage src={user?.image} alt={user?.username} />
                        <AvatarFallback>
                          <User className="h-10 w-10 sm:h-3 sm:w-3 text-gray-600" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user?.email}</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {/* @ts-ignore */}
                <Link to="/admin/settings" search={{ tab: "billing" }}>
                  <DropdownMenuItem>
                    <CreditCard />
                    Billing
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className=" hover:bg-red-100"
              >
                <LogOut className="text-red-500" />
                <span className="text-red-500 hover:text-red-400">Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
          <DrawerContent className="h-[32%]">
            <DrawerHeader className="text-left"></DrawerHeader>
            {menuContent}
          </DrawerContent>
        </Drawer>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
