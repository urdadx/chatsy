import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useUpdateChatbot } from "@/hooks/use-chatbot";
import { useEffect, useId, useState } from "react"
import Spinner from "../ui/spinner"

export function PersonalitySelector({ personality }: { personality?: string }) {
  const id = useId()
  const updateChatbotMutation = useUpdateChatbot();
  const [selectedPersonality, setSelectedPersonality] = useState<string>(
    personality || "support",
  )

  useEffect(() => {
    if (personality) {
      setSelectedPersonality(personality)
    }
  }
    , [personality])

  const handleChange = (value: string) => {
    setSelectedPersonality(value);
    updateChatbotMutation.mutate({
      personality: value as "support" | "sales" | "lead" | "custom"
    });
  }

  return (
    <div className="*:not-first:mt-2 w-full">
      <Select onValueChange={handleChange} value={selectedPersonality}>
        <SelectTrigger
          id={id}
          className="[&>span_svg]:text-muted-foreground/80 [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_svg]:shrink-0 w-full sm:w-[250px]"
        >
          <SelectValue placeholder="Select personality" />
        </SelectTrigger>
        <SelectContent className="[&_*[role=option]>span>svg]:text-muted-foreground/80 [&_*[role=option]>span]:flex [&_*[role=option]>span]:gap-2 [&_*[role=option]>span>svg]:shrink-0 ">
          <SelectItem value="support">
            <span className="truncate">Customer Support </span>
          </SelectItem>
          <SelectItem value="sales">
            <span className="truncate">Sales Agent</span>
          </SelectItem>
          <SelectItem value="lead">
            <span className="truncate">Lead Capture</span>
          </SelectItem>
        </SelectContent>
      </Select>
      {updateChatbotMutation.isPending && (
        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
          <Spinner className="w-4 h-4" />
          <span>Updating personality...</span>
        </div>
      )}
    </div>
  )
}
