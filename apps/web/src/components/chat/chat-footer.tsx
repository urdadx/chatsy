import { AISuggestion, AISuggestions } from "@/components/ui/ai-suggestions";
import { Input } from "@/components/ui/input";
import type { ChatStatus } from "ai";
import { ArrowUp } from "lucide-react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";

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

export function ChatFooter({
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
  return (
    <div className={`border-t bg-gray-50/50 p-3 space-y-3 ${className}`}>
      {showSuggestions && suggestions.length > 0 && (
        <div className="space-y-2">
          <AISuggestions>
            {suggestions.map((suggestion: string) => (
              <AISuggestion
                onClick={onSuggestionClick}
                key={suggestion}
                suggestion={suggestion}
              />
            ))}
          </AISuggestions>
        </div>
      )}

      {children}

      <form onSubmit={onSubmit} className="flex items-center space-x-2">
        <Input
          id="message"
          placeholder={placeholder}
          className="flex-1 text-sm bg-white sm:text-base"
          style={
            {
              "--tw-ring-color": chatbot?.primaryColor || "#2563eb",
            } as React.CSSProperties
          }
          autoComplete="off"
          value={input}
          onChange={onInputChange}
        />
        <button
          className="rounded-full p-2"
          style={{ backgroundColor: chatbot?.primaryColor || "#2563eb" }}
          type="submit"
          disabled={status === "streaming" || status === "submitted"}
          aria-label="Send"
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
            style={{ color: chatbot?.primaryColor || "#2563eb" }}
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
