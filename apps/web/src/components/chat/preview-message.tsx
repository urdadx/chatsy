import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/ai-elements/message";
import { Response } from '@/components/ai-elements/response';
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from "@/components/ai-elements/tool";
import type { Vote } from "@/db/schema";
import { useChatbot } from "@/hooks/use-chatbot";
import { CalBooking } from "@/lib/ai/tools-ui/cal-booking";
import { CalendlyBooking } from "@/lib/ai/tools-ui/calendly-booking";
import { CollectFeedbackForm } from "@/lib/ai/tools-ui/collect-feedback-form";
import { CollectLeadsForm } from "@/lib/ai/tools-ui/collect-leads-form";
import { CustomButton } from "@/lib/ai/tools-ui/custom-button";
import { EscalateToHumanNotification } from "@/lib/ai/tools-ui/escalate-to-human-notification";
import type { ChatMessage } from "@/lib/types";
import { sanitizeText } from "@/lib/utils";
import type { UseChatHelpers } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { AnimatePresence, motion } from "framer-motion";
import { Loader } from "../ui/loader";
import { MessageActions } from "./message-actions";
import { MessageReasoning } from "./message-reasoning";

export const PreviewMessage = ({
  chatId,
  message,
  isLoading,
  vote,
  chatbot,
  showActions = true,
  showToolDetails = false,
}: {
  chatId: string;
  message: UIMessage;
  vote: Vote | undefined;
  isLoading: boolean;
  setMessages?: UseChatHelpers<ChatMessage>["setMessages"];
  chatbot?: any;
  requiresScrollPadding?: boolean;
  showActions?: boolean;
  showToolDetails?: boolean;
}) => {
  const { data: fallbackChatbot } = useChatbot();
  const activeChatbot = chatbot || fallbackChatbot;
  const messageRole = message.role;
  const isUserMessage = messageRole === "user";
  const isAssistantMessage = messageRole === "assistant";

  return (
    <AnimatePresence>
      <motion.div
        data-testid={`message-${messageRole}`}
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <Message from={messageRole}>
          {isAssistantMessage && (
            <MessageAvatar
              src={activeChatbot?.image || "/placeholder-avatar.png"}
              name={activeChatbot?.name || "Assistant"}
            />
          )}

          <MessageContent
            variant={isUserMessage ? "contained" : "flat"}
            style={
              isUserMessage
                ? {
                  backgroundColor: activeChatbot?.primaryColor || "#2563eb",
                  color: "#ffffff",
                }
                : undefined
            }
          >

            {message.parts?.map((part, index) => {
              const { type } = part;
              const key = `message-${message.id}-part-${index}`;

              if (type === "reasoning" && part.text?.trim().length > 0) {
                return (
                  <MessageReasoning
                    key={key}
                    isLoading={isLoading}
                    reasoning={part.text}
                  />
                );
              }

              if (type === "text") {
                return (
                  <div key={key}>
                    <Response className={isAssistantMessage ? "bg-gray-50 p-3" : ""}>{sanitizeText(part.text)}</Response>
                  </div>
                );
              }

              if (type === "tool-collect_feedback") {
                const { toolCallId, state, input, output } = part as any;

                if (showToolDetails) {
                  return (
                    <Tool key={toolCallId}>
                      <ToolHeader type={type} state={state} />
                      <ToolContent>
                        {input && <ToolInput input={input} />}
                        {state === "output-available" && (
                          <>
                            <ToolOutput output={output} errorText={(part as any).errorText} />
                            <div className="px-4 pb-4">
                              <CollectFeedbackForm
                                color={activeChatbot?.primaryColor}
                              />
                            </div>
                          </>
                        )}
                        {state === "input-available" && (
                          <div className="px-4 pb-4">
                            <CollectFeedbackForm
                              color={activeChatbot?.primaryColor}
                            />
                          </div>
                        )}
                      </ToolContent>
                    </Tool>
                  );
                }

                if (state === "input-available" || state === "output-available") {
                  return (
                    <div className="px-2" key={toolCallId}>
                      <CollectFeedbackForm
                        color={activeChatbot?.primaryColor}
                      />
                    </div>
                  );
                }
              }

              if (type === "tool-collect_leads") {
                const { toolCallId, state, input, output } = part as any;

                if (showToolDetails) {
                  return (
                    <div className="px-2">
                      <Tool key={toolCallId}>
                        <ToolHeader type={type} state={state} />
                        <ToolContent>
                          {input && <ToolInput input={input} />}
                          {state === "output-available" && (
                            <ToolOutput output={output} errorText={(part as any).errorText} />
                          )}

                        </ToolContent>
                      </Tool>
                    </div>
                  );
                }

                if (state === "input-available" || state === "output-available") {
                  return (
                    <div className="px-2" key={toolCallId}>
                      <CollectLeadsForm color={activeChatbot?.primaryColor} />
                    </div>
                  );
                }
              }

              if (type === "tool-knowledge_base") {
                const { toolCallId, state } = part;

                if (state === "input-available") {
                  return (
                    <div
                      key={toolCallId}
                      className="flex items-center gap-2 text-muted-foreground text-sm"
                    >
                      <Loader
                        variant="dots"
                        className="text-muted-foreground"
                      />
                    </div>
                  );
                }

                if (state === "output-available") {
                  const { output } = part;

                  if (
                    output &&
                    typeof output === "object" &&
                    "error" in output
                  ) {
                    return (
                      <div
                        key={toolCallId}
                        className="text-red-500 p-2 border rounded"
                      >
                        Error searching knowledge base: {String(output.error)}
                      </div>
                    );
                  }
                  return null;
                }
              }

              if (type === "tool-escalate_to_human") {
                const { toolCallId, state, input, output } = part as any;

                if (showToolDetails) {
                  return (
                    <div className="px-2">
                      <Tool key={toolCallId}>
                        <ToolHeader type={type} state={state} />
                        <ToolContent>
                          {input && <ToolInput input={input} />}
                          {state === "output-available" && (
                            <ToolOutput output={output} errorText={(part as any).errorText} />
                          )}
                        </ToolContent>
                      </Tool>
                    </div>
                  );
                }

                if (state === "output-available") {
                  return (
                    <div className="space-y-2 px-2" key={toolCallId}>

                      <EscalateToHumanNotification
                        reason={(output as any)?.reason || "complex-issue"}
                        message={(output as any)?.message || undefined}
                        success={(output as any)?.success !== false}
                        error={(output as any)?.error}
                      />
                    </div>
                  );
                }

                if (state === "input-streaming") {
                  return (
                    <div
                      key={toolCallId}
                      className="flex items-center gap-2 text-muted-foreground text-sm"
                    >
                      <Loader
                        variant="dots"
                        className="text-muted-foreground"
                      />
                      <span>Escalating to human agent...</span>
                    </div>
                  );
                }
              }

              if (type === "tool-custom_button") {
                const { toolCallId, state, input, output } = part as any;

                if (showToolDetails) {
                  return (
                    <div className="px-2">
                      <Tool key={toolCallId}>
                        <ToolHeader type={type} state={state} />
                        <ToolContent>
                          {input && <ToolInput input={input} />}
                          {state === "output-available" && (
                            <ToolOutput output={output} errorText={(part as any).errorText} />
                          )}
                        </ToolContent>
                      </Tool>
                    </div>
                  );
                }

                if (state === "input-available") {
                  return (
                    <div
                      key={toolCallId}
                      className="flex items-center gap-2 text-muted-foreground text-sm"
                    >
                      <Loader
                        variant="dots"
                        className="text-muted-foreground"
                      />
                      <span>Loading button...</span>
                    </div>
                  );
                }

                if (state === "output-available") {
                  if (
                    output &&
                    typeof output === "object" &&
                    "success" in output &&
                    output.success
                  ) {
                    return (
                      <div key={toolCallId}>
                        <CustomButton
                          buttonText={(output as any).buttonText}
                          buttonUrl={(output as any).buttonUrl}
                          name={(output as any).name}
                          description={(output as any).description}
                          context={(output as any).context}
                          color={activeChatbot?.primaryColor}
                        />
                      </div>
                    );
                  }
                }
              }

              if (type === "tool-calendly_booking") {
                const { toolCallId, state, input, output } = part as any;

                if (showToolDetails) {
                  return (
                    <div className="px-2">

                      <Tool key={toolCallId}>
                        <ToolHeader type={type} state={state} />
                        <ToolContent>
                          {input && <ToolInput input={input} />}
                          {state === "output-available" && (
                            <ToolOutput output={output} errorText={(part as any).errorText} />
                          )}
                        </ToolContent>
                      </Tool>
                    </div>
                  );
                }

                if (state === "input-available") {
                  return (
                    <div
                      key={toolCallId}
                      className="flex items-center gap-2 text-muted-foreground text-sm"
                    >
                      <Loader
                        variant="dots"
                        className="text-muted-foreground"
                      />
                      <span>Setting up meeting...</span>
                    </div>
                  );
                }

                if (state === "output-available") {
                  if (
                    output &&
                    typeof output === "object" &&
                    "success" in output &&
                    output.success
                  ) {
                    return (
                      <div className="px-2 space-y-2" key={toolCallId}>

                        <CalendlyBooking
                          eventTypeUri={(output as any).eventTypeUri}
                          eventTypeName={(output as any).eventTypeName}
                          userEmail={(output as any).userEmail}
                          name={(output as any).name}
                          description={(output as any).description}
                          color={activeChatbot?.primaryColor}
                        />
                      </div>
                    );
                  }
                }
              }

              if (type === "tool-cal_booking") {
                const { toolCallId, state, input, output } = part as any;

                if (showToolDetails) {
                  return (
                    <div className="px-2">
                      <Tool key={toolCallId}>
                        <ToolHeader type={type} state={state} />
                        <ToolContent>
                          {input && <ToolInput input={input} />}
                          {state === "output-available" && (
                            <ToolOutput output={output} errorText={(part as any).errorText} />
                          )}
                        </ToolContent>
                      </Tool>
                    </div>
                  );
                }

                if (state === "input-available") {
                  return (
                    <div
                      key={toolCallId}
                      className="flex items-center gap-2 text-muted-foreground text-sm"
                    >
                      <Loader
                        variant="dots"
                        className="text-muted-foreground"
                      />
                      <span>Setting up meeting...</span>
                    </div>
                  );
                }

                if (state === "output-available") {
                  if (
                    output &&
                    typeof output === "object" &&
                    "error" in output
                  ) {
                    return (
                      <div className="px-2">
                        <div
                          key={toolCallId}
                          className="text-red-500 p-2 border rounded"
                        >
                          {String(output.error)}
                        </div>
                      </div>
                    );
                  }

                  if (
                    output &&
                    typeof output === "object" &&
                    "success" in output &&
                    output.success
                  ) {
                    return (
                      <div className="px-2 space-y-2" key={toolCallId}>

                        <CalBooking
                          username={(output as any).username}
                          eventSlug={(output as any).eventSlug}
                          eventTypeName={(output as any).eventTypeName}
                          duration={(output as any).duration}
                          name={(output as any).name}
                          description={(output as any).description}
                          color={activeChatbot?.primaryColor}
                        />
                      </div>
                    );
                  }
                }
              }

              return null;
            })}
            {showActions && (
              <MessageActions
                key={`action-${message.id}`}
                chatId={chatId}
                message={message}
                vote={vote}
                isLoading={isLoading}
              />
            )}
          </MessageContent>
        </Message>
      </motion.div>
    </AnimatePresence>
  );
};




export const ThinkingMessage = () => {
  const { data: chatbot } = useChatbot();
  const activeChatbot = chatbot;

  return (
    <motion.div
      data-testid="message-assistant-loading"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
    >
      <Message from="assistant">
        <MessageAvatar
          src={activeChatbot?.image || "/placeholder-avatar.png"}
          name={activeChatbot?.name || "Assistant"}
        />
        <MessageContent variant="flat">
          <Loader variant="dots" className="text-muted-foreground" />
        </MessageContent>
      </Message>
    </motion.div>
  );
};
