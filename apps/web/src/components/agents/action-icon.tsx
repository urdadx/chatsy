import { cn } from "@/lib/utils";

interface IntegrationIconProps {
  children: React.ReactNode;
  className?: string;
}

export const ActionIcon = ({ children, className }: IntegrationIconProps) => {
  return (
    <div
      className={cn(
        "w-10 h-10 rounded flex items-center justify-center text-white",
        className,
      )}
    >
      {children}
    </div>
  );
};
