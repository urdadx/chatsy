import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";
import { SearchQuestions } from "../search-questions";
import { AddQuestions } from "./add-questions";
import { QuestionCardOptions } from "./question-card-options";

interface QuestionTag {
  id: string;
  label: string;
  color:
    | "purple"
    | "green"
    | "blue"
    | "orange"
    | "red"
    | "yellow"
    | "indigo"
    | "pink";
}

interface BotQuestion {
  id: string;
  question: string;
  tags: QuestionTag[];
  isActive: boolean;
  createdAt: string;
}

const botQuestions: BotQuestion[] = [
  {
    id: "1",
    question: "What's your favorite camera for videos?",
    tags: [
      { id: "video", label: "video", color: "purple" },
      { id: "photography", label: "photography", color: "green" },
    ],
    isActive: true,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    question: "How do you edit your content?",
    tags: [
      { id: "editing", label: "editing", color: "blue" },
      { id: "workflow", label: "workflow", color: "orange" },
    ],
    isActive: true,
    createdAt: "2024-01-14",
  },
  {
    id: "3",
    question: "What's your pricing for brand collaborations?",
    tags: [
      { id: "business", label: "business", color: "indigo" },
      { id: "pricing", label: "pricing", color: "yellow" },
      { id: "collabs", label: "collabs", color: "pink" },
    ],
    isActive: false,
    createdAt: "2024-01-13",
  },
  {
    id: "4",
    question: "Can you share your content calendar template?",
    tags: [{ id: "planning", label: "planning", color: "green" }],
    isActive: true,
    createdAt: "2024-01-12",
  },
];

const getTagColorClasses = (color: QuestionTag["color"]) => {
  const colorMap = {
    purple: "bg-purple-100 text-purple-800",
    green: "bg-green-100 text-green-800",
    blue: "bg-blue-100 text-blue-800",
    orange: "bg-orange-100 text-orange-800",
    red: "bg-red-100 text-red-800",
    yellow: "bg-yellow-100 text-yellow-800",
    indigo: "bg-indigo-100 text-indigo-800",
    pink: "bg-pink-100 text-pink-800",
  };
  return colorMap[color];
};

export const BotQuestions = () => {
  const [questionStates, setQuestionStates] = useState<Record<string, boolean>>(
    botQuestions.reduce(
      (acc, question) => {
        acc[question.id] = question.isActive;
        return acc;
      },
      {} as Record<string, boolean>,
    ),
  );

  const toggleQuestion = (questionId: string) => {
    setQuestionStates((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  return (
    <>
      <div className="w-full flex flex-col mt-5 gap-5">
        <div className="flex justify-between items-center w-full gap-3">
          <SearchQuestions />
          <AddQuestions />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {botQuestions.map((question) => {
            const isActive = questionStates[question.id];

            return (
              <motion.div
                key={question.id}
                className={cn(
                  "group w-full max-w-[320px] h-fit bg-white rounded-2xl border-2 border-purple-100 shadow-xs hover:shadow-sm transition-all duration-200 overflow-hidden relative",
                  !isActive && "opacity-50",
                )}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-normal text-sm text-gray-900 leading-5 flex-1 min-w-0">
                      {question.question}
                    </h3>
                    <QuestionCardOptions
                      questionId={question.id}
                      isActive={isActive}
                      onToggle={() => toggleQuestion(question.id)}
                    />
                  </div>

                  {question.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {question.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                            getTagColorClasses(tag.color),
                          )}
                        >
                          {tag.label}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 pt-2  border-gray-100">
                    <span className="text-xs text-gray-400">
                      {new Date(question.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {botQuestions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-sm">
              No questions yet. Add your first question to get started!
            </div>
          </div>
        )}
      </div>
    </>
  );
};
