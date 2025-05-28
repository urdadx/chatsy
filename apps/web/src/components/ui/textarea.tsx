import type * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[112px] rounded-lg border bg-background px-4 py-2 text-sm leading-6 shadow-xs transition-colors duration-100 placeholder:text-surface-500",
        "outline-primary focus:outline-2  focus:-outline-offset-1",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
