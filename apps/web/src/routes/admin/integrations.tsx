import { Button } from "@/components/ui/button";
import { RiInstagramFill, RiTiktokFill } from "@remixicon/react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/integrations")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="max-w-4xl w-full max-h-screen mx-auto py-4">
      <h1 className="text-lg font-semibold my-2">Integrations</h1>
      <span className="text-sm text-muted-foreground">
        Integrate your bot with various services to enhance its capabilities.
      </span>
      <div className="w-full py-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="w-fit flex flex-col h-fit border rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-1 text-sm">
            <RiInstagramFill className="w-5 h-5 text-rose-400" />
            Instagram
          </div>
          <span className="text-sm text-muted-foreground">
            Connect your bot to Instagram for social media interactions.
          </span>
          <Button
            className="mt-2 w-fit h-9 text-green-800 border border-green-400 hover:text-green-500 shadow-none bg-green-50 hover:bg-green-50"
            variant="outline"
          >
            Connect
          </Button>
        </div>
        <div className="w-fit flex flex-col h-fit border rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-1 text-sm">
            <RiTiktokFill className="w-5 h-5 text-black" />
            Tiktok
          </div>
          <span className="text-sm text-muted-foreground">
            Connect your bot to Instagram for social media interactions.
          </span>
          <Button
            className="mt-2 h-9 w-fit text-green-800 border border-green-400 hover:text-green-500 shadow-none bg-green-50 hover:bg-green-50"
            variant="outline"
          >
            Connect
          </Button>
        </div>
      </div>
    </div>
  );
}
