import { Message, MessageAvatar, MessageContent } from "@/components/ai-elements/message";

interface TypingIndicatorProps {
  name?: string;
  avatarSrc?: string;
  label?: string;
  className?: string;
}

export const TypingIndicator = ({
  name = "User",
  avatarSrc,
  className
}: TypingIndicatorProps) => {
  return (
    <Message from="assistant" className={className}>
      {avatarSrc && (
        <MessageAvatar src={avatarSrc} name={name} />
      )}
      <MessageContent variant="flat">
        <div className="flex items-center gap-2 text-muted-foreground text-sm py-1">
          <div className="flex gap-1">
            <span
              className="inline-block size-2 rounded-full bg-current animate-bounce"
              style={{ animationDelay: "0ms", animationDuration: "1s" }}
            />
            <span
              className="inline-block size-2 rounded-full bg-current animate-bounce"
              style={{ animationDelay: "150ms", animationDuration: "1s" }}
            />
            <span
              className="inline-block size-2 rounded-full bg-current animate-bounce"
              style={{ animationDelay: "300ms", animationDuration: "1s" }}
            />
          </div>
        </div>
      </MessageContent>
    </Message>
  );
};
