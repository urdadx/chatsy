import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useId, useState } from "react";
import { EmbedCodeBlock } from "./embed-code-block";

export function EmbedOptions({ embedToken }: { embedToken: string }) {
  const id = useId();
  const [option, setOption] = useState("1");

  return (
    <div className="space-y-4">
      <RadioGroup
        className="w-full flex items-center gap-2"
        defaultValue="1"
        value={option}
        onValueChange={setOption}
      >
        <div className="border-input has-data-[state=checked]:border-primary/50 relative flex w-full items-start gap-2 rounded-md border p-4 shadow-xs outline-none">
          <RadioGroupItem
            value="1"
            id={`${id}-1`}
            aria-describedby={`${id}-1-description`}
            className="order-1 after:absolute after:inset-0"
          />
          <div className="grid grow gap-2">
            <Label htmlFor={`${id}-1`}>Embed as a chat bubble</Label>
            <p
              id={`${id}-1-description`}
              className="text-muted-foreground text-xs"
            >
              Embed as a chat bubble that expands on click.
            </p>
          </div>
        </div>
        <div className="border-input has-data-[state=checked]:border-primary/50 relative flex w-full items-start gap-2 rounded-md border p-4 shadow-xs outline-none">
          <RadioGroupItem
            value="2"
            id={`${id}-2`}
            aria-describedby={`${id}-2-description`}
            className="order-1 after:absolute after:inset-0"
          />
          <div className="grid grow gap-2">
            <Label htmlFor={`${id}-2`}>Embed as an iframe </Label>
            <p
              id={`${id}-2-description`}
              className="text-muted-foreground text-xs"
            >
              Embed as a full iframe that displays the chatbot interface.
            </p>
          </div>
        </div>
      </RadioGroup>
      <EmbedCodeBlock embedToken={embedToken} option={option} />
    </div>
  );
}
