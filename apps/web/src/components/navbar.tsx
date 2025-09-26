import { useLocation } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { useState } from "react";
import { ShareBot } from "./share-bot/share-bot";
import { Button } from "./ui/button";
import { SidebarTrigger } from "./ui/sidebar";
import { InviteMembers } from "./workspace/invite-members";

export const Navbar = () => {
  const pathname = useLocation({
    select: (location) => location.pathname,
  });

  const headerName = pathname.startsWith("/admin")
    ? pathname.replace("/admin/", "").split("/")[0].replace(/-/g, " ")
    : pathname.replace(/-/g, " ");

  const [inviteMembersOpen, setInviteMembersOpen] = useState(false);


  return (
    <>
      <InviteMembers
        open={inviteMembersOpen}
        setOpen={setInviteMembersOpen}
      />
      <header className="px-4 sticky top-0 flex justify-between h-16 shrink-0 items-center  bg-background/50 backdrop-blur-lg border-b transition-[width,height] ease-linear z-10 group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <SidebarTrigger className="-ml-3" />

        <div className="flex items-center px-2 sm:px-4 capitalize">
          <div className="flex sm:hidden">
            <SidebarTrigger className=" w-5 h-5 text-muted-foreground mr-2" />
          </div>
          <h2 className="flex sm:hidden text-md font-semibold capitalize">
            {headerName}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <ShareBot />
          <Button
            onClick={() => setInviteMembersOpen(true)}
          >
            <Mail className="w-4 h-4 " />
            Invite team
          </Button>
        </div>
      </header>
    </>
  );
};
