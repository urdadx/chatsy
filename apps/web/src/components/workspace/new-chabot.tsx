import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type ChatbotListItem,
  useChatbots,
  useCreateChatbot,
  useSetActiveChatbot,
} from "@/hooks/use-chatbot-management";
import { cn } from "@/lib/utils";
import { RiCheckboxCircleFill } from "@remixicon/react";
import { ArrowRight, Bot, Plus } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import Spinner from "../ui/spinner";

export const ChatbotManager = ({ open, setOpen }: any) => {
  const [formData, setFormData] = useState({
    name: "",
  });
  const [view, setView] = useState<"list" | "create">("list");

  const { data: chatbotsData } = useChatbots();
  const createChatbot = useCreateChatbot();
  const setActiveChatbot = useSetActiveChatbot();

  const chatbots = chatbotsData?.chatbots || [];
  const activeChatbotId = chatbotsData?.activeChatbotId;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateChatbot = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      return;
    }

    try {
      await createChatbot.mutateAsync({
        name: formData.name.trim(),
        primaryColor: "#9333ea",
        theme: "light",
        hidePoweredBy: false,
        initialMessage: "Hello there👋, how can I help you today?",
      });

      setFormData({ name: "" });
      setView("list");
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleSwitchChatbot = async (chatbotId: string) => {
    if (chatbotId === activeChatbotId) {
      // Already active, just close the dialog
      setOpen(false);
      return;
    }

    try {
      await setActiveChatbot.mutateAsync({ chatbotId });
      setOpen(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const resetForm = () => {
    setFormData({ name: "" });
    setView("list");
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    setOpen(open);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="w-full sm:max-w-lg">
          <div className="flex flex-col items-center gap-2">
            <div
              className="flex size-11 shrink-0 items-center justify-center rounded-full border"
              aria-hidden="true"
            >
              <Bot className="size-5 stroke-zinc-800 dark:stroke-zinc-100" />
            </div>
            <DialogHeader>
              <DialogTitle className="sm:text-center">
                {view === "list" ? "Manage Chatbots" : "Create New Chatbot"}
              </DialogTitle>
              <DialogDescription className="sm:text-center underline-offset-4">
                {view === "list"
                  ? "Switch between your chatbots or create a new one"
                  : "Give your chatbot a name"}
              </DialogDescription>
            </DialogHeader>
          </div>

          {view === "list" ? (
            <div className="space-y-4 ">
              {/* Existing Chatbots List */}
              {chatbots.length > 0 && (
                <div className="space-y-2">
                  <ScrollArea className="max-h-60">
                    <div className="space-y-2 px-2">
                      {chatbots.map((chatbot: ChatbotListItem) => (
                        <motion.div
                          key={chatbot.id}
                          className={cn(
                            "flex items-center p-2 justify-between rounded-lg border cursor-pointer transition-colors",
                            activeChatbotId === chatbot.id
                              ? "bg-primary/10 border-primary"
                              : "hover:bg-gray-50 dark:hover:bg-gray-800",
                          )}
                          onClick={() => handleSwitchChatbot(chatbot.id)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className="flex items-center gap-3">
                            {chatbot.image ? (
                              <img
                                src={chatbot.image}
                                alt={chatbot.name}
                                className="w-8 h-8 rounded-full"
                              />
                            ) : (
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                                style={{
                                  backgroundColor: chatbot.primaryColor,
                                }}
                              >
                                {chatbot.name?.charAt(0).toUpperCase() || "C"}
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-sm">
                                {chatbot.name || "Unnamed Chatbot"}
                              </p>
                              <p className="text-xs text-gray-500">
                                Created{" "}
                                {new Date(
                                  chatbot.createdAt,
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          {activeChatbotId === chatbot.id && (
                            <RiCheckboxCircleFill className="w-5 h-5 text-primary" />
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* Create New Chatbot Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-2"
              >
                <Button
                  onClick={() => setView("create")}
                  variant="outline"
                  className="w-full flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create New Chatbot
                </Button>
              </motion.div>
            </div>
          ) : (
            <form onSubmit={handleCreateChatbot} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Chatbot Name</Label>
                <Input
                  autoFocus
                  id="name"
                  name="name"
                  type="text"
                  placeholder="My Assistant"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setView("list")}
                  className="flex-1"
                >
                  Back
                </Button>
                <motion.div
                  className="flex-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createChatbot.isPending || !formData.name.trim()}
                  >
                    {createChatbot.isPending ? <Spinner /> : "Create"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </motion.div>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
