import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

export const TextSource = () => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 mb-3">
        <h2 className="font-semibold text-lg">Text Source</h2>
        <p className="text-semibold text-base text-muted-foreground">
          Add plain text sources to train your agent with specific information
        </p>
      </div>

      <form className="flex flex-col ">
        <div className="flex flex-col space-y-4">
          <div className="w-full flex flex-col gap-2">
            <Label className="text-sm" htmlFor="title">
              Title
            </Label>
            <Input
              className="w-full text-base"
              placeholder="Ex: Company Policies"
              type="text"
              name="title"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-sm" htmlFor="text">
              Text Content
            </Label>
            <Textarea
              className="text-sm"
              rows={6}
              required
              placeholder="Enter your text content here"
            />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button className="w-fit">Add text source</Button>
        </div>
      </form>
    </div>
  );
};
