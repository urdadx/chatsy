import { cn } from "@/lib/utils";
import { StickToBottom } from "use-stick-to-bottom";

export type ChatContainerRootProps = {
  children: React.ReactNode;
  className?: string;
  optimize?: boolean; // added prop
} & React.HTMLAttributes<HTMLDivElement>;

export type ChatContainerContentProps = {
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export type ChatContainerScrollAnchorProps = {
  className?: string;
  ref?: React.RefObject<HTMLDivElement>;
} & React.HTMLAttributes<HTMLDivElement>;

function ChatContainerRoot({
  children,
  className,
  optimize = true,
  ...props
}: ChatContainerRootProps) {
  return (
    <StickToBottom
      className={cn(
        "flex flex-col overflow-y-auto", // ensure vertical layout
        optimize && "min-h-0 overscroll-contain will-change-transform", // performance helpers
        className,
      )}
      initial="instant"
      role="log"
      {...props}
      style={optimize ? { contain: "layout style paint", ...props.style } : props.style}
    >
      {children}
    </StickToBottom>
  );
}

function ChatContainerContent({
  children,
  className,
  ...props
}: ChatContainerContentProps) {
  return (
    <StickToBottom.Content
      className={cn("flex w-full flex-col", className)}
      {...props}
    >
      {children}
    </StickToBottom.Content>
  );
}

function ChatContainerScrollAnchor({
  className,
  ...props
}: ChatContainerScrollAnchorProps) {
  return (
    <div
      className={cn("h-px w-full shrink-0 scroll-mt-4", className)}
      aria-hidden="true"
      {...props}
    />
  );
}

export { ChatContainerRoot, ChatContainerContent, ChatContainerScrollAnchor };
