import {
  ArchiveIcon,
  Calendar,
  Check,
  ChevronDown,
  FilterIcon,
  GlobeIcon,
  LinkIcon,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const options = [
  {
    value: "",
    label: "Show all",
    icon: GlobeIcon,
  },
  {
    value: "archived",
    label: "Archived ",
    icon: ArchiveIcon,
  },
  {
    value: "date",
    label: "Most recent",
    icon: Calendar,
  },
  {
    value: "suggestions",
    label: "Suggestions only",
    icon: LinkIcon,
  },
];

export function FilterQuestions() {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="select-42"
            variant="outline"
            aria-expanded={open}
            className="w-full justify-between bg-background font-normal outline-offset-0 hover:bg-background focus-visible:border-ring focus-visible:outline-[3px] focus-visible:outline-ring/20"
          >
            <div className="flex items-center gap-3">
              <FilterIcon className="text-muted-foreground" />
              <span className={cn("truncate text-muted-foreground")}>
                Filter
              </span>
            </div>
            <ChevronDown
              size={16}
              strokeWidth={2}
              className="shrink-0 text-muted-foreground/80"
              aria-hidden="true"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-full min-w-[var(--radix-popper-anchor-width)] border-input p-0"
          align="start"
        >
          <Command>
            <CommandInput placeholder="Filter by" />
            <CommandList>
              <CommandEmpty>No filters found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={(currentValue) => {
                      setOpen(false);
                    }}
                    className="group"
                  >
                    <option.icon
                      size={16}
                      strokeWidth={2}
                      className="me-2 text-muted-foreground group-hover:text-primary"
                      aria-hidden="true"
                    />
                    <span className="text-muted-foreground group-hover:text-primary">
                      {option.label}
                    </span>
                    <Check
                      size={16}
                      strokeWidth={2}
                      className="ml-auto text-primary"
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
