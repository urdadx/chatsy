import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UIMessage } from "ai";
import equal from "fast-deep-equal";
import { CopyIcon, ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";
import { memo } from "react";
import { toast } from "sonner";
import { useCopyToClipboard } from "usehooks-ts";
import type { Vote } from "../../db/schema";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

export function PureMessageActions({
  chatId,
  message,
  vote,
  isLoading,
}: {
  chatId: string;
  message: UIMessage;
  vote: Vote | undefined;
  isLoading: boolean;
}) {
  const queryClient = useQueryClient();
  const [_, copyToClipboard] = useCopyToClipboard();

  const voteMutation = useMutation({
    mutationFn: async ({ type }: { type: "up" | "down" }) => {
      const response = await api.patch("/vote", {
        chatId,
        messageId: message.id,
        type,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.setQueryData<Array<Vote>>(
        ["votes", chatId],
        (currentVotes) => {
          if (!currentVotes) return [];

          const votesWithoutCurrent = currentVotes.filter(
            (v) => v.messageId !== message.id,
          );

          return [
            ...votesWithoutCurrent,
            {
              chatId,
              messageId: message.id,
              isUpvoted: variables.type === "up",
            },
          ];
        },
      );
      toast.success(
        variables.type === "up" ? "Upvoted Response!" : "Downvoted Response!",
      );
      queryClient.invalidateQueries({ queryKey: ["votes", chatId] });
    },
    onError: (_, variables) => {
      toast.error(
        variables.type === "up"
          ? "Failed to upvote response."
          : "Failed to downvote response.",
      );
    },
  });

  if (isLoading) return null;
  if (message.role === "user") return null;

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-row gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="py-1 px-2 h-fit text-muted-foreground"
              variant="outline"
              onClick={async () => {
                const textFromParts = message.parts
                  ?.filter((part) => part.type === "text")
                  .map((part) => part.text)
                  .join("")
                  .trim();

                if (!textFromParts) {
                  toast.error("There's no text to copy!");
                  return;
                }

                await copyToClipboard(textFromParts);
                toast.success("Copied to clipboard!");
              }}
            >
              <CopyIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-white text-black shadow-sm">
            Copy
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              data-testid="message-upvote"
              className="py-1 px-2 h-fit text-muted-foreground !pointer-events-auto"
              disabled={vote?.isUpvoted || voteMutation.isPending}
              variant="outline"
              onClick={() => voteMutation.mutate({ type: "up" })}
            >
              <ThumbsUpIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-white text-black shadow-sm">
            Upvote Response
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              data-testid="message-downvote"
              className="py-1 px-2 h-fit text-muted-foreground !pointer-events-auto"
              variant="outline"
              disabled={(vote && !vote.isUpvoted) || voteMutation.isPending}
              onClick={() => voteMutation.mutate({ type: "down" })}
            >
              <ThumbsDownIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-white text-black shadow-sm">
            Downvote Response
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

export const MessageActions = memo(
  PureMessageActions,
  (prevProps, nextProps) => {
    if (!equal(prevProps.vote, nextProps.vote)) return false;
    if (prevProps.isLoading !== nextProps.isLoading) return false;

    return true;
  },
);
