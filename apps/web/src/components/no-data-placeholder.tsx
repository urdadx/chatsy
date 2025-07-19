import type { LucideIcon } from "lucide-react";

interface NoDataPlaceholderProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function NoDataPlaceholder({
  icon: Icon,
  title,
  description,
}: NoDataPlaceholderProps) {
  return (
    <div className="w-full ">
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <Icon className="h-14 w-14 text-primary/50" />
        <div className="text-center">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}
