import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { MoreVertical } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin/actions")({
  component: RouteComponent,
});

interface BotAction {
  id: string;
  emoji: string;
  title: string;
  defaultActive: boolean;
}

const botActions: BotAction[] = [
  {
    id: "generate-leads",
    emoji: "🎯",
    title: "Generate leads",
    defaultActive: true,
  },
  {
    id: "link-socials",
    emoji: "🔗",
    title: "Link socials",
    defaultActive: true,
  },
  {
    id: "schedule-meetings",
    emoji: "📆",
    title: "Schedule meetings",
    defaultActive: false,
  },
  {
    id: "collabs-inquiries",
    emoji: "🤝",
    title: "Collabs & inquiries",
    defaultActive: true,
  },
  {
    id: "customer-support",
    emoji: "💬",
    title: "Customer support",
    defaultActive: true,
  },
  {
    id: "auto-dm",
    emoji: "🤖",
    title: "Auto DM",
    defaultActive: true,
  },
];

function RouteComponent() {
  const [actionStates, setActionStates] = useState<Record<string, boolean>>(
    botActions.reduce(
      (acc, action) => {
        acc[action.id] = action.defaultActive;
        return acc;
      },
      {} as Record<string, boolean>,
    ),
  );

  const toggleAction = (actionId: string) => {
    setActionStates((prev) => ({
      ...prev,
      [actionId]: !prev[actionId],
    }));
  };

  return (
    <div className="max-w-4xl w-full max-h-screen mx-auto py-4">
      {/* <h1 className="text-lg font-semibold my-2">Actions</h1> */}
      <span className="text-sm text-muted-foreground">
        Integrate your bot with various services to enhance its capabilities.
      </span>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        {botActions.map((action) => {
          const isActive = actionStates[action.id];
          return (
            <motion.div
              key={action.id}
              className={cn(
                "group w-full max-w-[300px] bg-white rounded-2xl border-2 border-purple-100 shadow-xs hover:shadow-sm transition-all duration-200 overflow-visible relative",
                !isActive && "opacity-50",
              )}
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span
                      className="text-xl flex-shrink-0"
                      role="img"
                      aria-hidden="true"
                    >
                      {action.emoji}
                    </span>
                    <h3 className="font-normal text-sm leading-5 truncate">
                      {action.title}
                    </h3>
                  </div>
                  <div className="relative">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="shadow-none transition-opacity flex-shrink-0 h-8 w-8"
                      aria-label={`Open edit menu for ${action.title}`}
                    >
                      <MoreVertical
                        size={14}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={isActive}
                    onCheckedChange={() => toggleAction(action.id)}
                    className="scale-75"
                    aria-label={`Toggle ${action.title}`}
                  />
                  <span className="text-sm text-gray-500">
                    {isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
