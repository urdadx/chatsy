import { useChatHistory } from "@/hooks/use-chat-history";
import { useUsage } from "@/hooks/use-usage-meters";
import { getVisitorAnalytics } from "@/hooks/use-visitor-analytics";
import { api } from "@/lib/api";
import NumberFlow from "@number-flow/react";
import { useQuery } from "@tanstack/react-query";
import {
  BrainCog,
  Globe,
  MessageCircle,
  Star,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

export function DashboardMetrics() {
  const { data: sourcesCount } = useQuery({
    queryKey: ["sources-count"],
    queryFn: async () => {
      const response = await api.get("/sources/count");
      return response.data.count;
    },
  });

  const { data: chatHistoryData } = useChatHistory("90d");
  const conversationsCount = chatHistoryData?.pages.reduce(
    (acc, page) => acc + page.chats.length,
    0,
  );

  const { data: voteCounts } = useQuery({
    queryKey: ["vote-counts"],
    queryFn: async () => {
      const response = await api.get("/vote-count");
      return response.data;
    },
  });

  const { data } = useUsage();

  const balance = data?.balance ?? 0;

  const { data: visitorData } = getVisitorAnalytics("90d");
  const totalVisits = Array.isArray(visitorData) ? visitorData.length : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Links Card */}
      <div className="bg-white rounded-lg p-4 border">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <BrainCog className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-sm font-medium text-gray-600">
              Connected sources
            </h3>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-3xl font-bold text-gray-700 px-10">
            {sourcesCount ?? 0}
          </div>
        </div>
      </div>
      {/* Total conversations */}

      <div className="bg-white rounded-lg p-4 border">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-slate-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-600">
              Total conversations
            </h3>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <NumberFlow
            className="text-3xl font-bold text-gray-700 px-10 pt-0"
            value={conversationsCount ?? 0}
          />
        </div>
      </div>
      <div className="bg-white rounded-lg p-4 border">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <Star className="w-4 h-4 text-orange-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-600">
              Credits remaining
            </h3>
          </div>
        </div>
        <NumberFlow
          className="text-3xl font-bold text-gray-700 px-10 pt-0"
          value={balance}
        />
      </div>
      {/* Leads generated */}
      <div className="bg-white rounded-lg p-4 border">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Globe className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-600">Total visits</h3>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <NumberFlow
            className="text-3xl font-bold text-gray-700 px-10 pt-0"
            value={totalVisits}
          />{" "}
        </div>
      </div>

      {/* Positive sentiments */}
      <div className="bg-white rounded-lg p-4 border">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <ThumbsUp className="w-4 h-4 text-green-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-600">
              Positive sentiments
            </h3>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <NumberFlow
            className="text-3xl font-bold text-gray-700 px-10 pt-0"
            value={voteCounts?.upvotes ?? 0}
          />
        </div>
      </div>
      {/* Negative sentiments */}
      <div className="bg-white rounded-lg p-4 border">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <ThumbsDown className="w-4 h-4 text-red-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-600">
              Negative sentiments
            </h3>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <NumberFlow
            className="text-3xl font-bold text-gray-700 px-10 pt-0"
            value={voteCounts?.downvotes ?? 0}
          />
        </div>
      </div>
    </div>
  );
}
