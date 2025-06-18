import { Share } from "lucide-react";
import { Button } from "./ui/button";

export const ShareBot = () => {
  return (
    <>
      <Button variant={"outline"} className="w-fit text-primary">
        <Share className="w-4 h-4" />
        Publish your page
      </Button>
    </>
  );
};
