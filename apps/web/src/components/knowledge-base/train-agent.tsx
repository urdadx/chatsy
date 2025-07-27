import { formatBytes } from "@/hooks/use-file-upload";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { RiQuestionFill } from "@remixicon/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Globe, Hammer, InfoIcon, Paperclip } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";

export const TrainAgent = () => {
  const queryClient = useQueryClient();
  const [lastTrainedAt, setLastTrainedAt] = useState<Date | null>(null);
  const { data: session } = useSession();
  const organizationId = session?.session?.activeOrganizationId;

  useEffect(() => {
    const storedTimestamp = localStorage.getItem("lastTrainedAt");
    if (storedTimestamp) {
      setLastTrainedAt(new Date(storedTimestamp));
    }
  }, []);

  const { data: documentSources } = useQuery({
    queryKey: ["document-sources", organizationId],
    queryFn: async () => {
      const response = await api.get("/document-source");
      return response.data;
    },
    enabled: !!organizationId,
  });

  const { data: questionSources } = useQuery({
    queryKey: ["questions", organizationId],
    queryFn: async () => {
      const response = await api.get("/questions");
      return response.data;
    },
    enabled: !!organizationId,
  });

  const { data: textSources } = useQuery({
    queryKey: ["text-sources", organizationId],
    queryFn: async () => {
      const response = await api.get("/text-sources");
      return response.data;
    },
    enabled: !!organizationId,
  });

  const { data: websiteSourcesData } = useQuery({
    queryKey: ["website-sources", organizationId],
    queryFn: async () => {
      const response = await api.get("/scrape");
      return response.data;
    },
    enabled: !!organizationId,
  });

  const websiteSources = websiteSourcesData?.data || [];

  const isStale = useMemo(() => {
    if (!lastTrainedAt) {
      return (
        (documentSources?.length ?? 0) > 0 ||
        (questionSources?.length ?? 0) > 0 ||
        (textSources?.length ?? 0) > 0 ||
        (websiteSources?.length ?? 0) > 0
      );
    }

    const allSources = [
      ...(documentSources || []),
      ...(questionSources || []),
      ...(textSources || []),
      ...(websiteSources || []),
    ];

    return allSources.some(
      (source) => new Date(source.createdAt) > lastTrainedAt,
    );
  }, [
    documentSources,
    questionSources,
    textSources,
    websiteSources,
    lastTrainedAt,
  ]);

  const trainAgentMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post("/train-agent");
      return response.data;
    },
    onSuccess: () => {
      const now = new Date();
      setLastTrainedAt(now);
      localStorage.setItem("lastTrainedAt", now.toISOString());
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      toast.error(`Failed to train agent: ${error.message}`);
    },
  });

  const handleTrainAgent = () => {
    toast.promise(trainAgentMutation.mutateAsync(), {
      loading: "Agent training started...",
      success: () => {
        const now = new Date();
        setLastTrainedAt(now);
        localStorage.setItem("lastTrainedAt", now.toISOString());
        queryClient.invalidateQueries();
        return "Agent training completed successfully!";
      },
      error: (error) => `Failed to train agent: ${error.message}`,
    });
  };

  const totalDocumentSize = useMemo(() => {
    if (!documentSources) return 0;
    return documentSources.reduce(
      (acc: any, source: any) => acc + source.size,
      0,
    );
  }, [documentSources]);

  const totalWebsiteSize = useMemo(() => {
    if (!websiteSources) return 0;
    return websiteSources.reduce(
      (acc: any, source: any) =>
        acc + (source.markdown ? source.markdown.length : 0),
      0,
    );
  }, [websiteSources]);

  const totalQuestionSize = useMemo(() => {
    if (!questionSources) return 0;
    return questionSources.reduce((acc: any, source: any) => {
      const questionLength = source.question ? source.question.length : 0;
      const answerLength = source.answer ? source.answer.length : 0;
      return acc + questionLength + answerLength;
    }, 0);
  }, [questionSources]);

  const totalTextSize = useMemo(() => {
    if (!textSources) return 0;
    return textSources.reduce(
      (acc: any, source: any) => acc + source.content.length,
      0,
    );
  }, [textSources]);

  return (
    <div className="w-full space-y-3">
      {isStale && (
        <Alert variant="warning">
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>Retraining required</AlertDescription>
        </Alert>
      )}
      <h1 className="text-lg font-semibold ">Sources</h1>
      <FileStatCard
        icon={<Paperclip className="w-5 h-5 text-primary/70" />}
        label="Files"
        size={formatBytes(totalDocumentSize)}
      />
      <FileStatCard
        icon={<Globe className="w-5 h-5 text-primary/70" />}
        label="Website"
        size={formatBytes(totalWebsiteSize)}
      />
      <FileStatCard
        icon={<RiQuestionFill className="w-5 h-5 text-primary/70" />}
        label="Q&A"
        size={formatBytes(totalQuestionSize)}
      />
      <FileStatCard
        icon={<FileText className="w-5 h-5 text-primary/70" />}
        label="Text"
        size={formatBytes(totalTextSize)}
      />
      <Button
        className="w-full font-semibold"
        onClick={handleTrainAgent}
        disabled={trainAgentMutation.isPending}
      >
        {trainAgentMutation.isPending ? (
          "Training..."
        ) : (
          <>
            <Hammer className="w-4 h-4 " />
            Train agent
          </>
        )}
      </Button>
    </div>
  );
};

function FileStatCard({
  icon,
  label,
  size,
}: {
  icon: React.ReactNode;
  label: string;
  size: string;
}) {
  const formattedSize =
    typeof size === "string" ? size.replace(/(\d)([A-Za-z])/, "$1 $2") : size;

  return (
    <div className="w-full border bg-white rounded-lg ">
      <div className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-sm font-normal">{label}</h2>
        </div>
        <h2 className="text-sm font-semibold">{formattedSize}</h2>
      </div>
    </div>
  );
}
