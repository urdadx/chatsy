import { Users } from "lucide-react";
import { Button } from "./ui/button";

export const ShareBot = () => {
  return (
    <>
      <Button variant={"outline"} className="w-fit text-primary">
        <Users className="w-4 h-4" />
        <span className="hidden sm:inline">Share your bot</span>
        <span className="inline sm:hidden">Share</span>
      </Button>
    </>
  );
};
