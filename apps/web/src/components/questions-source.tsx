import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

export const QuestionSource = () => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 mb-3">
        <h2 className="font-semibold text-lg">Q&A</h2>
        <p className="text-semibold text-base text-muted-foreground">
          Create answers for key questions to help your AI Agent provide the
          most useful information
        </p>
      </div>

      <form className="flex flex-col ">
        <div className="flex flex-col space-y-4">
          <div className="w-full flex flex-col gap-2">
            <Label className="text-sm" htmlFor="title">
              Question
            </Label>
            <Input
              className="w-full text-base"
              placeholder="Ex: Do you do refunds? "
              type="text"
              name="title"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-sm" htmlFor="text">
              Answer
            </Label>
            <Textarea
              className="text-sm"
              rows={6}
              required
              placeholder="Enter your answer here"
            />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button className="w-fit">Add Q&A</Button>
        </div>
      </form>
    </div>
  );
};
