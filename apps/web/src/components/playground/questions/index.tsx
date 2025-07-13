import { NoDataPlaceholder } from "@/components/no-data-placeholder";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { SearchQuestions } from "../search-questions";
import { AddQuestions } from "./add-questions";
import { QuestionCard } from "./question-card";

interface BotQuestion {
  id: string;
  question: string;
  answer: string;
  isSuggested: boolean;
  createdAt: string;
  updatedAt: string;
}

export const BotQuestions = () => {
  const {
    data: botQuestions,
    isLoading,
    isError,
    refetch,
  } = useQuery<BotQuestion[]>({
    queryKey: ["questions"],
    queryFn: async () => {
      const res = await api.get("/questions");
      return res.data;
    },
  });

  const { data: session } = useSession();
  console.log("Session Data:", session);

  return (
    <div className="w-full flex flex-col mt-5 gap-5">
      <div className="flex flex-row justify-between items-center w-full gap-3">
        <SearchQuestions />
        <AddQuestions />
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-24">
          <Spinner className="text-primary" />
        </div>
      )}
      {isError && (
        <div className="flex justify-center items-center h-24">
          <span className="text-red-500">Failed to load questions</span>
          <Button onClick={() => refetch()} className="ml-4">
            Retry
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {botQuestions?.map((question) => (
          <QuestionCard key={question.id} props={question} />
        ))}
      </div>

      {botQuestions?.length === 0 && <NoDataPlaceholder />}
      <div className="h-[16px]" />
    </div>
  );
};
