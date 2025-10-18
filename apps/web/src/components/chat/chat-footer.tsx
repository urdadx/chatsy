import { AISuggestion, AISuggestions } from "@/components/ui/ai-suggestions";
import { Input } from "@/components/ui/input";
import type { ChatStatus } from "ai";
import { ArrowUp } from "lucide-react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { memo, useMemo } from "react";

interface ChatFooterProps {
  input: string;
  onInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event?: FormEvent) => void;
  status: ChatStatus;
  suggestions?: string[];
  onSuggestionClick: (suggestion: string) => void;
  showSuggestions?: boolean;
  showPoweredBy?: boolean;
  chatbot?: {
    primaryColor?: string | null;
    [key: string]: any;
  };
  placeholder?: string;
  className?: string;
  children?: ReactNode;
}

function ChatFooterComponent({
  input,
  onInputChange,
  onSubmit,
  status,
  suggestions = [],
  onSuggestionClick,
  showSuggestions = true,
  showPoweredBy = true,
  chatbot,
  placeholder = "Type a message...",
  className,
  children,
}: ChatFooterProps) {
  const inputStyle = useMemo(
    () => ({
      "--tw-ring-color": chatbot?.primaryColor || "#2563eb",
    } as React.CSSProperties),
    [chatbot?.primaryColor]
  );

  const buttonStyle = useMemo(
    () => ({ backgroundColor: chatbot?.primaryColor || "#2563eb" }),
    [chatbot?.primaryColor]
  );

  const linkStyle = useMemo(
    () => ({ color: chatbot?.primaryColor || "#2563eb" }),
    [chatbot?.primaryColor]
  );

  const containerClassName = useMemo(
    () => `border-t bg-gray-50/50 p-3 space-y-3 ${className || ""}`,
    [className]
  );

  const suggestionElements = useMemo(
    () =>
      suggestions.map((suggestion: string) => (
        <AISuggestion
          onClick={onSuggestionClick}
          key={suggestion}
          suggestion={suggestion}
        />
      )),
    [suggestions, onSuggestionClick]
  );

  return (
    <div className={containerClassName}>
      {showSuggestions && suggestions.length > 0 && (
        <div className="space-y-2">
          <AISuggestions>{suggestionElements}</AISuggestions>
        </div>
      )}

      {children}

      <form onSubmit={onSubmit} className="flex items-center space-x-2">
        <Input
          id="message"
          className="flex-1 text-sm bg-white sm:text-base"
          autoComplete="off"
          value={input}
          onChange={onInputChange}
          placeholder={placeholder}
          aria-label="Message"
          style={inputStyle as any}
        />
        <button
          className="rounded-full p-2"
          type="submit"
          disabled={status === "streaming" || status === "submitted"}
          aria-label="Send"
          style={buttonStyle as any}
        >
          <ArrowUp className="h-4 w-4 text-white" />
        </button>
      </form>

      {showPoweredBy ? (
        <div className="flex system-font items-center justify-center text-xs text-muted-foreground">
          <span>Powered by </span>
          <a
            href="https://padyna.com"
            target="_blank"
            rel="noopener noreferrer"
            style={linkStyle}
            className="ml-1 hover:underline font-semibold "
          >
            Padyna
          </a>
        </div>
      ) : (
        <div className="h-0" />
      )}
    </div>
  );
}

function areEqual(prev: ChatFooterProps, next: ChatFooterProps) {
  return (
    prev.input === next.input &&
    prev.status === next.status &&
    prev.showPoweredBy === next.showPoweredBy &&
    prev.showSuggestions === next.showSuggestions &&
    prev.placeholder === next.placeholder &&
    prev.className === next.className &&
    prev.chatbot?.primaryColor === next.chatbot?.primaryColor &&
    prev.suggestions === next.suggestions &&
    prev.onInputChange === next.onInputChange &&
    prev.onSuggestionClick === next.onSuggestionClick &&
    prev.onSubmit === next.onSubmit
  );
}

export const ChatFooter = memo(ChatFooterComponent, areEqual);
