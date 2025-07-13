import { useBranding } from "@/hooks/use-bot-branding";
import { sanitizeText } from "@/lib/utils";
import { SparklesIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Markdown } from "./markdown";

export const GreetingMessage = ({ title }: any) => {
  const { data: branding } = useBranding();

  return (
    <>
      <AnimatePresence>
        <motion.div
          className="w-full mx-auto max-w-3xl group/message"
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="flex items-center gap-3 w-full  group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl">
            <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
              {branding?.image ? (
                <img
                  src={branding.image}
                  alt="Assistant"
                  className="rounded-full"
                />
              ) : (
                <SparklesIcon size={14} />
              )}
            </div>
            <div className="flex flex-row gap-2 items-start">
              <div
                data-testid="message-content"
                className="flex flex-col gap-4"
              >
                <Markdown>{sanitizeText(title)}</Markdown>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};
