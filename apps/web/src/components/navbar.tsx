import { useLocation } from "@tanstack/react-router";

export const Navbar = () => {
  const pathname = useLocation({
    select: (location) => location.pathname,
  });

  const headerName = pathname.startsWith("/admin")
    ? pathname.replace("/admin/", "")
    : pathname;

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b">
        <div className="flex items-center gap-2 px-4 capitalize">
          <h2 className="text-md font-semibold capitalize">{headerName}</h2>
        </div>
      </header>
    </>
  );
};
