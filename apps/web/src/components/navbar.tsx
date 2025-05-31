import { useLocation } from "@tanstack/react-router";
import { SidebarTrigger } from "./ui/sidebar";

export const Navbar = () => {
  const pathname = useLocation({
    select: (location) => location.pathname,
  });

  const headerName = pathname.startsWith("/admin")
    ? pathname.replace("/admin/", "")
    : pathname;

  return (
    <>
      <header className="sticky top-0 flex justify-between h-16 shrink-0 items-center  bg-background/50 backdrop-blur-lg border-b transition-[width,height] ease-linear z-10 group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center px-2 sm:px-4 capitalize">
          <div className="flex sm:hidden">
            <SidebarTrigger className=" w-5 h-5 text-muted-foreground mr-2" />
          </div>
          <h2 className="text-md font-semibold capitalize">{headerName}</h2>
        </div>
      </header>
    </>
  );
};
